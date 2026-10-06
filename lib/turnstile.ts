/** Cloudflare Turnstile site key (public). Empty in development means: no widget, no captcha. */
export const TURNSTILE_SITE_KEY: string = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
