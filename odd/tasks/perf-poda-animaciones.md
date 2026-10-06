# Feature: perf-poda-animaciones — Reducir animaciones por sección

## Objetivo
Eliminar los bajones de FPS causados por exceso de animaciones simultáneas
(lanzado tras reporte de usuario "baja los fps al hacer multiples clicks
y al bajar").

## Diagnóstico
Top-5 por costo: (1) zoom hero perpetuo fullscreen, (2) parallax rAF
HowWeWork, (3) parallax rAF Team, (4) canvas filosofía (ya mitigado),
(5) wipe story (ya mitigado). Juntos sobrecargan GPU + JS por frame.

## Decisiones
Los 3 niveles autorizados por el usuario (2026-10-05). Intactos: wipe
narrativo, consolidación FinalCTA, morph/boop recién pedidos.

## Niveles
- **Conservador**: quitar zoom perpetuo hero → fade opacity solo; pausar
  parallax fuera de viewport/durante wipe.
- **Medio**: suspender hovers de cards durante scroll; shimmer una sola
  pasada; hélice DNA solo Navbar.
- **Agressivo**: reemplazar parallax magnético por transform estático
  con delay CSS; mantener narrativa.

## Alcance
- `src/components/Hero.astro`, `src/scripts/landing-motion.ts`,
  `src/components/HowWeWork.astro`, `src/components/Team.astro`,
  `src/components/ui/LiiotMarkAnimated.astro`, `odd/tasks/perf-poda-animaciones.md`.
- NO tocar: 404.astro, FinalCTA-consolidación, es.json.

## Restricciones
- Sin dependencias nuevas. Sin asignaciones por frame nuevas.
- `prefers-reduced-motion` = salida total. Sin cambio visual en reposo.
- Commits work-unit Conventional Commits, sin Co-Authored-By. No push, no PR.

## Checklist
- [x] N1 — zoom hero → fade opacity; pausa parallax fuera de viewport/durante wipe.
- [x] N2 — hovers cards suspendidas en scroll; shimmer una pasada; hélice solo Navbar.
- [x] N3 — parallax magnético → transform estático + delay CSS.
- [ ] N4 — Verificación: `bun run build` + Performance tab antes/después. (`bun run build` hecho; Performance tab queda pendiente, manual, no automatizable por este writer.)

## Criterios de aceptación
- Scroll fluido 60fps en secciones animadas; hero sin zoom; parallax
  fuera de viewport parado; morph/boop/wipe/consolidación intactos.
- Build verde, sin regresión reducido-motion.

## Progreso
- 2026-10-05: documento creado, 3 niveles autorizados. Pendiente N1-N3.
- 2026-10-05: N1-N3 implementados por writer delegado (delegated direct —
  writer trigger: 2+ archivos no triviales: landing-motion.ts, HowWeWork.astro,
  Team.astro, Hero.astro). `bun run build` verde tras cada tramo. N4
  (Performance tab) queda pendiente — verificación manual fuera del alcance
  de este writer.
- `src/components/Hero.astro` tenía ~95 líneas pre-existentes sin commitear
  (ajenas a esta tarea) antes de empezar. Los cambios de N1 (quitar zoom
  perpetuo) y N2 (shimmer una sola pasada) se aplicaron sobre ese archivo
  pero quedaron **sin commitear**, mezclados con el resto de cambios previos
  de Hero.astro — no se commiteó el archivo para no arrastrar ese trabajo
  ajeno. Build verificado igual con esos cambios en el working tree.
- La hélice DNA "solo Navbar" (parte de N2) ya estaba correctamente resuelta
  en `src/scripts/liiot-morph.ts` (`if (!svg.closest("header")) return;`),
  fuera de alcance / no tocado. No se añadió ningún prop a
  `LiiotMarkAnimated.astro`: hubiera sido redundante (el guard ya existe) y
  habría requerido tocar `liiot-morph.ts`, explícitamente fuera de alcance.

## Evidencia
- `5be424e` — perf(motion): pause editorial-piece parallax off-screen and
  during wipe (N1, parte parallax — `src/scripts/landing-motion.ts`).
- `3811757` — perf(motion): suspend card hover while actively scrolling
  (N2, parte hover-suspend — `src/scripts/landing-motion.ts`,
  `src/components/Team.astro`).
- `7ba57fd` — perf(motion): replace magnetic parallax with static reveal in
  HowWeWork (N3, + CSS de hover-suspend de HowWeWork que no pudo separarse
  en un hunk propio — `src/components/HowWeWork.astro`).
- Sin commitear (Hero.astro, pre-dirty): zoom hero → fade (N1), shimmer una
  sola pasada (N2).

## Siguiente paso
- N4: correr DevTools Performance tab antes/después en local (manual).
- Decidir si el trabajo pre-existente de Hero.astro se commitea por separado
  antes de incorporar ahí los cambios de N1/N2 de esta tarea.

## Modo TDD resuelto
- off. Fuente: package.json. Runner: n/a.

## Estrategia de entrega
- `single-pr`. Cambios estimados <200 líneas (4 archivos). Sin slices.

## Review assessment
- 2026-10-05: range 5532637..7ba57fd assessed medium, review_due=false (under_budget, 176 lines). Pending in slice; boundary stays 5532637.
