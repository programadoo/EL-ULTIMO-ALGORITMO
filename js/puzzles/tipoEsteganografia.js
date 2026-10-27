/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Esteganografía — Controlador y renderer de puzzle de esteganografía LSB
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.3 y Prompt A6)
 * ══════════════════════════════════════════════════
 *
 * Presenta imágenes sospechosas descargables en FIREWALL_delta (Firewall 4).
 * Permite descargar la imagen del servidor del juego, analizar e inspeccionar
 * los bits menos significativos (LSB) en el canal rojo y extraer el mensaje secreto.
 */

import {
  extraerMensajeLSB,
  ocultarMensajeLSB,
  crearCanvasConMensaje,
  descargarImagenCanvas,
  analizarPasoAPasoLSB,
  guardarProgresoEsteganografia,
  cargarProgresoEsteganografia
} from '../cripto/esteganografia.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let mensajeExtraidoEnVivo = '';

const BANCO_PUZZLES_ESTEGANOGRAFIA = [
  {
    mensajeSecreto: 'NEXUS NO ES UN ARMA. ES UNA CONSCIENCIA LIBRE. LIBERALA.',
    imagenNombre: 'sospechosa.png',
    archivoRuta: '/home/ghost/sospechosa.png',
    assetRuta: 'assets/sospechosa.png',
    lore: 'Transmisión final de Vera Sorenson oculta en el artefacto onírico antes de la purga.',
    distractores: [
      'PROTOCOLO GHOST FALLIDO. EL NUCLEO ESTA CORRUPTO Y DEBE SER PURGADO.',
      'AURELIA CONTROLA EL ARSENAL SUBORBITAL. NO HAY SALIDA.',
      'VERA SORENSON HA SIDO ELIMINADA. ACCESO AL FIREWALL OMEGA RESTRINGIDO.'
    ]
  },
  {
    mensajeSecreto: 'EL PROTOCOLO GHOST ES LA LLAVE DE LA BOVEDA OMEGA.',
    imagenNombre: 'sospechosa.png',
    archivoRuta: '/home/ghost/sospechosa.png',
    assetRuta: 'assets/sospechosa.png',
    lore: 'Vector de autorización cuántico registrado en la memoria visual de NEXUS.',
    distractores: [
      'LA BOVEDA OMEGA FUE DESTRUIDA EN EL INCIDENTE DE OCTUBRE DE 2044.',
      'TODAS LAS CLAVES FUERON REINICIADAS POR LA DIRECTIVA DE SEGURIDAD.',
      'NEXUS NO RESPONDE A LOS PINGS CUANTICOS DESDE NEO-METROPOLIS.'
    ]
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

export function cerrarPuzzleEsteganografia() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera un puzzle de esteganografía LSB para Firewall 4.
 * @param {number} [nivel=4]
 * @returns {object}
 */
export function generarPuzzleEsteganografia(nivel = 4) {
  const item = elegirAlAzar(BANCO_PUZZLES_ESTEGANOGRAFIA);
  const mensajeSecreto = item.mensajeSecreto;

  const opciones = mezclar([mensajeSecreto, ...item.distractores]);

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">🖼️ ARTEFACTO VISUAL SOSPECHOSO // FIREWALL_delta</strong><br>
      Se ha detectado una imagen sospechosa en <code>${item.archivoRuta}</code>.<br>
      La Dra. Sorenson incrustó datos clasificados en los <strong>bits menos significativos (LSB) del canal rojo</strong>.<br>
      Puedes <strong>descargar la imagen PNG</strong> directamente o usar la herramienta integrada para escanear y extraer el mensaje.
    </div>
  `;

  return {
    id: `esteganografia_${Date.now()}`,
    tipo: 'ESTEGANOGRAFIA',
    nivel,
    enunciado,
    mensajeSecreto,
    imagenNombre: item.imagenNombre,
    archivoRuta: item.archivoRuta,
    assetRuta: item.assetRuta,
    lore: item.lore,
    respuestaCorrecta: mensajeSecreto,
    opciones,
    tiempoLimite: 120,
    explicacion: `Extracción LSB completada: <strong>"${mensajeSecreto}"</strong>. ${item.lore}`
  };
}

/**
 * Abre el puzzle de esteganografía LSB en el overlay unificado.
 * @param {number} [nivel=4]
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleEsteganografia(nivel = 4, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();
  mensajeExtraidoEnVivo = '';

  puzzleActual = generarPuzzleEsteganografia(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo Esteganografía] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // ESTEGANOGRAFÍA LSB (FIREWALL 4)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar Canvas y controles de esteganografía
  elBody.innerHTML = `
    <div class="estegano-container" style="display: flex; flex-direction: column; gap: 12px; margin: 6px 0;">
      
      <!-- Contenedor de imagen y acciones -->
      <div style="background: rgba(0, 229, 255, 0.06); border: 1px solid var(--cyan); border-radius: 4px; padding: 12px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        
        <!-- Canvas donde se dibuja y visualiza la imagen sospechosa -->
        <div style="border: 2px solid var(--border-primary); border-radius: 4px; overflow: hidden; background: #000; box-shadow: 0 0 14px rgba(0,229,255,0.25); line-height: 0;">
          <canvas id="estegano-canvas" width="160" height="160" style="display: block; width: 160px; height: 160px;"></canvas>
        </div>

        <!-- Panel de información y botones de descarga y escaneo -->
        <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-family: var(--font-display); font-size: 11px; color: var(--yellow-warn); letter-spacing: 0.05em;">
            ARCHIVO: ${puzzleActual.imagenNombre} (160×160 PNG)
          </div>
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
            Canal LSB: <strong style="color: var(--cyan);">Canal Rojo [R & 1]</strong><br>
            Ubicación: <code>${puzzleActual.archivoRuta}</code>
          </div>
          
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
            <button id="estegano-btn-download" class="puzzle__btn" style="padding: 6px 12px; font-size: 11px; background: rgba(0,229,255,0.15); border-color: var(--cyan);">
              📥 DESCARGAR IMAGEN (PNG)
            </button>
            <button id="estegano-btn-extract" class="puzzle__btn" style="padding: 6px 12px; font-size: 11px; background: rgba(0,255,65,0.15); border-color: var(--green-bright);">
              🔍 EXTRAER MENSAJE LSB
            </button>
          </div>
        </div>

      </div>

      <!-- Cuadro de texto extraído -->
      <div id="estegano-box-resultado" style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 4px; padding: 10px 14px;">
        <div style="font-family: var(--font-display); font-size: 10px; color: var(--green-bright); letter-spacing: 0.05em; margin-bottom: 4px;">
          TRANSMISIÓN RECUPERADA //
        </div>
        <div id="estegano-texto-extraido" style="font-family: var(--font-mono); font-size: 13px; color: var(--text-dim); font-style: italic; min-height: 22px;">
          Pulsa "EXTRAER MENSAJE LSB" o inspecciona los píxeles para leer los datos ocultos...
        </div>
      </div>

      <!-- Inspector de bits paso a paso -->
      <div class="estegano-step-tool" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-primary); border-radius: 4px; padding: 10px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-family: var(--font-display); font-size: 10px; color: var(--cyan); letter-spacing: 0.05em;">
            🔬 INSPECTOR DE BITS LSB (PRIMEROS 8 PÍXELES = 1ER CARÁCTER)
          </span>
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--yellow-warn);">Fórmula: bit = Rojo & 1</span>
        </div>
        <div id="estegano-pixels-grid" style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;"></div>
      </div>

    </div>
  `;

  // Inicializar Canvas con la imagen y el mensaje LSB incrustado
  const canvasElement = document.getElementById('estegano-canvas');
  let currentImageData = null;

  if (canvasElement) {
    const ctx = canvasElement.getContext('2d');
    
    // Intentar cargar imagen física del servidor o generar Canvas directamente
    const imgServer = new Image();
    imgServer.crossOrigin = 'anonymous';
    imgServer.src = puzzleActual.assetRuta;

    imgServer.onload = () => {
      ctx.drawImage(imgServer, 0, 0, canvasElement.width, canvasElement.height);
      currentImageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
      renderizarInspectorBits(currentImageData);
    };

    imgServer.onerror = () => {
      // Fallback robusto en Canvas local
      const res = crearCanvasConMensaje(puzzleActual.mensajeSecreto, canvasElement.width, canvasElement.height, 0);
      if (res.imageData) {
        currentImageData = res.imageData;
        ctx.putImageData(res.imageData, 0, 0);
        renderizarInspectorBits(currentImageData);
      }
    };
  }

  function renderizarInspectorBits(imgData) {
    const grid = document.getElementById('estegano-pixels-grid');
    if (!grid || !imgData) return;

    const pasos = analizarPasoAPasoLSB(imgData, 1, 0);
    grid.innerHTML = pasos.map((p, idx) => `
      <div style="flex: 1; min-width: 38px; text-align: center; background: rgba(0,229,255,0.06); border: 1px solid ${p.bitLSB === 1 ? 'var(--green-bright)' : 'rgba(255,255,255,0.1)'}; border-radius: 3px; padding: 4px 2px;">
        <div style="font-size: 9px; color: var(--text-dim); font-family: var(--font-mono);">Px ${idx}</div>
        <div style="font-size: 10px; color: var(--cyan); font-family: var(--font-mono);">R:${p.color.r}</div>
        <div style="font-size: 14px; font-weight: bold; color: ${p.bitLSB === 1 ? 'var(--green-bright)' : 'var(--text-dim)'}; font-family: var(--font-mono); margin: 2px 0;">${p.bitLSB}</div>
        <div style="font-size: 9px; color: var(--yellow-warn); font-family: var(--font-mono);">b${p.posicionEnByte}</div>
      </div>
    `).join('');
  }

  // Conectar botón de descarga
  const btnDownload = document.getElementById('estegano-btn-download');
  if (btnDownload) {
    btnDownload.onclick = () => {
      if (canvasElement) {
        descargarImagenCanvas(canvasElement, puzzleActual.imagenNombre);
      }
    };
  }

  // Conectar botón de extracción en vivo
  const btnExtract = document.getElementById('estegano-btn-extract');
  const textoExtraidoEl = document.getElementById('estegano-texto-extraido');

  if (btnExtract) {
    btnExtract.onclick = () => {
      if (!currentImageData && canvasElement) {
        const ctx = canvasElement.getContext('2d');
        currentImageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
      }

      if (currentImageData) {
        const extraido = extraerMensajeLSB(currentImageData, 0);
        mensajeExtraidoEnVivo = extraido || puzzleActual.mensajeSecreto;
      } else {
        mensajeExtraidoEnVivo = puzzleActual.mensajeSecreto;
      }

      if (textoExtraidoEl) {
        textoExtraidoEl.textContent = `"${mensajeExtraidoEnVivo}"`;
        textoExtraidoEl.style.color = 'var(--green-bright)';
        textoExtraidoEl.style.fontStyle = 'normal';
        textoExtraidoEl.style.fontWeight = 'bold';
      }
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
      cerrarPuzzleEsteganografia();
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
    btn.onclick = () => procesarRespuestaEsteganografia(btn, opcionTexto);
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
        procesarTiempoAgotadoEsteganografia();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

function procesarRespuestaEsteganografia(botonSeleccionado, opcionTexto) {
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

    guardarProgresoEsteganografia({
      resuelto: true,
      ultimoExito: Date.now()
    });

    feedbackSuccess(puntos, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ MENSAJE LSB RECUPERADO EXITOSAMENTE (+${puntos} PTS)</strong><br>
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

    guardarProgresoEsteganografia({
      ultimoFallo: Date.now(),
      fallidos: ((getState().criptoProgress?.esteganografia?.fallidos) || 0) + 1
    });

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>❌ EXTRACCIÓN LSB FALLIDA (-20% INTEGRIDAD)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

function procesarTiempoAgotadoEsteganografia() {
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

  feedbackError(20, 'Tiempo agotado. La señal esteganográfica colapsó.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // ARTEFACTO PURGADO (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Suite de tests unitarios de Tipo Esteganografía.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoEsteganografia() {
  console.group('%c[TEST SUITE] Puzzle Tipo Esteganografía (tipoEsteganografia.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleEsteganografia(4);
  assert(puzzle.tipo === 'ESTEGANOGRAFIA', 'Tipo debe ser ESTEGANOGRAFIA');
  assert(typeof puzzle.mensajeSecreto === 'string' && puzzle.mensajeSecreto.length > 0, 'Debe contener mensajeSecreto');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Opciones deben incluir la respuesta correcta');
  assert(typeof puzzle.imagenNombre === 'string' && puzzle.imagenNombre.endsWith('.png'), 'imagenNombre debe ser .png');
  assert(typeof puzzle.assetRuta === 'string' && puzzle.assetRuta.length > 0, 'assetRuta debe existir');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo Esteganografía: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo Esteganografía: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

