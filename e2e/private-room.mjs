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
const typeDigits = async (page, digits) => { for (const d of digits) await page.getByRole("button", { name: `Digit ${d}` }).click(); };

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

  await typeDigits(page, "9876");
  await page.getByTestId("digit-submit").click();
  await page.waitForFunction(() => document.querySelector('[data-testid="match-status"]')?.dataset.state === "your-turn", null, { timeout: 10000 });
  r.check("my secret is shown during the duel", (await page.getByTestId("my-secret").innerText()) === "9876");

  await typeDigits(page, "1243");
  await page.getByTestId("digit-submit").click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid="room-move"]').length === 2, null, { timeout: 10000 });
  const rows = await page.$$eval('[data-testid="room-move"]', (els) => els.map((el) => ({ seat: el.dataset.seat, guess: el.dataset.guess, picos: Number(el.dataset.picos), palas: Number(el.dataset.palas) })));
  r.check("my guess shows server feedback (1243 vs 1234 = 2 picos, 2 palas)", rows[0].guess === "1243" && rows[0].picos === 2 && rows[0].palas === 2, JSON.stringify(rows[0]));
  r.check("rival reply appears in its own column", (await page.getByTestId("column-rival").locator('[data-testid="room-move"]').count()) === 1);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("match-status").waitFor({ timeout: 10000 });
  r.check("an unfinished duel resumes after reload", (await page.$$('[data-testid="room-move"]')).length === 2);

  await typeDigits(page, "1234");
  await page.getByTestId("digit-submit").click();
  await page.getByTestId("room-result").waitFor({ timeout: 10000 });
  r.check("cracking the secret shows a victory", (await page.getByTestId("room-result").getAttribute("data-result")) === "win");
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
  await page.getByTestId("secret-random").click();
  await page.waitForFunction(() => document.querySelector('[data-testid="match-status"]')?.dataset.state === "your-turn", null, { timeout: 10000 });
  r.check("guest sees the rival's opening move and gets the turn", (await page.getByTestId("column-rival").locator('[data-testid="room-move"]').count()) === 1);

  await page.getByRole("button", { name: /Forfeit/i }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /^Forfeit$/i }).click();
  await page.getByTestId("room-result").waitFor({ timeout: 10000 });
  r.check("forfeiting shows a defeat", (await page.getByTestId("room-result").getAttribute("data-result")) === "loss");
  await page.getByRole("button", { name: /Back to lobby/i }).click();
  await page.getByTestId("create-room").waitFor();
  r.check("back to lobby after the duel", true);
  r.check("no console errors (guest)", page.errors.filter((e) => !/404/.test(e)).length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

await browser.close();
r.print();
