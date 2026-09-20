/**
 * Helpers para "servir" imágenes de Unsplash al tamaño real que ocupan en
 * pantalla en vez del ancho fijo original de cada URL (que solía ser mucho
 * mayor al contenedor y pesaba de más — ver auditoría Web Vitals).
 * Unsplash acepta `w` (ancho en px) y `q` (calidad 0-100) como query params
 * dinámicos sobre la misma foto, así que no hace falta alojar variantes.
 */

/** Devuelve la misma foto de Unsplash redimensionada a `width` con calidad `quality`. */
export function unsplashResize(url: string, width: number, quality = 70): string {
  const resized = new URL(url);
  resized.searchParams.set("w", String(width));
  resized.searchParams.set("q", String(quality));
  return resized.toString();
}

/** Genera un atributo `srcset` con una variante por cada ancho en `widths`. */
export function unsplashSrcSet(url: string, widths: number[], quality = 70): string {
  return widths.map((width) => `${unsplashResize(url, width, quality)} ${width}w`).join(", ");
}
