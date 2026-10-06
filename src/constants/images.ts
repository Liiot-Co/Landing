/**
 * Centralized images and media assets registry.
 * Edit image URLs, dimensions, and fallbacks in this single location.
 */

export const IMAGES = {
  hero: {
    main: "https://images.unsplash.com/photo-1524014629655-e08df4da8213?q=80&w=1169&auto=format&fit=crop",
    fallback: "https://images.unsplash.com/photo-1521669246297-b04a27e36f07?w=1200&q=70",
    widths: [640, 1024, 1536, 1920],
  },
  story: {
    reto: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=700&auto=format&fit=crop",
    filosofiaA: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
    filosofiaB: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
  },
  howWeWork: {
    step1: "https://images.unsplash.com/photo-1789521407194-32acbf3ab66b?q=80&w=687&auto=format&fit=crop",
    step2: "https://images.unsplash.com/photo-1625246433906-6cfa33544b31?q=80&w=1170&auto=format&fit=crop",
    step3: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
    widths: [480, 800, 1100],
  },
  portfolio: {
    liiotCustom: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1400&auto=format&fit=crop",
    bleepy: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
    widths: [480, 800, 1100],
  },
  team: {
    dana: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    david: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop",
    jean: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?q=80&w=1200&auto=format&fit=crop",
    widths: [400, 700],
  },
  seo: {
    ogImage: "/og-image.svg",
    favicon: "/favicon.svg",
  },
} as const;

// Backwards-compatible named exports
export const HERO_IMAGE = IMAGES.hero.main;
export const HERO_IMAGE_WIDTHS = IMAGES.hero.widths;
export const HERO_IMAGE_FALLBACK = IMAGES.hero.fallback;
