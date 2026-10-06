import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/server/clientIp";

export const ACCESS_COOKIE = "pp_at";
export const REFRESH_COOKIE = "pp_rt";

const ACCESS_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const BACKEND_TIMEOUT_MS = 15_000;
// A rotated refresh token is remembered briefly so late requests that still carry the
// old cookie reuse the new pair instead of tripping the backend's reuse detection.
const REFRESH_GRACE_MS = 10_000;

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

type TRefreshOutcome =
  | { kind: "ok"; tokens: ITokenPair }
  | { kind: "invalid" }
  | { kind: "error"; status: number; message: string | string[] };

interface IBackendRequest {
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string | ArrayBuffer | null;
}

/** Per-request data the BFF forwards to the backend. */
export interface IBackendContext {
  userAgent: string | null;
  clientIp: string | null;
}

/** Builds the backend context (User-Agent + real client IP) from the incoming request headers. */
export function getBackendContext(headers: Headers): IBackendContext {
  return { userAgent: headers.get("user-agent"), clientIp: getClientIp(headers) };
}

/**
 * Shared secret that authenticates the BFF to the backend (`X-BFF-Key`). Server-only.
 * Required in production; optional in development.
 */
function getBffSecret(): string | null {
  const secret = process.env.BFF_SHARED_SECRET;
  if (secret && secret.length > 0) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "BFF_SHARED_SECRET is not set. It is required in production so the backend trusts X-Client-IP; set it to the same value as the backend.",
    );
  }
  return null;
}

export function getBackendUrl(): string {
  const raw = process.env.BACKEND_URL ?? "http://localhost:4001/api/v1";
  return raw.replace(/\/+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTokenPair(value: unknown): value is ITokenPair {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    value.accessToken.length > 0 &&
    typeof value.refreshToken === "string" &&
    value.refreshToken.length > 0
  );
}

export function errorResponse(status: number, message: string | string[]): NextResponse {
  return NextResponse.json(
    { statusCode: status, message, timestamp: new Date().toISOString() },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Unwraps the backend `{ data, statusCode, timestamp }` envelope. */
export function unwrapEnvelope(body: unknown): unknown {
  return isRecord(body) && "data" in body ? body.data : body;
}

export function extractMessage(body: unknown, fallback: string): string | string[] {
  if (isRecord(body)) {
    const { message } = body;
    if (typeof message === "string" && message.length > 0) return message;
    if (Array.isArray(message) && message.every((m) => typeof m === "string") && message.length > 0) {
      return message as string[];
    }
  }
  return fallback;
}

export async function backendFetch(
  request: IBackendRequest,
  context: IBackendContext,
): Promise<Response> {
  const secret = getBffSecret();
  const headers: Record<string, string> = { Accept: "application/json", ...request.headers };
  if (context.userAgent) headers["User-Agent"] = context.userAgent;
  // Set after the caller's headers so they can never be overridden. Without the key the backend
  // ignores X-Client-IP and rate-limits every user under the Next server's IP.
  if (secret) {
    headers["X-BFF-Key"] = secret;
    if (context.clientIp) headers["X-Client-IP"] = context.clientIp;
  }
  try {
    return await fetch(`${getBackendUrl()}${request.path}`, {
      method: request.method ?? "GET",
      headers,
      body: request.body ?? undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch {
    return errorResponse(502, "Backend unavailable");
  }
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function setAuthCookies(tokens: ITokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    path: "/api",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", { ...baseCookieOptions(), path: "/", maxAge: 0 });
  jar.set(REFRESH_COOKIE, "", { ...baseCookieOptions(), path: "/api", maxAge: 0 });
}

// ---------------------------------------------------------------------------
// Refresh (serialized per refresh-token value, in-process)
// ---------------------------------------------------------------------------

const inflightRefreshes = new Map<string, Promise<TRefreshOutcome>>();

async function requestRefresh(refreshToken: string, context: IBackendContext): Promise<TRefreshOutcome> {
  const response = await backendFetch(
    {
      path: "/web/auth/refresh",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${refreshToken}` },
      body: JSON.stringify({ refreshToken }),
    },
    context,
  );
  const body = await readJson(response);

  if (response.status === 401 || response.status === 403) return { kind: "invalid" };
  if (!response.ok) {
    return { kind: "error", status: response.status, message: extractMessage(body, "Refresh failed") };
  }
  const data = unwrapEnvelope(body);
  if (!isTokenPair(data)) {
    return { kind: "error", status: 502, message: "Unexpected backend response" };
  }
  return { kind: "ok", tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } };
}

export function refreshTokens(refreshToken: string, context: IBackendContext): Promise<TRefreshOutcome> {
  const existing = inflightRefreshes.get(refreshToken);
  if (existing) return existing;

  const promise = requestRefresh(refreshToken, context);
  inflightRefreshes.set(refreshToken, promise);
  void promise.then((outcome) => {
    if (outcome.kind === "error") {
      inflightRefreshes.delete(refreshToken);
      return;
    }
    const timer = setTimeout(() => inflightRefreshes.delete(refreshToken), REFRESH_GRACE_MS);
    timer.unref?.();
  });
  return promise;
}

// ---------------------------------------------------------------------------
// Authenticated backend call with a single refresh + retry
// ---------------------------------------------------------------------------

/**
 * Calls the backend with the access token from the `pp_at` cookie. When it is missing or
 * rejected (401) and a refresh cookie exists, refreshes once, rewrites both cookies and
 * retries once. If the refresh is rejected, cookies are cleared and a 401 is returned.
 * Returns the backend response untouched (or a synthetic error response).
 */
export async function authedBackendFetch(
  request: IBackendRequest,
  context: IBackendContext,
): Promise<Response> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  /** Refreshes once; resolves to the new access token or a failure response. */
  const refresh = async (): Promise<string | Response> => {
    if (!refreshToken) return errorResponse(401, "Unauthorized");
    const outcome = await refreshTokens(refreshToken, context);
    if (outcome.kind === "invalid") {
      await clearAuthCookies();
      return errorResponse(401, "Unauthorized");
    }
    if (outcome.kind === "error") return errorResponse(outcome.status, outcome.message);
    await setAuthCookies(outcome.tokens);
    return outcome.tokens.accessToken;
  };

  const send = (token: string) =>
    backendFetch(
      { ...request, headers: { ...request.headers, Authorization: `Bearer ${token}` } },
      context,
    );

  if (!accessToken) {
    const refreshedAccess = await refresh();
    if (typeof refreshedAccess !== "string") return refreshedAccess;
    // The access cookie just got rewritten, so the request below cannot need a second refresh.
    return send(refreshedAccess);
  }

  const first = await send(accessToken);
  if (first.status !== 401 || !refreshToken) return first;

  const refreshedAccess = await refresh();
  if (typeof refreshedAccess !== "string") return refreshedAccess;

  const retry = await send(refreshedAccess);
  if (retry.status === 401) await clearAuthCookies();
  return retry;
}

/** Builds a browser-facing response from a backend one, forwarding only status and content type. */
export async function passthrough(response: Response): Promise<Response> {
  const headers = new Headers({ "Cache-Control": "no-store" });
  const contentType = response.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const hasBody = response.status !== 204 && response.status !== 205 && response.status !== 304;
  return new Response(hasBody ? await response.arrayBuffer() : null, {
    status: response.status,
    headers,
  });
}
