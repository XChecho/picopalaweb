import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  backendFetch,
  clearAuthCookies,
  getBackendContext,
  refreshTokens,
} from "@/lib/server/bff";

/** Best effort: revokes the token family in the backend, then always clears the cookies. */
export async function POST(request: NextRequest) {
  const context = getBackendContext(request.headers);
  const jar = await cookies();
  let accessToken = jar.get(ACCESS_COOKIE)?.value;
  let refreshToken = jar.get(REFRESH_COOKIE)?.value;

  const revoke = (access: string, refresh: string) =>
    backendFetch(
      {
        path: "/web/auth/logout",
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
        body: JSON.stringify({ refreshToken: refresh }),
      },
      context,
    );

  if (refreshToken) {
    // The logout endpoint needs a valid access token; get one if the cookie expired.
    if (!accessToken) {
      const outcome = await refreshTokens(refreshToken, context);
      if (outcome.kind === "ok") {
        accessToken = outcome.tokens.accessToken;
        refreshToken = outcome.tokens.refreshToken;
      }
    }
    if (accessToken) {
      const first = await revoke(accessToken, refreshToken);
      if (first.status === 401) {
        const outcome = await refreshTokens(refreshToken, context);
        if (outcome.kind === "ok") {
          await revoke(outcome.tokens.accessToken, outcome.tokens.refreshToken);
        }
      }
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
