/**
 * Portafolio — Qué hicimos: Liiot Custom (con SG-SST integrado) y Bleepy.
 * Minimalista, sin números, sin pills y con gran impacto emocional.
 */

import { LIIOT_BOOKING_URL } from "./contact";

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

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: "liiot-custom",
    title: "Liiot Custom",
    subtitle: "Herramienta a medida · Caso SG-SST",
    description:
      "Automatizamos la seguridad laboral para que la prevención sea parte de la cultura, no una obligación que nadie cumple.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Liiot Custom — Herramienta a medida para seguridad laboral",
    themeColor: "violet",
    ctaText: "Empecemos juntos",
    ctaLink: LIIOT_BOOKING_URL,
  },
  {
    slug: "bleepy",
    title: "Bleepy",
    subtitle: "Plataforma de creadores & empresas · Coming soon",
    description:
      "Unimos marcas y creadores para crear contenido auténtico que conecta, sin depender de publicidad fría.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Bleepy — Plataforma de creadores y marcas",
    themeColor: "pink",
    ctaText: "Unirme a la lista de espera",
    ctaLink: "#agendar",
  },
];
