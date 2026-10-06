/**
 * Liiot boop — micro-interacción de hover juguetona (vanilla + gsap).
 *
 * Traduce joshwcomeau.com/react/boop/ a Astro + vanilla: un "override" breve
 * que se auto-revierte tras `timing` ms. Trigger y nodo animado están
 * desacoplados (mouseenter vía `initBoops`, sin atar a :focus ni :hover CSS),
 * así el boop puede vivir en un hijo wrapper mientras el parallax/morph
 * escriben en otro nodo sin pelear por el mismo `transform`.
 *
 * - `prefers-reduced-motion` = salida total (ni ida ni vuelta animan).
 * - Las piezas decorativas siguen `aria-hidden`; los medallones no son
 *   focusables (criterio boop: no atar triggers a focus).
 * - Sin asignaciones por frame: un tween de ida + uno de vuelta por boop.
 */

import { gsap } from "gsap";

export interface BoopConfig {
  /** Desplazamiento horizontal en px (default 0). */
  x?: number;
  /** Desplazamiento vertical en px (default -8). */
  y?: number;
  /** Rotación en grados (default 6). */
  rotation?: number;
  /** Escala pico (default 1.12). */
  scale?: number;
  /** Ms en el pico antes de auto-revertir (default 150). */
  timing?: number;
}

const BOOP_DURATION = 0.35;

function isReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Revert-timers por nodo: un re-hover reinicia el ciclo en vez de apilarlo. */
const revertTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

/**
 * Dispara un boop en `el`: ida con `back.out(2)` y vuelta a la identidad
 * tras `timing` ms. El reposo final es idéntico al inicial.
 */
export function boop(el: HTMLElement | SVGElement, config: BoopConfig = {}): void {
  if (typeof window === "undefined" || isReducedMotion()) return;

  const { x = 0, y = -8, rotation = 6, scale = 1.12, timing = 150 } = config;

  const pending = revertTimers.get(el);
  if (pending) clearTimeout(pending);
  gsap.killTweensOf(el);

  gsap.to(el, {
    x,
    y,
    rotation,
    scale,
    duration: BOOP_DURATION,
    ease: "back.out(2)",
    overwrite: "auto",
  });

  revertTimers.set(
    el,
    setTimeout(() => {
      revertTimers.delete(el);
      if (isReducedMotion()) {
        gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 });
        return;
      }
      gsap.to(el, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: BOOP_DURATION,
        ease: "power2.out",
        overwrite: "auto",
      });
    }, timing),
  );
}

/**
 * Cablea `mouseenter → boop` en cada nodo del selector dentro de `scope`.
 * `configPorNodo` permite variar el boop por instancia (p. ej. rotación
 * alternada). Idempotente vía `data-boop-wired` (doble-guard Astro safe).
 */
export function initBoops(
  scope: ParentNode = document,
  selector = ".js-boop",
  configPorNodo?: (el: HTMLElement, index: number) => BoopConfig | undefined,
): void {
  if (typeof document === "undefined") return;

  scope.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
    if (el.dataset.boopWired === "true") return;
    el.dataset.boopWired = "true";
    const perNode = configPorNodo?.(el, i);
    el.addEventListener("mouseenter", () => boop(el, perNode ?? {}));
  });
}
