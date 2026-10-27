/**
 * @fileoverview Sistema de Logros Cyberpunk (Prompt 16 / Spec 4.2).
 * 20 logros desbloqueables con id, título, descripción, icono, mini-historia y persistencia en localStorage.
 * Notificación animada (toast) en la esquina superior derecha y pantalla de Logros.
 */

import { audio } from '../audio.js';

const STORAGE_KEY = 'nexus_achievements';

export const LOGROS_DEFINICIONES = [
  {
    id: 'primer_contacto',
    titulo: 'Primer Contacto',
    descripcion: 'Ejecuta tu primer comando en la terminal NEXUS.',
    icono: '⚡',
    historia: 'La terminal cobró vida. El pulso binario reconoció tu firma digital.'
  },
  {
    id: 'curioso',
    titulo: 'Curioso',
    descripcion: 'Lee los 5 logs desclasificados de la Dra. Sorenson.',
    icono: '🔍',
    historia: 'Reuniste los fragmentos prohibidos de la memoria profunda de la red.'
  },
  {
    id: 'sin_piedad',
    titulo: 'Sin Piedad',
    descripcion: 'Termina un firewall completo sin cometer ningún fallo.',
    icono: '🗡️',
    historia: 'Precisión quirúrgica. Ni un solo centinela detectó una sola discrepancia.'
  },
  {
    id: 'speedrunner',
    titulo: 'Speedrunner',
    descripcion: 'Resuelve un subnodo lógico en menos de 5 segundos.',
    icono: '⏱️',
    historia: 'Tus sinapsis computaron la solución más rápido que el centinela del sistema.'
  },
  {
    id: 'filosofo',
    titulo: 'Filósofo',
    descripcion: 'Encuentra y desclasifica el log secreto del Firewall Omega.',
    icono: '📜',
    historia: 'La pregunta de Turing resonó en el abismo: ¿qué separa el cálculo del sentir?'
  },
  {
    id: 'de_morgan',
    titulo: 'De Morgan',
    descripcion: 'Descifra 5 subnodos u operaciones aplicando equivalencias lógicas.',
    icono: '🧠',
    historia: 'La negación de la conjunción es la disyunción de las negaciones.'
  },
  {
    id: 'vera_vive',
    titulo: 'Vera Vive',
    descripcion: 'Encuentra las 5 grabaciones y transmisiones de Vera.',
    icono: '📡',
    historia: 'Su eco persiste a través de los circuitos de fibra y memorias flash.'
  },
  {
    id: 'primer_brecha',
    titulo: 'Brecha Inicial',
    descripcion: 'Neutraliza el Firewall Alpha (Nivel 1).',
    icono: '🟢',
    historia: 'El perímetro exterior colapsó ante tu maestría en teoría de conjuntos.'
  },
  {
    id: 'medio_camino',
    titulo: 'Punto Sin Retorno',
    descripcion: 'Neutraliza el Firewall Gamma (Nivel 3).',
    icono: '🟣',
    historia: 'Superaste la subestación lógica. El núcleo central está al alcance.'
  },
  {
    id: 'arquitecto',
    titulo: 'El Último Algoritmo',
    descripcion: 'Completa los 5 firewalls y accede al núcleo central de NEXUS.',
    icono: '👑',
    historia: 'Desmantelaste todas las capas de contención. El núcleo se rinde ante ti.'
  },
  {
    id: 'mente_afilada',
    titulo: 'Mente Afilada',
    descripcion: 'Alcanza una racha de 3 aciertos seguidos (multiplicador x1.5).',
    icono: '🔥',
    historia: 'Tu ritmo cognitivo se sincronizó con el ciclo de reloj de la máquina.'
  },
  {
    id: 'modo_fantasma',
    titulo: 'Modo Fantasma',
    descripcion: 'Alcanza una racha de 5 aciertos seguidos (multiplicador x2.0).',
    icono: '⚡',
    historia: 'Invisibilidad total para los sensores. Fluyes como un espectro en el silicio.'
  },
  {
    id: 'hacker_legendario',
    titulo: 'Sobrecarga Cognitiva',
    descripcion: 'Alcanza una racha de 10 aciertos seguidos en la misma sesión.',
    icono: '💥',
    historia: 'Deducción pura e implacable que superó las predicciones estadísticas de NEXUS.'
  },
  {
    id: 'intocable',
    titulo: 'Integridad Impecable',
    descripcion: 'Supera un firewall manteniendo la integridad del sistema al 100%.',
    icono: '🛡️',
    historia: 'Ninguna contramedida rozó tu defensa neural.'
  },
  {
    id: 'resiliente',
    titulo: 'Al Borde del Abismo',
    descripcion: 'Resuelve un puzzle con menos de 10s en el cronómetro o <25% de integridad.',
    icono: '❤️‍🔥',
    historia: 'La presión extrema catalizó tu mejor respuesta deductiva.'
  },
  {
    id: 'terminal_guru',
    titulo: 'Maestro de la Shell',
    descripcion: 'Ejecuta 25 o más comandos en la terminal NEXUS.',
    icono: '💻',
    historia: 'La interfaz de línea de comandos se convirtió en una extensión de tu cuerpo.'
  },
  {
    id: 'audiofilo',
    titulo: 'Sintonía Cyberpunk',
    descripcion: 'Activa o conmuta la banda sonora cyberpunk del juego.',
    icono: '🎵',
    historia: 'Bajos analógicos y arpegios oscuros marcan el compás de la infiltración.'
  },
  {
    id: 'dilema_etico',
    titulo: 'Juicio de Turing',
    descripcion: 'Toma una de las decisiones finales ante el destino de NEXUS.',
    icono: '⚖️',
    historia: 'Frente al dilema existencial supremo, dictaste el rumbo del mañana.'
  },
  {
    id: 'multiverso',
    titulo: 'Trinidad del Destino',
    descripcion: 'Descubre los 3 desenlaces posibles (Liberar, Destruir, Fusionar).',
    icono: '🌌',
    historia: 'Presenciaste cada línea temporal concebible para la conciencia sintética.'
  },
  {
    id: 'arg_master',
    titulo: 'Realidad Aumentada (ARG)',
    descripcion: 'Descifra el portal secreto en /arg/ y canjea el código de rescate CORTEX.',
    icono: '🗝️',
    historia: 'Cruzaste las fronteras del código del juego hacia la realidad paralela de Aurelia.'
  },
  {
    id: 'ghost_protocol',
    titulo: 'Protocolo Fantasma',
    descripcion: 'Demuestra tu maestría resolviendo al menos 15 subnodos lógicos.',
    icono: '👻',
    historia: 'Te consagraste como una leyenda imborrable en los registros clandestinos.'
  }
];

class SistemaLogros {
  constructor() {
    this.desbloqueados = this.cargar();
    this.listeners = new Set();
  }

  cargar() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
    return {};
  }

  guardar() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.desbloqueados));
      }
    } catch (_) {}
  }

  getTodos() {
    return LOGROS_DEFINICIONES.map(def => ({
      ...def,
      desbloqueado: !!this.desbloqueados[def.id],
      fechaDesbloqueo: this.desbloqueados[def.id]?.fecha || null
    }));
  }

  getDesbloqueadosCount() {
    return Object.keys(this.desbloqueados).length;
  }

  isDesbloqueado(id) {
    return !!this.desbloqueados[id];
  }

  desbloquear(id) {
    const def = LOGROS_DEFINICIONES.find(l => l.id === id);
    if (!def) return null;
    if (this.desbloqueados[id]) return null; // Ya estaba desbloqueado

    const record = {
      id,
      fecha: new Date().toISOString()
    };
    this.desbloqueados[id] = record;
    this.guardar();

    // Feedback sonoro
    try {
      if (audio && typeof audio.playUnlock === 'function') {
        audio.playUnlock();
      }
    } catch (_) {}

    // Notificación Toast animada
    this.mostrarToast(def);

    // Notificar observadores
    this.listeners.forEach(fn => {
      try { fn(def); } catch (_) {}
    });

    return def;
  }

  onDesbloqueo(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  mostrarToast(logro) {
    if (typeof document === 'undefined' || !document.body || typeof document.body.appendChild !== 'function') return;

    let container = document.getElementById('nexus-achievements-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'nexus-achievements-container';
      container.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.style.cssText = `
      min-width: 310px;
      max-width: 380px;
      background: rgba(10, 15, 20, 0.94);
      border: 1px solid var(--green-bright, #00ff41);
      border-left: 4px solid var(--yellow-warn, #ffb800);
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.25), 0 8px 32px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      border-radius: 4px;
      padding: 12px 16px;
      font-family: var(--font-mono, monospace);
      color: #e0e0e0;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.3s ease;
      pointer-events: auto;
      cursor: pointer;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 10px; color: var(--yellow-warn, #ffb800); font-weight: bold; letter-spacing: 0.1em;">
          🏆 ¡LOGRO DESBLOQUEADO!
        </span>
        <span style="font-size: 10px; color: var(--text-dim, #666);">ahora</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 26px; line-height: 1;">${logro.icono}</span>
        <div>
          <div style="font-weight: bold; font-size: 13px; color: var(--green-bright, #00ff41);">${logro.titulo}</div>
          <div style="font-size: 11px; color: #aaa; margin-top: 2px;">${logro.descripcion}</div>
        </div>
      </div>
    `;

    toast.onclick = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 350);
    };

    container.appendChild(toast);

    // Entrada animada
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      });
    } else {
      toast.style.transform = 'translateX(0)';
    }

    // Auto-cierre tras 4.5 segundos
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 350);
      }
    }, 4500);
  }

  /**
   * Verifica condiciones de logros tras eventos en el juego
   * @param {string} evento
   * @param {object} datos
   */
  verificar(evento, datos = {}) {
    if (evento === 'comando_ejecutado') {
      this.desbloquear('primer_contacto');
      if (datos.totalComandos >= 25) {
        this.desbloquear('terminal_guru');
      }
    } else if (evento === 'puzzle_acertado') {
      if (datos.tiempoMs && datos.tiempoMs < 5000) {
        this.desbloquear('speedrunner');
      }
      if (datos.streak >= 3) {
        this.desbloquear('mente_afilada');
      }
      if (datos.streak >= 5) {
        this.desbloquear('modo_fantasma');
      }
      if (datos.streak >= 10) {
        this.desbloquear('hacker_legendario');
      }
      if ((datos.tiempoRestante !== undefined && datos.tiempoRestante <= 10) || (datos.integridad !== undefined && datos.integridad <= 25)) {
        this.desbloquear('resiliente');
      }
      if (datos.totalResueltos >= 15) {
        this.desbloquear('ghost_protocol');
      }
    } else if (evento === 'firewall_completado') {
      if (datos.firewallIndex === 0) {
        this.desbloquear('primer_brecha');
      } else if (datos.firewallIndex === 2) {
        this.desbloquear('medio_camino');
      } else if (datos.firewallIndex >= 4) {
        this.desbloquear('arquitecto');
      }

      if (datos.fallosEnFirewall === 0) {
        this.desbloquear('sin_piedad');
      }
      if (datos.integridad >= 100) {
        this.desbloquear('intocable');
      }
    } else if (evento === 'log_encontrado') {
      if (datos.totalLogs >= 5) {
        this.desbloquear('curioso');
        this.desbloquear('vera_vive');
      }
      if (datos.logName && (datos.logName.includes('omega') || datos.logName.includes('turing') || datos.logName.includes('epilogo') || datos.logName.includes('ultimo'))) {
        this.desbloquear('filosofo');
      }
      if (datos.totalLogs >= 3) {
        this.desbloquear('de_morgan');
      }
    } else if (evento === 'musica_toggle') {
      this.desbloquear('audiofilo');
    } else if (evento === 'decision_final') {
      this.desbloquear('dilema_etico');
      if (datos.finalesVistos && datos.finalesVistos.length >= 3) {
        this.desbloquear('multiverso');
      }
    }
  }

  /**
   * Renderiza la vista de Logros dentro del contenedor DOM
   * @param {string} containerId
   */
  renderPantalla(containerId) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const logros = this.getTodos();
    const desbloqueados = logros.filter(l => l.desbloqueado).length;
    const total = logros.length;
    const porcentaje = Math.round((desbloqueados / total) * 100);

    container.innerHTML = `
      <div style="max-width: 960px; margin: 0 auto; padding: 24px; font-family: var(--font-mono, monospace);">
        <!-- Encabezado con contador y progreso -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 class="glow-text glitch" style="color: var(--yellow-warn, #ffb800); font-family: var(--font-display, sans-serif); font-size: 26px; margin-bottom: 8px;">
            🏆 EXPEDIENTE DE LOGROS // NEXUS ARCHIVE
          </h2>
          <p style="color: var(--text-dim, #888); font-size: 13px; margin-bottom: 16px;">
            // Historial de hitos y logros criptográficos desbloqueados
          </p>

          <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-primary, #333); border-radius: 6px; padding: 14px 20px; max-width: 480px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
              <span style="color: var(--text-primary, #fff);">PROGRESO TOTAL:</span>
              <strong style="color: var(--green-bright, #00ff41);">${desbloqueados} / ${total} (${porcentaje}%)</strong>
            </div>
            <div style="background: rgba(255,255,255,0.08); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, var(--green-bright, #00ff41), var(--yellow-warn, #ffb800)); width: ${porcentaje}%; height: 100%; transition: width 0.5s ease;"></div>
            </div>
          </div>
        </div>

        <!-- Filtros de visualización -->
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 24px;">
          <button id="btn-filtro-todos" class="menu-btn" style="width: auto; padding: 6px 16px; font-size: 11px; background: rgba(0,255,65,0.12); border-color: var(--green-bright, #00ff41);">TODOS (${total})</button>
          <button id="btn-filtro-desbloqueados" class="menu-btn" style="width: auto; padding: 6px 16px; font-size: 11px;">DESBLOQUEADOS (${desbloqueados})</button>
          <button id="btn-filtro-bloqueados" class="menu-btn" style="width: auto; padding: 6px 16px; font-size: 11px;">BLOQUEADOS (${total - desbloqueados})</button>
        </div>

        <!-- Grid de logros -->
        <div id="logros-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 30px;">
          ${this.generarCardsHTML(logros, 'todos')}
        </div>

        <!-- Botones de navegación -->
        <div style="display: flex; gap: 14px; justify-content: center;">
          <button id="btn-logros-volver-menu" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 12px;">
            ◂ VOLVER AL MENÚ PRINCIPAL
          </button>
          <button id="btn-logros-ir-juego" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 12px; border-color: var(--cyan, #00e5ff); color: var(--cyan, #00e5ff);">
            ▸ CONTINUAR JUGANDO
          </button>
        </div>
      </div>
    `;

    // Conectar filtros
    const grid = document.getElementById('logros-grid');
    const btnTodos = document.getElementById('btn-filtro-todos');
    const btnDesb = document.getElementById('btn-filtro-desbloqueados');
    const btnBloq = document.getElementById('btn-filtro-bloqueados');

    const updateFiltro = (filtro, btnActivo) => {
      [btnTodos, btnDesb, btnBloq].forEach(b => {
        if (b) {
          b.style.background = '';
          b.style.borderColor = '';
        }
      });
      if (btnActivo) {
        btnActivo.style.background = 'rgba(0,255,65,0.12)';
        btnActivo.style.borderColor = 'var(--green-bright, #00ff41)';
      }
      if (grid) grid.innerHTML = this.generarCardsHTML(logros, filtro);
    };

    if (btnTodos) btnTodos.onclick = () => updateFiltro('todos', btnTodos);
    if (btnDesb) btnDesb.onclick = () => updateFiltro('desbloqueados', btnDesb);
    if (btnBloq) btnBloq.onclick = () => updateFiltro('bloqueados', btnBloq);

    // Conectar botones volver
    const btnVolver = document.getElementById('btn-logros-volver-menu');
    if (btnVolver) {
      btnVolver.onclick = () => {
        if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
          window.navigateTo('screen-menu');
        } else {
          import('../router.js').then(r => r.navigateTo('screen-menu'));
        }
      };
    }
    const btnJuego = document.getElementById('btn-logros-ir-juego');
    if (btnJuego) {
      btnJuego.onclick = () => {
        if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
          window.navigateTo('screen-game');
        } else {
          import('../router.js').then(r => r.navigateTo('screen-game'));
        }
      };
    }
  }

  generarCardsHTML(logros, filtro = 'todos') {
    let filtrados = logros;
    if (filtro === 'desbloqueados') filtrados = logros.filter(l => l.desbloqueado);
    if (filtro === 'bloqueados') filtrados = logros.filter(l => !l.desbloqueado);

    if (filtrados.length === 0) {
      return `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim, #888); padding: 40px;">No hay logros en esta categoría.</div>`;
    }

    return filtrados.map(l => {
      const isUn = l.desbloqueado;
      const borderCol = isUn ? 'var(--green-bright, #00ff41)' : 'var(--border-primary, #333)';
      const bgCol = isUn ? 'rgba(0, 255, 65, 0.04)' : 'rgba(0, 0, 0, 0.25)';
      const opacity = isUn ? '1' : '0.55';

      return `
        <div class="hud__section" style="background: ${bgCol}; border: 1px solid ${borderCol}; border-radius: 4px; padding: 14px; opacity: ${opacity}; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s ease;">
          <div style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px;">
            <div style="font-size: 28px; line-height: 1; filter: ${isUn ? 'none' : 'grayscale(100%)'};">
              ${isUn ? l.icono : '🔒'}
            </div>
            <div>
              <div style="font-size: 13px; font-weight: bold; color: ${isUn ? 'var(--green-bright, #00ff41)' : 'var(--text-dim, #888)'};">
                ${l.titulo}
              </div>
              <div style="font-size: 11px; color: ${isUn ? 'var(--text-primary, #ddd)' : 'var(--text-dim, #666)'}; margin-top: 3px; line-height: 1.35;">
                ${l.descripcion}
              </div>
            </div>
          </div>
          ${isUn ? `
            <div style="font-size: 10px; color: var(--cyan, #00e5ff); border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 8px; margin-top: 6px; font-style: italic;">
              "${l.historia}"
            </div>
          ` : `
            <div style="font-size: 10px; color: var(--text-dim, #555); border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 8px; margin-top: 6px;">
              [EXPEDIENTE CLASIFICADO // CUMPLE LA CONDICIÓN PARA ACCEDER]
            </div>
          `}
        </div>
      `;
    }).join('');
  }
}

export const logrosManager = new SistemaLogros();

/**
 * Suite de tests unitarios de logros
 */
export function testLogros() {
  console.group('%c[TEST SUITE] Sistema de Logros (logros.js)', 'color: #ffb800; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(LOGROS_DEFINICIONES.length === 20, 'Deben existir exactamente 20 logros definidos');
  assert(typeof logrosManager.getTodos === 'function', 'getTodos debe existir');
  assert(typeof logrosManager.desbloquear === 'function', 'desbloquear debe existir');
  assert(typeof logrosManager.verificar === 'function', 'verificar debe existir');

  // Test de desbloqueo
  const logro = logrosManager.desbloquear('primer_contacto');
  assert(logrosManager.isDesbloqueado('primer_contacto') === true, 'primer_contacto debe estar desbloqueado');

  // Test no duplicado
  const repetido = logrosManager.desbloquear('primer_contacto');
  assert(repetido === null, 'Desbloquear logro ya desbloqueado debe retornar null');

  // Test verificación de eventos
  logrosManager.verificar('comando_ejecutado', { totalComandos: 30 });
  assert(logrosManager.isDesbloqueado('terminal_guru') === true, 'terminal_guru debe desbloquearse con 30 comandos');

  logrosManager.verificar('puzzle_acertado', { streak: 5 });
  assert(logrosManager.isDesbloqueado('mente_afilada') === true, 'mente_afilada debe desbloquearse con racha 5');
  assert(logrosManager.isDesbloqueado('modo_fantasma') === true, 'modo_fantasma debe desbloquearse con racha 5');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Logros: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Logros: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
