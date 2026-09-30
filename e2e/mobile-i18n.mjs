// Mobile battle layout (top turn indicator, two columns, number pad in a modal) and i18n (en / es / pt).
import { BASE, launch, createReport, newPage, moves, openArena, enterGrid, waitMyTurnOrEnd } from "./lib.mjs";

const browser = await launch();
const r = createReport();
const RAW_KEY = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/m; // an untranslated i18n key shown as text

// ---------- Mobile battle ----------
{
  const VIEW = { width: 390, height: 844 };
  const page = await newPage(browser, VIEW);
  const toss = await openArena(page, "NOVICE", "5841");
  await enterGrid(page);
  await waitMyTurnOrEnd(page, 20000);

  const box = async (sel) => (await page.locator(sel).first().boundingBox());
  const indicator = await box('[data-testid="turn-indicator"]');
  r.check("turn indicator is in the top area of the screen", !!indicator && indicator.y < 160, `y=${Math.round(indicator?.y)}`);
  const status = await box('[data-testid="turn-status"]');
  r.check("turn status sits in the top bar", !!status && status.y < 160);

  const writeBtn = page.getByRole("button", { name: /Write turn/i });
  const wb = await writeBtn.boundingBox();
  r.check("Write turn button is visible without scrolling", !!wb && wb.y + wb.height <= VIEW.height, `bottom=${Math.round((wb?.y ?? 0) + (wb?.height ?? 0))}/${VIEW.height}`);
  r.check("number pad is hidden until asked for", (await page.getByRole("button", { name: "Digit 5" }).count()) === 0);

  const headers = { opp: await box('[data-testid="column-opponent"]'), you: await box('[data-testid="column-you"]') };
  r.check("two columns: opponent on the left, you on the right", headers.opp.x < headers.you.x && Math.abs(headers.opp.y - headers.you.y) < 4);

  await writeBtn.click();
  await page.getByRole("dialog").waitFor();
  r.check("number pad opens in a modal", await page.getByRole("button", { name: "Digit 9" }).isVisible());
  for (const d of "9876") await page.getByRole("button", { name: `Digit ${d}` }).click();
  await page.getByRole("button", { name: /Lock & submit/i }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  r.check("modal closes after submitting", true);

  await page.waitForFunction(() => document.querySelectorAll('[data-testid="move"][data-actor="BOT"]').length >= 1, null, { timeout: 20000 });
  const cells = {
    bot: await page.locator('[data-testid="move"][data-actor="BOT"]').first().boundingBox(),
    you: await page.locator('[data-testid="move"][data-actor="YOU"]').first().boundingBox(),
  };
  r.check("guesses are listed in separate columns (bot left, you right)", cells.bot.x < cells.you.x, `bot.x=${Math.round(cells.bot.x)} you.x=${Math.round(cells.you.x)}`);
  r.check("no horizontal overflow on mobile", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  r.check("no console errors (mobile)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// ---------- i18n ----------
const LANGS = [
  { code: "es", label: "Español", nav: "Cómo Jugar", write: /Escribir turno/i, setup: "Elige tu clave secreta" },
  { code: "pt", label: "Português", nav: "Como Jogar", write: /Escrever jogada/i, setup: "Escolha seu código secreto" },
  { code: "en", label: "English", nav: "How to Play", write: /Write turn/i, setup: "Choose your secret cipher" },
];

for (const lang of LANGS) {
  const page = await newPage(browser, { width: 1280, height: 900 }, "en-US");
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  if (lang.code !== "en") {
    await page.getByRole("button", { name: /Change language/i }).click();
    await page.getByRole("button", { name: lang.label }).click();
  }
  r.check(`[${lang.code}] <html lang> updated`, (await page.getAttribute("html", "lang")) === lang.code);
  r.check(`[${lang.code}] header navigation translated`, await page.getByRole("button", { name: lang.nav }).first().isVisible());

  await page.reload({ waitUntil: "networkidle" });
  r.check(`[${lang.code}] choice persists after reload`, (await page.getAttribute("html", "lang")) === lang.code);

  let raw = [];
  for (const route of ["/", "/play", "/records", "/how-to-play", "/auth"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const text = await page.locator("body").innerText();
    if (RAW_KEY.test(text)) raw.push(route);
  }
  r.check(`[${lang.code}] no untranslated keys on any page`, raw.length === 0, raw.join(","));

  await openArenaSetup(page);
  r.check(`[${lang.code}] arena setup modal translated`, await page.getByText(lang.setup).isVisible());
  for (const c of "5841") await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /^(Enter duel grid|Entrar al duelo|Entrar no duelo)$/i }).click();
  await waitMyTurnOrEnd(page, 20000);
  r.check(`[${lang.code}] arena action button translated`, await page.getByRole("button", { name: lang.write }).isVisible());
  r.check(`[${lang.code}] no console errors`, page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

async function openArenaSetup(page) {
  await page.goto(BASE + "/arena", { waitUntil: "networkidle" });
}

// Browser locale detection
{
  const es = await newPage(browser, { width: 1280, height: 900 }, "es-ES");
  await es.goto(BASE + "/", { waitUntil: "networkidle" });
  r.check("browser locale es-ES selects Spanish", (await es.getAttribute("html", "lang")) === "es");
  await es.close();
  const fr = await newPage(browser, { width: 1280, height: 900 }, "fr-FR");
  await fr.goto(BASE + "/", { waitUntil: "networkidle" });
  r.check("unsupported locale falls back to English", (await fr.getAttribute("html", "lang")) === "en");
  await fr.close();
}

r.print();
await browser.close();
