/**
 * Piezas del isotipo Liiot como bloques con física (Matter.js).
 *
 * Las 4 piezas (`[data-logo-block]`) caen en un patio (`#logo-yard`), rebotan,
 * se apilan y se pueden arrastrar y lanzar con mouse o touch.
 *
 * Rendimiento:
 * - Matter se carga con import dinámico solo cuando el patio está cerca de la pantalla.
 * - Sin canvas: cada pieza es un SVG movido con `transform`.
 * - Los cuerpos duermen al quedar quietos y el loop se detiene hasta la próxima interacción.
 * - El loop también se pausa fuera de pantalla y con la pestaña oculta.
 * - `prefers-reduced-motion`: se calcula el montón ya apilado y no hay loop.
 *
 * Touch: solo las piezas llevan `touch-action: none`. Tocar el espacio vacío
 * sigue haciendo scroll en la página.
 */

export type CleanupFn = () => void;

type Pt = [number, number];

/** Contornos convexos (viewBox 48×48) de las 4 piezas, con la misma geometría que el SVG. */
const P1: Pt[] = [
  [23.6, 14.0],
  [21.5, 12.8],
  [13.1, 19.1],
  [12.5, 20.2],
  [12.4, 45.0],
  [14.6, 46.2],
  [23.0, 40.8],
  [23.6, 39.9],
];
const P3: Pt[] = [
  [24.7, 36.5],
  [30.3, 36.5],
  [33.0, 37.6],
  [35.2, 40.0],
  [35.7, 41.8],
  [34.6, 44.9],
  [32.8, 46.4],
  [30.3, 47.2],
  [27.5, 46.7],
  [25.5, 44.8],
  [24.7, 41.6],
];
/** Las piezas 2 y 4 son las 1 y 3 giradas 180° alrededor del centro del isotipo. */
const rot180 = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [48.2 - x, 47.9 - y]);

const SHAPES: Record<string, Pt[]> = {
  "1": P1,
  "2": rot180(P1),
  "3": P3,
  "4": rot180(P3),
};

const VIEWBOX = 48;

export async function initLogoPhysics(yard: HTMLElement): Promise<CleanupFn> {
  const pieces = Array.from(yard.querySelectorAll<SVGSVGElement>("[data-logo-block]"));
  if (!pieces.length) return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const Matter = (await import("matter-js")).default;
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping, Vertices } = Matter;

  let disposed = false;
  let engine: Matter.Engine | null = null;
  let bodies: Matter.Body[] = [];
  let walls: Matter.Body[] = [];
  let raf = 0;
  let last = 0;
  let visible = false;
  let started = false;
  let width = 0;
  let height = 0;
  let size = 0;

  /** Pieza → centroide en px dentro de su caja SVG (origen de rotación). */
  const centroids = new Map<Matter.Body, Pt>();
  const bodyByEl = new Map<SVGSVGElement, Matter.Body>();
  const drags = new Map<number, { constraint: Matter.Constraint; body: Matter.Body }>();

  function measure() {
    const rect = yard.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    size = Math.round(Math.min(190, Math.max(92, width * 0.2)));
  }

  function build() {
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
    bodyByEl.clear();
    centroids.clear();
    drags.clear();

    engine = Engine.create({ enableSleeping: true, gravity: { x: 0, y: 1.5, scale: 0.001 } });

    const t = 200;
    walls = [
      Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true, friction: 0.6 }),
      Bodies.rectangle(-t / 2, height / 2, t, height * 4, { isStatic: true }),
      Bodies.rectangle(width + t / 2, height / 2, t, height * 4, { isStatic: true }),
      Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);

    const k = size / VIEWBOX;
    const slot = width / (pieces.length + 1);
    bodies = pieces.map((el, i) => {
      const id = el.dataset.logoBlock ?? String(i + 1);
      const verts = (SHAPES[id] ?? P1).map(([x, y]) => ({ x: x * k, y: y * k }));
      const centre = Vertices.centre(verts);
      const body = Bodies.fromVertices(
        slot * (i + 1) + (Math.random() - 0.5) * slot * 0.4,
        size * 0.55 + (i % 2) * size * 0.3,
        [verts],
        { restitution: 0.38, friction: 0.45, frictionAir: 0.012, density: 0.002, sleepThreshold: 45 },
      );
      Body.setAngle(body, (Math.random() - 0.5) * 1.2);
      centroids.set(body, [centre.x, centre.y]);
      bodyByEl.set(el, body);

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.transformOrigin = `${centre.x}px ${centre.y}px`;
      return body;
    });
    Composite.add(engine.world, bodies);
  }

  function render() {
    for (const [el, body] of bodyByEl) {
      const [cx, cy] = centroids.get(body)!;
      el.style.transform = `translate3d(${(body.position.x - cx).toFixed(2)}px, ${(body.position.y - cy).toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
    }
  }

  function allAsleep() {
    return drags.size === 0 && bodies.every((b) => b.isSleeping);
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(32, last ? now - last : 16.7);
    last = now;
    Engine.update(engine!, dt);
    render();
    if (allAsleep()) stop();
  }

  function run() {
    if (raf || reduced || !started || !visible || document.hidden || disposed) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /** Deja caer las piezas: con reduced-motion se calcula el montón y se pinta una vez. */
  function start() {
    if (started) return;
    started = true;
    yard.classList.add("is-ready");
    if (reduced) {
      for (let i = 0; i < 420; i++) Engine.update(engine!, 1000 / 60);
      render();
      return;
    }
    render();
    run();
  }

  /* ── Arrastre con mouse y touch ─────────────────────────────────────── */
  function toLocal(e: PointerEvent): Pt {
    const r = yard.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function onDown(e: PointerEvent) {
    const el = e.currentTarget as SVGSVGElement;
    const body = bodyByEl.get(el);
    if (!body || reduced || !engine) return;
    el.setPointerCapture(e.pointerId);
    const [x, y] = toLocal(e);
    Sleeping.set(body, false);
    const constraint = Constraint.create({
      pointA: { x, y },
      bodyB: body,
      pointB: { x: x - body.position.x, y: y - body.position.y },
      stiffness: 0.16,
      damping: 0.12,
      length: 0,
    });
    Composite.add(engine.world, constraint);
    drags.set(e.pointerId, { constraint, body });
    yard.classList.add("is-dragging");
    run();
  }

  function onMove(e: PointerEvent) {
    const drag = drags.get(e.pointerId);
    if (!drag) return;
    const [x, y] = toLocal(e);
    drag.constraint.pointA = {
      x: Math.min(width, Math.max(0, x)),
      y: Math.min(height, Math.max(0, y)),
    };
    Sleeping.set(drag.body, false);
  }

  function onUp(e: PointerEvent) {
    const drag = drags.get(e.pointerId);
    if (!drag || !engine) return;
    Composite.remove(engine.world, drag.constraint);
    drags.delete(e.pointerId);
    if (!drags.size) yard.classList.remove("is-dragging");
    run();
  }

  pieces.forEach((el) => {
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
  });

  /* ── Ciclo de vida ──────────────────────────────────────────────────── */
  measure();
  build();

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) return stop();
      if (!started && entry.intersectionRatio >= 0.35) start();
      else run();
    },
    { threshold: [0, 0.35] },
  );
  io.observe(yard);

  const onVisibility = () => (document.hidden ? stop() : run());
  document.addEventListener("visibilitychange", onVisibility);

  let resizeTimer = 0;
  let lastWidth = width;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      if (Math.abs(width - lastWidth) < 2) return;
      lastWidth = width;
      stop();
      build();
      if (started) {
        if (reduced) {
          for (let i = 0; i < 420; i++) Engine.update(engine!, 1000 / 60);
          render();
        } else {
          render();
          run();
        }
      }
    }, 200);
  });
  ro.observe(yard);

  return () => {
    disposed = true;
    stop();
    clearTimeout(resizeTimer);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    pieces.forEach((el) => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    });
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
  };
}
