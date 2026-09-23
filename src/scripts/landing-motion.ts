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
    "#villain-header, #villain-pivot, #story-bridge, .js-villain-item, #how-header, #portfolio-header, #team-header, #footer-mark, #bg-piece-how, #bg-piece-portfolio, #bg-piece-team, #consolidate-p1, #consolidate-p2, #consolidate-p3, #consolidate-p4",
    { opacity: "1", transform: "none" },
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

function setupSectionBackgroundParallax() {
  const pHow = document.getElementById("bg-piece-how");
  const pPort = document.getElementById("bg-piece-portfolio");
  const pTeam = document.getElementById("bg-piece-team");
  const pFinal = document.getElementById("bg-piece-final");

  // Sección 3: "Cómo trabajamos" (Pieza 1) — Parallax asimétrico diagonal en el fondo
  if (pHow) {
    gsap.fromTo(
      pHow,
      { y: -130, x: 45, rotation: -24 },
      {
        y: 150,
        x: -45,
        rotation: 12,
        ease: "none",
        scrollTrigger: {
          trigger: "#como-trabajamos",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      }
    );
  }

  // Sección 4: "Qué hemos logrado" / Proyectos (Pieza 2) — Parallax en cuadrante opuesto
  if (pPort) {
    gsap.fromTo(
      pPort,
      { y: -150, x: -50, rotation: 30 },
      {
        y: 160,
        x: 40,
        rotation: -14,
        ease: "none",
        scrollTrigger: {
          trigger: "#proyectos",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      }
    );
  }

  // Sección 5: "Nuestro equipo" (Pieza 3) — Parallax asimétrico lateral
  if (pTeam) {
    gsap.fromTo(
      pTeam,
      { y: -120, x: 50, rotation: -36 },
      {
        y: 140,
        x: -35,
        rotation: 18,
        ease: "none",
        scrollTrigger: {
          trigger: "#equipo",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      }
    );
  }
}

/**
 * Consolidación física del isotipo Liiot en la sección final (#agendar).
 * Las 4 piezas inician dispersas en los extremos del espacio de la sección,
 * y al hacer scroll hacia la tarjeta "Crezcamos juntos", convergen
 * simultáneamente hacia el centro, rotan a 0° y se consolidan en el isotipo completo.
 */
function setupLogoConsolidation() {
  const finalCta = document.getElementById("agendar");
  const finalTarget = document.getElementById("final-logo-target");
  const cp1 = document.getElementById("consolidate-p1");
  const cp2 = document.getElementById("consolidate-p2");
  const cp3 = document.getElementById("consolidate-p3");
  const cp4 = document.getElementById("consolidate-p4");

  if (!finalCta || !finalTarget || !cp1 || !cp2 || !cp3 || !cp4) return;

  // Estado inicial disperso en el espacio del CTA final (piezas grandes y asimétricas)
  gsap.set(cp1, { x: "-26vw", y: "-16vh", scale: 2.2, rotation: -50, opacity: 0.15 });
  gsap.set(cp2, { x: "26vw", y: "-14vh", scale: 2.2, rotation: 45, opacity: 0.15 });
  gsap.set(cp3, { x: "-22vw", y: "15vh", scale: 2.2, rotation: 65, opacity: 0.15 });
  gsap.set(cp4, { x: "22vw", y: "13vh", scale: 2.2, rotation: -55, opacity: 0.15 });

  // Timeline con scrub: conforme el scroll entra a la sección, las 4 piezas viajan físicamente
  // y se ensamblan con precisión en el centro exacto (0, 0)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: finalCta,
      start: "top 85%",
      end: "center 52%",
      scrub: 1.2,
      onUpdate: (self) => {
        if (self.progress > 0.9) {
          finalTarget.classList.add("is-consolidated");
        } else {
          finalTarget.classList.remove("is-consolidated");
        }
      },
    },
  });

  tl.to(
    [cp1, cp2, cp3, cp4],
    {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      ease: "power2.out",
    }
  );
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
  setupSectionBackgroundParallax();
  setupLogoConsolidation();

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
