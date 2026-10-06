# Feature: logo-morph-boop — Ilustraciones interactivas del logo

## Objetivo
Convertir las piezas del logo en ilustraciones interactivas: boop en hover,
morph por click y burst de partículas, siguiendo
joshwcomeau.com/blog/whimsical-animations/#particles-3 y
joshwcomeau.com/react/boop/ (traducidos a Astro + vanilla + gsap, sin React).

## Por qué
Petición de usuario (2026-10-05) con esas dos referencias. Investigación
read-only previa guardada en Engram (`discovery/research-logo-morph-boop`).

## Decisiones de producto (usuario, 2026-10-05)
- Color del morph: **multicolor** (los 6 estados conservan su color propio).
- Instancias: **en todos** — logo completo (Navbar/Footer) Y piezas de los
  headings de sección (Portfolio/Team/HowWeWork) + piezas de fondo de HowWeWork.
- Burst: **en cada morph** (no solo al completar el ciclo).

## Alcance
- Crear: `src/scripts/liiot-boop.ts` (utilidad boop vanilla+gsap, trigger
  desacoplado estilo hook) y `src/scripts/liiot-burst.ts` (burst polar DOM
  confinado + GC).
- Tocar: `src/scripts/liiot-morph.ts` (disparo del burst al completar cada morph;
  extender ciclo a piezas de headings/fondo), `Portfolio.astro`, `Team.astro`,
  `HowWeWork.astro` (wrappers de boop donde el parallax escribe transform),
  `Navbar.astro`/`Footer.astro` solo si el cableado lo exige, y este documento.
- NO tocar: `404.astro` (puzzle fuera del landing), FinalCTA-consolidación
  (su narrativa de viaje es intocable), `es.json` salvo que un label lo exija.

## Restricciones
- Sin dependencias nuevas: gsap + flubber existentes + CSS `cos()/sin()`.
- `prefers-reduced-motion` = salida total de movimiento por técnica; piezas
  decorativas siguen `aria-hidden`; no atar triggers a `:focus`.
- Perf: burst ≤14 nodos, vida <1s, `animationend → remove()`; suprimir burst si
  `filosofia-scrub` activo, `document.hidden` o fuera de viewport; morph de fondo
  anima `d` (no `transform`) para no pelear con el parallax; boop en HowWeWork
  fondo va en hijo wrapper, nunca en el nodo del parallax.
- Hélice DNA existente: si comparte trigger/elemento con el boop, elegir uno por
  instancia (no dos escritores sobre el mismo nodo).

## Checklist
- [x] L1 — `liiot-boop.ts` + cableado hover en headings/fondo/logos. Ruta: delegated. (`75f7e1a`)
- [x] L2 — `liiot-burst.ts` + disparo en cada morph completo. Ruta: delegated (mismo writer). (`6201c41`)
- [x] L3 — Morph-click en piezas de headings y fondo (cicla formas, multicolor).
  Ruta: delegated (mismo writer). (`5c33819`)
- [ ] L4 — Verificación: `bun run build` + revisión manual (boop/hover, morph/click,
  burst, reduced-motion). Ruta: per-action.

## Alcance autorizado
- Rama `feat/logo-morph-boop` (creada desde el HEAD con el trabajo génesis+perf).
  Hay cambios locales sin commitear arrastrados de la rama anterior — NO tocarlos
  ni agregarlos salvo los archivos listados en Alcance.
- Commits work-unit Conventional Commits, sin Co-Authored-By. No push, no PR.

## Criterios de aceptación
- Hover en piezas/logos = ráfaga boop que se auto-revierte (reposo idéntico).
- Click en logo completo y piezas de headings/fondo = morph multicolor + burst
  de partículas confinadas al wrapper en cada morph.
- Con reduced-motion: cero movimiento y cero partículas.
- Build verde, sin regresión del wipe ni del canvas de filosofía.

## Checks aplicables
- `bun run build` (TDD off, sin runner de tests).
- Grep: `liiot-boop`/`liiot-burst` importados donde se usan; `prefers-reduced-motion`
  en ambos scripts nuevos.

## Progreso
- 2026-10-05: documento creado, decisiones tomadas. Pendiente L1+L2+L3.
- 2026-10-05: L1+L2+L3 done en rama `feat/logo-morph-boop`. Build verde
  (`bun run build`, 2 páginas, sin errores). Hélice DNA solo en Navbar
  (`closest("header")`), boop en resto — documentado en `liiot-morph.ts`.

## Evidencia
- `75f7e1a` feat(boop): add vanilla+gsap boop utility with auto-revert
- `6201c41` feat(burst): add polar DOM particle burst with strict GC and scrub suppression
- `5c33819` feat(morph): wire burst per morph, editorial tiny morphs and boop targets

## Siguiente paso
- Delegar L1+L2+L3 a un writer con referencias y restricciones de arriba.

## Modo TDD resuelto
- off (sin script test en package.json). Fuente: package.json. Runner: n/a.

## Estrategia de entrega
- `single-pr`. Si supera ~400 líneas, avisar antes de dividir.
