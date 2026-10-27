/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Router — Navegación entre pantallas
 * ══════════════════════════════════════════════════
 *
 * Todas las pantallas son <section class="screen">.
 * Solo una se muestra a la vez.
 * Transiciones con fade out → swap → fade in.
 */

const SCREENS = [
  'screen-boot',
  'screen-menu',
  'screen-intro',
  'screen-game',
  'screen-firewall-complete',
  'screen-twist',
  'screen-decision',
  'screen-ranking',
  'screen-script-ranking',
  'screen-multiplayer',
  'screen-game-over',
  'screen-logros',
  'screen-stats',
];

let currentScreen = null;
let isTransitioning = false;

// Callbacks que se disparan al entrar a una pantalla
const onEnterCallbacks = {};

/**
 * Registra un callback que se ejecuta al entrar a una pantalla.
 * @param {string} screenId — ID del <section>
 * @param {Function} cb — función a ejecutar
 */
export function onScreenEnter(screenId, cb) {
  if (!onEnterCallbacks[screenId]) {
    onEnterCallbacks[screenId] = [];
  }
  onEnterCallbacks[screenId].push(cb);
}

/**
 * Navega a una pantalla con transición.
 * @param {string} targetId — ID de la pantalla destino
 * @param {object} opts
 * @param {number} opts.fadeOutMs — duración del fade out (ms)
 * @param {number} opts.fadeInMs  — duración del fade in (ms)
 * @param {boolean} opts.instant  — sin transición
 * @returns {Promise<void>}
 */
export async function navigateTo(targetId, opts = {}) {
  if (isTransitioning) return;
  if (currentScreen === targetId) return;

  const {
    fadeOutMs = 300,
    fadeInMs = 400,
    instant = false,
  } = opts;

  const targetEl = document.getElementById(targetId);
  if (!targetEl) {
    console.error(`[Router] Pantalla no encontrada: ${targetId}`);
    return;
  }

  isTransitioning = true;

  // ── Fade out la pantalla actual ──
  if (currentScreen) {
    const currentEl = document.getElementById(currentScreen);
    if (currentEl && !instant) {
      currentEl.style.transition = `opacity ${fadeOutMs}ms ease`;
      currentEl.style.opacity = '0';
      await sleep(fadeOutMs);
    }
    if (currentEl) {
      currentEl.hidden = true;
      currentEl.style.opacity = '';
      currentEl.style.transition = '';
      currentEl.classList.remove('screen--active');
    }
  }

  // ── Mostrar la nueva pantalla ──
  targetEl.hidden = false;
  targetEl.classList.add('screen--active');

  if (!instant) {
    targetEl.style.opacity = '0';
    // Forzar reflow para que la transición se aplique
    void targetEl.offsetHeight;
    targetEl.style.transition = `opacity ${fadeInMs}ms ease`;
    targetEl.style.opacity = '1';
    await sleep(fadeInMs);
    targetEl.style.transition = '';
    targetEl.style.opacity = '';
  }

  const previousScreen = currentScreen;
  currentScreen = targetId;
  isTransitioning = false;

  // Reset scroll position for the new screen
  targetEl.scrollTop = 0;
  window.scrollTo(0, 0);

  // ── Disparar callbacks de entrada ──
  if (onEnterCallbacks[targetId]) {
    for (const cb of onEnterCallbacks[targetId]) {
      try {
        cb({ from: previousScreen, to: targetId });
      } catch (e) {
        console.error(`[Router] Error en onEnter(${targetId}):`, e);
      }
    }
  }

  console.log(`[Router] ${previousScreen ?? '(inicio)'} → ${targetId}`);
}

/**
 * Retorna el ID de la pantalla actual.
 */
export function getCurrentScreen() {
  return currentScreen;
}

/**
 * Muestra una pantalla de forma instantánea, sin transición.
 * Útil para la pantalla inicial (boot).
 */
export function showImmediate(screenId) {
  return navigateTo(screenId, { instant: true });
}

// ── Export de pantallas disponibles ──
export { SCREENS };

if (typeof window !== 'undefined') {
  window.navigateTo = navigateTo;
}

// ── Utilidad ──
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias para el Router.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testRouter() {
  console.group('%c[TEST SUITE] Router de Pantallas (router.js)', 'color: #00ff41; font-weight: bold;');
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

  assert(Array.isArray(SCREENS) && SCREENS.length === 12, 'El router debe registrar las pantallas del sistema (12)');
  assert(SCREENS.includes('screen-boot'), 'SCREENS debe incluir screen-boot');
  assert(SCREENS.includes('screen-menu'), 'SCREENS debe incluir screen-menu');
  assert(SCREENS.includes('screen-game'), 'SCREENS debe incluir screen-game');
  assert(SCREENS.includes('screen-intro'), 'SCREENS debe incluir screen-intro');
  assert(typeof onScreenEnter === 'function', 'onScreenEnter debe ser una función');
  assert(typeof navigateTo === 'function', 'navigateTo debe ser una función');
  assert(typeof getCurrentScreen === 'function', 'getCurrentScreen debe ser una función');

  // Test registro de callback
  let testCbDisparado = false;
  onScreenEnter('screen-test-virtual', () => { testCbDisparado = true; });
  assert(Array.isArray(onEnterCallbacks['screen-test-virtual']), 'onScreenEnter registra callbacks correctamente');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Router: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Router: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
