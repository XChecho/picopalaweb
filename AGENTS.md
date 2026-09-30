# AGENTS.md — Pico & Pala Web

- Stack: Next.js App Router, TypeScript estricto, Tailwind 4 (`@theme` en `app/globals.css`), Zustand, TanStack Query.
- Server Components por defecto; `"use client"` solo donde haya estado, efectos o `motion`.
- Nombres: archivos camelCase, componentes PascalCase, interfaces `I<Pascal>`, stores `use<Domain>Store`.
- Textos de UI solo vía `lib/i18n.ts`; sin strings hardcodeados, sin `console.log`, sin `throw 'string'`.
- Llamadas a la API solo con `apiFetch` (`lib/api.ts`), dentro de hooks de TanStack Query.
- Pico = dígito correcto en su posición; Pala = dígito correcto en otra posición.
- No prometer en la web funciones no implementadas (login, ranking real, push, tiempo real).
- Nunca commitear `.env*`.
