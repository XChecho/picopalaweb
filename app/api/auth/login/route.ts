import type { NextRequest } from "next/server";
import { backendFetch, errorResponse, getBackendContext } from "@/lib/server/bff";
import { completeAuth } from "@/lib/server/authRoute";
import { readBody, validateLogin } from "@/lib/server/validation";

export async function POST(request: NextRequest) {
  const parsed = validateLogin(await readBody(request));
  if (!parsed.ok) return errorResponse(400, parsed.message);

  const response = await backendFetch(
    {
      path: "/web/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.value),
    },
    getBackendContext(request.headers),
  );
  return completeAuth(response);
}
