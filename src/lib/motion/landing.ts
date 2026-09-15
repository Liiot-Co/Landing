/**
 * Shared Motion presets for landing sections — one place for timings, easing,
 * and in-view margins so section scripts stay small and consistent.
 *
 * Every section entrance uses the SAME easing curve (`--dt-easing-flow` from
 * the brandbook) so scrolling through the page reads as one continuous motion
 * language instead of a different "feel" per section.
 */
import { stagger, type StaggerOrigin } from "motion";

/** Default margin passed to `inView` so reveals trigger slightly before the section hits center. */
export const inViewMargin = {
  section: "-60px 0px 0px 0px",
  socialProof: "-40px 0px 0px 0px",
} as const;

export function staggerFromStart(intervalSeconds: number) {
  return stagger(intervalSeconds, { from: "start" as StaggerOrigin });
}

/** Brandbook `--dt-easing-flow` — the single curve used for every section entrance. */
export const flowEasing = [0.4, 0, 0.2, 1] as const;

/** Standard section-entrance timing (headers, single blocks). */
export const motionEnter = {
  duration: 0.7,
  easing: flowEasing,
};

/** Slightly quicker — nested/secondary elements inside an already-revealed section. */
export const motionEnterFast = {
  duration: 0.5,
  easing: flowEasing,
};
