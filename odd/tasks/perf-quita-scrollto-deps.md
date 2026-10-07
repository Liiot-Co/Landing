# Feature: perf-quita-scrollto-deps — Menos JS inicial

## Objetivo
Bajar el JS inicial: reemplazar ScrollToPlugin de GSAP por un tween rAF
propio (~20 líneas) y podar dependencias muertas. Autorizado por el usuario
(2026-10-06) tras la revisión de performance (opciones 1 y 2).

## Por qué
- ScrollToPlugin solo se usa para el smooth-scroll a anclas (~10-15 KB).
  El `scroll-behavior: smooth` nativo por CSS sigue prohibido (pelea con el
  pin de story, ver global.css:216); el reemplazo escribe `window.scrollY`
  por rAF igual que el plugin, así la cooperación con ScrollTrigger se
  conserva por el mismo mecanismo.
- `react`, `react-dom`, `@astrojs/react`, `lucide-react`,
  `@radix-ui/react-slot`, `class-variance-authority`, `clsx`,
  `tailwind-merge` no se importan en ningún lado (verificado por grep;
  `src/lib/utils.ts` es el único consumidor de clsx/tailwind-merge y nadie
  lo importa). No afectan el runtime, solo install/build.

## Alcance
- `src/scripts/landing-motion.ts` (quitar import/registro de ScrollToPlugin,
  tween rAF con easeInOutCubic, `duration 0` con reduced-motion).
- `package.json` (quitar 8 deps + `@types/react`, `@types/react-dom`),
  borrar `src/lib/utils.ts` (muerto; si queda rompería la resolución de tipos).
- NO tocar: comportamiento del scroll (misma duración 1s, mismo offsetY por
  scroll-padding-top, mismo pushState), resto de plugins GSAP.

## Checklist
- [x] P1 — Tween rAF en `setupSmoothAnchors`, sin ScrollToPlugin. Ruta: inline.
- [x] P2 — `bun remove` de deps muertas + borrar `utils.ts`. Ruta: inline.
  (Removidos 9 paquetes: react, react-dom, @astrojs/react, lucide-react,
  @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge,
  @types/react + @types/react-dom.)
- [x] P3 — Verificación: `bun run build` verde + grep sin ScrollToPlugin
  + `validate-seo` OK. Ruta: per-action.

## Progreso
- 2026-10-06: P1+P2+P3 done. Build verde (9.79s). Nota honesta: el chunk
  `index` no se achicó de forma medible (el plugin pesaba menos de lo
  estimado dentro del grafo de GSAP); el ahorro real queda en install/build,
  no en runtime.

## Criterios de aceptación
- Anclas con el mismo scroll suave de 1s y offset del nav; con
  reduced-motion salto instantáneo.
- Build verde; `dist/_astro/index.*.js` más liviano que ~69 KB.
- Sin `ScrollToPlugin` en `src`; sin `react` en `package.json`.

## Modo TDD resuelto
- off (sin runner de tests en package.json).

## Estrategia de entrega
- `single-pr`. Sin slices.
