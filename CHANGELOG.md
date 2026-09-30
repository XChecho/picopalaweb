# Changelog

## 0.3.0
- Versus IA funcional con la lógica de la app: número secreto elegido por el jugador, sorteo de inicio, 12 intentos por lado, victoria/derrota/empate, tres niveles de bot y reloj de 60 s en Grandmaster.
- El bot usa el historial de sus jugadas (antes ignoraba las pistas) y `generateHardAIMove` cuenta particiones en vez de un bucle cuadrático.
- Se eliminan la barra de debug, las jugadas de muestra y las estadísticas falsas de la arena.
- Estado de partida en `useMatchStore`; el partido continúa al navegar entre vistas.

## 0.2.0
- Migración del prototipo Vite `exampleWeb` a Next.js: landing, Play Hub, Arena, Records, How to Play y Auth como rutas.
- Estado global en Zustand (`useAppStore`) y navegación con `useAppNavigation`.
- Se retira la landing inicial de 0.1.0.

## 0.1.0
- Landing inicial y plan de endpoints del backend en `docs/web-endpoints-plan.md`.
