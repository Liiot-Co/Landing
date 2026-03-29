/**
 * Shared styles for the primary CTA (same look as FinalCTA section button).
 * Keep in sync with `FinalCTAButton.astro`.
 */
export const finalCtaButtonBase =
  "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[color-mix(in_oklch,var(--primary)_85%,black)] overflow-hidden group cta-button-accent transition-all duration-300";

const shadowLg =
  "shadow-lg shadow-[color-mix(in_oklch,var(--primary)_30%,transparent)]";
const shadowXl =
  "shadow-xl shadow-[color-mix(in_oklch,var(--primary)_30%,transparent)]";

export const finalCtaButtonSizeClasses = {
  /** FinalCTA card — large */
  section: `relative px-14 py-8 text-xl font-semibold rounded-xl ${shadowXl}`,
  /** Hero */
  hero: `relative px-12 py-7 text-lg font-semibold rounded-xl ${shadowXl}`,
  /** Full-width form submit */
  form: `relative w-full px-8 py-6 text-lg font-semibold rounded-xl ${shadowXl}`,
  /** Scroll-follow widget link */
  widget: `relative w-full py-5 text-base font-semibold rounded-md ${shadowLg} inline-flex items-center justify-center gap-2`,
  /** Product spotlight */
  spotlight: `relative px-6 py-3 text-base font-semibold rounded-md ${shadowLg} w-full sm:w-auto inline-flex items-center justify-center gap-2`,
  /** Products hero — no arrow */
  compact: `relative inline-flex items-center justify-center px-8 h-12 text-lg font-bold rounded-lg ${shadowLg}`,
} as const;

export type FinalCtaButtonSize = keyof typeof finalCtaButtonSizeClasses;

/** For client-side HTML in ScrollFollowWidget (must match `size="widget"`). */
export const FINAL_CTA_WIDGET_ANCHOR_CLASS = `${finalCtaButtonBase} ${finalCtaButtonSizeClasses.widget}`;
