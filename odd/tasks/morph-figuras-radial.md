# Feature: morph-figuras-radial — Per-piece figure morph + radial brand particles

## Objective
Each of the 4 LiiotMark pieces morphs independently into its own geometric
figure, and the click burst emits radially (360°) using Liiot brand colors.

## Problem
- `liiot-morph.ts` interpolates the whole logo as a single path into value
  shapes, so pieces visibly turn into other pieces.
- `liiot-burst.ts` emits single-color (`currentColor`) dots in a 200-240° cone.

## Decision (user, 2026-10-05)
"Cada pieza, su figura": the 4 pieces animate separately, each into a distinct
geometric figure (e.g. circle, square, triangle, star) with its own brand color.

## Scope
- `src/scripts/liiot-morph.ts`, `src/scripts/liiot-burst.ts`,
  `src/components/ui/LiiotMarkAnimated.astro` (only if the DOM needs it).
- Do NOT touch: boop, 404.astro, FinalCTA, es.json.

## Constraints
- Brand palette: #5A228B, #8B45CC, #FF6A33, #e2b31c, #e04b66.
- Keep burst perf guards (cap, GC, reduced-motion, scrub, hidden, IO).
- Keep click cycle returning to the original logo; label behavior preserved.
- No new dependencies (flubber + gsap already present).
- Conventional Commits, no AI attribution. No push, no PR.

## Checklist
- [x] M1 — Radial burst: 360° even spread + jitter, per-particle brand color.
- [x] M2 — Per-piece morph: 4 pieces → 4 figures per state, staggered, back to logo.
- [x] M2b — Unique figures per piece (user follow-up): 8 distinct figures, no swaps.
- [ ] M3 — Verification: `bun run build` (green) + manual click check (pending human).

## Route
- Delegated direct (writer trigger: 2+ non-trivial files). Queued after
  perf-poda-animaciones writer to avoid parallel writers on one branch.

## TDD mode
- off. Source: package.json (no test runner). Runner: n/a.

## Delivery
- `single-pr`. Forecast <250 changed lines.

## Progress
- 2026-10-05: document created; waiting for perf-poda writer to finish.
- 2026-10-05: M1+M2 implemented and committed. `bun run build` green after
  each commit. Figure assignment: piece1 (big bar, center ~18,30, r8) and
  piece2 (big bar, center ~30,18, r8) get circle/square; piece3 (small hook,
  center ~30,42, r5) and piece4 (small hook, center ~18,6, r5) get
  triangle/rombo. Two states ("figuras", "contraste") rotate which brand
  color/shape pairing each piece shows, then auto-return to logo. Centers/
  radii derived from sampling each piece's real `d` bbox (svg-path-properties,
  already a flubber transitive dep — not imported in shipped code, only used
  once to compute the static constants now hardcoded in liiot-morph.ts).
- M3 (manual click check in a real browser) still pending — not run in this
  session (bounded writer, no browser tool used).

## Evidence
- `5f5a39a` feat(burst): emit radial particles in brand colors
- `8dfd90b` feat(morph): morph each logo piece into its own figure
- `2c4c468` fix(morph): give each logo piece figures no other piece uses

## Next step
- Manual click-through of the logo in Navbar/Footer to confirm the per-piece
  morph and radial burst look right, then M3 can be checked off.
