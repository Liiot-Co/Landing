/**
 * Primary CTA — Luxury structure for dark, volumetric styling.
 */

export const finalCtaButtonBase =
  "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap " +
  "font-semibold tracking-wide text-white rounded-xl outline-none " +
  // Crisp glass-like inner ring to catch the "light"
  "ring-1 ring-inset ring-white/20 " +
  // Deep resting shadow + subtle white inner top-highlight
  "shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_20px_-8px_rgba(0,0,0,0.6)] " +
  // Smooth unified transition for the button structure
  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  // Hover: Lift slightly and bloom the drop shadow with the primary color
  "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_16px_32px_-12px_color-mix(in_oklab,var(--color-primary)_60%,transparent)] " +
  // Active: Snappy micro-press
  "active:scale-[0.98] active:translate-y-0 " +
  "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background dark:focus-visible:ring-offset-background";

export const finalCtaButtonSizeClasses = {
  section: "px-12 py-6 text-lg rounded-xl",
  hero: "px-10 py-5 text-base rounded-xl",
  form: "w-full px-8 py-4 text-base rounded-xl",
  widget:
    "w-full py-4 text-sm rounded-xl inline-flex items-center justify-center gap-2",
  spotlight:
    "px-6 py-3 text-sm rounded-xl w-full sm:w-auto inline-flex items-center justify-center gap-2",
  compact: "inline-flex items-center justify-center px-6 h-11 text-sm rounded-lg",
} as const;

export type FinalCtaButtonSize = keyof typeof finalCtaButtonSizeClasses;

export const FINAL_CTA_WIDGET_ANCHOR_CLASS = `${finalCtaButtonBase} ${finalCtaButtonSizeClasses.widget}`;