/**
 * Portafolio — Qué hicimos: Liiot Custom (con SG-SST integrado) y Bleepy.
 * Minimalista, sin números, sin pills y con gran impacto emocional.
 */

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
    subtitle: "Desarrollo a medida · Caso SG-SST",
    description:
      "Software a medida con propósito humano. Diseñamos y construimos SG-SST: una plataforma integral que automatiza la seguridad laboral y transforma la prevención en una cultura viva de cuidado.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Liiot Custom — Desarrollo a medida y plataforma SG-SST",
    themeColor: "violet",
    ctaText: "Crear tu proyecto",
    ctaLink: "#agendar",
  },
  {
    slug: "bleepy",
    title: "Bleepy",
    subtitle: "Plataforma de creadores & empresas · Coming soon",
    description:
      "Nuestra plataforma para unir marcas y creadores en torno a contenido orgánico real. Construimos comunidad auténtica y tracción genuina sin depender de pauta fría.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
    imageAlt: "Bleepy — Plataforma de creadores y marcas",
    themeColor: "pink",
    ctaText: "Unirme a la lista de espera",
    ctaLink: "#agendar",
  },
];
