/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Versus — Modo Competitivo 1v1 en Tiempo Real
 * Especificación: Sección 2.1 & 3.4 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 *
 * Características:
 * - Ambos jugadores ven el mismo puzzle al mismo tiempo.
 * - El primero en resolverlo correctamente gana el punto de la ronda.
 * - 5 rondas (Mejor de 5 / primero en ganar 3).
 * - Sincronización en tiempo real vía Firebase Realtime DB y BroadcastChannel.
 * - Marcador en vivo, chat terminal integrado y ranking al finalizar.
 */

import {
  crearPartida,
  obtenerPartida,
  actualizarPartida,
  enviarMensajeChat,
  suscribirPartida,
  desuscribirPartida
} from './firebase.js';

import { generarPuzzle } from '../puzzles/generador.js';
import { audio } from '../audio.js';
import { feedbackSuccess, feedbackError, showFeedbackToast } from '../ui/feedback.js';
import { guardarScoreEnRanking } from '../ranking.js';

// Estado local de la sesión versus
export const versusSession = {
  codigoSala: null,
  miUid: null,
  miNombre: 'Ghost',
  rol: null, // 'host' | 'guest'
  partidaData: null,
  unsubscribeFn: null,
  bloqueadoEnRonda: false
};

// Inicializar identificador local
function initLocalIdentity() {
  if (!versusSession.miUid) {
    try {
      let uid = localStorage.getItem('nexus_versus_uid');
      if (!uid) {
        uid = 'v_' + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('nexus_versus_uid', uid);
      }
      versusSession.miUid = uid;

      const savedName = localStorage.getItem('nexus_player_alias');
      if (savedName) versusSession.miNombre = savedName;
    } catch (_) {
      versusSession.miUid = 'v_' + Math.floor(Math.random() * 10000);
    }
  }
}

initLocalIdentity();

/**
 * Genera un código de sala de 6 caracteres único.
 * @returns {string}
 */
export function generarCodigoVersus() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Tipos de puzzles para las 5 rondas
 */
const TIPOS_RONDAS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Crea una nueva sala de Versus como Host.
 * @param {string} alias
 * @returns {Promise<string>}
 */
export async function crearSalaVersus(alias = 'Ghost') {
  initLocalIdentity();
  versusSession.miNombre = alias || 'Ghost';
  versusSession.rol = 'host';
  versusSession.bloqueadoEnRonda = false;
  try { localStorage.setItem('nexus_player_alias', versusSession.miNombre); } catch (_) {}

  const codigo = generarCodigoVersus();
  versusSession.codigoSala = codigo;

  // Generar primer puzzle de la ronda 1
  const puzzle1 = generarPuzzle(TIPOS_RONDAS[0], 1);

  const nuevaPartida = {
    id: codigo,
    estado: 'esperando', // 'esperando' | 'jugando' | 'ronda_fin' | 'terminado'
    modo: 'versus',
    host: {
      uid: versusSession.miUid,
      nombre: versusSession.miNombre,
      victorias: 0,
      puntos: 0
    },
    guest: null,
    rondaActual: 1,
    maxRondas: 5,
    puzzleActual: puzzle1,
    ganadorRonda: null,
    ganadorPartida: null,
    chat: [
      {
        autor: 'SISTEMA',
        texto: `Sala Versus [${codigo}] creada. Esperando oponente...`,
        timestamp: Date.now()
      }
    ],
    actualizadoEn: Date.now()
  };

  await crearPartida(codigo, nuevaPartida);
  versusSession.partidaData = nuevaPartida;
  conectarSincronizacionVersus(codigo);
  return codigo;
}

/**
 * Se une a una sala existente como Guest.
 * @param {string} codigo
 * @param {string} alias
 */
export async function unirseSalaVersus(codigo, alias = 'Phantom') {
  initLocalIdentity();
  const cleanCode = (codigo || '').trim().toUpperCase();
  versusSession.miNombre = alias || 'Phantom';
  versusSession.rol = 'guest';
  versusSession.codigoSala = cleanCode;
  versusSession.bloqueadoEnRonda = false;
  try { localStorage.setItem('nexus_player_alias', versusSession.miNombre); } catch (_) {}

  const partida = await obtenerPartida(cleanCode);
  if (!partida) {
    throw new Error(`La sala ${cleanCode} no existe o ya caducó.`);
  }

  if (partida.guest && partida.guest.uid !== versusSession.miUid) {
    throw new Error(`La sala ${cleanCode} ya está llena.`);
  }

  const updates = {
    guest: {
      uid: versusSession.miUid,
      nombre: versusSession.miNombre,
      victorias: 0,
      puntos: 0
    },
    estado: 'jugando',
    chat: [
      ...(partida.chat || []),
      {
        autor: 'SISTEMA',
        texto: `¡${versusSession.miNombre} se ha unido al combate! Ronda 1 iniciada.`,
        timestamp: Date.now()
      }
    ],
    actualizadoEn: Date.now()
  };

  await actualizarPartida(cleanCode, updates);
  conectarSincronizacionVersus(cleanCode);
  return cleanCode;
}

/**
 * Conecta la suscripción reactiva en tiempo real.
 * @param {string} codigo
 */
function conectarSincronizacionVersus(codigo) {
  if (versusSession.unsubscribeFn) {
    versusSession.unsubscribeFn();
    versusSession.unsubscribeFn = null;
  }

  versusSession.unsubscribeFn = suscribirPartida(codigo, (data) => {
    if (!data) return;
    const prevData = versusSession.partidaData;
    versusSession.partidaData = data;

    // Detectar si cambió de ronda o si alguien ganó la ronda
    if (prevData && data.ganadorRonda && data.ganadorRonda !== prevData.ganadorRonda) {
      if (data.ganadorRonda === versusSession.miUid) {
        feedbackSuccess(100, '¡Ganaste la ronda por velocidad!');
      } else {
        feedbackError(0, 'Tu rival resolvió el puzzle primero.');
      }
    }

    renderPantallaVersus();
  });
}

/**
 * Responde el puzzle actual de la ronda en curso.
 * @param {string} respuestaElegida
 */
export async function responderPuzzleVersus(respuestaElegida) {
  const p = versusSession.partidaData;
  if (!p || p.estado !== 'jugando' || versusSession.bloqueadoEnRonda) return;

  const puzzle = p.puzzleActual;
  if (!puzzle) return;

  const esCorrecto = (respuestaElegida === puzzle.respuestaCorrecta);

  if (esCorrecto) {
    // Reclamar victoria de ronda
    versusSession.bloqueadoEnRonda = true;
    const miUid = versusSession.miUid;
    const esHost = (versusSession.rol === 'host');

    const hostVic = (p.host ? p.host.victorias : 0) + (esHost ? 1 : 0);
    const guestVic = (p.guest ? p.guest.victorias : 0) + (!esHost ? 1 : 0);

    let nuevoEstado = 'ronda_fin';
    let ganadorPartida = null;

    if (hostVic >= 3) {
      nuevoEstado = 'terminado';
      ganadorPartida = p.host.uid;
    } else if (guestVic >= 3) {
      nuevoEstado = 'terminado';
      ganadorPartida = p.guest.uid;
    } else if (p.rondaActual >= p.maxRondas) {
      nuevoEstado = 'terminado';
      ganadorPartida = hostVic > guestVic ? p.host.uid : (guestVic > hostVic ? p.guest.uid : 'empate');
    }

    const updates = {
      estado: nuevoEstado,
      ganadorRonda: miUid,
      ganadorPartida: ganadorPartida,
      'host/victorias': hostVic,
      'guest/victorias': guestVic,
      chat: [
        ...(p.chat || []),
        {
          autor: 'SISTEMA',
          texto: `◈ ${versusSession.miNombre} resolvió correctamente y gana la Ronda ${p.rondaActual}.`,
          timestamp: Date.now()
        }
      ],
      actualizadoEn: Date.now()
    };

    await actualizarPartida(p.id, updates);

    // Si terminó la partida, registrar en ranking si fui ganador
    if (nuevoEstado === 'terminado' && ganadorPartida === miUid) {
      guardarScoreEnRanking(versusSession.miNombre, 1500, 5).catch(() => {});
    }
  } else {
    // Respuesta equivocada: penalización / bloqueo de 3 segundos
    versusSession.bloqueadoEnRonda = true;
    audio.playError();
    showFeedbackToast({
      titulo: 'RESPUESTA INCORRECTA',
      mensaje: 'Bloqueo temporal de 3 segundos aplicado.',
      tipo: 'error',
      duracion: 3000
    });

    renderPantallaVersus();
    setTimeout(() => {
      versusSession.bloqueadoEnRonda = false;
      renderPantallaVersus();
    }, 3000);
  }
}

/**
 * Avanza a la siguiente ronda (ejecutado por el Host o automáticamente).
 */
export async function avanzarSiguienteRondaVersus() {
  const p = versusSession.partidaData;
  if (!p || versusSession.rol !== 'host') return;

  const sigRonda = (p.rondaActual || 1) + 1;
  const tipoPuzzle = TIPOS_RONDAS[sigRonda - 1] || 'A';
  const nuevoPuzzle = generarPuzzle(tipoPuzzle, sigRonda <= 2 ? 1 : 2);

  const updates = {
    estado: 'jugando',
    rondaActual: sigRonda,
    puzzleActual: nuevoPuzzle,
    ganadorRonda: null,
    chat: [
      ...(p.chat || []),
      {
        autor: 'SISTEMA',
        texto: `── INICIA RONDA ${sigRonda} [Tipo ${tipoPuzzle}] ──`,
        timestamp: Date.now()
      }
    ],
    actualizadoEn: Date.now()
  };

  await actualizarPartida(p.id, updates);
  versusSession.bloqueadoEnRonda = false;
}

/**
 * Reinicia la partida para revancha.
 */
export async function reiniciarVersus() {
  const p = versusSession.partidaData;
  if (!p || versusSession.rol !== 'host') return;

  const puzzle1 = generarPuzzle(TIPOS_RONDAS[0], 1);
  const updates = {
    estado: 'jugando',
    rondaActual: 1,
    puzzleActual: puzzle1,
    ganadorRonda: null,
    ganadorPartida: null,
    'host/victorias': 0,
    'guest/victorias': 0,
    chat: [
      ...(p.chat || []),
      {
        autor: 'SISTEMA',
        texto: `── REVANCHA INICIADA // Marcadores reseteados ──`,
        timestamp: Date.now()
      }
    ],
    actualizadoEn: Date.now()
  };

  await actualizarPartida(p.id, updates);
  versusSession.bloqueadoEnRonda = false;
}

/**
 * Desconecta de la sesión actual de Versus.
 */
export function desconectarVersus() {
  if (versusSession.unsubscribeFn) {
    versusSession.unsubscribeFn();
    versusSession.unsubscribeFn = null;
  }
  versusSession.codigoSala = null;
  versusSession.partidaData = null;
  versusSession.rol = null;
  versusSession.bloqueadoEnRonda = false;
}

// ─────────────────────────────────────────────────
// RENDERIZADO VISUAL DEL MODO VERSUS
// ─────────────────────────────────────────────────

/**
 * Renderiza la interfaz principal del lobby o sala de Versus en #multiplayer-content.
 */
export function renderVersusUI(containerId = 'multiplayer-content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!versusSession.partidaData) {
    renderLobbyVersus(container);
  } else {
    renderPantallaVersus(container);
  }
}

function renderLobbyVersus(container) {
  const savedAlias = localStorage.getItem('nexus_player_alias') || 'Ghost';
  container.innerHTML = `
    <div style="max-width: 780px; margin: 0 auto; padding: var(--space-xl); font-family: var(--font-mono);">
      <!-- Botón volver al selector multiplayer -->
      <div style="margin-bottom: var(--space-md);">
        <button id="btn-back-to-mode-select" class="puzzle__opcion" style="padding: 4px 12px; font-size: 11px;">
          ◀ CAMBIAR A MODO CO-OP
        </button>
      </div>

      <div style="text-align: center; margin-bottom: var(--space-2xl);">
        <h2 class="glow-text glitch" style="color: var(--red-alert); font-family: var(--font-display); font-size: var(--fs-2xl); letter-spacing: 0.1em; margin-bottom: 6px;">
          MODO VERSUS 1v1 // RED DE INTRUSIÓN
        </h2>
        <p style="color: var(--text-dim); font-size: var(--fs-xs);">
          // Dos hackers. El mismo puzzle. El más veloz gana la ronda. Mejor de 5 rondas.
        </p>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-xl);">
        <div style="margin-bottom: var(--space-lg);">
          <label style="display: block; color: var(--cyan); font-size: 12px; margin-bottom: 6px;">TU ALIAS DE HACKER // </label>
          <input type="text" id="input-versus-alias" value="${savedAlias}" maxlength="14" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-primary); color: var(--green-bright); padding: 8px 12px; width: 100%; font-family: var(--font-mono); font-size: 14px; border-radius: 4px;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
          <!-- Crear sala -->
          <div style="border-right: 1px solid rgba(255,255,255,0.06); padding-right: var(--space-md);">
            <h3 style="font-family: var(--font-display); color: var(--green-bright); font-size: 13px; margin-bottom: 8px;">CREAR SALA VERSUS</h3>
            <p style="color: var(--text-dim); font-size: 11px; margin-bottom: 14px;">Genera un enlace y reta a un rival.</p>
            <button id="btn-versus-create" class="menu-btn" style="width: 100%; text-align: center;">
              ⚔ CREAR SALA
            </button>
          </div>

          <!-- Unirse -->
          <div style="padding-left: var(--space-md);">
            <h3 style="font-family: var(--font-display); color: var(--cyan); font-size: 13px; margin-bottom: 8px;">UNIRSE A SALA</h3>
            <input type="text" id="input-versus-code" placeholder="CÓDIGO (6 DÍGITOS)" maxlength="6" style="text-transform: uppercase; background: rgba(0,0,0,0.5); border: 1px solid var(--border-primary); color: var(--cyan); padding: 8px 12px; width: 100%; font-family: var(--font-mono); font-size: 14px; border-radius: 4px; margin-bottom: 12px; text-align: center; letter-spacing: 0.2em;">
            <button id="btn-versus-join" class="menu-btn" style="width: 100%; text-align: center; border-color: var(--cyan); color: var(--cyan);">
              ▸ CONECTAR A DUELO
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  const btnCreate = document.getElementById('btn-versus-create');
  if (btnCreate) {
    btnCreate.onclick = async () => {
      const alias = document.getElementById('input-versus-alias').value.trim() || 'Ghost';
      btnCreate.disabled = true;
      btnCreate.textContent = 'CREANDO SALA...';
      try {
        await crearSalaVersus(alias);
      } catch (e) {
        alert('Error: ' + e.message);
        btnCreate.disabled = false;
        btnCreate.textContent = '⚔ CREAR SALA';
      }
    };
  }

  const btnJoin = document.getElementById('btn-versus-join');
  if (btnJoin) {
    btnJoin.onclick = async () => {
      const alias = document.getElementById('input-versus-alias').value.trim() || 'Phantom';
      const code = document.getElementById('input-versus-code').value.trim();
      if (!code || code.length < 4) {
        alert('Ingresa el código de 6 dígitos.');
        return;
      }
      btnJoin.disabled = true;
      btnJoin.textContent = 'CONECTANDO...';
      try {
        await unirseSalaVersus(code, alias);
      } catch (e) {
        alert('Error al unirse: ' + e.message);
        btnJoin.disabled = false;
        btnJoin.textContent = '▸ CONECTAR A DUELO';
      }
    };
  }

  const btnBack = document.getElementById('btn-back-to-mode-select');
  if (btnBack) {
    btnBack.onclick = () => {
      import('./coop.js').then(({ renderCoopUI }) => {
        renderCoopUI();
      });
    };
  }
}

function renderPantallaVersus(customContainer = null) {
  const container = customContainer || document.getElementById('multiplayer-content');
  if (!container) return;

  const p = versusSession.partidaData;
  if (!p) {
    renderLobbyVersus(container);
    return;
  }

  const esHost = (versusSession.rol === 'host');
  const hostNombre = p.host ? p.host.nombre : 'Ghost';
  const guestNombre = p.guest ? p.guest.nombre : 'Esperando rival...';
  const hostVic = p.host ? (p.host.victorias || 0) : 0;
  const guestVic = p.guest ? (p.guest.victorias || 0) : 0;

  // Estado "Esperando rival"
  if (p.estado === 'esperando') {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; padding: var(--space-xl); text-align: center; font-family: var(--font-mono);">
        <h2 style="font-family: var(--font-display); color: var(--yellow-warn); margin-bottom: 8px;">
          SALA DE DUELO CREADA // CÓDIGO DE ACCESO
        </h2>
        <div style="font-size: 38px; color: var(--green-bright); letter-spacing: 0.3em; margin: 24px 0; padding: 18px; background: rgba(0,255,65,0.06); border: 2px dashed var(--green-bright); border-radius: 6px;">
          ${p.id}
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 24px;">
          Comparte este código con tu rival para iniciar el enfrentamiento 1v1.
        </p>
        <button id="btn-versus-leave" class="puzzle__opcion" style="margin: 0 auto; border-color: var(--red-alert); color: var(--red-alert);">
          ✕ CANCELAR Y SALIR
        </button>
      </div>
    `;

    const btnLeave = document.getElementById('btn-versus-leave');
    if (btnLeave) {
      btnLeave.onclick = () => {
        desconectarVersus();
        renderLobbyVersus(container);
      };
    }
    return;
  }

  // Generar tarjetas de rondas (1 a 5)
  const roundBadges = [1, 2, 3, 4, 5].map(r => {
    let statusClass = 'rgba(255,255,255,0.1)';
    let color = 'var(--text-dim)';
    if (r < p.rondaActual) {
      statusClass = 'rgba(0,255,65,0.2)';
      color = 'var(--green-bright)';
    } else if (r === p.rondaActual) {
      statusClass = 'rgba(255,204,0,0.25)';
      color = 'var(--yellow-warn)';
    }
    return `<span style="padding: 4px 10px; background: ${statusClass}; border: 1px solid ${color}; border-radius: 3px; color: ${color}; font-size: 11px;">R${r}</span>`;
  }).join(' ');

  // Contenido de la partida
  const puzzle = p.puzzleActual || {};
  const bloqueado = versusSession.bloqueadoEnRonda;

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: var(--space-md); font-family: var(--font-mono);">
      <!-- Header del combate con marcador -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: 14px 20px; margin-bottom: var(--space-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-family: var(--font-display); font-size: 12px; color: var(--cyan);">SALA [${p.id}]</span>
          <div style="display: flex; gap: 6px;">${roundBadges}</div>
        </div>

        <!-- Marcador Scoreboard -->
        <div style="display: flex; align-items: center; gap: 18px; font-size: 16px;">
          <span style="color: ${esHost ? 'var(--green-bright)' : 'var(--text-secondary)'}; font-weight: bold;">
            ${hostNombre} (${hostVic})
          </span>
          <span style="color: var(--yellow-warn); font-family: var(--font-display); font-size: 14px;">VS</span>
          <span style="color: ${!esHost ? 'var(--green-bright)' : 'var(--text-secondary)'}; font-weight: bold;">
            ${guestNombre} (${guestVic})
          </span>
        </div>

        <button id="btn-versus-exit" class="puzzle__opcion" style="padding: 4px 10px; font-size: 10px; border-color: var(--red-alert); color: var(--red-alert);">
          SALIR
        </button>
      </div>

      <!-- Área de Juego / Puzzle o Resultado -->
      <div style="display: grid; grid-template-columns: 1fr 280px; gap: var(--space-md);">
        
        <!-- Tablero de Puzzle -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-xl);">
          ${renderCuerpoJuegoVersus(p, puzzle, bloqueado, esHost)}
        </div>

        <!-- Terminal Chat Lateral -->
        <div style="background: var(--bg-terminal); border: 1px solid var(--border-primary); border-radius: var(--radius-md); display: flex; flex-direction: column; height: 440px;">
          <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-primary); font-size: 11px; color: var(--text-dim); display: flex; justify-content: space-between;">
            <span>CHAT EN TIEMPO REAL</span>
            <span>● 2 EN LÍNEA</span>
          </div>
          <div id="versus-chat-box" style="flex: 1; overflow-y: auto; padding: 10px; font-size: 11px; line-height: 1.5; color: var(--text-primary);">
            ${(p.chat || []).map(m => `
              <div style="margin-bottom: 6px;">
                <span style="color: ${m.autor === 'SISTEMA' ? 'var(--yellow-warn)' : (m.autor === versusSession.miNombre ? 'var(--green-bright)' : 'var(--cyan)')}; font-weight: bold;">
                  [${m.autor}]:
                </span>
                <span>${m.texto}</span>
              </div>
            `).join('')}
          </div>
          <div style="padding: 8px; border-top: 1px solid var(--border-primary); display: flex; gap: 6px;">
            <input type="text" id="versus-chat-input" placeholder="Escribe un mensaje..." style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-primary); color: var(--text-primary); font-size: 11px; padding: 6px 8px; flex: 1; border-radius: 3px; font-family: var(--font-mono);">
            <button id="btn-versus-chat-send" class="puzzle__opcion" style="padding: 4px 10px; font-size: 11px;">ENVIAR</button>
          </div>
        </div>

      </div>
    </div>
  `;

  // Autoscroll del chat
  const chatBox = document.getElementById('versus-chat-box');
  if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

  // Handlers
  const btnExit = document.getElementById('btn-versus-exit');
  if (btnExit) {
    btnExit.onclick = () => {
      desconectarVersus();
      renderLobbyVersus(container);
    };
  }

  // Chat send
  const chatInput = document.getElementById('versus-chat-input');
  const btnSend = document.getElementById('btn-versus-chat-send');
  const sendMsg = async () => {
    if (!chatInput) return;
    const txt = chatInput.value.trim();
    if (!txt) return;
    chatInput.value = '';
    await enviarMensajeChat(p.id, {
      autor: versusSession.miNombre,
      texto: txt,
      timestamp: Date.now()
    });
  };

  if (btnSend) btnSend.onclick = sendMsg;
  if (chatInput) {
    chatInput.onkeydown = (e) => {
      if (e.key === 'Enter') sendMsg();
    };
  }

  // Botones de respuesta del puzzle
  const opcionesBtns = container.querySelectorAll('.btn-versus-opcion');
  opcionesBtns.forEach(btn => {
    btn.onclick = () => {
      const opcionTexto = btn.getAttribute('data-opcion');
      responderPuzzleVersus(opcionTexto);
    };
  });

  // Botón avanzar ronda (host)
  const btnNextRound = document.getElementById('btn-versus-next-round');
  if (btnNextRound) {
    btnNextRound.onclick = () => avanzarSiguienteRondaVersus();
  }

  // Botón revancha
  const btnRematch = document.getElementById('btn-versus-rematch');
  if (btnRematch) {
    btnRematch.onclick = () => reiniciarVersus();
  }
}

function renderCuerpoJuegoVersus(p, puzzle, bloqueado, esHost) {
  // Partida terminada
  if (p.estado === 'terminado') {
    const gId = p.ganadorPartida;
    const gNombre = (gId === p.host.uid) ? p.host.nombre : (p.guest && gId === p.guest.uid ? p.guest.nombre : 'EMPATE');
    const ganeYo = (gId === versusSession.miUid);

    return `
      <div style="text-align: center; padding: var(--space-xl) 0;">
        <h2 class="glow-text ${ganeYo ? 'glow-green' : ''}" style="color: ${ganeYo ? 'var(--green-bright)' : 'var(--red-alert)'}; font-family: var(--font-display); font-size: 26px; margin-bottom: 12px;">
          ${ganeYo ? '⚔ ¡VICTORIA ABSOLUTA EN EL COMBATE!' : '✖ DERROTA // NODO CAPTURADO POR EL RIVAL'}
        </h2>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">
          Ganador definitivo del match: <strong>${gNombre}</strong>
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          ${esHost ? `<button id="btn-versus-rematch" class="menu-btn" style="width: auto; padding: 10px 24px;">⚡ REVANCHA</button>` : `<span style="color: var(--text-dim); font-size: 12px;">Esperando que el anfitrión inicie la revancha...</span>`}
        </div>
      </div>
    `;
  }

  // Ronda terminada (alguien ganó la ronda)
  if (p.estado === 'ronda_fin') {
    const gUid = p.ganadorRonda;
    const gNombre = (gUid === p.host.uid) ? p.host.nombre : (p.guest ? p.guest.nombre : 'Rival');
    const ganeYo = (gUid === versusSession.miUid);

    return `
      <div style="text-align: center; padding: var(--space-xl) 0;">
        <h3 style="color: ${ganeYo ? 'var(--green-bright)' : 'var(--yellow-warn)'}; font-family: var(--font-display); font-size: 18px; margin-bottom: 10px;">
          ${ganeYo ? '◈ ¡GANASTE LA RONDA!' : `◈ ${gNombre} GANA LA RONDA`}
        </h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 20px;">
          Respuesta correcta: <code>${puzzle.respuestaCorrecta || ''}</code>
        </p>
        <div style="display: flex; justify-content: center;">
          ${esHost ? `<button id="btn-versus-next-round" class="menu-btn" style="width: auto; padding: 10px 24px;">SIGUIENTE RONDA (${p.rondaActual + 1}/5) ▸</button>` : `<span style="color: var(--text-dim); font-size: 12px;">Esperando que el anfitrión inicie la siguiente ronda...</span>`}
        </div>
      </div>
    `;
  }

  // Jugando: renderizar el puzzle actual
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="color: var(--cyan); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
          RONDA ${p.rondaActual} // TIPO ${puzzle.tipo || 'A'}
        </span>
        ${bloqueado ? `<span style="color: var(--red-alert); font-size: 11px; animation: pulse 0.6s infinite alternate;">⚠ BLOQUEO ACTIVO (-3s)</span>` : `<span style="color: var(--green-bright); font-size: 11px;">◈ RESPONDE RÁPIDO</span>`}
      </div>

      <div style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--green-bright); padding: 12px 16px; margin-bottom: 18px; font-family: var(--font-narrative); font-size: 14px; color: var(--text-white); line-height: 1.6;">
        ${puzzle.enunciado || 'Resuelve el acertijo lógico:'}
      </div>

      ${puzzle.svg ? `<div style="max-width: 320px; margin: 0 auto 18px auto;">${puzzle.svg}</div>` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        ${(puzzle.opciones || []).map(opt => `
          <button class="puzzle__opcion btn-versus-opcion" data-opcion="${opt}" ${bloqueado ? 'disabled' : ''} style="margin: 0; padding: 12px; font-size: 13px; text-align: center;">
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Suite de tests unitarios de Versus.
 */
export async function testVersus() {
  console.group('%c[TEST SUITE] Modo Versus 1v1 (versus.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(typeof crearSalaVersus === 'function', 'crearSalaVersus debe ser función');
  assert(typeof unirseSalaVersus === 'function', 'unirseSalaVersus debe ser función');
  assert(typeof responderPuzzleVersus === 'function', 'responderPuzzleVersus debe ser función');
  assert(typeof avanzarSiguienteRondaVersus === 'function', 'avanzarSiguienteRondaVersus debe ser función');
  assert(typeof desconectarVersus === 'function', 'desconectarVersus debe ser función');

  const codigo = generarCodigoVersus();
  assert(typeof codigo === 'string' && codigo.length === 6, 'generarCodigoVersus debe generar string de 6 caracteres');

  // Test de creación de sala de prueba
  try {
    const salaId = await crearSalaVersus('TestHost');
    assert(salaId === versusSession.codigoSala, 'crearSalaVersus debe asignar codigoSala');
    assert(versusSession.partidaData !== null, 'crearSalaVersus debe poblar partidaData');
    assert(versusSession.partidaData.modo === 'versus', "partida.modo debe ser 'versus'");
    assert(versusSession.partidaData.rondaActual === 1, 'Ronda inicial debe ser 1');
    assert(versusSession.partidaData.puzzleActual !== null, 'puzzleActual debe estar generado');
    desconectarVersus();
    assert(versusSession.codigoSala === null, 'desconectarVersus debe limpiar estado');
  } catch (err) {
    assert(false, `Error en prueba de crearSalaVersus: ${err.message}`);
  }

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Versus: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Versus: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
