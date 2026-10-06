import { NextResponse } from "next/server";
import {
  errorResponse,
  extractMessage,
  isTokenPair,
  readJson,
  setAuthCookies,
  unwrapEnvelope,
} from "@/lib/server/bff";

/**
 * Turns a backend login/register response into a browser response: tokens go into
 * HttpOnly cookies and only `{ player }` is returned.
 */
export async function completeAuth(response: Response): Promise<NextResponse> {
  const body = await readJson(response);

  if (!response.ok) {
    return errorResponse(response.status, extractMessage(body, "Authentication failed"));
  }

  const data = unwrapEnvelope(body);
  if (
    !isTokenPair(data) ||
    typeof data !== "object" ||
    !("player" in data) ||
    typeof data.player !== "object" ||
    data.player === null
  ) {
    return errorResponse(502, "Unexpected backend response");
  }

  await setAuthCookies({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return NextResponse.json(
    { player: data.player },
    { status: response.status, headers: { "Cache-Control": "no-store" } },
  );
}
