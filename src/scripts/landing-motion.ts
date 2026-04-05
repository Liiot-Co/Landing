/**
 * Single entry for all landing scroll / entrance motion (one Motion import graph).
 * Prefer `prefers-reduced-motion`: skip animations and reveal content immediately.
 */
import { animate, inView, stagger } from "motion";
import {
  fadeUpReveal,
  inViewMargin,
  springSnappy,
  springSoft,
  staggerFromStart,
} from "@/lib/motion/landing";

const INIT_ATTR = "data-landing-motion-init";

function applyReducedMotionStates() {
  const setBulk = (
    selector: string,
    styles: Record<string, string>,
  ) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      Object.assign(el.style, styles);
    });
  };

  setBulk(
    "#hero-title, #hero-body, #hero-cta, #hero-illustration",
    { opacity: "1", transform: "none" },
  );
  setBulk(".js-hero-slot", {
    opacity: "1",
    transform: "translateY(0px) scale(1)",
  });

  setBulk("#features-header", { opacity: "1", transform: "translateY(0px)" });
  setBulk(".js-feature-card", { opacity: "1", transform: "translateY(0px)" });
  setBulk(".js-feat-slot", {
    opacity: "1",
    transform: "translateY(0px) scale(1)",
  });

  setBulk("#problem-forwho-header", {
    opacity: "1",
    transform: "translateY(0px)",
  });
  setBulk(".js-problem-card", { opacity: "1", transform: "translateY(0px)" });

  for (const sel of [
    "#company-eyebrow",
    "#company-headline",
    "#company-p1",
    "#company-p2",
    "#company-p3",
  ] as const) {
    setBulk(sel, { opacity: "1", transform: "translateY(0px)" });
  }

  const cta = document.getElementById("final-cta-card");
  if (cta) {
    Object.assign(cta.style, { opacity: "1", transform: "none" });
  }

  const glow = document.getElementById("phil-glow");
  if (glow) {
    glow.style.opacity = "1";
    glow.style.transform = "scale(1)";
  }
  const eyeb = document.getElementById("phil-eyebrow");
  if (eyeb) {
    eyeb.style.opacity = "1";
    eyeb.style.letterSpacing = "0.3em";
  }
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
  type HeroKeyframe = { opacity: number; transform: string };
  type HeroOpts = { duration: number; delay: number; ease: string };
  const heroAnimate = animate as unknown as (
    selector: string,
    keyframes: HeroKeyframe,
    options: HeroOpts,
  ) => void;

  const heroEase = "ease-out";
  const fadeUp: HeroKeyframe = { opacity: 1, transform: "none" };

  heroAnimate("#hero-title", fadeUp, {
    duration: 0.5,
    delay: 0.3,
    ease: heroEase,
  });
  heroAnimate("#hero-body", fadeUp, {
    duration: 0.5,
    delay: 0.5,
    ease: heroEase,
  });
  heroAnimate("#hero-cta", fadeUp, {
    duration: 0.5,
    delay: 0.65,
    ease: heroEase,
  });
  heroAnimate("#hero-illustration", fadeUp, {
    duration: 0.55,
    delay: 0.45,
    ease: heroEase,
  });

  let slotsAnimated = false;
  inView(
    "#hero-illustration",
    () => {
      if (slotsAnimated) return;
      slotsAnimated = true;
      const slots = document.querySelectorAll<HTMLElement>(".js-hero-slot");
      slots.forEach((el, i) => {
        animate(
          el,
          { opacity: 1, transform: "translateY(0px) scale(1)" },
          { ...springSnappy, delay: i * 0.042 },
        );
      });
    },
    { margin: "-12% 0px -12% 0px" },
  );
}

function setupFeatures() {
  inView(
    "#features",
    (element) => {
      animate(
        "#features-header",
        { opacity: 1, transform: "translateY(0px)" },
        { ...springSnappy },
      );

      animate(
        element.querySelectorAll(".js-feature-card"),
        { opacity: 1, transform: "translateY(0px)" },
        { ...springSnappy, delay: staggerFromStart(0.1) },
      );

      const slots = element.querySelectorAll(".js-feat-slot");
      slots.forEach((el, i) => {
        const node = el as HTMLElement;
        node.style.opacity = "0";
        node.style.transform = "translateY(8px) scale(0.95)";

        animate(
          el,
          { opacity: 1, transform: "translateY(0px) scale(1)" },
          { ...springSnappy, delay: 0.3 + i * 0.03 },
        );
      });
    },
    { margin: inViewMargin.section },
  );
}

function setupProblemForWho() {
  inView(
    "#pain-points",
    (element) => {
      animate(
        "#problem-forwho-header",
        { opacity: 1, transform: "translateY(0px)" },
        { ...springSoft },
      );
      animate(
        element.querySelectorAll(".js-problem-card"),
        { opacity: 1, transform: "translateY(0px)" },
        { ...springSoft, delay: staggerFromStart(0.1) },
      );
    },
    { margin: inViewMargin.section },
  );
}

function setupCompany() {
  const companyRevealSelectors = [
    "#company-eyebrow",
    "#company-headline",
    "#company-p1",
    "#company-p2",
    "#company-p3",
  ] as const;

  inView(
    "#company",
    () => {
      companyRevealSelectors.forEach((sel, i) => {
        animate(
          sel,
          { opacity: 1, transform: "translateY(0px)" },
          { ...springSoft, delay: i * 0.07 },
        );
      });
    },
    { margin: inViewMargin.section },
  );
}

function setupFinalCta() {
  inView(
    "#cta",
    () => {
      animate("#final-cta-card", fadeUpReveal(), { ...springSoft });
    },
    { margin: inViewMargin.section },
  );
}

function setupPhilosophyQuote() {
  inView(
    "#philosophy-statement",
    () => {
      const glow = document.getElementById("phil-glow");
      if (glow) {
        glow.style.opacity = "1";
        glow.style.transform = "scale(1)";
      }

      animate(
        "#phil-eyebrow",
        { opacity: 1, letterSpacing: ["0.1em", "0.3em"] },
        { duration: 1, easing: [0.22, 1, 0.36, 1] },
      );

      animate(
        ".js-phil-word",
        {
          opacity: 1,
          filter: ["blur(12px)", "blur(0px)"],
          transform: [
            "translateY(32px) scale(0.95)",
            "translateY(0px) scale(1)",
          ],
        },
        {
          duration: 0.9,
          delay: stagger(0.06, { start: 0.2 }),
          easing: [0.22, 1, 0.36, 1],
        },
      );

      animate(
        "#phil-divider",
        { opacity: 0.8, width: ["0%", "160px"] },
        { duration: 1.2, delay: 0.8, easing: [0.22, 1, 0.36, 1] },
      );
    },
    { margin: "-25% 0px -25% 0px" },
  );
}

function init() {
  if (document.body.getAttribute(INIT_ATTR) === "1") return;
  document.body.setAttribute(INIT_ATTR, "1");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyReducedMotionStates();
    return;
  }

  setupHero();
  setupFeatures();
  setupProblemForWho();
  setupCompany();
  setupFinalCta();
  setupPhilosophyQuote();
}

document.addEventListener("astro:page-load", init);
if (document.readyState === "complete" || document.readyState === "interactive") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
