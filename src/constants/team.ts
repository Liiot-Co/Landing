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
    photo: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?q=80&w=1200&auto=format&fit=crop",
    photoAlt: "Retrato de Jean Pierre Ortiz",
  },
  {
    name: "David Ocaño",
    role: "CCO",
    linkedin: "https://www.linkedin.com/in/juan-david-oca%C3%B1o-huertas-868b40301/",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop",
    photoAlt: "Retrato de David Ocaño",
  },
  {
    name: "Dana Sofia Sánchez",
    role: "CEO",
    linkedin: "https://www.linkedin.com/in/dana-sofia-s%C3%A1nchez-ortiz-364176211/",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    photoAlt: "Retrato de Dana Sofia Sánchez",
  },
];
