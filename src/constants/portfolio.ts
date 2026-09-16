/**
 * Portafolio — fuente: vault 10_Proyectos/Landing Page/01 - Definir estructura/Landing Page.md §5
 */
export interface PortfolioProject {
  slug: string;
  title: string;
  quote: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: "sg-sst",
    title: "SG-SST",
    quote: "Crea una cultura donde las personas cuidan más cuando entienden por qué.",
    description:
      "Plataforma de gestión de seguridad y salud en el trabajo. No solo cumple normas — construye comunidad alrededor del cuidado.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Equipo industrial revisando procesos de seguridad",
  },
  {
    slug: "liiot-community",
    title: "Liiot Community",
    quote: "Profesionales jóvenes que se apoyan, comparten y construyen el futuro.",
    description:
      "Nuestra propia comunidad. Un espacio donde el talento joven de Colombia construye el futuro del software junto.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Comunidad de profesionales jóvenes colaborando",
  },
];
