/**
 * Shared Motion presets for landing sections — one place for timings, easing,
 * and in-view margins so section scripts stay small and consistent.
 *
 * Hero (`Hero.astro`) uses a local `heroAnimate` cast: Motion’s typings reject
 * `transform: "none"` on string selectors even though the runtime supports it.
 */
import { stagger, type StaggerOrigin } from "motion";

/** Default margin passed to `inView` so reveals trigger slightly before the section hits center. */
export const inViewMargin = {
  section: "-60px 0px 0px 0px",
  socialProof: "-40px 0px 0px 0px",
} as const;

/** Fresh object each call — avoids `readonly` / overload issues with Motion’s `animate` in Astro scripts. */
export function fadeUpReveal() {
  return { opacity: 1, transform: "none" };
}

/** Keyframe entrance from below (e.g. company section stagger). */
export function fadeUpKeyframes() {
  return { opacity: [0, 1], transform: ["translateY(1rem)", "none"] };
}

export function staggerFromStart(intervalSeconds: number) {
  return stagger(intervalSeconds, { from: "start" as StaggerOrigin });
}

/** Tactile entrance — use with Motion `animate(..., { ...springSnappy })`. */
export const springSnappy = {
  type: "spring" as const,
  stiffness: 380,
  damping: 26,
  mass: 0.85,
};

export const springSoft = {
  type: "spring" as const,
  stiffness: 260,
  damping: 22,
  mass: 1,
};
