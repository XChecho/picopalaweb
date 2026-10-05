# Changelog

## 0.4.4
- Arena: textos, dígitos, círculos de feedback y botones del HUD más grandes (se eliminan los textos de 10-11 px). E2E actualizado al selector de dificultad en modal.

## 0.4.3
- Play Hub: la dificultad del bot se elige en un modal al pulsar "Jugar" en Versus IA (como en la app), con textos más grandes; se elimina la matriz inline.

## 0.4.2
- Botones primarios unificados con el degradé de la app (`#FF5959` a `#FF2E95`); se elimina el degradé rosado-azul.

## 0.4.1
- Los botones "Jugar ya" y "Versus IA" de la landing llevan al Play Hub para elegir dificultad (antes entraban directo en Grandmaster).
- How to Play: el modo "Estrategia avanzada" muestra una deducción de 3 turnos; el ejemplo fácil no cambia.
- Arena: la pista del turno usa F (fija/pico) y P (pala) en lugar de P y L.

## 0.4.0
- Batalla rediseñada para móvil: indicador de turno y estado arriba, dos columnas (oponente izquierda, jugador derecha) alineadas por ronda, y teclado numérico en un modal abierto con el botón "Escribir turno". Se eliminan los paneles laterales y el teclado fijo.
- i18n con `i18next`/`react-i18next` en español, inglés y portugués para todas las vistas; detección por navegador, persistencia y `<html lang>`.
- El selector de idioma ofrecía japonés (sin traducción); ahora solo ofrece los tres idiomas soportados. El botón de idioma tiene `aria-label`.
- E2E: nuevo `mobile-i18n.mjs`, helpers compartidos y selectores por `data-testid`.

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
