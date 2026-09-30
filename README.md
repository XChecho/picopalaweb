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
| `/records` | Récords, perfil y ajustes de audio |
| `/how-to-play` | Reglas y estrategia |
| `/auth` | Acceso / registro (UI, sin backend todavía) |

## Estructura
- `app/` layout, estilos globales y una página por ruta
- `components/` `Header`, `Footer`, `AppShell`, `Providers` y `views/` (las seis vistas del prototipo)
- `store/useAppStore.ts` estado global (Zustand): modo, dificultad, partida activa, idioma y audio
- `store/useMatchStore.ts` estado de la partida Versus IA
- `hooks/useAppNavigation.ts` mapea las vistas a rutas de Next; `usePublicStats` y `useWaitlist` (TanStack Query) esperan endpoints del backend
- `lib/` reglas y bots (`gameLogic.ts`), sintetizador de audio (`audio.ts`), cliente API y `QueryClient`
- `docs/web-endpoints-plan.md` endpoints que faltan en el backend

## Modo Versus IA (jugable)
Lógica portada de la app (`picopalaapp/core/utils/gameLogic.ts`), sin backend:
- Eliges tu número secreto (o uno aleatorio); un sorteo decide quién empieza.
- 12 intentos por lado. Ganas con 4 Picos; pierdes si el bot los consigue antes; empate si ambos agotan los intentos.
- Tres niveles: **Novice** (jugadas aleatorias sin repetir), **Tactician** (candidato consistente al azar) y **Grandmaster** (minimax + reloj de 60 s por turno; al agotarse se envía una jugada aleatoria).
- Las jugadas repetidas se rechazan. La partida se conserva en memoria si sales de la arena y vuelves.
- Código: `lib/gameLogic.ts` (reglas y bots), `store/useMatchStore.ts` (estado y turnos), `components/views/ArenaView.tsx` (UI).

## Estado
- Salas privada y global: solo interfaz; la arena muestra "coming soon".
- Récords, perfil y auth usan datos mock hasta conectar el backend.
- Las partidas de la web no se guardan ni se sincronizan estadísticas todavía.
- Selector de idioma: cosmético (el contenido está en inglés).
