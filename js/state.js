/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * State — Estado global del juego y sistema de puntuación
 * Especificación: Sección 2.2 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 *
 * Fuente de verdad centralizada.
 * Persistencia en localStorage con fallback seguro.
 * Patrón observer para reactividad con el HUD y la UI.
 */

const STORAGE_KEY = 'ultimo_algoritmo_save';

// ── Adaptador de almacenamiento (seguro para Browser y Node/CLI) ──
let memoryStorage = {};
const storageAdapter = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (_) {}
    return memoryStorage[key] || null;
  },
  setItem: (key, val) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
        return;
      }
    } catch (_) {}
    memoryStorage[key] = String(val);
  },
  removeItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    } catch (_) {}
    delete memoryStorage[key];
  }
};

// ── Estado por defecto ──────────────────────────
export function createDefaultState() {
  return {
    // Progreso
    currentFirewall: 0,             // 0-4 (alpha..omega)
    firewallActual: 1,              // 1-5 (alias 1-indexed)
    puzzlesSolvedInFirewall: 0,     // 0..3 puzzles resueltos en el firewall actual
    puzzlesRequiredPerFirewall: 3,  // 3 puzzles por firewall para quebrar la seguridad
    firewallsCompleted: [],         // ['alpha', 'beta', ...]
    currentPuzzleIndex: 0,

    // Puntuación
    score: 0,
    multiplier: 1,
    streak: 0,
    highScore: 0,

    // Integridad (vidas)
    integrity: 100,

    // Items / comodines
    hints: 3,
    skips: 1,

    // Detección de fallos seguidos (Prompt 15 / Spec 4.3)
    consecutiveFailures: 0,

    // Estadísticas de sesión y perfil (Prompt 17)
    commandsCount: 0,
    puzzlesAttempted: 0,
    puzzlesCorrect: 0,
    puzzlesFailed: 0,
    maxStreak: 0,
    wordsDecrypted: 0,

    // Narrativa
    logsFound: [],             // ['vera.txt', 'aurelia_internal.log', ...]
    decisionsHistory: [],      // Decisiones del jugador
    finalChoice: null,         // 'LIBERAR' | 'DESTRUIR' | 'FUSIONARTE'

    // Meta
    playerName: 'Ghost',
    nombreJugador: 'Ghost',
    generoJugador: 'masculino',
    startedAt: null,
    totalTime: 0,             // segundos jugados
    isGhostProtocol: false,   // Modo Ghost Protocol (Prompt 19 / Spec 4.1)

    // Configuración
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      scanlinesEnabled: true,
      crtEnabled: true,
    },
  };
}

// ── Estado vivo (en memoria) ────────────────────
let state = createDefaultState();
const listeners = new Set();

/**
 * Obtiene una copia del estado actual (lectura segura).
 */
export function getState() {
  return { ...state };
}

/**
 * Obtiene un campo específico del estado.
 */
export function get(key) {
  return state[key];
}

/**
 * Actualiza uno o más campos del estado.
 * @param {object} partial — campos a actualizar
 */
export function update(partial) {
  const prev = { ...state };
  Object.assign(state, partial);
  notifyListeners(prev, state);
  saveToStorage();
}

/**
 * Resetea el estado completo a valores por defecto.
 */
export function resetState() {
  state = createDefaultState();
  state.startedAt = Date.now();
  notifyListeners(null, state);
  saveToStorage();
}

// ── Observers ───────────────────────────────────

/**
 * Suscribe un listener a cambios de estado.
 * @param {Function} fn — (prevState, newState) => void
 * @returns {Function} unsubscribe
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners(prev, next) {
  for (const fn of listeners) {
    try {
      fn(prev, next);
    } catch (e) {
      console.error('[State] Error en listener:', e);
    }
  }
}

// ── Persistencia localStorage ───────────────────

export function saveToStorage() {
  try {
    storageAdapter.setItem(STORAGE_KEY, JSON.stringify(state));
    // Indicador visual discreto de guardado automático (Prompt 20 / Spec 5.5)
    if (typeof window !== 'undefined' && typeof window.mostrarIndicadorGuardado === 'function') {
      window.mostrarIndicadorGuardado();
    }
  } catch (e) {
    console.warn('[State] No se pudo guardar en almacenamiento:', e);
  }
}

/**
 * Carga el estado desde localStorage (si existe).
 * @returns {boolean} true si había un save guardado
 */
export function loadFromStorage() {
  try {
    const raw = storageAdapter.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge con defaults para no perder campos nuevos
      state = { ...createDefaultState(), ...saved };
      notifyListeners(null, state);
      return true;
    }
  } catch (e) {
    console.warn('[State] Error al cargar save:', e);
  }
  return false;
}

/**
 * Borra el save de localStorage.
 */
export function clearStorage() {
  storageAdapter.removeItem(STORAGE_KEY);
}

/**
 * ¿Hay una partida guardada?
 */
export function hasSave() {
  return storageAdapter.getItem(STORAGE_KEY) !== null;
}

// ── Acciones de juego y Sistema de Puntuación (Spec 2.2) ──

/**
 * Registra un acierto y calcula puntos con bonificaciones.
 * - Base: +100
 * - Velocidad (< 10s): +50 bonus
 * - Sin pista: +30 bonus
 * - Racha >= 3: x1.5 multiplicador
 * - Racha >= 5: x2.0 multiplicador
 *
 * @param {object} opts
 * @param {number} [opts.timeMs=Infinity] — tiempo que tardó en responder
 * @param {boolean} [opts.usedHint=false] — si usó pista
 * @returns {number} puntos obtenidos
 */
export function registerCorrect({ timeMs = Infinity, usedHint = false } = {}) {
  let points = 100;

  // Bonus velocidad (< 10s)
  if (timeMs < 10000) points += 50;

  // Bonus sin pista
  if (!usedHint) points += 30;

  // Racha y multiplicador
  const newStreak = state.streak + 1;
  let multiplier = 1;
  if (newStreak >= 5) multiplier = 2;
  else if (newStreak >= 3) multiplier = 1.5;

  const total = Math.round(points * multiplier);
  const maxStreak = Math.max(state.maxStreak || 0, newStreak);

  update({
    score: state.score + total,
    streak: newStreak,
    multiplier,
    highScore: Math.max(state.highScore, state.score + total),
    consecutiveFailures: 0,
    puzzlesAttempted: (state.puzzlesAttempted || 0) + 1,
    puzzlesCorrect: (state.puzzlesCorrect || 0) + 1,
    maxStreak
  });

  return total;
}

/**
 * Registra un fallo. Resta integridad (-20%) y puntos (-50).
 * Reinicia la racha y el multiplicador a 1.
 * Incrementa consecutiveFailures para activar pistas automáticas (Prompt 15).
 * @returns {boolean} true si la integridad llegó a 0 (game over)
 */
export function registerWrong() {
  const newIntegrity = Math.max(0, state.integrity - 20);
  const failures = (state.consecutiveFailures || 0) + 1;

  update({
    score: Math.max(0, state.score - 50),
    streak: 0,
    multiplier: 1,
    integrity: newIntegrity,
    consecutiveFailures: failures,
    puzzlesAttempted: (state.puzzlesAttempted || 0) + 1,
    puzzlesFailed: (state.puzzlesFailed || 0) + 1
  });
  return newIntegrity <= 0;
}

/**
 * Restaura la integridad al 100% y reinicia los subnodos del firewall actual tras Game Over.
 */
export function retryCurrentFirewall() {
  update({
    integrity: 100,
    puzzlesSolvedInFirewall: 0,
    streak: 0,
    multiplier: 1
  });
}

/**
 * Registra el hallazgo de un log oculto.
 * @param {string} logName
 * @returns {number} puntos obtenidos (+200 si es nuevo, 0 si ya se encontró)
 */
export function registerLogFound(logName) {
  if (state.logsFound.includes(logName)) return 0;
  const points = 200;
  update({
    logsFound: [...state.logsFound, logName],
    score: state.score + points,
    highScore: Math.max(state.highScore, state.score + points),
  });
  return points;
}

/**
 * Usa un comodín de pista (Hint).
 * Descuenta 1 pista y resta 20 puntos por uso (Spec 2.2: "Usar comodín: −20").
 * @returns {{ success: boolean, remaining: number, reason?: string }}
 */
export function useHint() {
  if (state.hints <= 0) {
    return { success: false, remaining: 0, reason: 'Sin pistas disponibles' };
  }
  const newHints = state.hints - 1;
  update({
    hints: newHints,
    score: Math.max(0, state.score - 20)
  });
  return { success: true, remaining: newHints };
}

/**
 * Usa un comodín de salto (Skip).
 * Descuenta 1 salto y resta 20 puntos por uso.
 * @returns {{ success: boolean, remaining: number, reason?: string }}
 */
export function useSkip() {
  if (state.skips <= 0) {
    return { success: false, remaining: 0, reason: 'Sin comodines de salto' };
  }
  const newSkips = state.skips - 1;
  update({
    skips: newSkips,
    score: Math.max(0, state.score - 20)
  });
  return { success: true, remaining: newSkips };
}

/**
 * Actualiza el firewall activo (0-4).
 * @param {number} firewallIndex
 */
export function setFirewall(firewallIndex) {
  const safeIdx = Math.max(0, Math.min(4, firewallIndex));
  update({
    currentFirewall: safeIdx,
    firewallActual: safeIdx + 1
  });
}

/**
 * Registra un puzzle resuelto en el firewall activo.
 * Cada firewall requiere 3 puzzles para ser quebrado/vulnerado.
 * @returns {{ firewallBreached: boolean, solved: number, required: number, remaining: number, firewallIndex: number }}
 */
export function registerPuzzleSolvedInFirewall() {
  const currentSolved = (state.puzzlesSolvedInFirewall || 0) + 1;
  const required = state.puzzlesRequiredPerFirewall || 3;
  const isBreached = currentSolved >= required;

  update({
    puzzlesSolvedInFirewall: currentSolved,
    currentPuzzleIndex: currentSolved
  });

  return {
    firewallBreached: isBreached,
    solved: currentSolved,
    required,
    remaining: Math.max(0, required - currentSolved),
    firewallIndex: state.currentFirewall
  };
}

/**
 * Completa el firewall actual, otorgando bonificación y registrando en firewallsCompleted.
 * @returns {object}
 */
export function completeCurrentFirewall() {
  const fwNames = ['alpha', 'beta', 'gamma', 'delta', 'omega'];
  const fwId = fwNames[state.currentFirewall] || `fw_${state.currentFirewall}`;
  const alreadyCompleted = state.firewallsCompleted.includes(fwId);

  const completedList = alreadyCompleted ? state.firewallsCompleted : [...state.firewallsCompleted, fwId];
  const bonus = 500;

  update({
    firewallsCompleted: completedList,
    score: state.score + bonus,
    highScore: Math.max(state.highScore, state.score + bonus)
  });

  return {
    firewallId: fwId,
    firewallIndex: state.currentFirewall,
    bonusPoints: bonus,
    totalCompleted: completedList.length
  };
}

/**
 * Avanza al siguiente firewall (0..4).
 * Si ya estaba en el último (omega, idx 4), retorna isGameComplete: true.
 * @returns {{ hasNext: boolean, nextIndex: number, isGameComplete: boolean }}
 */
export function advanceToNextFirewall() {
  if (state.currentFirewall < 4) {
    const nextIdx = state.currentFirewall + 1;
    update({
      currentFirewall: nextIdx,
      firewallActual: nextIdx + 1,
      puzzlesSolvedInFirewall: 0,
      currentPuzzleIndex: 0
    });
    return { hasNext: true, nextIndex: nextIdx, isGameComplete: false };
  } else {
    return { hasNext: false, nextIndex: 4, isGameComplete: true };
  }
}

/**
 * Añade puntos de integridad (vida) hasta un máximo de 100%.
 * @param {number} [amount=20]
 */
export function healIntegrity(amount = 20) {
  const maxIntegrity = state.isGhostProtocol ? 50 : 100;
  const newIntegrity = Math.min(maxIntegrity, state.integrity + amount);
  update({ integrity: newIntegrity });
}

/**
 * Suma puntos arbitrarios por eventos narrativos o puzzles.
 * @param {number} points
 */
export function addScore(points) {
  const newScore = Math.max(0, state.score + points);
  update({
    score: newScore,
    highScore: Math.max(state.highScore, newScore)
  });
}

/**
 * Comprueba si el Modo Ghost Protocol ha sido desbloqueado.
 * @returns {boolean}
 */
export function isGhostProtocolUnlocked() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('nexus_ghost_protocol_unlocked') === 'true';
    }
  } catch (_) {}
  return false;
}

/**
 * Desbloquea el Modo Ghost Protocol tras completar la campaña.
 */
export function unlockGhostProtocol() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nexus_ghost_protocol_unlocked', 'true');
    }
  } catch (_) {}
}

/**
 * Inicia una partida en Modo Ghost Protocol (Prompt 19 / Spec 4.1).
 * - Sin timer visible
 * - Sin pistas (0 pistas disponibles)
 * - Integridad inicial reducida a 50
 * - Dificultad extrema de puzzles
 */
export function setPlayerIdentity(opts = {}) {
  const nombre = String(opts.nombreJugador ?? opts.nombre ?? state.nombreJugador ?? 'Ghost').trim() || 'Ghost';
  const genero = String(opts.generoJugador ?? opts.genero ?? state.generoJugador ?? 'masculino').toLowerCase().trim();
  update({
    playerName: nombre,
    nombreJugador: nombre,
    generoJugador: genero
  });
  return { nombreJugador: nombre, generoJugador: genero };
}

export function startGhostProtocolMode() {
  resetState();
  update({
    isGhostProtocol: true,
    integrity: 50,
    hints: 0,
    skips: 0
  });
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias para State, Puntuación y Persistencia.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testState() {
  console.group('%c[TEST SUITE] Estado, Puntuación y Persistencia (state.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Estado inicial
  resetState();
  const s0 = getState();
  assert(s0.score === 0, 'Puntaje inicial debe ser 0');
  assert(s0.integrity === 100, 'Integridad inicial debe ser 100%');
  assert(s0.streak === 0, 'Racha inicial debe ser 0');
  assert(s0.multiplier === 1, 'Multiplicador inicial debe ser 1');
  assert(s0.hints === 3, 'Pistas iniciales deben ser 3');
  assert(s0.skips === 1, 'Saltos iniciales deben ser 1');

  // 2. Registro de acierto base + bonus de velocidad + bonus sin pista
  const pts1 = registerCorrect({ timeMs: 4000, usedHint: false });
  // 100 base + 50 velocidad + 30 sin pista = 180
  assert(pts1 === 180, 'Acierto rápido sin pista debe dar 180 pts');
  assert(get('score') === 180, 'Puntaje total debe ser 180');
  assert(get('streak') === 1, 'Racha debe aumentar a 1');

  // 3. Racha y multiplicadores (racha 3 -> x1.5, racha 5 -> x2.0)
  registerCorrect({ timeMs: 12000, usedHint: true }); // racha 2 (100 base)
  assert(get('streak') === 2, 'Racha 2');
  assert(get('multiplier') === 1, 'Multiplicador sigue en 1');

  const ptsRacha3 = registerCorrect({ timeMs: 12000, usedHint: true }); // racha 3: 100 * 1.5 = 150
  assert(get('streak') === 3, 'Racha 3 alcanzada');
  assert(get('multiplier') === 1.5, 'Multiplicador debe ser x1.5 al alcanzar racha de 3');
  assert(ptsRacha3 === 150, '100 * 1.5 = 150 pts');

  registerCorrect({ timeMs: 15000, usedHint: true }); // racha 4
  const ptsRacha5 = registerCorrect({ timeMs: 15000, usedHint: true }); // racha 5: 100 * 2.0 = 200
  assert(get('streak') === 5, 'Racha 5 alcanzada');
  assert(get('multiplier') === 2, 'Multiplicador debe ser x2 al alcanzar racha de 5');
  assert(ptsRacha5 === 200, '100 * 2.0 = 200 pts');

  // 4. Registro de fallo (-50 pts, -20 integridad, reset racha y multiplicador)
  const prevScore = get('score');
  const prevIntegrity = get('integrity');
  const esGameOver = registerWrong();
  assert(get('integrity') === prevIntegrity - 20, 'Fallo debe restar 20 de integridad');
  assert(get('score') === prevScore - 50, 'Fallo debe restar 50 puntos');
  assert(get('streak') === 0, 'Fallo debe resetear la racha a 0');
  assert(get('multiplier') === 1, 'Fallo debe resetear el multiplicador a 1');
  assert(esGameOver === false, 'Integridad > 0 no debe ser game over');

  // 5. Hallazgo de log oculto (+200 pts, sin duplicados)
  const scoreBeforeLog = get('score');
  const ptsLog1 = registerLogFound('vera.txt');
  assert(ptsLog1 === 200, 'Primer hallazgo de log debe dar 200 pts');
  assert(get('score') === scoreBeforeLog + 200, 'Score debe aumentar en 200');
  const ptsLogRepetido = registerLogFound('vera.txt');
  assert(ptsLogRepetido === 0, 'Log repetido debe dar 0 puntos');

  // 6. Comodines (useHint, useSkip descuentan -20 pts)
  const scoreBeforeHint = get('score');
  const hintRes = useHint();
  assert(hintRes.success === true, 'useHint debe ser exitoso');
  assert(get('hints') === 2, 'Pistas restantes deben ser 2');
  assert(get('score') === scoreBeforeHint - 20, 'Usar pista debe costar 20 puntos');

  // 7. Persistencia round-trip
  update({ score: 777 });
  saveToStorage();
  state.score = 0; // alterar memoria directamente para probar la recarga desde almacenamiento
  assert(get('score') === 0, 'El score en memoria temporal se fijó en 0');
  const cargoCorrecto = loadFromStorage();
  assert(cargoCorrecto === true, 'loadFromStorage debe cargar exitosamente');
  assert(get('score') === 777, 'El puntaje debe restaurarse idéntico (777) desde almacenamiento');

  // 8. Observers
  let notificado = false;
  const unsub = subscribe((prev, next) => {
    if (next.score === 9999) notificado = true;
  });
  update({ score: 9999 });
  assert(notificado === true, 'Listener observer debe ser notificado de cambios');
  unsub();

  // 9. Reintento de firewall tras Game Over
  update({ integrity: 0, streak: 4, multiplier: 1.5, puzzlesSolvedInFirewall: 2 });
  retryCurrentFirewall();
  assert(get('integrity') === 100, 'retryCurrentFirewall debe restaurar integridad a 100%');
  assert(get('puzzlesSolvedInFirewall') === 0, 'retryCurrentFirewall debe resetear subnodos a 0');
  assert(get('streak') === 0, 'retryCurrentFirewall debe resetear racha a 0');

  // Limpiar para dejar estado limpio
  resetState();

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Estado y Puntuación: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Estado: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
