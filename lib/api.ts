// The browser only talks to same-origin Next route handlers (`/api/auth/*` and
// `/api/proxy/*`). Tokens live in HttpOnly cookies managed by the BFF and are never exposed here.

export const apiPaths = {
  auth: (path: string) => `/api/auth${path}`,
  proxy: (path: string) => `/api/proxy${path}`,
} as const;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractErrorMessage(body: unknown, status: number): string {
  if (isRecord(body)) {
    const { message } = body;
    if (typeof message === "string" && message.length > 0) return message;
    if (Array.isArray(message)) {
      const parts = message.filter((m): m is string => typeof m === "string");
      if (parts.length > 0) return parts.join(", ");
    }
  }
  return `Request failed: ${status}`;
}

/** Backend responses arrive as `{ data, statusCode, timestamp }`; BFF auth routes return plain JSON. */
function unwrap<T>(body: unknown): T {
  if (isRecord(body) && "data" in body && "statusCode" in body) {
    return body.data as T;
  }
  return body as T;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers, credentials: "same-origin" });
  } catch {
    throw new ApiError("Network error", 0);
  }

  const text = await response.text();
  let body: unknown = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(body, response.status), response.status);
  }
  return unwrap<T>(body);
}
