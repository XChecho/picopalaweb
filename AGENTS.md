# AGENTS.md — Pico & Pala Web

- Stack: Next.js App Router, TypeScript estricto, Tailwind 4, Zustand, TanStack Query.
- Las vistas de `components/views/` vienen del prototipo Vite `exampleWeb` y son Client Components. Cada `app/<ruta>/page.tsx` conecta una vista con `useAppNavigation` y `useAppStore`.
- Navegación entre vistas: siempre con `useAppNavigation` (mapa `VIEW_ROUTES`), no con estado local.
- La arena se carga con `dynamic(..., { ssr: false })`. Reglas y bots viven en `lib/gameLogic.ts` (portados de la app; mantenerlos en sincronía) y el estado de la partida en `store/useMatchStore.ts`.
- Nombres: archivos camelCase, componentes PascalCase, interfaces `I<Pascal>`, stores `use<Domain>Store`.
- Llamadas a la API solo con `apiFetch` (`lib/api.ts`) dentro de hooks de TanStack Query. `apiFetch` solo habla con rutas same-origin (`/api/auth/*`, `/api/proxy/*`).
- BFF: los tokens viven en cookies HttpOnly (`pp_at`, `pp_rt`) manejadas en `app/api/**` y `lib/server/`; el navegador nunca los ve ni los guarda (sin localStorage). `BACKEND_URL` es solo servidor. El proxy solo admite `player/*`, `match/*`, `stats/*`.
- BFF -> backend: las rutas de auth son `/web/auth/*`. Toda petición sale por `backendFetch` (`lib/server/bff.ts`) con `X-BFF-Key` (`BFF_SHARED_SECRET`, solo servidor, obligatoria con `NODE_ENV=production`) y `X-Client-IP` (`getClientIp` en `lib/server/clientIp.ts`); incluye `public/*` y refresh. Nunca loguear la clave ni tokens, nunca prefijarla con `NEXT_PUBLIC_`.
- Captcha: el registro (y waitlist/contact) exige `captchaToken` de Cloudflare Turnstile cuando `NEXT_PUBLIC_TURNSTILE_SITE_KEY` está definida. El token es de un solo uso: no se guarda ni se reutiliza; tras un error se resetea el widget. Login no usa captcha. Sin site key (dev) no hay widget.
- `/play` y `/arena` exigen sesión (`useRequireAuth` + guard en `useAppNavigation`); la arena solo se abre con `arenaRequested` (jugar/continuar). Toda partida web terminada o abandonada tras ≥1 jugada se guarda con `useSaveMatch` (`POST /stats/sync`, idempotente por `matchId`): la web siempre tiene conexión, a diferencia de la app.
- Cómo jugar son dos pantallas (`/how-to-play` y `/how-to-play/strategy`). Los metadatos por ruta salen de `lib/seo.ts` (`pageMetadata`) en `app/<ruta>/layout.tsx`; los datos del responsable legal, de `lib/legal.ts`.
- Pico = dígito correcto en su posición; Pala = dígito correcto en otra posición.
- Salas privadas (`/room`): el estado vive en el servidor y la web lo consulta por polling cada 2 s vía `/api/proxy/{room,match}/*` (no hay WebSocket: el gateway exige el token en el handshake y aquí es HttpOnly). Mantener el polling bajo el límite global del backend (100 req/60 s por IP).
- No prometer funciones no implementadas (ranking global real, sala/cola global, push, WebSocket, recuperar contraseña, editar perfil, borrar cuenta).
- Sin `console.log`, sin `throw 'string'`. Nunca commitear `.env*`.
- i18n: todo texto de UI va por `t()` (`useTranslation('<namespace>')`) y existe en `locales/{en,es,pt}`, con las mismas claves y variables. Español neutro latinoamericano y portugués de Brasil. No traducir "Pico", "Pala" ni la marca.
- Batalla: el teclado numérico vive en un modal (botón "Escribir turno"); el tablero es de dos columnas (oponente izquierda, jugador derecha). Los e2e leen `data-testid` (`move`, `turn-status`, `turn-clock`, `result-title`), no el texto.
