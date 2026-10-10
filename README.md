# Pico & Pala — Web

Web oficial de Pico & Pala (Auron Tale Games), migrada desde el prototipo Vite `exampleWeb` a Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand 5 y TanStack Query 5.

## Desarrollo
```bash
pnpm install
cp .env.example .env.local
pnpm dev        # http://localhost:3000
pnpm lint       # tsc --noEmit
pnpm build
```

## Rutas
| Ruta | Vista |
|---|---|
| `/` | Landing / modos de juego |
| `/play` | Play Hub (elegir modo y dificultad) |
| `/arena` | Arena: partida jugable contra la IA (`ssr: false`) |
| `/records` | Perfil, estadísticas e historial reales del usuario autenticado, y ajustes de audio |
| `/how-to-play` | Reglas y estrategia |
| `/auth` | Acceso / registro reales (BFF + cookies HttpOnly) |

## Estructura
- `app/` layout, estilos globales y una página por ruta
- `components/` `Header`, `Footer`, `AppShell`, `Providers` y `views/` (las seis vistas del prototipo)
- `store/useAppStore.ts` estado global (Zustand): modo, dificultad, partida activa, idioma y audio
- `store/useMatchStore.ts` estado de la partida Versus IA
- `hooks/useAppNavigation.ts` mapea las vistas a rutas de Next; `usePublicStats` y `useWaitlist` (TanStack Query) esperan endpoints `public/*` del backend que aún no existen (y que el proxy no permite todavía)
- `lib/` reglas y bots (`gameLogic.ts`), sintetizador de audio (`audio.ts`), cliente API y `QueryClient`
- `docs/web-endpoints-plan.md` endpoints que faltan en el backend

## Autenticación (BFF)
El navegador nunca ve los tokens. Los route handlers de Next hablan con el backend (`BACKEND_URL`, solo servidor) y guardan los tokens en cookies HttpOnly.
- `pp_at` (access, 15 min, `path=/`) y `pp_rt` (refresh, 7 días, `path=/api`); `SameSite=Lax`, `Secure` solo en producción.
- `POST /api/auth/login|register|logout` y `GET /api/auth/session`: responden `{ player }` o `{ ok: true }`, sin tokens.
- `/api/proxy/[...path]`: reenvía solo `player/*`, `match/*` y `stats/*`, añade `Authorization` desde `pp_at`, y ante un 401 (o sin `pp_at`) hace un único refresh (serializado por valor de `pp_rt` dentro del proceso) y reintenta una vez.
- Cliente: `lib/api.ts` (`apiFetch`), `store/useAuthStore.ts`, `hooks/useSession|useLogin|useRegister|useLogout|usePlayerStats|useMatchHistory`.
- Hacia el backend: auth en `/web/auth/{register,login,refresh,logout}`. Cada petición del BFF (también `public/*` y refresh) lleva `X-BFF-Key` (`BFF_SHARED_SECRET`, solo servidor, igual que en el backend; obligatoria en producción) y `X-Client-IP` (`cf-connecting-ip` > primer valor válido de `x-forwarded-for` > `x-real-ip`, validado con `net.isIP`). Sin la clave el backend ignora `X-Client-IP` y todos los usuarios compartirían el límite de la IP del servidor Next. Solo es fiable detrás de un proxy que sobrescriba esas cabeceras.
- Captcha: con `NEXT_PUBLIC_TURNSTILE_SITE_KEY` el registro muestra Cloudflare Turnstile (`components/TurnstileWidget.tsx`, script cargado con `next/script`) y envía `captchaToken`; el token es de un solo uso. Sin site key (desarrollo) no hay widget. No hay CSP configurada; si se añade, permitir `challenges.cloudflare.com` en script/frame/connect.
- Código servidor: `lib/server/bff.ts`, `lib/server/clientIp.ts`, `lib/server/validation.ts`, `lib/server/authRoute.ts`.

## Idiomas (i18n)
Español, inglés y portugués con `i18next` + `react-i18next`. El idioma se toma del guardado (`localStorage: appLanguage`) o del navegador, y si no está soportado usa inglés. Se cambia desde el selector del header y actualiza `<html lang>`.
- Textos en `locales/{en,es,pt}/<namespace>.json` (`common`, `landing`, `auth`, `howToPlay`, `playHub`, `records`, `arena`); la config está en `lib/i18n/config.ts`.
- Los tres idiomas deben tener exactamente las mismas claves y variables `{{x}}`.
- Se traduce todo el texto de UI; se mantienen "Pico", "Pala", la marca y los datos de muestra.

## Modo Versus IA (jugable)
Lógica portada de la app (`picopalaapp/core/utils/gameLogic.ts`), sin backend:
- Eliges tu número secreto (o uno aleatorio); un sorteo decide quién empieza.
- 12 intentos por lado. Ganas con 4 Picos; pierdes si el bot los consigue antes; empate si ambos agotan los intentos.
- Tres niveles: **Novice** (jugadas aleatorias sin repetir), **Tactician** (candidato consistente al azar) y **Grandmaster** (minimax + reloj de 60 s por turno; al agotarse se envía una jugada aleatoria).
- Las jugadas repetidas se rechazan. La partida se conserva en memoria si sales de la arena y vuelves.
- Pantalla de batalla (pensada para móvil): indicador de turno y estado arriba, dos columnas (oponente a la izquierda, tú a la derecha) alineadas por ronda, y un botón **Escribir turno** que abre el teclado numérico en un modal. Con teclado físico, cualquier dígito abre el modal y `Enter` envía.
- Código: `lib/gameLogic.ts` (reglas y bots), `store/useMatchStore.ts` (estado y turnos), `components/views/ArenaView.tsx` (UI).

## Estado
- Sala privada (`/room`): crear sala con código, unirse con código, elegir secreto, duelo por turnos con reloj del servidor, rendirse y reanudar tras recargar. Se sincroniza por polling (2 s) a través del BFF. Sala global: aún "coming soon".
- Auth, perfil, estadísticas e historial usan el backend real vía BFF. No hay ranking global, recuperación de contraseña, edición de perfil ni borrado de cuenta.
- Las partidas de la web no se guardan ni se sincronizan estadísticas todavía.
- El header no tiene menú de navegación en móvil (los enlaces solo aparecen desde `lg`).

## Pruebas E2E
```bash
pnpm build   # sin NEXT_PUBLIC_TURNSTILE_SITE_KEY
pnpm e2e     # requiere Google Chrome; levanta solo el backend mock (e2e/mock-backend.mjs) y `next start` en :3111
```
`E2E_ONLY=mobile-i18n pnpm e2e` ejecuta una sola suite. El juego exige sesión: las suites usan una cookie `pp_at` que el mock acepta.
`e2e/auth-bff.mjs` (necesita `pnpm build` sin site key; levanta su propio `next start` y un backend mock, y compila una copia con site key en `.next-e2e-captcha`) verifica rutas `/web/auth/*`, `X-BFF-Key`/`X-Client-IP`, `captchaToken`, que los tokens no llegan al navegador y el formulario con y sin Turnstile. `e2e/vs-ai-flow.mjs` cubre setup, victoria, derrota, jugada repetida, navegación y abandono; `e2e/vs-ai-edge.mjs` cubre empate (12 jugadas por lado) y el reloj de Grandmaster; `e2e/mobile-i18n.mjs` cubre el layout móvil (turno arriba, dos columnas, teclado en modal) y el cambio de idioma en es/en/pt. Los helpers comunes están en `e2e/lib.mjs`.
