/**
 * Single entry for all landing scroll / entrance motion (one Motion import graph).
 * Every section reveal shares the same easing curve (`flowEasing`) so scrolling
 * through the page reads as one continuous motion language, not a different
 * "feel" per section. Prefer `prefers-reduced-motion`: skip animations and
 * reveal content immediately.
 */
import { animate, inView, stagger } from "motion";
import {
  flowEasing,
  inViewMargin,
  motionEnter,
  motionEnterFast,
  staggerFromStart,
} from "@/lib/motion/landing";

const INIT_ATTR = "data-landing-motion-init";

/**
 * Motion's typings reject array/`"none"` keyframe values on a plain string
 * selector even though the runtime supports them. One loose cast, reused
 * wherever we animate by id/class with a keyframe array.
 */
const looseAnimate = animate as unknown as (
  selector: string | NodeListOf<Element>,
  keyframes: Record<string, unknown>,
  options: Record<string, unknown>,
) => void;

/** Standard "fade up" reveal — the one entrance pattern used sitewide. */
function reveal(selector: string, delay = 0, fast = false) {
  const preset = fast ? motionEnterFast : motionEnter;
  looseAnimate(
    selector,
    { opacity: 1, transform: "translateY(0px)" },
    { duration: preset.duration, delay, easing: preset.easing },
  );
}

function revealGroup(elements: NodeListOf<Element>, staggerInterval = 0.1) {
  looseAnimate(
    elements,
    { opacity: 1, transform: "translateY(0px)" },
    { duration: motionEnter.duration, delay: staggerFromStart(staggerInterval), easing: motionEnter.easing },
  );
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
    "#villain-header, #villain-pivot, .js-villain-item, #how-header, #portfolio-header, #team-header, #footer-mark",
    { opacity: "1", transform: "translateY(0px)" },
  );
  setBulk(".js-portfolio-item, .js-team-card", {
    opacity: "1",
    transform: "translateY(0px)",
  });

  const cta = document.getElementById("final-cta-card");
  if (cta) Object.assign(cta.style, { opacity: "1", transform: "none" });

  const glow = document.getElementById("phil-glow");
  if (glow) glow.style.opacity = "1";

  document.querySelectorAll<HTMLElement>(".js-phil-word").forEach((el) => {
    el.style.opacity = "1";
    el.style.filter = "blur(0px)";
    el.style.transform = "translateY(0px) scale(1)";
  });
  const divider = document.getElementById("phil-divider");
  if (divider) {
    divider.style.opacity = "0.8";
    divider.style.width = "160px";
  }
}

function setupHero() {
  reveal("#hero-bg", 0);
  reveal("#hero-title", 0.28);
  reveal("#hero-body", 0.46, true);
  reveal("#hero-cta", 0.58, true);
}

function setupVillain() {
  inView(
    "#el-reto",
    (element) => {
      reveal("#villain-header");
      revealGroup(element.querySelectorAll(".js-villain-item"), 0.1);
      reveal("#villain-pivot", 0.3, true);
    },
    { margin: inViewMargin.section },
  );
}

function setupPhilosophy() {
  inView(
    "#por-que-existimos",
    () => {
      const glow = document.getElementById("phil-glow");
      if (glow) glow.style.opacity = "1";

      looseAnimate(
        ".js-phil-word",
        {
          opacity: 1,
          filter: ["blur(12px)", "blur(0px)"],
          transform: ["translateY(32px) scale(0.95)", "translateY(0px) scale(1)"],
        },
        {
          duration: 0.9,
          delay: stagger(0.06, { startDelay: 0.2 }),
          easing: flowEasing,
        },
      );

      looseAnimate(
        "#phil-divider",
        { opacity: 0.8, width: ["0%", "160px"] },
        { duration: 1.2, delay: 0.8, easing: flowEasing },
      );
    },
    { margin: "-25% 0px -25% 0px" },
  );
}

function setupHowWeWork() {
  inView("#como-trabajamos", () => reveal("#how-header"), { margin: inViewMargin.section });
}

function setupPortfolio() {
  inView(
    "#proyectos",
    (element) => {
      reveal("#portfolio-header");
      revealGroup(element.querySelectorAll(".js-portfolio-item"), 0.15);
    },
    { margin: inViewMargin.section },
  );
}

function setupTeam() {
  inView(
    "#equipo",
    (element) => {
      reveal("#team-header");
      revealGroup(element.querySelectorAll(".js-team-card"), 0.1);
    },
    { margin: inViewMargin.section },
  );
}

function setupFinalCta() {
  inView("#agendar", () => reveal("#final-cta-card"), { margin: inViewMargin.section });
}

function setupFooter() {
  inView("#footer-mark", () => reveal("#footer-mark"), { margin: "-10% 0px -10% 0px" });
}

function init() {
  if (document.body.getAttribute(INIT_ATTR) === "1") return;
  document.body.setAttribute(INIT_ATTR, "1");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyReducedMotionStates();
    return;
  }

  setupHero();
  setupVillain();
  setupPhilosophy();
  setupHowWeWork();
  setupPortfolio();
  setupTeam();
  setupFinalCta();
  setupFooter();
}

document.addEventListener("astro:page-load", init);
if (document.readyState === "complete" || document.readyState === "interactive") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
