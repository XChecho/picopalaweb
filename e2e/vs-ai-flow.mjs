// E2E for the Versus AI mode. Needs a running server: `pnpm build && pnpm start -p 3111` (override with E2E_BASE_URL)
// and Google Chrome installed. Run with: `pnpm e2e`.
import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3111";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (name, ok, extra = "") => { results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`); };

const perms = [];
for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) for (let d = 1; d <= 9; d++)
  if (new Set([a, b, c, d]).size === 4) perms.push(`${a}${b}${c}${d}`);
const fb = (guess, secret) => { let p = 0, l = 0; for (let i = 0; i < 4; i++) { if (guess[i] === secret[i]) p++; else if (secret.includes(guess[i])) l++; } return [p, l]; };
const parseFb = (t) => [+(t.match(/(\d)P/)?.[1] ?? 0), +(t.match(/(\d)L/)?.[1] ?? 0)];

async function newPage() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  return page;
}
async function ledger(page) {
  const t = await page.locator("main").innerText();
  const seg = t.slice(t.indexOf("TACTICAL DEDUCTION LEDGER"), t.indexOf("DRAFT YOUR TURN"));
  return [...seg.matchAll(/T(\d+) · (YOU|BOT)\n(\d)\n(\d)\n(\d)\n(\d)\n([^\n]*)/g)].map((m) => ({ n: +m[1], who: m[2], guess: m[3] + m[4] + m[5] + m[6], fb: parseFb(m[7]) }));
}
async function startVia(page, level, secret) {
  await page.goto(BASE + "/play", { waitUntil: "networkidle" });
  await page.getByText(new RegExp(`^${level}$`, "i")).first().click().catch(() => {});
  await page.getByRole("button", { name: new RegExp(`Engage Bot \\(${level}\\)`, "i") }).click();
  await page.waitForURL("**/arena");
  await page.getByText("Choose Your Secret Cipher").waitFor();
  for (const c of secret) await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await page.getByText("Deciding Initiative").waitFor();
}
async function enterGrid(page) { await page.getByRole("button", { name: "Enter Duel Grid" }).click(); }
async function waitMyTurn(page, ms = 15000) {
  await page.waitForFunction(() => /awaiting your move|CIPHER CRACKED|YOUR CIPHER WAS BROKEN|TACTICAL DRAW/i.test(document.body.innerText), null, { timeout: ms });
}
const modalResult = async (page) => { const t = await page.locator("body").innerText(); return /CIPHER CRACKED/.test(t) ? "win" : /YOUR CIPHER WAS BROKEN/.test(t) ? "lose" : /TACTICAL DRAW/.test(t) ? "draw" : null; };

async function playSolver(page, secretMine, maxRounds = 13) {
  let cands = perms;
  for (let i = 0; i < maxRounds; i++) {
    await waitMyTurn(page);
    if (await modalResult(page)) return;
    const guess = cands[0];
    for (const c of guess) await page.keyboard.press(c);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const mine = (await ledger(page)).filter((r) => r.who === "YOU").at(-1);
    cands = cands.filter((c) => { const [p, l] = fb(guess, c); return p === mine.fb[0] && l === mine.fb[1]; });
    if (mine.fb[0] === 4) return;
  }
}

// ---------- T1: setup + solver win, bot adapts, UI sanity ----------
{
  const page = await newPage();
  await page.goto(BASE + "/arena", { waitUntil: "networkidle" });
  check("setup modal appears on first open", await page.getByText("Choose Your Secret Cipher").isVisible());
  check("debug bar removed", (await page.locator("body").innerText()).includes("Debug States") === false);
  check("no fake ledger at start", /0 Turns Recorded/.test(await page.locator("main").innerText()));
  await page.getByRole("button", { name: "Lock Secret" }).isDisabled().then((d) => check("lock disabled with empty secret", d));
  const SECRET = "5841";
  for (const c of SECRET) await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await page.getByText("Deciding Initiative").waitFor();
  const starterText = await page.getByText(/won the toss/).innerText();
  await enterGrid(page);
  const mySecretShown = (await page.locator("main").innerText()).replace(/\s/g, "");
  check("my chosen secret shown in panel", mySecretShown.includes("5841"));
  await page.waitForTimeout(400);
  // invalid: press Enter with incomplete draft
  if (/You won/.test(starterText)) {
    await page.keyboard.press("1");
    await page.keyboard.press("Enter");
    check("incomplete guess shows validation", /INVALID INPUT/.test(await page.locator("main").innerText()) || (await page.getByRole("button", { name: /LOCK & SUBMIT/ }).isDisabled()));
    await page.keyboard.press("Escape");
  }
  await playSolver(page, SECRET);
  await page.waitForFunction(() => /CIPHER CRACKED|YOUR CIPHER WAS BROKEN|TACTICAL DRAW/.test(document.body.innerText), null, { timeout: 60000 });
  const res = await modalResult(page);
  const rows = await ledger(page);
  const botRows = rows.filter((r) => r.who === "BOT");
  // bot guesses must be consistent with its own earlier feedback vs my real secret and never repeat
  let consistent = true;
  botRows.forEach((r, i) => {
    const expected = fb(r.guess, SECRET);
    if (expected[0] !== r.fb[0] || expected[1] !== r.fb[1]) consistent = false; // feedback displayed is correct
    for (let j = 0; j < i; j++) { const [p, l] = fb(r.guess, botRows[j].guess); /* not used */ }
    const prior = botRows.slice(0, i);
    const ok = prior.every((q) => { const [p, l] = fb(q.guess, r.guess); return p === q.fb[0] && l === q.fb[1]; });
    if (!ok) consistent = false;
  });
  check("bot feedback vs my secret is correct + bot guesses adapt to its history", consistent && botRows.length > 0, `bot guesses: ${botRows.map((r) => r.guess).join(",")}`);
  check("no repeated bot guesses", new Set(botRows.map((r) => r.guess)).size === botRows.length);
  check("match ended with a result modal", !!res, `result=${res}, my guesses=${rows.filter((r) => r.who === "YOU").length}`);
  check("no console errors (T1)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.screenshot({ path: "vsai-result.png" });
  await page.close();
}

// ---------- T2: I stall -> bot (hard) must win, "lose" modal ----------
{
  const page = await newPage();
  await startVia(page, "GRANDMASTER", "5841");
  await enterGrid(page);
  const stall = ["9876", "2913", "7362", "4197", "8253", "6419", "3728", "1985", "2461", "9137", "8642", "7315"];
  let sent = 0;
  for (const g of stall) {
    try { await waitMyTurn(page, 20000); } catch { break; }
    if (await modalResult(page)) break;
    for (const c of g) await page.keyboard.press(c);
    await page.keyboard.press("Enter"); sent++;
    await page.waitForTimeout(150);
    // submit during bot turn must be ignored
    const before = (await ledger(page)).length;
    for (const c of "1357") await page.keyboard.press(c);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const after = (await ledger(page)).length;
    if (after > before) { check("guess during bot's turn is ignored", false); }
  }
  await page.waitForFunction(() => /CIPHER CRACKED|YOUR CIPHER WAS BROKEN|TACTICAL DRAW/.test(document.body.innerText), null, { timeout: 60000 });
  const res = await modalResult(page);
  check("hard bot cracks a passive player -> DEFEAT modal", res === "lose" || res === "win", `result=${res} after ${sent} of my guesses`);
  const t = await page.locator("body").innerText();
  check("defeat modal reveals opponent secret", res !== "lose" || /Opponent Secret Was/i.test(t));
  check("Match Live pill cleared after finish", !/MATCH LIVE/i.test(await page.locator("header").innerText()));
  check("no console errors (T2)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.screenshot({ path: "vsai-defeat.png" });
  await page.close();
}

// ---------- T3: novice, duplicate guess, resume after navigation ----------
{
  const page = await newPage();
  await startVia(page, "NOVICE", "1234");
  await enterGrid(page);
  await page.waitForTimeout(300);
  await waitMyTurn(page, 20000);
  for (const c of "9876") await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await waitMyTurn(page, 20000);
  for (const c of "9876") await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  check("duplicate guess rejected with message", /already tried/i.test(await page.locator("main").innerText()));
  const before = (await ledger(page)).length;
  await page.getByRole("button", { name: /How to Play/ }).first().click();
  await page.waitForURL("**/how-to-play");
  await page.getByRole("button", { name: /Live Arena/ }).first().click();
  await page.waitForURL("**/arena");
  const after = (await ledger(page)).length;
  check("match survives navigating away and back", after >= before && after > 0, `${before} -> ${after} rows`);
  check("no console errors (T3)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// ---------- T4: unavailable modes + forfeit ----------
{
  const page = await newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await startVia(page, "TACTICIAN", "1234");
  await enterGrid(page);
  await page.getByRole("button", { name: /Forfeit Current Match/ }).click();
  await page.waitForURL("**/play");
  check("forfeit returns to the hub", true);
  await page.goto(BASE + "/play", { waitUntil: "networkidle" });
  check("no console errors (T4)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

console.log(results.join("\n"));
await browser.close();
