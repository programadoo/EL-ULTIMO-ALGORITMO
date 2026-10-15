/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo A — Controlador y renderer de puzzles de conjuntos (Diagramas de Venn)
 * Especificación: Sección 2.4 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { generarPuzzleConjuntos } from './generador.js';
import { registerCorrect, registerWrong, getState } from '../state.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;

/**
 * Detiene el temporizador actual si está corriendo.
 */
function detenerTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Formatea segundos a MM:SS.
 * @param {number} segundos
 * @returns {string}
 */
function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Cierra el modal del puzzle y limpia el estado del temporizador.
 */
export function cerrarPuzzle() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Abre y renderiza un puzzle de Tipo A (diagrama de Venn) en el overlay.
 * @param {number} [nivel=1] - Nivel de dificultad
 * @param {Function} [onCompletado] - Callback invocado al finalizar: ({ exito, puntos, puzzle }) => void
 */
export function abrirPuzzleTipoA(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;

  // Generar nuevo puzzle con diagrama de Venn
  puzzleActual = generarPuzzleConjuntos(nivel);
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
    console.error('[Tipo A] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  // Configurar encabezado y enunciado
  if (elTipo) {
    elTipo.textContent = `TIPO A // CONJUNTOS (NIVEL ${nivel})`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Inyectar el diagrama de Venn en SVG
  elBody.innerHTML = puzzleActual.svg;

  // Limpiar y resetear feedback y botón siguiente
  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzle();
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

  // Generar botones de opciones
  elOpciones.innerHTML = '';
  puzzleActual.opciones.forEach((opcionTexto) => {
    const btn = document.createElement('button');
    btn.className = 'puzzle__opcion';
    btn.textContent = opcionTexto;
    btn.onclick = () => procesarRespuesta(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Iniciar cuenta regresiva
  let segundosRestantes = puzzleActual.tiempoLimite || 75;
  if (elTimer) {
    elTimer.textContent = formatearTiempo(segundosRestantes);
    elTimer.classList.remove('critical');

    timerInterval = setInterval(() => {
      segundosRestantes--;
      elTimer.textContent = formatearTiempo(segundosRestantes);

      if (segundosRestantes <= 10) {
        elTimer.classList.add('critical');
      }

      if (segundosRestantes <= 0) {
        detenerTimer();
        procesarTiempoAgotado();
      }
    }, 1000);
  }

  // Mostrar el overlay con animación
  overlay.classList.add('active');
}

/**
 * Procesa la selección de una opción por parte del jugador.
 * @param {HTMLButtonElement} botonSeleccionado
 * @param {string} opcionTexto
 */
function procesarRespuesta(botonSeleccionado, opcionTexto) {
  detenerTimer();

  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  // Deshabilitar todas las opciones
  if (elOpciones) {
    const todosBotones = elOpciones.querySelectorAll('.puzzle__opcion');
    todosBotones.forEach(b => (b.disabled = true));
  }

  const esCorrecto = (opcionTexto === puzzleActual.respuestaCorrecta);
  const timeMs = Date.now() - tiempoInicio;
  puzzleActual._respondidoCorrecto = esCorrecto;

  if (esCorrecto) {
    botonSeleccionado.classList.add('correct');

    // Registrar acierto en el estado global
    const pts = registerCorrect({ timeMs, usedHint: false });
    puzzleActual._puntosObtenidos = pts;

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ ACCESO AUTORIZADO // PUZZLE RESUELTO (+${pts} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  } else {
    botonSeleccionado.classList.add('incorrect');

    // Marcar cuál era la correcta
    if (elOpciones) {
      const botones = elOpciones.querySelectorAll('.puzzle__opcion');
      botones.forEach(b => {
        if (b.textContent === puzzleActual.respuestaCorrecta) {
          b.classList.add('correct');
        }
      });
    }

    // Registrar fallo en el estado global
    const gameOver = registerWrong();
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>✖ FALLO DE SEGURIDAD // INTEGRIDAD REDUCIDA (-20%)</strong><br>
        <span>${puzzleActual.explicacion}</span>
        ${gameOver ? '<br><strong style="color:var(--red-alert)">[ALERTA CRÍTICA] ¡Integridad en 0%! Sistema bloqueado.</strong>' : ''}
      `;
    }
  }

  // Habilitar botón continuar
  if (btnNext) {
    btnNext.disabled = false;
    btnNext.textContent = puzzleActual._isGameOver ? 'EXPULSIÓN DEL SISTEMA ▸' : 'CONTINUAR ▸';
    btnNext.focus();
  }
}

/**
 * Se ejecuta cuando se agota el tiempo del puzzle.
 */
function procesarTiempoAgotado() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    const botones = elOpciones.querySelectorAll('.puzzle__opcion');
    botones.forEach(b => {
      b.disabled = true;
      if (b.textContent === puzzleActual.respuestaCorrecta) {
        b.classList.add('correct');
      }
    });
  }

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._isGameOver = gameOver;

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱ TIEMPO AGOTADO // INTRUSIÓN DETECTADA (-20% INTEGRIDAD)</strong><br>
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
