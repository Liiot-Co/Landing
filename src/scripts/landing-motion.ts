/**
 * Single entry for all landing scroll / entrance motion (one GSAP import graph).
 * Every section reveal shares the same easing curve (`flowEase`) so scrolling
 * through the page reads as one continuous, immersive motion language instead
 * of a different "feel" per section. Prefers `prefers-reduced-motion`: skip
 * animations and reveal content immediately.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  motionEnter,
  motionEnterFast,
  staggerFromStart,
  triggerStart,
} from "@/lib/motion/landing";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Evita que el pin de setupStory() se re-mida cuando la barra de
// direcciones del navegador móvil aparece/desaparece durante el scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

const INIT_ATTR = "data-landing-motion-init";

/** Standard "fade up" reveal — the one entrance pattern used sitewide. */
function reveal(selector: string, delay = 0, fast = false) {
  const preset = fast ? motionEnterFast : motionEnter;
  gsap.fromTo(
    selector,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: preset.duration, delay, ease: preset.ease, overwrite: "auto" }
  );
}

function revealGroup(elements: NodeListOf<Element> | Element[], each = 0.1) {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: motionEnter.duration,
      ease: motionEnter.ease,
      stagger: staggerFromStart(each),
      overwrite: "auto",
    }
  );
}

/** Fires `run` once, the first time `trigger` scrolls to `start` — the ScrollTrigger take on Motion's `inView`. */
function onSectionEnter(trigger: string, start: string, run: (element: Element) => void) {
  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: (self) => run(self.trigger as Element),
    onRefresh: (self) => {
      if (self.progress > 0) run(self.trigger as Element);
    },
  });
}


function applyReducedMotionStates() {
  const setBulk = (selector: string, styles: Record<string, string>) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      Object.assign(el.style, styles);
    });
  };

  setBulk(
    "#hero-title, #hero-body, #hero-cta, #hero-bg",
    { opacity: "1", transform: "none" },
  );

  setBulk(
    "#villain-header, #villain-pivot, #story-bridge, .js-villain-item, #how-header, #portfolio-header, #team-header, #footer-mark",
    { opacity: "1", transform: "translateY(0px)" },
  );
  setBulk(".js-portfolio-item, .js-team-card", {
    opacity: "1",
    transform: "translateY(0px)",
  });

  const cta = document.getElementById("final-cta-card");
  if (cta) Object.assign(cta.style, { opacity: "1", transform: "none" });

  document.querySelectorAll<HTMLElement>(".js-phil-word").forEach((el) => {
    el.style.opacity = "1";
    el.style.filter = "blur(0px)";
    el.style.transform = "translateY(0px) scale(1)";
    el.style.willChange = "auto";
  });
}

function setupHero() {
  reveal("#hero-title", 0.1);
  reveal("#hero-body", 0.25, true);
  reveal("#hero-cta", 0.35, true);
}

/**
 * "El reto" → "Nuestra filosofía" as a cinematic diagonal wipe.
 *
 * The stage pins full-viewport (all breakpoints — `ScrollTrigger.config({
 * ignoreMobileResize: true })` at the top of this file keeps the pin from
 * re-measuring when the mobile address bar hides/shows) and a diagonal
 * clip-path on the philosophy panel sweeps in from the right as the user
 * scrolls, uncovering it over the villain panel beneath. The wipe geometry
 * is a single `center` value (100 → -100, i.e. fully off-screen right →
 * fully covering) offset by a fixed `skew` on each edge, clamped with
 * `Math.min` so the philosophy panel starts at exactly zero width (no
 * pre-scroll peek). Villain content plays its entrance stagger once, right
 * as the pin engages; the philosophy word-reveal fires once the wipe has
 * crossed roughly its midpoint, so the words resolve just as they become
 * legible.
 *
 * `prefers-reduced-motion`: `init()` never calls this function — the two
 * panels stay in normal document flow via `applyReducedMotionStates()`.
 */
function setupStory() {
  const stage = document.getElementById("story-stage");
  const reto = document.getElementById("story-reto");
  const filosofia = document.getElementById("por-que-existimos");
  if (!stage || !reto || !filosofia) return;

  stage.classList.add("is-cinematic");

  const SKEW = 14; // total diagonal spread (percentage points) between the top and bottom edge
  let philRevealed = false;

  ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: "+=140%",
    scrub: 0.4,
    pin: true,
    anticipatePin: 1,
    onEnter: () => {
      reveal("#villain-header");
      revealGroup(reto.querySelectorAll(".js-villain-item"), 0.1);
      reveal("#villain-pivot", 0.3, true);
      reveal("#story-bridge", 0.5, true);
    },
    onUpdate: (self) => {
      const center = 100 + SKEW / 2 - self.progress * (200 + SKEW);
      const top = Math.min(100, center + SKEW / 2);
      const bottom = Math.min(100, center - SKEW / 2);
      filosofia.style.setProperty("--wipe-top", `${top}%`);
      filosofia.style.setProperty("--wipe-bottom", `${bottom}%`);

      if (!philRevealed && self.progress > 0.52) {
        philRevealed = true;
        gsap.fromTo(
          filosofia.querySelectorAll(".js-phil-word"),
          { filter: "blur(12px)", willChange: "transform,filter,opacity" },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: motionEnter.ease,
            stagger: staggerFromStart(0.05),
            onComplete: function () {
              gsap.set(filosofia.querySelectorAll(".js-phil-word"), { willChange: "auto" });
            },
          },
        );
      }
    },
  });
}

function setupHowWeWork() {
  onSectionEnter("#como-trabajamos", triggerStart.section, () => {
    reveal("#how-header");
  });
}

function setupPortfolio() {
  onSectionEnter("#proyectos", triggerStart.section, (element) => {
    reveal("#portfolio-header");
    revealGroup(element.querySelectorAll(".js-portfolio-item"), 0.15);
  });
}

function setupTeam() {
  onSectionEnter("#equipo", triggerStart.section, (element) => {
    reveal("#team-header");
    revealGroup(element.querySelectorAll(".js-team-card"), 0.1);
  });
}

function setupFinalCta() {
  onSectionEnter("#agendar", triggerStart.section, () => reveal("#final-cta-card"));
}

function setupFooter() {
  onSectionEnter("#footer-mark", triggerStart.footer, () => reveal("#footer-mark"));
}

function setupLogoConvergence() {
  const container = document.getElementById("logo-scroll-convergence");
  const p1 = document.getElementById("convergence-piece-1");
  const p2 = document.getElementById("convergence-piece-2");
  const p3 = document.getElementById("convergence-piece-3");
  const p4 = document.getElementById("convergence-piece-4");
  const section3 = document.getElementById("como-trabajamos");
  const finalCta = document.getElementById("agendar");
  const finalTarget = document.getElementById("final-logo-target");

  if (!container || !p1 || !p2 || !p3 || !p4 || !section3 || !finalCta) return;

  const paths = container.querySelectorAll<SVGPathElement>(".convergence-path");

  // Generador de coordenadas aleatorias asimétricas y ángulos duros de estética brutalista
  const angles = [-90, -45, 0, 45, 90];
  const pickAngle = () => angles[Math.floor(Math.random() * angles.length)];
  const rand = (min: number, max: number) => +(min + Math.random() * (max - min)).toFixed(1);

  // Cuadrantes de margen para garantizar dispersión sin pisar el texto central
  const p1X = rand(-38, -22);
  const p1Y = rand(-32, -14);
  const p1Rot = pickAngle();

  const p2X = rand(22, 38);
  const p2Y = rand(-30, -12);
  const p2Rot = pickAngle();

  const p3X = rand(-36, -20);
  const p3Y = rand(12, 30);
  const p3Rot = pickAngle();

  const p4X = rand(20, 36);
  const p4Y = rand(14, 32);
  const p4Rot = pickAngle();

  // Color opaco inicial: gris cemento / carbón mate (#4A4A4D)
  gsap.set(paths, { fill: "#4A4A4D" });

  // Posiciones aleatorias iniciales dispersas
  gsap.set(p1, { x: `${p1X}vw`, y: `${p1Y}vh`, rotation: p1Rot, scale: 0.85, opacity: 0 });
  gsap.set(p2, { x: `${p2X}vw`, y: `${p2Y}vh`, rotation: p2Rot, scale: 0.85, opacity: 0 });
  gsap.set(p3, { x: `${p3X}vw`, y: `${p3Y}vh`, rotation: p3Rot, scale: 0.85, opacity: 0 });
  gsap.set(p4, { x: `${p4X}vw`, y: `${p4Y}vh`, rotation: p4Rot, scale: 0.85, opacity: 0 });

  // Visibilidad: inicia en la Sección 3 ("Cómo trabajamos"). Hero e Historia permanecen limpios.
  ScrollTrigger.create({
    trigger: section3,
    start: "top 75%",
    endTrigger: finalCta,
    end: "bottom 15%",
    onEnter: () => gsap.to(container, { opacity: 1, duration: 0.35, ease: "power2.out" }),
    onLeaveBack: () => gsap.to(container, { opacity: 0, duration: 0.3, ease: "power2.in" }),
    onLeave: () => gsap.to(container, { opacity: 0, duration: 0.3, ease: "power2.in" }),
    onEnterBack: () => gsap.to(container, { opacity: 1, duration: 0.35, ease: "power2.out" }),
  });

  // Timeline scrubbed desde Sección 3 hasta el centro de FinalCTA
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section3,
      start: "top 65%",
      endTrigger: finalCta,
      end: "center 52%",
      scrub: 1.0,
    },
  });

  // Sección 3: Revelación de las piezas opacas en sus posiciones aleatorias
  tl.to([p1, p2, p3, p4], { opacity: 0.95, duration: 0.12, ease: "none" }, 0);

  // Secciones 4 ("Qué hemos logrado" / Proyectos) y 5 ("Equipo"):
  // Desplazamiento asimétrico mecánico continuo descendiendo con el scroll
  tl.to(p1, { x: `${(p1X * 0.6).toFixed(1)}vw`, y: `${(p1Y * 0.65).toFixed(1)}vh`, rotation: p1Rot * 0.5, duration: 0.55, ease: "none" }, 0.12)
    .to(p2, { x: `${(p2X * 0.6).toFixed(1)}vw`, y: `${(p2Y * 0.65).toFixed(1)}vh`, rotation: p2Rot * 0.5, duration: 0.55, ease: "none" }, 0.12)
    .to(p3, { x: `${(p3X * 0.6).toFixed(1)}vw`, y: `${(p3Y * 0.65).toFixed(1)}vh`, rotation: p3Rot * 0.5, duration: 0.55, ease: "none" }, 0.12)
    .to(p4, { x: `${(p4X * 0.6).toFixed(1)}vw`, y: `${(p4Y * 0.65).toFixed(1)}vh`, rotation: p4Rot * 0.5, duration: 0.55, ease: "none" }, 0.12);

  // Clímax mecánico brutalista en Sección Final (#agendar):
  // Convergencia física hacia (0, 0), rotación a 0° y mutación a blanco sólido (#FFFFFF)
  tl.to(
    [p1, p2, p3, p4],
    {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.25,
      ease: "power3.out",
    },
    0.72
  );

  tl.to(
    paths,
    {
      fill: "#FFFFFF",
      duration: 0.2,
      ease: "power2.out",
    },
    0.75
  );

  // Celebración lumínica al llegar al destino final
  ScrollTrigger.create({
    trigger: finalCta,
    start: "top 60%",
    onEnter: () => finalTarget?.classList.add("is-converged"),
    onLeaveBack: () => finalTarget?.classList.remove("is-converged"),
  });
}

/**
 * Smooth-scrolls in-page `#anchor` links via GSAP's ScrollToPlugin instead
 * of the native `scroll-behavior: smooth` (disabled in global.css — it
 * fights ScrollTrigger's pin in setupStory(), producing a visible jump when
 * entering the cinematic mode). ScrollToPlugin drives the same scroll
 * position ScrollTrigger reads, so the two cooperate instead of racing.
 * `offsetY` mirrors the site's `scroll-padding-top` (fixed nav clearance) by
 * reading it straight from computed style, so both stay in sync.
 */
function setupSmoothAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return;

    link.addEventListener("click", (event) => {
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const offsetY = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

      gsap.to(window, {
        duration: reduced ? 0 : 1,
        scrollTo: { y: target, offsetY },
        ease: "power2.inOut",
      });
      history.pushState(null, "", `#${id}`);
    });
  });
}

function init() {
  // Limpiar instancias previas de ScrollTrigger para soportar HMR y reloads sin bloquearse
  ScrollTrigger.getAll().forEach((t) => t.kill());

  setupSmoothAnchors();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyReducedMotionStates();
    return;
  }

  setupHero();
  setupStory();
  setupHowWeWork();
  setupPortfolio();
  setupTeam();
  setupFinalCta();
  setupFooter();
  setupLogoConvergence();

  // Late-loading media (hero photo, portfolio images) can shift section
  // offsets after ScrollTrigger has already measured them.
  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

document.addEventListener("astro:page-load", init);
if (document.readyState === "complete" || document.readyState === "interactive") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}

// Resiliencia para HMR en Vite durante desarrollo
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    init();
  });
}
