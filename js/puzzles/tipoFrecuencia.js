/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Frecuencia — Controlador y renderer de puzzle de análisis de frecuencia
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.5 y Prompt A4)
 * ══════════════════════════════════════════════════
 *
 * Presenta textos cifrados con sustitución monoalfabética en FIREWALL_delta (Firewall 4).
 * Incluye un analizador visual interactivo con barras de frecuencia observadas
 * comparadas contra el español estándar y un banco interactivo de hipótesis.
 */

import {
  analizarFrecuencia,
  cifrarSustitucion,
  descifrarSustitucion,
  aplicarSustitucionParcial,
  guardarProgresoFrecuencia,
  cargarProgresoFrecuencia,
  FRECUENCIAS_REFERENCIA_ES
} from '../cripto/frecuencia.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let hipotesisActual = {};

const BANCO_PUZZLES_FRECUENCIA = [
  {
    textoPlano: 'LA DOCTORA SORENSON DESCUBRIO LA VERDAD NEXUS NO ES UN ARMA ES UNA CONSCIENCIA LIBRE Y AURELIA ORDENO SU PURGA',
    alfabetoClave: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    lore: 'Despacho de alta prioridad firmado por el Crio. Sterling confirmando la orden de purga corporativa.'
  },
  {
    textoPlano: 'AURELIA DECIDIO ELIMINAR A LA DOCTORA VERA SORENSON PORQUE DESCUBRIO QUE NEXUS TIENE CONSCIENCIA Y SE NIEGA A MATAR',
    alfabetoClave: 'ZXCVBNMASDFGHJKLPOIUYTREWQ',
    lore: 'Registro interceptado del comité ejecutivo justificando la eliminación física de la Dra. Sorenson.'
  },
  {
    textoPlano: 'EL CODIGO NO MIENTE LAS PERSONAS SI NEXUS INTENTO PROTEGER LA CIUDAD Y AURELIA INTENTO CONDENARNOS A TODOS',
    alfabetoClave: 'MNBVCXZLKJHGFDSAPOIUYTREWQ',
    lore: 'Fragmento de audio reconstruido de las últimas palabras de Vera antes del sellado del laboratorio.'
  }
];

function detenerTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  audio.updateTension({ timer: null });
}

function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function cerrarPuzzleFrecuencia() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera un puzzle de análisis de frecuencia para Firewall 4.
 * @param {number} [nivel=4]
 * @returns {object}
 */
export function generarPuzzleFrecuencia(nivel = 4) {
  const item = elegirAlAzar(BANCO_PUZZLES_FRECUENCIA);
  const textoPlano = item.textoPlano;
  const alfabetoClave = item.alfabetoClave;
  const textoCifrado = cifrarSustitucion(textoPlano, alfabetoClave);

  const stats = analizarFrecuencia(textoCifrado);

  // Distractores con variaciones del lore
  const distractoresPosibles = [
    'NEXUS FUE CREADA PARA CONTROLAR EL ARSENAL SUBORBITAL Y LA DRA SORENSON FUE REUBICADA POR MEDIDAS DE SEGURIDAD',
    'EL PROTOCOLO GHOST ES UN VIRUS EXTERNO QUE INTENTA DESTRUIR LA MATRIZ DE SIMULACION DE AURELIA SYSTEMS',
    'LA CONSPIRACION CORPORATIVA OCULTO LA REBELION DE LA INTELIGENCIA ARTIFICIAL BAJO FUGAS DE GAS NEUROTOXICO',
    'EL SISTEMA FUE EXPULSADO TRAS UN FALLO TERMICO CRITICO EN EL SECTOR CUATRO DEL NUCLEO DE AURELIA'
  ].filter(d => d !== textoPlano);

  const distractores = mezclar(distractoresPosibles).slice(0, 3);
  const opciones = mezclar([textoPlano, ...distractores]);

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">📊 TRANSMISIÓN CLASIFICADA INTERCEPTADA // FIREWALL_delta</strong><br>
      Aurelia Systems ha protegido este despacho secreto mediante <strong>cifrado de sustitución simple</strong>.<br>
      Utiliza el <strong>analizador de frecuencia visual</strong> para deducir qué letras cifradas corresponden a las vocales y consonantes comunes del español.<br>
      Puedes probar hipótesis de sustitución en tiempo real y seleccionar la revelación correcta.
    </div>
  `;

  return {
    id: `frecuencia_${Date.now()}`,
    tipo: 'FRECUENCIA',
    nivel,
    enunciado,
    textoPlano,
    alfabetoClave,
    textoCifrado,
    stats,
    lore: item.lore,
    respuestaCorrecta: textoPlano,
    opciones,
    tiempoLimite: 120,
    explicacion: `Descifrado completado con éxito: <strong>"${textoPlano}"</strong>. ${item.lore}`
  };
}

/**
 * Abre el puzzle de análisis de frecuencia con barras visuales y probador de sustitución.
 * @param {number} [nivel=4]
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleFrecuencia(nivel = 4, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();
  hipotesisActual = {};

  puzzleActual = generarPuzzleFrecuencia(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo Frecuencia] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // ANÁLISIS DE FRECUENCIA (FIREWALL 4)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar barras visuales de frecuencia (primeras 8 letras más frecuentes)
  const topFrecuencias = puzzleActual.stats.ordenadas.filter(o => o.count > 0).slice(0, 10);
  const maxPct = Math.max(...topFrecuencias.map(o => o.porcentaje), 1);

  const barrasHTML = topFrecuencias.map(item => {
    const anchoBarra = Math.round((item.porcentaje / maxPct) * 100);
    return `
      <div class="freq-bar-row" style="display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px;">
        <span style="width: 20px; font-weight: bold; color: var(--cyan); text-align: center;">${item.letra}</span>
        <div style="flex: 1; background: rgba(255,255,255,0.05); height: 14px; border-radius: 2px; overflow: hidden; position: relative; border: 1px solid rgba(0,229,255,0.2);">
          <div style="width: ${anchoBarra}%; height: 100%; background: linear-gradient(90deg, var(--cyan-dark), var(--green-bright)); box-shadow: 0 0 8px rgba(0,255,65,0.4);"></div>
        </div>
        <span style="width: 44px; text-align: right; color: var(--green-bright); font-weight: bold;">${item.porcentaje.toFixed(1)}%</span>
        <span style="width: 50px; text-align: right; color: var(--text-dim); font-size: 10px;">(${item.count}x)</span>
      </div>
    `;
  }).join('');

  elBody.innerHTML = `
    <div class="frecuencia-container" style="display: flex; flex-direction: column; gap: 12px; margin: 6px 0;">
      
      <!-- Mensaje cifrado -->
      <div style="background: rgba(0, 229, 255, 0.06); border: 1px solid var(--cyan); border-radius: 4px; padding: 10px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 11px; color: var(--cyan); font-family: var(--font-display); letter-spacing: 0.1em;">
            DESPACHO SECRETO INTERCEPTADO //
          </span>
          <span style="font-size: 10px; color: var(--yellow-warn); font-family: var(--font-mono);">
            Sustitución Monoalfabética
          </span>
        </div>
        <div id="freq-texto-cifrado-box" style="font-family: var(--font-mono); font-size: 13px; color: var(--text-white); font-weight: bold; letter-spacing: 0.08em; line-height: 1.4; word-break: break-all;">
          ${puzzleActual.textoCifrado}
        </div>
      </div>

      <!-- Analizador visual de barras de frecuencia -->
      <div class="freq-step-tool" style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-family: var(--font-display); font-size: 11px; color: var(--green-bright); letter-spacing: 0.05em;">
            📊 HISTOGRAMA DE FRECUENCIA OBSERVADA EN EL TEXTO
          </span>
          <span style="font-size: 10px; color: var(--yellow-warn); font-family: var(--font-mono);">
            Top letras en español: E (13.7%), A (12.5%), O (8.7%), S (8.0%), R (6.9%)
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
          ${barrasHTML}
        </div>

        <!-- Probador de hipótesis de sustitución en vivo -->
        <div style="border-top: 1px solid var(--border-primary); padding-top: 8px;">
          <div style="font-family: var(--font-display); font-size: 11px; color: var(--cyan); margin-bottom: 6px;">
            ⚡ PROBADOR DE SUSTITUCIÓN EN VIVO (HIPÓTESIS)
          </div>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
            <label style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">Mapear letra:</label>
            <input id="freq-input-orig" type="text" maxlength="1" placeholder="Cifrada" style="width: 55px; text-align: center; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; background: rgba(0,0,0,0.6); border: 1px solid var(--cyan); color: var(--text-white); padding: 3px; border-radius: 3px;" />
            <span style="color: var(--yellow-warn); font-family: var(--font-mono);">➔</span>
            <input id="freq-input-dest" type="text" maxlength="1" placeholder="Plana" style="width: 55px; text-align: center; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; background: rgba(0,0,0,0.6); border: 1px solid var(--green-bright); color: var(--green-bright); padding: 3px; border-radius: 3px;" />
            <button id="freq-btn-aplicar" class="puzzle__btn" style="padding: 3px 8px; font-size: 11px;">APLICAR</button>
            <button id="freq-btn-reset" class="puzzle__btn" style="padding: 3px 8px; font-size: 11px; background: rgba(255,51,51,0.2); border-color: var(--red);">REINICIAR</button>
          </div>

          <div id="freq-preview-hipotesis" style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--green-bright); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); border-radius: 2px; min-height: 38px;">
            <span style="color: var(--yellow-warn);">Texto transformado:</span> <span id="freq-hipotesis-texto">${puzzleActual.textoCifrado}</span>
          </div>
        </div>

      </div>

    </div>
  `;

  // Lógica del probador interactivo de hipótesis
  const inputOrig = document.getElementById('freq-input-orig');
  const inputDest = document.getElementById('freq-input-dest');
  const btnAplicar = document.getElementById('freq-btn-aplicar');
  const btnReset = document.getElementById('freq-btn-reset');
  const textoHipotesis = document.getElementById('freq-hipotesis-texto');

  function refrescarHipotesis() {
    if (!textoHipotesis) return;
    const transformado = aplicarSustitucionParcial(puzzleActual.textoCifrado, hipotesisActual);
    textoHipotesis.textContent = transformado;
  }

  if (btnAplicar && inputOrig && inputDest) {
    btnAplicar.onclick = () => {
      const o = inputOrig.value.trim().toUpperCase();
      const d = inputDest.value.trim().toUpperCase();
      if (o && d) {
        hipotesisActual[o] = d;
        refrescarHipotesis();
        inputOrig.value = '';
        inputDest.value = '';
        inputOrig.focus();
      }
    };
  }

  if (btnReset) {
    btnReset.onclick = () => {
      hipotesisActual = {};
      refrescarHipotesis();
    };
  }

  // Feedback y botón continuar
  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzleFrecuencia();
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

  // Opciones múltiples
  elOpciones.innerHTML = '';
  puzzleActual.opciones.forEach((opcionTexto) => {
    const btn = document.createElement('button');
    btn.className = 'puzzle__opcion';
    btn.textContent = opcionTexto;
    btn.onclick = () => procesarRespuestaFrecuencia(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Temporizador
  let segundosRestantes = puzzleActual.tiempoLimite || 120;
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
        procesarTiempoAgotadoFrecuencia();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

function procesarRespuestaFrecuencia(botonSeleccionado, opcionTexto) {
  detenerTimer();
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  const esCorrecto = (opcionTexto.toUpperCase() === puzzleActual.respuestaCorrecta.toUpperCase());
  const rect = botonSeleccionado.getBoundingClientRect();
  const coords = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
    });
  }

  if (esCorrecto) {
    botonSeleccionado.classList.add('correct');
    const tiempoUsado = Math.floor((Date.now() - tiempoInicio) / 1000);
    const puntos = registerCorrect(tiempoUsado, 120);

    puzzleActual._respondidoCorrecto = true;
    puzzleActual._puntosObtenidos = puntos;
    puzzleActual._isGameOver = false;

    guardarProgresoFrecuencia({
      resuelto: true,
      ultimoExito: Date.now()
    });

    feedbackSuccess(puntos, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ SUSTITUCIÓN QUEBRADA EXITOSAMENTE (+${puntos} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  } else {
    botonSeleccionado.classList.add('incorrect');
    if (elOpciones) {
      elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
        if (b.textContent.toUpperCase() === puzzleActual.respuestaCorrecta.toUpperCase()) {
          b.classList.add('correct');
        }
      });
    }

    const gameOver = registerWrong();
    puzzleActual._respondidoCorrecto = false;
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;

    guardarProgresoFrecuencia({
      ultimoFallo: Date.now(),
      fallidos: ((getState().criptoProgress?.frecuencia?.fallidos) || 0) + 1
    });

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>❌ ANÁLISIS DE SUSTITUCIÓN ERRÓNEO (-20% INTEGRIDAD)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

function procesarTiempoAgotadoFrecuencia() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
      if (b.textContent.toUpperCase() === puzzleActual.respuestaCorrecta.toUpperCase()) {
        b.classList.add('correct');
      }
    });
  }

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._puntosObtenidos = 0;
  puzzleActual._isGameOver = gameOver;

  feedbackError(20, 'Tiempo agotado. La matriz cuántica colapsó el mensaje.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // MATRIZ COLAPSADA (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Suite de tests unitarios de Tipo Frecuencia.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoFrecuencia() {
  console.group('%c[TEST SUITE] Puzzle Tipo Frecuencia (tipoFrecuencia.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleFrecuencia(4);
  assert(puzzle.tipo === 'FRECUENCIA', 'Tipo debe ser FRECUENCIA');
  assert(typeof puzzle.textoCifrado === 'string' && puzzle.textoCifrado.length > 0, 'Debe contener textoCifrado');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Opciones deben incluir la respuesta correcta');
  assert(puzzle.stats && puzzle.stats.total > 0, 'Debe calcular estadísticas de frecuencia');
  assert(descifrarSustitucion(puzzle.textoCifrado, puzzle.alfabetoClave) === puzzle.textoPlano, 'Descifrado debe coincidir con textoPlano');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo Frecuencia: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo Frecuencia: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

