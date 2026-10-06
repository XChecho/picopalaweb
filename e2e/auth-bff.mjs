// BFF auth against a local MOCK backend (no real backend needed).
// Verifies: /web/auth/* routes, X-BFF-Key + X-Client-IP forwarding, captchaToken pass-through,
// tokens never reaching the browser, and the register form with and without a Turnstile site key.
//
// Needs `pnpm build` done WITHOUT NEXT_PUBLIC_TURNSTILE_SITE_KEY (scenario A). Scenario B builds
// its own copy with a site key into .next-e2e-captcha (set E2E_SKIP_CAPTCHA_BUILD=1 to skip it).
// This script starts its own `next start` instances and the mock; it ignores E2E_BASE_URL.
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import { launch, createReport, newPage } from "./lib.mjs";

const MOCK_PORT = 4101;
const SECRET = "e2e-bff-secret";
const ACCESS = "mock-access-token-AAA";
const REFRESH = "mock-refresh-token-RRR";
const PLAYER = {
  id: "p1", username: "duelist1", email: "d@example.com", language: "EN",
  avatarUrl: null, elo: 1000, rank: "BRONCE", createdAt: "2026-01-01T00:00:00.000Z",
};

const r = createReport();
const calls = [];
let rejectCaptchaOnce = false;

const mock = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = null;
    try { body = raw ? JSON.parse(raw) : null; } catch { body = null; }
    calls.push({ method: req.method, url: req.url, headers: req.headers, body });
    const send = (status, data) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify({ data, statusCode: status, timestamp: new Date().toISOString() }));
    };
    const url = req.url ?? "";
    if (url.endsWith("/web/auth/register") && rejectCaptchaOnce && body?.captchaToken === "stub-token-1") {
      return send(403, null);
    }
    if (url.endsWith("/web/auth/register") || url.endsWith("/web/auth/login")) {
      return send(201, { accessToken: ACCESS, refreshToken: REFRESH, player: PLAYER });
    }
    if (url.endsWith("/web/auth/refresh")) return send(200, { accessToken: ACCESS, refreshToken: REFRESH + "2" });
    if (url.endsWith("/web/auth/logout")) return send(200, { ok: true });
    if (url.includes("/player/me")) return send(200, PLAYER);
    if (url.includes("/public/waitlist")) return send(201, { subscribed: true });
    return send(404, null);
  });
});
await new Promise((resolve) => mock.listen(MOCK_PORT, "127.0.0.1", resolve));

function startNext(port, distDir, extraEnv = {}) {
  const child = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
      BACKEND_URL: `http://127.0.0.1:${MOCK_PORT}/api/v1`,
      BFF_SHARED_SECRET: SECRET,
      ...extraEnv,
    },
    stdio: "ignore",
  });
  return child;
}

async function waitFor(url, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server did not start: ${url}`);
}

const last = (suffix) => calls.filter((c) => c.url?.endsWith(suffix)).at(-1);
const json = (headers, body) => ({ method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const REGISTER = { username: "duelist1", email: "d@example.com", password: "supersecret1", language: "en" };

const servers = [];
let browser;
try {
  // ------------------------------------------------------------------ Scenario A: no site key
  const A = "http://localhost:3112";
  servers.push(startNext(3112, ".next"));
  await waitFor(A + "/api/auth/session");
  calls.length = 0;

  // API level: headers, routes, bodies
  let res = await fetch(A + "/api/auth/register", json({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }, { ...REGISTER, captchaToken: "tok-abc" }));
  let text = await res.text();
  let c = last("/web/auth/register");
  r.check("register -> /api/v1/web/auth/register", res.status === 201 && c?.url === "/api/v1/web/auth/register", c?.url);
  r.check("X-BFF-Key reaches backend", c?.headers["x-bff-key"] === SECRET);
  r.check("cf-connecting-ip has priority for X-Client-IP", c?.headers["x-client-ip"] === "203.0.113.7", c?.headers["x-client-ip"]);
  r.check("register forwards captchaToken", c?.body?.captchaToken === "tok-abc");
  r.check("register no longer sends platform", c && !("platform" in c.body));
  r.check("response has no tokens", !text.includes(ACCESS) && !text.includes(REFRESH));
  const setCookie = res.headers.getSetCookie().join("\n");
  r.check("tokens only in HttpOnly cookies", /pp_at=[^;]+;.*HttpOnly/i.test(setCookie) && /pp_rt=[^;]+;.*HttpOnly/i.test(setCookie));

  await fetch(A + "/api/auth/register", json({ "x-forwarded-for": "not-an-ip, 198.51.100.4, 10.0.0.1" }, REGISTER));
  r.check("x-forwarded-for: first valid IP", last("/web/auth/register")?.headers["x-client-ip"] === "198.51.100.4", last("/web/auth/register")?.headers["x-client-ip"]);
  await fetch(A + "/api/auth/register", json({ "x-real-ip": "192.0.2.9" }, REGISTER));
  const viaRealIp = last("/web/auth/register")?.headers["x-client-ip"];
  // `next start` may add its own x-forwarded-for from the socket, which wins over x-real-ip.
  r.check("x-real-ip / socket fallback yields a valid IP", Boolean(viaRealIp), viaRealIp);
  await fetch(A + "/api/auth/register", json({ "cf-connecting-ip": "bogus" }, REGISTER));
  r.check("invalid cf-connecting-ip is not forwarded verbatim", last("/web/auth/register")?.headers["x-client-ip"] !== "bogus");

  res = await fetch(A + "/api/auth/login", json({ "cf-connecting-ip": "203.0.113.8" }, { username: "duelist1", password: "supersecret1" }));
  text = await res.text();
  c = last("/web/auth/login");
  r.check("login -> /web/auth/login with BFF key + IP", res.status === 201 && c?.headers["x-bff-key"] === SECRET && c?.headers["x-client-ip"] === "203.0.113.8");
  r.check("login response has no tokens", !text.includes(ACCESS) && !text.includes(REFRESH));

  // refresh path: only pp_rt cookie -> session triggers /web/auth/refresh
  res = await fetch(A + "/api/auth/session", { headers: { cookie: "pp_rt=old-refresh", "cf-connecting-ip": "203.0.113.9" } });
  c = last("/web/auth/refresh");
  r.check("refresh -> /web/auth/refresh with bearer, BFF key, IP",
    c?.headers.authorization === "Bearer old-refresh" && c?.headers["x-bff-key"] === SECRET && c?.headers["x-client-ip"] === "203.0.113.9");
  r.check("session response has no tokens", !(await res.text()).includes(ACCESS));

  res = await fetch(A + "/api/proxy/public/waitlist", json({ "cf-connecting-ip": "203.0.113.10" }, { email: "a@b.co", captchaToken: "w-tok" }));
  c = last("/public/waitlist");
  r.check("public/* proxy: BFF key + IP, no user credentials, captchaToken kept",
    res.status === 201 && c?.headers["x-bff-key"] === SECRET && c?.headers["x-client-ip"] === "203.0.113.10" && !c?.headers.authorization && c?.body?.captchaToken === "w-tok");

  await fetch(A + "/api/auth/logout", { method: "POST", headers: { cookie: `pp_at=${ACCESS}; pp_rt=${REFRESH}` } });
  r.check("logout -> /web/auth/logout", last("/web/auth/logout")?.headers["x-bff-key"] === SECRET);
  r.check("no call used legacy /auth/* paths", calls.every((x) => !/\/api\/v1\/auth\//.test(x.url ?? "")));

  // Browser: no site key, form works without captcha
  browser = await launch();
  let page = await newPage(browser);
  await page.goto(A + "/auth", { waitUntil: "networkidle" });
  r.check("no site key: no Turnstile widget", (await page.locator('[data-testid="turnstile-widget"]').count()) === 0);
  await page.fill("#register-handle", "duelist1");
  await page.fill("#register-email", "d@example.com");
  await page.fill("#register-password", "supersecret1");
  await page.fill("#register-confirm", "supersecret1");
  await page.check("#tos-check");
  r.check("no site key: submit enabled", await page.locator('form button[type="submit"]').first().isEnabled());
  calls.length = 0;
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL("**/play");
  c = last("/web/auth/register");
  r.check("no site key: register sent without captchaToken", Boolean(c) && c.body.captchaToken === undefined);
  const leaked = await page.evaluate((t) => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + document.cookie + document.documentElement.outerHTML.includes(t), ACCESS);
  r.check("tokens not visible to the browser JS", !leaked.includes(ACCESS) && !leaked.includes(REFRESH) && !/pp_at|pp_rt/.test(leaked));
  r.check("no page errors (A)", page.errors.length === 0, page.errors.join(" | "));
  await page.context().close();
  servers.pop().kill();

  // ------------------------------------------------------------------ Scenario B: with site key
  if (process.env.E2E_SKIP_CAPTCHA_BUILD === "1") {
    r.note("SKIP  scenario B (E2E_SKIP_CAPTCHA_BUILD=1)");
  } else {
    const build = spawnSync("pnpm", ["exec", "next", "build"], {
      env: { ...process.env, NEXT_DIST_DIR: ".next-e2e-captcha", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA" },
      stdio: "ignore",
    });
    r.check("build with site key", build.status === 0);
    const B = "http://localhost:3113";
    servers.push(startNext(3113, ".next-e2e-captcha", { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA" }));
    await waitFor(B + "/api/auth/session");

    r.check("server rejects register without captchaToken when site key is set",
      (await fetch(B + "/api/auth/register", json({}, REGISTER))).status === 400);

    page = await newPage(browser);
    // Stub the Cloudflare script: deterministic and offline. Tokens are single use (stub-token-N).
    await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `(() => { let n = 0; const cbs = {};
          window.turnstile = {
            render(el, o) { const id = "w" + (++n); cbs[id] = o; el.setAttribute("data-theme", o.theme); setTimeout(() => o.callback("stub-token-" + n), 50); return id; },
            reset(id) { n += 1; const o = cbs[id]; setTimeout(() => o.callback("stub-token-" + n), 50); },
            remove() {},
          }; })();`,
      }),
    );
    rejectCaptchaOnce = true;
    await page.goto(B + "/auth", { waitUntil: "networkidle" });
    const submit = page.locator('form button[type="submit"]').first();
    r.check("site key: widget rendered with dark theme", (await page.locator('[data-testid="turnstile-widget"]').getAttribute("data-theme")) === "dark");
    await page.fill("#register-handle", "duelist1");
    await page.fill("#register-email", "d@example.com");
    await page.fill("#register-password", "supersecret1");
    await page.fill("#register-confirm", "supersecret1");
    await page.check("#tos-check");
    await page.waitForFunction(() => !document.querySelector('form button[type="submit"]').disabled);
    calls.length = 0;
    await submit.click();
    await page.getByRole("alert").filter({ hasText: /verification was not accepted/i }).waitFor();
    r.check("403 shows captcha i18n message", true);
    c = last("/web/auth/register");
    r.check("register sent captchaToken from widget", c?.body?.captchaToken === "stub-token-1");
    await page.waitForFunction(() => !document.querySelector('form button[type="submit"]').disabled);
    await submit.click();
    await page.waitForURL("**/play");
    r.check("retry uses a fresh token (single use)", last("/web/auth/register")?.body?.captchaToken === "stub-token-2", String(last("/web/auth/register")?.body?.captchaToken));
    // The deliberate 403 shows up as a browser console error; anything else is a real problem.
    const unexpected = page.errors.filter((e) => !/status of 403/.test(e));
    r.check("no page errors (B)", unexpected.length === 0, unexpected.join(" | "));
  }
} catch (error) {
  r.check("e2e crashed", false, error instanceof Error ? error.message : String(error));
} finally {
  await browser?.close();
  for (const s of servers) s.kill();
  mock.close();
  r.print();
  process.exit(process.exitCode ?? 0);
}
