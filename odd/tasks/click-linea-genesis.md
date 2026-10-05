# Feature: click-linea-genesis — Por qué existimos

## Objetivo
Reemplazar el efecto wave/shockwave del click en el canvas de `por-que-existimos` por un efecto "Línea génesis" más envolvente.

## Problema
El click actual genera una onda expansiva circular (`shockwave` + anillo refractario en `FilosofiaBackground.astro`) que deforma fibras y enciende núcleos. Se percibe como un pulso puntual, poco envolvente.

## Por qué
Decisión de usuario (2026-10-05): efecto elegido "Línea génesis" entre Línea génesis / Magnetismo / Bloom envolvente.

## Alcance
- Solo `src/components/ui/FilosofiaBackground.astro` (shader GLSL + uniforms JS).
- No tocar `OurStory.astro`, layout, ni otros canvas (`aurora-gradient.ts`, `FinalCTA`).
- Respetar `prefers-reduced-motion`, pausa por visibilidad, DPR caps existentes.

## Restricciones
- WebGL2, 1 draw call fullscreen triangle, sin buffers nuevos.
- Paleta Liiot Radiante existente, no cambiar haces 1-5 ni scrim editorial.
- Performance: mismo presupuesto que la wave (pocas operaciones por pixel, sin loops nuevos).

## Checklist
- [x] T1 — Eliminar lógica wave/shockwave + anillo (GLSL + excitación asociada), mantener uniforms `uClickPos/uClickTime` reutilizados como semilla génesis. Ruta: delegated. Trigger: preparation (lectura prepara escritura).
- [x] T2 — Implementar Línea génesis: en `uClickPos` nace una fibra luminosa temporal que fluye con el field (advected), brilla núcleos/halos/polvo a su paso, decae en ~2.5s. Ruta: delegated (mismo writer que T1, un solo writer).
- [x] T4 — Endurecer línea génesis a recta como haces 1-4 (corrección usuario 2026-10-05: "como las otras, no como ondas"). Eliminar meandro `sin(dist*18...)` y máscara en abanico; usar `linePath` recta por `uClickPos` con la misma jerarquía core/halo/trail. Ruta: delegated. Done en `ce3eab6`.
- [x] T5 — Multilínea con máximo 5 (petición usuario 2026-10-05, máximo elegido 5): ring buffer de 5 slots `uClickPos[5]/uClickTime[5]`, loop fijo de 5 en GLSL, misma fibra recta por slot. Ruta: delegated. Done en `65287d7`.
- [ ] T3 — Verificación: `bun run build` o `astro build`, revisión visual manual del click, reduced-motion intacto. Ruta: delegated per-action worker.

## Alcance autorizado
- Editar solo `src/components/ui/FilosofiaBackground.astro` y `odd/tasks/click-linea-genesis.md`.
- Rama: crear `feat/click-linea-genesis` desde `main` antes del primer write (estamos en `main` con cambios locales sin commitear — no tocar esos cambios, solo el archivo autorizado).
- Commits: work-unit Conventional Commits en la feature branch, sin Co-Authored-By. Push/PR solo bajo decisión del usuario.

## Criterios de aceptación
- Click ya no produce anillo/wave expansiva.
- Click siembra una línea/fibra visible que crece y fluye ~2-3s y luego se disipa.
- La fibra génesis es RECTA como los haces 1-4 (sin serpenteo/ondas, sin abanico angular).
- Sin regresión de contraste del texto (`#phil-quote`), sin warnings nuevos de shader, build verde.

## Checks aplicables
- `bun run build` (no hay runner de tests en `package.json`, TDD off).
- Revisión estructural del diff del shader.

## Progreso
- 2026-10-05: documento creado, efecto elegido Línea génesis. Pendiente T1+T2.
- 2026-10-05: T1+T2 implementados (writer único). `bun run build` verde. Ver commit en Evidencia.

## Evidencia
- `8e2c8c1` feat(filosofia): replace click wave with genesis line (T1+T2, `bun run build` verde)
- `ce3eab6` feat(filosofia): straighten genesis line to beam language (T4, `bun run build` verde)
- `65287d7` feat(filosofia): multi-line genesis up to 5 slots via ring buffer (T5, `bun run build` verde)

## Siguiente paso
- Delegar T1+T2 a un writer con el shader actual como contexto.

## Modo TDD resuelto
- off (sin script test en package.json). Fuente: package.json. Runner: n/a.

## Estrategia de entrega
- `single-pr`, cambios estimados <400 líneas (un solo archivo shader). Sin slices.
