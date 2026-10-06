/**
 * Equipo Liiot — fuente: vault 10_Proyectos/Landing Page/01 - Definir estructura/Landing Page.md
 */
import { IMAGES } from "./images";
import { t } from "@/i18n";

export interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
  photo: string;
  photoAlt: string;
}

export const PHOTO_WIDTHS = IMAGES.team.widths;

export function getTeamMembers(currentTranslations = t): TeamMember[] {
  const m = currentTranslations.team.members;
  return [
    {
      name: m.dana.name,
      role: m.dana.role,
      linkedin: "https://www.linkedin.com/in/dana-sofia-s%C3%A1nchez-ortiz-364176211/",
      photo: IMAGES.team.dana,
      photoAlt: m.dana.photoAlt,
    },
    {
      name: m.david.name,
      role: m.david.role,
      linkedin: "https://www.linkedin.com/in/juan-david-oca%C3%B1o-huertas-868b40301/",
      photo: IMAGES.team.david,
      photoAlt: m.david.photoAlt,
    },
    {
      name: m.jean.name,
      role: m.jean.role,
      linkedin: "https://www.linkedin.com/in/jean-pierre-ortiz-murcia-76a5031b3/",
      photo: IMAGES.team.jean,
      photoAlt: m.jean.photoAlt,
    },
  ];
}

export const TEAM_MEMBERS: TeamMember[] = getTeamMembers();
