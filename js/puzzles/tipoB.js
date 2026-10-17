/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo B — Lógica proposicional (V/F)
 * Especificación: Sección 2.4 de PROJECT_SPEC.md
 *
 * Muestra una proposición compuesta con valores asignados.
 * El jugador debe determinar si el resultado es Verdadero o Falso.
 * ══════════════════════════════════════════════════
 */

import { Logica } from '../logica.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

// ─────────────────────────────────────────────────
// 1. BANCO DE PLANTILLAS DE EXPRESIONES
// ─────────────────────────────────────────────────

const EXPRESIONES_POR_NIVEL = {
  1: [
    // Nivel 1: 2 variables, operaciones simples
    { expr: 'p AND q',          display: 'p ∧ q',           vars: ['p', 'q'] },
    { expr: 'p OR q',           display: 'p ∨ q',           vars: ['p', 'q'] },
    { expr: 'NOT p',            display: '¬p',              vars: ['p'] },
    { expr: 'NOT (p AND q)',    display: '¬(p ∧ q)',        vars: ['p', 'q'] },
    { expr: 'NOT (p OR q)',     display: '¬(p ∨ q)',        vars: ['p', 'q'] },
    { expr: 'p AND (NOT q)',    display: 'p ∧ ¬q',         vars: ['p', 'q'] },
    { expr: '(NOT p) OR q',     display: '¬p ∨ q',         vars: ['p', 'q'] },
  ],
  2: [
    // Nivel 2: implicación
    { expr: 'p IMPLICA q',             display: 'p → q',             vars: ['p', 'q'] },
    { expr: '(p AND q) IMPLICA r',     display: '(p ∧ q) → r',      vars: ['p', 'q', 'r'] },
    { expr: 'p IMPLICA (NOT q)',       display: 'p → ¬q',            vars: ['p', 'q'] },
    { expr: '(NOT p) IMPLICA q',      display: '¬p → q',            vars: ['p', 'q'] },
    { expr: '(p OR q) IMPLICA r',     display: '(p ∨ q) → r',      vars: ['p', 'q', 'r'] },
  ],
  3: [
    // Nivel 3: bicondicional y combinaciones
    { expr: 'p SSI q',                    display: 'p ↔ q',               vars: ['p', 'q'] },
    { expr: '(p IMPLICA q) AND (q IMPLICA p)', display: '(p → q) ∧ (q → p)', vars: ['p', 'q'] },
    { expr: '(p AND q) SSI (NOT r)',      display: '(p ∧ q) ↔ ¬r',      vars: ['p', 'q', 'r'] },
    { expr: '(NOT p) SSI (q OR r)',       display: '¬p ↔ (q ∨ r)',      vars: ['p', 'q', 'r'] },
  ],
  4: [
    // Nivel 4: expresiones complejas
    { expr: '(p IMPLICA q) AND (NOT q) IMPLICA (NOT p)', display: '((p → q) ∧ ¬q) → ¬p', vars: ['p', 'q'] },
    { expr: '(p AND q) IMPLICA (p OR r)',                display: '(p ∧ q) → (p ∨ r)',   vars: ['p', 'q', 'r'] },
    { expr: 'NOT (p AND q) SSI ((NOT p) OR (NOT q))',    display: '¬(p ∧ q) ↔ (¬p ∨ ¬q)', vars: ['p', 'q'] },
    { expr: '((p IMPLICA q) AND (q IMPLICA r)) IMPLICA (p IMPLICA r)', display: '((p → q) ∧ (q → r)) → (p → r)', vars: ['p', 'q', 'r'] },
  ],
  5: [
    // Nivel 5: razonamiento avanzado (tautologías y contradicciones)
    { expr: 'p OR (NOT p)',                            display: 'p ∨ ¬p',                 vars: ['p'] },
    { expr: 'p AND (NOT p)',                           display: 'p ∧ ¬p',                 vars: ['p'] },
    { expr: '(p IMPLICA q) SSI ((NOT q) IMPLICA (NOT p))', display: '(p → q) ↔ (¬q → ¬p)', vars: ['p', 'q'] },
    { expr: '((p OR q) AND (NOT p)) IMPLICA q',       display: '((p ∨ q) ∧ ¬p) → q',    vars: ['p', 'q'] },
    { expr: '(p AND (p IMPLICA q)) IMPLICA q',        display: '(p ∧ (p → q)) → q',     vars: ['p', 'q'] },
  ],
};

// ─────────────────────────────────────────────────
// 2. GENERADOR DE PUZZLE TIPO B
// ─────────────────────────────────────────────────

/**
 * Genera un puzzle de lógica proposicional V/F.
 * @param {number} [nivel=1] - Nivel de dificultad (1-5)
 * @returns {object} Puzzle completo
 */
export function generarPuzzleTipoB(nivel = 1) {
  const nivelClamped = Math.max(1, Math.min(5, nivel));
  
  // Elegir entre plantillas del nivel actual y del anterior (para variedad)
  const plantillasDisponibles = [
    ...(EXPRESIONES_POR_NIVEL[nivelClamped] || []),
    ...(EXPRESIONES_POR_NIVEL[Math.max(1, nivelClamped - 1)] || []),
  ];
  
  const plantilla = elegirAlAzar(plantillasDisponibles);
  
  // Generar valores aleatorios para las variables
  const valores = {};
  for (const v of plantilla.vars) {
    valores[v] = Math.random() < 0.5;
  }
  
  // Evaluar resultado correcto usando el motor de logica.js
  const resultadoCorrecto = Logica.evaluar(plantilla.expr, valores);
  
  // Formatear asignación de variables para el enunciado
  const asignacionTexto = plantilla.vars
    .map(v => `${v} = ${valores[v] ? 'V' : 'F'}`)
    .join(', ');
  
  // Explicación detallada
  const pasos = generarExplicacion(plantilla, valores, resultadoCorrecto);
  
  return {
    id: `puzzle_B_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tipo: 'B',
    titulo: 'FIREWALL // LÓGICA PROPOSICIONAL',
    nivel: nivelClamped,
    enunciado: `Dada la proposición <strong>${plantilla.display}</strong> con los valores <strong>${asignacionTexto}</strong>, ¿cuál es el resultado?`,
    expresion: plantilla.expr,
    expresionDisplay: plantilla.display,
    variables: plantilla.vars,
    valores,
    opciones: ['VERDADERO (V)', 'FALSO (F)'],
    respuestaCorrecta: resultadoCorrecto ? 'VERDADERO (V)' : 'FALSO (F)',
    resultadoBooleano: resultadoCorrecto,
    explicacion: pasos,
    tiempoLimite: Math.max(55, 80 - nivel * 5),
  };
}

/**
 * Genera una explicación paso a paso.
 */
function generarExplicacion(plantilla, valores, resultado) {
  const vars = plantilla.vars.map(v => `${v} = ${valores[v] ? 'V' : 'F'}`).join(', ');
  const res = resultado ? 'VERDADERO' : 'FALSO';
  
  let explicacion = `Sustituyendo ${vars} en la expresión ${plantilla.display}:\n`;
  
  // Mostrar sustitución concreta
  let sustituida = plantilla.display;
  for (const v of plantilla.vars) {
    sustituida = sustituida.replace(new RegExp(`\\b${v}\\b`, 'g'), valores[v] ? 'V' : 'F');
  }
  explicacion += `${sustituida} = ${res}`;
  
  return explicacion;
}

// ─────────────────────────────────────────────────
// 3. RENDERER DEL PUZZLE EN EL DOM
// ─────────────────────────────────────────────────

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;

function detenerTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  audio.updateTension({ timer: null });
}

function formatearTiempo(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function cerrarPuzzleTipoB() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Abre y renderiza un puzzle de Tipo B en el overlay.
 * @param {number} [nivel=1]
 * @param {Function} [onCompletado] - ({ exito, puntos, puzzle }) => void
 */
export function abrirPuzzleTipoB(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  puzzleActual = generarPuzzleTipoB(nivel);
  tiempoInicio = Date.now();

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo B] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  // Header
  if (elTipo) elTipo.textContent = `TIPO B // LÓGICA PROPOSICIONAL (NIVEL ${nivel})`;
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar la proposición con estilo terminal
  elBody.innerHTML = renderProposicionVisual(puzzleActual);

  // Reset feedback
  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzleTipoB();
      if (puzzleActual._isGameOver) {
        if (typeof window !== 'undefined' && window.__triggerGameOver) {
          window.__triggerGameOver('INTEGRIDAD COMPROMETIDA (0%)');
          return;
        }
      }
      if (callbackCompletado) {
        callbackCompletado({
          exito: puzzleActual._respondidoCorrecto,
          puntos: puzzleActual._puntosObtenidos || 0,
          puzzle: puzzleActual,
          isGameOver: puzzleActual._isGameOver || false
        });
      }
    };
  }

  // Botones V/F
  elOpciones.innerHTML = '';
  puzzleActual.opciones.forEach(opcionTexto => {
    const btn = document.createElement('button');
    btn.className = 'puzzle__opcion';
    btn.textContent = opcionTexto;
    btn.style.minWidth = '180px';
    btn.onclick = () => procesarRespuestaB(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Timer (oculto en Ghost Protocol - Prompt 19)
  let segundosRestantes = puzzleActual.tiempoLimite || 75;
  const isGhost = !!getState().isGhostProtocol;

  if (elTimer) {
    elTimer.textContent = isGhost ? '⏱️ [OCULTO]' : formatearTiempo(segundosRestantes);
    elTimer.classList.remove('critical');

    timerInterval = setInterval(() => {
      segundosRestantes--;
      if (isGhost) {
        elTimer.textContent = '⏱️ [OCULTO]';
      } else {
        elTimer.textContent = formatearTiempo(segundosRestantes);
        if (segundosRestantes <= 10) elTimer.classList.add('critical');
      }
      audio.updateTension({ timer: segundosRestantes });
      if (segundosRestantes <= 0) {
        detenerTimer();
        procesarTiempoAgotadoB();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

/**
 * Renderiza la proposición con estilo visual.
 */
function renderProposicionVisual(puzzle) {
  const valoresHTML = puzzle.variables.map(v => `
    <span class="logic-var">
      <span class="logic-var__name">${v}</span>
      <span class="logic-var__value logic-var__value--${puzzle.valores[v] ? 'true' : 'false'}">
        ${puzzle.valores[v] ? 'V' : 'F'}
      </span>
    </span>
  `).join('');

  return `
    <div class="logic-proposition">
      <div class="logic-proposition__expr">
        <span class="logic-label">PROPOSICIÓN //</span>
        <code class="logic-code">${puzzle.expresionDisplay}</code>
      </div>
      <div class="logic-proposition__values">
        <span class="logic-label">VALORES ASIGNADOS //</span>
        <div class="logic-vars-row">${valoresHTML}</div>
      </div>
      <div class="logic-proposition__question">
        <span class="logic-label">¿RESULTADO? //</span>
        <span style="color: var(--yellow-warn);">Selecciona VERDADERO o FALSO</span>
      </div>
    </div>
  `;
}

function procesarRespuestaB(botonSeleccionado, opcionTexto) {
  detenerTimer();
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => (b.disabled = true));
  }

  const esCorrecto = (opcionTexto === puzzleActual.respuestaCorrecta);
  const timeMs = Date.now() - tiempoInicio;
  puzzleActual._respondidoCorrecto = esCorrecto;

  const rect = (botonSeleccionado && typeof botonSeleccionado.getBoundingClientRect === 'function')
    ? botonSeleccionado.getBoundingClientRect()
    : null;
  const coords = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;

  if (esCorrecto) {
    botonSeleccionado.classList.add('correct');
    const pts = registerCorrect({ timeMs, usedHint: false });
    puzzleActual._puntosObtenidos = pts;

    feedbackSuccess(pts, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ PROTOCOLO VERIFICADO // EVALUACIÓN CORRECTA (+${pts} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  } else {
    botonSeleccionado.classList.add('incorrect');
    if (elOpciones) {
      elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
        if (b.textContent === puzzleActual.respuestaCorrecta) b.classList.add('correct');
      });
    }
    const gameOver = registerWrong();
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>✖ ERROR LÓGICO // INTEGRIDAD REDUCIDA (-20%)</strong><br>
        <span>${puzzleActual.explicacion}</span>
        ${gameOver ? '<br><strong style="color:var(--red-alert)">[ALERTA CRÍTICA] ¡Integridad en 0%! Sistema bloqueado.</strong>' : ''}
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
    btnNext.textContent = puzzleActual._isGameOver ? 'EXPULSIÓN DEL SISTEMA ▸' : 'CONTINUAR ▸';
    btnNext.focus();
  }
}

function procesarTiempoAgotadoB() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
      if (b.textContent === puzzleActual.respuestaCorrecta) b.classList.add('correct');
    });
  }

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._isGameOver = gameOver;

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱ TIEMPO AGOTADO // EVALUACIÓN FALLIDA (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
      ${gameOver ? '<br><strong style="color:var(--red-alert)">[ALERTA CRÍTICA] ¡Integridad en 0%! Sistema bloqueado.</strong>' : ''}
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
    btnNext.textContent = gameOver ? 'EXPULSIÓN DEL SISTEMA ▸' : 'CONTINUAR ▸';
    btnNext.focus();
  }
}

// ─────────────────────────────────────────────────
// 4. TESTS
// ─────────────────────────────────────────────────

export function testTipoB() {
  console.group('%c[TEST SUITE] Puzzle Tipo B (tipoB.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  // Test: generación básica
  for (let nivel = 1; nivel <= 5; nivel++) {
    const p = generarPuzzleTipoB(nivel);
    assert(p.tipo === 'B', `Nivel ${nivel}: tipo debe ser B`);
    assert(p.opciones.length === 2, `Nivel ${nivel}: debe tener 2 opciones (V/F)`);
    assert(p.opciones.includes(p.respuestaCorrecta), `Nivel ${nivel}: respuesta correcta en opciones`);
    assert(typeof p.resultadoBooleano === 'boolean', `Nivel ${nivel}: resultado debe ser booleano`);
    assert(typeof p.explicacion === 'string' && p.explicacion.length > 0, `Nivel ${nivel}: debe tener explicación`);
  }

  // Test: validación matemática correcta
  const pTest = { expr: 'p AND q', display: 'p ∧ q', vars: ['p', 'q'] };
  const v1 = { p: true, q: true };
  assert(Logica.evaluar(pTest.expr, v1) === true, 'p AND q con p=V, q=V debe ser V');
  const v2 = { p: true, q: false };
  assert(Logica.evaluar(pTest.expr, v2) === false, 'p AND q con p=V, q=F debe ser F');

  // Test: implicación
  assert(Logica.evaluar('p IMPLICA q', { p: true, q: false }) === false, 'V → F = F');
  assert(Logica.evaluar('p IMPLICA q', { p: false, q: false }) === true, 'F → F = V');

  // Test: bicondicional
  assert(Logica.evaluar('p SSI q', { p: true, q: true }) === true, 'V ↔ V = V');
  assert(Logica.evaluar('p SSI q', { p: true, q: false }) === false, 'V ↔ F = F');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Tipo B: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Tipo B: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
