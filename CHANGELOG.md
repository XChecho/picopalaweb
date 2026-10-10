# Changelog

## Unreleased
- Duelo privado con el mismo diseño que el versus IA: tablero de dos columnas, fichas pico/pala, leyenda, teclado y modal de secreto. Componentes compartidos en `components/arena/` (`ColumnHeader`, `BoardCell`, `WriteTurnModal`, `SecretSetupModal`, `MatchResultModal`).
- Pantalla final como modal de resultado (ya no muestra el historial): revancha, ver partida y salir. La revancha requiere `POST /match/:id/rematch` del backend (campo `rematch` en la vista de la partida).
- Indicadores de carga al crear/unirse a una sala, fijar el secreto, enviar la jugada, rendirse y pedir revancha.

## 0.8.0
- Salas privadas en la web (`/room`): crear sala y compartir el código de 6 caracteres, unirse con código, elegir el secreto (propio o aleatorio) y duelo por turnos con el reloj de 60 s del servidor, rendirse y reanudar un duelo en curso (`GET /match/active`) tras recargar. El BFF permite ahora `room/*`. Sincronización por polling cada 2 s (sin WebSocket: los tokens son HttpOnly). Textos en en/es/pt.
- CI en GitHub Actions (typecheck, build, e2e). E2E con backend mock compartido (`e2e/mock-backend.mjs`, `e2e/run.mjs`) y nueva suite `private-room`.
- Fix: salir de la arena desde el header ya no rebota al centro de juego.

## 0.7.0
- Barra de navegación simplificada: En vivo, Cómo jugar y Récords (más Centro de juego con sesión); sin icono de sonido ni "nodo sincronizado"; cursor `pointer` global; confirmación antes de cerrar sesión.
- "Modos de juego" se integra en Cómo jugar, que ahora son dos pantallas: básicos y `/how-to-play/strategy` (estrategia avanzada con principios, ejemplo resuelto y errores comunes, con cifras calculadas por fuerza bruta).
- `/live` (próximamente, sin datos falsos). `/play` y `/arena` exigen sesión; la arena solo se abre desde jugar/continuar. Centro de juego sin datos inventados: victorias totales y por modo reales.
- Arena: la partida web siempre se guarda (`POST /stats/sync`, idempotente, con reintentos); moneda 3D de 2 s al sortear quién empieza; teclado inline en pantallas ≥768 px; "Ver partida" tras el resultado; sin footer ni doble scroll.
- Récords muestra la dificultad de la IA (requiere que el backend exponga `aiDifficulty` en el historial).
- Login sin panel de temporada ni textos inventados. Páginas `/terms` y `/privacy` (Ley 1581 de 2012) en en/es/pt.
- Logo con fondo en cabecera/pie, favicon sin fondo, metadata Open Graph/Twitter por ruta, imagen para compartir, `robots`, `sitemap` y `manifest`.

## 0.6.0
- BFF endurecido: las rutas de auth del backend pasan a `/web/auth/{register,login,refresh,logout}` (ya no se envía `platform` en register). Toda llamada del BFF (auth, refresh, `public/*`, `player/*`...) lleva `X-BFF-Key` (`BFF_SHARED_SECRET`, solo servidor, obligatoria en producción: la ruta falla con un error claro si falta) y `X-Client-IP` (nuevo `lib/server/clientIp.ts`: `cf-connecting-ip`, primer valor válido de `x-forwarded-for`, `x-real-ip`; validado con `net.isIP`).
- Cloudflare Turnstile en el registro sin dependencias nuevas (`components/TurnstileWidget.tsx`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`): el botón espera el token, el token es de un solo uso (se descarta y el widget se resetea tras cada intento fallido) y el BFF lo reenvía como `captchaToken`. Sin site key (desarrollo) no hay widget y el token es opcional. Nuevos textos i18n (en, es, pt). `useWaitlist` envía `captchaToken`.
- E2E nuevo `e2e/auth-bff.mjs` con backend mock local. `next.config.ts` admite `NEXT_DIST_DIR`.

## 0.5.0
- Login, registro, sesión persistente, logout e historial/estadísticas reales con un BFF en Next (`app/api/auth/*` y `app/api/proxy/[...path]`): tokens en cookies HttpOnly (`pp_at`, `pp_rt`), refresh con rotación serializado y un único reintento.
- `apiFetch` ahora usa rutas same-origin y lanza `ApiError` con el mensaje real del backend. Nuevo `BACKEND_URL` (solo servidor) en `.env.example`; se elimina `NEXT_PUBLIC_API_URL`.
- AuthView, Header y RecordsView conectados: estados de carga/error mapeados a i18n (en, es, pt). Se retiran del UI los elementos no implementados (login social, recuperar clave, editar/borrar cuenta, ranking global, vista previa de estados).

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
