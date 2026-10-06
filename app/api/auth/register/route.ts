import type { NextRequest } from "next/server";
import { backendFetch, errorResponse, getBackendContext } from "@/lib/server/bff";
import { completeAuth } from "@/lib/server/authRoute";
import { readBody, validateRegister } from "@/lib/server/validation";

export async function POST(request: NextRequest) {
  const parsed = validateRegister(await readBody(request));
  if (!parsed.ok) return errorResponse(400, parsed.message);

  // Development without a Turnstile site key has no widget. The backend only accepts that
  // placeholder when it also has no secret and is not in production, so it can never bypass prod.
  const captchaToken =
    parsed.value.captchaToken ??
    (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? "dev-no-captcha"
      : undefined);

  const response = await backendFetch(
    {
      path: "/web/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.value, captchaToken }),
    },
    getBackendContext(request.headers),
  );
  return completeAuth(response);
}
