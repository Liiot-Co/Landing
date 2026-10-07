# Feature: perf-web-vitals-lighthouse — Fixes del diagnóstico Lighthouse

## Objetivo
Atacar los 5 hallazgos del reporte Lighthouse de liiot.app (2026-10-06):
reflow forzado 87ms, matter.js en ruta crítica (28KB "sin usar"), 2
animaciones no compuestas, imágenes sobredimensionadas (57KB), TTL de
caché de Fontshare.

## Fixes (todos implementados 2026-10-06, build verde)
- [x] V1 — Matter diferido: `whenNearViewport(yard, 600)` antes del
  `import("matter-js")` en `liiot-physics.ts`. Saca 28KB de la ruta
  crítica y del "JS sin usar". (MPA sin SPA: sin leak.)
- [x] V2 — Shimmer del hero compuesto: el barrido vive en
  `.hero-skeleton::after` con `translateX` en vez de
  `background-position`. Mismo visual, cero repaint.
- [x] V3 — Indicadores del carrusel: ancho fijo 52px + `scaleX(0.46→1)`
  en vez de animar `width`. Mismo look, sin invalidar layout.
- [x] V4 — Imágenes de tarjetas HowWeWork/Portfolio: `src` 800→640,
  calidad 70→60 (van con velo/filtro encima; diferencia invisible).
- [x] V5 — Reflow en filosofía: `onPointerMove` global ya no lee
  `getBoundingClientRect()` por evento; usa rect cacheado que se refresca
  1 vez por frame como máximo (flag en scroll/resize). Misma precisión.

## Pendiente (requiere navegador o decisión)
- [x] V6 — Self-host de Satoshi (2026-10-06, rev.2): se usan los TTF del
  usuario en `public/TTF/` (`Satoshi-Variable.ttf`, 124KB; solo el normal,
  sin itálicas porque no se usan). `@font-face` en `global.css` +
  preload `font/ttf` en `Layout.astro`; eliminado `public/fonts/`.
  Cero referencias a fontshare/woff2 en `dist`; `dist/TTF/` copiado.
  Nota: el TTF pesa 3x más que el woff2 equivalente (124 vs 42KB);
  si el peso importa, convertir a woff2 es el siguiente paso.
  Los 2 OpenSans de `public/TTF/` (~1.1MB) no se referencian: se
  despliegan pero ningún navegador los descarga.
- [x] V6b — Open Sans cableada + TTF eliminados (2026-10-06,
  commit `02a6bee`): TTF→WOFF2 con subset latino vía fonttools
  (satoshi 124→33KB, open-sans 517→103KB); Open Sans como secundaria
  real (reemplaza a Inter, que nunca se cargaba); preload solo de
  Satoshi; `public/TTF/` eliminada. Solo se commitearon los archivos
  de fuentes; el resto del working tree sigue sin commitear.
- [ ] V7 — Re-medir en Lighthouse y confirmar: forced reflow ≈ 0,
  sin animaciones no compuestas, matter fuera de la cadena crítica.

## Criterios de aceptación
- Build verde (OK 2026-10-06, 9.79s), SEO validado.
- Sin cambio visual: shimmer, dots, fotos y scroll idénticos a simple vista.

## Modo TDD resuelto
- off (sin runner de tests en package.json).

## Estrategia de entrega
- `single-pr`. Sin slices.
