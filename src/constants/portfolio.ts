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
      "Automatizamos la seguridad laboral para que cuidar a cada trabajador sea parte natural del día.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Liiot Custom — Herramienta a medida para seguridad laboral",
    themeColor: "violet",
    ctaText: "Quiero algo así para mi empresa",
    ctaLink: LIIOT_BOOKING_URL,
  },
  {
    slug: "bleepy",
    title: "Bleepy",
    subtitle: "Plataforma de creadores y empresas · Próximamente",
    description:
      "Conectamos marcas con creadores que cuentan su historia con voz propia.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Bleepy — Plataforma de creadores y marcas",
    themeColor: "pink",
    ctaText: "Cuéntanos si te interesa",
    ctaLink: "#agendar",
  },
];
