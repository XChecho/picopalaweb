# Plan de endpoints del backend para la web

Fuente: auditoría de `picopalabackend` (NestJS) del 2026-09-29. Convenciones: prefijo `/api/v1`, respuesta envuelta en `{ data, statusCode, timestamp }`, DTOs con `class-validator`, JWT donde se indique.

## Ya disponible y utilizable por la web
- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- `GET /player/me`, `/player/me/stats`, `/player/me/matches`, `/player/me/elo-history`
- `POST /match`, `GET /match/:id`, `POST /match/:id/move`, `/room/*` y WebSockets (`/match`, `/matchmaking`)

## Endpoints nuevos (módulo `PublicModule`, prefijo `public`)

| Prioridad | Endpoint | Request | Response | Auth | Rate limit |
|---|---|---|---|---|---|
| P0 | `POST /public/waitlist` | `{ email, locale?, source? }` | `{ subscribed: true }` (igual si ya existe) | Pública | 5/min/IP + captcha |
| P0 | `GET /health` | – | `{ status }` | Pública | `@SkipThrottle` |
| P1 | `POST /public/contact` | `{ name, email, subject, message, captchaToken }` | `{ received: true }` | Pública | 3/min/IP + captcha |
| P1 | `GET /public/stats` | – | `{ totalPlayers, totalMatches, matchesToday }` | Pública | 30/min, caché 60 s |
| P1 | `GET /public/app-links` | – | `{ ios, android, version, minVersion }` | Pública | caché larga |
| P2 | `GET /public/leaderboard?limit&offset&period` | query (limit máx. 100) | `[{ position, username, avatar, elo, rank, trophies, wins }]` | Pública | 30/min, caché 60 s |
| P2 | `GET /public/players/:username` | – | perfil público sin email ni id interno | Pública | 30/min |
| P2 | `POST /auth/forgot-password`, `/auth/reset-password` | `{ email }` / `{ token, newPassword }` | respuesta genérica | Pública | 3/min por IP y email |
| P2 | `POST /auth/verify-email` | `{ token }` | `{ ok }` | Pública | 10/min |
| P2 | `POST /public/newsletter/confirm`, `/unsubscribe` | `{ token }` | `{ ok }` | Token firmado | 10/min |
| P3 | `DELETE /player/me` | reautenticación | – | JWT | – (requisito de tiendas y RGPD) |

Los endpoints públicos deben usar `select` explícito: nunca devolver `email`, `id` interno, `expoPushToken` ni `player1Number`/`player2Number`.

## Cambios en Prisma
- `WaitlistSubscriber(id, email único, locale, source, confirmedAt?, unsubscribedAt?, createdAt)`
- `ContactMessage(id, name, email, subject, message, ipHash, createdAt)`
- `@@index([elo])` en `Player`
- Tokens de verificación y reset (guardar hash y expiración)

## Endurecimiento previo a exponer la web
1. **CORS**: pasar `CORS_ORIGIN` a lista separada por comas, compartida por HTTP y por los gateways Socket.IO (hoy leen la variable por separado con default `http://localhost:8081`).
2. **Refresh token en web**: cookie `HttpOnly; Secure; SameSite=Lax` (o access token solo en memoria). Simplificar `/auth/refresh`, que hoy pide el token como Bearer y en el body.
3. **Throttling**: `@Throttle` por ruta en login/register (5-10/min); almacenamiento en Redis (`ThrottlerStorageRedisService`) con varias instancias.
4. **`trust proxy`**: activarlo detrás de proxy para que el throttler vea la IP real.
5. **`/stats/sync`**: crear DTO con `@Min(0)`/`@Max`, límite por usuario.
6. **`PATCH /player/me`**: validar `avatar` con `@IsUrl` y dominio de Cloudinary.
7. **Body limit**: bajar a ~100 KB por defecto; 10 MB solo para `/player/me/avatar` con validación de tipo y tamaño.
8. **Refresh tokens**: guardar solo el hash, limitar sesiones por usuario, limpiar expirados y leer `JWT_REFRESH_EXPIRES_IN`.
9. **Enumeración**: unificar mensajes de `register` para usuario/email existentes.
10. **Contrato**: el contrato dice `origin: '*'` en WebSocket pero el código usa `CORS_ORIGIN`; actualizar `docs/backend-contract.md`.

## Verificación por subagentes (siguiente fase)
Un subagente por bloque, cada uno con su rama y tests: (a) `PublicModule` + Prisma (waitlist, contact, stats, leaderboard, app-links, health); (b) auth (forgot/reset/verify, cookie de refresh, throttling); (c) endurecimiento (CORS, trust proxy, DTOs, límites). Un revisor final contrasta contra este documento y ejecuta `pnpm build` de la web contra el backend local.
