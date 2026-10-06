/**
 * Liiot burst — ráfaga de partículas confinada al wrapper (vanilla + CSS).
 *
 * Traduce la técnica "partículas-3" de
 * joshwcomeau.com/blog/whimsical-animations/#particles-3 a nodos DOM:
 * cada partícula es un `<span>` con vars `--angle/--distance/--size` y el
 * keyframe `liiot-fling-away` usa `cos()/sin()` para emitir en 360° (radial,
 * no cono) con jitter por partícula y color de marca inline.
 *
 * Restricciones de perf (estrictas):
 * - Burst de 8-14 nodos, vida <1s, `animationend → remove()` + fallback
 *   por timeout (GC estricto, cero nodos huérfanos).
 * - Cap concurrente por wrapper: si se supera, el burst se SUPRIME
 *   (no se encola).
 * - Se suprime (no se encola) si: `prefers-reduced-motion`, scrub de
 *   filosofía activo (`filosofia-scrub`, mismo CustomEvent que escucha
 *   FilosofiaBackground), `document.hidden`, o wrapper fuera de viewport
 *   (IntersectionObserver creado por llamada y desconectado tras el
 *   primer callback).
 */

export interface BurstOptions {
  /** Nodos del burst. Default: aleatorio 8-14. Siempre capado a 14. */
  count?: number;
  /** Punto de emisión en px relativo al wrapper. Default: el centro del wrapper. */
  origin?: { x: number; y: number };
}

const MIN_COUNT = 8;
const MAX_COUNT = 14;
const MAX_CONCURRENT_PER_WRAPPER = 28;
/** Jitter por partícula en grados, aplicado sobre el ángulo radial (360°/count). */
const RADIAL_JITTER_DEG = 18;
/** GC fallback por si `animationend` no dispara (pestaña oculta a mitad, etc). */
const GC_FALLBACK_MS = 1500;
/** Paleta de marca Liiot — cada partícula toma un color al azar de aquí. */
const BRAND_COLORS = ["#5A228B", "#8B45CC", "#FF6A33", "#e2b31c", "#e04b66"];

function isReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Scrub de filosofía: mismo CustomEvent que escucha FilosofiaBackground. */
let filosofiaScrubActive = false;
if (typeof window !== "undefined") {
  window.addEventListener("filosofia-scrub", (e: Event) => {
    filosofiaScrubActive =
      (e as CustomEvent<{ active: boolean }>).detail?.active ?? false;
  });
}

let stylesInjected = false;

function ensureBurstStyles(): void {
  if (stylesInjected || typeof document === "undefined") return;
  if (document.getElementById("liiot-burst-styles")) {
    stylesInjected = true;
    return;
  }
  const style = document.createElement("style");
  style.id = "liiot-burst-styles";
  style.textContent = `
.liiot-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size, 6px);
  height: var(--size, 6px);
  border-radius: 9999px;
  background: currentColor; /* fallback; cada partícula fija su color inline */
  pointer-events: none;
  z-index: 5;
  opacity: 0;
  animation-name: liiot-fling-away;
  animation-timing-function: cubic-bezier(0.15, 0.85, 0.45, 1);
  animation-fill-mode: forwards;
}
@keyframes liiot-fling-away {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(
      calc(-50% + cos(var(--angle)) * var(--distance)),
      calc(-50% + sin(var(--angle)) * var(--distance))
    ) scale(0.25);
  }
}
@media (prefers-reduced-motion: reduce) {
  .liiot-particle {
    animation: none;
    display: none;
  }
}`;
  document.head.appendChild(style);
  stylesInjected = true;
}

function spawnParticles(
  wrapper: HTMLElement,
  count: number,
  origin?: { x: number; y: number },
): void {
  ensureBurstStyles();
  if (window.getComputedStyle(wrapper).position === "static") {
    wrapper.style.position = "relative";
  }

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "liiot-particle";
    p.setAttribute("aria-hidden", "true");

    // Emisión radial 360°: base uniforme (i/count) + jitter para que no
    // se vea como un patrón perfecto de rueda de carro.
    const angle =
      (i / count) * 360 + (Math.random() - 0.5) * RADIAL_JITTER_DEG;
    const distance = 44 + Math.random() * 52;
    const size = 4 + Math.random() * 4;
    const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];

    if (origin) {
      p.style.left = `${origin.x.toFixed(1)}px`;
      p.style.top = `${origin.y.toFixed(1)}px`;
    }
    p.style.setProperty("--angle", `${angle.toFixed(1)}deg`);
    p.style.setProperty("--distance", `${distance.toFixed(1)}px`);
    p.style.setProperty("--size", `${size.toFixed(1)}px`);
    p.style.background = color;
    p.style.animationDuration = `${(0.45 + Math.random() * 0.4).toFixed(2)}s`;
    p.style.animationDelay = `${(Math.random() * 0.08).toFixed(2)}s`;

    const remove = () => p.remove();
    p.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, GC_FALLBACK_MS);

    wrapper.appendChild(p);
  }
}

/**
 * Emite un burst confinado a `wrapper`. Cualquiera de estas condiciones
 * lo SUPRIME por completo: reduced-motion, `filosofia-scrub` activo,
 * `document.hidden`, wrapper fuera de viewport, o cap concurrente excedido.
 */
export function burst(
  wrapper: HTMLElement | null | undefined,
  options: BurstOptions = {},
): void {
  if (!wrapper || typeof document === "undefined") return;
  if (isReducedMotion()) return;
  if (filosofiaScrubActive) return;
  if (document.hidden) return;

  const requested =
    options.count ??
    (MIN_COUNT + Math.floor(Math.random() * (MAX_COUNT - MIN_COUNT + 1)));
  const count = Math.max(1, Math.min(requested, MAX_COUNT));

  const concurrent = wrapper.querySelectorAll(":scope > .liiot-particle").length;
  if (concurrent + count > MAX_CONCURRENT_PER_WRAPPER) return;

  if (typeof IntersectionObserver === "undefined") {
    spawnParticles(wrapper, count, options.origin);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    obs.disconnect();
    if (entries[0]?.isIntersecting) spawnParticles(wrapper, count, options.origin);
  });
  io.observe(wrapper);
}
