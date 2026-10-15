/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo D — Tablas de verdad (completar celdas)
 * Especificación: Sección 2.4 de PROJECT_SPEC.md
 *
 * Muestra una tabla de verdad con celdas vacías (?).
 * El jugador debe completar los valores faltantes.
 * ══════════════════════════════════════════════════
 */

import { Logica } from '../logica.js';
import { registerCorrect, registerWrong } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';

// ─────────────────────────────────────────────────
// 1. EXPRESIONES POR NIVEL
// ─────────────────────────────────────────────────

const EXPRESIONES_TABLA = {
  1: [
    { expr: 'p AND q',        display: 'p ∧ q',     vars: ['p', 'q'] },
    { expr: 'p OR q',         display: 'p ∨ q',     vars: ['p', 'q'] },
    { expr: 'NOT p',          display: '¬p',         vars: ['p'] },
  ],
  2: [
    { expr: 'p IMPLICA q',          display: 'p → q',       vars: ['p', 'q'] },
    { expr: '(NOT p) OR q',         display: '¬p ∨ q',     vars: ['p', 'q'] },
    { expr: 'NOT (p AND q)',        display: '¬(p ∧ q)',   vars: ['p', 'q'] },
  ],
  3: [
    { expr: 'p SSI q',                        display: 'p ↔ q',             vars: ['p', 'q'] },
    { expr: '(p AND q) OR (NOT r)',           display: '(p ∧ q) ∨ ¬r',     vars: ['p', 'q', 'r'] },
    { expr: '(p IMPLICA q) AND (q IMPLICA r)',display: '(p → q) ∧ (q → r)', vars: ['p', 'q', 'r'] },
  ],
  4: [
    { expr: '(p OR q) IMPLICA (NOT r)',       display: '(p ∨ q) → ¬r',       vars: ['p', 'q', 'r'] },
    { expr: '(NOT p) SSI (q AND r)',          display: '¬p ↔ (q ∧ r)',       vars: ['p', 'q', 'r'] },
  ],
  5: [
    { expr: '((p IMPLICA q) AND (NOT q)) IMPLICA (NOT p)', display: '((p → q) ∧ ¬q) → ¬p', vars: ['p', 'q'] },
    { expr: '(p AND (p IMPLICA q)) IMPLICA q',             display: '(p ∧ (p → q)) → q',   vars: ['p', 'q'] },
  ],
};

// ─────────────────────────────────────────────────
// 2. GENERADOR DE PUZZLE TIPO D
// ─────────────────────────────────────────────────

/**
 * Genera un puzzle de tabla de verdad incompleta.
 * @param {number} [nivel=1]
 * @returns {object}
 */
export function generarPuzzleTipoD(nivel = 1) {
  const nivelClamped = Math.max(1, Math.min(5, nivel));
  const exprs = EXPRESIONES_TABLA[nivelClamped] || EXPRESIONES_TABLA[1];
  const plantilla = elegirAlAzar(exprs);

  // Generar tabla de verdad completa
  const tabla = Logica.tablaDeVerdad(plantilla.expr, plantilla.vars);

  // Determinar cuántas celdas ocultar según nivel
  const totalFilas = tabla.length;
  const numOcultas = Math.min(totalFilas, Math.max(1, Math.floor(totalFilas * (0.25 + nivelClamped * 0.1))));

  // Seleccionar filas aleatorias para ocultar
  const indicesOcultos = mezclar(Array.from({ length: totalFilas }, (_, i) => i))
    .slice(0, numOcultas)
    .sort((a, b) => a - b);

  // Crear copia de la tabla con huecos
  const tablaConHuecos = tabla.map((fila, i) => ({
    valores: { ...fila.valores },
    resultado: fila.resultado,
    oculto: indicesOcultos.includes(i),
  }));

  // Secuencia correcta para compatibilidad con opciones múltiples y multiplayer
  const correctaSeq = indicesOcultos.map(idx => tabla[idx].resultado ? 'V' : 'F').join(', ');
  const opciones = [correctaSeq];
  const n = indicesOcultos.length;
  for (let k = 0; k < (1 << n); k++) {
    const candidate = indicesOcultos.map((_, bit) => (k & (1 << bit)) ? 'V' : 'F').join(', ');
    if (!opciones.includes(candidate)) {
      opciones.push(candidate);
    }
    if (opciones.length >= 4) break;
  }
  while (opciones.length < 4) {
    opciones.push(indicesOcultos.map(() => Math.random() > 0.5 ? 'V' : 'F').join(', '));
  }

  return {
    id: `puzzle_D_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tipo: 'D',
    titulo: 'FIREWALL // TABLA DE VERDAD',
    nivel: nivelClamped,
    enunciado: `Completa los valores faltantes <strong style="color:var(--yellow-warn);">(?)</strong> en la tabla de verdad de: <strong>${plantilla.display}</strong>`,
    expresion: plantilla.expr,
    expresionDisplay: plantilla.display,
    variables: plantilla.vars,
    tablaCompleta: tabla,
    tablaConHuecos,
    indicesOcultos,
    numOcultas,
    opciones: mezclar(opciones),
    respuestaCorrecta: correctaSeq,
    explicacion: `La tabla de verdad de ${plantilla.display} se calcula evaluando la expresión para cada combinación posible de valores de las variables.`,
    tiempoLimite: Math.max(75, 110 - nivel * 6),
  };
}

// ─────────────────────────────────────────────────
// 3. RENDERER DEL PUZZLE EN EL DOM
// ─────────────────────────────────────────────────

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let respuestasUsuario = {};

function detenerTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatearTiempo(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function cerrarPuzzleTipoD() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Abre y renderiza un puzzle de Tipo D en el overlay.
 */
export function abrirPuzzleTipoD(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  puzzleActual = generarPuzzleTipoD(nivel);
  tiempoInicio = Date.now();
  respuestasUsuario = {};

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo D] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) elTipo.textContent = `TIPO D // TABLA DE VERDAD (NIVEL ${nivel})`;
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar tabla de verdad
  elBody.innerHTML = renderTablaDeVerdad(puzzleActual);

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }

  // El botón de opciones se reemplaza por un botón de verificar
  elOpciones.innerHTML = '';
  const btnVerificar = document.createElement('button');
  btnVerificar.className = 'puzzle__opcion puzzle__opcion--submit';
  btnVerificar.textContent = '◈ VERIFICAR TABLA';
  btnVerificar.id = 'btn-verificar-tabla';
  btnVerificar.onclick = () => verificarTabla();
  elOpciones.appendChild(btnVerificar);

  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzleTipoD();
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

  // Timer
  let segundosRestantes = puzzleActual.tiempoLimite || 100;
  if (elTimer) {
    elTimer.textContent = formatearTiempo(segundosRestantes);
    elTimer.classList.remove('critical');
    timerInterval = setInterval(() => {
      segundosRestantes--;
      elTimer.textContent = formatearTiempo(segundosRestantes);
      if (segundosRestantes <= 10) elTimer.classList.add('critical');
      if (segundosRestantes <= 0) {
        detenerTimer();
        procesarTiempoAgotadoD();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

/**
 * Renderiza la tabla de verdad con celdas interactivas.
 */
function renderTablaDeVerdad(puzzle) {
  const vars = puzzle.variables;
  const tabla = puzzle.tablaConHuecos;

  let headerCells = vars.map(v => `<th>${v}</th>`).join('');
  headerCells += `<th class="truth-table__result-header">${puzzle.expresionDisplay}</th>`;

  let bodyRows = '';
  tabla.forEach((fila, i) => {
    const varCells = vars.map(v => {
      const val = fila.valores[v];
      return `<td class="truth-table__cell truth-table__cell--${val ? 'true' : 'false'}">${val ? 'V' : 'F'}</td>`;
    }).join('');

    let resultCell;
    if (fila.oculto) {
      // Celda interactiva: el jugador debe elegir V o F
      resultCell = `
        <td class="truth-table__cell truth-table__cell--input" data-row="${i}">
          <button class="truth-btn" data-row="${i}" data-val="true" onclick="window.__tipoDToggle(${i}, true)">V</button>
          <button class="truth-btn" data-row="${i}" data-val="false" onclick="window.__tipoDToggle(${i}, false)">F</button>
        </td>
      `;
    } else {
      const val = fila.resultado;
      resultCell = `<td class="truth-table__cell truth-table__cell--${val ? 'true' : 'false'}">${val ? 'V' : 'F'}</td>`;
    }

    bodyRows += `<tr>${varCells}${resultCell}</tr>`;
  });

  // Registrar handler global para los botones toggle
  if (typeof window !== 'undefined') {
    window.__tipoDToggle = (rowIndex, value) => {
      respuestasUsuario[rowIndex] = value;

      // Actualizar UI: resaltar el botón seleccionado
      const buttons = document.querySelectorAll(`.truth-btn[data-row="${rowIndex}"]`);
      buttons.forEach(btn => {
        const btnVal = btn.getAttribute('data-val') === 'true';
        btn.classList.toggle('truth-btn--selected', btnVal === value);
        btn.classList.toggle('truth-btn--true', btnVal === value && value === true);
        btn.classList.toggle('truth-btn--false', btnVal === value && value === false);
      });
    };
  }

  return `
    <div class="truth-table-container">
      <table class="truth-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}

/**
 * Verifica las respuestas del usuario.
 */
function verificarTabla() {
  detenerTimer();

  const elFeedback = document.getElementById('puzzle-feedback');
  const elOpciones = document.getElementById('puzzle-opciones');
  const btnNext = document.getElementById('puzzle-btn-next');

  // Deshabilitar botón de verificar
  const btnVerificar = document.getElementById('btn-verificar-tabla');
  if (btnVerificar) btnVerificar.disabled = true;

  // Deshabilitar todos los botones de toggle
  document.querySelectorAll('.truth-btn').forEach(b => (b.disabled = true));

  // Verificar cada celda oculta
  let correctas = 0;
  let totalOcultas = puzzleActual.indicesOcultos.length;

  puzzleActual.indicesOcultos.forEach(i => {
    const esperado = puzzleActual.tablaCompleta[i].resultado;
    const dado = respuestasUsuario[i];
    const celda = document.querySelector(`.truth-table__cell--input[data-row="${i}"]`);

    if (dado === esperado) {
      correctas++;
      if (celda) celda.classList.add('truth-table__cell--correct');
    } else {
      if (celda) {
        celda.classList.add('truth-table__cell--incorrect');
        // Mostrar la respuesta correcta
        const correctBtn = celda.querySelector(`.truth-btn[data-val="${esperado}"]`);
        if (correctBtn) correctBtn.classList.add('truth-btn--answer');
      }
    }
  });

  const todosCorrecto = (correctas === totalOcultas);
  puzzleActual._respondidoCorrecto = todosCorrecto;

  const timeMs = Date.now() - tiempoInicio;

  if (todosCorrecto) {
    const pts = registerCorrect({ timeMs, usedHint: false });
    puzzleActual._puntosObtenidos = pts;
    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ TABLA VERIFICADA // ${correctas}/${totalOcultas} CELDAS CORRECTAS (+${pts} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  } else {
    const gameOver = registerWrong();
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;
    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>✖ ERROR EN TABLA // ${correctas}/${totalOcultas} CORRECTAS (-20% INTEGRIDAD)</strong><br>
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

function procesarTiempoAgotadoD() {
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const btnVerificar = document.getElementById('btn-verificar-tabla');

  if (btnVerificar) btnVerificar.disabled = true;
  document.querySelectorAll('.truth-btn').forEach(b => (b.disabled = true));

  // Revelar respuestas correctas
  puzzleActual.indicesOcultos.forEach(i => {
    const esperado = puzzleActual.tablaCompleta[i].resultado;
    const celda = document.querySelector(`.truth-table__cell--input[data-row="${i}"]`);
    if (celda) {
      celda.classList.add('truth-table__cell--incorrect');
      const correctBtn = celda.querySelector(`.truth-btn[data-val="${esperado}"]`);
      if (correctBtn) correctBtn.classList.add('truth-btn--answer');
    }
  });

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._isGameOver = gameOver;

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱ TIEMPO AGOTADO // ANÁLISIS INCOMPLETO (-20% INTEGRIDAD)</strong><br>
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

export function testTipoD() {
  console.group('%c[TEST SUITE] Puzzle Tipo D (tipoD.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  for (let nivel = 1; nivel <= 5; nivel++) {
    const p = generarPuzzleTipoD(nivel);
    assert(p.tipo === 'D', `Nivel ${nivel}: tipo debe ser D`);
    assert(Array.isArray(p.tablaCompleta), `Nivel ${nivel}: debe tener tabla completa`);
    assert(Array.isArray(p.tablaConHuecos), `Nivel ${nivel}: debe tener tabla con huecos`);
    assert(p.tablaCompleta.length === p.tablaConHuecos.length, `Nivel ${nivel}: longitudes deben coincidir`);
    assert(p.indicesOcultos.length > 0, `Nivel ${nivel}: debe tener al menos un hueco`);
    assert(p.indicesOcultos.length <= p.tablaCompleta.length, `Nivel ${nivel}: huecos no exceden filas`);
    assert(typeof p.explicacion === 'string', `Nivel ${nivel}: debe tener explicación`);
  }

  // Verificar validación matemática
  const p = generarPuzzleTipoD(1);
  p.tablaCompleta.forEach((fila, i) => {
    const evaluado = Logica.evaluar(p.expresion, fila.valores);
    assert(evaluado === fila.resultado, `Fila ${i}: resultado calculado debe coincidir con tabla`);
  });

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Tipo D: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Tipo D: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
