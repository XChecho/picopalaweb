// Shared helpers for the e2e suites. Needs a running server and Google Chrome (see README).
import { chromium } from "playwright-core";

export const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3111";

export async function launch() {
  return chromium.launch({ channel: "chrome", headless: true });
}

export function createReport() {
  const lines = [];
  return {
    check(name, ok, extra = "") {
      lines.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
    },
    note(text) { lines.push(text); },
    print() {
      console.log(lines.join("\n"));
      if (lines.some((l) => l.startsWith("FAIL"))) process.exitCode = 1;
    },
  };
}

export const perms = [];
for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) for (let d = 1; d <= 9; d++)
  if (new Set([a, b, c, d]).size === 4) perms.push(`${a}${b}${c}${d}`);

export const fb = (guess, secret) => {
  let p = 0, l = 0;
  for (let i = 0; i < 4; i++) { if (guess[i] === secret[i]) p++; else if (secret.includes(guess[i])) l++; }
  return [p, l];
};

export async function newPage(browser, viewport = { width: 1280, height: 900 }, lang = "en", { anonymous = false } = {}) {
  const context = await browser.newContext({ viewport, locale: lang });
  // Play is gated behind login: any access token is accepted by the mock backend (see mock-backend.mjs).
  if (!anonymous) await context.addCookies([{ name: "pp_at", value: "e2e-access", url: BASE }]);
  const page = await context.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return page;
}

// Every move on the board, read from data attributes: { who: 'YOU'|'BOT', guess, fb: [picos, palas] }.
export async function moves(page) {
  return page.$$eval('[data-testid="move"]', (els) =>
    els.map((el) => ({
      who: el.dataset.actor,
      guess: el.dataset.guess,
      fb: [Number(el.dataset.picos), Number(el.dataset.palas)],
    })),
  );
}

export const status = (page) => page.getAttribute('[data-testid="turn-status"]', "data-state").catch(() => null);
export const result = (page) => page.getAttribute('[data-testid="result-title"]', "data-result", { timeout: 300 }).catch(() => null);

// /arena only opens through the play hub (a bare visit redirects back), so enter like a player would.
// Language-agnostic: the hub's single Play button, then the first (easiest) level in the dialog.
export async function enterArena(page, levelIndex = 0) {
  await page.goto(BASE + "/play", { waitUntil: "networkidle" });
  await page.locator("main").getByRole("button", { name: /^(Play|Jugar|Jogar)$/i }).click();
  await page.getByRole("dialog").getByRole("button").nth(levelIndex).click();
  await page.waitForURL("**/arena");
  await page.waitForLoadState("networkidle"); // the arena is a client-only dynamic chunk
}

export async function openArena(page, level, secret) {
  await page.goto(BASE + "/play", { waitUntil: "networkidle" });
  await page.locator("main").getByRole("button", { name: /^Play$/i }).click();
  await page.getByRole("dialog").getByRole("button", { name: new RegExp(level, "i") }).click();
  await page.waitForURL("**/arena");
  await page.getByText("Choose your secret cipher").waitFor();
  for (const c of secret) await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await page.getByText("Deciding initiative").waitFor();
  return page.getByText(/won the toss/).innerText();
}

export const enterGrid = (page) => page.getByRole("button", { name: /Enter duel grid/i }).click();

export async function waitMyTurnOrEnd(page, timeout = 15000) {
  await page.waitForFunction(
    () => document.querySelector('[data-testid="turn-status"]')?.dataset.state === "your-turn" || !!document.querySelector('[data-testid="result-title"]'),
    null,
    { timeout },
  );
}

// Digits open the number-pad modal on their own; Enter then submits.
export async function typeGuess(page, guess) {
  for (const c of guess) await page.keyboard.press(c);
  await page.keyboard.press("Enter");
}
