# AGENTS.md — Pico & Pala Web

- Stack: Next.js App Router, TypeScript estricto, Tailwind 4, Zustand, TanStack Query.
- Las vistas de `components/views/` vienen del prototipo Vite `exampleWeb` y son Client Components. Cada `app/<ruta>/page.tsx` conecta una vista con `useAppNavigation` y `useAppStore`.
- Navegación entre vistas: siempre con `useAppNavigation` (mapa `VIEW_ROUTES`), no con estado local.
- La arena se carga con `dynamic(..., { ssr: false })`. Reglas y bots viven en `lib/gameLogic.ts` (portados de la app; mantenerlos en sincronía) y el estado de la partida en `store/useMatchStore.ts`.
- Nombres: archivos camelCase, componentes PascalCase, interfaces `I<Pascal>`, stores `use<Domain>Store`.
- Llamadas a la API solo con `apiFetch` (`lib/api.ts`) dentro de hooks de TanStack Query. `apiFetch` solo habla con rutas same-origin (`/api/auth/*`, `/api/proxy/*`).
- BFF: los tokens viven en cookies HttpOnly (`pp_at`, `pp_rt`) manejadas en `app/api/**` y `lib/server/`; el navegador nunca los ve ni los guarda (sin localStorage). `BACKEND_URL` es solo servidor. El proxy solo admite `player/*`, `match/*`, `stats/*`.
- Pico = dígito correcto en su posición; Pala = dígito correcto en otra posición.
- No prometer funciones no implementadas (ranking global real, salas, push, tiempo real, recuperar contraseña, editar perfil, borrar cuenta).
- Sin `console.log`, sin `throw 'string'`. Nunca commitear `.env*`.
- i18n: todo texto de UI va por `t()` (`useTranslation('<namespace>')`) y existe en `locales/{en,es,pt}`, con las mismas claves y variables. Español neutro latinoamericano y portugués de Brasil. No traducir "Pico", "Pala" ni la marca.
- Batalla: el teclado numérico vive en un modal (botón "Escribir turno"); el tablero es de dos columnas (oponente izquierda, jugador derecha). Los e2e leen `data-testid` (`move`, `turn-status`, `turn-clock`, `result-title`), no el texto.
