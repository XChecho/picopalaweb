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

export function startMockBackend(port = MOCK_PORT) {
  const server = http.createServer((req, res) => {
    req.resume();
    const url = req.url ?? "";
    const send = (status, data) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify({ data, statusCode: status, timestamp: new Date().toISOString() }));
    };
    if (url.includes("/player/me/stats")) return send(200, STATS);
    if (url.includes("/player/me/matches")) return send(200, { matches: [], total: 0, limit: 10, offset: 0 });
    if (url.includes("/player/me")) return send(200, PLAYER);
    if (url.includes("/stats/sync")) return send(201, { synced: true });
    if (url.includes("/public/stats")) return send(200, { players: 0, matches: 0 });
    if (url.includes("/public/waitlist")) return send(201, { subscribed: true });
    return send(404, null);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startMockBackend();
  console.log(`mock backend on :${MOCK_PORT}`);
}
