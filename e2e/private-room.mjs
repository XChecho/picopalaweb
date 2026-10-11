// Private rooms against the scripted mock rival (see mock-backend.mjs): create + wait, join by code,
// secret selection, server-driven turns, win, forfeit, resume after reload and error messages.
import { BASE, launch, createReport, newPage } from "./lib.mjs";
import { MOCK_PORT } from "./mock-backend.mjs";

const r = createReport();
const browser = await launch();
const mock = (path) => fetch(`http://127.0.0.1:${MOCK_PORT}/__test/${path}`, { method: "POST" });

async function openRoom(page) {
  await page.goto(BASE + "/play", { waitUntil: "networkidle" });
  await page.getByTestId("open-private-room").click();
  await page.waitForURL("**/room");
  await page.getByTestId("create-room").waitFor();
}
// Guess composer buttons are labelled "Digit n"; the secret modal's keys are just the digit.
const typeDigits = async (page, digits) => { for (const d of digits) await page.getByRole("button", { name: `Digit ${d}` }).click(); };
const typeSecret = async (page, digits) => { for (const d of digits) await page.getByRole("dialog").or(page.locator("div.fixed")).getByRole("button", { name: d, exact: true }).click(); };
const MOVE = '[data-testid="move"]';
const submitGuess = (page) => page.getByRole("button", { name: /Lock & submit/i }).click();

// ---- Host: create room, wait, guest joins, choose secret, win
{
  await mock("reset");
  const page = await newPage(browser);
  await openRoom(page);
  r.check("hub card opens the room lobby", /private duel/i.test(await page.locator("main").innerText()));

  await page.getByTestId("create-room").click();
  await page.getByTestId("room-code").waitFor();
  r.check("room code is shown", (await page.getByTestId("room-code").innerText()) === "ABC123");

  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("room-code").waitFor();
  r.check("waiting room survives a reload", (await page.getByTestId("room-code").innerText()) === "ABC123");

  await mock("guest-joins");
  await page.getByText("Choose your secret cipher").waitFor({ timeout: 10000 });
  r.check("guest joining moves the host to secret selection", true);

  await typeSecret(page, "9876");
  await page.getByRole("button", { name: /^Lock secret$/i }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="match-status"]')?.dataset.state === "your-turn", null, { timeout: 10000 });
  r.check("my secret is shown in my column during the duel", /9876/.test((await page.getByTestId("column-you").innerText()).replace(/\s/g, "")));
  r.check("duel uses the same board and legend as the bot arena", (await page.getByTestId("board").count()) === 1 && /Pico/.test(await page.locator("main").innerText()));

  await typeDigits(page, "1243");
  await submitGuess(page);
  await page.waitForFunction(() => document.querySelectorAll('[data-testid="move"]').length === 2, null, { timeout: 10000 });
  const rows = await page.$$eval(MOVE, (els) => els.map((el) => ({ actor: el.dataset.actor, guess: el.dataset.guess, picos: Number(el.dataset.picos), palas: Number(el.dataset.palas) })));
  const mine = rows.find((row) => row.actor === "YOU");
  r.check("my guess shows server feedback (1243 vs 1234 = 2 picos, 2 palas)", mine.guess === "1243" && mine.picos === 2 && mine.palas === 2, JSON.stringify(mine));
  r.check("rival reply appears in its own column", (await page.locator(MOVE + '[data-actor="RIVAL"]').count()) === 1);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("match-status").waitFor({ timeout: 10000 });
  r.check("an unfinished duel resumes after reload", (await page.$$(MOVE)).length === 2);

  await typeDigits(page, "1234");
  await submitGuess(page);
  await page.getByTestId("result-title").waitFor({ timeout: 10000 });
  r.check("cracking the secret shows a victory", (await page.getByTestId("result-title").getAttribute("data-result")) === "win");
  r.check("result is a dialog on top of the board, not a history list", (await page.getByRole("dialog").count()) === 1 && (await page.getByTestId("result-title").isVisible()));
  r.check("the rival's secret is revealed in the result", /1\s*2\s*3\s*4/.test(await page.getByRole("dialog").innerText()));
  r.check("result offers rematch, view match and leave", (await page.getByTestId("rematch").count()) === 1 && (await page.getByTestId("view-match").count()) === 1 && (await page.getByTestId("exit-match").count()) === 1);

  await page.getByTestId("view-match").click();
  r.check("view match closes the dialog and keeps the board", (await page.getByRole("dialog").count()) === 0 && (await page.locator(MOVE).count()) >= 3);
  await page.getByRole("button", { name: /Show result/i }).click();
  await page.getByTestId("result-title").waitFor();

  await page.getByTestId("rematch").click();
  await page.getByText("Waiting for your rival to accept").waitFor({ timeout: 10000 });
  r.check("rematch request waits for the rival", true);
  await mock("guest-joins");
  await page.getByText("Choose your secret cipher").waitFor({ timeout: 10000 });
  r.check("rival accepting starts a fresh duel with secret selection", (await page.locator(MOVE).count()) === 0);
  r.check("no console errors (host)", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// ---- Guest: wrong code, join, random secret, rival moves first, forfeit
{
  await mock("reset");
  const page = await newPage(browser);
  await openRoom(page);

  await page.getByTestId("join-input").fill("ZZZ999");
  await page.getByTestId("join-submit").click();
  await page.getByRole("alert").filter({ hasText: "does not exist" }).waitFor({ timeout: 5000 }).catch(() => {});
  r.check("unknown code shows a not-found message", await page.getByRole("alert").filter({ hasText: "does not exist" }).isVisible());
  await page.getByTestId("join-input").fill("AB");
  await page.getByTestId("join-submit").click();
  r.check("short code is rejected locally", await page.getByRole("alert").filter({ hasText: "6 characters" }).isVisible());

  await page.getByTestId("join-input").fill("join12");
  await page.getByTestId("join-submit").click();
  await page.getByText("Choose your secret cipher").waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: /^Random$/i }).click();
  await page.getByRole("button", { name: /^Lock secret$/i }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="match-status"]')?.dataset.state === "your-turn", null, { timeout: 10000 });
  r.check("guest sees the rival's opening move and gets the turn", (await page.locator(MOVE + '[data-actor="RIVAL"]').count()) === 1);

  await page.getByTestId("forfeit").click();
  await page.getByRole("alertdialog").getByRole("button", { name: /^Forfeit$/i }).click();
  await page.getByTestId("result-title").waitFor({ timeout: 10000 });
  r.check("forfeiting shows a defeat", (await page.getByTestId("result-title").getAttribute("data-result")) === "lose");

  await mock("rival-offers-rematch");
  await page.getByText("Your rival wants a rematch").waitFor({ timeout: 10000 });
  r.check("a rematch offer from the rival is shown", /accept rematch/i.test(await page.getByTestId("rematch").innerText()));
  await page.getByTestId("rematch").click();
  await page.getByText("Choose your secret cipher").waitFor({ timeout: 10000 });
  r.check("accepting the rematch joins the new duel", true);

  await page.getByRole("button", { name: /^Cancel$/i }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /^Forfeit$/i }).click();
  await page.getByTestId("result-title").waitFor({ timeout: 10000 });
  await page.getByTestId("exit-match").click();
  await page.getByTestId("create-room").waitFor();
  r.check("back to lobby after the duel", true);
  r.check("no console errors (guest)", page.errors.filter((e) => !/404/.test(e)).length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

await browser.close();
r.print();
