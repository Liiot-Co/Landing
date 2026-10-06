/**
 * AuroraGradientRenderer
 * 
 * Procedural WebGL2 + GLSL background renderer.
 * Produces broad, organic airbrush-diffused gradients with deep purple,
 * violet, soft magenta, warm orange, peach and cream glow.
 * 
 * Features:
 * - Pure native WebGL2 (zero dependencies)
 * - Single draw call via fullscreen triangle (no VBOs/buffers needed)
 * - Smooth domain warping & multi-layer diffuse blending
 * - Cinematic fine grain (0.02–0.04) to eliminate color banding
 * - Ultra-slow breathing animation (uTime * 0.035)
 * - DPR clamp (1.5 desktop / 1.25 mobile)
 * - Respects prefers-reduced-motion (renders static single frame)
 * - Auto pause on document.hidden
 * - Clean teardown & memory release
 */

const VERTEX_SHADER = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  // Generates a fullscreen triangle covering [-1, 3] without vertex buffers
  float x = -1.0 + float((gl_VertexID & 1) << 2);
  float y = -1.0 + float((gl_VertexID & 2) << 1);
  vUv = vec2(x * 0.5 + 0.5, y * 0.5 + 0.5);
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDpr;

// ── PALETA DE ALTO CONTRASTE: ENFOQUE EN MORADO Y NARANJA VIBRANTE ──
const vec3 cPurpleDark   = vec3(0.080, 0.020, 0.155); // #140527 - Morado medianoche profundo
const vec3 cPurpleMid    = vec3(0.245, 0.065, 0.420); // #3E106B - Morado / Violeta atmosférico
const vec3 cPinkVibrant  = vec3(0.550, 0.090, 0.310); // #8C174F - Rosa frambuesa armónico
const vec3 cPinkSoft     = vec3(0.680, 0.150, 0.410); // #AE2669 - Rosa difuso
const vec3 cOrangeDeep   = vec3(0.720, 0.280, 0.045); // #B8470B - Naranja ámbar cálido e intenso
const vec3 cOrangeBright = vec3(0.880, 0.420, 0.080); // #E06B14 - Naranja luminoso y protagónico

// ── RUIDO SUAVE Y CONTINUO (VALUE NOISE CON INTERPOLACIÓN QUÍNTICA) ──
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Curva hermítica de grado 5 (C2 continua, sin aristas visibles)
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// FBM ligero de 3 octavas para preservar máxima suavidad y alta tasa de cuadros
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 3; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Normalizar coordenadas respetando relación de aspecto
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(st.x * aspect, st.y);

  // Velocidad de respiración visual sutil
  float t = uTime * 0.032;

  // 1. Matriz de rotación diagonal (-28° para un flujo asimétrico orgánico)
  float angle = -0.488;
  mat2 rotDiag = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 pRot = rotDiag * (p - vec2(0.5 * aspect, 0.5));

  // 2. DOMAIN WARPING SUAVE:
  // Gran deformación de baja frecuencia que crea valles y pliegues difusos
  vec2 q = vec2(
    fbm(pRot * 1.1 + vec2(t * 0.4, -t * 0.3)),
    fbm(pRot * 1.1 + vec2(-t * 0.35, t * 0.45) + vec2(5.2, 1.3))
  );

  vec2 r = vec2(
    fbm(pRot * 1.3 + 2.2 * q + vec2(t * 0.25, -t * 0.2) + vec2(1.7, 9.2)),
    fbm(pRot * 1.3 + 2.2 * q + vec2(-t * 0.3, t * 0.25) + vec2(8.3, 2.8))
  );

  // Masa fluida principal
  float warpVal = fbm(pRot * 0.9 + 2.6 * r + vec2(t * 0.15, -t * 0.1));

  // Campo escalar de flujo normalizado en [0, 1]
  float flow = clamp(warpVal * 0.70 + (1.0 - st.y * 0.75 + st.x * 0.25) * 0.40 + (r.x - 0.5) * 0.35, 0.0, 1.0);

  // 1. MORADO: Fondo aterciopelado de morado profundo a violeta
  vec3 col = mix(cPurpleDark, cPurpleMid, smoothstep(0.02, 0.44, flow));

  // 2. ROSADO: Velo de transición armónica entre morado y naranja
  float pinkMask = smoothstep(0.40, 0.52, flow) * (1.0 - smoothstep(0.60, 0.72, flow));
  vec3 pinkTone = mix(cPinkVibrant, cPinkSoft, 0.50);
  col = mix(col, pinkTone, pinkMask * 0.82);

  // 3. NARANJA EXPANDIDO Y PROTAGÓNICO:
  // Masas cálidas, vivas y expansivas en las crestas y diagonales
  float orangeMask = smoothstep(0.50, 0.78, flow);
  vec3 orangeTone = mix(cOrangeDeep, cOrangeBright, smoothstep(0.58, 0.90, flow));
  col = mix(col, orangeTone, orangeMask * 0.95);

  // Flujo diagonal cálido de naranja reforzado en el cuadrante superior y central
  float warmSweep = smoothstep(0.42, 0.82, (1.0 - st.y * 0.65 + st.x * 0.35) * 0.55 + warpVal * 0.45);
  col = mix(col, cOrangeDeep, warmSweep * 0.50);

  // Valles inferiores reforzados en morado profundo para máxima legibilidad
  float deepShadow = smoothstep(0.30, 0.04, flow + st.y * 0.35);
  col = mix(col, cPurpleDark * 0.9, deepShadow * 0.52);

  // 8. GRANO CINEMATOGRÁFICO FINO (0.028)
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.028;

  // Garantizar rango tonal en [0, 1]
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export type CleanupFn = () => void;

export class AuroraGradientRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uDprLoc: WebGLUniformLocation | null = null;
  private vao: WebGLVertexArrayObject | null = null;

  private rafId: number | null = null;
  private startTime = 0;
  private isDestroyed = false;
  private isPaused = false;
  private prefersReducedMotion = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init() {
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Inicializar WebGL2 optimizado para consumo mínimo de batería
    this.gl = this.canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!this.gl) {
      console.warn("WebGL2 no soportado; aplicando fallback visual CSS.");
      this.applyFallback();
      return;
    }

    const gl = this.gl;

    // Compilar shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    if (!this.program) return;

    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error("Error enlazando shader WebGL2:", gl.getProgramInfoLog(this.program));
      return;
    }

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    // Uniforms
    this.uResolutionLoc = gl.getUniformLocation(this.program, "uResolution");
    this.uTimeLoc = gl.getUniformLocation(this.program, "uTime");
    this.uDprLoc = gl.getUniformLocation(this.program, "uDpr");

    // VAO vacío requerido por la especificación WebGL2 para dibujar sin atributos
    this.vao = gl.createVertexArray();

    // Listeners de visibilidad y resize
    this.handleVisibility = this.handleVisibility.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibility);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);

    this.resize();
    this.startTime = performance.now();

    if (this.prefersReducedMotion) {
      // Renderizar un solo frame estático
      this.renderFrame(0);
    } else {
      this.loop = this.loop.bind(this);
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Error compilando GLSL shader:", this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private resize() {
    if (!this.gl || this.isDestroyed) return;

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    const isMobile = window.innerWidth < 768;

    // DPR limitado para asegurar 60fps estables en cualquier GPU integrada o móvil
    const maxDpr = isMobile ? 1.25 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    const targetW = Math.max(1, Math.floor(width * dpr));
    const targetH = Math.max(1, Math.floor(height * dpr));

    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
      this.gl.viewport(0, 0, targetW, targetH);

      if (this.prefersReducedMotion) {
        this.renderFrame(0);
      }
    }
  }

  private renderFrame(timeSec: number) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    if (this.uResolutionLoc) {
      gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);
    }
    if (this.uTimeLoc) {
      gl.uniform1f(this.uTimeLoc, timeSec);
    }
    if (this.uDprLoc) {
      gl.uniform1f(this.uDprLoc, Math.min(window.devicePixelRatio || 1, 1.5));
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  private loop(now: number) {
    if (this.isDestroyed || this.isPaused) return;

    const elapsed = (now - this.startTime) * 0.001;
    this.renderFrame(elapsed);

    this.rafId = requestAnimationFrame(this.loop);
  }

  private handleVisibility() {
    if (document.hidden) {
      this.isPaused = true;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else {
      if (this.isPaused && !this.prefersReducedMotion && !this.isDestroyed) {
        this.isPaused = false;
        this.rafId = requestAnimationFrame(this.loop);
      }
    }
  }

  private applyFallback() {
    const parent = this.canvas.parentElement;
    if (parent) {
      parent.style.background =
        "linear-gradient(135deg, #5B1D8F 0%, #7A35C8 30%, #E34FA8 60%, #F59A2E 100%)";
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    document.removeEventListener("visibilitychange", this.handleVisibility);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.gl) {
      if (this.program) {
        this.gl.deleteProgram(this.program);
        this.program = null;
      }
      if (this.vao) {
        this.gl.deleteVertexArray(this.vao);
        this.vao = null;
      }
      const loseContext = this.gl.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
      this.gl = null;
    }
  }
}

/**
 * Función factory de inicialización rápida con retorno de cleanup.
 */
export function initAuroraGradient(canvas: HTMLCanvasElement): CleanupFn {
  const renderer = new AuroraGradientRenderer(canvas);
  return () => renderer.destroy();
}
