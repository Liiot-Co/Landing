/**
 * Bloques con física (Matter.js): las 4 piezas del isotipo Liiot más figuras
 * geométricas de marca, en un patio (`#logo-yard`).
 *
 * Interacción:
 * - Arrastrar y lanzar con mouse o touch.
 * - Doble clic o doble toque sobre un bloque: cambia a la siguiente figura y al
 *   siguiente color de la marca (el cuerpo físico se reemplaza conservando
 *   posición, ángulo y velocidad). Una pieza del isotipo nunca se convierte en
 *   otra pieza del isotipo: pasa por las figuras de marca y, al terminar el
 *   ciclo, vuelve a su propia forma. Las figuras solo ciclan entre figuras.
 *
 * Rendimiento:
 * - Matter se carga con import dinámico solo cuando el patio está cerca de la pantalla.
 * - Sin canvas: cada bloque es un SVG movido con `transform`.
 * - Los cuerpos duermen al quedar quietos y el loop se detiene hasta la próxima interacción.
 * - El loop también se pausa fuera de pantalla y con la pestaña oculta.
 * - `prefers-reduced-motion`: se calcula el montón ya apilado y no hay loop ni interacción.
 *
 * Touch: solo la silueta de cada bloque captura el dedo (`touch-action: none`).
 * Tocar el espacio vacío sigue haciendo scroll en la página.
 */

export type CleanupFn = () => void;

type Pt = [number, number];

interface Shape {
  /** Trazo SVG (viewBox 48×48) que se pinta. */
  d: string;
  /** Contorno convexo que usa el motor de física. */
  pts: Pt[];
}

const VIEWBOX = 48;
const SVG_NS = "http://www.w3.org/2000/svg";

/** Colores de marca (mismos tonos que liiot-morph.ts). El blanco es el isotipo original. */
const COLORS = ["#FFFFFF", "#8B45CC", "#FF6A33", "#e04b66", "#e2b31c"];

const polygon = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x},${y}`).join("L")}Z`;
const ngon = (n: number, r: number, rotation = 0, cx = 24, cy = 24): Pt[] =>
  Array.from({ length: n }, (_, i): Pt => {
    const a = rotation + (i * 2 * Math.PI) / n;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
  });
/** Las piezas 2 y 4 del logo son la 1 y la 3 giradas 180° alrededor del centro del isotipo. */
const rot180 = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [+(48.2 - x).toFixed(2), +(47.9 - y).toFixed(2)]);

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

/** Arco de circunferencia como lista de puntos. */
const arc = (cx: number, cy: number, r: number, from: number, to: number, n: number): Pt[] =>
  Array.from({ length: n + 1 }, (_, i): Pt => {
    const a = from + ((to - from) * i) / n;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
  });

/** Pastilla: rectángulo con extremos semicirculares. */
const PILL: Pt[] = [
  ...arc(34, 24, 10, -Math.PI / 2, Math.PI / 2, 6),
  ...arc(14, 24, 10, Math.PI / 2, (3 * Math.PI) / 2, 6),
];

/** Índices de `SHAPES`: 0-3 piezas del isotipo, 4-9 figuras de marca. */
const PIECE_COUNT = 4;
const FIGURE_START = PIECE_COUNT;

const SHAPES: Shape[] = [
  {
    d: "M23.61,40.54l.03-26.58c0-1.17-1.33-1.84-2.26-1.14-2.77,2.1-5.53,4.2-8.3,6.3-.35.27-.56.68-.56,1.13-.03,8.58-.06,17.16-.09,25.74,0,1.13,1.24,1.81,2.18,1.2,2.79-1.82,5.57-3.64,8.36-5.45.4-.26.64-.71.64-1.19",
    pts: P1,
  },
  {
    d: "M24.64,7.37l-.03,26.58c0,1.17,1.33,1.84,2.26,1.14,2.77-2.1,5.53-4.2,8.3-6.3.35-.27.56-.68.56-1.13.03-8.58.06-17.16.09-25.74,0-1.13-1.24-1.81-2.18-1.2-2.79,1.82-5.57,3.64-8.36,5.45-.4.26-.64.71-.64,1.19",
    pts: rot180(P1),
  },
  {
    d: "M35.73,41.84c0,2.93-2.41,5.31-5.39,5.31s-5.65-2.49-5.65-5.56v-5.12h5.58c3.02,0,5.47,2.41,5.47,5.38",
    pts: P3,
  },
  {
    d: "M12.52,6.08c0-2.93,2.41-5.31,5.39-5.31s5.65,2.49,5.65,5.56v5.12h-5.58c-3.02,0-5.47-2.41-5.47-5.38",
    pts: rot180(P3),
  },
  { d: "M24,7a17,17 0 1,0 0.01,0Z", pts: ngon(28, 17) },
  { d: "M9,9H39V39H9Z", pts: [[9, 9], [39, 9], [39, 39], [9, 39]] },
  { d: polygon([[24, 5], [44, 40], [4, 40]]), pts: [[24, 5], [44, 40], [4, 40]] },
  { d: polygon([[24, 3], [45, 24], [24, 45], [3, 24]]), pts: [[24, 3], [45, 24], [24, 45], [3, 24]] },
  { d: polygon(ngon(6, 20, 0)), pts: ngon(6, 20, 0) },
  { d: "M14,14H34A10,10 0 0 1 34,34H14A10,10 0 0 1 14,14Z", pts: PILL },
];

const TAP_MS = 350;
const TAP_SLOP = 12;

interface Block {
  el: SVGSVGElement;
  path: SVGPathElement;
  shape: number;
  /** Pieza del isotipo a la que vuelve al terminar el ciclo; -1 si nació como figura. */
  home: number;
  color: number;
  body: Matter.Body | null;
  centroid: Pt;
}

export async function initLogoPhysics(yard: HTMLElement): Promise<CleanupFn> {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const Matter = (await import("matter-js")).default;
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping, Vertices } = Matter;

  let disposed = false;
  let engine: Matter.Engine | null = null;
  let raf = 0;
  let last = 0;
  let visible = false;
  let started = false;
  let width = 0;
  let height = 0;
  let size = 0;

  /** Un bloque por figura: los 4 del isotipo (blancos) y 6 figuras de marca. */
  const blocks: Block[] = SHAPES.map((shape, i) => {
    const el = document.createElementNS(SVG_NS, "svg");
    el.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);
    el.setAttribute("overflow", "visible");
    el.classList.add("logo-block");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", shape.d);
    const color = i < 4 ? 0 : 1 + ((i - 4) % (COLORS.length - 1));
    path.setAttribute("fill", COLORS[color]);
    el.appendChild(path);
    yard.appendChild(el);
    return { el, path, shape: i, home: i < PIECE_COUNT ? i : -1, color, body: null, centroid: [0, 0] };
  });
  const blockByEl = new Map<Element, Block>(blocks.map((b) => [b.el, b]));

  const drags = new Map<
    number,
    { constraint: Matter.Constraint; block: Block; x0: number; y0: number; t0: number }
  >();
  let lastTap: { block: Block; t: number; x: number; y: number } | null = null;

  function measure() {
    const rect = yard.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    size = Math.round(Math.min(130, Math.max(70, width * 0.13)));
  }

  /** Crea el cuerpo de un bloque a partir de su figura actual. */
  function makeBody(block: Block, x: number, y: number) {
    const k = size / VIEWBOX;
    const verts = SHAPES[block.shape].pts.map(([px, py]) => ({ x: px * k, y: py * k }));
    const centre = Vertices.centre(verts);
    const body = Bodies.fromVertices(x, y, [verts], {
      restitution: 0.38,
      friction: 0.45,
      frictionAir: 0.012,
      density: 0.002,
      sleepThreshold: 45,
    });
    block.body = body;
    block.centroid = [centre.x, centre.y];
    block.el.style.width = `${size}px`;
    block.el.style.height = `${size}px`;
    block.el.style.transformOrigin = `${centre.x}px ${centre.y}px`;
    return body;
  }

  function build() {
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
    drags.clear();
    engine = Engine.create({ enableSleeping: true, gravity: { x: 0, y: 1.5, scale: 0.001 } });

    const t = 200;
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true, friction: 0.6 }),
      Bodies.rectangle(-t / 2, height / 2, t, height * 4, { isStatic: true }),
      Bodies.rectangle(width + t / 2, height / 2, t, height * 4, { isStatic: true }),
      Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, { isStatic: true }),
    ]);

    // Parrilla de salida: evita que los bloques nazcan encimados.
    const cols = width < 520 ? 4 : 5;
    const rows = Math.ceil(blocks.length / cols);
    const bodies = blocks.map((block, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const slot = width / (cols + 1);
      const body = makeBody(
        block,
        slot * (c + 1) + (Math.random() - 0.5) * slot * 0.3,
        size * 0.4 + (rows - 1 - r) * size * 0.62 + Math.random() * size * 0.1,
      );
      Body.setAngle(body, (Math.random() - 0.5) * 1.2);
      return body;
    });
    Composite.add(engine.world, bodies);
  }

  function render() {
    for (const block of blocks) {
      const body = block.body;
      if (!body) continue;
      const [cx, cy] = block.centroid;
      block.el.style.transform = `translate3d(${(body.position.x - cx).toFixed(2)}px, ${(body.position.y - cy).toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
    }
  }

  function allAsleep() {
    return drags.size === 0 && blocks.every((b) => !b.body || b.body.isSleeping);
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

  function settleNow() {
    for (let i = 0; i < 420; i++) Engine.update(engine!, 1000 / 60);
    render();
  }

  /** Deja caer los bloques: con reduced-motion se calcula el montón y se pinta una vez. */
  function start() {
    if (started) return;
    started = true;
    yard.classList.add("is-ready");
    if (reduced) return settleNow();
    render();
    run();
  }

  /* ── Doble clic / doble toque: siguiente figura y color ─────────────── */
  /** Una pieza del isotipo salta a una figura (nunca a otra pieza) y las figuras ciclan entre figuras. */
  function nextShape(block: Block): number {
    if (block.shape < PIECE_COUNT) return FIGURE_START + (block.home % (SHAPES.length - FIGURE_START));
    const next = block.shape + 1;
    if (next < SHAPES.length) return next;
    return block.home >= 0 ? block.home : FIGURE_START;
  }

  function morph(block: Block) {
    const old = block.body;
    if (!old || !engine) return;
    const { position, angle, velocity, angularVelocity } = old;

    for (const [id, drag] of drags) {
      if (drag.block === block) {
        Composite.remove(engine.world, drag.constraint);
        drags.delete(id);
      }
    }
    Composite.remove(engine.world, old);

    block.shape = nextShape(block);
    block.color = (block.color + 1) % COLORS.length;
    block.path.setAttribute("d", SHAPES[block.shape].d);
    block.path.setAttribute("fill", COLORS[block.color]);

    const body = makeBody(block, position.x, position.y);
    Body.setAngle(body, angle);
    Body.setVelocity(body, { x: velocity.x, y: Math.min(velocity.y, 0) - 4 });
    Body.setAngularVelocity(body, angularVelocity + (Math.random() - 0.5) * 0.2);
    Composite.add(engine.world, body);

    block.path.animate(
      [{ transform: "scale(1.35)" }, { transform: "scale(0.92)", offset: 0.6 }, { transform: "scale(1)" }],
      { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
    );
    run();
  }

  /* ── Arrastre con mouse y touch ─────────────────────────────────────── */
  function toLocal(e: PointerEvent): Pt {
    const r = yard.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function onDown(e: PointerEvent) {
    const el = e.currentTarget as SVGSVGElement;
    const block = blockByEl.get(el);
    if (!block?.body || reduced || !engine) return;
    el.setPointerCapture(e.pointerId);
    const [x, y] = toLocal(e);
    Sleeping.set(block.body, false);
    const constraint = Constraint.create({
      pointA: { x, y },
      bodyB: block.body,
      pointB: { x: x - block.body.position.x, y: y - block.body.position.y },
      stiffness: 0.16,
      damping: 0.12,
      length: 0,
    });
    Composite.add(engine.world, constraint);
    drags.set(e.pointerId, { constraint, block, x0: x, y0: y, t0: e.timeStamp });
    yard.classList.add("is-dragging");
    run();
  }

  function onMove(e: PointerEvent) {
    const drag = drags.get(e.pointerId);
    if (!drag?.block.body) return;
    const [x, y] = toLocal(e);
    drag.constraint.pointA = {
      x: Math.min(width, Math.max(0, x)),
      y: Math.min(height, Math.max(0, y)),
    };
    Sleeping.set(drag.block.body, false);
  }

  function onUp(e: PointerEvent) {
    const drag = drags.get(e.pointerId);
    if (!drag || !engine) return;
    Composite.remove(engine.world, drag.constraint);
    drags.delete(e.pointerId);
    if (!drags.size) yard.classList.remove("is-dragging");

    // Un toque corto sin desplazamiento cuenta para el doble toque.
    const [x, y] = toLocal(e);
    const isTap =
      e.type === "pointerup" &&
      e.timeStamp - drag.t0 < TAP_MS &&
      Math.hypot(x - drag.x0, y - drag.y0) < TAP_SLOP;
    if (isTap) {
      const prev = lastTap;
      if (
        prev &&
        prev.block === drag.block &&
        e.timeStamp - prev.t < TAP_MS &&
        Math.hypot(x - prev.x, y - prev.y) < TAP_SLOP * 2
      ) {
        lastTap = null;
        morph(drag.block);
        return;
      }
      lastTap = { block: drag.block, t: e.timeStamp, x, y };
    } else {
      lastTap = null;
    }
    run();
  }

  blocks.forEach(({ el }) => {
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
      if (!started) return;
      if (reduced) return settleNow();
      render();
      run();
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
    blocks.forEach(({ el }) => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.remove();
    });
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
  };
}
