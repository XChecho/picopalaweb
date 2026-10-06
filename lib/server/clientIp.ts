import { isIP } from "node:net";

function validIp(value: string | null | undefined): string | null {
  const candidate = value?.trim();
  return candidate && isIP(candidate) !== 0 ? candidate : null;
}

/**
 * Real client IP for the backend's per-IP rate limiting. Priority: `cf-connecting-ip`, the first
 * valid entry of `x-forwarded-for`, then `x-real-ip`. Returns null when none is a valid IP, in
 * which case no `X-Client-IP` header should be sent.
 *
 * These headers are only trustworthy behind a proxy that overwrites them (Cloudflare / the host).
 */
export function getClientIp(headers: Headers): string | null {
  const cf = validIp(headers.get("cf-connecting-ip"));
  if (cf) return cf;

  for (const part of (headers.get("x-forwarded-for") ?? "").split(",")) {
    const ip = validIp(part);
    if (ip) return ip;
  }

  return validIp(headers.get("x-real-ip"));
}
