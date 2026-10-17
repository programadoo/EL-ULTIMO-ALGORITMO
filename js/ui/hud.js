/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * HUD — Controlador del Heads-Up Display lateral
 * Especificación: Sección 2.2 y Pantalla 4 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { getState, subscribe, useHint, useSkip } from '../state.js';
import { audio } from '../audio.js';

/**
 * Metadatos descriptivos de los 5 firewalls de NEXUS.
 */
export const FIREWALLS_INFO = [
  { id: 'alpha', name: 'FIREWALL_alpha', nivel: 1, desc: 'Perímetro // Conjuntos Básicos', file: 'firewall_alpha.json', type: 'A' },
  { id: 'beta',  name: 'FIREWALL_beta',  nivel: 2, desc: 'Capa Tráfico // Operaciones (∪, ∩, −)', file: 'firewall_beta.json', type: 'A' },
  { id: 'gamma', name: 'FIREWALL_gamma', nivel: 3, desc: 'Subestación // Conectores (∧, ∨, ¬)', file: 'firewall_gamma.json', type: 'B' },
  { id: 'delta', name: 'FIREWALL_delta', nivel: 4, desc: 'Núcleo Onírico // Implicación (→, ↔)', file: 'firewall_delta.json', type: 'D' },
  { id: 'omega', name: 'FIREWALL_omega', nivel: 5, desc: 'Último Algoritmo // Razonamiento Formal', file: 'firewall_omega.json', type: 'E' }
];

let isInitialized = false;
let unsubscribeObserver = null;

/**
 * Obtiene la información del firewall actual según su índice (0..4).
 * @param {number} index
 * @returns {object}
 */
export function getFirewallInfo(index = 0) {
  const safeIdx = Math.max(0, Math.min(FIREWALLS_INFO.length - 1, index));
  return FIREWALLS_INFO[safeIdx];
}

/**
 * Determina la clase CSS de color según el nivel de integridad.
 * @param {number} integrity
 * @returns {string}
 */
export function getIntegrityClass(integrity) {
  if (integrity <= 40) return 'hud__value--danger';
  if (integrity <= 60) return 'hud__value--warning';
  return '';
}

/**
 * Genera el marcado HTML para las 5 píldoras de progreso de firewall.
 * @param {number} currentIdx
 * @param {string[]} completedList
 * @returns {string}
 */
export function generateProgressPillsHTML(currentIdx, completedList = []) {
  return `
    <div class="hud__progress-pills" role="progressbar" aria-label="Progreso de firewalls">
      ${FIREWALLS_INFO.map((fw, idx) => {
        let cls = 'hud__pill';
        if (completedList.includes(fw.id) || idx < currentIdx) {
          cls += ' hud__pill--completed';
        } else if (idx === currentIdx) {
          cls += ' hud__pill--current';
        } else {
          cls += ' hud__pill--locked';
        }
        return `<span class="${cls}" title="${fw.name} (${fw.desc})"></span>`;
      }).join('')}
    </div>
  `;
}

/**
 * Renderiza todos los bloques del HUD en el DOM a partir del estado actual.
 * @param {object|null} prevState
 * @param {object} nextState
 */
export function renderHUD(prevState, nextState) {
  if (typeof document === 'undefined') return;

  const currentIdx = nextState.currentFirewall || 0;
  const fw = getFirewallInfo(currentIdx);
  const solved = nextState.puzzlesSolvedInFirewall || 0;
  const req = nextState.puzzlesRequiredPerFirewall || 3;

  // 1. Sección Firewall con indicador visual de brecha
  const elFirewall = document.getElementById('hud-firewall');
  if (elFirewall) {
    const blocksHTML = Array.from({ length: req }, (_, i) => {
      const isDone = i < solved;
      return `<span style="display:inline-block; width:22px; height:8px; border-radius:2px; margin-right:4px; background:${isDone ? 'var(--green-bright)' : 'rgba(255,255,255,0.08)'}; border:1px solid ${isDone ? 'var(--green-bright)' : 'var(--border-primary)'}; box-shadow:${isDone ? '0 0 8px var(--green-glow)' : 'none'};"></span>`;
    }).join('');

    elFirewall.innerHTML = `
      <div class="hud__section-title">NODO // FIREWALL ACTIVO</div>
      <div class="hud__value" style="font-size: var(--fs-md); color: var(--green-bright);">${fw.name}</div>
      <div class="hud__subvalue">${fw.desc}</div>
      ${generateProgressPillsHTML(currentIdx, nextState.firewallsCompleted)}

      <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.35); border: 1px solid var(--border-primary); border-radius: 4px;">
        <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; letter-spacing: 0.05em; color: var(--cyan);">PUZZLES: ${solved}/${req}</span>
          <strong style="color: var(--yellow-warn); font-size: 10px;">${solved >= req ? '✔ BRECHA LISTA' : `${req - solved} RESTANTE${req - solved > 1 ? 'S' : ''}`}</strong>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 6px;">${blocksHTML}</div>
        <div style="font-size: 11px; color: var(--cyan); line-height: 1.3;">
          ${solved >= req ? '⚡ ¡FIREWALL VULNERADO! Presiona [ENTER] o escribe \'next\'' : '▸ Escribe \'hack\' para el sig. subnodo'}
        </div>
      </div>
    `;
  }

  // 2. Sección Puntaje
  const elScore = document.getElementById('hud-score');
  if (elScore) {
    const formattedScore = (nextState.score || 0).toLocaleString();
    const formattedHigh = (nextState.highScore || 0).toLocaleString();
    elScore.innerHTML = `
      <div class="hud__section-title">PUNTUACIÓN ACTUAL</div>
      <div class="hud__value">${formattedScore} <span style="font-size: var(--fs-xs); color: var(--text-dim);">PTS</span></div>
      <div class="hud__subvalue">RÉCORD MÁXIMO: ${formattedHigh} PTS</div>
    `;
  }

  // 3. Sección Integridad del Sistema
  const elIntegrity = document.getElementById('hud-integrity');
  if (elIntegrity) {
    const integrity = Math.max(0, Math.min(100, nextState.integrity ?? 100));
    const valClass = getIntegrityClass(integrity);
    let fillClass = 'integrity-bar__fill';
    if (integrity <= 40) fillClass += ' integrity-bar__fill--danger';
    else if (integrity <= 60) fillClass += ' integrity-bar__fill--warning';

    const isGhost = !!nextState.isGhostProtocol;
    const maxIntegrity = isGhost ? 50 : 100;
    const integrityPercent = Math.min(100, Math.round((integrity / maxIntegrity) * 100));

    elIntegrity.innerHTML = `
      <div class="hud__section-title" style="${isGhost ? 'color: #d154ff;' : ''}">
        ${isGhost ? '👻 INTEGRIDAD GHOST PROTOCOL' : 'INTEGRIDAD DEL SISTEMA'}
      </div>
      <div class="hud__value ${valClass}">${integrity}% ${isGhost ? '<span style="font-size:11px; color:#aaa;">(MÁX 50)</span>' : ''}</div>
      <div class="integrity-bar">
        <div class="${fillClass}" style="width: ${integrityPercent}%; ${isGhost ? 'background: linear-gradient(90deg, #b000ff, #ff0055);' : ''}"></div>
      </div>
      <div class="hud__subvalue" style="margin-top: 6px;">
        ${isGhost ? '⚠️ MODO GHOST ACTIVO // SIN PISTAS' : (integrity > 40 ? 'SISTEMA ESTABLE // ANILLO ACTIVO' : '¡ALERTA! RIESGO DE EXPULSIÓN')}
      </div>
    `;
  }

  // 4. Sección Racha y Multiplicador
  const elStreak = document.getElementById('hud-streak');
  if (elStreak) {
    const streak = nextState.streak || 0;
    const mult = nextState.multiplier || 1;
    const isMultActive = mult > 1;

    elStreak.innerHTML = `
      <div class="hud__section-title">RACHA Y MULTIPLICADOR</div>
      <div class="hud__value" style="font-size: var(--fs-base);">
        ${streak > 0 ? `🔥 ${streak} acierto${streak > 1 ? 's' : ''}` : 'Sin racha activa'}
      </div>
      <div class="hud__multiplier-badge ${isMultActive ? 'hud__multiplier-badge--active' : 'hud__multiplier-badge--idle'}">
        x${mult} MULTIPLICADOR
      </div>
      <div class="hud__subvalue" style="margin-top: 6px;">
        ${streak >= 5 ? '¡Multiplicador x2 máximo activo!' : streak >= 3 ? 'Racha x1.5 (próximo en 5: x2)' : 'Racha de 3 otorga x1.5'}
      </div>
    `;
  }

  // 5. Sección Comodines, Logs y Controlador de Música
  const elItems = document.getElementById('hud-items');
  if (elItems) {
    const isGhost = !!nextState.isGhostProtocol;
    const hints = isGhost ? 0 : (nextState.hints ?? 0);
    const skips = isGhost ? 0 : (nextState.skips ?? 0);
    const logsCount = (nextState.logsFound || []).length;
    const isMusicOn = audio.isMusicActive();

    elItems.innerHTML = `
      <div class="hud__section-title">COMODINES // ACCIONES</div>
      <div class="hud__items-grid">
        <button class="hud__item-btn" id="btn-hud-hint" ${hints <= 0 ? 'disabled' : ''} title="${isGhost ? 'Desactivado en Ghost Protocol' : 'Usa 1 pista (-20 PTS)'}">
          ${isGhost ? '🚫 Sin pistas' : `💡 Pista (${hints})`}
        </button>
        <button class="hud__item-btn" id="btn-hud-skip" ${skips <= 0 ? 'disabled' : ''} title="${isGhost ? 'Desactivado en Ghost Protocol' : 'Salta este puzzle (-20 PTS)'}">
          ${isGhost ? '🚫 Sin saltos' : `⏭ Salto (${skips})`}
        </button>
      </div>
      <div class="hud__logs-count">
        <span>◈ LOGS SECRETOS:</span>
        <strong style="color: var(--cyan);">${logsCount} / 5</strong>
      </div>

      <!-- Controlador de música cyberpunk en tiempo real -->
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-primary);">
        <button class="hud__item-btn" id="btn-hud-music" style="width: 100%; display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 6px 10px; border-color: ${isMusicOn ? 'var(--cyan)' : 'var(--border-primary)'}; color: ${isMusicOn ? 'var(--cyan)' : 'var(--text-dim)'};">
          <span>🎵 ${isMusicOn ? 'PAUSAR MÚSICA' : 'REPRODUCIR MÚSICA'}</span>
          <span style="font-family: var(--font-mono); letter-spacing: 1px; color: ${isMusicOn ? 'var(--green-bright)' : 'var(--text-dim)'};">
            ${isMusicOn ? ' ▂▃▅▆▇ ' : '───'}
          </span>
        </button>
      </div>
    `;

    // Conectar eventos de clic de los comodines
    const btnHint = document.getElementById('btn-hud-hint');
    if (btnHint) {
      btnHint.onclick = (e) => {
        e.stopPropagation();
        handleHintClick();
      };
    }

    const btnSkip = document.getElementById('btn-hud-skip');
    if (btnSkip) {
      btnSkip.onclick = (e) => {
        e.stopPropagation();
        handleSkipClick();
      };
    }

    const btnMusic = document.getElementById('btn-hud-music');
    if (btnMusic) {
      btnMusic.onclick = (e) => {
        e.stopPropagation();
        audio.toggleMusic();
      };
    }
  }
}

/**
 * Maneja la acción del botón Pista (Hint).
 */
function handleHintClick() {
  const res = useHint();
  if (!res.success) {
    console.warn('[HUD] No quedan pistas disponibles.');
    return;
  }

  // Si la terminal está activa, imprimir la pista
  if (typeof window !== 'undefined' && window.terminal) {
    window.terminal.print('[PISTA DEL SISTEMA] (-20 PTS) Recuerda: Identifica primero los elementos de la intersección (A ∩ B) para aislar los exclusivos.', 'line--info');
  }
}

/**
 * Maneja la acción del botón Salto (Skip).
 */
function handleSkipClick() {
  const res = useSkip();
  if (!res.success) {
    console.warn('[HUD] No quedan comodines de salto.');
    return;
  }

  // Si hay un puzzle abierto en overlay, cerrarlo
  if (typeof window !== 'undefined') {
    if (window.cerrarPuzzle) {
      window.cerrarPuzzle();
    }
    if (window.terminal) {
      window.terminal.print('[COMODÍN SALTO] (-20 PTS) Firewall omitido mediante bypass de emergencia.', 'line--warning');
    }
  }
}

let unsubscribeMusic = null;

/**
 * Inicializa el HUD lateral y se suscribe a los cambios del estado reactivo.
 */
export function initHUD() {
  if (isInitialized) return;

  // Renderizar con el estado inicial
  renderHUD(null, getState());

  // Suscribirse a cambios futuros del estado
  unsubscribeObserver = subscribe((prev, next) => {
    renderHUD(prev, next);
  });

  // Suscribirse a cambios de estado de música para actualizar el visualizador
  if (typeof audio !== 'undefined' && audio.onMusicStateChange) {
    unsubscribeMusic = audio.onMusicStateChange(() => {
      renderHUD(null, getState());
    });
  }

  isInitialized = true;
}

/**
 * Detiene la suscripción del observer del HUD si es necesario.
 */
export function destroyHUD() {
  if (unsubscribeObserver) {
    unsubscribeObserver();
    unsubscribeObserver = null;
  }
  if (unsubscribeMusic) {
    unsubscribeMusic();
    unsubscribeMusic = null;
  }
  isInitialized = false;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias para el HUD lateral.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testHUD() {
  console.group('%c[TEST SUITE] HUD Lateral (hud.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Metadatos de firewalls
  assert(FIREWALLS_INFO.length === 5, 'Deben existir 5 firewalls definidos');
  assert(getFirewallInfo(0).name === 'FIREWALL_alpha', 'Firewall 0 es alpha');
  assert(getFirewallInfo(4).name === 'FIREWALL_omega', 'Firewall 4 es omega');
  assert(getFirewallInfo(99).name === 'FIREWALL_omega', 'Índice fuera de rango se limita al último firewall');

  // 2. Clases de integridad
  assert(getIntegrityClass(100) === '', 'Integridad 100% no tiene clase de alerta');
  assert(getIntegrityClass(50) === 'hud__value--warning', 'Integridad 50% tiene clase warning');
  assert(getIntegrityClass(20) === 'hud__value--danger', 'Integridad 20% tiene clase danger');

  // 3. Marcado de píldoras de progreso
  const pillsHTML = generateProgressPillsHTML(2, ['alpha', 'beta']);
  assert(pillsHTML.includes('hud__pill--completed'), 'Píldoras deben incluir clase completed');
  assert(pillsHTML.includes('hud__pill--current'), 'Píldoras deben incluir clase current');
  assert(pillsHTML.includes('hud__pill--locked'), 'Píldoras deben incluir clase locked');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de HUD: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de HUD: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
