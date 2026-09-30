// Versus AI edge cases: draw after 12 guesses each, Grandmaster clock, levels without a clock.
import { launch, createReport, newPage, moves, result, openArena, enterGrid, typeGuess } from "./lib.mjs";

const browser = await launch();
const r = createReport();

// A: draw (novice, 12 non-winning guesses each, whoever starts)
for (let attempt = 1; attempt <= 3; attempt++) {
  const page = await newPage(browser, { width: 1280, height: 1600 });
  const toss = await openArena(page, "NOVICE", "5841");
  await enterGrid(page);
  const list = ["9876","2913","7362","4197","8253","6419","3728","1985","2461","9137","8642","7315","1234","2143"];
  let i = 0;
  const start = Date.now();
  while (Date.now() - start < 120000) {
    if (await result(page)) break;
    const state = await page.getAttribute('[data-testid="turn-status"]', "data-state").catch(() => null);
    if (state === "your-turn" && i < list.length) await typeGuess(page, list[i++]);
    await page.waitForTimeout(250);
  }
  const res = await result(page);
  const rows = await moves(page);
  const mine = rows.filter((m) => m.who === "YOU").length, bots = rows.filter((m) => m.who === "BOT").length;
  if (res === "draw") {
    r.check(`draw reached (${/you won/i.test(toss) ? "I started" : "bot started"})`, true, `my=${mine} bot=${bots}`);
    r.check("draw = exactly 12 guesses each, never a 13th", mine === 12 && bots === 12, `my=${mine} bot=${bots}`);
    r.check("no console errors (draw)", page.errors.length === 0, page.errors.join("|"));
    await page.close();
    break;
  }
  r.note(`(attempt ${attempt} ended as ${res}: my=${mine} bot=${bots}; retrying for a draw)`);
  await page.close();
  if (attempt === 3) r.check("draw reached within 3 attempts", false);
}

// B: Grandmaster clock with a fake clock
{
  const page = await newPage(browser);
  await page.clock.install();
  const toss = await openArena(page, "GRANDMASTER", "5841");
  await enterGrid(page);
  await page.clock.runFor(4000); // lets the bot play first if it won the toss
  r.check(`player's turn reached (starter: ${/you won/i.test(toss) ? "me" : "bot"})`, (await page.getAttribute('[data-testid="turn-status"]', "data-state")) === "your-turn");
  r.check("Grandmaster shows a countdown", /^\d\d:\d\d$/.test((await page.getByTestId("turn-clock").innerText()).trim()));
  const before = (await moves(page)).filter((m) => m.who === "YOU").length;
  await page.clock.runFor(61000);
  await page.waitForTimeout(200);
  const after = (await moves(page)).filter((m) => m.who === "YOU").length;
  r.check("timer expiry auto-submits a guess for the player", after === before + 1, `${before} -> ${after}`);
  r.check("time-up notice shown", /TIME UP/.test(await page.locator("main").innerText()));
  r.check("no console errors (timer)", page.errors.length === 0, page.errors.join("|"));
  await page.close();
}

// C: no clock on the easier levels
{
  const page = await newPage(browser);
  await openArena(page, "TACTICIAN", "5841");
  await enterGrid(page);
  await page.waitForTimeout(3000);
  r.check("non-Grandmaster levels show no countdown", (await page.getByTestId("turn-clock").innerText()).trim() === "∞");
  await page.close();
}

r.print();
await browser.close();
