# AGENTS.md — Pico & Pala Web

- Stack: Next.js App Router, TypeScript estricto, Tailwind 4, Zustand, TanStack Query.
- Las vistas de `components/views/` vienen del prototipo Vite `exampleWeb` y son Client Components. Cada `app/<ruta>/page.tsx` conecta una vista con `useAppNavigation` y `useAppStore`.
- Navegación entre vistas: siempre con `useAppNavigation` (mapa `VIEW_ROUTES`), no con estado local.
- La arena se carga con `dynamic(..., { ssr: false })` porque genera el número secreto al azar.
- Nombres: archivos camelCase, componentes PascalCase, interfaces `I<Pascal>`, stores `use<Domain>Store`.
- Llamadas a la API solo con `apiFetch` (`lib/api.ts`) dentro de hooks de TanStack Query.
- Pico = dígito correcto en su posición; Pala = dígito correcto en otra posición.
- No prometer funciones no implementadas (login real, ranking real, salas, push, tiempo real).
- Sin `console.log`, sin `throw 'string'`. Nunca commitear `.env*`.
