# Feature: perf-story-scroll — Jank al bajar por story wipe

## Objetivo
Eliminar los bajones de FPS al hacer scroll por la sección story (`#story-stage`),
donde el wipe cinematográfico (clip-path por tick) compite con el canvas WebGL
de filosofía a pantalla completa por la misma GPU.

## Problema
Ventana de jank = vuelo del wipe (progreso 0.001–0.999): cada tick de scroll
reescribe `clip-path` de la capa completa (`landing-motion.ts:172`) mientras el
shader pesado (5 haces + nebulosa + stardust + génesis ×5, DPR hasta 1.25)
renderiza a 60fps debajo. En 0% y 100% ya hay mitigaciones; el vuelo va sin red.

## Por qué
Reporte de usuario (2026-10-05) + auditoría read-only del padre. Autorizado A+B;
C (quitar blur del reveal) y D (wipe por transformada) quedan fuera por tocar estética.

## Alcance
- Solo `src/components/ui/FilosofiaBackground.astro`, `src/scripts/landing-motion.ts`
  y este documento.
- Contrato entre archivos: CustomEvent `filosofia-scrub` con `detail:{active:boolean}`.
- Respetar `prefers-reduced-motion`, pausa por visibilidad, IntersectionObserver.

## Restricciones
- Sin cambio visual: el throttle/DPR solo actúan durante el vuelo del wipe.
- Sin asignaciones por frame nuevas (no reintroducir GC pressure de T6-P2).
- 1 draw call, mismos uniforms + `uGenesisActive` (nuevo, escalar barato).

## Checklist
- [x] T7a — landing-motion: emitir `filosofia-scrub` (true en vuelo, false en
  reposo con debounce ~180ms y en estados 0%/100%/leave). Ruta: delegated. Done en `5527c31`.
- [x] T7b — FilosofiaBackground: con scrub activo, throttle a ~12fps + DPR máx 1.0
  (aplicado solo en transiciones); restaurar al reposo. Ruta: delegated (mismo writer). Done en `1b5dd1a`.
- [ ] T7c — Verificación: `bun run build` verde + grep del contrato en ambos lados
  + revisión manual Performance tab (pendiente usuario). Ruta: per-action.

## Alcance autorizado
- Rama actual (no cambiar de rama). Hay cambios locales sin commitear en otros
  archivos (fig spans) — NO tocarlos ni agregarlos.
- Commits work-unit Conventional Commits solo con los archivos autorizados,
  sin Co-Authored-By. No push, no PR.

## Criterios de aceptación
- Con la página quieta fuera del wipe: comportamiento idéntico al actual.
- Durante el wipe: canvas a ~12fps y backing store a DPR ≤1.0; al asentarse,
  restaura 60fps y DPR normal sin parpadeo (resize solo en transiciones).
- Build verde, sin warnings nuevos de shader.

## Checks aplicables
- `bun run build` (TDD off, sin runner de tests).
- Grep: `filosofia-scrub` en ambos archivos con el mismo nombre; `uGenesisActive`
  y dirty-flag de T6 intactos.

## Progreso
- 2026-10-05: documento creado, A+B autorizados. Pendiente T7a+T7b.
- 2026-10-05: T7a+T7b done. Build verde; `filosofia-scrub` en ambos lados con
  nombre idéntico; `uGenesisActive` + dirty-flag intactos; sin allocs nuevas
  por frame (`renderFrame`/`tick` sin `new`/literales; únicos `Float32Array` son
  de init). T7c (Performance tab manual) pendiente del usuario.

## Evidencia
- `5527c31` feat(story): cinematic wipe mitigations + filosofia-scrub event con
  debounce 180ms (T7a) — src/scripts/landing-motion.ts
- `1b5dd1a` feat(filosofia): throttle ~12fps + DPR máx 1.0 durante scrub (T7b)
  — src/components/ui/FilosofiaBackground.astro
- `bun run build`: verde (15.62s, 2 páginas, sin warnings nuevos de shader).

## Siguiente paso
- Delegar T7a+T7b a un writer con el contrato de arriba.

## Modo TDD resuelto
- off (sin script test en package.json). Fuente: package.json. Runner: n/a.

## Estrategia de entrega
- `single-pr`, cambios estimados <100 líneas (2 archivos). Sin slices.
