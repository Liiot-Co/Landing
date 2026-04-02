/**
 * Shared styles for the button CTA.
 * Keep in sync with `FinalCTAButton.astro`.
 */

// 1. Fluid Background: We use a gradient that is 300% wide. On hover, we pan it from left to right.
// 2. Micro-scale: Reduced to a barely-there 1.01 scale so it feels sturdy, not bouncy.
// 3. Inner Glass Ring: `ring-1 ring-inset` creates a sharp, premium edge.
export const finalCtaButtonBase =
  "relative overflow-hidden group transition-all duration-700 ease-out hover:scale-[1.01] active:scale-[0.99] text-[var(--primary-foreground)] " +
  "bg-gradient-to-r from-[color-mix(in_oklch,var(--accent)_90%,black)] via-[color-mix(in_oklch,var(--accent)_70%,black)] to-[color-mix(in_oklch,var(--accent)_90%,black)] " +
  "bg-[length:300%_100%] bg-left hover:bg-right " +
  "ring-1 ring-inset ring-white/5 hover:ring-white/20";

// Shadows are completely minimized to a tiny ambient blur, letting the button's internal light do the work.
const ambientShadow = "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.2)]";

export const finalCtaButtonSizeClasses = {
  section: `px-14 py-8 text-xl font-semibold rounded-xl ${ambientShadow}`,
  hero: `px-12 py-7 text-lg font-semibold rounded-xl ${ambientShadow}`,
  form: `w-full px-8 py-6 text-lg font-semibold rounded-xl ${ambientShadow}`,
  widget: `w-full py-5 text-base font-semibold rounded-md ${ambientShadow} inline-flex items-center justify-center gap-2`,
  spotlight: `px-6 py-3 text-base font-semibold rounded-md ${ambientShadow} w-full sm:w-auto inline-flex items-center justify-center gap-2`,
  compact: `inline-flex items-center justify-center px-8 h-12 text-lg font-bold rounded-lg ${ambientShadow}`,
} as const;

export type FinalCtaButtonSize = keyof typeof finalCtaButtonSizeClasses;

export const FINAL_CTA_WIDGET_ANCHOR_CLASS = `${finalCtaButtonBase} ${finalCtaButtonSizeClasses.widget}`;