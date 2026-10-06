/**
 * Portafolio — Qué hicimos: Liiot Custom (con SG-SST integrado) y Bleepy.
 * Minimalista, sin números, sin pills y con gran impacto emocional.
 */

import { LIIOT_BOOKING_URL } from "./contact";
import { IMAGES } from "./images";
import { t } from "@/i18n";

export interface PortfolioProject {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  themeColor: "violet" | "pink";
  ctaText: string;
  ctaLink: string;
}

export const PROJECT_IMAGE_WIDTHS = IMAGES.portfolio.widths;

export function getPortfolioProjects(currentTranslations = t): PortfolioProject[] {
  const p = currentTranslations.portfolio.projects;
  return [
    {
      slug: "liiot-custom",
      title: p["liiot-custom"].title,
      subtitle: p["liiot-custom"].subtitle,
      description: p["liiot-custom"].description,
      image: IMAGES.portfolio.liiotCustom,
      imageAlt: p["liiot-custom"].imageAlt,
      themeColor: "violet",
      ctaText: p["liiot-custom"].ctaText,
      ctaLink: LIIOT_BOOKING_URL,
    },
    {
      slug: "bleepy",
      title: p.bleepy.title,
      subtitle: p.bleepy.subtitle,
      description: p.bleepy.description,
      image: IMAGES.portfolio.bleepy,
      imageAlt: p.bleepy.imageAlt,
      themeColor: "pink",
      ctaText: p.bleepy.ctaText,
      ctaLink: "#agendar",
    },
  ];
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = getPortfolioProjects();
