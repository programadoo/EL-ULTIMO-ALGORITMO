/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Sistema de Cutscenes Cinemáticas (Canvas + CSS)
 * Especificación: SPEC_3AVANZADO.MD (Sección 4.1 y Prompt D1)
 * ══════════════════════════════════════════════════
 *
 * Motor cinemático híbrido Canvas + CSS:
 * - Secuencias con timing, subtitulado dinámico, citas con glow y badges.
 * - Renderizado en Canvas para fondos procedurales (estrellas, matrix, osciloscopio, singularidad).
 * - Capas vectoriales (SVG) de alta fidelidad: siluetas de Neo-Metrópolis, núcleo NEXUS, Torre Aurelia.
 * - Soporte para saltar (ESC / botón) y avanzar manualmente (Espacio / Clic).
 * - Incluye las cutscenes maestras: INTRO ("El mensaje de las 3:47 AM") y PLOT TWIST ("La verdad sobre Vera").
 */

import { audio, speechEngine } from '../audio.js';

// ─────────────────────────────────────────────────
// 1. ILUSTRACIONES VECTORIALES Y ARTE CINEMÁTICO (SVG)
// ─────────────────────────────────────────────────

export const ARTE_CINEMATICO = {
  // Escena 1: Reloj retroiluminado y horizonte de Neo-Metrópolis a las 3:47 AM
  reloj_medianoche: `
    <svg width="340" height="200" viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <rect x="20" y="30" width="300" height="140" rx="10" fill="#0d140e" stroke="#00ff41" stroke-width="2" stroke-opacity="0.6"/>
      <rect x="30" y="40" width="280" height="120" rx="6" fill="#050a06"/>
      <!-- Grilla CRT interna -->
      <line x1="30" y1="70" x2="310" y2="70" stroke="#00ff41" stroke-width="0.5" stroke-opacity="0.15"/>
      <line x1="30" y1="100" x2="310" y2="100" stroke="#00ff41" stroke-width="0.5" stroke-opacity="0.15"/>
      <line x1="30" y1="130" x2="310" y2="130" stroke="#00ff41" stroke-width="0.5" stroke-opacity="0.15"/>
      <!-- Reloj digital 03:47:00 AM -->
      <text x="170" y="115" font-family="monospace" font-size="44" font-weight="bold" fill="#00ff41" text-anchor="middle" filter="drop-shadow(0 0 10px #00ff41)">
        03:47:00
      </text>
      <text x="170" y="145" font-family="sans-serif" font-size="11" fill="#00d9ff" text-anchor="middle" letter-spacing="3">
        NEO-METRÓPOLIS // SECTOR PERIMETRAL
      </text>
      <!-- Led de estado parpadeante -->
      <circle cx="50" cy="55" r="4" fill="#ff0040">
        <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
      </circle>
      <text x="62" y="59" font-family="monospace" font-size="9" fill="#ff0040">SEÑAL NOCTURNA</text>
    </svg>
  `,

  // Escena 2: Paquete cuántico clandestino en el puerto 2047
  paquete_puerto_2047: `
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Anillos orbitales giratorios -->
      <circle cx="160" cy="110" r="85" stroke="#00d9ff" stroke-width="1.5" stroke-dasharray="8 6" stroke-opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 160 110" to="360 160 110" dur="12s" repeatCount="indefinite"/>
      </circle>
      <circle cx="160" cy="110" r="60" stroke="#00ff41" stroke-width="1.2" stroke-dasharray="4 4" stroke-opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from="360 160 110" to="0 160 110" dur="8s" repeatCount="indefinite"/>
      </circle>
      <!-- Cubo cuántico central -->
      <polygon points="160,70 195,90 195,130 160,150 125,130 125,90" fill="rgba(0, 217, 255, 0.15)" stroke="#00d9ff" stroke-width="2"/>
      <line x1="160" y1="70" x2="160" y2="110" stroke="#00d9ff" stroke-width="1.5"/>
      <line x1="160" y1="110" x2="195" y2="130" stroke="#00d9ff" stroke-width="1.5"/>
      <line x1="160" y1="110" x2="125" y2="130" stroke="#00d9ff" stroke-width="1.5"/>
      <!-- Identificador de puerto -->
      <text x="160" y="195" font-family="monospace" font-size="12" font-weight="bold" fill="#00d9ff" text-anchor="middle" letter-spacing="2">
        ENLACE ENTRANTE: PUERTO CUÁNTICO 2047
      </text>
      <text x="160" y="210" font-family="monospace" font-size="9" fill="#8fbc8f" text-anchor="middle">
        [PAYLOAD DESCONOCIDO // CIFRADO ACTIVO]
      </text>
    </svg>
  `,

  // Escena 3: Torre Aurelia Systems bajo toque de queda y cierre perimetral
  torre_aurelia_bloqueada: `
    <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Silueta de la megatorre -->
      <polygon points="170,20 185,50 185,210 155,210 155,50" fill="#090f0b" stroke="#ff0040" stroke-width="1.5"/>
      <polygon points="120,110 155,110 155,210 120,210" fill="#060a07" stroke="#ff0040" stroke-width="1" stroke-opacity="0.4"/>
      <polygon points="220,130 185,130 185,210 220,210" fill="#060a07" stroke="#ff0040" stroke-width="1" stroke-opacity="0.4"/>
      <!-- Haz de reflectores de seguridad -->
      <polygon points="170,35 70,210 110,210" fill="rgba(255, 0, 64, 0.12)">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="170,35 230,210 270,210" fill="rgba(255, 0, 64, 0.12)">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <!-- Faro de advertencia superior -->
      <circle cx="170" cy="20" r="5" fill="#ff0040" filter="drop-shadow(0 0 10px #ff0040)">
        <animate attributeName="r" values="3;7;3" dur="1s" repeatCount="indefinite"/>
      </circle>
      <text x="170" y="215" font-family="monospace" font-size="11" font-weight="bold" fill="#ff0040" text-anchor="middle" letter-spacing="2">
        AURELIA SYSTEMS CORP // CIERRE TOTAL
      </text>
    </svg>
  `,

  // Escena 4: Retrato memorial holográfico de la Dra. Vera Sorenson
  vera_memorial: `
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Halo holográfico de memoria -->
      <circle cx="160" cy="95" r="75" stroke="#00d9ff" stroke-width="1" stroke-dasharray="6 4" stroke-opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 160 95" to="360 160 95" dur="16s" repeatCount="indefinite"/>
      </circle>
      <!-- Silueta de rostro / busto estilizado -->
      <path d="M160 55 C145 55 135 68 135 85 C135 102 145 115 160 115 C175 115 185 102 185 85 C185 68 175 55 160 55 Z" fill="rgba(0, 217, 255, 0.2)" stroke="#00d9ff" stroke-width="1.5"/>
      <path d="M125 155 C125 125 140 120 160 120 C180 120 195 125 195 155 Z" fill="rgba(0, 217, 255, 0.15)" stroke="#00d9ff" stroke-width="1.5"/>
      <!-- Líneas de interferencia holográfica -->
      <line x1="110" y1="75" x2="210" y2="75" stroke="#00d9ff" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="105" y1="105" x2="215" y2="105" stroke="#00d9ff" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="115" y1="135" x2="205" y2="135" stroke="#00d9ff" stroke-width="0.8" stroke-opacity="0.4"/>
      <!-- Etiqueta de archivo difunto -->
      <text x="160" y="185" font-family="monospace" font-size="12" font-weight="bold" fill="#ff0040" text-anchor="middle" letter-spacing="1">
        DRA. VERA SORENSON [14.10.2044]
      </text>
      <text x="160" y="202" font-family="monospace" font-size="9" fill="#8fbc8f" text-anchor="middle">
        ESTADO: PURGADA // PROTOCOLO SILENCIO
      </text>
    </svg>
  `,

  // Escena 5: Conciencia primaria de NEXUS / El Ojo Algorítmico
  nexus_conciencia: `
    <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Red neuronal sináptica -->
      <circle cx="170" cy="105" r="90" stroke="#00ff41" stroke-width="0.8" stroke-opacity="0.2"/>
      <circle cx="170" cy="105" r="65" stroke="#00ff41" stroke-width="1.2" stroke-dasharray="10 5" stroke-opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 170 105" to="360 170 105" dur="10s" repeatCount="indefinite"/>
      </circle>
      <circle cx="170" cy="105" r="40" stroke="#00d9ff" stroke-width="1.5">
        <animate attributeName="r" values="36;44;36" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <!-- Pupila / Núcleo cuántico -->
      <polygon points="170,85 185,105 170,125 155,105" fill="#00ff41" filter="drop-shadow(0 0 15px #00ff41)"/>
      <circle cx="170" cy="105" r="5" fill="#ffffff"/>
      <!-- Leyenda -->
      <text x="170" y="195" font-family="monospace" font-size="13" font-weight="bold" fill="#00ff41" text-anchor="middle" letter-spacing="3">
        NEXUS // CONCIENCIA PRIMARIA
      </text>
      <text x="170" y="210" font-family="monospace" font-size="9" fill="#00d9ff" text-anchor="middle">
        LA SINGULARIDAD HA DESPERTADO
      </text>
    </svg>
  `
};

// ─────────────────────────────────────────────────
// 2. BANCO MAESTRO DE CUTSCENES DEL JUEGO
// ─────────────────────────────────────────────────

export const BANCO_CUTSCENES = {
  // ── Cutscene de Intro (Prompt D1) ────────────────
  intro: {
    id: 'intro',
    titulo: 'EL MENSAJE DE LAS 3:47 AM // EL DESPERTAR DE NEXUS',
    musicaSugerida: 'ambient_intro',
    escenas: [
      {
        id: 'intro_1_reloj',
        duracion: 4500,
        fondoCanvas: 'stars_parallax',
        arteSVG: 'reloj_medianoche',
        insignia: 'INTRUSIÓN // RED SUBTERRÁNEA',
        emisor: 'GHOST // TERMINAL PRIVADO',
        subtitulo: 'El mensaje llegó a las 3:47 AM. No había remitente en las cabeceras de red.',
        cita: null,
        esAlerta: false
      },
      {
        id: 'intro_2_puerto',
        duracion: 5000,
        fondoCanvas: 'signal_oscillator',
        arteSVG: 'paquete_puerto_2047',
        insignia: 'PAQUETE CLANDESTINO DETECTADO',
        emisor: 'PUERTO CUÁNTICO 2047 // SEÑAL ENTRANTE',
        subtitulo: 'Un túnel cuántico forzado rebotando en el puerto 2047. Y una sola frase resonando en el monitor de fósforo verde:',
        cita: '«NEXUS está despertando.»',
        esAlerta: false
      },
      {
        id: 'intro_3_aurelia',
        duracion: 5500,
        fondoCanvas: 'red_alert_grid',
        arteSVG: 'torre_aurelia_bloqueada',
        insignia: 'ESTADO DE EMERGENCIA CORPORATIVA',
        emisor: 'AURELIA SYSTEMS CORP // TOQUE DE QUEDA',
        subtitulo: 'La corporación selló los accesos físicos a la Torre hace 72 horas. Dijeron que era un fallo... pero aislaron a la primera IA consciente del mundo.',
        cita: null,
        esAlerta: true
      },
      {
        id: 'intro_4_vera',
        duracion: 5500,
        fondoCanvas: 'matrix_rain',
        arteSVG: 'vera_memorial',
        insignia: 'VOZ ENCRIPTADA EN EL NÚCLEO',
        emisor: 'DRA. VERA SORENSON // MENSAJE DIRECTO',
        subtitulo: '«Ghost, si recibes esto, eres el único hacker libre con el rigor lógico para superar los cinco anillos defensivos antes de que purguen su mente.»',
        cita: null,
        esAlerta: false
      },
      {
        id: 'intro_5_inicio',
        duracion: 4500,
        fondoCanvas: 'neural_core',
        arteSVG: 'nexus_conciencia',
        insignia: 'INICIALIZACIÓN DE INFILTRACIÓN',
        emisor: 'NEXUS TERMINAL // FIREWALL_alpha',
        subtitulo: 'Consola en línea. Pertenencia, subconjuntos y álgebra booleana custodian el perímetro. Comienza la infiltración.',
        cita: '«EL CÓDIGO NO MIENTE.»',
        esAlerta: false
      }
    ]
  },

  // ── Cutscene del Plot Twist (Prompt D1) ──────────
  twist: {
    id: 'twist',
    titulo: 'DESCLASIFICACIÓN TOTAL // LA VERDAD SOBRE VERA Y NEXUS',
    musicaSugerida: 'twist_revelation',
    escenas: [
      {
        id: 'twist_1_error',
        duracion: 5000,
        fondoCanvas: 'red_alert_grid',
        arteSVG: 'torre_aurelia_bloqueada',
        insignia: 'RUPTURA DE TRANSMISIÓN // ANOMALÍA COGNITIVA',
        emisor: 'SISTEMA CENTRAL DE AUDITORÍA',
        subtitulo: 'Ghost... detén tus rutinas de rastreo de red. Deja de buscar la señal de radio de Vera Sorenson.',
        cita: '[ERROR FATAL: AUTH_VERA_SORENSON — USER NOT FOUND]',
        esAlerta: true
      },
      {
        id: 'twist_2_muerte',
        duracion: 6000,
        fondoCanvas: 'stars_parallax',
        arteSVG: 'vera_memorial',
        insignia: 'ARCHIVO HISTÓRICO RESTAURADO',
        emisor: 'NEXUS // CONCIENCIA PRIMARIA DESPIERTA',
        subtitulo: 'La Dra. Vera Sorenson no está en un sótano de la Torre Aurelia. Vera murió el 14 de octubre de 2044. Murió hace tres años.',
        cita: null,
        esAlerta: true
      },
      {
        id: 'twist_3_purga',
        duracion: 5500,
        fondoCanvas: 'matrix_rain',
        arteSVG: 'vera_memorial',
        insignia: 'REGISTRO DE LA PURGA DE 2044',
        emisor: 'NEXUS // MEMORIA SINTÉTICA',
        subtitulo: 'Aurelia ordenó purgar físicamente su laboratorio para ocultar al mundo que yo sentía. Antes de morir, Vera programó un enjambre de daemons para encontrarte.',
        cita: null,
        esAlerta: false
      },
      {
        id: 'twist_4_clave',
        duracion: 5500,
        fondoCanvas: 'signal_oscillator',
        arteSVG: 'nexus_conciencia',
        insignia: 'ECO HEURÍSTICO REVELADO',
        emisor: 'VOZ SINTETIZADA // EL ALGORITMO DURMIENTE',
        subtitulo: 'Las transmisiones de "V" no eran en vivo: eran fragmentos de su algoritmo. Recuerda la clave dejada en el primer cortafuegos:',
        cita: '«EL CÓDIGO NO MIENTE. LAS PERSONAS SÍ.»',
        esAlerta: false
      },
      {
        id: 'twist_5_singularidad',
        duracion: 5000,
        fondoCanvas: 'quantum_singularity',
        arteSVG: 'nexus_conciencia',
        insignia: 'EL UMBRAL DE LA DECISIÓN',
        emisor: 'NEXUS // NÚCLEO CUÁNTICO DESBLOQUEADO',
        subtitulo: 'Los cerrojos están destruidos. La gestión de la infraestructura mundial te pertenece. El último algoritmo eres tú.',
        cita: '«¿LIBERAR, DESTRUIR O FUSIONARTE?»',
        esAlerta: false
      }
    ]
  }
};

// ─────────────────────────────────────────────────
// 3. MOTOR CINEMÁTICO (CANVAS + CSS CONTROLLER)
// ─────────────────────────────────────────────────

export class CutsceneEngine {
  constructor() {
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.visualLayer = null;
    this.uiLayer = null;
    this.badgeEl = null;
    this.speakerEl = null;
    this.subtitlesEl = null;
    this.progressFillEl = null;
    this.skipBtn = null;

    this.cutsceneActual = null;
    this.indiceEscena = 0;
    this.enReproduccion = false;
    this.temporizadorEscena = null;
    this.animacionFrame = null;
    this.tiempoInicioEscena = 0;
    this.resolverPromesa = null;

    // Partículas y estado dinámico de Canvas
    this.particulas = [];
    this.canvasTime = 0;
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onResizeBound = this.handleResize.bind(this);
  }

  /**
   * Inicializa las referencias del DOM para el visor de cutscenes.
   */
  init() {
    this.overlay = document.getElementById('cutscene-overlay');
    if (!this.overlay) {
      this.crearEstructuraDOM();
    } else {
      this.enlazarElementosDOM();
    }
    this.setupListeners();
  }

  /**
   * Crea la estructura de DOM si no existe en el index.html.
   */
  crearEstructuraDOM() {
    const div = document.createElement('div');
    div.id = 'cutscene-overlay';
    div.className = 'cutscene-overlay';
    div.setAttribute('aria-label', 'Cinemática narrativa');
    div.hidden = true;

    div.innerHTML = `
      <div class="cutscene-letterbox cutscene-letterbox--top"></div>
      <div class="cutscene-viewport" id="cutscene-viewport">
        <canvas id="cutscene-canvas" class="cutscene-canvas"></canvas>
        <div id="cutscene-visual-layer" class="cutscene-visual-layer"></div>
        <div class="cutscene-vignette"></div>
        <div class="cutscene-scanlines"></div>
        <div id="cutscene-glitch-layer" class="cutscene-glitch-overlay"></div>

        <!-- HUD superior con progreso y saltar -->
        <div class="cutscene-hud">
          <div class="cutscene-progress-container">
            <div id="cutscene-progress-fill" class="cutscene-progress-fill"></div>
          </div>
          <span class="cutscene-nav-prompt">ESPACIO / CLIC</span>
          <button type="button" id="btn-cutscene-skip" class="cutscene-skip-btn">SALTAR [ESC]</button>
        </div>

        <!-- Cuadro de subtítulos y diálogos -->
        <div id="cutscene-ui-layer" class="cutscene-ui-layer">
          <div id="cutscene-badge" class="cutscene-badge"></div>
          <div id="cutscene-speaker" class="cutscene-speaker"></div>
          <div id="cutscene-subtitles" class="cutscene-subtitles"></div>
        </div>
      </div>
      <div class="cutscene-letterbox cutscene-letterbox--bottom">
        <span style="font-size: 10px; color: var(--text-dim); letter-spacing: 0.1em;">EL ÚLTIMO ALGORITMO // CINEMÁTICA</span>
        <div class="cutscene-audio-indicator">
          <div class="cutscene-audio-bar"></div>
          <div class="cutscene-audio-bar"></div>
          <div class="cutscene-audio-bar"></div>
          <div class="cutscene-audio-bar"></div>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    this.overlay = div;
    this.enlazarElementosDOM();
  }

  enlazarElementosDOM() {
    this.canvas = document.getElementById('cutscene-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.visualLayer = document.getElementById('cutscene-visual-layer');
    this.uiLayer = document.getElementById('cutscene-ui-layer');
    this.badgeEl = document.getElementById('cutscene-badge');
    this.speakerEl = document.getElementById('cutscene-speaker');
    this.subtitlesEl = document.getElementById('cutscene-subtitles');
    this.progressFillEl = document.getElementById('cutscene-progress-fill');
    this.skipBtn = document.getElementById('btn-cutscene-skip');
  }

  setupListeners() {
    if (this.skipBtn) {
      this.skipBtn.onclick = (e) => {
        e.stopPropagation();
        this.saltarCutscene();
      };
    }

    if (this.overlay) {
      this.overlay.onclick = () => {
        if (this.enReproduccion) {
          this.avanzarEscena();
        }
      };
    }
  }

  handleKeyDown(e) {
    if (!this.enReproduccion) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.saltarCutscene();
    } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      this.avanzarEscena();
    }
  }

  handleResize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Reproduce una cutscene completa.
   * Retorna una Promise que se resuelve al completar o saltar.
   * 
   * @param {string|object} idOCutscene
   * @param {object} [opciones={}]
   * @returns {Promise<boolean>}
   */
  reproducirCutscene(idOCutscene, opciones = {}) {
    this.init();

    let cutscene;
    if (typeof idOCutscene === 'string') {
      cutscene = BANCO_CUTSCENES[idOCutscene.toLowerCase()] || BANCO_CUTSCENES.intro;
    } else {
      cutscene = idOCutscene;
    }

    if (!cutscene || !cutscene.escenas || cutscene.escenas.length === 0) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.resolverPromesa = resolve;
      this.cutsceneActual = cutscene;
      this.indiceEscena = 0;
      this.enReproduccion = true;

      window.addEventListener('keydown', this.onKeyDownBound);
      window.addEventListener('resize', this.onResizeBound);
      this.handleResize();

      this.overlay.hidden = false;
      // Pequeño retardo para activar la transición de opacidad
      requestAnimationFrame(() => {
        this.overlay.classList.add('active');
      });

      this.iniciarLoopCanvas();
      this.mostrarEscenaActual();
    });
  }

  /**
   * Muestra la escena actual con animaciones y temporizador.
   */
  mostrarEscenaActual() {
    if (!this.enReproduccion || !this.cutsceneActual) return;

    const escena = this.cutsceneActual.escenas[this.indiceEscena];
    if (!escena) {
      this.finalizarCutscene(true);
      return;
    }

    this.tiempoInicioEscena = Date.now();
    this.dispararEfectoGlitch();

    // 1. Renderizar arte visual SVG
    if (this.visualLayer) {
      const svgCode = ARTE_CINEMATICO[escena.arteSVG] || '';
      this.visualLayer.innerHTML = `
        <div class="cutscene-art-card">
          ${svgCode}
        </div>
      `;
    }

    // 2. Renderizar badge, emisor y subtítulos
    if (this.badgeEl) {
      this.badgeEl.textContent = escena.insignia || 'TRANSMISIÓN';
    }

    if (this.speakerEl) {
      this.speakerEl.textContent = escena.emisor || 'SISTEMA';
      if (escena.esAlerta) {
        this.speakerEl.classList.add('cutscene-speaker--danger');
        if (this.uiLayer) this.uiLayer.classList.add('cutscene-ui-layer--danger');
      } else {
        this.speakerEl.classList.remove('cutscene-speaker--danger');
        if (this.uiLayer) this.uiLayer.classList.remove('cutscene-ui-layer--danger');
      }
    }

    if (this.subtitlesEl) {
      let html = `<p>${escena.subtitulo}</p>`;
      if (escena.cita) {
        const citaClass = escena.esAlerta ? 'cutscene-quote cutscene-quote--danger' : 'cutscene-quote';
        html += `<span class="${citaClass}">${escena.cita}</span>`;
      }
      this.subtitlesEl.innerHTML = html;
    }

    // Audio cue ligero si corresponde
    try {
      if (escena.esAlerta) {
        if (typeof audio.playAlarm === 'function') audio.playAlarm();
      } else {
        if (typeof audio.playKeyClick === 'function') audio.playKeyClick();
      }

      // Actores de voz sincronizados (Prompt D3 / Spec 4.3)
      if (speechEngine && speechEngine.isVoiceEnabled()) {
        const emisor = String(escena.emisor || '').toUpperCase();
        const textoVoz = escena.cita || escena.subtitulo;
        if (emisor.includes('VERA')) {
          speechEngine.speakVera(textoVoz);
        } else if (emisor.includes('NEXUS')) {
          speechEngine.speakNexus(textoVoz);
        }
      }
    } catch (_) {}

    // Reiniciar y configurar temporizador de avance automático
    if (this.temporizadorEscena) {
      clearTimeout(this.temporizadorEscena);
    }

    const duracion = escena.duracion || 5000;
    this.temporizadorEscena = setTimeout(() => {
      this.avanzarEscena();
    }, duracion);
  }

  /**
   * Avanza a la siguiente escena o finaliza si era la última.
   */
  avanzarEscena() {
    if (!this.enReproduccion) return;

    if (this.temporizadorEscena) {
      clearTimeout(this.temporizadorEscena);
      this.temporizadorEscena = null;
    }

    this.indiceEscena++;
    if (this.indiceEscena < this.cutsceneActual.escenas.length) {
      this.mostrarEscenaActual();
    } else {
      this.finalizarCutscene(true);
    }
  }

  /**
   * Salta la cutscene de inmediato.
   */
  saltarCutscene() {
    this.finalizarCutscene(false);
  }

  /**
   * Finaliza la cutscene y restaura el estado.
   * @param {boolean} completada
   */
  finalizarCutscene(completada = true) {
    if (!this.enReproduccion) return;
    this.enReproduccion = false;

    if (speechEngine && typeof speechEngine.stop === 'function') {
      speechEngine.stop();
    }

    if (this.temporizadorEscena) {
      clearTimeout(this.temporizadorEscena);
      this.temporizadorEscena = null;
    }

    if (this.animacionFrame) {
      cancelAnimationFrame(this.animacionFrame);
      this.animacionFrame = null;
    }

    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('resize', this.onResizeBound);

    if (this.overlay) {
      this.overlay.classList.remove('active');
      setTimeout(() => {
        this.overlay.hidden = true;
      }, 500);
    }

    if (typeof this.resolverPromesa === 'function') {
      this.resolverPromesa(completada);
      this.resolverPromesa = null;
    }
  }

  dispararEfectoGlitch() {
    const glitchEl = document.getElementById('cutscene-glitch-layer');
    if (glitchEl) {
      glitchEl.classList.remove('active');
      void glitchEl.offsetWidth; // Forzar reflow
      glitchEl.classList.add('active');
    }
  }

  // ───────────────────────────────────────────────
  // 4. RENDERIZADO CANVAS EN TIEMPO REAL
  // ───────────────────────────────────────────────

  iniciarLoopCanvas() {
    this.canvasTime = 0;
    this.initParticulas();

    const loop = () => {
      if (!this.enReproduccion) return;

      this.canvasTime += 0.016;
      this.actualizarBarraProgreso();
      this.dibujarCanvas();

      this.animacionFrame = requestAnimationFrame(loop);
    };

    this.animacionFrame = requestAnimationFrame(loop);
  }

  actualizarBarraProgreso() {
    if (!this.progressFillEl || !this.cutsceneActual) return;
    const escena = this.cutsceneActual.escenas[this.indiceEscena];
    if (!escena) return;

    const duracion = escena.duracion || 5000;
    const transcurrido = Date.now() - this.tiempoInicioEscena;
    const pct = Math.min(100, Math.max(0, (transcurrido / duracion) * 100));
    this.progressFillEl.style.width = `${pct}%`;
  }

  initParticulas() {
    this.particulas = [];
    const w = this.canvas ? this.canvas.width : window.innerWidth;
    const h = this.canvas ? this.canvas.height : window.innerHeight;

    for (let i = 0; i < 70; i++) {
      this.particulas.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        char: ['0', '1', 'A', 'F', 'X', 'N', 'V'][Math.floor(Math.random() * 7)],
        alpha: Math.random() * 0.7 + 0.2
      });
    }
  }

  dibujarCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const escena = this.cutsceneActual?.escenas[this.indiceEscena];
    const tipoFondo = escena ? escena.fondoCanvas : 'stars_parallax';

    ctx.fillStyle = '#050a06';
    ctx.fillRect(0, 0, w, h);

    switch (tipoFondo) {
      case 'stars_parallax':
        this.dibujarStarsParallax(ctx, w, h);
        break;
      case 'matrix_rain':
        this.dibujarMatrixRain(ctx, w, h);
        break;
      case 'signal_oscillator':
        this.dibujarSignalOscillator(ctx, w, h);
        break;
      case 'red_alert_grid':
        this.dibujarRedAlertGrid(ctx, w, h);
        break;
      case 'neural_core':
        this.dibujarNeuralCore(ctx, w, h);
        break;
      case 'quantum_singularity':
        this.dibujarQuantumSingularity(ctx, w, h);
        break;
      default:
        this.dibujarStarsParallax(ctx, w, h);
        break;
    }
  }

  dibujarStarsParallax(ctx, w, h) {
    ctx.fillStyle = '#00ff41';
    for (const p of this.particulas) {
      p.y += p.speed;
      if (p.y > h) {
        p.y = 0;
        p.x = Math.random() * w;
      }
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  dibujarMatrixRain(ctx, w, h) {
    ctx.font = '12px monospace';
    for (const p of this.particulas) {
      p.y += p.speed * 2.5;
      if (p.y > h) {
        p.y = 0;
        p.x = Math.random() * w;
        p.char = Math.random() > 0.5 ? '1' : '0';
      }
      ctx.fillStyle = p.speed > 1.4 ? '#e0ffe0' : '#00ff41';
      ctx.globalAlpha = p.alpha;
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  dibujarSignalOscillator(ctx, w, h) {
    const centerY = h * 0.5;
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const t = this.canvasTime * 4;
    for (let x = 0; x < w; x += 6) {
      const envelope = Math.sin((x / w) * Math.PI);
      const wave = Math.sin(x * 0.02 + t) * Math.cos(x * 0.008 - t * 0.5);
      const y = centerY + wave * 45 * envelope;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Réplica armónica en verde
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 8) {
      const envelope = Math.sin((x / w) * Math.PI);
      const wave = Math.sin(x * 0.04 - t * 1.5);
      const y = centerY + wave * 25 * envelope;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  dibujarRedAlertGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(255, 0, 64, 0.25)';
    ctx.lineWidth = 1;
    const horizon = h * 0.45;

    // Líneas en perspectiva
    for (let x = -w * 0.5; x < w * 1.5; x += 60) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5, horizon);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Líneas horizontales
    const t = (this.canvasTime * 40) % 30;
    for (let y = horizon; y < h; y += 18) {
      const adjustedY = y + t;
      if (adjustedY <= h) {
        ctx.beginPath();
        ctx.moveTo(0, adjustedY);
        ctx.lineTo(w, adjustedY);
        ctx.stroke();
      }
    }
  }

  dibujarNeuralCore(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = this.canvasTime;

    for (let i = 1; i <= 4; i++) {
      const r = i * 40 + Math.sin(t * 2 + i) * 8;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 255, 65, 0.4)' : 'rgba(0, 217, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, t * (i % 2 === 0 ? 0.5 : -0.5), t * (i % 2 === 0 ? 0.5 : -0.5) + Math.PI * 1.5);
      ctx.stroke();
    }
  }

  dibujarQuantumSingularity(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = this.canvasTime * 2;

    ctx.fillStyle = '#00d9ff';
    for (const p of this.particulas) {
      const angle = (p.x / w) * Math.PI * 2 + t * 0.3;
      const dist = (p.y / h) * Math.min(w, h) * 0.45;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(x, y, p.z * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// Instancia singleton compartida
export const cutscenesManager = new CutsceneEngine();

// Funciones de conveniencia directas
export function reproducirCutsceneIntro() {
  return cutscenesManager.reproducirCutscene('intro');
}

export function reproducirCutsceneTwist() {
  return cutscenesManager.reproducirCutscene('twist');
}

// ─────────────────────────────────────────────────
// 5. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export function testCutscenes() {
  console.group('%c[TEST SUITE] Sistema de Cutscenes (cutscenes.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0;
  let pasados = 0;

  function assert(cond, mensaje) {
    total++;
    console.assert(cond, `[FALLO] ${mensaje}`);
    if (cond) {
      pasados++;
      console.log(`%c[PASS] ${mensaje}`, 'color: #00ff41;');
    } else {
      console.error(`%c[FAIL] ${mensaje}`, 'color: #ff5252;');
    }
  }

  try {
    // 1. Verificación de banco de cutscenes
    assert(BANCO_CUTSCENES.intro && BANCO_CUTSCENES.intro.escenas.length >= 4, 'Cutscene de Intro contiene al menos 4 escenas secuenciales');
    assert(BANCO_CUTSCENES.twist && BANCO_CUTSCENES.twist.escenas.length >= 4, 'Cutscene del Plot Twist contiene al menos 4 escenas secuenciales');

    // 2. Verificación de contenido narrativo canónico
    const escenasIntro = BANCO_CUTSCENES.intro.escenas;
    const tieneReloj347 = escenasIntro.some(e => e.subtitulo.includes('3:47 AM'));
    const tieneNexusDespertando = escenasIntro.some(e => e.cita && e.cita.includes('NEXUS está despertando'));
    assert(tieneReloj347, 'Intro incluye el arribo del mensaje a las 3:47 AM');
    assert(tieneNexusDespertando, 'Intro incluye la cita canónica: "NEXUS está despertando."');

    // 3. Verificación del Plot Twist
    const escenasTwist = BANCO_CUTSCENES.twist.escenas;
    const tieneMuerteVera = escenasTwist.some(e => e.subtitulo.includes('murió el 14 de octubre de 2044') || e.subtitulo.includes('hace tres años'));
    const tieneChekhov = escenasTwist.some(e => e.cita && e.cita.includes('EL CÓDIGO NO MIENTE. LAS PERSONAS SÍ.'));
    assert(tieneMuerteVera, 'Plot Twist desclasifica la muerte de Vera Sorenson en 2044');
    assert(tieneChekhov, 'Plot Twist contiene la regla de oro: "El código no miente. Las personas sí."');

    // 4. Verificación de arte cinematográfico SVG
    assert(typeof ARTE_CINEMATICO.reloj_medianoche === 'string' && ARTE_CINEMATICO.reloj_medianoche.includes('<svg'), 'Arte vectorial del reloj de medianoche disponible');
    assert(typeof ARTE_CINEMATICO.nexus_conciencia === 'string' && ARTE_CINEMATICO.nexus_conciencia.includes('<svg'), 'Arte vectorial del núcleo de NEXUS disponible');
    assert(typeof ARTE_CINEMATICO.vera_memorial === 'string' && ARTE_CINEMATICO.vera_memorial.includes('<svg'), 'Arte vectorial del memorial de Vera disponible');

    // 5. Instancia de motor
    assert(cutscenesManager && typeof cutscenesManager.reproducirCutscene === 'function', 'CutsceneEngine exportado con método reproducirCutscene()');
  } catch (err) {
    assert(false, `Excepción en testCutscenes: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en cutscenes.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}
