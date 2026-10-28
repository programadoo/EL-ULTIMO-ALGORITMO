/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Hexadecimal — Controlador y renderer de puzzles hexadecimales
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.4 y Firewall 1)
 * ══════════════════════════════════════════════════
 *
 * Presenta volcados en código hexadecimal (base 16) en FIREWALL_alpha.
 * Incluye una herramienta visual interactiva que muestra la conversión
 * paso a paso (desglose por nibbles y cálculo ASCII). Guarda progreso en localStorage.
 */

import { textoAHex, hexATexto, analizarPasoAPasoHex, guardarProgresoHex } from '../cripto/hex.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let indicePasoActual = 0;

const BANCO_MENSAJES_HEX = [
  {
    texto: 'Hola',
    lore: 'Cadena de bienvenida estándar de los logs de bajo nivel en Aurelia Node-01.'
  },
  {
    texto: 'VERA',
    lore: 'Registro de sesión en memoria no volátil firmado por la Dra. Sorenson.'
  },
  {
    texto: 'NEXUS',
    lore: 'Cadena de inicialización del núcleo neuronal de procesamiento heurístico.'
  },
  {
    texto: 'CLAVE',
    lore: 'Vector de autorización recuperado del subnodo de seguridad perimetral.'
  },
  {
    texto: 'DATOS',
    lore: 'Volcado hexadecimal de telemetría de red interceptado en el puerto 2047.'
  },
  {
    texto: 'CODIGO',
    lore: 'Fragmento del archivo fuente principal de la arquitectura de la IA.'
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

export function cerrarPuzzleHex() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera un puzzle hexadecimal para Firewall 1.
 * @param {number} [nivel=1]
 * @returns {object}
 */
export function generarPuzzleHex(nivel = 1) {
  const item = elegirAlAzar(BANCO_MENSAJES_HEX);
  const textoOriginal = item.texto;
  const codigoHex = textoAHex(textoOriginal, ' ');

  const otrosMensajes = BANCO_MENSAJES_HEX
    .filter(m => m.texto !== textoOriginal)
    .map(m => m.texto);

  const distractores = mezclar(otrosMensajes).slice(0, 3);
  const opciones = mezclar([textoOriginal, ...distractores]);
  const analisis = analizarPasoAPasoHex(textoOriginal);

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">💾 VOLCADO HEXADECIMAL INTERCEPTADO // FIREWALL_alpha</strong><br>
      Los registros de auditoría antiguos de NEXUS utilizan codificación <strong>Hexadecimal (Base 16)</strong>.<br>
      Usa la <strong>herramienta visual de conversión paso a paso</strong> para interpretar los nibbles y descifrar el mensaje legítimo.
    </div>
  `;

  return {
    id: `hex_${Date.now()}`,
    tipo: 'HEX',
    nivel,
    enunciado,
    textoOriginal,
    codigoHex,
    analisis,
    lore: item.lore,
    respuestaCorrecta: textoOriginal,
    opciones,
    tiempoLimite: 90,
    explicacion: `La secuencia hexadecimal <code>${codigoHex}</code> se traduce como <strong>"${textoOriginal}"</strong>. ${item.lore}`
  };
}

/**
 * Abre el puzzle hexadecimal con herramienta visual paso a paso.
 * @param {number} [nivel=1]
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleHex(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();
  indicePasoActual = 0;

  puzzleActual = generarPuzzleHex(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo Hex] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // CÓDIGO HEXADECIMAL (FIREWALL 1)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar herramienta visual paso a paso
  elBody.innerHTML = `
    <div class="hex-container" style="display: flex; flex-direction: column; gap: 12px; margin: 8px 0;">
      
      <!-- Volcado Hexadecimal original -->
      <div style="background: rgba(0, 229, 255, 0.06); border: 1px solid var(--cyan); border-radius: 4px; padding: 10px 14px;">
        <div style="font-size: 11px; color: var(--cyan); font-family: var(--font-display); letter-spacing: 0.1em; margin-bottom: 4px;">
          VOLCADO HEX INTERCEPTADO //
        </div>
        <div style="font-family: var(--font-mono); font-size: 15px; color: var(--text-white); font-weight: bold; letter-spacing: 0.12em; word-break: normal; overflow-wrap: break-word; hyphens: none;">
          ${puzzleActual.codigoHex}
        </div>
      </div>

      <!-- Herramienta visual interactiva paso a paso -->
      <div class="hex-step-tool" style="padding: 12px 14px;">
        <div class="cripto-tabs">
          <button id="hex-tab-mensaje" class="cripto-tab-btn active">PASO A PASO (VOLCADO)</button>
          <button id="hex-tab-lab" class="cripto-tab-btn">SIMULADOR INTERACTIVO (LAB)</button>
        </div>

        <!-- Pestaña 1: Volcado paso a paso -->
        <div id="hex-panel-mensaje">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: var(--font-display); font-size: 11px; color: var(--cyan); letter-spacing: 0.05em;">
              🔬 CONVERSIÓN NIBBLE POR NIBBLE (BASE 16 ➔ ASCII)
            </span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="hex-btn-prev" class="puzzle__btn" style="padding: 2px 8px; font-size: 11px; min-width: 28px;">◀</button>
              <span id="hex-nav-contador" style="font-family: var(--font-mono); font-size: 12px; color: var(--yellow-warn); min-width: 75px; text-align: center;">Byte 1/${puzzleActual.analisis.length}</span>
              <button id="hex-btn-next" class="puzzle__btn" style="padding: 2px 8px; font-size: 11px; min-width: 28px;">▶</button>
            </div>
          </div>
          <div id="hex-paso-card"></div>
        </div>

        <!-- Pestaña 2: Simulador interactivo de nibbles -->
        <div id="hex-panel-lab" style="display: none;">
          <div style="font-family: var(--font-display); font-size: 11px; color: var(--green-bright); margin-bottom: 8px; letter-spacing: 0.05em;">
            ⚡ SIMULADOR: AJUSTA NIBBLES O ESCRIBE UN HEX (00..FF)
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
            <label style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">Hex Byte:</label>
            <input id="hex-lab-input" type="text" maxlength="2" value="48" style="width: 50px; text-align: center; font-family: var(--font-mono); font-size: 14px; background: rgba(0,0,0,0.6); border: 1px solid var(--cyan); color: var(--green-bright); border-radius: 3px; padding: 2px;" />
            <span style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">← Escribe 2 dígitos hex o usa los selectores:</span>
          </div>
          <div id="hex-lab-cards" style="margin-bottom: 8px;"></div>
          <div id="hex-lab-resultado" style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--cyan); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); border-radius: 2px;"></div>
        </div>

      </div>

    </div>
  `;

  function renderizarPasoVisualHex(idx) {
    const paso = puzzleActual.analisis[idx];
    if (!paso) return;

    const elCard = document.getElementById('hex-paso-card');
    const elContador = document.getElementById('hex-nav-contador');
    if (elContador) elContador.textContent = `Byte ${idx + 1}/${puzzleActual.analisis.length}`;
    if (!elCard) return;

    elCard.innerHTML = `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">
            Byte actual: <strong style="color: var(--cyan); font-size: 15px;">0x${paso.hex}</strong>
          </div>
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">
            Binario: <span style="color: var(--green-bright);">${paso.binario}</span>
          </div>
        </div>

        <!-- Desglose visual de los dos nibbles -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          
          <!-- Nibble Alto (x16) -->
          <div class="hex-nibble-card" style="background: rgba(0, 229, 255, 0.08); border: 1px solid var(--cyan);">
            <div style="font-size: 10px; color: var(--cyan); font-family: var(--font-display); letter-spacing: 0.05em;">NIBBLE ALTO (×16^1)</div>
            <div style="font-size: 18px; font-weight: bold; color: var(--text-white); font-family: var(--font-mono); margin: 2px 0;">'${paso.nibbleAlto}' = ${paso.valAlto}</div>
            <div style="font-size: 11px; color: var(--green-bright); font-family: var(--font-mono);">${paso.valAlto} × 16 = <strong>${paso.prodAlto}</strong></div>
          </div>

          <!-- Nibble Bajo (x1) -->
          <div class="hex-nibble-card" style="background: rgba(255, 184, 0, 0.08); border: 1px solid var(--yellow-warn);">
            <div style="font-size: 10px; color: var(--yellow-warn); font-family: var(--font-display); letter-spacing: 0.05em;">NIBBLE BAJO (×16^0)</div>
            <div style="font-size: 18px; font-weight: bold; color: var(--text-white); font-family: var(--font-mono); margin: 2px 0;">'${paso.nibbleBajo}' = ${paso.valBajo}</div>
            <div style="font-size: 11px; color: var(--yellow-warn); font-family: var(--font-mono);">${paso.valBajo} × 1 = <strong>${paso.prodBajo}</strong></div>
          </div>

        </div>

        <!-- Fórmula del total -->
        <div style="background: rgba(0, 0, 0, 0.4); border-left: 3px solid var(--cyan); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); border-radius: 2px;">
          <span style="color: var(--yellow-warn);">Suma Decimal:</span> ${paso.prodAlto} + ${paso.prodBajo} = <strong style="color: var(--green-bright); font-size: 13px;">${paso.ascii}</strong> (Carácter <strong>'${paso.caracter}'</strong>)
        </div>
      </div>
    `;
  }

  // Lógica del simulador interactivo de hex
  let labHexAlto = '4';
  let labHexBajo = '8';

  function actualizarLabHex() {
    const valAlto = parseInt(labHexAlto, 16) || 0;
    const valBajo = parseInt(labHexBajo, 16) || 0;
    const prodAlto = valAlto * 16;
    const prodBajo = valBajo;
    const total = prodAlto + prodBajo;
    const hexStr = (labHexAlto + labHexBajo).toUpperCase();
    const caracter = (total >= 32 && total <= 126) ? String.fromCharCode(total) : `[0x${hexStr}]`;

    const elInput = document.getElementById('hex-lab-input');
    if (elInput) elInput.value = hexStr;

    const elCards = document.getElementById('hex-lab-cards');
    if (elCards) {
      elCards.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="hex-nibble-card" style="background: rgba(0, 229, 255, 0.08); border: 1px solid var(--cyan);">
            <div style="font-size: 10px; color: var(--cyan); font-family: var(--font-display);">NIBBLE ALTO (×16)</div>
            <div style="font-size: 18px; font-weight: bold; color: var(--text-white); font-family: var(--font-mono); margin: 2px 0;">'${labHexAlto}' = ${valAlto}</div>
            <div style="font-size: 11px; color: var(--green-bright); font-family: var(--font-mono);">${valAlto} × 16 = <strong>${prodAlto}</strong></div>
          </div>
          <div class="hex-nibble-card" style="background: rgba(255, 184, 0, 0.08); border: 1px solid var(--yellow-warn);">
            <div style="font-size: 10px; color: var(--yellow-warn); font-family: var(--font-display);">NIBBLE BAJO (×1)</div>
            <div style="font-size: 18px; font-weight: bold; color: var(--text-white); font-family: var(--font-mono); margin: 2px 0;">'${labHexBajo}' = ${valBajo}</div>
            <div style="font-size: 11px; color: var(--yellow-warn); font-family: var(--font-mono);">${valBajo} × 1 = <strong>${prodBajo}</strong></div>
          </div>
        </div>
      `;
    }

    const elRes = document.getElementById('hex-lab-resultado');
    if (elRes) {
      elRes.innerHTML = `
        <span style="color: var(--yellow-warn);">Suma:</span> ${prodAlto} + ${prodBajo} = <strong style="color: var(--green-bright); font-size: 14px;">${total}</strong>
        ➔ Carácter decodificado: <strong style="color: var(--cyan); font-size: 14px;">'${caracter}'</strong> (0x${hexStr})
      `;
    }
  }

  // Pestañas
  const tabMensaje = document.getElementById('hex-tab-mensaje');
  const tabLab = document.getElementById('hex-tab-lab');
  const panelMensaje = document.getElementById('hex-panel-mensaje');
  const panelLab = document.getElementById('hex-panel-lab');

  if (tabMensaje && tabLab && panelMensaje && panelLab) {
    tabMensaje.onclick = () => {
      tabMensaje.classList.add('active');
      tabLab.classList.remove('active');
      panelMensaje.style.display = 'block';
      panelLab.style.display = 'none';
    };
    tabLab.onclick = () => {
      tabLab.classList.add('active');
      tabMensaje.classList.remove('active');
      panelMensaje.style.display = 'none';
      panelLab.style.display = 'block';
      actualizarLabHex();
    };
  }

  const labInput = document.getElementById('hex-lab-input');
  if (labInput) {
    labInput.oninput = (e) => {
      let val = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      if (val.length >= 1) {
        labHexAlto = val[0].toUpperCase();
        labHexBajo = val.length >= 2 ? val[1].toUpperCase() : '0';
        actualizarLabHex();
      }
    };
  }

  // Renderizar primer paso
  renderizarPasoVisualHex(0);

  const btnPrev = document.getElementById('hex-btn-prev');
  const btnNextByte = document.getElementById('hex-btn-next');

  if (btnPrev) {
    btnPrev.onclick = () => {
      indicePasoActual = (indicePasoActual - 1 + puzzleActual.analisis.length) % puzzleActual.analisis.length;
      renderizarPasoVisualHex(indicePasoActual);
    };
  }
  if (btnNextByte) {
    btnNextByte.onclick = () => {
      indicePasoActual = (indicePasoActual + 1) % puzzleActual.analisis.length;
      renderizarPasoVisualHex(indicePasoActual);
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
      cerrarPuzzleHex();
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
    btn.onclick = () => procesarRespuestaHex(btn, opcionTexto);
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
        procesarTiempoAgotadoHex();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

function procesarRespuestaHex(botonSeleccionado, opcionTexto) {
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

    guardarProgresoHex({
      resuelto: true,
      textoDescifrado: puzzleActual.textoOriginal,
      puntosGanados: pts,
      firewall: 'FIREWALL_alpha'
    });

    feedbackSuccess(pts, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ VOLCADO HEXADECIMAL VERIFICADO (+${pts} PTS)</strong><br>
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

    guardarProgresoHex({
      ultimoFallo: Date.now(),
      fallidos: ((getState().criptoProgress?.hex?.fallidos) || 0) + 1
    });

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>❌ VOLCADO HEX CORRUPTO (-20% INTEGRIDAD)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

function procesarTiempoAgotadoHex() {
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

  feedbackError(20, 'Tiempo agotado. El búfer hexadecimal fue purgado.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // BÚFER PURGADO (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Suite de tests unitarios de Tipo Hexadecimal.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoHex() {
  console.group('%c[TEST SUITE] Puzzle Tipo Hexadecimal (tipoHex.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleHex(1);
  assert(puzzle.tipo === 'HEX', 'Tipo debe ser HEX');
  assert(typeof puzzle.codigoHex === 'string' && puzzle.codigoHex.length > 0, 'Debe contener código hexadecimal');
  assert(hexATexto(puzzle.codigoHex) === puzzle.textoOriginal, 'El hex debe decodificar a textoOriginal');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Opciones deben incluir la respuesta correcta');
  assert(puzzle.analisis.length === puzzle.textoOriginal.length, 'Debe tener un paso por cada byte');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo Hexadecimal: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo Hexadecimal: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

