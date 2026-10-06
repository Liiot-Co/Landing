/**
 * LiiotMark SVG morph — each click morphs the 4 isotype pieces
 * (`.liiot-path`) INDEPENDENTLY into their own geometric figure
 * (circle/square/triangle/diamond), each with its own brand color.
 * Cycles: logo → figuras → contraste → logo. Pieces never borrow
 * another piece's shape or position — each one only interpolates
 * between its own original `d` and its own figure variants.
 *
 * Uses flubber for per-path interpolation.
 * The component (LiiotMarkAnimated.astro) emits the DOM; this script
 * wires up click handlers on every .liiot-mark on the page.
 */
import { interpolate } from "flubber";
import { initBoops } from "./liiot-boop";
import { burst } from "./liiot-burst";

const MORPH_DURATION = 340;
const LABEL_FADE = 300;
/** Stagger entre piezas al animar un morph, para que no se vean como una
 *  sola unidad (especificación ODD: 40-60ms). */
const PIECE_STAGGER_MS = 35;

interface PieceFigure {
  /** `d` del path de la figura, ya posicionado dentro del viewBox 48x48
   *  en el área que ocupa esa pieza en el isotipo original. */
  d: string;
  color: string;
}

interface PieceMorphState {
  label: string;
  /** Una entrada por pieza, en el mismo orden que `.liiot-path--1..4`. */
  pieces: PieceFigure[];
}

/**
 * Figuras geométricas por pieza, precalculadas una sola vez (no por frame)
 * a partir del centro/radio real de cada pieza en el isotipo original:
 * cada pieza recorre figuras propias que ninguna otra pieza usa
 * (1: círculo → hexágono, 2: cuadrado → estrella, 3: triángulo → cruz,
 * 4: rombo → pentágono), así nunca parece convertirse en otra pieza.
 */
const PIECE_MORPH_STATES: PieceMorphState[] = [
  {
    label: "figuras",
    pieces: [
      {
        // piece 1 → círculo
        d: "M10.04,29.98 C10.04,34.4 13.62,37.98 18.04,37.98 C22.46,37.98 26.04,34.4 26.04,29.98 C26.04,25.56 22.46,21.98 18.04,21.98 C13.62,21.98 10.04,25.56 10.04,29.98 Z",
        color: "#5A228B",
      },
      {
        // piece 2 → cuadrado
        d: "M22.21,9.93 L38.21,9.93 L38.21,25.93 L22.21,25.93 Z",
        color: "#FF6A33",
      },
      {
        // piece 3 → triángulo
        d: "M30.21,36.81 L34.54,44.31 L25.88,44.31 Z",
        color: "#e04b66",
      },
      {
        // piece 4 → rombo
        d: "M18.04,1.11 L23.04,6.11 L18.04,11.11 L13.04,6.11 Z",
        color: "#e2b31c",
      },
    ],
  },
  {
    label: "contraste",
    pieces: [
      {
        // piece 1 → hexágono
        d: "M26.54,29.98 L22.29,37.34 L13.79,37.34 L9.54,29.98 L13.79,22.62 L22.29,22.62 Z",
        color: "#8B45CC",
      },
      {
        // piece 2 → estrella
        d: "M30.21,8.93 L32.59,14.65 L38.77,15.15 L34.06,19.18 L35.5,25.21 L30.21,21.98 L24.92,25.21 L26.36,19.18 L21.65,15.15 L27.83,14.65 Z",
        color: "#e2b31c",
      },
      {
        // piece 3 → cruz
        d: "M28.41,36.81 L32.01,36.81 L32.01,40.01 L35.21,40.01 L35.21,43.61 L32.01,43.61 L32.01,46.81 L28.41,46.81 L28.41,43.61 L25.21,43.61 L25.21,40.01 L28.41,40.01 Z",
        color: "#FF6A33",
      },
      {
        // piece 4 → pentágono
        d: "M18.04,0.81 L23.08,4.47 L21.16,10.4 L14.92,10.4 L13,4.47 Z",
        color: "#e04b66",
      },
    ],
  },
];

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

/**
 * Las chispas salen DESPUÉS del morph: se espera al siguiente frame para que la
 * forma final ya esté pintada antes de emitirlas (nunca durante la transición).
 */
function burstAfterPaint(host: HTMLElement) {
  requestAnimationFrame(() => burst(host));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Chequeo en vivo (el usuario puede togglear la preferencia en sesión). */
function isReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Anima el atributo `d` de un path entre dos formas con flubber,
 * interpolando el fill en paralelo. Parametrizado por path + estados para
 * reutilizarlo tanto en el logo completo como en las piezas editoriales
 * (medallones de headings y fondo de HowWeWork).
 */
function animatePathD(
  path: SVGPathElement,
  fromD: string,
  toD: string,
  fromColor: string,
  toColor: string,
  duration: number,
  cb?: () => void,
) {
  if (isReducedMotion()) {
    path.setAttribute("d", toD);
    path.style.fill = toColor;
    cb?.();
    return;
  }

  let interpolator: ((t: number) => string) | null = null;
  try {
    interpolator = interpolate(fromD, toD, { maxSegmentLength: 2 });
  } catch {
    interpolator = null;
  }

  const start = performance.now();
  path.setAttribute("d", fromD);
  path.style.fill = fromColor;

  function tick(now: number) {
    const elapsed = now - start;
    const raw = Math.min(elapsed / duration, 1);
    const t = easeInOutCubic(raw);

    if (interpolator) {
      path.setAttribute("d", interpolator(t));
    }
    path.style.fill = lerpColor(fromColor, toColor, t);

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      cb?.();
    }
  }
  requestAnimationFrame(tick);
}

/**
 * Anima las 4 piezas EN PARALELO pero con un leve stagger (cada una
 * interpola su propio `d`, nunca el de otra pieza), y dispara `cb` una
 * vez que las 4 terminaron. Reduced-motion resuelve sin stagger: como
 * `animatePathD` llama a `cb` de forma síncrona en ese modo, el contador
 * de pendientes llega a 0 en la misma vuelta sin necesitar una rama aparte.
 */
function animatePieces(
  paths: SVGPathElement[],
  fromDs: string[],
  toFigures: PieceFigure[],
  fromColors: string[],
  duration: number,
  cb: () => void,
) {
  let pending = paths.length;
  const reduced = isReducedMotion();

  paths.forEach((path, i) => {
    const run = () => {
      animatePathD(
        path,
        fromDs[i],
        toFigures[i].d,
        fromColors[i],
        toFigures[i].color,
        duration,
        () => {
          pending -= 1;
          if (pending === 0) cb();
        },
      );
    };
    if (reduced) {
      run();
    } else {
      setTimeout(run, i * PIECE_STAGGER_MS);
    }
  });
}

/** Fixed phase offsets for the4 paths in the helix — they never change,
 *  so the form at any mouse position is deterministic. */
const HELIX_PHASES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

function initMark(svg: SVGElement) {
  const originalFill = (svg as HTMLElement).dataset.fill || "#8B45CC";
  const label = svg.querySelector<SVGTextElement>(".liiot-label")!;
  const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".liiot-path"));
  /** `d` original de cada pieza, leído del DOM (misma fuente que usan los
   *  medallones editoriales), para poder volver a él al cerrar el ciclo. */
  const originalDs = paths.map((p) => p.getAttribute("d") ?? "");

  let currentState = -1;
  let isAnimating = false;

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
    // Hélice DNA solo en Navbar: el logo de Footer y los medallones usan
    // boop (gsap) en su lugar. Dos escritores sobre el mismo nodo/trigger
    // pelearían por el transform en cada mousemove, así que se elige uno
    // por instancia: header → hélice, resto → boop.
    if (!svg.closest("header")) return;
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

  /** Burst confinado al contenedor del logo. Solo se llama cuando el morph ya terminó. */
  function burstOnHost() {
    const host = svg.parentElement;
    if (host) burstAfterPaint(host);
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
    hideLabel();

    const nextIdx = (currentState + 1) % PIECE_MORPH_STATES.length;
    const next = PIECE_MORPH_STATES[nextIdx];

    // Logo → first state: from each piece's own original `d`/fill.
    // State → next state: from each piece's own current figure/color.
    const fromDs =
      currentState === -1
        ? originalDs
        : PIECE_MORPH_STATES[currentState].pieces.map((f) => f.d);
    const fromColors =
      currentState === -1
        ? paths.map(() => originalFill)
        : PIECE_MORPH_STATES[currentState].pieces.map((f) => f.color);

    animatePieces(paths, fromDs, next.pieces, fromColors, MORPH_DURATION, () => {
      // Representative label color: first piece of the new state.
      showLabel(next.label, next.pieces[0].color);
      currentState = nextIdx;
      isAnimating = false;
      burstOnHost();

      // After the last state, auto-return to the original logo.
      if (nextIdx === PIECE_MORPH_STATES.length - 1) {
        setTimeout(returnToLogo, 1200);
      }
    });
  }

  function returnToLogo() {
    if (isAnimating || currentState === -1) return;
    isAnimating = true;
    hideLabel();

    const current = PIECE_MORPH_STATES[currentState];
    const fromDs = current.pieces.map((f) => f.d);
    const fromColors = current.pieces.map((f) => f.color);
    const toFigures: PieceFigure[] = originalDs.map((d) => ({
      d,
      color: originalFill,
    }));

    animatePieces(paths, fromDs, toFigures, fromColors, MORPH_DURATION, () => {
      currentState = -1;
      isAnimating = false;
      svg.classList.remove("is-morphing");
      burstOnHost();
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

// ── L3: morph en piezas editoriales (medallones de headings + fondo) ──

interface TinyState {
  color: string;
  d: string;
}

/**
 * Figuras de marca (círculo, cuadrado, triángulo, rombo), centradas en el
 * viewBox 48×48 y cada una con su color. Las piezas editoriales NUNCA se
 * transforman en otra pieza del isotipo: pasan de su forma original a estas
 * figuras, que son el lenguaje geométrico de Liiot (las mismas del morph del
 * logo completo).
 */
const TINY_STATES: TinyState[] = [
  {
    color: "#8B45CC",
    d: "M8,24 C8,15.16 15.16,8 24,8 C32.84,8 40,15.16 40,24 C40,32.84 32.84,40 24,40 C15.16,40 8,32.84 8,24 Z",
  },
  {
    color: "#FF6A33",
    d: "M9,9 L39,9 L39,39 L9,39 Z",
  },
  {
    color: "#e04b66",
    d: "M24,6 L43,40 L5,40 Z",
  },
  {
    color: "#e2b31c",
    d: "M24,4 L44,24 L24,44 L4,24 Z",
  },
];

/**
 * Click en una pieza editorial cicla las figuras de marca (multicolor) + burst.
 * Cada pieza arranca en una figura distinta (según su posición en la página)
 * para que varias piezas juntas no muestren la misma figura a la vez.
 * Solo anima el atributo `d`: el parallax del fondo escribe únicamente
 * `style.transform` en el contenedor, así no hay pelea de escritores.
 * Las piezas siguen `aria-hidden` y no son focusables (mouse-only).
 */
function initEditorialPiece(el: HTMLElement, order = 0) {
  if (el.dataset.morphWired === "true") return;
  el.dataset.morphWired = "true";

  const paths = Array.from(el.querySelectorAll<SVGPathElement>("path"));
  if (paths.length === 0) return;

  const originalDs = paths.map((p) => p.getAttribute("d") ?? "");
  const baseColor = el.dataset.color || "#FFFFFF";
  let idx = -1;
  let busy = false;

  el.addEventListener("click", () => {
    if (busy) return;
    const nextIdx = idx === -1 ? order % TINY_STATES.length : (idx + 1) % TINY_STATES.length;
    const next = TINY_STATES[nextIdx];
    const fromColor = idx === -1 ? baseColor : TINY_STATES[idx].color;

    if (isReducedMotion()) {
      paths.forEach((p) => {
        p.setAttribute("d", next.d);
        p.style.fill = next.color;
      });
      idx = nextIdx;
      return;
    }

    busy = true;
    let pending = paths.length;
    paths.forEach((p, i) => {
      const fromD = idx === -1 ? originalDs[i] : TINY_STATES[idx].d;
      animatePathD(p, fromD, next.d, fromColor, next.color, MORPH_DURATION, () => {
        pending -= 1;
        if (pending === 0) {
          idx = nextIdx;
          busy = false;
          burstAfterPaint(el);
        }
      });
    });
  });
}

export function initEditorialMorphs(scope: ParentNode = document) {
  scope
    .querySelectorAll<HTMLElement>(".js-morph-piece")
    .forEach((el, i) => initEditorialPiece(el, i));
}

// Auto-init on page load (Astro)
function initLiiotInteractions() {
  initLiiotMarks();
  initEditorialMorphs();
  initBoops(document, ".js-boop", (_el, i) => ({
    rotation: i % 2 === 0 ? 6 : -6,
  }));
}

if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", initLiiotInteractions);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initLiiotInteractions();
  } else {
    document.addEventListener("DOMContentLoaded", initLiiotInteractions);
  }
}
