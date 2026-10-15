/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Partículas — Sistema de Efectos Visuales Reactivos en Canvas
 * Especificación: Prompt 13 & Capa 2 (Sección 2.1) de SPEC_V2.MD
 * ══════════════════════════════════════════════════
 *
 * Características:
 * 1. Aciertos: Explosión radial de partículas luminosas con la paleta del firewall actual.
 * 2. Fallos: Ráfaga de glitch rojo y fragmentos de error caóticos.
 * 3. Descifrar logs: Humo binario de dígitos '0' y '1' flotando y desvaneciéndose.
 * 4. Completar firewall: Onda de choque expansiva + gran explosión de datos a pantalla completa.
 * 5. Eficiencia: El loop requestAnimationFrame se detiene automáticamente en 0 partículas (0% CPU en reposo).
 */

export const FIREWALL_PALETTES = [
  // FW1: Verde brillante
  { primary: '#00ff41', secondary: '#39ff14', accent: '#70ff70', glow: 'rgba(0, 255, 65, 0.85)' },
  // FW2: Verde + Ámbar
  { primary: '#00e575', secondary: '#ffb000', accent: '#ffd24d', glow: 'rgba(255, 176, 0, 0.85)' },
  // FW3: Verde + Violeta
  { primary: '#00e5a3', secondary: '#bd00ff', accent: '#e280ff', glow: 'rgba(189, 0, 255, 0.85)' },
  // FW4: Ámbar + Rojo
  { primary: '#ff9900', secondary: '#ff2a2a', accent: '#ff6666', glow: 'rgba(255, 42, 42, 0.85)' },
  // FW5: Rojo + Blanco + Azul
  { primary: '#ff1744', secondary: '#00d9ff', accent: '#ffffff', glow: 'rgba(255, 23, 68, 0.90)' }
];

class ReactiveParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.rings = [];
    this.animId = null;
    this.firewallIndex = 0;
    this.width = 0;
    this.height = 0;
    this._onResize = this.resize.bind(this);
  }

  /**
   * Inicializa el lienzo Canvas si está en el DOM del navegador.
   * @param {string} [canvasId='particles-canvas']
   */
  init(canvasId = 'particles-canvas') {
    if (typeof document === 'undefined') return;

    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'particles-canvas';
      this.canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999;
      `;
      document.body.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onResize);
      window.addEventListener('resize', this._onResize);
    }
  }

  resize() {
    if (!this.canvas || typeof window === 'undefined') return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * Actualiza el índice del firewall activo para teñir las partículas.
   * @param {number} fwIndex (0..4)
   */
  setFirewall(fwIndex = 0) {
    this.firewallIndex = Math.max(0, Math.min(FIREWALL_PALETTES.length - 1, fwIndex));
  }

  getPalette() {
    return FIREWALL_PALETTES[this.firewallIndex] || FIREWALL_PALETTES[0];
  }

  // ─────────────────────────────────────────────────
  // EMISORES DE EVENTOS DE PARTÍCULAS
  // ─────────────────────────────────────────────────

  /**
   * 1. Explosión radial de acierto con la paleta activa del firewall.
   * @param {number} [x]
   * @param {number} [y]
   * @param {number} [count=45]
   */
  emitSuccess(x, y, count = 45) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const px = (x != null) ? x : this.width * 0.5;
    const py = (y != null) ? y : this.height * 0.45;
    const pal = this.getPalette();
    const colors = [pal.primary, pal.secondary, pal.accent];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 2.5 + Math.random() * 7.5;
      const size = 2 + Math.random() * 4;
      const life = 35 + Math.floor(Math.random() * 25);

      this.particles.push({
        type: 'spark',
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
        drag: 0.94,
        gravity: 0.12,
        glow: pal.glow
      });
    }

    // Onda de choque sutil
    this.rings.push({
      x: px,
      y: py,
      radius: 4,
      maxRadius: 110,
      color: pal.primary,
      alpha: 0.9,
      decay: 0.035,
      lineWidth: 2.5
    });

    this.startLoop();
  }

  /**
   * 2. Glitch rojo de fallo / intrusión.
   * @param {number} [x]
   * @param {number} [y]
   * @param {number} [count=36]
   */
  emitError(x, y, count = 36) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const px = (x != null) ? x : this.width * 0.5;
    const py = (y != null) ? y : this.height * 0.45;
    const colors = ['#ff0040', '#ff3366', '#ff1744', '#ff8080'];

    for (let i = 0; i < count; i++) {
      const vx = (Math.random() * 16 - 8);
      const vy = (Math.random() * 8 - 4);
      const life = 18 + Math.floor(Math.random() * 16);

      this.particles.push({
        type: 'glitch',
        x: px + (Math.random() * 80 - 40),
        y: py + (Math.random() * 40 - 20),
        vx,
        vy,
        width: 4 + Math.random() * 18,
        height: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
        jitter: 4.5
      });
    }

    this.startLoop();
  }

  /**
   * 3. Humo binario al descifrar logs: dígitos '0' y '1' flotando hacia arriba.
   * @param {number} [x]
   * @param {number} [y]
   * @param {number} [count=28]
   */
  emitBinarySmoke(x, y, count = 28) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const px = (x != null) ? x : this.width * 0.5;
    const py = (y != null) ? y : this.height * 0.55;
    const chars = ['0', '1', '0', '1', '∧', '∨', '¬', '∩', '∪', 'λ'];
    const pal = this.getPalette();
    const colors = [pal.primary, '#00d9ff', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const life = 55 + Math.floor(Math.random() * 35);
      const char = chars[Math.floor(Math.random() * chars.length)];

      this.particles.push({
        type: 'binary',
        char,
        x: px + (Math.random() * 100 - 50),
        y: py + (Math.random() * 30 - 15),
        vx: (Math.random() * 1.6 - 0.8),
        vy: -(1.2 + Math.random() * 2.6),
        fontSize: 12 + Math.floor(Math.random() * 8),
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
        drift: 0.05
      });
    }

    this.startLoop();
  }

  /**
   * 4. Gran explosión de datos a pantalla completa al completar firewall.
   */
  emitFirewallBreach() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const pal = this.getPalette();
    const cx = this.width * 0.5;
    const cy = this.height * 0.45;

    // Tres ondas de choque expansivas sucesivas
    [0, 150, 300].forEach((delay, idx) => {
      setTimeout(() => {
        this.rings.push({
          x: cx,
          y: cy,
          radius: 10,
          maxRadius: Math.max(this.width, this.height) * 0.7,
          color: idx === 1 ? pal.secondary : pal.primary,
          alpha: 1.0,
          decay: 0.018,
          lineWidth: 4.0 - idx
        });
        this.startLoop();
      }, delay);
    });

    // Múltiples fuentes de fuegos artificiales digitales
    const origins = [
      { x: cx, y: cy },
      { x: cx - this.width * 0.25, y: cy + 40 },
      { x: cx + this.width * 0.25, y: cy + 40 }
    ];

    origins.forEach((origin, oIdx) => {
      setTimeout(() => {
        const particleCount = 65;
        const colors = [pal.primary, pal.secondary, pal.accent, '#ffffff'];

        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.3);
          const speed = 4 + Math.random() * 10;
          const life = 60 + Math.floor(Math.random() * 45);

          this.particles.push({
            type: 'spark',
            x: origin.x,
            y: origin.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2.5 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life,
            maxLife: life,
            drag: 0.95,
            gravity: 0.16,
            glow: pal.glow
          });
        }
        this.startLoop();
      }, oIdx * 180);
    });
  }

  // ─────────────────────────────────────────────────
  // BUCLE DE RENDERIZADO Y FÍSICA
  // ─────────────────────────────────────────────────

  startLoop() {
    if (this.animId) return;
    this.animId = requestAnimationFrame(() => this.updateAndRender());
  }

  stopLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  updateAndRender() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Renderizar anillos expansivos
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.radius += (ring.maxRadius - ring.radius) * 0.08 + 2;
      ring.alpha -= ring.decay;

      if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
        this.rings.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = ring.color;
      this.ctx.globalAlpha = Math.max(0, ring.alpha);
      this.ctx.lineWidth = ring.lineWidth;
      this.ctx.shadowColor = ring.color;
      this.ctx.shadowBlur = 14;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 2. Renderizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const progress = p.life / p.maxLife; // 1 -> 0
      this.ctx.save();

      if (p.type === 'spark') {
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        this.ctx.globalAlpha = progress;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.glow || p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(0.5, p.size * progress), 0, Math.PI * 2);
        this.ctx.fill();

      } else if (p.type === 'glitch') {
        p.x += p.vx + (Math.random() * p.jitter - p.jitter * 0.5);
        p.y += p.vy;

        this.ctx.globalAlpha = progress;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = '#ff0040';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);

      } else if (p.type === 'binary') {
        p.x += p.vx + Math.sin(p.life * 0.1) * p.drift;
        p.y += p.vy;

        this.ctx.globalAlpha = progress * 0.9;
        this.ctx.fillStyle = p.color;
        this.ctx.font = `${p.fontSize}px "JetBrains Mono", monospace`;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.fillText(p.char, p.x, p.y);
      }

      this.ctx.restore();
    }

    // Continuar el bucle solo mientras existan elementos vivos
    if (this.particles.length > 0 || this.rings.length > 0) {
      this.animId = requestAnimationFrame(() => this.updateAndRender());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Instancia singleton exportada
export const particulas = new ReactiveParticleEngine();

/**
 * Suite de tests unitarios de partículas.
 */
export function testParticulas() {
  console.group('%c[TEST SUITE] Partículas Reactivas (particulas.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(typeof particulas.emitSuccess === 'function', 'particulas.emitSuccess debe existir');
  assert(typeof particulas.emitError === 'function', 'particulas.emitError debe existir');
  assert(typeof particulas.emitBinarySmoke === 'function', 'particulas.emitBinarySmoke debe existir');
  assert(typeof particulas.emitFirewallBreach === 'function', 'particulas.emitFirewallBreach debe existir');
  assert(typeof particulas.setFirewall === 'function', 'particulas.setFirewall debe existir');
  assert(typeof particulas.getPalette === 'function', 'particulas.getPalette debe existir');

  // Test de asignación de paletas
  particulas.setFirewall(0);
  const pal0 = particulas.getPalette();
  assert(pal0.primary === '#00ff41', 'Paleta FW1 debe ser verde brillante');

  particulas.setFirewall(1);
  const pal1 = particulas.getPalette();
  assert(pal1.secondary === '#ffb000', 'Paleta FW2 debe incluir ámbar');

  particulas.setFirewall(2);
  const pal2 = particulas.getPalette();
  assert(pal2.secondary === '#bd00ff', 'Paleta FW3 debe incluir violeta');

  particulas.setFirewall(3);
  const pal3 = particulas.getPalette();
  assert(pal3.primary === '#ff9900', 'Paleta FW4 debe ser ámbar');

  particulas.setFirewall(4);
  const pal4 = particulas.getPalette();
  assert(pal4.primary === '#ff1744', 'Paleta FW5 debe ser roja');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Partículas: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Partículas: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
