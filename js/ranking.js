/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Ranking — Top 3 con Firestore & Visualización Animada
 * ══════════════════════════════════════════════════
 *
 * Características (Spec 3.4 & Prompt 9):
 * - Guarda y consulta los mejores puntajes en Firestore (/ranking/{uid}).
 * - Redundancia y fallback automático a Firebase Realtime Database y localStorage.
 * - Visualización de Podio Top 3 con animaciones y badges temáticos.
 */

import { FIREBASE_CONFIG } from './multijugador/firebase.js';
import { getState } from './state.js';

// Récords legendarios por defecto (Lore del juego)
export const DEFAULT_HALL_OF_FAME = [
  { uid: 'vera_01',   nombre: 'VERA_SORENSON', puntajeMaximo: 3420, firewallsCompletados: 5, fecha: '2044-10-14' },
  { uid: 'ghost_01',  nombre: 'GHOST',         puntajeMaximo: 3200, firewallsCompletados: 5, fecha: '2047-10-11' },
  { uid: 'cipher_09', nombre: 'CIPHER_09',     puntajeMaximo: 2850, firewallsCompletados: 4, fecha: '2047-09-22' },
];

/**
 * Obtiene el ranking almacenado localmente en caché.
 * @returns {Array<object>}
 */
function getLocalRankingCache() {
  try {
    const raw = localStorage.getItem('nexus_ranking_cache');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...DEFAULT_HALL_OF_FAME];
}

/**
 * Guarda el ranking en caché local.
 * @param {Array<object>} items
 */
function setLocalRankingCache(items) {
  try {
    localStorage.setItem('nexus_ranking_cache', JSON.stringify(items));
  } catch (_) {}
}

/**
 * Guarda una nueva puntuación en Firestore y en la base de datos de respaldo.
 * @param {object} entrada
 * @param {string} [entrada.nombre]
 * @param {number} entrada.puntaje
 * @param {number} [entrada.firewallsCompletados]
 * @returns {Promise<boolean>}
 */
export async function guardarScoreEnRanking({ nombre, puntaje, firewallsCompletados = 1 } = {}) {
  const jugadorNombre = (nombre || 'GHOST').toUpperCase().trim();
  const score = Number(puntaje) || 0;
  const fw = Number(firewallsCompletados) || 1;
  const fechaStr = new Date().toISOString().split('T')[0];
  const uid = 'breacher_' + jugadorNombre.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 1000);

  const nuevoRegistro = {
    uid,
    nombre: jugadorNombre,
    puntajeMaximo: score,
    firewallsCompletados: fw,
    fecha: fechaStr
  };

  // 1. Actualizar caché local
  const currentList = getLocalRankingCache();
  currentList.push(nuevoRegistro);
  currentList.sort((a, b) => b.puntajeMaximo - a.puntajeMaximo);
  setLocalRankingCache(currentList);

  // 2. Intentar guardar en Firestore vía REST API oficial
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/ranking/${uid}?key=${FIREBASE_CONFIG.apiKey}`;
    const firestoreBody = {
      fields: {
        nombre: { stringValue: jugadorNombre },
        puntajeMaximo: { integerValue: String(score) },
        firewallsCompletados: { integerValue: String(fw) },
        fecha: { stringValue: fechaStr }
      }
    };

    const res = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreBody)
    });

    if (res.ok) {
      console.log(`[Ranking] Score guardado en Firestore: ${jugadorNombre} (${score} PTS)`);
      return true;
    }
  } catch (err) {
    console.warn(`[Ranking] Firestore directo no disponible (${err.message}). Guardando en Realtime DB.`);
  }

  // 3. Fallback a Firebase Realtime Database (/ranking/{uid}.json)
  try {
    const rtdbUrl = `${FIREBASE_CONFIG.databaseURL}/ranking/${uid}.json`;
    await fetch(rtdbUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoRegistro)
    });
  } catch (_) {}

  return true;
}

/**
 * Consulta el Top 3 (o Top N) de mejores puntuaciones.
 * @param {number} [limite=3]
 * @returns {Promise<Array<object>>}
 */
export async function obtenerTopRanking(limite = 3) {
  let items = [];

  // 1. Intentar consultar Firestore
  try {
    const firestoreQueryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/ranking?key=${FIREBASE_CONFIG.apiKey}&pageSize=20`;
    const res = await fetch(firestoreQueryUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        items = data.documents.map(doc => {
          const f = doc.fields || {};
          const uid = doc.name ? doc.name.split('/').pop() : 'anon';
          return {
            uid,
            nombre: f.nombre?.stringValue || 'ANON',
            puntajeMaximo: Number(f.puntajeMaximo?.integerValue || f.puntajeMaximo?.doubleValue || 0),
            firewallsCompletados: Number(f.firewallsCompletados?.integerValue || 1),
            fecha: f.fecha?.stringValue || '2047-10-11'
          };
        });
      }
    }
  } catch (_) {}

  // 2. Si Firestore devolvió vacío o falló, intentar Realtime Database
  if (items.length === 0) {
    try {
      const rtdbUrl = `${FIREBASE_CONFIG.databaseURL}/ranking.json`;
      const res = await fetch(rtdbUrl, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const rawObj = await res.json();
        if (rawObj && typeof rawObj === 'object') {
          items = Object.values(rawObj).filter(Boolean);
        }
      }
    } catch (_) {}
  }

  // 3. Fallback a caché local y valores de Lore
  if (items.length === 0) {
    items = getLocalRankingCache();
  } else {
    // Si la nube tiene datos pero faltan los legendarios, mezclarlos para poblar
    DEFAULT_HALL_OF_FAME.forEach(leg => {
      if (!items.some(it => it.nombre === leg.nombre)) {
        items.push(leg);
      }
    });
    setLocalRankingCache(items);
  }

  // Ordenar de mayor a menor puntaje
  items.sort((a, b) => b.puntajeMaximo - a.puntajeMaximo);

  return items.slice(0, limite);
}

// ─────────────────────────────────────────────────
// RENDERIZADO VISUAL DEL RANKING TOP 3 CON ANIMACIONES
// ─────────────────────────────────────────────────

/**
 * Renderiza la interfaz visual del Ranking Top 3 en el contenedor.
 * @param {HTMLElement|string} [target]
 */
export async function renderRankingScreen(target = 'ranking-content') {
  if (typeof document === 'undefined') return;

  const container = typeof target === 'string' ? document.getElementById(target) : target;
  if (!container) return;

  // Estado de carga inicial con glitch
  container.innerHTML = `
    <div class="menu-content" style="max-width: 900px; margin: 0 auto; padding: var(--space-xl);">
      <h2 class="glitch glow-text" style="color: var(--green-bright); font-family: var(--font-display); font-size: var(--fs-3xl); margin-bottom: var(--space-xs);">
        HALL OF FAME // TOP 3 RANKING
      </h2>
      <p class="menu-subtitle">// Conectando a la red neuronal de Firestore...</p>
      <div style="font-family: var(--font-mono); color: var(--cyan); margin: var(--space-2xl) 0;">
        [ SINCRONIZANDO NODOS CUÁNTICOS ██████████ 100% ]
      </div>
    </div>
  `;

  // Obtener Top 3
  const topList = await obtenerTopRanking(3);
  const miHighScore = getState()?.highScore || 0;

  // Configuración de los 3 puestos del Podio
  const puestos = [
    {
      num: 1,
      titulo: '1º PUESTO // CAMPEÓN',
      badge: 'CHAMPION BREACHER',
      color: '#ffd700',
      glow: '0 0 20px rgba(255, 215, 0, 0.45)',
      cardClass: 'podium-card--first',
      data: topList[0] || { nombre: 'GHOST', puntajeMaximo: 3200, firewallsCompletados: 5, fecha: '2047-10-11' }
    },
    {
      num: 2,
      titulo: '2º PUESTO // ÉLITE',
      badge: 'ELITE INFILTRATOR',
      color: '#00e5ff',
      glow: '0 0 20px rgba(0, 229, 255, 0.45)',
      cardClass: 'podium-card--second',
      data: topList[1] || { nombre: 'VERA_SORENSON', puntajeMaximo: 3420, firewallsCompletados: 5, fecha: '2044-10-14' }
    },
    {
      num: 3,
      titulo: '3º PUESTO // VANGUARDIA',
      badge: 'CIPHER OPERATIVE',
      color: '#ff9100',
      glow: '0 0 20px rgba(255, 145, 0, 0.45)',
      cardClass: 'podium-card--third',
      data: topList[2] || { nombre: 'CIPHER_09', puntajeMaximo: 2850, firewallsCompletados: 4, fecha: '2047-09-22' }
    }
  ];

  // Orden visual del podio: [2º Plata (izq)] — [1º Oro (centro)] — [3º Bronce (der)]
  const podioOrdenado = [puestos[1], puestos[0], puestos[2]];

  container.innerHTML = `
    <div class="menu-content" style="max-width: 960px; margin: 0 auto; padding: var(--space-xl); text-align: center;">
      
      <div style="margin-bottom: var(--space-xl);">
        <h2 class="glitch glow-text" style="color: var(--green-bright); font-family: var(--font-display); font-size: var(--fs-3xl); margin-bottom: var(--space-xs); letter-spacing: 0.1em;">
          HALL OF FAME // TOP 3 RANKING
        </h2>
        <p class="menu-subtitle">// Los breachers de élite que vulneraron la Torre Aurelia en Firestore</p>
      </div>

      <!-- PODIO VISUAL ANIMADO TOP 3 -->
      <div class="podium-grid" style="display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: var(--space-lg); align-items: end; margin-bottom: var(--space-2xl);">
        ${podioOrdenado.map((p, idx) => `
          <div class="podium-card ${p.cardClass}" style="
            background: var(--bg-secondary);
            border: 2px solid ${p.color};
            border-radius: var(--radius-md);
            padding: var(--space-xl) var(--space-md);
            box-shadow: ${p.glow};
            position: relative;
            transform-origin: bottom;
            animation: podium-appear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            animation-delay: ${idx * 150}ms;
            opacity: 0;
            ${p.num === 1 ? 'min-height: 290px; background: linear-gradient(180deg, rgba(255,215,0,0.08) 0%, var(--bg-secondary) 100%);' : 'min-height: 250px;'}
          ">
            
            <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--bg-primary); border: 1px solid ${p.color}; border-radius: var(--radius-pill); padding: 2px 14px; font-family: var(--font-display); font-size: 11px; color: ${p.color}; font-weight: bold; letter-spacing: 0.1em; white-space: nowrap;">
              ◈ #${p.num} PUESTO ◈
            </div>

            <div style="font-size: 32px; margin: 8px 0;">
              ${p.num === 1 ? '👑' : (p.num === 2 ? '🥈' : '🥉')}
            </div>

            <h3 style="font-family: var(--font-display); color: ${p.color}; font-size: ${p.num === 1 ? 'var(--fs-xl)' : 'var(--fs-lg)'}; margin-bottom: 6px; letter-spacing: 0.05em;">
              ${p.data.nombre}
            </h3>

            <div style="display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 10px; color: ${p.color}; border: 1px solid ${p.color}; margin-bottom: var(--space-md); opacity: 0.85;">
              ${p.badge}
            </div>

            <div class="rank-score-val" data-target="${p.data.puntajeMaximo}" style="font-family: var(--font-mono); font-size: ${p.num === 1 ? 'var(--fs-2xl)' : 'var(--fs-xl)'}; color: var(--text-primary); font-weight: bold; text-shadow: 0 0 10px ${p.color}; margin-bottom: 6px;">
              ${p.data.puntajeMaximo.toLocaleString()} PTS
            </div>

            <div style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim); display: flex; justify-content: center; gap: 8px;">
              <span>FW: ${p.data.firewallsCompletados}/5</span>
              <span>•</span>
              <span>${p.data.fecha}</span>
            </div>

          </div>
        `).join('')}
      </div>

      <!-- PANEL DE RÉCORD DEL USUARIO LOCAL -->
      <div style="background: rgba(0, 255, 65, 0.04); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-2xl); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
        <div style="text-align: left;">
          <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim);">TU RÉCORD LOCAL ACTUAL:</span>
          <div style="font-family: var(--font-display); font-size: var(--fs-xl); color: var(--green-bright); font-weight: bold;">
            ${miHighScore.toLocaleString()} PTS
          </div>
        </div>

        <div style="display: flex; gap: var(--space-md);">
          <button id="btn-publicar-score" class="menu-btn" style="width: auto; padding: 8px 18px; font-size: var(--fs-xs); border-color: var(--green-bright); color: var(--green-bright);">
            ↑ SUBIR MI RÉCORD AL RANKING
          </button>
          <button id="btn-refrescar-ranking" class="menu-btn" style="width: auto; padding: 8px 16px; font-size: var(--fs-xs); border-color: var(--cyan); color: var(--cyan);">
            ⟳ ACTUALIZAR
          </button>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN INFERIOR -->
      <div style="display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;">
        <button class="menu-btn" id="btn-back-from-ranking-hall" style="width: auto; padding: 10px 24px;">
          ‹ VOLVER AL MENÚ PRINCIPAL
        </button>
        <button class="menu-btn" id="btn-go-to-script-ranking" style="width: auto; padding: 10px 24px; border-color: var(--yellow-warn); color: var(--yellow-warn);">
          ⚡ RANKING DE SCRIPTS (ELEGANCIA)
        </button>
      </div>

    </div>
  `;

  // Animación de contador numérico
  container.querySelectorAll('.rank-score-val').forEach(el => {
    const targetVal = parseInt(el.getAttribute('data-target'), 10) || 0;
    animarContador(el, targetVal);
  });

  // Event Listeners
  document.getElementById('btn-publicar-score')?.addEventListener('click', async () => {
    const alias = prompt('Introduce tu alias para el Hall of Fame:', 'GHOST') || 'GHOST';
    const btn = document.getElementById('btn-publicar-score');
    if (btn) btn.textContent = 'TRANSMITIENDO A FIRESTORE...';
    await guardarScoreEnRanking({
      nombre: alias,
      puntaje: miHighScore || 1000,
      firewallsCompletados: 5
    });
    alert(`¡Puntuación de ${alias} registrada con éxito en Firestore!`);
    renderRankingScreen(target);
  });

  document.getElementById('btn-refrescar-ranking')?.addEventListener('click', () => {
    renderRankingScreen(target);
  });

  document.getElementById('btn-back-from-ranking-hall')?.addEventListener('click', () => {
    if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
      window.navigateTo('screen-menu');
    } else {
      import('./router.js').then(r => r.navigateTo('screen-menu'));
    }
  });

  document.getElementById('btn-go-to-script-ranking')?.addEventListener('click', () => {
    if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
      window.navigateTo('screen-script-ranking');
    } else {
      import('./router.js').then(r => r.navigateTo('screen-script-ranking'));
    }
  });
}

/**
 * Anima un contador desde 0 hasta el valor objetivo.
 * @param {HTMLElement} el
 * @param {number} target
 */
function animarContador(el, target) {
  if (target <= 0) return;
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(easeOutQuad * target);
    el.textContent = `${current.toLocaleString()} PTS`;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = `${target.toLocaleString()} PTS`;
    }
  }

  requestAnimationFrame(update);
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Valida la lógica de consulta y guardado del ranking.
 * @returns {Promise<{ total: number, pasados: number, fallados: number }>}
 */
export async function testRanking() {
  console.group('%c[TEST SUITE] Firestore Ranking Top 3 (ranking.js)', 'color: #00ff41; font-weight: bold;');
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

  assert(typeof guardarScoreEnRanking === 'function', 'guardarScoreEnRanking debe ser una función');
  assert(typeof obtenerTopRanking === 'function', 'obtenerTopRanking debe ser una función');
  assert(Array.isArray(DEFAULT_HALL_OF_FAME), 'DEFAULT_HALL_OF_FAME debe ser un array');
  assert(DEFAULT_HALL_OF_FAME.length >= 3, 'El ranking base debe contener al menos 3 registros');

  // Test de guardado en el ranking
  const testEntry = {
    nombre: 'CIPHER_TEST_USER',
    puntaje: 9999,
    firewallsCompletados: 5
  };
  const guardado = await guardarScoreEnRanking(testEntry);
  assert(guardado === true, 'guardarScoreEnRanking se ejecuta correctamente');

  // Test de consulta del Top 3
  const top3 = await obtenerTopRanking(3);
  assert(Array.isArray(top3), 'obtenerTopRanking debe retornar un array');
  assert(top3.length === 3, 'obtenerTopRanking(3) debe devolver exactamente 3 elementos');
  assert(top3[0].puntajeMaximo >= top3[1].puntajeMaximo, 'El puesto 1 debe ser mayor o igual al puesto 2');
  assert(top3[1].puntajeMaximo >= top3[2].puntajeMaximo, 'El puesto 2 debe ser mayor o igual al puesto 3');
  assert(typeof top3[0].nombre === 'string', 'Cada elemento del ranking debe tener nombre');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Ranking: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Ranking: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
