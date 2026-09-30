# Pico & Pala — Web

Landing de Pico & Pala (Auron Tale Games). Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand 5 y TanStack Query 5.

## Desarrollo
```bash
pnpm install
cp .env.example .env.local
pnpm dev        # http://localhost:3000
pnpm lint       # tsc --noEmit
pnpm build
```

## Estructura
- `app/` layout, página y estilos globales (tokens del tema en `globals.css`, tomados de la app Expo)
- `components/` secciones de la landing
- `hooks/` `useDictionary`, `useWaitlist`, `usePublicStats`
- `store/` estado global (Zustand): idioma
- `lib/` cliente API (`apiFetch`), i18n (es/en) y `QueryClient`
- `docs/web-endpoints-plan.md` endpoints que faltan en el backend

## Backend
`NEXT_PUBLIC_API_URL` apunta a `picopalabackend`. `POST /public/waitlist` y `GET /public/stats` aún no existen: el formulario mostrará error hasta implementarlos (ver el plan).
