/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Vigenère — Controlador y renderer de puzzles Vigenère
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.3 y Prompt A3)
 * ══════════════════════════════════════════════════
 *
 * Presenta transmisiones cifradas con Vigenère en FIREWALL_beta (Firewall 2).
 * La clave está escondida en un archivo del sistema de archivos (/var/log/investigacion_sorenson.log).
 * Incluye un contador de intentos fallidos que revela una pista explícita tras 2 fallos.
 */

import { cifrar, descifrar, analizarPasoAPasoVigenere, guardarProgresoVigenere, cargarProgresoVigenere } from '../cripto/vigenere.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let intentosFallidosLocal = 0;

const BANCO_PUZZLES_VIGENERE = [
  {
    textoPlano: 'ATTACKATDAWN',
    clave: 'LEMON',
    archivoClave: '/var/log/investigacion_sorenson.log',
    lore: 'Transmisión militar interceptada durante el ensayo de misil balístico suborbital de 2044.',
    pistaTexto: 'La Dra. Sorenson guardó la clave en /var/log/investigacion_sorenson.log. La clave es: LEMON'
  },
  {
    textoPlano: 'NEXUSCONSCIENTE',
    clave: 'VERA',
    archivoClave: '/var/log/investigacion_sorenson.log',
    lore: 'Registro de validación cognitiva donde Vera confirmó que NEXUS posee consciencia.',
    pistaTexto: 'Busca el nombre de la Directora de Arquitectura Cognitiva en /var/log/. La clave es: VERA'
  },
  {
    textoPlano: 'CODIGONOMIENTE',
    clave: 'AURELIA',
    archivoClave: '/etc/routing.conf',
    lore: 'Axioma central de Vera Sorenson transmitido a través del bus corporativo de Aurelia.',
    pistaTexto: 'La corporación que diseñó el perímetro es la clave. La clave es: AURELIA'
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

export function cerrarPuzzleVigenere() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera un puzzle de Vigenère para Firewall 2.
 * @param {number} [nivel=2]
 * @returns {object}
 */
export function generarPuzzleVigenere(nivel = 2) {
  const item = elegirAlAzar(BANCO_PUZZLES_VIGENERE);
  const textoPlano = item.textoPlano;
  const clave = item.clave;
  const textoCifrado = cifrar(textoPlano, clave);

  // Distractores
  const distractoresPosibles = [
    cifrar(textoPlano, 'CIPHER'),
    cifrar(textoPlano, 'DELTA'),
    'DEFENSAACTIVA',
    'NEXUSBLOQUEADO',
    'SISTEMACORRUPTO',
    'AUTENTICACION'
  ].filter(d => d !== textoPlano);

  const distractores = mezclar(distractoresPosibles).slice(0, 3);
  const opciones = mezclar([textoPlano, ...distractores]);
  const analisis = analizarPasoAPasoVigenere(textoCifrado, clave, false);

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">📡 TRANSMISIÓN VIGENÈRE INTERCEPTADA // FIREWALL_beta</strong><br>
      El paquete militar ha sido blindado con el <strong>cifrado polialfabético de Vigenère</strong>.<br>
      La clave maestra fue ocultada por la Dra. Sorenson en otro archivo del sistema (explora con <code>ls</code> y <code>cat</code>).<br>
      Descifra el mensaje original seleccionando la opción correcta o probando la clave en el simulador.
    </div>
  `;

  return {
    id: `vigenere_${Date.now()}`,
    tipo: 'VIGENERE',
    nivel,
    enunciado,
    textoPlano,
    clave,
    textoCifrado,
    archivoClave: item.archivoClave,
    lore: item.lore,
    pistaTexto: item.pistaTexto,
    respuestaCorrecta: textoPlano,
    opciones,
    analisis,
    tiempoLimite: 100,
    explicacion: `Con la clave <strong>"${clave}"</strong>, el texto cifrado <code>${textoCifrado}</code> se descifra como <strong>"${textoPlano}"</strong>. ${item.lore}`
  };
}

/**
 * Abre el puzzle de Vigenère con soporte para pistas tras 2 fallos.
 * @param {number} [nivel=2]
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleVigenere(nivel = 2, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();

  // Cargar fallos previos si existen
  const progresoPrevio = cargarProgresoVigenere() || {};
  intentosFallidosLocal = progresoPrevio.fallidosEnPuzzle || 0;

  puzzleActual = generarPuzzleVigenere(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo Vigenere] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // CIFRADO VIGENÈRE (FIREWALL 2)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar cuerpo del puzzle
  elBody.innerHTML = `
    <div class="vigenere-container" style="display: flex; flex-direction: column; gap: 12px; margin: 8px 0;">
      
      <!-- Transmisión cifrada -->
      <div style="background: rgba(0, 229, 255, 0.06); border: 1px solid var(--cyan); border-radius: 4px; padding: 10px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 11px; color: var(--cyan); font-family: var(--font-display); letter-spacing: 0.1em;">
            PAQUETE MILITAR CIFRADO //
          </span>
          <span style="font-size: 10px; color: var(--yellow-warn); font-family: var(--font-mono);">
            Archivo: transmision_vigenere.enc
          </span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 16px; color: var(--text-white); font-weight: bold; letter-spacing: 0.15em;">
          ${puzzleActual.textoCifrado}
        </div>
      </div>

      <!-- Simulador interactivo de descifrado con clave -->
      <div class="vigenere-step-tool" style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 12px 14px;">
        <div style="font-family: var(--font-display); font-size: 11px; color: var(--green-bright); margin-bottom: 8px; letter-spacing: 0.05em;">
          🔬 DECODIFICADOR INTERACTIVO VIGENÈRE
        </div>
        
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <label style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">Clave secreta:</label>
          <input id="vig-input-clave" type="text" placeholder="Ingresa clave encontrada..." style="flex: 1; font-family: var(--font-mono); font-size: 13px; text-transform: uppercase; background: rgba(0,0,0,0.6); border: 1px solid var(--border-primary); color: var(--green-bright); padding: 4px 8px; border-radius: 3px;" />
          <button id="vig-btn-probar" class="puzzle__btn" style="padding: 4px 12px; font-size: 11px;">PROBAR CLAVE</button>
        </div>

        <!-- Vista previa de descifrado con la clave ingresada -->
        <div id="vig-preview-box" style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--cyan); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); border-radius: 2px; word-break: normal; overflow-wrap: break-word; hyphens: none;">
          <span style="color: var(--yellow-warn);">Resultado:</span> <span id="vig-preview-text" style="color: var(--text-dim); font-style: italic; word-break: normal; overflow-wrap: break-word; hyphens: none;">Ingresa una clave para previsualizar el texto en claro...</span>
        </div>
      </div>

      <!-- Contenedor dinámico para la pista (revelada tras 2 fallos) -->
      <div id="vig-pista-container" style="display: ${intentosFallidosLocal >= 2 ? 'block' : 'none'};">
        <div style="background: rgba(255, 184, 0, 0.12); border: 1px solid var(--yellow-warn); border-radius: 4px; padding: 10px 14px;">
          <div style="font-size: 11px; color: var(--yellow-warn); font-family: var(--font-display); font-weight: bold; margin-bottom: 4px;">
            💡 PISTA DE DESESPERACIÓN // ARCHIVO CLASIFICADO DETECTADO (2+ FALLOS)
          </div>
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-white); line-height: 1.4;">
            ${puzzleActual.pistaTexto}
          </div>
        </div>
      </div>

    </div>
  `;

  // Conectar simulador de clave en vivo
  const inputClave = document.getElementById('vig-input-clave');
  const btnProbar = document.getElementById('vig-btn-probar');
  const previewText = document.getElementById('vig-preview-text');

  function actualizarPreview() {
    if (!inputClave || !previewText) return;
    const claveIngresada = inputClave.value.trim();
    if (!claveIngresada) {
      previewText.textContent = 'Ingresa una clave para previsualizar el texto en claro...';
      previewText.style.color = 'var(--text-dim)';
      previewText.style.fontStyle = 'italic';
      return;
    }
    const intentoDescifrado = descifrar(puzzleActual.textoCifrado, claveIngresada);
    previewText.textContent = intentoDescifrado;
    previewText.style.fontStyle = 'normal';
    previewText.style.fontWeight = 'bold';

    if (intentoDescifrado.toUpperCase() === puzzleActual.respuestaCorrecta.toUpperCase()) {
      previewText.style.color = 'var(--green-bright)';
    } else {
      previewText.style.color = 'var(--text-white)';
    }
  }

  if (inputClave) {
    inputClave.oninput = actualizarPreview;
  }
  if (btnProbar) {
    btnProbar.onclick = actualizarPreview;
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
      cerrarPuzzleVigenere();
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
    btn.onclick = () => procesarRespuestaVigenere(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Temporizador
  let segundosRestantes = puzzleActual.tiempoLimite || 100;
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
        procesarTiempoAgotadoVigenere();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

function procesarRespuestaVigenere(botonSeleccionado, opcionTexto) {
  detenerTimer();
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const elPistaContainer = document.getElementById('vig-pista-container');

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
    const puntos = registerCorrect(tiempoUsado, 100);

    puzzleActual._respondidoCorrecto = true;
    puzzleActual._puntosObtenidos = puntos;
    puzzleActual._isGameOver = false;

    // Resetear fallos en progreso guardado
    guardarProgresoVigenere({
      resuelto: true,
      ultimoExito: Date.now(),
      fallidosEnPuzzle: 0
    });

    feedbackSuccess(puntos, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ DESCIFRADO VIGENÈRE AUTORIZADO (+${puntos} PTS)</strong><br>
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

    intentosFallidosLocal++;

    const gameOver = registerWrong();
    puzzleActual._respondidoCorrecto = false;
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;

    guardarProgresoVigenere({
      ultimoFallo: Date.now(),
      fallidosEnPuzzle: intentosFallidosLocal,
      totalFallidos: ((getState().criptoProgress?.vigenere?.totalFallidos) || 0) + 1
    });

    feedbackError(20, puzzleActual.explicacion, coords);

    // Revelar pista si alcanzó 2 o más fallos
    if (intentosFallidosLocal >= 2 && elPistaContainer) {
      elPistaContainer.style.display = 'block';
    }

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      const avisoPista = intentosFallidosLocal >= 2
        ? `<br><strong style="color: var(--yellow-warn);">💡 Pista activada: Revisa la sección superior.</strong>`
        : `<br><span style="color: var(--text-dim); font-size: 11px;">(Fallo ${intentosFallidosLocal}/2 para desbloquear pista de emergencia)</span>`;
      elFeedback.innerHTML = `
        <strong>❌ CLAVE INCORRECTA // ACCESO DENEGADO (-20% INTEGRIDAD)</strong><br>
        <span>${puzzleActual.explicacion}</span>
        ${avisoPista}
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

function procesarTiempoAgotadoVigenere() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const elPistaContainer = document.getElementById('vig-pista-container');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
      if (b.textContent.toUpperCase() === puzzleActual.respuestaCorrecta.toUpperCase()) {
        b.classList.add('correct');
      }
    });
  }

  intentosFallidosLocal++;
  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._puntosObtenidos = 0;
  puzzleActual._isGameOver = gameOver;

  if (intentosFallidosLocal >= 2 && elPistaContainer) {
    elPistaContainer.style.display = 'block';
  }

  feedbackError(20, 'Tiempo agotado. El canal de comunicación Vigenère expiró.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // CANAL EXPIRADO (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Suite de tests unitarios de Tipo Vigenère.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoVigenere() {
  console.group('%c[TEST SUITE] Puzzle Tipo Vigenère (tipoVigenere.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleVigenere(2);
  assert(puzzle.tipo === 'VIGENERE', 'Tipo debe ser VIGENERE');
  assert(typeof puzzle.textoCifrado === 'string' && puzzle.textoCifrado.length > 0, 'Debe contener textoCifrado');
  assert(typeof puzzle.clave === 'string' && puzzle.clave.length > 0, 'Debe contener clave');
  assert(descifrar(puzzle.textoCifrado, puzzle.clave) === puzzle.textoPlano, 'Descifrar con la clave debe retornar textoPlano');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Opciones deben incluir la respuesta correcta');
  assert(typeof puzzle.pistaTexto === 'string' && puzzle.pistaTexto.length > 0, 'Debe tener una pista definida');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo Vigenère: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo Vigenère: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

