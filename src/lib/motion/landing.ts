/**
 * Shared GSAP presets for landing sections — one place for timings, easing,
 * and ScrollTrigger start points so section scripts stay small and consistent.
 *
 * Every section entrance uses the SAME easing curve (`--dt-easing-flow` from
 * the brandbook) so scrolling through the page reads as one continuous motion
 * language instead of a different "feel" per section.
 */
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

/**
 * Brandbook `--dt-easing-flow` (`cubic-bezier(0.4, 0, 0.2, 1)`), registered once
 * as a named GSAP ease so every tween in the file references the exact curve.
 */
export const flowEase = CustomEase.create("flow", "M0,0 C0.4,0 0.2,1 1,1");

/** ScrollTrigger `start` values — when a section's reveal fires as it scrolls in. */
export const triggerStart = {
  section: "top 88%",
  philosophy: "top 65%",
  footer: "top 95%",
} as const;

/** Standard section-entrance timing (headers, single blocks). */
export const motionEnter = {
  duration: 0.7,
  ease: flowEase,
};

/** Slightly quicker — nested/secondary elements inside an already-revealed section. */
export const motionEnterFast = {
  duration: 0.5,
  ease: flowEase,
};

/** GSAP `stagger` config shared by every revealed group (cards, list items, words). */
export function staggerFromStart(each: number, extra: Record<string, unknown> = {}) {
  return { each, from: "start" as const, ...extra };
}
