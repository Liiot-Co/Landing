/**
 * 404 puzzle — cada `.mark-piece` nace desplazado vía CSS vars (`--sx/--sy/--sr`,
 * fijadas inline en 404.astro) y su posición de reposo (`translate(0,0)`, seteada
 * por `.is-placed` en el <style> del page) coincide siempre con su lugar en el
 * isotipo — no hay coordenadas que calcular aquí, solo togglear la clase.
 */
function initNotfoundPuzzle() {
  const root = document.getElementById("notfound-stage");
  const stage = document.getElementById("mark-stage");
  const progress = document.getElementById("notfound-progress");
  const pieces = Array.from(document.querySelectorAll<HTMLButtonElement>(".mark-piece"));

  if (!root || !stage || pieces.length === 0) return;

  const total = pieces.length;
  let placed = 0;
  const progressTemplate = root.dataset.progressTemplate || "{placed} / {total} piezas";
  const piecePlacedTemplate = root.dataset.piecePlacedTemplate || "Pieza {id} colocada";

  function updateProgress() {
    if (progress) {
      progress.textContent = progressTemplate
        .replace("{placed}", String(placed))
        .replace("{total}", String(total));
    }
  }

  function complete() {
    root?.classList.add("is-complete");
    stage?.classList.add("is-complete");
  }

  function placePiece(piece: HTMLButtonElement) {
    if (piece.classList.contains("is-placed")) return;
    piece.classList.add("is-placed");
    piece.tabIndex = -1;
    piece.setAttribute("aria-disabled", "true");
    piece.setAttribute(
      "aria-label",
      piecePlacedTemplate.replace("{id}", piece.dataset.piece || "")
    );
    placed += 1;
    updateProgress();
    if (placed === total) complete();
  }

  pieces.forEach((piece) => {
    piece.addEventListener("click", () => placePiece(piece));
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    pieces.forEach(placePiece);
  } else {
    updateProgress();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNotfoundPuzzle);
} else {
  initNotfoundPuzzle();
}
