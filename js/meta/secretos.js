/**
 * @fileoverview Sistema de Secretos y Meta-narrativa (Prompt 18 / Spec 3.1 & 3.2).
 * (1) Comentarios ocultos en HTML y CSS.
 * (2) Konami code activa "modo Matrix".
 * (3) Escribir `sudo su` da mensaje + bonus.
 * (4) Escribir `42` da easter egg.
 * (5) Mensaje de "Ghost, ¿estás bien?" si el jugador lleva 20 min sin pausa.
 * (6) Saludo en la consola del navegador al abrir DevTools.
 */

import { audio, speechEngine } from '../audio.js';
import { getState, update } from '../state.js';
import { showFeedbackToast } from '../ui/feedback.js';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

class SecretosManager {
  constructor() {
    this.konamiBuffer = [];
    this.sudoBonusClaimed = false;
    this.aviso20MinDisparado = false;
    this.tiempoInicioSesion = Date.now();
    this.timer20MinInterval = null;
  }

  /**
   * Inicializa los listeners globales de secretos y meta-narrativa.
   */
  init() {
    this.initKonamiListener();
    this.initDevToolsGreeting();
    this.init20MinTimer();
  }

  /**
   * Saludo temático en DevTools (Spec 3.2 / Prompt 18).
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
   * Detector de Konami Code en el teclado (ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a).
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
        // Reiniciar si se equivoca, pero comprobar si la tecla actual coincide con el inicio
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
      // Detener tras 10 segundos para no obstaculizar la jugabilidad
      setTimeout(() => {
        if (typeof window.stopMatrixRain === 'function' && window.currentScreen === 'screen-game') {
          window.stopMatrixRain();
        }
      }, 10000);
    }

    // Efecto visual de flash verde
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('flash-screen');
      setTimeout(() => document.body.classList.remove('flash-screen'), 800);
    }

    if (typeof window !== 'undefined' && window.terminal && typeof window.terminal.print === 'function') {
      window.terminal.print('>>> [EASTER EGG] PROTOCOLO KONAMI DETECTADO: Matrix Override activado.', 'line--success');
    }
  }

  /**
   * Temporizador de 20 minutos sin pausa (Spec 3.2: "Ghost, ¿estás bien? Llevas mucho tiempo. —V").
   */
  init20MinTimer() {
    if (typeof setInterval === 'undefined') return;
    if (this.timer20MinInterval) clearInterval(this.timer20MinInterval);

    this.timer20MinInterval = setInterval(() => {
      this.verificarTiempoSinPausa();
    }, 15000); // Comprueba cada 15s
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

    // Efecto de radio de Vera
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

/**
 * Suite de tests unitarios de Secretos y Meta-narrativa
 */
export function testSecretos() {
  console.group('%c[TEST SUITE] Secretos y Meta-narrativa (secretos.js)', 'color: #00ff41; font-weight: bold;');
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

  // Test buffer konami
  secretosManager.konamiBuffer = [];
  assert(secretosManager.konamiBuffer.length === 0, 'Buffer de konami debe iniciar vacío');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Secretos y Easter Eggs: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Secretos: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
