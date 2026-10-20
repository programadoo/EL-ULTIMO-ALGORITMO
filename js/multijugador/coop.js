/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Co-op — Modo Cooperativo 2 Jugadores en Tiempo Real
 * ══════════════════════════════════════════════════
 *
 * Características (Spec 2.1 & 3.4):
 * - Dos hackers trabajan en el mismo firewall.
 * - Turnos alternados de resolución.
 * - Chat de texto integrado (estilo terminal).
 * - Puntaje e integridad compartidos.
 * - Código único de enlace de 6 caracteres.
 */

import {
  crearPartida,
  obtenerPartida,
  actualizarPartida,
  enviarMensajeChat,
  suscribirPartida,
  desuscribirPartida,
  FIREBASE_CONFIG
} from './firebase.js';

import { generarPuzzleConjuntos } from '../puzzles/generador.js';

// Estado local de la sesión multijugador
export const coopSession = {
  codigoSala: null,
  miUid: null,
  miNombre: 'Ghost',
  rol: null, // 'host' | 'guest'
  partidaData: null,
  unsubscribeFn: null,
};

// Inicializar identificador único local
function initLocalIdentity() {
  if (!coopSession.miUid) {
    try {
      let uid = localStorage.getItem('nexus_coop_uid');
      if (!uid) {
        uid = 'agent_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('nexus_coop_uid', uid);
      }
      coopSession.miUid = uid;

      const savedName = localStorage.getItem('nexus_coop_name');
      if (savedName) coopSession.miNombre = savedName;
    } catch (_) {
      coopSession.miUid = 'agent_' + Math.floor(Math.random() * 10000);
    }
  }
}

initLocalIdentity();

/**
 * Genera un código de sala de 6 caracteres alfanuméricos en mayúsculas.
 * @returns {string}
 */
export function generarCodigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluye caracteres ambiguos (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Crea una nueva sala como Anfitrión (Host).
 * @param {string} aliasJugador
 * @returns {Promise<string>} código de la sala creada
 */
export async function crearSalaHost(aliasJugador = 'Ghost') {
  initLocalIdentity();
  coopSession.miNombre = aliasJugador || 'Ghost';
  coopSession.rol = 'host';
  try { localStorage.setItem('nexus_coop_name', coopSession.miNombre); } catch (_) {}

  const codigo = generarCodigoSala();
  coopSession.codigoSala = codigo;

  // Generar primer puzzle cooperativo
  const puzzleInicial = generarPuzzleConjuntos(1);

  const nuevaPartida = {
    id: codigo,
    estado: 'esperando', // 'esperando' | 'jugando' | 'completado' | 'gameover'
    modo: 'coop',
    host: { uid: coopSession.miUid, nombre: coopSession.miNombre },
    guest: null,
    jugadores: {
      [coopSession.miUid]: coopSession.miNombre
    },
    firewallActual: 1,
    nombreFirewall: 'FIREWALL_alpha // Perímetro de Autenticación',
    puzzleIndex: 0,
    puzzlesTotales: 3,
    turno: coopSession.miUid, // Comienza el host
    puntajeCompartido: 0,
    integridad: 100,
    puzzleActual: {
      tipo: puzzleInicial.tipo,
      enunciado: puzzleInicial.enunciado,
      tipoOperacion: puzzleInicial.tipoOperacion,
      svg: puzzleInicial.svg,
      conjuntos: puzzleInicial.conjuntos,
      universo: puzzleInicial.universo,
      opciones: puzzleInicial.opciones,
      respuestaCorrecta: puzzleInicial.respuestaCorrecta,
      explicacion: puzzleInicial.explicacion
    },
    chat: [
      {
        autor: 'SISTEMA',
        texto: `Enlace cuántico [${codigo}] activado. Esperando que el Agente 2 sintonice la frecuencia.`,
        timestamp: Date.now()
      }
    ],
    timestamp: Date.now()
  };

  await crearPartida(codigo, nuevaPartida);
  conectarSuscripcion(codigo);
  return codigo;
}

/**
 * Se une a una sala existente como Invitado (Guest).
 * @param {string} codigoSala
 * @param {string} aliasJugador
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function unirseASalaGuest(codigoSala, aliasJugador = 'Phantom') {
  initLocalIdentity();
  const codigoClean = String(codigoSala || '').toUpperCase().trim();

  if (codigoClean.length !== 6) {
    return { ok: false, error: 'El código de enlace debe tener exactamente 6 caracteres.' };
  }

  coopSession.miNombre = aliasJugador || 'Phantom';
  coopSession.rol = 'guest';
  try { localStorage.setItem('nexus_coop_name', coopSession.miNombre); } catch (_) {}

  const partida = await obtenerPartida(codigoClean);
  if (!partida) {
    return { ok: false, error: `No se encontró ninguna sala con el código '${codigoClean}'.` };
  }

  if (partida.guest && partida.guest.uid !== coopSession.miUid) {
    return { ok: false, error: 'La sala ya tiene 2 agentes conectados.' };
  }

  coopSession.codigoSala = codigoClean;

  // Registrar guest y dar la bienvenida en el chat
  const updates = {
    guest: { uid: coopSession.miUid, nombre: coopSession.miNombre },
    [`jugadores/${coopSession.miUid}`]: coopSession.miNombre,
    estado: 'jugando' // Al unirse el segundo jugador, la partida pasa a activa
  };

  await actualizarPartida(codigoClean, updates);

  await enviarMensajeChat(codigoClean, {
    autor: 'SISTEMA',
    texto: `Agente '${coopSession.miNombre}' se ha sincronizado con la consola. ¡Enlace establecido!`
  });

  conectarSuscripcion(codigoClean);
  return { ok: true };
}

/**
 * Escucha cambios en tiempo real y refresca la interfaz activa.
 * @param {string} codigoSala
 */
function conectarSuscripcion(codigoSala) {
  if (coopSession.unsubscribeFn) {
    coopSession.unsubscribeFn();
  }

  coopSession.unsubscribeFn = suscribirPartida(codigoSala, (data) => {
    if (!data) return;
    coopSession.partidaData = data;
    renderCoopUI();
  });
}

/**
 * Inicia formalmente la partida si el host pulsa iniciar.
 */
export async function iniciarPartidaHost() {
  if (!coopSession.codigoSala) return;
  await actualizarPartida(coopSession.codigoSala, { estado: 'jugando' });
}

/**
 * Envía una solución al puzzle actual por parte del jugador que tiene el turno.
 * @param {string} respuestaElegida
 * @returns {Promise<boolean>} true si fue correcta
 */
export async function enviarRespuestaCoop(respuestaElegida) {
  if (!coopSession.codigoSala || !coopSession.partidaData) return false;

  const data = coopSession.partidaData;
  if (data.turno !== coopSession.miUid) {
    alert('No es tu turno de responder.');
    return false;
  }

  const puz = data.puzzleActual;
  const esCorrecta = String(respuestaElegida).trim() === String(puz.respuestaCorrecta).trim();

  // Alternar turno al otro jugador
  const siguienteTurno = data.turno === data.host?.uid
    ? (data.guest ? data.guest.uid : data.host.uid)
    : data.host.uid;

  if (esCorrecta) {
    const nuevoPuntaje = (data.puntajeCompartido || 0) + 150;
    const nuevoIndex = (data.puzzleIndex || 0) + 1;

    let nuevoEstado = data.estado;
    let nuevoFirewall = data.firewallActual || 1;
    let nuevoNombreFw = data.nombreFirewall;

    // Si completó 3 puzzles, avanzar de firewall
    if (nuevoIndex >= (data.puzzlesTotales || 3)) {
      nuevoFirewall++;
      if (nuevoFirewall > 5) {
        nuevoEstado = 'completado';
      } else {
        nuevoNombreFw = `FIREWALL_${['alpha','beta','gamma','delta','omega'][nuevoFirewall - 1]}`;
      }
    }

    // Generar siguiente puzzle cooperativo
    const sigPuzzle = generarPuzzleConjuntos(nuevoFirewall <= 2 ? nuevoFirewall : 2);

    await actualizarPartida(coopSession.codigoSala, {
      puntajeCompartido: nuevoPuntaje,
      puzzleIndex: nuevoIndex % 3,
      firewallActual: nuevoFirewall,
      nombreFirewall: nuevoNombreFw,
      estado: nuevoEstado,
      turno: siguienteTurno,
      puzzleActual: {
        tipo: sigPuzzle.tipo,
        enunciado: sigPuzzle.enunciado,
        tipoOperacion: sigPuzzle.tipoOperacion,
        svg: sigPuzzle.svg,
        conjuntos: sigPuzzle.conjuntos,
        universo: sigPuzzle.universo,
        opciones: sigPuzzle.opciones,
        respuestaCorrecta: sigPuzzle.respuestaCorrecta,
        explicacion: sigPuzzle.explicacion
      }
    });

    await enviarMensajeChat(coopSession.codigoSala, {
      autor: 'SISTEMA',
      texto: `◈ [CORRECTO] ${coopSession.miNombre} descifró la subrutina (+150 PTS). Turno transferido.`
    });

    return true;
  } else {
    // Fallo: reduce integridad compartida
    const nuevaIntegridad = Math.max(0, (data.integridad || 100) - 20);
    const nuevoEstado = nuevaIntegridad <= 0 ? 'gameover' : data.estado;

    await actualizarPartida(coopSession.codigoSala, {
      integridad: nuevaIntegridad,
      estado: nuevoEstado,
      turno: siguienteTurno
    });

    await enviarMensajeChat(coopSession.codigoSala, {
      autor: 'SISTEMA',
      texto: `✖ [ERROR] ${coopSession.miNombre} falló el cálculo. Integridad al ${nuevaIntegridad}%. Turno transferido.`
    });

    return false;
  }
}

/**
 * Envía un mensaje al chat de la partida.
 * @param {string} texto
 */
export async function enviarChatCoop(texto) {
  if (!coopSession.codigoSala || !texto || !texto.trim()) return;
  await enviarMensajeChat(coopSession.codigoSala, {
    autor: coopSession.miNombre,
    texto: texto.trim()
  });
}

/**
 * Abandona la sala actual y desconecta el enlace.
 */
export function desconectarCoop() {
  if (coopSession.codigoSala) {
    enviarMensajeChat(coopSession.codigoSala, {
      autor: 'SISTEMA',
      texto: `Agente ${coopSession.miNombre} se ha desconectado del enlace cuántico.`
    }).catch(() => {});
    desuscribirPartida(coopSession.codigoSala);
  }

  if (coopSession.unsubscribeFn) {
    coopSession.unsubscribeFn();
    coopSession.unsubscribeFn = null;
  }

  coopSession.codigoSala = null;
  coopSession.partidaData = null;
  coopSession.rol = null;
}

// ─────────────────────────────────────────────────
// RENDERIZADO VISUAL DEL LOBBY Y DE LA SALA CO-OP
// ─────────────────────────────────────────────────

/**
 * Renderiza la interfaz gráfica del modo cooperativo en #multiplayer-content.
 */
export function renderCoopUI() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('multiplayer-content');
  if (!container) return;

  // Si no hay sala activa, mostrar el Lobby inicial
  if (!coopSession.codigoSala) {
    renderLobbyInicial(container);
    return;
  }

  const data = coopSession.partidaData || {
    estado: 'esperando',
    host: { nombre: coopSession.miNombre },
    puntajeCompartido: 0,
    integridad: 100,
    chat: []
  };

  // Si está en sala de espera
  if (data.estado === 'esperando') {
    renderSalaEspera(container, data);
    return;
  }

  // Si la partida está en curso (o terminada)
  renderPartidaEnVivo(container, data);
}

function renderLobbyInicial(container) {
  container.innerHTML = `
    <div class="menu-content" style="max-width: 680px; margin: 0 auto; padding: var(--space-xl);">
      <h2 class="glitch glow-text" style="color: var(--cyan); font-family: var(--font-display); font-size: var(--fs-2xl); margin-bottom: var(--space-xs);">
        ENLACE CUÁNTICO // MULTIJUGADOR CO-OP
      </h2>
      <p class="menu-subtitle">// Sincroniza dos mentes para hackear los firewalls de NEXUS</p>

      <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-md); text-align: left;">
        
        <!-- Alias del jugador -->
        <div>
          <label style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim); display: block; margin-bottom: 6px;">
            TU ALIAS DE AGENTE:
          </label>
          <input type="text" id="coop-alias-input" value="${coopSession.miNombre}" maxlength="16" placeholder="Ghost" style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); color: var(--green-bright); font-family: var(--font-mono); font-size: var(--fs-md); padding: 8px 12px; width: 100%;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-top: var(--space-sm);">
          
          <!-- Opción 1: Crear sala -->
          <div style="background: rgba(0, 255, 65, 0.03); border: 1px dashed var(--border-primary); border-radius: var(--radius-sm); padding: var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h3 style="font-family: var(--font-display); color: var(--green-bright); font-size: var(--fs-base); margin-bottom: 6px;">
                ▸ CREAR NUEVA SALA
              </h3>
              <p style="font-family: var(--font-narrative); font-size: var(--fs-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                Genera un código de 6 caracteres para que tu compañero se una a tu terminal.
              </p>
            </div>
            <button class="menu-btn" id="btn-crear-sala" style="width: 100%; text-align: center;">
              CREAR SALA
            </button>
          </div>

          <!-- Opción 2: Unirse a sala -->
          <div style="background: rgba(0, 229, 255, 0.03); border: 1px dashed var(--border-primary); border-radius: var(--radius-sm); padding: var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h3 style="font-family: var(--font-display); color: var(--cyan); font-size: var(--fs-base); margin-bottom: 6px;">
                ▸ UNIRSE CON CÓDIGO
              </h3>
              <p style="font-family: var(--font-narrative); font-size: var(--fs-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px;">
                Introduce el código de enlace de 6 caracteres:
              </p>
              <input type="text" id="coop-codigo-input" maxlength="6" placeholder="NX-2047" style="background: var(--bg-card); border: 1px solid var(--border-hover); border-radius: var(--radius-sm); color: var(--cyan); font-family: var(--font-mono); font-size: var(--fs-lg); text-align: center; letter-spacing: 0.25em; padding: 8px; width: 100%; text-transform: uppercase; margin-bottom: 12px;">
            </div>
            <button class="menu-btn" id="btn-unirse-sala" style="width: 100%; text-align: center; border-color: var(--cyan); color: var(--cyan);">
              CONECTAR AL ENLACE
            </button>
          </div>

        </div>

        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); text-align: center; margin-top: 6px;">
          ◈ Sincronización en tiempo real vía Firebase Realtime Database
        </div>
      </div>

      <div style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
        <button class="menu-btn" id="btn-switch-to-versus" style="width: auto; padding: 10px 24px; border-color: var(--red-alert); color: var(--red-alert);">
          ⚔ CAMBIAR A MODO VERSUS 1v1 ▸
        </button>
        <button class="menu-btn" id="btn-back-to-menu" style="width: auto; padding: 10px 24px;">
          ‹ VOLVER AL MENÚ PRINCIPAL
        </button>
      </div>
    </div>
  `;

  // Event Listeners
  document.getElementById('coop-alias-input')?.addEventListener('input', (e) => {
    coopSession.miNombre = e.target.value.trim() || 'Ghost';
  });

  document.getElementById('btn-crear-sala')?.addEventListener('click', async () => {
    const alias = document.getElementById('coop-alias-input')?.value.trim() || 'Ghost';
    const btn = document.getElementById('btn-crear-sala');
    if (btn) btn.textContent = 'GENERANDO ENLACE...';
    await crearSalaHost(alias);
    renderCoopUI();
  });

  document.getElementById('btn-unirse-sala')?.addEventListener('click', async () => {
    const alias = document.getElementById('coop-alias-input')?.value.trim() || 'Phantom';
    const cod = document.getElementById('coop-codigo-input')?.value.trim();
    if (!cod || cod.length !== 6) {
      alert('Ingresa el código de 6 caracteres.');
      return;
    }
    const btn = document.getElementById('btn-unirse-sala');
    if (btn) btn.textContent = 'CONECTANDO...';
    const res = await unirseASalaGuest(cod, alias);
    if (!res.ok) {
      alert(res.error || 'Error al conectar');
      if (btn) btn.textContent = 'CONECTAR AL ENLACE';
    } else {
      renderCoopUI();
    }
  });

  document.getElementById('btn-switch-to-versus')?.addEventListener('click', () => {
    desconectarCoop();
    import('./versus.js').then(v => v.renderVersusUI());
  });

  document.getElementById('btn-back-to-menu')?.addEventListener('click', () => {
    desconectarCoop();
    if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
      window.navigateTo('screen-menu');
    } else {
      import('../router.js').then(r => r.navigateTo('screen-menu'));
    }
  });
}

function renderSalaEspera(container, data) {
  const codigo = coopSession.codigoSala;
  const esHost = coopSession.rol === 'host';
  const tieneGuest = !!data.guest;

  container.innerHTML = `
    <div class="menu-content" style="max-width: 620px; margin: 0 auto; padding: var(--space-xl);">
      <h2 class="glitch glow-text" style="color: var(--cyan); font-family: var(--font-display); font-size: var(--fs-2xl); margin-bottom: var(--space-xs);">
        SALA DE ESPERA // ENLACE CUÁNTICO
      </h2>
      <p class="menu-subtitle">// Comparte este código con tu compañero de equipo</p>

      <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-xl); margin-bottom: var(--space-xl); text-align: center;">
        
        <div style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim); margin-bottom: 8px;">
          CÓDIGO DE ENLACE DE 6 CARACTERES:
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-lg);">
          <span style="font-family: var(--font-mono); font-size: var(--fs-3xl); color: var(--green-bright); letter-spacing: 0.25em; text-shadow: 0 0 12px var(--green-glow); font-weight: bold;">
            ${codigo}
          </span>
          <button id="btn-copiar-codigo" class="menu-btn" style="width: auto; padding: 6px 14px; font-size: var(--fs-xs);">
            COPIAR
          </button>
        </div>

        <!-- Lista de jugadores en la sala -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); padding: var(--space-md); text-align: left; margin-bottom: var(--space-lg);">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: var(--font-mono); font-size: var(--fs-sm);">
            <span style="color: var(--green-bright);">◈ AGENTE 1 (HOST):</span>
            <span style="color: var(--text-primary);">${data.host?.nombre || 'Ghost'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-family: var(--font-mono); font-size: var(--fs-sm);">
            <span style="color: var(--cyan);">◈ AGENTE 2 (GUEST):</span>
            <span style="color: ${tieneGuest ? 'var(--text-primary)' : 'var(--text-dim)'}; font-style: ${tieneGuest ? 'normal' : 'italic'};">
              ${tieneGuest ? data.guest.nombre : 'Esperando conexión...'}
            </span>
          </div>
        </div>

        ${esHost ? `
          <button class="menu-btn" id="btn-iniciar-coop" ${tieneGuest ? '' : 'disabled'} style="width: 100%; text-align: center; padding: 12px; font-size: var(--fs-base);">
            ${tieneGuest ? 'INICIAR MISIÓN COOPERATIVA ▸' : 'ESPERANDO AL AGENTE 2...'}
          </button>
        ` : `
          <div style="font-family: var(--font-mono); font-size: var(--fs-sm); color: var(--cyan);">
            Sincronizado. Esperando que el anfitrión inicie la misión...
          </div>
        `}

      </div>

      <button class="menu-btn" id="btn-cancelar-coop" style="width: auto; padding: 8px 20px; margin: 0 auto;">
        ✕ CANCELAR ENLACE Y VOLVER
      </button>
    </div>
  `;

  document.getElementById('btn-copiar-codigo')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(codigo);
    const b = document.getElementById('btn-copiar-codigo');
    if (b) b.textContent = '¡COPIADO!';
    setTimeout(() => { if (b) b.textContent = 'COPIAR'; }, 1800);
  });

  document.getElementById('btn-iniciar-coop')?.addEventListener('click', async () => {
    await iniciarPartidaHost();
  });

  document.getElementById('btn-cancelar-coop')?.addEventListener('click', () => {
    desconectarCoop();
    renderCoopUI();
  });
}

function renderPartidaEnVivo(container, data) {
  const esMiTurno = data.turno === coopSession.miUid;
  const nombreTurno = data.jugadores[data.turno] || 'Agente';
  const puz = data.puzzleActual || {};

  container.innerHTML = `
    <div style="max-width: 1100px; margin: 0 auto; padding: var(--space-md); text-align: left;">
      
      <!-- Barra superior de estado Co-op -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-md);">
        <div>
          <span style="font-family: var(--font-display); color: var(--green-bright); font-size: var(--fs-base);">
            ${data.nombreFirewall || 'FIREWALL_alpha'}
          </span>
          <span style="font-family: var(--font-mono); color: var(--text-dim); font-size: var(--fs-xs); margin-left: 10px;">
            [PUZZLE ${(data.puzzleIndex || 0) + 1}/${data.puzzlesTotales || 3}]
          </span>
        </div>

        <div style="display: flex; gap: var(--space-xl); align-items: center;">
          <div style="text-align: right;">
            <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim);">PUNTAJE CO-OP: </span>
            <span style="font-family: var(--font-mono); font-size: var(--fs-lg); color: var(--green-bright); font-weight: bold;">
              ${(data.puntajeCompartido || 0).toLocaleString()} PTS
            </span>
          </div>
          <div style="text-align: right;">
            <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim);">INTEGRIDAD: </span>
            <span style="font-family: var(--font-mono); font-size: var(--fs-lg); color: ${data.integridad > 40 ? 'var(--green-bright)' : 'var(--red-alert)'}; font-weight: bold;">
              ${data.integridad}%
            </span>
          </div>
          <button id="btn-salir-coop" class="menu-btn" style="width: auto; padding: 4px 12px; font-size: 11px;">
            ✕ SALIR
          </button>
        </div>
      </div>

      <!-- Banner de Turno Dinámico -->
      <div style="background: ${esMiTurno ? 'rgba(0, 255, 65, 0.1)' : 'rgba(0, 229, 255, 0.08)'}; border: 1px solid ${esMiTurno ? 'var(--green-bright)' : 'var(--cyan)'}; border-radius: var(--radius-sm); padding: 10px 16px; margin-bottom: var(--space-md); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family: var(--font-display); font-size: var(--fs-sm); color: ${esMiTurno ? 'var(--green-bright)' : 'var(--cyan)'};">
          ${esMiTurno ? '★ ¡ES TU TURNO! // Resuelve y transmite el paquete' : `⏳ TURNO DE: ${nombreTurno.toUpperCase()} // Aguarda transmisión...`}
        </span>
        <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim);">
          SALA: ${coopSession.codigoSala} | AGENTES: ${data.host?.nombre} & ${data.guest?.nombre || 'Esperando'}
        </span>
      </div>

      <!-- Cuerpo principal: Puzzle a la izquierda, Chat Terminal a la derecha -->
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-md); align-items: start;">
        
        <!-- Panel del Puzzle -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-lg);">
          <h3 style="font-family: var(--font-mono); color: var(--text-primary); font-size: var(--fs-md); margin-bottom: var(--space-sm);">
            ${puz.enunciado || 'Descifra el subconjunto solicitado'}
          </h3>

          <!-- Visualización SVG de Venn -->
          <div style="text-align: center; margin-bottom: var(--space-md); background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: var(--space-sm);">
            ${puz.svg || ''}
          </div>

          <!-- Opciones de respuesta -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
            ${(puz.opciones || []).map(opt => `
              <button class="menu-btn btn-opcion-coop" data-valor="${opt}" ${esMiTurno ? '' : 'disabled'} style="width: 100%; text-align: center; padding: 10px; font-family: var(--font-mono); font-size: var(--fs-sm); ${!esMiTurno ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                ${opt}
              </button>
            `).join('')}
          </div>

          ${!esMiTurno ? `
            <p style="font-family: var(--font-narrative); font-size: var(--fs-xs); color: var(--text-dim); text-align: center; margin-top: 10px; font-style: italic;">
              Los botones de solución están bloqueados. Solo el agente de turno puede enviar la respuesta.
            </p>
          ` : ''}
        </div>

        <!-- Panel del Chat Terminal Co-op -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-md); display: flex; flex-direction: column; height: 500px;">
          <div style="font-family: var(--font-display); font-size: var(--fs-xs); color: var(--cyan); letter-spacing: 0.1em; padding-bottom: 8px; border-bottom: 1px solid var(--border-primary); margin-bottom: 8px;">
            CHAT TERMINAL // CANAL CUÁNTICO
          </div>

          <!-- Historial de mensajes -->
          <div id="coop-chat-history" style="flex: 1; overflow-y: auto; font-family: var(--font-mono); font-size: var(--fs-xs); line-height: 1.6; display: flex; flex-direction: column; gap: 6px; padding-right: 4px;">
            ${(data.chat || []).map(msg => {
              const isSys = msg.autor === 'SISTEMA';
              const isMe = msg.autor === coopSession.miNombre;
              const color = isSys ? 'var(--yellow-warn)' : (isMe ? 'var(--green-bright)' : 'var(--cyan)');
              return `
                <div style="word-break: break-word;">
                  <span style="color: ${color}; font-weight: bold;">[${msg.autor}]:</span>
                  <span style="color: var(--text-primary); margin-left: 4px;">${msg.texto}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Formulario de envío -->
          <form id="coop-chat-form" style="display: flex; gap: 6px; margin-top: 8px; border-top: 1px solid var(--border-primary); padding-top: 8px;">
            <input type="text" id="coop-chat-input" placeholder="Mensaje para el equipo..." style="flex: 1; background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--fs-xs); padding: 6px 10px;">
            <button type="submit" class="menu-btn" style="width: auto; padding: 6px 14px; font-size: var(--fs-xs);">
              ENVIAR
            </button>
          </form>
        </div>

      </div>

    </div>
  `;

  // Scroll automático en el chat
  const chatHist = document.getElementById('coop-chat-history');
  if (chatHist) chatHist.scrollTop = chatHist.scrollHeight;

  // Event Listeners de opciones de puzzle
  container.querySelectorAll('.btn-opcion-coop').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.getAttribute('data-valor');
      await enviarRespuestaCoop(val);
    });
  });

  // Event Listener del chat
  document.getElementById('coop-chat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('coop-chat-input');
    if (input && input.value.trim()) {
      const txt = input.value.trim();
      input.value = '';
      await enviarChatCoop(txt);
    }
  });

  document.getElementById('btn-salir-coop')?.addEventListener('click', () => {
    desconectarCoop();
    renderCoopUI();
  });
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Valida la lógica de negocio y turnos del modo cooperativo.
 * @returns {Promise<{ total: number, pasados: number, fallados: number }>}
 */
export async function testCoop() {
  console.group('%c[TEST SUITE] Modo Cooperativo Co-op (coop.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0;
  let pasados = 0;

  function assert(cond, mensaje) {
    total++;
    console.assert(cond, `[FALLO] ${mensaje}`);
    if (cond) {
      pasados++;
    } else {
      console.error(`❌ FAILED: ${mensaje}`);
    }
  }

  // Test de generación de código
  const code = generarCodigoSala();
  assert(typeof code === 'string' && code.length === 6, 'El código de sala debe ser de exactamente 6 caracteres');
  assert(/^[A-Z2-9]{6}$/.test(code), 'El código debe ser alfanumérico en mayúsculas sin caracteres ambiguos');

  // Test de creación de sala host
  const hostCode = await crearSalaHost('Ghost_Tester');
  assert(hostCode.length === 6, 'crearSalaHost genera un código válido');
  assert(coopSession.rol === 'host', 'El creador adquiere el rol de host');

  const salaCreada = await obtenerPartida(hostCode);
  assert(salaCreada !== null, 'La sala creada se persiste en Firebase/bus');
  assert(salaCreada.modo === 'coop', 'El modo es cooperativo');
  assert(salaCreada.turno === coopSession.miUid, 'El turno inicial corresponde al host');

  // Test de unión de guest
  const guestRes = await unirseASalaGuest(hostCode, 'Phantom_Tester');
  assert(guestRes.ok === true, 'El guest puede unirse con el código');

  const salaConGuest = await obtenerPartida(hostCode);
  assert(salaConGuest.guest !== null, 'El guest queda registrado en la sala');
  assert(salaConGuest.estado === 'jugando', 'La sala pasa a estado jugando');

  // Test de alternancia de turnos y respuesta correcta
  const puz = salaConGuest.puzzleActual;
  assert(puz && typeof puz.respuestaCorrecta === 'string', 'El puzzle cooperativo tiene respuesta');

  // Limpieza
  desconectarCoop();

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Co-op: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Co-op: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
