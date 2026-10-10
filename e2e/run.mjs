// Runs every e2e suite: starts the mock backend and a production `next start` pointed at it, then
// executes the suites in order. Needs `pnpm build` (without NEXT_PUBLIC_TURNSTILE_SITE_KEY) and Google Chrome.
import { spawn } from "node:child_process";
import { startMockBackend, MOCK_PORT } from "./mock-backend.mjs";

const PORT = 3111;
const ALL = ["vs-ai-flow", "vs-ai-edge", "mobile-i18n", "auth-bff"];
const SUITES = process.env.E2E_ONLY ? process.env.E2E_ONLY.split(",") : ALL;

const mock = await startMockBackend();
const web = spawn("pnpm", ["exec", "next", "start", "-p", String(PORT)], {
  env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${MOCK_PORT}/api/v1`, BFF_SHARED_SECRET: "e2e-bff-secret" },
  stdio: process.env.E2E_DEBUG ? "inherit" : "ignore",
  detached: true, // own process group so the whole `pnpm → next` tree can be stopped
});

async function waitFor(url, timeout = 60000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server did not start: ${url}`);
}

let failed = false;
try {
  await waitFor(`http://localhost:${PORT}/api/auth/session`);
  for (const suite of SUITES) {
    console.log(`\n=== ${suite} ===`);
    // Async on purpose: a blocking spawn would freeze the in-process mock backend.
    const status = await new Promise((resolve) => {
      spawn("node", [`e2e/${suite}.mjs`], {
        stdio: "inherit",
        env: { ...process.env, E2E_BASE_URL: `http://localhost:${PORT}` },
      }).on("close", resolve);
    });
    if (status !== 0) { failed = true; console.error(`${suite} FAILED`); }
  }
} finally {
  try { process.kill(-web.pid); } catch { /* already gone */ }
  mock.close();
}
process.exit(failed ? 1 : 0);
