/**
 * Sets --mx / --my for radial border highlights on reusable card surfaces.
 */

export const MOUSE_BORDER_SELECTOR = ".landing-card";
function setCoords(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${clientX - r.left}px`);
  el.style.setProperty("--my", `${clientY - r.top}px`);
}

function clearCoords(el: HTMLElement) {
  el.style.removeProperty("--mx");
  el.style.removeProperty("--my");
}

function init() {
  const nodes = document.querySelectorAll<HTMLElement>(MOUSE_BORDER_SELECTOR);
  for (const el of nodes) {
    el.addEventListener(
      "pointermove",
      (e) => {
        setCoords(el, e.clientX, e.clientY);
      },
      { passive: true },
    );
    el.addEventListener("pointerleave", () => clearCoords(el));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
