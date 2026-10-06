import type { NextRequest } from "next/server";
import { authedBackendFetch, backendFetch, errorResponse, passthrough } from "@/lib/server/bff";

// Only these backend areas are reachable from the browser. `auth/*` is deliberately absent:
// token handling lives in /api/auth/*.
const ALLOWED_ROOTS = new Set(["player", "match", "stats", "public"]);
const SEGMENT_PATTERN = /^[A-Za-z0-9_\-:.]+$/;

interface IRouteContext {
  params: Promise<{ path: string[] }>;
}

async function handle(request: NextRequest, context: IRouteContext): Promise<Response> {
  const { path } = await context.params;

  const valid =
    path.length > 0 &&
    ALLOWED_ROOTS.has(path[0]) &&
    path.every((segment) => SEGMENT_PATTERN.test(segment) && segment !== "." && segment !== "..");
  if (!valid) return errorResponse(404, "Not found");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const contentType = request.headers.get("content-type");
  const body = hasBody ? await request.arrayBuffer() : null;

  const backendRequest = {
    path: `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
    method: request.method,
    headers: contentType ? { "Content-Type": contentType } : undefined,
    body: body && body.byteLength > 0 ? body : null,
  };
  const userAgent = request.headers.get("user-agent");

  // `public/*` is anonymous by design: it must work without a session and never trigger a refresh.
  const response =
    path[0] === "public"
      ? await backendFetch(backendRequest, userAgent)
      : await authedBackendFetch(backendRequest, userAgent);
  return passthrough(response);
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
