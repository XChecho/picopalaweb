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
- `hooks/useAppNavigation.ts` mapea las vistas a rutas de Next; `usePublicStats` y `useWaitlist` (TanStack Query) esperan endpoints del backend
- `lib/` motor de juego (`picoEngine.ts`), sintetizador de audio (`audio.ts`), cliente API y `QueryClient`
- `docs/web-endpoints-plan.md` endpoints que faltan en el backend

## Estado
- Jugable: Versus IA (arena con motor y audio propios, sin backend).
- Datos de muestra: la arena arranca con una partida de ejemplo y una barra de "debug states"; récords y perfil usan datos mock; salas privada/global y auth son solo interfaz.
- Selector de idioma: cosmético (el contenido está en inglés).
