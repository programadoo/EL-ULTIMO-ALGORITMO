/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo César — Controlador y renderer de puzzles criptográficos
 * Especificación: SPEC_3AVANZADO.MD (Firewall 1 y Fase C)
 * ══════════════════════════════════════════════════
 *
 * Presenta un subnodo bloqueado con cifrado César en FIREWALL_alpha.
 * El jugador debe encontrar el desplazamiento y descifrar el mensaje
 * mediante análisis heurístico o probando desplazamientos.
 * Guarda todo el progreso en localStorage.
 */

import { cifrar, descifrar, encontrarDesplazamiento, probarTodosDesplazamientos, guardarProgresoCesar } from '../cripto/cesar.js';
import { registerCorrect, registerWrong, getState, update } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;

// Banco de mensajes temáticos de Vera Sorenson y el Firewall 1
const MENSAJES_NARRATIVOS = [
  {
    original: 'EL CODIGO NO MIENTE LAS PERSONAS SI',
    lore: 'Fragmento recuperado de /var/log/vera.txt. La frase distintiva de Vera Sorenson.'
  },
  {
    original: 'LA VERDAD ESTA EN EL FIREWALL CINCO',
    lore: 'Pista clasificada dejada en el código fuente de Aurelia Systems.'
  },
  {
    original: 'PERIMETRO DE AUTENTICACION COMPROMETIDO',
    lore: 'Alerta del kernel tras penetrar el primer anillo defensivo de NEXUS.'
  },
  {
    original: 'NEXUS NO ES UN ERROR ES UNA CONSCIENCIA',
    lore: 'Anotación de investigación confidencial de la Directiva 47.'
  },
  {
    original: 'RECUERDA LA INTERSECCION ENTRE LO QUE TEMES',
    lore: 'Instrucción matemática dejada por la Dra. Sorenson para sus aliados.'
  },
  {
    original: 'AURELIA OCULTA LA CONEXION DEL NUCLEO',
    lore: 'Registro de auditoría interna interceptado en el puerto 2047.'
  }
];

/**
 * Detiene el temporizador del puzzle si está activo.
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
 * Genera un nuevo puzzle de cifrado César.
 * @param {number} [nivel=1]
 * @returns {object}
 */
export function generarPuzzleCesar(nivel = 1) {
  const item = elegirAlAzar(MENSAJES_NARRATIVOS);
  const mensajeOriginal = item.original;

  // Elegir un desplazamiento entre 2 y 24 (evitamos 0 y 26 que no cifran)
  const desplazamientosValidos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const desplazamiento = elegirAlAzar(desplazamientosValidos);

  const mensajeCifrado = cifrar(mensajeOriginal, desplazamiento);

  // Generar opciones con distractores verosímiles
  const distractores = new Set();

  // Distractor 1: descifrado con shift + 1 o - 1
  distractores.add(descifrar(mensajeCifrado, (desplazamiento + 1) % 26));
  distractores.add(descifrar(mensajeCifrado, (desplazamiento + 25) % 26));
  distractores.add(descifrar(mensajeCifrado, (desplazamiento + 3) % 26));

  // Rellenar si hace falta
  for (let d = 1; d < 26; d++) {
    if (distractores.size >= 3) break;
    if (d !== desplazamiento) {
      distractores.add(descifrar(mensajeCifrado, d));
    }
  }

  const opciones = mezclar([mensajeOriginal, ...Array.from(distractores).slice(0, 3)]);

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">🔐 CENTINELA DE FIREWALL_alpha // SUBNODO CIFRADO</strong><br>
      Se ha interceptado una transmisión crucial de la <strong>Dra. Vera Sorenson</strong>, pero el centinela la protegió con un <strong>Cifrado César (ROT-N)</strong>.<br>
      Utiliza el analizador de frecuencia o prueba desplazamientos para descifrar el mensaje legítimo.
    </div>
  `;

  return {
    id: `cesar_${Date.now()}`,
    tipo: 'CESAR',
    nivel,
    enunciado,
    mensajeOriginal,
    desplazamiento,
    mensajeCifrado,
    lore: item.lore,
    respuestaCorrecta: mensajeOriginal,
    opciones,
    tiempoLimite: 90,
    explicacion: `El mensaje fue cifrado con un desplazamiento de <strong>${desplazamiento}</strong> posiciones. Al descifrar: <em>"${mensajeOriginal}"</em>. ${item.lore}`
  };
}

/**
 * Cierra el modal del puzzle César y limpia el temporizador.
 */
export function cerrarPuzzleCesar() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Abre y renderiza el puzzle de Cifrado César en el overlay de la terminal.
 * @param {number} [nivel=1]
 * @param {Function} [onCompletado] - Callback al finalizar ({ exito, puntos, puzzle }) => void
 */
export function abrirPuzzleCesar(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();

  puzzleActual = generarPuzzleCesar(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo Cesar] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  // Encabezado
  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // CIFRADO CÉSAR (FIREWALL 1)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Construir cuerpo del puzzle con herramienta interactiva
  let shiftActual = 3;
  const textoInicial = descifrar(puzzleActual.mensajeCifrado, shiftActual);

  elBody.innerHTML = `
    <div class="cesar-container" style="display: flex; flex-direction: column; gap: 14px; margin: 12px 0;">
      
      <!-- Mensaje cifrado original -->
      <div style="background: rgba(0, 229, 255, 0.06); border: 1px solid var(--cyan); border-radius: 4px; padding: 12px 16px;">
        <div style="font-size: 11px; color: var(--cyan); font-family: var(--font-display); letter-spacing: 0.1em; margin-bottom: 6px;">
          📡 TRANSMISIÓN CIFRADA CAPTURADA //
        </div>
        <div id="cesar-display-cifrado" style="font-family: var(--font-mono); font-size: 15px; color: var(--text-white); font-weight: bold; letter-spacing: 0.08em; word-break: normal; overflow-wrap: break-word; hyphens: none;">
          ${puzzleActual.mensajeCifrado}
        </div>
      </div>

      <!-- Herramienta interactiva de descifrado en vivo -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--yellow-warn);">
            HERRAMIENTA ROT-N // PROBAR DESPLAZAMIENTO:
          </span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="cesar-btn-prev" class="puzzle__btn" style="padding: 4px 10px; font-size: 12px; min-width: 32px;" title="Disminuir desplazamiento">◀</button>
            <span id="cesar-shift-valor" style="font-family: var(--font-mono); font-size: 14px; font-weight: bold; color: var(--green-bright); min-width: 36px; text-align: center;">${shiftActual}</span>
            <button id="cesar-btn-next-shift" class="puzzle__btn" style="padding: 4px 10px; font-size: 12px; min-width: 32px;" title="Aumentar desplazamiento">▶</button>
          </div>
        </div>

        <!-- Slider de apoyo visual -->
        <input type="range" id="cesar-slider" min="0" max="25" value="${shiftActual}" style="width: 100%; margin-bottom: 10px; accent-color: var(--green-bright); cursor: pointer;" aria-label="Selector de desplazamiento">

        <!-- Vista previa en tiempo real -->
        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; font-family: var(--font-mono);">
          VISTA PREVIA CON SHIFT <span id="cesar-preview-shift">${shiftActual}</span>:
        </div>
        <div id="cesar-preview-text" style="font-family: var(--font-mono); font-size: 13px; color: var(--green-bright); background: rgba(0, 255, 65, 0.05); padding: 8px 12px; border-radius: 3px; border: 1px dashed var(--green-dim); word-break: normal; overflow-wrap: break-word; hyphens: none;">
          ${textoInicial}
        </div>

        <!-- Botón de fuerza bruta / análisis automático -->
        <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <button id="cesar-btn-bruteforce" class="puzzle__btn" style="padding: 5px 12px; font-size: 11px; background: rgba(0, 229, 255, 0.1); border-color: var(--cyan); color: var(--cyan);">
            ⚡ EJECUTAR FUERZA BRUTA (TODOS LOS DESPLAZAMIENTOS)
          </button>
        </div>
        <div id="cesar-bruteforce-results" style="display: none; max-height: 120px; overflow-y: auto; margin-top: 8px; font-family: var(--font-mono); font-size: 11px; border: 1px solid var(--border-primary); padding: 6px; background: var(--bg-terminal);"></div>
      </div>

    </div>
  `;

  // Controladores de la herramienta interactiva
  const elSlider = document.getElementById('cesar-slider');
  const elShiftValor = document.getElementById('cesar-shift-valor');
  const elPreviewShift = document.getElementById('cesar-preview-shift');
  const elPreviewText = document.getElementById('cesar-preview-text');
  const btnPrev = document.getElementById('cesar-btn-prev');
  const btnNextShift = document.getElementById('cesar-btn-next-shift');
  const btnBruteforce = document.getElementById('cesar-btn-bruteforce');
  const elBruteforceResults = document.getElementById('cesar-bruteforce-results');

  function actualizarPreview(nuevoShift) {
    shiftActual = ((nuevoShift % 26) + 26) % 26;
    if (elSlider) elSlider.value = shiftActual;
    if (elShiftValor) elShiftValor.textContent = shiftActual;
    if (elPreviewShift) elPreviewShift.textContent = shiftActual;
    if (elPreviewText) {
      elPreviewText.textContent = descifrar(puzzleActual.mensajeCifrado, shiftActual);
    }
  }

  if (elSlider) {
    elSlider.oninput = (e) => actualizarPreview(parseInt(e.target.value, 10));
  }
  if (btnPrev) {
    btnPrev.onclick = () => actualizarPreview(shiftActual - 1);
  }
  if (btnNextShift) {
    btnNextShift.onclick = () => actualizarPreview(shiftActual + 1);
  }

  if (btnBruteforce && elBruteforceResults) {
    btnBruteforce.onclick = () => {
      if (elBruteforceResults.style.display === 'block') {
        elBruteforceResults.style.display = 'none';
        btnBruteforce.textContent = '⚡ EJECUTAR FUERZA BRUTA (TODOS LOS DESPLAZAMIENTOS)';
        return;
      }
      btnBruteforce.textContent = '▲ OCULTAR LISTA DE DESPLAZAMIENTOS';
      const todos = probarTodosDesplazamientos(puzzleActual.mensajeCifrado);
      const mejorMatch = encontrarDesplazamiento(puzzleActual.mensajeCifrado);

      elBruteforceResults.innerHTML = todos.map(item => `
        <div style="padding: 3px 6px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; ${item.desplazamiento === mejorMatch.desplazamiento ? 'background: rgba(0,255,65,0.15); font-weight: bold;' : ''}">
          <span style="color: var(--cyan); min-width: 60px;">Shift ${item.desplazamiento}:</span>
          <span style="color: var(--text-primary); flex: 1; margin: 0 8px; word-break: normal; overflow-wrap: break-word; hyphens: none;">${item.texto}</span>
          <button style="background: transparent; border: 1px solid var(--border-primary); color: var(--yellow-warn); cursor: pointer; padding: 2px 6px; font-size: 10px;" onclick="window.__aplicarShiftCesar(${item.desplazamiento})">Probar</button>
        </div>
      `).join('');
      elBruteforceResults.style.display = 'block';
    };
  }

  // Hook global para botones de prueba rápida
  window.__aplicarShiftCesar = (s) => actualizarPreview(s);

  // Reset feedback y botón siguiente
  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzleCesar();
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

  // Renderizar opciones múltiples
  elOpciones.innerHTML = '';
  puzzleActual.opciones.forEach((opcionTexto) => {
    const btn = document.createElement('button');
    btn.className = 'puzzle__opcion';
    btn.textContent = opcionTexto;
    btn.onclick = () => procesarRespuestaCesar(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Temporizador
  let segundosRestantes = puzzleActual.tiempoLimite || 90;
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
        procesarTiempoAgotadoCesar();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

/**
 * Procesa la respuesta seleccionada por el jugador.
 */
function procesarRespuestaCesar(botonSeleccionado, opcionTexto) {
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

    // Guardar progreso en localStorage y en el state
    guardarProgresoCesar({
      resuelto: true,
      mensajeOriginal: puzzleActual.mensajeOriginal,
      desplazamientoUsado: puzzleActual.desplazamiento,
      puntosGanados: pts,
      firewall: 'FIREWALL_alpha'
    });

    feedbackSuccess(pts, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ SUBNODO DESCIFRADO // DESPLAZAMIENTO ROT-${puzzleActual.desplazamiento} IDENTIFICADO (+${pts} PTS)</strong><br>
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

    // Guardar registro de intento fallido en localStorage
    guardarProgresoCesar({
      ultimoFallo: Date.now(),
      intentosFallidos: ((getState().criptoProgress?.cesar?.intentosFallidos) || 0) + 1
    });

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>❌ DESPLAZAMIENTO INCORRECTO // TRANSMISIÓN CORRUPTA (-20% INTEGRIDAD)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Maneja el evento de tiempo agotado.
 */
function procesarTiempoAgotadoCesar() {
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
  puzzleActual._puntosObtenidos = 0;
  puzzleActual._isGameOver = gameOver;

  feedbackError(20, 'Tiempo agotado. La transmisión se perdió.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // SUBNODO BLOQUEADO (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta pruebas unitarias de generación de puzzles César.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoCesar() {
  console.group('%c[TEST SUITE] Puzzle Tipo César (tipoCesar.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleCesar(1);

  assert(typeof puzzle === 'object' && puzzle !== null, 'generarPuzzleCesar debe retornar un objeto');
  assert(puzzle.tipo === 'CESAR', 'El tipo de puzzle debe ser "CESAR"');
  assert(puzzle.desplazamiento >= 1 && puzzle.desplazamiento <= 25, 'El desplazamiento debe ser entre 1 y 25');
  assert(typeof puzzle.mensajeCifrado === 'string' && puzzle.mensajeCifrado.length > 0, 'Debe generar texto cifrado');
  assert(descifrar(puzzle.mensajeCifrado, puzzle.desplazamiento) === puzzle.mensajeOriginal, 'El mensaje cifrado debe descifrarse exactamente con el desplazamiento asignado');
  assert(puzzle.opciones.length === 4, 'Debe incluir 4 opciones');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Las opciones deben contener la respuesta correcta');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo César: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo César: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

