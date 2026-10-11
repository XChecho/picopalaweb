// Minimal MOCK of the NestJS backend for the e2e suites that need a signed-in player.
// Run standalone (`node e2e/mock-backend.mjs`) and point the web server at it with
// BACKEND_URL=http://127.0.0.1:4102/api/v1.
import http from "node:http";

export const MOCK_PORT = Number(process.env.MOCK_PORT ?? 4102);
export const PLAYER = {
  id: "p1", username: "duelist1", email: "d@example.com", language: "EN",
  avatarUrl: null, elo: 1000, rank: "BRONCE", createdAt: "2026-01-01T00:00:00.000Z",
};
const STATS = {
  totalGames: 0, wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0, bestAttempts: null,
  totalAttempts: 0, totalPicos: 0, totalPalas: 0, totalDurationSec: 0, avgTimePerGame: 0, byMode: [],
};

// ---- Private rooms: a scripted rival so one browser can play a whole duel -------------------------
const RIVAL_SECRET = "1234";
const feedback = (guess, secret) => {
  let picos = 0, palas = 0;
  for (let i = 0; i < 4; i++) { if (guess[i] === secret[i]) picos++; else if (secret.includes(guess[i])) palas++; }
  return { picos, palas };
};
let gameCount = 0;
let game = null; // the single active private match of the signed-in mock player
let hostRoom = null; // { code, matchId } once the scripted guest has "joined"

function matchView() {
  const mine = game.mySeat === 1 ? "player1Number" : "player2Number";
  return {
    id: game.id, mode: "PRIVATE", status: game.status, endReason: game.endReason, maxTurns: 12,
    currentSeat: game.status === "PLAYING" ? game.currentSeat : null,
    turnDeadlineAt: new Date(Date.now() + 60_000).toISOString(),
    mySeat: game.mySeat, player1Id: "p1", player2Id: "rival", [mine]: game.mySecret,
    winnerId: game.winnerId, turnCount: game.moves.length, participants: [], moves: game.moves,
    rematch: game.rematch ?? null,
    // Like the backend: the rival's secret is revealed once the match is over.
    ...(game.status === "FINISHED" ? { [game.mySeat === 1 ? "player2Number" : "player1Number"]: RIVAL_SECRET } : {}),
  };
}
function startGame(mySeat) {
  game = { id: `00000000-0000-4000-8000-${String(++gameCount).padStart(12, "0")}`, status: "WAITING", mySeat, currentSeat: 1, mySecret: null, endReason: null, winnerId: null, moves: [], rematch: null };
}
function pushMove(seat, guess, secret) {
  const fb = feedback(guess, secret);
  const move = { id: `m${game.moves.length + 1}`, seat, playerId: seat === game.mySeat ? "p1" : "rival", turnNumber: game.moves.filter((m) => m.seat === seat).length + 1, guess, ...fb, isWin: fb.picos === 4, createdAt: new Date().toISOString() };
  game.moves.push(move);
  return move;
}

function handleRooms(req, url, body, send) {
  if (req.method === "POST" && url.endsWith("/room/private")) {
    hostRoom = { code: "ABC123", joined: false };
    return send(201, { id: "r1", code: "ABC123", hostId: "p1", maxTurns: 12, status: "WAITING", expiresAt: new Date(Date.now() + 3_600_000).toISOString() });
  }
  if (req.method === "POST" && url.endsWith("/room/private/join")) {
    if (body?.code !== "JOIN12" && body?.code !== "REM123") return send(404, { message: "Room not found" });
    startGame(2);
    return send(201, { room: { id: "r2", code: body.code, hostId: "rival", guestId: "p1", status: "IN_GAME", matchId: game.id }, match: { id: game.id } });
  }
  if (req.method === "GET" && url.includes("/room/private/")) {
    if (!hostRoom) return send(404, { message: "Room not found" });
    if (hostRoom.joined && (!game || game.status === "FINISHED")) startGame(1);
    return send(200, { id: "r1", code: hostRoom.code, hostId: "p1", guestId: game && game.status !== "FINISHED" ? "rival" : null, status: game && game.status !== "FINISHED" ? "IN_GAME" : "WAITING", maxTurns: 12, expiresAt: new Date(Date.now() + 3_600_000).toISOString(), matchId: game && game.status !== "FINISHED" ? game.id : null, matchStatus: game && game.status !== "FINISHED" ? game.status : null });
  }
  if (req.method === "DELETE" && url.includes("/room/private/")) { hostRoom = null; return send(200, { message: "Room closed" }); }
  if (url.endsWith("/__test/guest-joins")) { if (hostRoom) hostRoom.joined = true; return send(200, { ok: true }); }
  if (url.endsWith("/__test/rival-offers-rematch")) { if (game) game.rematch = { code: "REM123", requestedBy: "rival" }; return send(200, { ok: true }); }
  if (url.endsWith("/__test/reset")) { game = null; hostRoom = null; return send(200, { ok: true }); }
  if (url.endsWith("/match/active")) return send(200, game && game.status !== "FINISHED" ? matchView() : {});
  if (!game || !url.includes(`/match/${game.id}`)) return false;
  if (req.method === "GET") return send(200, matchView());
  if (url.endsWith("/secret")) {
    game.mySecret = body?.secret ?? "9876";
    game.status = "PLAYING";
    game.currentSeat = 1;
    if (game.mySeat === 2) { pushMove(1, "5678", game.mySecret); game.currentSeat = 2; }
    return send(201, { started: true });
  }
  if (url.endsWith("/move")) {
    if (game.status !== "PLAYING" || game.currentSeat !== game.mySeat) return send(400, { message: "Not your turn" });
    const move = pushMove(game.mySeat, body.guess, RIVAL_SECRET);
    if (move.isWin) { game.status = "FINISHED"; game.endReason = "GUESSED"; game.winnerId = "p1"; return send(201, { move }); }
    const rivalSeat = game.mySeat === 1 ? 2 : 1;
    pushMove(rivalSeat, "5678", game.mySecret);
    return send(201, { move });
  }
  if (url.endsWith("/rematch")) {
    if (game.status !== "FINISHED") return send(409, { message: "Match is not finished" });
    hostRoom = { code: "REM123", joined: false };
    game.rematch = { code: "REM123", requestedBy: "p1" };
    return send(201, { code: "REM123" });
  }
  if (url.endsWith("/forfeit")) { game.status = "FINISHED"; game.endReason = "RESIGNED"; game.winnerId = "rival"; return send(201, matchView()); }
  return false;
}

export function startMockBackend(port = MOCK_PORT) {
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => respond(raw));
    const url = req.url ?? "";
    const respond = (raw) => {
    let body = null;
    try { body = raw ? JSON.parse(raw) : null; } catch { body = null; }
    const send = (status, data) => {
      res.writeHead(status, { "content-type": "application/json" });
      // Errors keep the backend's flat `{ message, statusCode }` shape; successes use the envelope.
      res.end(JSON.stringify(status >= 400 && data?.message ? { ...data, statusCode: status } : { data, statusCode: status, timestamp: new Date().toISOString() }));
    };
    if (url.includes("/room/") || url.includes("/match/") || url.includes("/__test/")) {
      const handled = handleRooms(req, url, body, send);
      if (handled !== false) return handled;
    }
    if (url.includes("/player/me/stats")) return send(200, STATS);
    if (url.includes("/player/me/matches")) return send(200, { matches: [], total: 0, limit: 10, offset: 0 });
    if (url.includes("/player/me")) return send(200, PLAYER);
    if (url.includes("/stats/sync")) return send(201, { synced: true });
    if (url.includes("/public/stats")) return send(200, { players: 0, matches: 0 });
    if (url.includes("/public/waitlist")) return send(201, { subscribed: true });
    return send(404, null);
    };
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startMockBackend();
  console.log(`mock backend on :${MOCK_PORT}`);
}
