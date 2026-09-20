/**
 * LiiotMark SVG morph — each click cycles the logo through brand values:
 * futuro → soluciones → propósito → impacto → comunidad → confianza → logo
 *
 * Uses flubber for path interpolation and GSAP for crossfade.
 * The component (LiiotMarkAnimated.astro) emits the DOM; this script
 * wires up click handlers on every .liiot-mark on the page.
 */
import { interpolate } from "flubber";
import { gsap } from "gsap";

const MORPH_DURATION = 500;
const LABEL_FADE = 300;

interface MorphState {
  label: string;
  color: string;
  d: string;
}

const MORPH_STATES: MorphState[] = [
  {
    label: "futuro",
    color: "#FF6A33",
    d: "M24,4 L42,36 Q42,44 24,44 Q6,44 6,36 Z",
  },
  {
    label: "soluciones",
    color: "#8B45CC",
    d: "M24,4 L40,14 L40,34 L24,44 L8,34 L8,14 Z",
  },
  {
    label: "propósito",
    color: "#FF4D6D",
    d: "M24,40 C14,32 2,24 2,14 C2,6 8,2 14,2 C18,2 22,5 24,9 C26,5 30,2 34,2 C40,2 46,6 46,14 C46,24 34,32 24,40 Z",
  },
  {
    label: "impacto",
    color: "#FFC300",
    d: "M24,2 L29,17 L46,17 L32,27 L37,44 L24,34 L11,44 L16,27 L2,17 L19,17 Z",
  },
  {
    label: "comunidad",
    color: "#FF6A33",
    d: "M24,6 C32,6 38,12 38,20 C38,28 32,34 24,34 C16,34 10,28 10,20 C10,12 16,6 24,6 M24,14 C28,14 31,17 31,21 C31,25 28,28 24,28 C20,28 17,25 17,21 C17,17 20,14 24,14",
  },
  {
    label: "confianza",
    color: "#FF4D6D",
    d: "M24,2 L40,10 L40,24 C40,34 32,42 24,46 C16,42 8,34 8,24 L8,10 Z",
  },
];

const LOGO_D =
  "M23.61,40.54l.03-26.58c0-1.17-1.33-1.84-2.26-1.14-2.77,2.1-5.53,4.2-8.3,6.3-.35.27-.56.68-.56,1.13-.03,8.58-.06,17.16-.09,25.74,0,1.13,1.24,1.81,2.18,1.2,2.79-1.82,5.57-3.64,8.36-5.45.4-.26.64-.71.64-1.19" +
  " M24.64,7.37l-.03,26.58c0,1.17,1.33,1.84,2.26,1.14,2.77-2.1,5.53-4.2,8.3-6.3.35-.27.56-.68.56-1.13.03-8.58.06-17.16.09-25.74,0-1.13-1.24-1.81-2.18-1.2-2.79,1.82-5.57,3.64-8.36,5.45-.4.26-.64.71-.64,1.19" +
  " M35.73,41.84c0,2.93-2.41,5.31-5.39,5.31s-5.65-2.49-5.65-5.56v-5.12h5.58c3.02,0,5.47,2.41,5.47,5.38" +
  " M12.52,6.08c0-2.93,2.41-5.31,5.39-5.31s5.65,2.49,5.65,5.56v5.12h-5.58c-3.02,0-5.47-2.41-5.47-5.38";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return "#" + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Fixed phase offsets for the4 paths in the helix — they never change,
 *  so the form at any mouse position is deterministic. */
const HELIX_PHASES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

function initMark(svg: SVGElement) {
  const originalFill = (svg as HTMLElement).dataset.fill || "#8B45CC";
  const originalGroup = svg.querySelector<SVGGElement>(".liiot-original")!;
  const morphPath = svg.querySelector<SVGPathElement>(".liiot-morph-path")!;
  const label = svg.querySelector<SVGTextElement>(".liiot-label")!;
  const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".liiot-path"));

  let currentState = -1;
  let isAnimating = false;
  let currentInterpolator: ((t: number) => string) | null = null;

  // ── DNA helix mouse-tracking ──
  let helixRaf: number | null = null;
  let helixActive = false;
  let mx = 0;
  let my = 0;

  function helixTick() {
    if (!helixActive || currentState !== -1) return;

    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = (mx - cx) / (r.width / 2);  // -1..1
    const ny = (my - cy) / (r.height / 2);

    const helixAngle = nx * Math.PI;
    const spread = 0.6 + Math.abs(ny) * 0.5;

    paths.forEach((p, i) => {
      const angle = helixAngle + HELIX_PHASES[i];
      const hx = Math.sin(angle) * 14 * spread;
      const hy = Math.cos(angle) * 10 * spread;
      const zDepth = 0.75 + Math.cos(angle) * 0.25;
      const rotZ = Math.sin(angle) * 25 * spread;

      p.style.transform =
        `translate(${hx}px, ${hy}px) rotate(${rotZ}deg) scale(${zDepth})`;
      p.style.opacity = String(0.6 + zDepth * 0.4);
    });

    helixRaf = requestAnimationFrame(helixTick);
  }

  function helixStart(e: MouseEvent) {
    if (prefersReduced || isAnimating || currentState !== -1) return;
    mx = e.clientX;
    my = e.clientY;
    helixActive = true;
    svg.classList.add("is-helixing");
    if (helixRaf) cancelAnimationFrame(helixRaf);
    helixRaf = requestAnimationFrame(helixTick);
  }

  function helixMove(e: MouseEvent) {
    mx = e.clientX;
    my = e.clientY;
  }

  function helixStop() {
    helixActive = false;
    svg.classList.remove("is-helixing");
    if (helixRaf) cancelAnimationFrame(helixRaf);
    helixRaf = null;
    // Smoothly reset paths back to origin
    paths.forEach((p) => {
      p.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease";
      p.style.transform = "";
      p.style.opacity = "";
    });
    // Remove transition after it completes so morph animations aren't affected
    setTimeout(() => {
      paths.forEach((p) => {
        p.style.transition = "";
      });
    }, 420);
  }

  svg.addEventListener("mouseenter", helixStart);
  svg.addEventListener("mousemove", helixMove);
  svg.addEventListener("mouseleave", helixStop);

  function animateMorph(
    fromD: string,
    toD: string,
    fromColor: string,
    toColor: string,
    duration: number,
    cb?: () => void,
  ) {
    if (prefersReduced) {
      morphPath.setAttribute("d", toD);
      morphPath.style.fill = toColor;
      cb?.();
      return;
    }

    const start = performance.now();
    morphPath.setAttribute("d", fromD);
    morphPath.style.fill = fromColor;

    function tick(now: number) {
      const elapsed = now - start;
      const raw = Math.min(elapsed / duration, 1);
      const t = easeInOutCubic(raw);

      if (currentInterpolator) {
        morphPath.setAttribute("d", currentInterpolator(t));
      }
      morphPath.style.fill = lerpColor(fromColor, toColor, t);

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        cb?.();
      }
    }
    requestAnimationFrame(tick);
  }

  function showLabel(text: string, color: string) {
    if (prefersReduced || !text) {
      label.setAttribute("opacity", "0");
      label.setAttribute("font-size", "0");
      return;
    }
    label.textContent = text;
    label.style.fill = color;
    label.setAttribute("opacity", "0.7");
    label.setAttribute("font-size", "4.5");
  }

  function hideLabel() {
    label.setAttribute("opacity", "0");
    label.setAttribute("font-size", "0");
  }

  function morph() {
    if (isAnimating) return;
    isAnimating = true;
    // Kill any active helix before morphing
    helixStop();
    svg.classList.add("is-morphing");

    const nextIdx = (currentState + 1) % MORPH_STATES.length;
    const next = MORPH_STATES[nextIdx];

    if (currentState === -1) {
      // Logo → first morph state
      currentInterpolator = interpolate(LOGO_D, next.d, {
        maxSegmentLength: 2,
      });

      gsap.to(originalGroup, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          originalGroup.style.display = "none";
          morphPath.style.opacity = "1";
          animateMorph(LOGO_D, next.d, originalFill, next.color, MORPH_DURATION, () => {
            showLabel(next.label, next.color);
            currentState = nextIdx;
            isAnimating = false;
          });
        },
      });
    } else {
      // Morph state → next morph state
      const current = MORPH_STATES[currentState];
      currentInterpolator = interpolate(current.d, next.d, {
        maxSegmentLength: 2,
      });

      hideLabel();
      animateMorph(current.d, next.d, current.color, next.color, MORPH_DURATION, () => {
        showLabel(next.label, next.color);
        currentState = nextIdx;
        isAnimating = false;

        // After the last state (confianza), auto-return to logo
        if (nextIdx === MORPH_STATES.length - 1) {
          setTimeout(returnToLogo, 1200);
        }
      });
    }
  }

  function returnToLogo() {
    if (isAnimating || currentState === -1) return;
    isAnimating = true;

    const current = MORPH_STATES[currentState];
    currentInterpolator = interpolate(current.d, LOGO_D, {
      maxSegmentLength: 2,
    });

    hideLabel();
    animateMorph(current.d, LOGO_D, current.color, originalFill, MORPH_DURATION, () => {
      morphPath.style.opacity = "0";
      originalGroup.style.display = "";
      gsap.to(originalGroup, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          currentState = -1;
          isAnimating = false;
          svg.classList.remove("is-morphing");
        },
      });
    });
  }

  svg.addEventListener("click", morph);
  svg.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      morph();
    }
  });
}

export function initLiiotMarks() {
  document.querySelectorAll<SVGElement>(".liiot-mark").forEach(initMark);
}

// Auto-init on page load (Astro)
if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", initLiiotMarks);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initLiiotMarks();
  } else {
    document.addEventListener("DOMContentLoaded", initLiiotMarks);
  }
}
