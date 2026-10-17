/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * UI Polish — Micro-detalles, Tooltips Inteligentes y Guardado Automático
 * Especificación: Prompt 20 / Capa 5 (Spec 5.1, 5.2, 5.4, 5.5)
 * ══════════════════════════════════════════════════
 */

import { audio } from '../audio.js';
import { getState } from '../state.js';

// Diccionario de términos matemáticos y definiciones cognitivas
export const MATH_TERMS_DICT = {
  '∩': {
    term: 'A ∩ B',
    name: 'INTERSECCIÓN',
    category: 'conjuntos',
    def: 'Intersección: elementos que pertenecen a AMBOS conjuntos simultáneamente.'
  },
  '∪': {
    term: 'A ∪ B',
    name: 'UNIÓN',
    category: 'conjuntos',
    def: 'Unión: elementos que pertenecen al menos a UNO de los dos conjuntos.'
  },
  '\\': {
    term: 'A \\ B',
    name: 'DIFERENCIA',
    category: 'conjuntos',
    def: 'Diferencia: elementos que están en el primer conjunto pero NO en el segundo.'
  },
  '−': {
    term: 'A − B',
    name: 'DIFERENCIA',
    category: 'conjuntos',
    def: 'Diferencia: elementos que están en el primer conjunto pero NO en el segundo.'
  },
  '△': {
    term: 'A △ B',
    name: 'DIFERENCIA SIMÉTRICA',
    category: 'conjuntos',
    def: 'Diferencia simétrica: elementos en un conjunto o en el otro, pero NO en ambos.'
  },
  '⊆': {
    term: 'A ⊆ B',
    name: 'SUBCONJUNTO',
    category: 'conjuntos',
    def: 'Subconjunto: todos los elementos de A están contenidos en B.'
  },
  '∅': {
    term: '∅',
    name: 'CONJUNTO VACÍO',
    category: 'conjuntos',
    def: 'Conjunto vacío: no contiene ningún elemento (cardinalidad 0).'
  },
  '∧': {
    term: 'p ∧ q',
    name: 'CONJUNCIÓN (AND)',
    category: 'logica',
    def: 'Conjunción: verdadera ÚNICAMENTE si ambas proposiciones son verdaderas.'
  },
  '∨': {
    term: 'p ∨ q',
    name: 'DISYUNCIÓN (OR)',
    category: 'logica',
    def: 'Disyunción: verdadera si AL MENOS UNA de las proposiciones es verdadera.'
  },
  '¬': {
    term: '¬p',
    name: 'NEGACIÓN (NOT)',
    category: 'logica',
    def: 'Negación: invierte el valor de verdad (V pasa a F, F pasa a V).'
  },
  '→': {
    term: 'p → q',
    name: 'CONDICIONAL',
    category: 'logica',
    def: 'Condicional (p → q): solo es falsa si el antecedente es V y el consecuente es F.'
  },
  '↔': {
    term: 'p ↔ q',
    name: 'BICONDICIONAL',
    category: 'logica',
    def: 'Bicondicional (p ↔ q): verdadera si ambas proposiciones tienen el MISMO valor de verdad.'
  },
  '⊨': {
    term: '⊨',
    name: 'TAUTOLOGÍA',
    category: 'logica',
    def: 'Tautología: fórmula lógica universalmente válida que siempre resulta verdadera.'
  }
};

let autosaveTimer = null;

/**
 * Consulta cuántos puzzles ha resuelto el jugador en una categoría
 * o en general para evaluar maestría (Spec 5.4: >= 5 puzzles resueltos).
 * @param {string} category - 'conjuntos' | 'logica'
 * @returns {number}
 */
export function getSolvedCountByCategory(category) {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`nexus_mastery_${category}`);
      if (stored) return parseInt(stored, 10) || 0;
    }
  } catch (_) {}

  // Respaldo en estado de la sesión si está disponible
  try {
    const st = getState();
    if (st && typeof st.puzzlesCorrect === 'number') {
      return st.puzzlesCorrect;
    }
  } catch (_) {}

  return 0;
}

/**
 * Incrementa el contador de maestría por categoría al acertar un puzzle.
 * @param {string} category - 'conjuntos' | 'logica'
 */
export function incrementMasteryCount(category) {
  try {
    if (typeof localStorage !== 'undefined') {
      const current = getSolvedCountByCategory(category);
      localStorage.setItem(`nexus_mastery_${category}`, String(current + 1));
      return current + 1;
    }
  } catch (_) {}
  return 1;
}

/**
 * Obtiene el contenido del tooltip adaptativo para un término matemático (Prompt 20 / Spec 5.4).
 * @param {string} char
 * @returns {{ title: string, body: string, isMastered: boolean } | null}
 */
export function getTooltipContent(char) {
  const info = MATH_TERMS_DICT[char];
  if (!info) return null;

  const count = getSolvedCountByCategory(info.category);
  const isMastered = count >= 5;

  return {
    title: `${info.name} [${info.term}]`,
    body: isMastered ? 'Ya dominas esto. ¿Puedes hacerlo sin mí?' : info.def,
    isMastered
  };
}

/**
 * Muestra el indicador visual discreto de guardado automático (Spec 5.5).
 * "💾 Progreso guardado — HH:MM:SS" (se desvanece tras 2 segundos).
 */
export function mostrarIndicadorGuardado() {
  if (typeof document === 'undefined' || !document.body || typeof document.body.appendChild !== 'function') return;

  let el = (typeof document.getElementById === 'function') ? document.getElementById('nexus-autosave-indicator') : null;
  if (!el) {
    el = document.createElement('div');
    el.id = 'nexus-autosave-indicator';
    if (typeof el.setAttribute === 'function') el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }

  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const horaStr = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;

  el.textContent = `💾 Progreso guardado — ${horaStr}`;
  if (el.classList && typeof el.classList.add === 'function') {
    el.classList.add('visible');
  }

  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (el && el.classList && typeof el.classList.remove === 'function') {
      el.classList.remove('visible');
    }
  }, 2000);
}

/**
 * Inicializa los efectos de audio y micro-interacciones en todos los botones (Prompt 20 / Spec 5.1).
 */
export function initButtonInteractions() {
  if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;

  let lastAudioTime = 0;

  // Hover sound sutil en botones
  document.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('button, .menu-btn, .puzzle__opcion, .btn');
    if (btn && !btn.disabled) {
      const now = Date.now();
      // Pequeño debounce de 40ms para evitar ráfagas al mover el ratón rápidamente
      if (now - lastAudioTime > 40) {
        lastAudioTime = now;
        try {
          if (audio && typeof audio.playKeyClick === 'function') {
            audio.playKeyClick();
          }
        } catch (_) {}
      }
    }
  }, { passive: true });
}

/**
 * Inicializa los tooltips inteligentes flotantes para términos matemáticos (Spec 5.4).
 */
export function initIntelligentTooltips() {
  if (typeof document === 'undefined' || !document.body || typeof document.body.appendChild !== 'function' || typeof document.addEventListener !== 'function') return;

  let tooltipEl = (typeof document.getElementById === 'function') ? document.getElementById('nexus-smart-tooltip') : null;
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'nexus-smart-tooltip';
    tooltipEl.innerHTML = '<div class="tooltip__header"></div><div class="tooltip__body"></div>';
    document.body.appendChild(tooltipEl);
  }

  const headerEl = tooltipEl.querySelector('.tooltip__header');
  const bodyEl = tooltipEl.querySelector('.tooltip__body');

  function ocultarTooltip() {
    tooltipEl.classList.remove('visible');
  }

  function mostrarTooltip(data, x, y) {
    if (!data) return;
    headerEl.textContent = data.title;
    bodyEl.textContent = data.body;
    if (data.isMastered) {
      tooltipEl.classList.add('tooltip--mastered');
    } else {
      tooltipEl.classList.remove('tooltip--mastered');
    }

    // Posicionamiento inteligente evitando bordes de pantalla
    const pad = 15;
    let posX = x + pad;
    let posY = y + pad;

    const rectWidth = 260;
    const rectHeight = 80;

    if (posX + rectWidth > window.innerWidth) {
      posX = x - rectWidth - pad;
    }
    if (posY + rectHeight > window.innerHeight) {
      posY = y - rectHeight - pad;
    }

    tooltipEl.style.left = `${Math.max(10, posX)}px`;
    tooltipEl.style.top = `${Math.max(10, posY)}px`;
    tooltipEl.classList.add('visible');
  }

  // Detectar paso de ratón sobre elementos matemáticos o términos
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    // 1. Atributo explícito data-math o data-term
    const mathAttr = target.getAttribute && (target.getAttribute('data-math') || target.getAttribute('data-term'));
    if (mathAttr && MATH_TERMS_DICT[mathAttr]) {
      const data = getTooltipContent(mathAttr);
      mostrarTooltip(data, e.clientX, e.clientY);
      return;
    }

    // 2. Comprobar si el texto contiene símbolos matemáticos conocidos
    const text = target.textContent || '';
    for (const sym of Object.keys(MATH_TERMS_DICT)) {
      if (text.includes(sym) && text.trim().length <= 25) {
        const data = getTooltipContent(sym);
        mostrarTooltip(data, e.clientX, e.clientY);
        return;
      }
    }
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if (tooltipEl.classList.contains('visible')) {
      const pad = 15;
      let posX = e.clientX + pad;
      let posY = e.clientY + pad;

      const rectWidth = 260;
      const rectHeight = 80;

      if (posX + rectWidth > window.innerWidth) {
        posX = e.clientX - rectWidth - pad;
      }
      if (posY + rectHeight > window.innerHeight) {
        posY = e.clientY - rectHeight - pad;
      }

      tooltipEl.style.left = `${Math.max(10, posX)}px`;
      tooltipEl.style.top = `${Math.max(10, posY)}px`;
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (target && target.closest && (target.closest('[data-math]') || target.closest('[data-term]') || target.closest('.puzzle__opcion') || target.closest('.venn-container'))) {
      ocultarTooltip();
    }
  }, { passive: true });
}

/**
 * Inicializa todo el pulido visual y micro-interacciones de la Capa 5.
 */
export function initPolish() {
  initButtonInteractions();
  initIntelligentTooltips();
  if (typeof window !== 'undefined') {
    window.mostrarIndicadorGuardado = mostrarIndicadorGuardado;
    window.incrementMasteryCount = incrementMasteryCount;
    window.getSolvedCountByCategory = getSolvedCountByCategory;
  }
}

/**
 * Suite de pruebas unitarias para Pulido Final (Prompt 20 / Spec 5)
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testPolish() {
  console.group('%c[TEST SUITE] Pulido Final y Micro-detalles (polish.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  // 1. Diccionario de términos matemáticos
  assert(MATH_TERMS_DICT['∩'] !== undefined, 'Término ∩ debe estar definido en el diccionario');
  assert(MATH_TERMS_DICT['∧'] !== undefined, 'Término ∧ debe estar definido en el diccionario');
  assert(MATH_TERMS_DICT['→'] !== undefined, 'Término → debe estar definido en el diccionario');
  assert(MATH_TERMS_DICT['△'] !== undefined, 'Término △ debe estar definido en el diccionario');

  // 2. Tooltip para principiante (< 5 puzzles)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nexus_mastery_conjuntos', '2');
    }
  } catch (_) {}

  const ttNovato = getTooltipContent('∩');
  assert(ttNovato !== null, 'getTooltipContent debe retornar objeto de tooltip');
  assert(ttNovato.isMastered === false, 'Con 2 puzzles no debe considerarse dominado');
  assert(ttNovato.body.includes('pertenecen a AMBOS'), 'Debe retornar la definición pedagógica completa');

  // 3. Tooltip adaptativo para veterano (>= 5 puzzles)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nexus_mastery_conjuntos', '7');
    }
  } catch (_) {}

  const ttVeterano = getTooltipContent('∩');
  assert(ttVeterano !== null, 'getTooltipContent debe retornar objeto');
  assert(ttVeterano.isMastered === true, 'Con 7 puzzles debe considerarse dominado');
  assert(ttVeterano.body.includes('Ya dominas esto'), 'Debe retornar mensaje de dominio: Ya dominas esto. ¿Puedes hacerlo sin mí?');

  // 4. Indicador de guardado automático
  assert(typeof mostrarIndicadorGuardado === 'function', 'mostrarIndicadorGuardado debe ser una función');
  mostrarIndicadorGuardado(); // Ejecutar sin errores

  // 5. Inicialización de interacciones
  assert(typeof initButtonInteractions === 'function', 'initButtonInteractions debe ser una función');
  assert(typeof initIntelligentTooltips === 'function', 'initIntelligentTooltips debe ser una función');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Pulido Final y Micro-detalles: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Pulido Final: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
