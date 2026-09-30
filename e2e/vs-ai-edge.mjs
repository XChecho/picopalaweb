// E2E for the Versus AI mode. Needs a running server: `pnpm build && pnpm start -p 3111` (override with E2E_BASE_URL)
// and Google Chrome installed. Run with: `pnpm e2e`.
import { chromium } from "playwright-core";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3111";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = [];
const check = (n, ok, x = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  -> " + x : ""}`);
const parseFb = (t) => [+(t.match(/(\d)P/)?.[1] ?? 0), +(t.match(/(\d)L/)?.[1] ?? 0)];
async function ledger(page) {
  const t = await page.locator("main").innerText();
  const seg = t.slice(t.indexOf("TACTICAL DEDUCTION LEDGER"), t.indexOf("DRAFT YOUR TURN"));
  return [...seg.matchAll(/T(\d+) · (YOU|BOT)\n(\d)\n(\d)\n(\d)\n(\d)\n([^\n]*)/g)].map((m) => ({ n: +m[1], who: m[2], guess: m[3] + m[4] + m[5] + m[6], fb: parseFb(m[7]) }));
}
async function open(page, level, secret) {
  await page.goto(BASE + "/play", { waitUntil: "networkidle" });
  await page.getByText(new RegExp(`^${level}$`, "i")).first().click().catch(() => {});
  await page.getByRole("button", { name: new RegExp(`Engage Bot \\(${level}\\)`, "i") }).click();
  await page.waitForURL("**/arena");
  await page.getByText("Choose Your Secret Cipher").waitFor();
  for (const c of secret) await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await page.getByText("Deciding Initiative").waitFor();
  return await page.getByText(/won the toss/).innerText();
}
const newPage = async () => { const p = await browser.newPage({ viewport: { width: 1280, height: 1600 } }); p.errors = []; p.on("pageerror", (e) => p.errors.push(e.message)); p.on("dialog", (d) => d.accept()); return p; };
const finished = (page) => /CIPHER CRACKED|YOUR CIPHER WAS BROKEN|TACTICAL DRAW/.test(page.__t ?? "");

// ---- A: DRAW with novice, 12 non-winning guesses each, either starter ----
for (let attempt = 1; attempt <= 3; attempt++) {
  const page = await newPage();
  const toss = await open(page, "NOVICE", "5841");
  await page.getByRole("button", { name: "Enter Duel Grid" }).click();
  const list = ["9876","2913","7362","4197","8253","6419","3728","1985","2461","9137","8642","7315","1234","2143"];
  let i = 0;
  const start = Date.now();
  while (Date.now() - start < 120000) {
    const body = await page.locator("body").innerText();
    if (/CIPHER CRACKED|YOUR CIPHER WAS BROKEN|TACTICAL DRAW/.test(body)) break;
    if (/awaiting your move/i.test(body) && i < list.length) {
      for (const c of list[i++]) await page.keyboard.press(c);
      await page.keyboard.press("Enter");
    }
    await page.waitForTimeout(250);
  }
  const body = await page.locator("body").innerText();
  const res = /TACTICAL DRAW/.test(body) ? "draw" : /CIPHER CRACKED/.test(body) ? "win" : /YOUR CIPHER WAS BROKEN/.test(body) ? "lose" : "none";
  const rows = await ledger(page);
  const mine = rows.filter((r) => r.who === "YOU").length, bots = rows.filter((r) => r.who === "BOT").length;
  if (res === "draw") {
    check(`draw reached (${toss.includes("You won") ? "I started" : "bot started"})`, true, `my=${mine} bot=${bots}`);
    check("draw = exactly 12 guesses each, never a 13th", mine === 12 && bots === 12, `my=${mine} bot=${bots}, last turn n=${rows.at(-1)?.n}`);
    check("no console errors (draw)", page.errors.length === 0, page.errors.join("|"));
    await page.screenshot({ path: "vsai-draw.png" });
    await page.close();
    break;
  }
  out.push(`(attempt ${attempt} ended as ${res}: my=${mine} bot=${bots}; retrying for a draw)`);
  await page.close();
  if (attempt === 3) check("draw reached within 3 attempts", false);
}

// ---- B: time-up on Grandmaster with a fake clock ----
{
  const page = await newPage();
  await page.clock.install();
  const toss = await open(page, "GRANDMASTER", "5841");
  await page.getByRole("button", { name: "Enter Duel Grid" }).click();
  await page.clock.runFor(4000); // lets the bot play first if it won the toss
  check("player's turn reached (starter: " + (toss.includes("You won") ? "me" : "bot") + ")", /awaiting your move/i.test(await page.locator("main").innerText()));
  const t0 = await page.locator("main").innerText();
  check("Grandmaster shows a countdown", /0[01]:\d\d/.test(t0.slice(0, 600)) || /01:00|00:5\d/.test(t0));
  const before = (await ledger(page)).filter((r) => r.who === "YOU").length;
  await page.clock.runFor(61000);
  await page.waitForTimeout(200);
  const after = (await ledger(page)).filter((r) => r.who === "YOU").length;
  check("timer expiry auto-submits a guess for the player", after === before + 1, `${before} -> ${after}`);
  check("time-up notice shown", /TIME UP/.test(await page.locator("main").innerText()));
  check("no console errors (timer)", page.errors.length === 0, page.errors.join("|"));
  await page.close();
}

// ---- C: novice/tactician have no clock ----
{
  const page = await newPage();
  await open(page, "TACTICIAN", "5841");
  await page.getByRole("button", { name: "Enter Duel Grid" }).click();
  await page.waitForTimeout(3000);
  check("non-Grandmaster levels show no countdown", (await page.locator("main").innerText()).includes("∞"));
  await page.close();
}

console.log(out.join("\n"));
await browser.close();
