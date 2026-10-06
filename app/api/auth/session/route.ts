import { NextResponse, type NextRequest } from "next/server";
import {
  authedBackendFetch,
  errorResponse,
  extractMessage,
  getBackendContext,
  readJson,
  unwrapEnvelope,
} from "@/lib/server/bff";

export async function GET(request: NextRequest) {
  const response = await authedBackendFetch({ path: "/player/me" }, getBackendContext(request.headers));
  const body = await readJson(response);

  // No (valid) session is a normal state for visitors, not an error worth a 401 in the console.
  if (response.status === 401) {
    return NextResponse.json({ player: null }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!response.ok) {
    return errorResponse(response.status, extractMessage(body, "Session unavailable"));
  }

  const player = unwrapEnvelope(body);
  if (typeof player !== "object" || player === null) {
    return errorResponse(502, "Unexpected backend response");
  }
  return NextResponse.json({ player }, { headers: { "Cache-Control": "no-store" } });
}
