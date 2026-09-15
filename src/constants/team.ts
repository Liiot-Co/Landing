/**
 * Equipo Liiot — fuente: vault 10_Proyectos/Landing Page/01 - Definir estructura/Landing Page.md
 */
export interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
  photo: string;
  photoAlt: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Jean Pierre Ortiz",
    role: "CTO",
    linkedin: "https://www.linkedin.com/in/jean-pierre-ortiz-murcia-76a5031b3/",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop",
    photoAlt: "Retrato de Jean Pierre Ortiz",
  },
  {
    name: "David Ocaño",
    role: "CCO",
    linkedin: "https://www.linkedin.com/in/juan-david-oca%C3%B1o-huertas-868b40301/",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
    photoAlt: "Retrato de David Ocaño",
  },
  {
    name: "Dana Sofia Sánchez",
    role: "CEO",
    linkedin: "https://www.linkedin.com/in/dana-sofia-s%C3%A1nchez-ortiz-364176211/",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop",
    photoAlt: "Retrato de Dana Sofia Sánchez",
  },
];
