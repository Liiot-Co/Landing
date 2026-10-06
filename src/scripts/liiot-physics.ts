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
 * Secuencia de entrada: primero se muestra el logo ARMADO al centro (las 4
 * piezas comparten el mismo origen visual) y, tras ~1.4s, se libera la
 * física y las figuras llueven sobre él para desarmarlo.
 *
 * Rendimiento:
 * - Matter se carga con import dinámico solo cuando el patio está cerca de la pantalla.
 * - Sin canvas: cada bloque es un SVG movido con `transform`.
 * - Los cuerpos duermen al quedar quietos y el loop se detiene hasta la próxima interacción.
 * - El loop también se pausa fuera de pantalla y con la pestaña oculta.
 * - `prefers-reduced-motion`: queda solo el logo armado estático, sin loop
 *   ni interacción.
 *
 * Sugerencia: cuando los bloques se asientan por primera vez, una mano arrastra uno
 * de ellos (con la misma física que un arrastre real) para mostrar que se pueden
 * mover; se cancela en cuanto la persona toca algo.
 *
 * Chispas: cada cambio de figura emite chispas en el mismo instante, desde el bloque.
 *
 * Touch: solo la silueta de cada bloque captura el dedo (`touch-action: none`).
 * Tocar el espacio vacío sigue haciendo scroll en la página.
 */

import { burst } from "./liiot-burst";

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
  /** `true` cuando los cuerpos actuales ya son dinámicos (logo liberado). */
  let released = false;
  /** `true` cuando el usuario ya vio el logo armado (los resize liberan rápido). */
  let assemblyShown = false;
  let releaseTimer = 0;
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

  /** Mano de la sugerencia de arrastre (lucide "hand"). */
  const hand = document.createElement("div");
  hand.className = "logo-hand";
  hand.setAttribute("aria-hidden", "true");
  hand.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/>' +
    '<path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>' +
    '<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>';
  yard.appendChild(hand);

  let hintPlayed = false;
  let hintActive = false;
  let hintRaf = 0;
  let hintTimer = 0;
  let hintDrag: Matter.Constraint | null = null;

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
    // Piso + paredes laterales. Sin techo: las figuras esperan ARRIBA del
    // patio y llueven sobre el logo al liberarlo; la gravedad las devuelve
    // si un impulso las saca por arriba.
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true, friction: 0.6 }),
      Bodies.rectangle(-t / 2, height / 2, t, height * 4, { isStatic: true }),
      Bodies.rectangle(width + t / 2, height / 2, t, height * 4, { isStatic: true }),
    ]);

    // Estado inicial: el logo ARMADO al centro (las 4 piezas comparten el
    // mismo origen visual, así forman el isotipo) y las 6 figuras en espera
    // arriba, fuera de vista. Todo nace congelado (`isStatic`) para que lo
    // primero que se vea sea el logo completo; `releaseAssembled` lo libera.
    // Con `reduced-motion` queda solo el logo armado estático, sin figuras.
    const assemblyX = width / 2 - size / 2;
    const assemblyY = Math.max(8, height * 0.22 - size / 2);
    const bodies: Matter.Body[] = [];
    blocks.forEach((block, i) => {
      if (i < PIECE_COUNT) {
        // Se crea y luego se realinea por centroide: el render pinta cada
        // SVG en `body.position - centroid`, así que igualar ese origen en
        // las 4 piezas arma el logo.
        const body = makeBody(block, width / 2, assemblyY + size / 2);
        Body.setPosition(body, {
          x: assemblyX + block.centroid[0],
          y: assemblyY + block.centroid[1],
        });
        Body.setAngle(body, 0);
        Body.setStatic(body, true);
        bodies.push(body);
        return;
      }
      if (reduced) {
        // Sin movimiento: solo el logo armado, las figuras se ocultan.
        block.el.style.display = "none";
        block.body = null;
        return;
      }
      const j = i - FIGURE_START;
      const slot = width / (SHAPES.length - FIGURE_START + 1);
      // En espera arriba, fuera de vista e invisibles hasta la liberación.
      block.el.style.display = "";
      block.el.style.opacity = "0";
      const body = makeBody(
        block,
        slot * (j + 1) + (Math.random() - 0.5) * slot * 0.3,
        -size * 0.6 - j * size * 0.55,
      );
      Body.setAngle(body, (Math.random() - 0.5) * 1.2);
      Body.setStatic(body, true);
      bodies.push(body);
    });
    Composite.add(engine.world, bodies);
    released = false;
  }

  /** Libera el logo armado: las figuras llueven y las piezas se dispersan. */
  function releaseAssembled() {
    if (!engine || released || disposed) return;
    released = true;
    const firstTime = !assemblyShown;
    assemblyShown = true;
    blocks.forEach((block, i) => {
      const body = block.body;
      if (!body) return;
      if (i >= PIECE_COUNT) block.el.style.opacity = "";
      Body.setStatic(body, false);
      Sleeping.set(body, false);
      if (firstTime && i < PIECE_COUNT) {
        // Pequeño impulso lateral para garantizar que el logo se desarma
        // aunque las figuras no lo golpeen de lleno.
        const dir = i % 2 === 0 ? -1 : 1;
        Body.setVelocity(body, { x: dir * (0.8 + Math.random()), y: -1 - Math.random() });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
      }
    });
    run();
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
    return drags.size === 0 && !hintActive && blocks.every((b) => !b.body || b.body.isSleeping);
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(32, last ? now - last : 16.7);
    last = now;
    Engine.update(engine!, dt);
    render();
    if (allAsleep()) {
      stop();
      scheduleHint();
    }
  }

  function run() {
    if (raf || reduced || !started || !released || !visible || document.hidden || disposed) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /** Muestra el logo armado primero; la física se libera con retardo. */
  function start() {
    if (started) return;
    started = true;
    yard.classList.add("is-ready");
    render();
    // Con `reduced-motion` no hay loop ni interacción: queda el logo armado.
    if (reduced) return;
    clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(releaseAssembled, assemblyShown ? 200 : 1400);
  }

  /* ── Sugerencia: una mano arrastra un bloque ───────────────────────── */
  function abortHint() {
    clearTimeout(hintTimer);
    cancelAnimationFrame(hintRaf);
    hintRaf = 0;
    if (hintDrag && engine) Composite.remove(engine.world, hintDrag);
    hintDrag = null;
    hintActive = false;
    hand.style.opacity = "0";
  }

  function scheduleHint() {
    if (hintPlayed || reduced || hintActive) return;
    clearTimeout(hintTimer);
    hintTimer = window.setTimeout(playHint, 700);
  }

  function playHint() {
    if (hintPlayed || reduced || !engine || !visible || document.hidden || drags.size) return;
    const block = blocks[5] ?? blocks[blocks.length - 1];
    const body = block?.body;
    if (!body) return;
    hintPlayed = true;
    hintActive = true;

    const x0 = body.position.x;
    const y0 = body.position.y;
    const dir = x0 > width / 2 ? -1 : 1;
    const dx = dir * Math.min(width * 0.16, 130);
    const dy = -Math.min(height * 0.6, 120);
    const IN = 450;
    const PRESS = 250;
    const MOVE = 1100;
    const HOLD = 150;
    const OUT = 350;
    const moveAt = IN + PRESS;
    const releaseAt = moveAt + MOVE + HOLD;
    const endAt = releaseAt + OUT;
    const t0 = performance.now();

    function frame(now: number) {
      const t = now - t0;
      let px = x0;
      let py = y0;
      if (t >= moveAt) {
        const k = Math.min(1, (t - moveAt) / MOVE);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        px = x0 + dx * e;
        py = y0 + dy * e;
      }
      // Punto de agarre de la mano ≈ (26, 19) dentro de su caja de 56px.
      hand.style.transform = `translate3d(${(px - 26).toFixed(1)}px, ${(py - 19).toFixed(1)}px, 0) scale(${t >= IN && t < releaseAt ? 0.9 : 1})`;
      hand.style.opacity =
        t < IN ? String(t / IN) : t > releaseAt ? String(Math.max(0, 1 - (t - releaseAt) / OUT)) : "1";

      if (t >= IN && !hintDrag && t < releaseAt && engine && body) {
        Sleeping.set(body, false);
        hintDrag = Constraint.create({
          pointA: { x: x0, y: y0 },
          bodyB: body,
          pointB: { x: x0 - body.position.x, y: y0 - body.position.y },
          stiffness: 0.16,
          damping: 0.12,
          length: 0,
        });
        Composite.add(engine.world, hintDrag);
      }
      if (hintDrag) hintDrag.pointA = { x: px, y: py };
      if (t >= releaseAt && hintDrag && engine) {
        Composite.remove(engine.world, hintDrag);
        hintDrag = null;
      }

      run();
      if (t >= endAt) {
        hintActive = false;
        hintRaf = 0;
        hand.style.opacity = "0";
        return;
      }
      hintRaf = requestAnimationFrame(frame);
    }

    hand.style.transform = `translate3d(${x0 - 26}px, ${y0 - 19}px, 0)`;
    hintRaf = requestAnimationFrame(frame);
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

    // Chispas en el mismo instante del cambio de figura, desde el propio bloque.
    burst(yard, { count: 8, origin: { x: position.x, y: position.y } });

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
    abortHint();
    hintPlayed = true;
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
      abortHint();
      clearTimeout(releaseTimer);
      build();
      if (!started) return;
      render();
      if (reduced) return;
      releaseTimer = window.setTimeout(releaseAssembled, assemblyShown ? 200 : 1400);
    }, 200);
  });
  ro.observe(yard);

  return () => {
    disposed = true;
    stop();
    abortHint();
    clearTimeout(releaseTimer);
    hand.remove();
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
