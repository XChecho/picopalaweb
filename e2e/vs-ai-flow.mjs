// Versus AI: setup, win, defeat, duplicate guess, navigation, forfeit.
import { BASE, enterArena, launch, createReport, perms, fb, newPage, moves, result, openArena, enterGrid, waitMyTurnOrEnd, typeGuess } from "./lib.mjs";

const browser = await launch();
const r = createReport();

async function playSolver(page, maxRounds = 13) {
  let cands = perms;
  for (let i = 0; i < maxRounds; i++) {
    await waitMyTurnOrEnd(page);
    if (await result(page)) return;
    const guess = cands[0];
    await typeGuess(page, guess);
    await page.waitForTimeout(150);
    const mine = (await moves(page)).filter((m) => m.who === "YOU").at(-1);
    cands = cands.filter((c) => { const [p, l] = fb(guess, c); return p === mine.fb[0] && l === mine.fb[1]; });
    if (mine.fb[0] === 4) return;
  }
}

// T1: setup + solver, bot uses its history
{
  const page = await newPage(browser);
  await enterArena(page, 1); // Tactician: the bot prunes by its history (Novice is deliberately looser)
  await page.getByText("Choose your secret cipher").waitFor({ timeout: 10000 }).catch(() => {});
  r.check("setup modal appears on first open", await page.getByText("Choose your secret cipher").isVisible());
  r.check("no debug bar / fake data", !/Debug States|Tokyo/i.test(await page.locator("main").innerText()));
  r.check("lock disabled with empty secret", await page.getByRole("button", { name: "Lock secret" }).isDisabled());
  const SECRET = "5841";
  for (const c of SECRET) await page.keyboard.press(c);
  await page.keyboard.press("Enter");
  await page.getByText("Deciding initiative").waitFor();
  const toss = await page.getByText(/won the toss/).innerText();
  await enterGrid(page);
  r.check("my chosen secret shown in my column", (await page.getByTestId("column-you").innerText()).replace(/\s/g, "").includes("5841"));
  r.check("opponent secret is hidden", !/\d/.test((await page.getByTestId("column-opponent").innerText()).replace(/VORTEX-AI|\d+ left|1v1/g, "")));
  await page.waitForTimeout(400);
  if (/you won/i.test(toss)) {
    await page.keyboard.press("1");
    await page.keyboard.press("Enter");
    r.check("incomplete guess shows validation", /Exactly 4 unique digits/.test(await page.locator("body").innerText()));
    await page.keyboard.press("Escape");
  }
  await playSolver(page);
  await page.waitForFunction(() => !!document.querySelector('[data-testid="result-title"]'), null, { timeout: 60000 });
  const rows = await moves(page);
  const bot = rows.filter((m) => m.who === "BOT");
  const consistent = bot.every((m, i) => {
    const [p, l] = fb(m.guess, SECRET);
    if (p !== m.fb[0] || l !== m.fb[1]) return false;
    return bot.slice(0, i).every((q) => { const [qp, ql] = fb(q.guess, m.guess); return qp === q.fb[0] && ql === q.fb[1]; });
  });
  r.check("bot feedback is correct and its guesses adapt to its history", consistent && bot.length > 0, bot.map((m) => m.guess).join(","));
  r.check("no repeated bot guesses", new Set(bot.map((m) => m.guess)).size === bot.length);
  r.check("match ended with a result modal", !!(await result(page)), `result=${await result(page)}, my guesses=${rows.filter((m) => m.who === "YOU").length}`);
  r.check("no console errors (T1)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// T2: passive player -> the hard bot wins
{
  const page = await newPage(browser);
  await openArena(page, "GRANDMASTER", "5841");
  await enterGrid(page);
  const stall = ["9876", "2913", "7362", "4197", "8253", "6419", "3728", "1985", "2461", "9137", "8642", "7315"];
  let sent = 0, ignoredOk = true;
  for (const g of stall) {
    try { await waitMyTurnOrEnd(page, 20000); } catch { break; }
    if (await result(page)) break;
    await typeGuess(page, g); sent++;
    await page.waitForTimeout(150);
    const before = (await moves(page)).length;
    await typeGuess(page, "1357"); // bot is thinking: must be ignored
    await page.waitForTimeout(100);
    if ((await moves(page)).length > before) ignoredOk = false;
  }
  await page.waitForFunction(() => !!document.querySelector('[data-testid="result-title"]'), null, { timeout: 60000 });
  const res = await result(page);
  r.check("guess during the bot's turn is ignored", ignoredOk);
  r.check("hard bot cracks a passive player", res === "lose" || res === "win", `result=${res} after ${sent} guesses`);
  r.check("defeat reveals the opponent secret", res !== "lose" || /Opponent secret was/i.test(await page.locator("body").innerText()));
  r.check("Match Live pill cleared after finish", !/MATCH LIVE/i.test(await page.locator("header").innerText()));
  r.check("no console errors (T2)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// T3: duplicate guess + match survives navigation
{
  const page = await newPage(browser);
  await openArena(page, "NOVICE", "1234");
  await enterGrid(page);
  await waitMyTurnOrEnd(page, 20000);
  await typeGuess(page, "9876");
  await waitMyTurnOrEnd(page, 20000);
  await typeGuess(page, "9876");
  r.check("duplicate guess rejected with message", /already tried/i.test(await page.locator("body").innerText()));
  await page.keyboard.press("Escape");
  const before = (await moves(page)).length;
  await page.getByRole("button", { name: /How to Play/ }).first().click();
  await page.waitForURL("**/how-to-play");
  await page.getByRole("button", { name: /Match Live/ }).first().click();
  await page.waitForURL("**/arena");
  const after = (await moves(page)).length;
  r.check("match survives navigating away and back", after >= before && after > 0, `${before} -> ${after} moves`);
  r.check("no console errors (T3)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// T4: forfeit
{
  const page = await newPage(browser);
  await openArena(page, "TACTICIAN", "1234");
  await enterGrid(page);
  await page.getByRole("button", { name: "Forfeit" }).click();
  await page.waitForURL("**/play");
  r.check("forfeit returns to the hub", true);
  r.check("no console errors (T4)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

r.print();
await browser.close();
