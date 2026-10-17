/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo A — Controlador y renderer de puzzles de conjuntos (Diagramas de Venn)
 * Especificación: Sección 2.4 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { generarPuzzleConjuntos } from './generador.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

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
  audio.updateTension({ timer: null });
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

  // Inyectar el diagrama de Venn en SVG y guía paso a paso para los primeros 2 puzzles (Prompt 15)
  const state = getState();
  const currentFw = state.currentFirewall || 0;
  const subnodo = state.puzzlesSolvedInFirewall || 0;
  let guiaTutorialHTML = '';

  if (currentFw === 0 && subnodo === 0) {
    guiaTutorialHTML = `
      <div style="background: rgba(0, 255, 65, 0.08); border-left: 3px solid var(--green-bright); padding: 10px 14px; margin-bottom: 12px; font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); text-align: left; border-radius: 2px;">
        <strong style="color: var(--green-bright); font-size: 11px; letter-spacing: 0.05em;">💡 TUTORIAL PASO A PASO // GUÍA 1 DE 2:</strong><br>
        ▸ <strong>Paso 1:</strong> Lee el enunciado y observa los números ubicados en cada región de los círculos.<br>
        ▸ <strong>Paso 2:</strong> Si la operación es <strong>(A ∩ B)</strong>, busca los números que comparten ambos círculos en el centro.<br>
        ▸ <strong>Paso 3:</strong> Haz clic en el botón de abajo con el conjunto exacto para descifrar el subnodo.
      </div>
    `;
  } else if (currentFw === 0 && subnodo === 1) {
    guiaTutorialHTML = `
      <div style="background: rgba(0, 229, 255, 0.08); border-left: 3px solid var(--cyan); padding: 10px 14px; margin-bottom: 12px; font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); text-align: left; border-radius: 2px;">
        <strong style="color: var(--cyan); font-size: 11px; letter-spacing: 0.05em;">💡 TUTORIAL PASO A PASO // GUÍA 2 DE 2:</strong><br>
        ▸ <strong>Paso 1:</strong> Atención a operaciones de diferencia: <strong>(A − B)</strong> son elementos que están en A pero NO en B.<br>
        ▸ <strong>Paso 2:</strong> Descarta las opciones que incluyan números del otro círculo o de la zona central.<br>
        ▸ <strong>Paso 3:</strong> Al resolver este y el siguiente subnodo, ¡vulnerarás completamente el Firewall Alpha!
      </div>
    `;
  }

  elBody.innerHTML = guiaTutorialHTML + puzzleActual.svg;

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

  // Iniciar cuenta regresiva (oculta en Modo Ghost Protocol - Prompt 19)
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
        if (segundosRestantes <= 10) {
          elTimer.classList.add('critical');
        }
      }
      audio.updateTension({ timer: segundosRestantes });

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

  const rect = (botonSeleccionado && typeof botonSeleccionado.getBoundingClientRect === 'function')
    ? botonSeleccionado.getBoundingClientRect()
    : null;
  const coords = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;

  if (esCorrecto) {
    botonSeleccionado.classList.add('correct');

    // Registrar acierto en el estado global
    const pts = registerCorrect({ timeMs, usedHint: false });
    puzzleActual._puntosObtenidos = pts;

    // Disparar feedback sonoro y partículas (Prompt 11 & 13)
    feedbackSuccess(pts, puzzleActual.explicacion, coords);

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

    // Disparar feedback de error sonoro y partículas glitch (Prompt 11 & 13)
    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      const curFailures = getState().consecutiveFailures || 0;
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>✖ FALLO DE SEGURIDAD // INTEGRIDAD REDUCIDA (-20%)</strong><br>
        <span>${puzzleActual.explicacion}</span>
        ${curFailures >= 2 ? `
          <div style="margin-top: 10px; padding: 8px 12px; background: rgba(255,184,0,0.12); border: 1px solid var(--yellow-warn); border-radius: 4px; color: var(--yellow-warn); font-size: 11px; text-align: left;">
            <strong>💡 PISTA AUTOMÁTICA DEL SISTEMA (2 fallos consecutivos):</strong><br>
            Identifica primero qué números están en la región compartida central (intersección) y descarta las respuestas que los mezclen erróneamente.
          </div>
        ` : ''}
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
