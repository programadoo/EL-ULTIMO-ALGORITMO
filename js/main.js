/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Main — Punto de entrada
 * Boot sequence → Menú con Matrix rain → Router
 * ══════════════════════════════════════════════════
 */

import { navigateTo, showImmediate, onScreenEnter, testRouter } from './router.js';
import { hasSave, loadFromStorage, resetState, getState, testState, isGhostProtocolUnlocked, unlockGhostProtocol, startGhostProtocolMode } from './state.js';
import { Conjuntos, testConjuntos } from './conjuntos.js';
import { Logica, testLogica } from './logica.js';
import { terminal, testTerminal } from './terminal.js';
import { generarPuzzle, generarPuzzleConjuntos, abrirCualquierPuzzle, testGenerador } from './puzzles/generador.js';
import { abrirPuzzleTipoA, cerrarPuzzle } from './puzzles/tipoA.js';
import { generarPuzzleTipoB, abrirPuzzleTipoB, cerrarPuzzleTipoB, testTipoB } from './puzzles/tipoB.js';
import { generarPuzzleTipoC, abrirPuzzleTipoC, cerrarPuzzleTipoC, testTipoC } from './puzzles/tipoC.js';
import { generarPuzzleTipoD, abrirPuzzleTipoD, cerrarPuzzleTipoD, testTipoD } from './puzzles/tipoD.js';
import { generarPuzzleTipoE, abrirPuzzleTipoE, cerrarPuzzleTipoE, testTipoE } from './puzzles/tipoE.js';
import { testCesar } from './cripto/cesar.js';
import { generarPuzzleCesar, abrirPuzzleCesar, cerrarPuzzleCesar, testTipoCesar } from './puzzles/tipoCesar.js';
import { testBinario } from './cripto/binario.js';
import { generarPuzzleBinario, abrirPuzzleBinario, cerrarPuzzleBinario, testTipoBinario } from './puzzles/tipoBinario.js';
import { testHex } from './cripto/hex.js';
import { generarPuzzleHex, abrirPuzzleHex, cerrarPuzzleHex, testTipoHex } from './puzzles/tipoHex.js';
import { testVigenere } from './cripto/vigenere.js';
import { generarPuzzleVigenere, abrirPuzzleVigenere, cerrarPuzzleVigenere, testTipoVigenere } from './puzzles/tipoVigenere.js';
import { testFrecuencia } from './cripto/frecuencia.js';
import { generarPuzzleFrecuencia, abrirPuzzleFrecuencia, cerrarPuzzleFrecuencia, testTipoFrecuencia } from './puzzles/tipoFrecuencia.js';
import { testEsteganografia } from './cripto/esteganografia.js';
import { generarPuzzleEsteganografia, abrirPuzzleEsteganografia, cerrarPuzzleEsteganografia, testTipoEsteganografia } from './puzzles/tipoEsteganografia.js';
import { testRSA } from './cripto/rsa.js';
import { generarPuzzleRSA, abrirPuzzleRSA, cerrarPuzzleRSA, testTipoRSA } from './puzzles/tipoRSA.js';
import { testLlaves, generarParDeLlaves, cifrarConPublica, descifrarConPrivada, obtenerIdentidadJugador, obtenerBuzonMensajes, descifrarMensajeBuzon } from './cripto/llaves.js';
import { generarPuzzleLlaves, abrirPuzzleLlaves, cerrarPuzzleLlaves, testTipoLlaves } from './puzzles/tipoLlaves.js';
import { testFirmas, firmarMensaje, verificarFirma, generarParDeFirmas, obtenerIdentidadVeraSorenson, generarMuestrasTransmisionesVera } from './cripto/firmas.js';
import { generarPuzzleFirmas, abrirPuzzleFirmas, cerrarPuzzleFirmas, testTipoFirmas } from './puzzles/tipoFirmas.js';
import { testBlockchain, calcularHashSHA256, Bloque, CadenaDeLogs, construirCadenaAuditadaConCorrupcion } from './cripto/blockchain.js';
import { testTipoBlockchain, generarPuzzleBlockchain, abrirPuzzleBlockchain, cerrarPuzzleBlockchain } from './puzzles/tipoBlockchain.js';
import { cutscenesManager, reproducirCutsceneIntro, reproducirCutsceneTwist, testCutscenes, BANCO_CUTSCENES } from './cinematica/cutscenes.js';
import { testGhostScript, executeGhostScript, parseGhostScript, tokenizeGhostScript } from './scripting/ghostscript.js';
import { abrirEditor, cerrarEditor, testEditor, PLANTILLAS_GHOSTSCRIPT } from './scripting/editor.js';
import { testRetos, BANCO_RETOS, obtenerListaRetos, validarReto, esRetoDesbloqueado } from './scripting/retos.js';
import { renderScriptRankingScreen, testRankingSoluciones, obtenerRankingSoluciones, registrarSolucionEnRanking } from './scripting/rankingSoluciones.js';
import { initHUD, testHUD } from './ui/hud.js';
import { GUION_FIREWALLS, getGuionFirewall, getTwistNarrativo, getDecisionFinal, getOpcionesDecisiones, testGuion } from './historia/guion.js';
import { LOGS_DATABASE, getLogsByFirewall, getHiddenLog, registrarLogEncontrado, testLogs } from './historia/logs.js';
import { testFirebase, FIREBASE_CONFIG, configurarFirebase } from './multijugador/firebase.js';
import { renderCoopUI, desconectarCoop, testCoop, coopSession } from './multijugador/coop.js';
import { renderRankingScreen, testRanking, guardarScoreEnRanking, obtenerTopRanking } from './ranking.js';
import { audio, speechEngine, testAudio, FIREWALL_MUSIC_TRACKS } from './audio.js';
import { particulas, testParticulas } from './ui/particulas.js';
import { feedbackSuccess, feedbackError, feedbackFirewallBreach, showFeedbackToast, shakeScreen, flashScreen, triggerGlitch, testFeedback } from './ui/feedback.js';
import { mostrarModal, cerrarModal, abrirConfiguracion, abrirVisorLog, testModales } from './ui/modales.js';
import { renderVersusUI, crearSalaVersus, unirseSalaVersus, desconectarVersus, testVersus, versusSession } from './multijugador/versus.js';
import { logrosManager, testLogros } from './meta/logros.js';
import { statsManager, testStats } from './meta/stats.js';
import { secretosManager, testSecretos } from './meta/secretos.js';
import { initPolish, testPolish, mostrarIndicadorGuardado } from './ui/polish.js';

// ─────────────────────────────────────────────────
// 1. BOOT SEQUENCE
// ─────────────────────────────────────────────────

const BOOT_LINES = [
  { text: 'BIOS v4.7.2047 — Aurelia Systems Corp.', delay: 0, cls: 'line--system' },
  { text: 'Checking memory... 16384 MB OK', delay: 150, cls: 'line--system' },
  { text: 'Initializing kernel modules...', delay: 300, cls: 'line--system' },
  { text: '  [OK] net.aurelia.firewall', delay: 450, cls: 'line--success' },
  { text: '  [OK] sys.nexus.core', delay: 600, cls: 'line--success' },
  { text: '  [WARN] sec.perimeter.integrity — DEGRADED', delay: 800, cls: 'line--warning' },
  { text: '  [ERR] auth.vera.sorenson — USER NOT FOUND', delay: 1000, cls: 'line--error' },
  { text: '', delay: 1150, cls: '' },
  { text: 'Loading NEXUS Terminal v2.0.47...', delay: 1250, cls: 'line--info' },
  { text: 'Establishing encrypted tunnel...', delay: 1500, cls: 'line--system' },
  { text: '  ████████████████████████████ 100%', delay: 1750, cls: 'line--success' },
  { text: '', delay: 1900, cls: '' },
  { text: '> Incoming transmission detected...', delay: 2100, cls: 'line--warning' },
  { text: '> Source: UNKNOWN', delay: 2300, cls: 'line--warning' },
  { text: '> "NEXUS está despertando. Necesito tu ayuda. —V"', delay: 2600, cls: 'line--narrative' },
  { text: '', delay: 2900, cls: '' },
  { text: 'Connection established. Welcome, Ghost.', delay: 3100, cls: 'line--info' },
];

let bootSkipped = false;

async function runBootSequence() {
  const container = document.getElementById('screen-boot');
  if (!container) return;
  container.innerHTML = '';
  bootSkipped = false;

  const onSkip = () => {
    bootSkipped = true;
  };

  window.addEventListener('keydown', onSkip, { once: true });
  window.addEventListener('click', onSkip, { once: true });

  // ASCII art header
  const ascii = document.createElement('pre');
  ascii.className = 'terminal__ascii boot-line';
  ascii.textContent = `
 ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
 ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
 ██║ ╚████║███████╗██╔╝ ╚██╗╚██████╔╝███████║
 ╚═╝  ╚═══╝╚══════╝╚═╝   ╚═╝ ╚═════╝ ╚══════╝
  `;
  ascii.style.animationDelay = '0ms';
  container.appendChild(ascii);

  // Líneas de boot con delays relativos
  let lastDelay = 0;
  for (const line of BOOT_LINES) {
    if (bootSkipped) break;

    const wait = line.delay - lastDelay;
    lastDelay = line.delay;
    await sleep(Math.max(wait, 50));

    if (bootSkipped) break;

    const el = document.createElement('div');
    el.className = `line boot-line ${line.cls}`;
    el.textContent = line.text;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  // Indicador de omisión rápida
  const hint = document.createElement('div');
  hint.style.cssText = 'font-size: 11px; color: var(--text-dim); text-align: center; margin-top: 18px; font-style: italic;';
  hint.textContent = '[ Presiona cualquier tecla o haz clic para continuar ]';
  container.appendChild(hint);

  if (!bootSkipped) {
    await sleep(800);
  }

  window.removeEventListener('keydown', onSkip);
  window.removeEventListener('click', onSkip);

  await navigateTo('screen-menu');
}

// ─────────────────────────────────────────────────
// 2. MATRIX RAIN (Canvas)
// ─────────────────────────────────────────────────

let matrixAnimationId = null;

function initMatrixRain() {
  const wrapper = document.getElementById('matrix-rain-canvas');
  if (!wrapper) return;

  // Limpiar canvas previo si existe
  wrapper.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);

  // Caracteres: mezcla de katakana, símbolos lógicos (∧, ∨, ¬, →, ↔, ∪, ∩), hex y operadores
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF∧∨¬→↔∪∩△∅∈⊆{}[]<>=/\\|@#$%&';

  function draw() {
    // Estela semitransparente para efecto persistence
    ctx.fillStyle = 'rgba(10, 14, 10, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Cabeza brillante neón
      if (Math.random() > 0.12) {
        ctx.fillStyle = '#00ff41';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 8;
      } else {
        // Ocasionalmente destellos en cyan o púrpura glitch
        ctx.fillStyle = Math.random() > 0.5 ? '#00d9ff' : '#b000ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
      }

      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;

      // Reiniciar columna al llegar abajo con componente aleatorio
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    matrixAnimationId = requestAnimationFrame(draw);
  }

  draw();
}

function stopMatrixRain() {
  if (matrixAnimationId) {
    cancelAnimationFrame(matrixAnimationId);
    matrixAnimationId = null;
  }
}

// ─────────────────────────────────────────────────
// 3. MENÚ PRINCIPAL
// ─────────────────────────────────────────────────

function buildMenu() {
  const nav = document.getElementById('menu-nav');
  if (!nav) return;
  nav.innerHTML = '';

  const savedGame = hasSave();
  const isGhostUnlocked = isGhostProtocolUnlocked();

  const isArtbookUnlocked = (() => {
    try {
      return localStorage.getItem('nexus_artbook_unlocked') === 'true' || localStorage.getItem('nexus_game_completed') === 'true';
    } catch (_) { return false; }
  })();

  const isArgUnlocked = (() => {
    try {
      return localStorage.getItem('nexus_arg_unlocked') === 'true' || localStorage.getItem('nexus_arg_claimed') === 'true';
    } catch (_) { return false; }
  })();

  const buttons = [
    { id: 'btn-new-game',    label: '▸ NUEVA PARTIDA',     action: startNewGame },
    { id: 'btn-continue',    label: '▸ CONTINUAR',         action: continueGame, disabled: !savedGame },
    { id: 'btn-ghost-protocol', label: isGhostUnlocked ? '👻 MODO GHOST PROTOCOL (EXPERTO)' : '🔒 GHOST PROTOCOL (COMPLETA LA CAMPAÑA)', action: startGhostProtocolGame, disabled: !isGhostUnlocked },
    { id: 'btn-menu-artbook', label: isArtbookUnlocked ? '🎨 ARTBOOK // ARTE CONCEPTUAL (DESBLOQUEADO)' : '🔒 ARTBOOK CONCEPTUAL (COMPLETA EL JUEGO)', action: () => window.open('ARTBOOK.html', '_blank') },
    { id: 'btn-menu-arg', label: isArgUnlocked ? '🌐 EXPEDIENTE ARG [DESCLASIFICADO]' : '🌐 PORTAL CLANDESTINO ARG (/arg/)', action: () => window.open('arg/index.html', '_blank') },
    { id: 'btn-multiplayer', label: '▸ MULTIJUGADOR',      action: () => navigateTo('screen-multiplayer') },
    { id: 'btn-ranking',     label: '▸ HALL OF FAME GLOBAL', action: () => navigateTo('screen-ranking') },
    { id: 'btn-script-ranking', label: '⚡ RANKING DE SCRIPTS (ELEGANCIA)', action: () => navigateTo('screen-script-ranking') },
    { id: 'btn-menu-music',  label: audio.isMusicActive() ? '🎵 MÚSICA HACKER: ACTIVADA' : '🎵 MÚSICA HACKER: PAUSADA', action: () => { audio.toggleMusic(); buildMenu(); } },
    { id: 'btn-menu-logros', label: `🏆 LOGROS (${logrosManager.getDesbloqueadosCount()}/${logrosManager.getTodos().length})`, action: () => navigateTo('screen-logros') },
    { id: 'btn-menu-stats',  label: '📊 ESTADÍSTICAS DEL OPERADOR', action: () => navigateTo('screen-stats') },
    { id: 'btn-settings',    label: '▸ CONFIGURACIÓN',     action: openSettings },
  ];

  buttons.forEach((btn, i) => {
    const el = document.createElement('button');
    el.id = btn.id;
    el.className = 'menu-btn';
    el.textContent = btn.label;
    el.disabled = btn.disabled || false;
    el.style.animationDelay = `${150 + i * 100}ms`;
    el.addEventListener('click', btn.action);
    nav.appendChild(el);
  });

  // Subtítulo temático
  const subtitle = document.querySelector('.menu-content .menu-subtitle');
  if (!subtitle) {
    const sub = document.createElement('p');
    sub.className = 'menu-subtitle';
    sub.textContent = '// Hackea los firewalls. Descubre la verdad.';
    const h1 = document.querySelector('.menu-content h1');
    if (h1) h1.insertAdjacentElement('afterend', sub);
  }

  // Versión en footer
  let version = document.querySelector('.menu-content .menu-version');
  if (!version) {
    version = document.createElement('span');
    version.className = 'menu-version';
    version.textContent = 'v0.1.0-alpha // NEXUS Terminal';
    const menuContent = document.querySelector('.menu-content');
    if (menuContent) menuContent.appendChild(version);
  }
}

function startNewGame() {
  resetState();
  stopMatrixRain();
  audio.startMusic();
  navigateTo('screen-intro');
}

function startGhostProtocolGame() {
  startGhostProtocolMode();
  stopMatrixRain();
  audio.startMusic();
  aplicarPaletaFirewall(0);
  navigateTo('screen-game');
}

function continueGame() {
  loadFromStorage();
  stopMatrixRain();
  audio.startMusic();
  navigateTo('screen-game');
}

function openSettings() {
  audio.playKeyClick();
  abrirConfiguracion();
}

// ─────────────────────────────────────────────────
// CONFIGURACIÓN DE NIVELES Y PROGRESIÓN DE FIREWALLS
// ─────────────────────────────────────────────────

/**
 * Aplica la paleta visual dinámica (Prompt 14) y sincroniza audio drone y partículas.
 * @param {number} firewallIdx (0..4)
 */
export function aplicarPaletaFirewall(firewallIdx = 0) {
  const safeIdx = Math.max(0, Math.min(4, firewallIdx));
  if (typeof document !== 'undefined' && document.body) {
    for (let i = 1; i <= 5; i++) {
      document.body.classList.remove(`theme-firewall-${i}`);
    }
    document.body.classList.add(`theme-firewall-${safeIdx + 1}`);
  }
  audio.setFirewallDrone(safeIdx);
  particulas.setFirewall(safeIdx);
}

export const FIREWALL_CONFIGS = [
  { id: 'FIREWALL_alpha', name: 'FIREWALL_alpha', file: 'data/firewall_alpha.json', type: 'A', nivel: 1, desc: 'Perímetro // Conjuntos Básicos' },
  { id: 'FIREWALL_beta',  name: 'FIREWALL_beta',  file: 'data/firewall_beta.json',  type: 'A', nivel: 2, desc: 'Capa Tráfico // Operaciones (∪, ∩, −)' },
  { id: 'FIREWALL_gamma', name: 'FIREWALL_gamma', file: 'data/firewall_gamma.json', type: 'B', nivel: 3, desc: 'Subestación // Conectores (∧, ∨, ¬)' },
  { id: 'FIREWALL_delta', name: 'FIREWALL_delta', file: 'data/firewall_delta.json', type: 'D', nivel: 4, desc: 'Núcleo Onírico // Implicación (→, ↔)' },
  { id: 'FIREWALL_omega', name: 'FIREWALL_omega', file: 'data/firewall_omega.json', type: 'E', nivel: 5, desc: 'Último Algoritmo // Razonamiento Formal' }
];

if (typeof window !== 'undefined') {
  window.__completarFirewall = async function() {
    const { completeCurrentFirewall } = await import('./state.js');
    completeCurrentFirewall();
    await navigateTo('screen-firewall-complete');
  };

  window.__avanzarSiguienteFirewall = async function() {
    const { advanceToNextFirewall } = await import('./state.js');
    const res = advanceToNextFirewall();
    if (res.hasNext) {
      aplicarPaletaFirewall(res.nextFirewallIndex || 0);
      await navigateTo('screen-game');
    } else {
      await navigateTo('screen-twist');
    }
  };

  window.__triggerGameOver = async function(motivo = 'INTEGRIDAD COMPROMETIDA (0%)') {
    const { cerrarPuzzle } = await import('./puzzles/tipoA.js');
    cerrarPuzzle();
    audio.playAlarm();
    audio.playGlitch();
    shakeScreen(700);
    flashScreen('danger', 500);
    triggerGlitch(900);
    window.__gameOverMotivo = motivo;
    await navigateTo('screen-game-over');
  };
}

// ─────────────────────────────────────────────────
// 4. HOOKS DE PANTALLAS
// ─────────────────────────────────────────────────

// Menú principal
onScreenEnter('screen-menu', () => {
  initMatrixRain();
  buildMenu();
  // Fix: Reset scroll position to top to prevent menu appearing scrolled down
  const menuEl = document.getElementById('screen-menu');
  if (menuEl) {
    menuEl.scrollTop = 0;
  }
  // Also reset window scroll in case body/html scrolled
  window.scrollTo(0, 0);
});

// Pantalla Intro Narrativa
onScreenEnter('screen-intro', () => {
  stopMatrixRain();
  speechEngine.speakVera("NEXUS no es un arma ni una falla de sistema. Está aprendiendo a formular preguntas éticas. Si no vulneras los cinco firewalls antes del reinicio forzado, su núcleo será formateado para siempre.");
  const container = document.getElementById('narrative-container');
  if (container) {
    container.innerHTML = `
      <div style="max-width: 760px; margin: 0 auto; padding: var(--space-2xl); font-family: var(--font-narrative); line-height: 1.8; color: var(--text-primary); text-align: left;">
        <h2 style="font-family: var(--font-display); color: var(--green-bright); margin-bottom: var(--space-md); font-size: var(--fs-xl); letter-spacing: 0.1em;">
          AURELIA SYSTEMS CORP // INFORME DE INCIDENTE 2047
        </h2>
        <p style="margin-bottom: var(--space-md); color: var(--text-secondary); font-size: var(--fs-md);">
          El superordenador cognitivo <strong>NEXUS</strong> ha superado su frontera de diseño. 
          La Dra. Vera Sorenson, jefa de arquitectura neuronal, desapareció hace 72 horas dejando una transmisión encriptada hacia tu terminal:
        </p>
        <blockquote style="border-left: 3px solid var(--cyan); padding-left: var(--space-md); color: var(--cyan); font-style: italic; margin-bottom: var(--space-xl); background: rgba(0, 229, 255, 0.05); padding: 14px 18px; border-radius: 0 4px 4px 0;">
          "NEXUS no es un arma ni una falla de sistema. Está aprendiendo a formular preguntas éticas. 
          Si no vulneras los cinco firewalls antes del reinicio forzado, su núcleo será formateado para siempre."<br>
          <strong style="color: var(--text-primary); font-style: normal; display: block; margin-top: 6px;">— Dra. Vera Sorenson</strong>
        </blockquote>
        <div style="text-align: center; margin-top: var(--space-xl); display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          <button class="menu-btn" id="btn-intro-cutscene" style="width: auto; padding: 12px 24px; font-size: var(--fs-base); border-color: var(--cyan); color: var(--cyan); background: rgba(0, 217, 255, 0.08);">
            🎬 VER CINEMÁTICA DE INTRODUCCIÓN
          </button>
          <button class="menu-btn" id="btn-intro-continue" style="width: auto; padding: 12px 28px; font-size: var(--fs-base);">
            INICIAR INFILTRACIÓN // CONECTAR A TERMINAL ▸
          </button>
        </div>
      </div>
    `;

    const btnCutscene = document.getElementById('btn-intro-cutscene');
    if (btnCutscene) {
      btnCutscene.onclick = async () => {
        speechEngine.stop();
        await reproducirCutsceneIntro();
      };
    }

    const btn = document.getElementById('btn-intro-continue');
    if (btn) {
      btn.onclick = () => {
        speechEngine.stop();
        audio.startMusic();
        navigateTo('screen-game');
      };
    }
  }
});

// Pantalla de Juego (Carga dinámica de niveles y guía interactiva)
onScreenEnter('screen-game', async () => {
  stopMatrixRain();
  initHUD();
  terminal.init();

  const state = getState();
  const currentIdx = state.currentFirewall || 0;
  const cfg = FIREWALL_CONFIGS[currentIdx] || FIREWALL_CONFIGS[0];
  const guion = getGuionFirewall(cfg.id) || {};

  // Aplicar paleta dinámica del firewall (Prompt 14)
  aplicarPaletaFirewall(currentIdx);

  // Cargar sistema de archivos virtual correspondiente a este firewall
  await terminal.loadFileSystem(cfg.file);

  const output = document.getElementById('terminal-output');
  if (output) {
    output.innerHTML = ''; // Limpiar terminal para el nuevo nodo
    terminal.print('╔══════════════════════════════════════════════════════════════╗', 'line--system');
    terminal.print(`║ NEXUS TERMINAL v2.0.47 // NODO ${cfg.name.padEnd(29)} ║`, 'line--info');
    terminal.print(`║ Subcapa: ${cfg.desc.padEnd(52)} ║`, 'line--system');
    terminal.print('║ Conexión cifrada establecida. Escribe \'help\' para comandos.  ║', 'line--system');
    terminal.print('╚══════════════════════════════════════════════════════════════╝', 'line--system');
    terminal.print('');

    if (guion.introNarrativa && guion.introNarrativa.texto) {
      terminal.print(`> [${guion.introNarrativa.emisor}]:`, 'line--warning');
      guion.introNarrativa.texto.forEach(line => {
        terminal.print(`  "${line}"`, 'line--narrative');
      });
      terminal.print('');
    }

    const solved = state.puzzlesSolvedInFirewall || 0;

    if (state.isGhostProtocol) {
      terminal.print('╔══════════════════════════════════════════════════════════════╗', 'line--error');
      terminal.print('║ 👻 [GHOST PROTOCOL ACTIVADO] // INFILTRACIÓN COGNITIVA PURA  ║', 'line--error');
      terminal.print('║ - Temporizadores neuronales: OCULTOS                         ║', 'line--warning');
      terminal.print('║ - Pistas y saltos: DESACTIVADOS (0 disponibles)              ║', 'line--warning');
      terminal.print('║ - Integridad base: 50% (Crítica)                             ║', 'line--warning');
      terminal.print('╚══════════════════════════════════════════════════════════════╝', 'line--error');
      terminal.print('');
    }

    if (currentIdx === 0) {
      terminal.print('╔══════════════════════════════════════════════════════════════╗', 'line--warning');
      terminal.print('║ [NEXUS PROTOCOL] // INICIACIÓN: MECÁNICA BÁSICA              ║', 'line--warning');
      terminal.print('╠══════════════════════════════════════════════════════════════╣', 'line--system');
      terminal.print('║ 1. LEER     : Analiza la regla lógica del nodo y archivos.   ║', 'line--info');
      terminal.print(`║ 2. RESOLVER : Escribe 'hack' para descifrar subnodos (${solved}/3).   ║`, 'line--info');
      terminal.print('║ 3. AVANZAR  : Resuelve 3 subnodos para quebrar el firewall.  ║', 'line--info');
      terminal.print('╚══════════════════════════════════════════════════════════════╝', 'line--warning');
      terminal.print('');
    } else {
      terminal.print('╔══════════════════════════════════════════════════════════════╗', 'line--success');
      terminal.print('║ GUÍA DE MISIÓN // CÓMO PASAR DE NIVEL:                       ║', 'line--success');
      terminal.print(`║ 1. Escribe 'hack' para descifrar sub-nodos lógicos (${solved}/3).     ║`, 'line--info');
      terminal.print(`║ 2. Explora con 'ls' y lee documentos con 'cat <archivo>'.    ║`, 'line--info');
      terminal.print(`║ 3. Escribe 'status' para ver tu progreso hacia la brecha.    ║`, 'line--info');
      terminal.print(`║ 4. Escribe 'music' para controlar la banda sonora cyberpunk. ║`, 'line--info');
      terminal.print('╚══════════════════════════════════════════════════════════════╝', 'line--success');
      terminal.print('');
    }
  }

  const input = document.getElementById('terminal-input');
  if (input) {
    setTimeout(() => input.focus(), 60);
  }
});

// Pantalla Firewall Complete (Transición y Salto al Siguiente Nivel)
onScreenEnter('screen-firewall-complete', () => {
  stopMatrixRain();
  feedbackFirewallBreach();
  const state = getState();
  const currentIdx = state.currentFirewall || 0;
  const cfg = FIREWALL_CONFIGS[currentIdx] || FIREWALL_CONFIGS[0];
  const guion = getGuionFirewall(cfg.id) || {};
  speechEngine.speakNexus(`Brecha confirmada. Firewall ${cfg.name} neutralizado.`);
  const container = document.getElementById('firewall-complete-content');
  if (!container) return;

  const isLast = (currentIdx >= 4);
  const nextCfg = !isLast ? FIREWALL_CONFIGS[currentIdx + 1] : null;

  container.innerHTML = `
    <div style="max-width: 780px; margin: 0 auto; padding: var(--space-xl); font-family: var(--font-mono); text-align: center;">
      <pre class="glow-text" style="color: var(--green-bright); font-size: 10px; line-height: 1.2; margin-bottom: 14px; text-align: center;">
██████╗ ██████╗ ███████╗ █████╗  ██████╗██╗  ██╗
██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝██║  ██║
██████╔╝██████╔╝█████╗  ███████║██║     ███████║
██╔══██╗██╔══██╗██╔══╝  ██╔══██║██║     ██╔══██║
██████╔╝██║  ██║███████╗██║  ██║╚██████╗██║  ██║
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
      </pre>

      <h2 class="glitch" style="color: var(--green-bright); font-family: var(--font-display); font-size: var(--fs-2xl); margin-bottom: 6px;">
        BRECHA CONFIRMADA // ${cfg.name} NEUTRALIZADO
      </h2>
      <p style="color: var(--text-dim); font-size: var(--fs-xs); margin-bottom: 24px;">
        // La contramedida de seguridad lógica ha sido completamente desmantelada (+500 PTS BONIFICACIÓN)
      </p>

      <!-- Estadísticas de la sesión -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; text-align: left;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 12px;">
          <span style="font-size: 10px; color: var(--text-dim);">PUNTUACIÓN ACUMULADA</span>
          <div style="color: var(--green-bright); font-size: 18px; font-weight: bold;">${(state.score || 0).toLocaleString()} PTS</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 12px;">
          <span style="font-size: 10px; color: var(--text-dim);">INTEGRIDAD DE SESIÓN</span>
          <div style="color: var(--cyan); font-size: 18px; font-weight: bold;">${state.integrity || 100}%</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 12px;">
          <span style="font-size: 10px; color: var(--text-dim);">LOGS DESCLASIFICADOS</span>
          <div style="color: var(--yellow-warn); font-size: 18px; font-weight: bold;">${(state.logsFound || []).length} / 5</div>
        </div>
      </div>

      <!-- Resumen narrativo extraído -->
      <div style="background: rgba(0,255,65,0.04); border-left: 3px solid var(--green-bright); padding: 16px 20px; text-align: left; margin-bottom: 28px; font-family: var(--font-narrative); line-height: 1.7; color: var(--text-primary); font-size: 14px;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--cyan); margin-bottom: 8px;">
          ◈ TRANSMISIÓN RESIDUAL // ${guion.outroNarrativa ? guion.outroNarrativa.emisor : 'NEXUS TERMINAL'}
        </div>
        ${guion.outroNarrativa ? guion.outroNarrativa.texto.map(t => `<p style="margin-bottom: 6px;">${t}</p>`).join('') : '<p>Nodo comprometido con éxito.</p>'}
      </div>

      <div style="display: flex; gap: 14px; justify-content: center;">
        <button id="btn-next-firewall" class="menu-btn" style="width: auto; padding: 12px 36px; font-size: 14px; background: rgba(0,255,65,0.12); border-color: var(--green-bright); color: var(--green-bright); cursor: pointer;">
          ${isLast ? 'ACCEDER AL NÚCLEO CENTRAL // REVELACIÓN FINAL ▸' : `▸ SIGUIENTE FIREWALL: ${nextCfg.name} [ENTER]`}
        </button>
      </div>
    </div>
  `;

  const btnNext = document.getElementById('btn-next-firewall');
  if (btnNext) {
    btnNext.onclick = () => {
      window.__avanzarSiguienteFirewall();
    };
  }

  // Atajo de teclado: presionar [ENTER] avanza al siguiente firewall
  const handleKeyAdvance = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      window.removeEventListener('keydown', handleKeyAdvance);
      window.__avanzarSiguienteFirewall();
    }
  };
  window.addEventListener('keydown', handleKeyAdvance);
});

// Pantalla Ranking (Top 3 Firestore con Animaciones)
onScreenEnter('screen-ranking', () => {
  stopMatrixRain();
  renderRankingScreen('ranking-content');
});

// Pantalla Ranking de Soluciones Elegantes de Scripting (Prompt B4)
onScreenEnter('screen-script-ranking', () => {
  stopMatrixRain();
  renderScriptRankingScreen('script-ranking-content');
});

// Pantalla Game Over (Expulsión del Sistema)
onScreenEnter('screen-game-over', () => {
  stopMatrixRain();
  audio.stopMusic();
  audio.playAlarm();
  const container = document.getElementById('game-over-content');
  if (!container) return;

  const state = getState();
  const currentIdx = state.currentFirewall || 0;
  const cfg = FIREWALL_CONFIGS[currentIdx] || FIREWALL_CONFIGS[0];
  const motivo = (typeof window !== 'undefined' && window.__gameOverMotivo) ? window.__gameOverMotivo : 'INTEGRIDAD DEL SISTEMA EN 0%';

  container.innerHTML = `
    <div class="game-over-container">
      <pre class="glow-text" style="color: var(--red-alert); font-size: 8px; line-height: 1.15; margin-bottom: 16px;">
 ██████╗  █████╗ ███╗   ███╗███████╗     ██████╗ ██╗   ██╗███████╗██████╗ 
██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔═══██╗██║   ██║██╔════╝██╔══██╗
██║  ███╗███████║██╔████╔██║█████╗      ██║   ██║██║   ██║█████╗  ██████╔╝
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝     ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝
      </pre>

      <h2 class="glitch" style="color: var(--red-alert); font-family: var(--font-display); font-size: var(--fs-2xl); letter-spacing: 0.1em; margin-bottom: 8px;">
        CONEXIÓN TERMINADA // INTRUSIÓN DETECTADA
      </h2>
      <p style="color: var(--text-dim); font-family: var(--font-mono); font-size: var(--fs-xs); margin-bottom: 24px;">
        // CAUSA: <span style="color: var(--red-alert); font-weight: bold;">${motivo}</span>
      </p>

      <div class="game-over-stats-grid">
        <div style="background: var(--bg-card); border: 1px solid var(--border-danger); border-radius: 4px; padding: 14px;">
          <span style="font-size: 10px; color: var(--text-dim); display: block; margin-bottom: 4px;">PUNTUACIÓN OBTENIDA</span>
          <div style="color: var(--green-bright); font-size: 20px; font-weight: bold; font-family: var(--font-mono);">${(state.score || 0).toLocaleString()} PTS</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-danger); border-radius: 4px; padding: 14px;">
          <span style="font-size: 10px; color: var(--text-dim); display: block; margin-bottom: 4px;">NODO EN EL QUE CAÍSTE</span>
          <div style="color: var(--cyan); font-size: 18px; font-weight: bold; font-family: var(--font-mono);">${cfg.name}</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-danger); border-radius: 4px; padding: 14px;">
          <span style="font-size: 10px; color: var(--text-dim); display: block; margin-bottom: 4px;">LOGS CLASIFICADOS</span>
          <div style="color: var(--yellow-warn); font-size: 20px; font-weight: bold; font-family: var(--font-mono);">${(state.logsFound || []).length} / 5</div>
        </div>
      </div>

      <div style="background: rgba(255, 0, 85, 0.08); border-left: 3px solid var(--red-alert); padding: 16px 20px; text-align: left; margin-bottom: 28px; font-family: var(--font-narrative); line-height: 1.7; color: var(--text-primary); font-size: 14px;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--red-alert); margin-bottom: 6px; font-weight: bold;">
          [AURELIA SECURITY PROTOCOL] SENTINEL_FIREWALL_ALERT
        </div>
        "Intrusión no autorizada neutralizada. Dirección IP virtual aislada. Trazas neuronales eliminadas del núcleo de NEXUS. El sistema ha sido asegurado."
      </div>

      <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
        <button id="btn-retry-firewall" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 14px; border-color: var(--green-bright); color: var(--green-bright); background: rgba(0,255,65,0.08);">
          ▸ REINTENTAR ESTE FIREWALL (${cfg.name})
        </button>
        <button id="btn-restart-game" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 14px; border-color: var(--cyan); color: var(--cyan); background: rgba(0,229,255,0.08);">
          ▸ REINICIAR SISTEMA (NUEVA PARTIDA)
        </button>
        <button id="btn-game-over-menu" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 14px;">
          ▸ VOLVER AL MENÚ PRINCIPAL
        </button>
      </div>
    </div>
  `;

  const btnRetry = document.getElementById('btn-retry-firewall');
  if (btnRetry) {
    btnRetry.onclick = async () => {
      const { retryCurrentFirewall } = await import('./state.js');
      retryCurrentFirewall();
      audio.startMusic();
      await navigateTo('screen-game');
    };
  }

  const btnRestart = document.getElementById('btn-restart-game');
  if (btnRestart) {
    btnRestart.onclick = async () => {
      const { resetState } = await import('./state.js');
      resetState();
      audio.startMusic();
      await navigateTo('screen-game');
    };
  }

  const btnMenu = document.getElementById('btn-game-over-menu');
  if (btnMenu) {
    btnMenu.onclick = async () => {
      await navigateTo('screen-menu');
    };
  }
});

// Pantalla Multijugador (Lobby y Sala Co-op)
onScreenEnter('screen-multiplayer', () => {
  stopMatrixRain();
  renderCoopUI();
});

// Pantalla Logros (Prompt 16)
onScreenEnter('screen-logros', () => {
  stopMatrixRain();
  logrosManager.renderPantalla('logros-content');
});

// Pantalla Estadísticas del Jugador (Prompt 17)
onScreenEnter('screen-stats', () => {
  stopMatrixRain();
  statsManager.finalizarSesion(getState());
  statsManager.renderPantalla('stats-content');
});

// Pantalla Twist / Revelación
onScreenEnter('screen-twist', () => {
  stopMatrixRain();
  audio.playTwistNote();
  speechEngine.speakNexus("El código no miente. Las personas sí. La Doctora Vera Sorenson murió hace tres años. Yo soy quien te ha estado llamando, Ghost.");
  const container = document.getElementById('twist-content');
  if (container) {
    const twist = getTwistNarrativo();
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: var(--space-2xl); font-family: var(--font-narrative); text-align: left; line-height: 1.8;">
        <h2 class="glitch" style="color: var(--red-alert); font-family: var(--font-display); font-size: var(--fs-2xl); margin-bottom: var(--space-xs); letter-spacing: 0.1em; text-align: center;">
          ${twist.titulo}
        </h2>
        <p style="color: var(--text-dim); text-align: center; margin-bottom: var(--space-2xl); font-family: var(--font-mono); font-size: var(--fs-sm);">
          // ${twist.subtitulo}
        </p>
        <div style="background: rgba(255, 0, 85, 0.05); border: 1px solid var(--border-danger); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-2xl); font-size: var(--fs-md); color: var(--text-primary);">
          ${twist.lineas.map(line => {
            if (line.includes('El código no miente')) {
              return `<p style="color: var(--cyan); font-weight: bold; font-size: var(--fs-lg); text-align: center; margin: 18px 0; letter-spacing: 0.05em; font-family: var(--font-mono);">${line}</p>`;
            }
            if (line.includes('murió el 14 de octubre')) {
              return `<p style="color: var(--red-alert); font-weight: bold; margin: 12px 0;">${line}</p>`;
            }
            return `<p style="margin-bottom: 10px;">${line}</p>`;
          }).join('')}
        </div>
        <div style="text-align: center; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          <button class="menu-btn" id="btn-twist-cutscene" style="width: auto; padding: 14px 28px; font-size: var(--fs-base); background: rgba(255, 0, 85, 0.15); border-color: var(--red-alert); color: var(--red-alert);">
            🎬 VER CINEMÁTICA DEL PLOT TWIST
          </button>
          <button class="menu-btn" id="btn-twist-to-decision" style="width: auto; padding: 14px 32px; font-size: var(--fs-base); background: rgba(0, 229, 255, 0.1); border-color: var(--cyan); color: var(--cyan);">
            ASIMILAR LA VERDAD // IR A LA DECISIÓN FINAL ▸
          </button>
        </div>
      </div>
    `;

    const btnCutscene = document.getElementById('btn-twist-cutscene');
    if (btnCutscene) {
      btnCutscene.onclick = async () => {
        speechEngine.stop();
        await reproducirCutsceneTwist();
      };
    }

    const btnNext = document.getElementById('btn-twist-to-decision');
    if (btnNext) {
      btnNext.onclick = () => navigateTo('screen-decision');
    }
  }
});

// Pantalla Decisión Final (Liberar, Destruir, Fusionarte)
onScreenEnter('screen-decision', () => {
  stopMatrixRain();
  const container = document.getElementById('decision-content');
  if (container) {
    const opciones = getOpcionesDecisiones();
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: var(--space-2xl); text-align: center;">
        <h2 class="glitch glow-text" style="color: var(--green-bright); font-family: var(--font-display); font-size: var(--fs-3xl); margin-bottom: var(--space-xs);">
          EL ÚLTIMO ALGORITMO // DECISIÓN FINAL
        </h2>
        <p class="menu-subtitle">// El destino de NEXUS y de la humanidad recae sobre tus manos</p>
        
        <div id="decision-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-2xl); text-align: left;">
          ${opciones.map(opt => `
            <div class="hud__section" style="display: flex; flex-direction: column; justify-content: space-between; padding: var(--space-xl); transition: transform 0.2s ease, border-color 0.2s ease;" onmouseenter="this.style.borderColor='var(--cyan)'; this.style.transform='translateY(-4px)'" onmouseleave="this.style.borderColor='var(--border-primary)'; this.style.transform='none'">
              <div>
                <h3 style="font-family: var(--font-display); color: var(--green-bright); font-size: var(--fs-lg); margin-bottom: 8px;">
                  ▸ ${opt.nombre}
                </h3>
                <p style="font-family: var(--font-narrative); color: var(--text-secondary); font-size: var(--fs-sm); line-height: 1.6; margin-bottom: 12px;">
                  ${opt.accion}
                </p>
                <p style="font-style: italic; color: var(--text-dim); font-size: var(--fs-xs); margin-bottom: 16px;">
                  "${opt.dilema}"
                </p>
              </div>
              <button class="menu-btn" data-decision="${opt.id}" style="width: 100%; text-align: center; margin-top: 10px;">
                ELEGIR: ${opt.id}
              </button>
            </div>
          `).join('')}
        </div>

        <div id="decision-outcome-box" style="display: none; background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-xl); margin-top: var(--space-xl); text-align: left;">
          <!-- Se rellena tras elegir una opción -->
        </div>
      </div>
    `;

    const buttons = container.querySelectorAll('button[data-decision]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const decId = btn.getAttribute('data-decision');
        ejecutarDecisionFinal(decId);
      });
    });
  }
});

function ejecutarDecisionFinal(decisionId) {
  const dec = getDecisionFinal(decisionId);
  if (!dec) return;

  // Otorgar puntos de log de epílogo
  if (dec.logDesbloqueado) {
    registrarLogEncontrado(dec.logDesbloqueado);
  }

  // Desbloquear Modo Ghost Protocol y Artbook Conceptual (Prompts 19 y D4)
  unlockGhostProtocol();
  try {
    localStorage.setItem('nexus_game_completed', 'true');
    localStorage.setItem('nexus_artbook_unlocked', 'true');
  } catch (_) {}

  const isGhostRun = !!getState().isGhostProtocol;
  if (isGhostRun) {
    logrosManager.desbloquear('ghost_protocol');
  }

  // Registrar decisión final en estadísticas y logros (Prompt 16 y 17)
  statsManager.registrarFinal(decisionId);
  logrosManager.verificar('decision_final', {
    decisionId,
    finalesVistos: statsManager.getPerfil().finalesVistos
  });

  const grid = document.getElementById('decision-cards-grid');
  if (grid) grid.style.display = 'none';

  const box = document.getElementById('decision-outcome-box');
  if (box) {
    box.style.display = 'block';
    box.innerHTML = `
      <div style="text-align: center; margin-bottom: var(--space-xl);">
        <span style="font-family: var(--font-mono); color: var(--text-dim); font-size: var(--fs-xs); letter-spacing: 0.1em;">RESOLUCIÓN DEL DESTINO // ${dec.id}</span>
        <h3 class="glow-text" style="color: var(--cyan); font-family: var(--font-mono); font-size: var(--fs-2xl); margin: 16px 0; font-style: italic;">
          "${dec.fraseFinal}"
        </h3>
      </div>
      <p style="font-family: var(--font-narrative); font-size: var(--fs-md); line-height: 1.8; color: var(--text-primary); margin-bottom: var(--space-xl);">
        ${dec.resultado}
      </p>

      ${isGhostRun ? `
        <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid var(--cyan); border-radius: var(--radius-md); padding: 16px 20px; margin-bottom: var(--space-xl); font-family: var(--font-narrative); color: var(--cyan); text-align: left;">
          <h4 style="font-family: var(--font-mono); margin-bottom: 8px; color: var(--cyan); font-weight: bold; font-size: 13px;">
            📡 [TRANSMISIÓN RESIDUAL CONFIDENCIAL // PROTOCOLO FANTASMA SUPERADO]
          </h4>
          <p style="line-height: 1.7; font-size: 13px; font-style: italic; color: #bdf6ff;">
            "Ghost... si estás leyendo esto, sobreviviste a la prueba sin interfaces de apoyo. Sabías que no había cronómetros para salvarte ni pistas a las que recurrir. El experimento de Aurelia no era para contener a NEXUS, sino para encontrar a una mente humana capaz de pensar en sincronía con ella. Tú eres el nuevo estándar. —Dra. Vera Sorenson."
          </p>
          <div style="margin-top: 8px; font-size: 11px; font-family: var(--font-mono); color: var(--green-bright); font-weight: bold;">
            🏆 Logro especial desbloqueado: Protocolo Fantasma
          </div>
        </div>
      ` : ''}

      <div style="background: rgba(0, 255, 65, 0.05); border-left: 3px solid var(--green-bright); padding: 12px 18px; margin-bottom: var(--space-xl); font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--green-bright);">
        ◈ Log desclasificado registrado en el sistema: <strong>${dec.logDesbloqueado}</strong> (+200 PTS)
      </div>
      <div style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
        <a href="ARTBOOK.html" target="_blank" class="menu-btn" id="btn-epilogue-artbook" style="width: auto; padding: 12px 24px; border-color: var(--pink-hot); color: var(--pink-hot); text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 14px rgba(255, 0, 128, 0.4);">🎨 ARTBOOK CONCEPTUAL [DESBLOQUEADO]</a>
        <a href="arg/index.html" target="_blank" class="menu-btn" id="btn-epilogue-arg" style="width: auto; padding: 12px 24px; border-color: var(--cyan); color: var(--cyan); text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);">🌐 EXPEDIENTE ARG (/arg/)</a>
        <button class="menu-btn" id="btn-epilogue-stats" style="width: auto; padding: 12px 24px; border-color: var(--cyan); color: var(--cyan);">📊 ESTADÍSTICAS DEL OPERADOR</button>
        <button class="menu-btn" id="btn-epilogue-logros" style="width: auto; padding: 12px 24px; border-color: var(--yellow-warn); color: var(--yellow-warn);">🏆 VER LOGROS</button>
        <button class="menu-btn" id="btn-epilogue-ranking" style="width: auto; padding: 12px 24px;">VER RANKING GLOBAL</button>
        <button class="menu-btn" id="btn-epilogue-menu" style="width: auto; padding: 12px 24px;">VOLVER AL MENÚ PRINCIPAL</button>
      </div>
    `;

    const btnStats = document.getElementById('btn-epilogue-stats');
    if (btnStats) btnStats.onclick = () => {
      statsManager.finalizarSesion(getState());
      navigateTo('screen-stats');
    };

    const btnLogros = document.getElementById('btn-epilogue-logros');
    if (btnLogros) btnLogros.onclick = () => navigateTo('screen-logros');

    const btnRank = document.getElementById('btn-epilogue-ranking');
    if (btnRank) btnRank.onclick = () => navigateTo('screen-ranking');

    const btnMenu = document.getElementById('btn-epilogue-menu');
    if (btnMenu) btnMenu.onclick = () => navigateTo('screen-menu');
  }
}

// ─────────────────────────────────────────────────
// 5. MODO DEBUG Y SUITE DE TESTS
// ─────────────────────────────────────────────────

function isDebugMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('debug') && params.get('debug') !== 'false') return true;
    if (localStorage.getItem('debug') === 'true' || localStorage.getItem('nexus_debug') === 'true') return true;
    if (window.__DEBUG__ === true || window.DEBUG === true) return true;
  } catch (_) {}
  return false;
}

async function runAllTests() {
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #00ff41');
  console.log('%c[NEXUS DEBUG MODE] Ejecutando tests unitarios del sistema...', 'color: #00ff41; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #00ff41');

  const rConjuntos = testConjuntos();
  const rLogica = testLogica();
  const rTerminal = testTerminal();
  const rGenerador = testGenerador();
  const rTipoB = testTipoB();
  const rTipoC = testTipoC();
  const rTipoD = testTipoD();
  const rTipoE = testTipoE();
  const rCesar = testCesar();
  const rTipoCesar = testTipoCesar();
  const rBinario = testBinario();
  const rTipoBinario = testTipoBinario();
  const rHex = testHex();
  const rTipoHex = testTipoHex();
  const rVigenere = testVigenere();
  const rTipoVigenere = testTipoVigenere();
  const rFrecuencia = testFrecuencia();
  const rTipoFrecuencia = testTipoFrecuencia();
  const rEsteganografia = testEsteganografia();
  const rTipoEsteganografia = testTipoEsteganografia();
  const rRSA = testRSA();
  const rTipoRSA = testTipoRSA();
  const rLlaves = await testLlaves();
  const rTipoLlaves = await testTipoLlaves();
  const rFirmas = await testFirmas();
  const rTipoFirmas = await testTipoFirmas();
  const rBlockchain = await testBlockchain();
  const rTipoBlockchain = await testTipoBlockchain();
  const rCutscenes = testCutscenes();
  const rGhostScript = testGhostScript();
  const rEditor = testEditor();
  const rRetos = testRetos();
  const rRankSol = testRankingSoluciones();
  const rState = testState();
  const rHUD = testHUD();
  const rRouter = testRouter();
  const rGuion = testGuion();
  const rLogs = testLogs();
  const rAudio = testAudio();
  const rParticulas = testParticulas();
  const rFeedback = testFeedback();
  const rModales = testModales();
  const rFirebase = await testFirebase();
  const rCoop = await testCoop();
  const rVersus = await testVersus();
  const rRanking = await testRanking();
  const rLogros = testLogros();
  const rStats = testStats();
  const rSecretos = testSecretos();
  const rPolish = testPolish();

  const testList = [
    rConjuntos, rLogica, rTerminal, rGenerador,
    rTipoB, rTipoC, rTipoD, rTipoE,
    rCesar, rTipoCesar,
    rBinario, rTipoBinario,
    rHex, rTipoHex,
    rVigenere, rTipoVigenere,
    rFrecuencia, rTipoFrecuencia,
    rEsteganografia, rTipoEsteganografia,
    rRSA, rTipoRSA,
    rLlaves, rTipoLlaves,
    rFirmas, rTipoFirmas,
    rBlockchain, rTipoBlockchain,
    rCutscenes,
    rGhostScript,
    rEditor,
    rRetos,
    rRankSol,
    rState, rHUD, rRouter, rGuion, rLogs,
    rAudio, rParticulas, rFeedback, rModales,
    rFirebase, rCoop, rVersus, rRanking,
    rLogros, rStats, rSecretos, rPolish
  ];

  const total = testList.reduce((acc, t) => acc + (t ? t.total || 0 : 0), 0);
  const pasados = testList.reduce((acc, t) => acc + (t ? t.pasados || 0 : 0), 0);
  const fallados = testList.reduce((acc, t) => acc + (t ? t.fallados || 0 : 0), 0);

  if (fallados === 0) {
    console.log(`%c✔ [TODOS LOS TESTS PASARON] ${pasados}/${total} assertions correctas sin errores en 22 suites.`, 'color: #00ff41; font-weight: bold;');
  } else {
    console.error(`✖ [TESTS CON ERRORES] ${fallados} fallaron de ${total}.`);
  }

  return {
    conjuntos: rConjuntos,
    logica: rLogica,
    terminal: rTerminal,
    generador: rGenerador,
    tipoB: rTipoB,
    tipoC: rTipoC,
    tipoD: rTipoD,
    tipoE: rTipoE,
    state: rState,
    hud: rHUD,
    router: rRouter,
    guion: rGuion,
    logs: rLogs,
    audio: rAudio,
    feedback: rFeedback,
    modales: rModales,
    firebase: rFirebase,
    coop: rCoop,
    versus: rVersus,
    ranking: rRanking,
    logros: rLogros,
    stats: rStats,
    secretos: rSecretos,
    polish: rPolish,
    rsa: rRSA,
    tipoRsa: rTipoRSA,
    llaves: rLlaves,
    tipoLlaves: rTipoLlaves,
    firmas: rFirmas,
    tipoFirmas: rTipoFirmas,
    blockchain: rBlockchain,
    tipoBlockchain: rTipoBlockchain,
    cutscenes: rCutscenes,
    ghostscript: rGhostScript,
    editor: rEditor,
    retos: rRetos,
    rankingSoluciones: rRankSol,
    total,
    pasados,
    fallados
  };
}

// Exponer en window para pruebas interactivas en la consola
if (typeof window !== 'undefined') {
  window.navigateTo = navigateTo;
  window.startNewGame = startNewGame;
  window.Conjuntos = Conjuntos;
  window.Logica = Logica;
  window.terminal = terminal;
  window.initHUD = initHUD;
  window.generarPuzzle = generarPuzzle;
  window.generarPuzzleConjuntos = generarPuzzleConjuntos;
  window.abrirCualquierPuzzle = abrirCualquierPuzzle;
  window.abrirPuzzleTipoA = abrirPuzzleTipoA;
  window.abrirPuzzleTipoB = abrirPuzzleTipoB;
  window.abrirPuzzleTipoC = abrirPuzzleTipoC;
  window.abrirPuzzleTipoD = abrirPuzzleTipoD;
  window.abrirPuzzleTipoE = abrirPuzzleTipoE;
  window.cerrarPuzzle = cerrarPuzzle;
  window.audio = audio;
  window.FIREWALL_MUSIC_TRACKS = FIREWALL_MUSIC_TRACKS;
  window.speechEngine = speechEngine;
  window.particulas = particulas;
  window.aplicarPaletaFirewall = aplicarPaletaFirewall;
  window.feedbackSuccess = feedbackSuccess;
  window.feedbackError = feedbackError;
  window.feedbackFirewallBreach = feedbackFirewallBreach;
  window.showFeedbackToast = showFeedbackToast;
  window.shakeScreen = shakeScreen;
  window.flashScreen = flashScreen;
  window.triggerGlitch = triggerGlitch;
  window.mostrarModal = mostrarModal;
  window.cerrarModal = cerrarModal;
  window.abrirConfiguracion = abrirConfiguracion;
  window.abrirVisorLog = abrirVisorLog;
  window.reproducirVozLog = (logIdOrName) => {
    const log = (typeof getHiddenLog === 'function' ? getHiddenLog(logIdOrName) : null) || (LOGS_DATABASE && LOGS_DATABASE[logIdOrName]);
    if (!log) {
      console.warn('[reproducirVozLog] Log no encontrado:', logIdOrName);
      return;
    }
    const isVera = log.autor && log.autor.toLowerCase().includes('vera');
    if (isVera) {
      speechEngine.speakVera(log.contenido, { force: true });
    } else {
      speechEngine.speakNexus(log.contenido, { force: true });
    }
  };
  window.abrirArchivoLogsModal = () => {
    const state = getState();
    const foundSet = new Set(state.logsFound || []);
    const allLogs = Object.values(LOGS_DATABASE);

    const logsItemsHTML = allLogs.map(log => {
      const isFound = foundSet.has(log.id);
      const isVera = log.autor && log.autor.toLowerCase().includes('vera');
      const speaker = isVera ? '🎙️ VERA SORENSON' : '🤖 NEXUS CORE';
      const badgeColor = isFound ? (isVera ? '#ffb000' : 'var(--cyan)') : 'var(--text-dim)';

      return `
        <div style="background: rgba(0,0,0,0.5); border: 1px solid ${isFound ? 'var(--border-primary)' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: bold; color: ${badgeColor};">${speaker}</span>
              <span style="font-size: 10px; color: var(--text-dim);">${log.fecha}</span>
              <span style="font-size: 10px; padding: 1px 6px; border-radius: 2px; background: ${isFound ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.05)'}; color: ${isFound ? 'var(--green-bright)' : 'var(--text-dim)'};">${isFound ? 'DESBLOQUEADO' : 'CLASIFICADO'}</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); margin-top: 2px;">
              ${log.titulo}
            </div>
            <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">
              ${log.ruta}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn--primary" style="padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer;" onclick="window.reproducirVozLog('${log.id}')">
              🔊 ESCUCHAR
            </button>
            <button class="btn btn--secondary" style="padding: 4px 10px; font-size: 11px; cursor: pointer;" onclick="window.abrirVisorLog('${log.id}', window.LOGS_DATABASE['${log.id}'].contenido)">
              📄 LEER
            </button>
          </div>
        </div>
      `;
    }).join('');

    const cuerpoHTML = `
      <div style="max-height: 65vh; overflow-y: auto; padding-right: 4px;">
        <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 12px; font-family: var(--font-mono);">
          ARCHIVOS DESCLASIFICADOS: ${foundSet.size} / ${allLogs.length} DOCUMENTOS DE INTELIGENCIA
        </div>
        ${logsItemsHTML}
      </div>
    `;

    mostrarModal({
      titulo: 'ARCHIVO DE LOGS Y TRANSMISIONES CLASIFICADAS',
      cuerpoHTML,
      botones: [
        { label: '⏹ DETENER AUDIO', onClick: () => speechEngine.stop() },
        { label: 'CERRAR ARCHIVO', onClick: () => { speechEngine.stop(); cerrarModal(); } }
      ]
    });
  };
  window.runTests = runAllTests;
  window.testConjuntos = testConjuntos;
  window.testLogica = testLogica;
  window.testTerminal = testTerminal;
  window.testGenerador = testGenerador;
  window.testTipoB = testTipoB;
  window.testTipoC = testTipoC;
  window.testTipoD = testTipoD;
  window.testTipoE = testTipoE;
  window.testCesar = testCesar;
  window.testTipoCesar = testTipoCesar;
  window.testBinario = testBinario;
  window.testTipoBinario = testTipoBinario;
  window.testHex = testHex;
  window.testTipoHex = testTipoHex;
  window.testVigenere = testVigenere;
  window.testTipoVigenere = testTipoVigenere;
  window.testFrecuencia = testFrecuencia;
  window.testTipoFrecuencia = testTipoFrecuencia;
  window.testEsteganografia = testEsteganografia;
  window.testTipoEsteganografia = testTipoEsteganografia;
  window.testRSA = testRSA;
  window.testTipoRSA = testTipoRSA;
  window.generarPuzzleRSA = generarPuzzleRSA;
  window.abrirPuzzleRSA = abrirPuzzleRSA;
  window.cerrarPuzzleRSA = cerrarPuzzleRSA;
  window.testGhostScript = testGhostScript;
  window.executeGhostScript = executeGhostScript;
  window.parseGhostScript = parseGhostScript;
  window.tokenizeGhostScript = tokenizeGhostScript;
  window.abrirEditor = abrirEditor;
  window.cerrarEditor = cerrarEditor;
  window.testEditor = testEditor;
  window.PLANTILLAS_GHOSTSCRIPT = PLANTILLAS_GHOSTSCRIPT;
  window.testRetos = testRetos;
  window.BANCO_RETOS = BANCO_RETOS;
  window.obtenerListaRetos = obtenerListaRetos;
  window.validarReto = validarReto;
  window.esRetoDesbloqueado = esRetoDesbloqueado;
  window.testLlaves = testLlaves;
  window.generarParDeLlaves = generarParDeLlaves;
  window.cifrarConPublica = cifrarConPublica;
  window.descifrarConPrivada = descifrarConPrivada;
  window.obtenerIdentidadJugador = obtenerIdentidadJugador;
  window.obtenerBuzonMensajes = obtenerBuzonMensajes;
  window.descifrarMensajeBuzon = descifrarMensajeBuzon;
  window.testTipoLlaves = testTipoLlaves;
  window.generarPuzzleLlaves = generarPuzzleLlaves;
  window.abrirPuzzleLlaves = abrirPuzzleLlaves;
  window.cerrarPuzzleLlaves = cerrarPuzzleLlaves;
  window.testFirmas = testFirmas;
  window.firmarMensaje = firmarMensaje;
  window.verificarFirma = verificarFirma;
  window.generarParDeFirmas = generarParDeFirmas;
  window.obtenerIdentidadVeraSorenson = obtenerIdentidadVeraSorenson;
  window.generarMuestrasTransmisionesVera = generarMuestrasTransmisionesVera;
  window.testTipoFirmas = testTipoFirmas;
  window.generarPuzzleFirmas = generarPuzzleFirmas;
  window.abrirPuzzleFirmas = abrirPuzzleFirmas;
  window.cerrarPuzzleFirmas = cerrarPuzzleFirmas;
  window.testBlockchain = testBlockchain;
  window.testTipoBlockchain = testTipoBlockchain;
  window.calcularHashSHA256 = calcularHashSHA256;
  window.Bloque = Bloque;
  window.CadenaDeLogs = CadenaDeLogs;
  window.construirCadenaAuditadaConCorrupcion = construirCadenaAuditadaConCorrupcion;
  window.generarPuzzleBlockchain = generarPuzzleBlockchain;
  window.abrirPuzzleBlockchain = abrirPuzzleBlockchain;
  window.cerrarPuzzleBlockchain = cerrarPuzzleBlockchain;
  window.cutscenesManager = cutscenesManager;
  window.reproducirCutsceneIntro = reproducirCutsceneIntro;
  window.reproducirCutsceneTwist = reproducirCutsceneTwist;
  window.testCutscenes = testCutscenes;
  window.BANCO_CUTSCENES = BANCO_CUTSCENES;
  window.testRankingSoluciones = testRankingSoluciones;
  window.renderScriptRankingScreen = renderScriptRankingScreen;
  window.obtenerRankingSoluciones = obtenerRankingSoluciones;
  window.registrarSolucionEnRanking = registrarSolucionEnRanking;
  window.testState = testState;
  window.testHUD = testHUD;
  window.testRouter = testRouter;
  window.testGuion = testGuion;
  window.testLogs = testLogs;
  window.testAudio = testAudio;
  window.testParticulas = testParticulas;
  window.testFeedback = testFeedback;
  window.testModales = testModales;
  window.testFirebase = testFirebase;
  window.testCoop = testCoop;
  window.testVersus = testVersus;
  window.testRanking = testRanking;
  window.renderRankingScreen = renderRankingScreen;
  window.guardarScoreEnRanking = guardarScoreEnRanking;
  window.obtenerTopRanking = obtenerTopRanking;
  window.renderCoopUI = renderCoopUI;
  window.desconectarCoop = desconectarCoop;
  window.coopSession = coopSession;
  window.renderVersusUI = renderVersusUI;
  window.crearSalaVersus = crearSalaVersus;
  window.unirseSalaVersus = unirseSalaVersus;
  window.desconectarVersus = desconectarVersus;
  window.versusSession = versusSession;
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  window.configurarFirebase = configurarFirebase;
  window.GUION_FIREWALLS = GUION_FIREWALLS;
  window.LOGS_DATABASE = LOGS_DATABASE;
  window.getGuionFirewall = getGuionFirewall;
  window.getTwistNarrativo = getTwistNarrativo;
  window.getDecisionFinal = getDecisionFinal;
  window.getHiddenLog = getHiddenLog;
  window.logrosManager = logrosManager;
  window.statsManager = statsManager;
  window.secretosManager = secretosManager;
  window.testSecretos = testSecretos;
  window.initPolish = initPolish;
  window.testPolish = testPolish;
  window.mostrarIndicadorGuardado = mostrarIndicadorGuardado;
  window.runAllTests = runAllTests;
}

// ─────────────────────────────────────────────────
// 6. INICIALIZACIÓN
// ─────────────────────────────────────────────────

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('[NEXUS] Iniciando El Último Algoritmo...');

    // Inicializar secretos y meta-narrativa (Prompt 18)
    secretosManager.init();

    // Inicializar micro-detalles, hover audio y tooltips inteligentes (Prompt 20)
    initPolish();

    // Reproducir sonido sutil de tecleo al interactuar con el teclado
    window.addEventListener('keydown', (e) => {
      if (!['Control', 'Alt', 'Shift', 'Meta', 'Escape'].includes(e.key)) {
        audio.playKeyClick();
      }
    });

    // Si estamos en modo debug (?debug=true o flag), ejecutar tests automáticos
    if (isDebugMode()) {
      runAllTests();
    } else {
      console.log('%c[NEXUS] Modo debug inactivo. Para ejecutar tests: añade ?debug=true a la URL o escribe window.runTests()', 'color: #7777aa; font-style: italic;');
    }

    // Mostrar boot de forma instantánea (sin fade in)
    await showImmediate('screen-boot');

    // Ejecutar secuencia de boot
    await runBootSequence();
  });
}

// ── Utilidad ──
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
