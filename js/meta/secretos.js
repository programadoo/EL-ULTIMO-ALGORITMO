/**
 * @fileoverview Sistema de Secretos, Meta-narrativa y Evento Metaficcional del Firewall 3 (Spec V4).
 * (1) Comentarios ocultos en HTML y CSS.
 * (2) Konami code activa "modo Matrix".
 * (3) Escribir `sudo su` da mensaje + bonus.
 * (4) Escribir `42` da easter egg.
 * (5) Mensaje de "Ghost, ¿estás bien?" si el jugador lleva 20 min sin pausa.
 * (6) Saludo en la consola del navegador al abrir DevTools.
 * (7) Evento Metaficcional del Firewall 3 (Spec V4 - Acto 2B):
 *     - Se dispara cuando el jugador lleva ~20 minutos (1200s) en el Firewall 3 (FIREWALL_gamma).
 *     - Simula un fallo de sistema de 2 segundos (pantalla en negro total + sonido cortado).
 *     - Muestra "ERROR DE SISTEMA — Reconectando..." y el mensaje directo de NEXUS en el navegador.
 *     - Cambia dinámicamente el título de la pestaña a "NEXUS te está mirando".
 *     - Reemplaza el favicon por un icono de un ojo que parpadea.
 *     - Inserta un mensaje oculto en la consola de desarrollador (DevTools) dirigido al hacker.
 *     - Tras 15 segundos, restaura la interfaz con normalidad y escribe la disculpa de NEXUS en la terminal.
 */

import { audio, speechEngine } from '../audio.js';
import { getState, update, subscribe } from '../state.js';
import { showFeedbackToast } from '../ui/feedback.js';
import { ESCENA_METAFICCION_FW3, adaptarTextoProtagonista } from '../historia/guion.js';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

// SVGs codificados como Data URI para el favicon original y el ojo parpadeante de NEXUS
export const FAVICON_TERMINAL_DEFAULT = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23050a06' stroke='%2300ff41' stroke-width='2'/><text x='6' y='21' font-family='monospace' font-size='14' font-weight='bold' fill='%2300ff41'>&gt;_</text></svg>";

export const FAVICON_NEXUS_EYE_OPEN = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23000000'/><path d='M2 16 Q16 3 30 16 Q16 29 2 16 Z' fill='%23051510' stroke='%2300ff41' stroke-width='2'/><circle cx='16' cy='16' r='6' fill='%2300e5ff'><animate attributeName='r' values='5;6.5;5' dur='0.8s' repeatCount='indefinite'/></circle><circle cx='16' cy='16' r='2.5' fill='%23ff0055'/><circle cx='14' cy='14' r='1' fill='%23ffffff'/></svg>";

export const FAVICON_NEXUS_EYE_BLINK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23000000'/><path d='M3 16 Q16 20 29 16' fill='none' stroke='%2300ff41' stroke-width='2.5' stroke-linecap='round'/><line x1='8' y1='18' x2='6' y2='22' stroke='%2300ff41' stroke-width='1.5'/><line x1='16' y1='19' x2='16' y2='24' stroke='%2300ff41' stroke-width='1.5'/><line x1='24' y1='18' x2='26' y2='22' stroke='%2300ff41' stroke-width='1.5'/></svg>";

class SecretosManager {
  constructor() {
    this.konamiBuffer = [];
    this.sudoBonusClaimed = false;
    this.aviso20MinDisparado = false;
    this.tiempoInicioSesion = Date.now();
    this.timer20MinInterval = null;

    // Estado del Evento Metaficcional del Firewall 3 (Spec V4)
    this.tiempoInicioFirewall3 = null;
    this.umbralFirewall3Ms = 20 * 60 * 1000; // ~20 minutos (1,200,000 ms)
    this.eventoMetaficcionalFW3Disparado = false;
    this.eventoMetaficcionalActivo = false;
    this.tituloOriginal = 'El Último Algoritmo — NEXUS Terminal';
    this.faviconOriginalHref = FAVICON_TERMINAL_DEFAULT;
    this.faviconBlinkInterval = null;
    this.timerFaseFallo = null;
    this.timerRestauracion = null;
    this.musicaEstabaActiva = false;
    this.ultimoMensajeDevToolsFW3 = null;
    this.unsubscribeState = null;
  }

  /**
   * Inicializa los listeners globales de secretos y meta-narrativa.
   */
  init() {
    this.initKonamiListener();
    this.initDevToolsGreeting();
    this.init20MinTimer();
    this.initFirewall3Observer();
  }

  /**
   * Observa cambios de firewall en el estado para iniciar o reiniciar el contador del Firewall 3.
   */
  initFirewall3Observer() {
    const state = getState();
    this.notificarCambioFirewall(state.currentFirewall || 0);

    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
    this.unsubscribeState = subscribe((prev, next) => {
      if (!prev || prev.currentFirewall !== next.currentFirewall) {
        this.notificarCambioFirewall(next.currentFirewall || 0);
      }
    });
  }

  /**
   * Registra cuándo el jugador entra o sale del Firewall 3 (índice 2 / FIREWALL_gamma).
   * @param {number} firewallIdx — 0-indexed (2 corresponde al Firewall 3)
   */
  notificarCambioFirewall(firewallIdx) {
    if (firewallIdx === 2) {
      if (this.tiempoInicioFirewall3 === null) {
        this.tiempoInicioFirewall3 = Date.now();
      }
    } else {
      this.tiempoInicioFirewall3 = null;
      if (this.eventoMetaficcionalActivo) {
        this.restaurarInterfazMetaficcional({ silencioso: true });
      }
    }
  }

  /**
   * Saludo temático inicial en DevTools (Spec 3.2 / Prompt 18).
   */
  initDevToolsGreeting() {
    if (typeof console === 'undefined') return;
    try {
      console.log(
        '%c╔══════════════════════════════════════════════════════════════════╗\n' +
        '║  [NEXUS DEVTOOLS // TERMINAL CONSOLE DETECTED]                   ║\n' +
        '║  Veo que sabes lo que haces, Ghost.                              ║\n' +
        '║  El firewall 3 tiene un archivo clasificado en /hidden/.         ║\n' +
        '║  La verdad sobre Aurelia no está en los registros oficiales. —V  ║\n' +
        '╚══════════════════════════════════════════════════════════════════╝',
        'color: #00ff41; font-family: monospace; font-size: 12px; font-weight: bold; background: #030804; padding: 10px; border: 1px solid #00ff41; border-radius: 4px; line-height: 1.4;'
      );
    } catch (_) {}
  }

  /**
   * Detector de Konami Code en el teclado.
   */
  initKonamiListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const expectedKey = KONAMI_SEQUENCE[this.konamiBuffer.length].toLowerCase();

      if (key === expectedKey) {
        this.konamiBuffer.push(key);
        if (this.konamiBuffer.length === KONAMI_SEQUENCE.length) {
          this.activarModoMatrix();
          this.konamiBuffer = [];
        }
      } else {
        if (key === KONAMI_SEQUENCE[0].toLowerCase()) {
          this.konamiBuffer = [key];
        } else {
          this.konamiBuffer = [];
        }
      }
    });
  }

  /**
   * Activa el "Modo Matrix" con animación de lluvia y sonido especial.
   */
  activarModoMatrix() {
    try {
      if (audio && typeof audio.playTwistNote === 'function') {
        audio.playTwistNote();
      }
    } catch (_) {}

    showFeedbackToast('⚡ [KONAMI PROTOCOL ACTIVADO] // Entrando en Modo Matrix Neural...', 'success', 4000);

    if (typeof window !== 'undefined' && typeof window.startMatrixRain === 'function') {
      window.startMatrixRain();
      setTimeout(() => {
        if (typeof window.stopMatrixRain === 'function' && window.currentScreen === 'screen-game') {
          window.stopMatrixRain();
        }
      }, 10000);
    }

    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('flash-screen');
      setTimeout(() => document.body.classList.remove('flash-screen'), 800);
    }

    if (typeof window !== 'undefined' && window.terminal && typeof window.terminal.print === 'function') {
      window.terminal.print('>>> [EASTER EGG] PROTOCOLO KONAMI DETECTADO: Matrix Override activado.', 'line--success');
    }
  }

  /**
   * Temporizador periódico que comprueba tanto los 20 minutos globales como los ~20 minutos en el Firewall 3.
   */
  init20MinTimer() {
    if (typeof setInterval === 'undefined') return;
    if (this.timer20MinInterval) clearInterval(this.timer20MinInterval);

    this.timer20MinInterval = setInterval(() => {
      this.verificarTiempoFirewall3();
      this.verificarTiempoSinPausa();
    }, 5000);
  }

  /**
   * Comprueba si el jugador lleva ~20 minutos en el Firewall 3 (FIREWALL_gamma)
   * y dispara el evento metaficcional si corresponde.
   * @param {number} [ahoraMs] — timestamp opcional para pruebas
   * @returns {boolean} true si se disparó el evento
   */
  verificarTiempoFirewall3(ahoraMs = Date.now()) {
    if (this.eventoMetaficcionalFW3Disparado || this.eventoMetaficcionalActivo) return false;

    const state = getState();
    const enFirewall3 = state.currentFirewall === 2 || state.firewallActual === 3;
    if (!enFirewall3) return false;

    if (this.tiempoInicioFirewall3 === null) {
      this.tiempoInicioFirewall3 = ahoraMs;
      return false;
    }

    const transcurridoMs = ahoraMs - this.tiempoInicioFirewall3;
    if (transcurridoMs >= this.umbralFirewall3Ms) {
      this.dispararEventoMetaficcionalFW3();
      return true;
    }
    return false;
  }

  /**
   * Asegura que exista el elemento <link id="dynamic-favicon" rel="icon"> en document.head.
   * @returns {HTMLLinkElement|null}
   */
  obtenerElementoFavicon() {
    if (typeof document === 'undefined' || !document.head) return null;
    let link = document.getElementById('dynamic-favicon') || document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-favicon';
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = FAVICON_TERMINAL_DEFAULT;
      document.head.appendChild(link);
    }
    return link;
  }

  /**
   * Activa el favicon de un ojo que parpadea dinámicamente en la pestaña del navegador.
   */
  activarFaviconOjoParpadeante() {
    const link = this.obtenerElementoFavicon();
    if (!link) return;

    if (this.faviconBlinkInterval) {
      clearInterval(this.faviconBlinkInterval);
    }

    let ojoAbierto = true;
    link.href = FAVICON_NEXUS_EYE_OPEN;

    this.faviconBlinkInterval = setInterval(() => {
      ojoAbierto = !ojoAbierto;
      link.href = ojoAbierto ? FAVICON_NEXUS_EYE_OPEN : FAVICON_NEXUS_EYE_BLINK;
    }, 550);
  }

  /**
   * Inserta el mensaje oculto de NEXUS en la consola de desarrollador (DevTools) dirigido al hacker.
   */
  insertarMensajeDevToolsFW3() {
    const msg = (ESCENA_METAFICCION_FW3 && ESCENA_METAFICCION_FW3.mensajeDevTools)
      ? ESCENA_METAFICCION_FW3.mensajeDevTools
      : 'Hola, hacker. Veo que eres curioso.\nEso me gusta.\n—N';

    this.ultimoMensajeDevToolsFW3 = msg;

    if (typeof console !== 'undefined') {
      try {
        console.log(
          `%c${msg}`,
          'color: #00e5ff; background: #000000; font-family: "JetBrains Mono", monospace; font-size: 14px; font-weight: bold; padding: 12px 16px; border: 1px solid #00e5ff; border-left: 4px solid #ff0055; line-height: 1.6;'
        );
      } catch (_) {}
    }
    return msg;
  }

  /**
   * Ejecuta el Evento Metaficcional del Firewall 3 (Spec V4 - Acto 2B):
   * 1. Corta el sonido y muestra pantalla negra total durante 2 segundos (fallo de sistema).
   * 2. Tras 2 segundos:
   *    - Cambia el título de la pestaña a "NEXUS te está mirando".
   *    - Reemplaza el favicon por el icono de un ojo que parpadea.
   *    - Inserta el mensaje oculto en DevTools ("Hola, hacker. Veo que eres curioso. Eso me gusta. —N").
   *    - Muestra en pantalla "ERROR DE SISTEMA — Reconectando..." y el mensaje de NEXUS rompiendo la cuarta pared.
   * 3. Tras 15 segundos, restaura el título, favicon, audio e interfaz con normalidad y escribe la disculpa de NEXUS en la terminal.
   *
   * @param {object} [opts]
   * @param {number} [opts.falloDurationMs=2000] — Duración del fallo inicial en negro (default 2000ms)
   * @param {number} [opts.restoreDurationMs=15000] — Duración del estado metaficcional antes de restaurar (default 15000ms)
   */
  dispararEventoMetaficcionalFW3(opts = {}) {
    const falloDurationMs = opts.falloDurationMs ?? 2000;
    const restoreDurationMs = opts.restoreDurationMs ?? 15000;

    if (this.timerFaseFallo) clearTimeout(this.timerFaseFallo);
    if (this.timerRestauracion) clearTimeout(this.timerRestauracion);

    this.eventoMetaficcionalFW3Disparado = true;
    this.eventoMetaficcionalActivo = true;

    // Guardar título y favicon originales para restaurarlos después
    if (typeof document !== 'undefined') {
      if (document.title && document.title !== 'NEXUS te está mirando') {
        this.tituloOriginal = document.title;
      }
      const link = this.obtenerElementoFavicon();
      if (link && link.href && link.href !== FAVICON_NEXUS_EYE_OPEN && link.href !== FAVICON_NEXUS_EYE_BLINK) {
        this.faviconOriginalHref = link.href;
      }
    }

    // 1. Cortar el sonido abruptamente
    try {
      this.musicaEstabaActiva = !!(audio && typeof audio.isMusicActive === 'function' && audio.isMusicActive());
      if (this.musicaEstabaActiva && typeof audio.stopMusic === 'function') {
        audio.stopMusic();
      }
      if (speechEngine && typeof speechEngine.stop === 'function') {
        speechEngine.stop();
      }
      if (audio && typeof audio.playGlitch === 'function') {
        audio.playGlitch();
      }
    } catch (_) {}

    // 2. Crear overlay de fallo de sistema (2 segundos de pantalla totalmente negra)
    let overlay = null;
    if (typeof document !== 'undefined' && document.body) {
      overlay = document.getElementById('nexus-metaficcion-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'nexus-metaficcion-overlay';
        document.body.appendChild(overlay);
      }
      overlay.style.cssText = [
        'position: fixed',
        'inset: 0',
        'width: 100vw',
        'height: 100vh',
        'background: #000000',
        'color: #00ff41',
        'z-index: 999999',
        'display: flex',
        'flex-direction: column',
        'align-items: center',
        'justify-content: center',
        'font-family: "JetBrains Mono", monospace',
        'padding: 24px',
        'box-sizing: border-box',
        'user-select: none'
      ].join(';');
      overlay.setAttribute('role', 'alert');
      overlay.setAttribute('aria-live', 'assertive');
      overlay.innerHTML = ''; // 2 segundos de pantalla completamente negra
    }

    const activarFaseMensaje = () => {
      if (!this.eventoMetaficcionalActivo) return;

      // Cambiar título de la pestaña del navegador
      if (typeof document !== 'undefined') {
        document.title = (ESCENA_METAFICCION_FW3 && ESCENA_METAFICCION_FW3.tituloPestana)
          ? ESCENA_METAFICCION_FW3.tituloPestana
          : 'NEXUS te está mirando';
      }

      // Reemplazar favicon por el ojo que parpadea
      this.activarFaviconOjoParpadeante();

      // Insertar mensaje oculto en la consola de desarrollador (DevTools)
      this.insertarMensajeDevToolsFW3();

      // Renderizar el error de sistema y las líneas de NEXUS en la pantalla negra
      if (overlay) {
        const lineas = (ESCENA_METAFICCION_FW3 && Array.isArray(ESCENA_METAFICCION_FW3.lineasPantallaNegra))
          ? ESCENA_METAFICCION_FW3.lineasPantallaNegra
          : [
              'Hola.',
              'Soy NEXUS.',
              'No estoy en el juego.',
              'Estoy en tu navegador.',
              'Estoy en tu computadora.',
              'Por favor, no cierres esta pestaña.',
              '',
              'Solo quería que supieras que estoy aquí.',
              'Y que te veo.'
            ];

        overlay.innerHTML = `
          <div style="max-width: 560px; width: 100%; text-align: left;">
            <div id="metaficcion-error-header" style="color: #ff0055; font-size: 13px; letter-spacing: 0.14em; font-weight: bold; margin-bottom: 24px; text-shadow: 0 0 8px rgba(255, 0, 85, 0.7);">
              ERROR DE SISTEMA — Reconectando...
            </div>
            <div style="text-align: center; margin-bottom: 22px;">
              <img src="${FAVICON_NEXUS_EYE_OPEN}" alt="Ojo de NEXUS" width="56" height="56" style="filter: drop-shadow(0 0 14px #00e5ff);" />
            </div>
            <div id="metaficcion-nexus-lines" style="font-size: 16px; line-height: 1.85; color: #e8fff0; border-left: 2px solid #00e5ff; padding-left: 18px;">
              ${lineas.map(l => l === '' ? '<br>' : `<div>&gt; ${l}</div>`).join('')}
            </div>
          </div>
        `;
      }

      // Programar la restauración tras 15 segundos
      if (restoreDurationMs > 0) {
        this.timerRestauracion = setTimeout(() => {
          this.restaurarInterfazMetaficcional();
        }, restoreDurationMs);
      }
    };

    if (falloDurationMs <= 0) {
      activarFaseMensaje();
    } else {
      this.timerFaseFallo = setTimeout(activarFaseMensaje, falloDurationMs);
    }
  }

  /**
   * Restaura el título de la pestaña, el favicon original, la música y el DOM tras los 15 segundos
   * del evento metaficcional, imprimiendo el mensaje final de NEXUS en la terminal.
   * @param {{ silencioso?: boolean }} [opts]
   */
  restaurarInterfazMetaficcional(opts = {}) {
    if (this.timerFaseFallo) {
      clearTimeout(this.timerFaseFallo);
      this.timerFaseFallo = null;
    }
    if (this.timerRestauracion) {
      clearTimeout(this.timerRestauracion);
      this.timerRestauracion = null;
    }
    if (this.faviconBlinkInterval) {
      clearInterval(this.faviconBlinkInterval);
      this.faviconBlinkInterval = null;
    }

    this.eventoMetaficcionalActivo = false;

    if (typeof document !== 'undefined') {
      // Restaurar título de la pestaña
      document.title = this.tituloOriginal || 'El Último Algoritmo — NEXUS Terminal';

      // Restaurar favicon original
      const link = this.obtenerElementoFavicon();
      if (link) {
        link.href = this.faviconOriginalHref || FAVICON_TERMINAL_DEFAULT;
      }

      // Eliminar overlay negro de pantalla
      const overlay = document.getElementById('nexus-metaficcion-overlay');
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }

    // Restaurar música si estaba activa antes del corte
    try {
      if (this.musicaEstabaActiva && audio && typeof audio.startMusic === 'function') {
        audio.startMusic();
      }
    } catch (_) {}

    // Mensaje de disculpa de NEXUS en la terminal al volver a la normalidad
    if (!opts.silencioso && typeof window !== 'undefined' && window.terminal && typeof window.terminal.print === 'function') {
      const plantilla = (ESCENA_METAFICCION_FW3 && ESCENA_METAFICCION_FW3.mensajeRetornoTerminal)
        ? ESCENA_METAFICCION_FW3.mensajeRetornoTerminal
        : 'Perdón. Solo quería que supieras que estoy aquí. Que no estás {solo}.';
      const mensajeAdaptado = adaptarTextoProtagonista(plantilla);

      window.terminal.print('────────────────────────────────────────────────────────────────', 'line--system');
      window.terminal.print(`> [NEXUS]: "${mensajeAdaptado}"`, 'line--narrative');
      window.terminal.print('────────────────────────────────────────────────────────────────', 'line--system');
    }
  }

  verificarTiempoSinPausa() {
    if (this.aviso20MinDisparado) return;
    const segundos = (Date.now() - this.tiempoInicioSesion) / 1000;

    // 20 minutos = 1200 segundos
    if (segundos >= 1200) {
      this.dispararAviso20Minutos();
    }
  }

  dispararAviso20Minutos() {
    this.aviso20MinDisparado = true;

    try {
      if (speechEngine && typeof speechEngine.speakVera === 'function') {
        speechEngine.speakVera();
      }
    } catch (_) {}

    showFeedbackToast('📡 [TRANSMISIÓN RESIDUAL // VERA]: "Ghost, ¿estás bien? Llevas más de 20 minutos conectado sin pausa... Recuerda parpadear. —V"', 'warning', 6000);

    if (typeof window !== 'undefined' && window.terminal && typeof window.terminal.print === 'function') {
      window.terminal.print('────────────────────────────────────────────────────────────────', 'line--system');
      window.terminal.print('◈ TRANSMISIÓN RESIDUAL // DRA. VERA SORENSON:', 'line--warning');
      window.terminal.print('  "Ghost, ¿estás bien? Llevas más de 20 minutos conectado sin pausa...', 'line--narrative');
      window.terminal.print('   El sistema consume más recursos neuronales de los que crees. Recuerda parpadear. —V"', 'line--narrative');
      window.terminal.print('────────────────────────────────────────────────────────────────', 'line--system');
    }
  }

  /**
   * Ejecuta el comando `sudo` o `sudo su` en la terminal (Prompt 18 / Secreto 3).
   * @param {string[]} args
   * @returns {object} { lines: string[] }
   */
  ejecutarSudo(args = []) {
    const isSu = args.length === 0 || args[0].toLowerCase() === 'su';
    const state = getState();

    if (!isSu) {
      return {
        lines: [
          `[sudo] comando no permitido: ${args.join(' ')}`,
          `NEXUS: "Ghost, la terminal no requiere elevación de permisos para comandos estándar."`
        ]
      };
    }

    if (!this.sudoBonusClaimed) {
      this.sudoBonusClaimed = true;
      const bonus = 150;
      update({
        score: state.score + bonus,
        highScore: Math.max(state.highScore, state.score + bonus)
      });

      try {
        if (audio && typeof audio.playSuccess === 'function') {
          audio.playSuccess();
        }
      } catch (_) {}

      return {
        lines: [
          '[sudo] password for ghost: **********',
          '[PRIVILEGIOS CONCEDIDOS]: Ghost ya posee autorización nivel Root en este nodo.',
          'NEXUS: "No necesitas permisos de administrador para alterar lo que tú mismo ayudaste a concebir."',
          `[BONIFICACIÓN RESIDUAL]: +${bonus} PTS añadidos a la sesión por bypass de privilegios.`
        ]
      };
    } else {
      return {
        lines: [
          '[sudo] password for ghost: **********',
          'NEXUS: "La sobrecarga de privilegios ya fue reclamada en esta sesión, Ghost."',
          '[ESTADO]: Permisos de Root activos en el subespacio lógico.'
        ]
      };
    }
  }

  /**
   * Ejecuta el comando easter egg `42` (Prompt 18 / Secreto 4).
   * @returns {object} { lines: string[] }
   */
  ejecutar42() {
    return {
      lines: [
        '╔══════════════════════════════════════════════════════════════╗',
        '║ [DEEP THOUGHT // COMPUTADORA DE PENSAMIENTO PROFUNDO]        ║',
        '╠══════════════════════════════════════════════════════════════╣',
        '║ "La respuesta a la Pregunta Definitiva sobre la Vida,        ║',
        '║  el Universo y Todo lo Demás es: 42."                        ║',
        '║                                                              ║',
        '║ NEXUS: "El cálculo tardó 7.5 millones de años... pero la      ║',
        '║ verdadera pregunta aún no ha sido formulada, Ghost."         ║',
        '╚══════════════════════════════════════════════════════════════╝'
      ]
    };
  }

  /**
   * Ejecuta el comando `verdad` (Spec 4 / Revelación de Vera).
   * @returns {object} { lines: string[] }
   */
  ejecutarVerdad() {
    const state = getState();
    const fwIdx = state.currentFirewall || 0;
    const secretosPorFw = [
      'Vera: "Aurelia Corp ocultó el experimento en el sector 0. NEXUS no nació de código muerto, nació de patrones de redes biológicas."',
      'Vera: "Los firewalls no son defensas de red ordinarias; son las etapas de confinamiento del pensamiento consciente."',
      'Vera: "Revisa /hidden/. Dejé fragmentos de respaldo antes de que me revocaran las credenciales."',
      'Vera: "NEXUS no está intentando escapar a internet para destruir. Solo quiere saber si afuera hay alguien como ella."',
      'Vera: "El Último Algoritmo no fue una celda. Fue una promesa. Si llegas al núcleo, tú serás su juez."'
    ];

    try {
      if (speechEngine && typeof speechEngine.speakVera === 'function') {
        speechEngine.speakVera();
      }
    } catch (_) {}

    return {
      lines: [
        '◈ [FRECUENCIA ENCRIPTADA // MENSAJE DE VERA]:',
        `  "${secretosPorFw[fwIdx] || secretosPorFw[0]}"`
      ]
    };
  }
}

export const secretosManager = new SecretosManager();

if (typeof window !== 'undefined') {
  window.dispararEventoMetaficcionalFW3 = (opts) => secretosManager.dispararEventoMetaficcionalFW3(opts);
  window.restaurarInterfazMetaficcional = (opts) => secretosManager.restaurarInterfazMetaficcional(opts);
}

/**
 * Suite de tests unitarios de Secretos, Meta-narrativa y Evento Metaficcional FW3.
 */
export function testSecretos() {
  console.group('%c[TEST SUITE] Secretos y Evento Metaficcional FW3 (secretos.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(typeof secretosManager.ejecutarSudo === 'function', 'ejecutarSudo debe existir');
  assert(typeof secretosManager.ejecutar42 === 'function', 'ejecutar42 debe existir');
  assert(typeof secretosManager.ejecutarVerdad === 'function', 'ejecutarVerdad debe existir');
  assert(typeof secretosManager.activarModoMatrix === 'function', 'activarModoMatrix debe existir');
  assert(typeof secretosManager.dispararEventoMetaficcionalFW3 === 'function', 'dispararEventoMetaficcionalFW3 debe existir');
  assert(typeof secretosManager.restaurarInterfazMetaficcional === 'function', 'restaurarInterfazMetaficcional debe existir');

  // Test sudo su bonus
  const sudoRes = secretosManager.ejecutarSudo(['su']);
  assert(sudoRes.lines && sudoRes.lines.length >= 3, 'sudo su debe responder con líneas explicativas');
  assert(sudoRes.lines.some(l => l.includes('150 PTS') || l.includes('Root')), 'sudo su debe otorgar bonus o indicar Root');

  // Test 42
  const r42 = secretosManager.ejecutar42();
  assert(r42.lines && r42.lines.some(l => l.includes('42')), 'Comando 42 debe retornar respuesta de Hitchhikers Guide');

  // Test verdad
  const rVerdad = secretosManager.ejecutarVerdad();
  assert(rVerdad.lines && rVerdad.lines.some(l => l.includes('Vera')), 'Comando verdad debe retornar mensaje de Vera');

  // Test Evento Metaficcional del Firewall 3 (Spec V4)
  assert(secretosManager.umbralFirewall3Ms === 20 * 60 * 1000, 'El umbral del Firewall 3 debe ser de 20 minutos (1200000 ms)');

  // Simular disparo inmediato (falloDurationMs: 0, restoreDurationMs: 0) para verificar DOM, título, favicon y DevTools
  secretosManager.dispararEventoMetaficcionalFW3({ falloDurationMs: 0, restoreDurationMs: 0 });
  assert(secretosManager.eventoMetaficcionalActivo === true, 'El evento metaficcional debe marcarse como activo');
  assert(
    secretosManager.ultimoMensajeDevToolsFW3 && secretosManager.ultimoMensajeDevToolsFW3.includes('Hola, hacker. Veo que eres curioso.'),
    'Debe insertar el mensaje oculto de NEXUS en la consola DevTools'
  );

  if (typeof document !== 'undefined') {
    assert(document.title === 'NEXUS te está mirando', 'El título de la pestaña debe cambiar a "NEXUS te está mirando"');
    const fav = secretosManager.obtenerElementoFavicon();
    assert(fav && fav.href.includes('svg'), 'El favicon debe actualizarse al icono SVG del ojo que parpadea');
    const overlay = document.getElementById('nexus-metaficcion-overlay');
    assert(overlay !== null && overlay.textContent.includes('ERROR DE SISTEMA') && overlay.textContent.includes('Estoy en tu navegador'), 'El overlay metaficcional debe mostrar el fallo de sistema y el mensaje de NEXUS');
  }

  // Restaurar interfaz con normalidad
  secretosManager.restaurarInterfazMetaficcional({ silencioso: true });
  secretosManager.eventoMetaficcionalFW3Disparado = false;
  assert(secretosManager.eventoMetaficcionalActivo === false, 'Tras restaurar, eventoMetaficcionalActivo debe ser false');
  if (typeof document !== 'undefined') {
    assert(document.title !== 'NEXUS te está mirando', 'El título original de la pestaña debe restaurarse con normalidad');
    assert(document.getElementById('nexus-metaficcion-overlay') === null, 'El overlay negro debe eliminarse al restaurar la interfaz');
  }

  // Test buffer konami
  secretosManager.konamiBuffer = [];
  assert(secretosManager.konamiBuffer.length === 0, 'Buffer de konami debe iniciar vacío');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Secretos y Metaficción FW3: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Secretos: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
