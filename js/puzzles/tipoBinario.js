/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Binario — Controlador y renderer de puzzles binarios
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.4 y Firewall 1)
 * ══════════════════════════════════════════════════
 *
 * Presenta transmisiones en código binario (ceros y unos) en FIREWALL_alpha.
 * Incluye una herramienta visual interactiva que muestra la conversión
 * paso a paso (bit por bit con potencias de 2). Guarda el progreso en localStorage.
 */

import { textoABinario, binarioATexto, analizarPasoAPasoBinario, guardarProgresoBinario } from '../cripto/binario.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let indicePasoActual = 0;

const BANCO_MENSAJES_BINARIOS = [
  {
    texto: 'HOLA',
    lore: 'Protocolo de enlace básico emitido por el centinela perimetral de NEXUS.'
  },
  {
    texto: 'VERA',
    lore: 'Identificador de la Directora de Arquitectura Cognitiva de Aurelia.'
  },
  {
    texto: 'NEXUS',
    lore: 'Núcleo central de procesamiento heurístico y red neuronal autónoma.'
  },
  {
    texto: 'CLAVE',
    lore: 'Fragmento de autorización criptográfica para el subnodo de Firewall 1.'
  },
  {
    texto: 'DATOS',
    lore: 'Volcado de memoria interceptado en el bus perimetral del sistema.'
  },
  {
    texto: 'KERNEL',
    lore: 'Nivel más profundo del sistema operativo de Aurelia Systems Corp.'
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

export function cerrarPuzzleBinario() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera un puzzle binario para Firewall 1.
 * @param {number} [nivel=1]
 * @returns {object}
 */
export function generarPuzzleBinario(nivel = 1) {
  const item = elegirAlAzar(BANCO_MENSAJES_BINARIOS);
  const textoOriginal = item.texto;
  const codigoBinario = textoABinario(textoOriginal, ' ');

  // Generar opciones distractoras plausibles
  const otrosMensajes = BANCO_MENSAJES_BINARIOS
    .filter(m => m.texto !== textoOriginal)
    .map(m => m.texto);

  const distractores = mezclar(otrosMensajes).slice(0, 3);
  const opciones = mezclar([textoOriginal, ...distractores]);
  const analisis = analizarPasoAPasoBinario(textoOriginal);

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">📡 TRANSMISIÓN BINARIA INTERCEPTADA // FIREWALL_alpha</strong><br>
      El canal de auditoría interna de NEXUS transmite paquetes codificados en <strong>ASCII binario (8 bits por carácter)</strong>.<br>
      Usa la <strong>herramienta visual de conversión paso a paso</strong> para decodificar los bits y seleccionar el mensaje legítimo.
    </div>
  `;

  return {
    id: `binario_${Date.now()}`,
    tipo: 'BINARIO',
    nivel,
    enunciado,
    textoOriginal,
    codigoBinario,
    analisis,
    lore: item.lore,
    respuestaCorrecta: textoOriginal,
    opciones,
    tiempoLimite: 90,
    explicacion: `La secuencia binaria decodifica como <strong>"${textoOriginal}"</strong> en ASCII de 8 bits. ${item.lore}`
  };
}

/**
 * Abre el puzzle binario con herramienta visual paso a paso.
 * @param {number} [nivel=1]
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleBinario(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();
  indicePasoActual = 0;

  puzzleActual = generarPuzzleBinario(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo Binario] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // CÓDIGO BINARIO (FIREWALL 1)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar herramienta visual paso a paso
  elBody.innerHTML = `
    <div class="binario-container" style="display: flex; flex-direction: column; gap: 12px; margin: 8px 0;">
      
      <!-- Secuencia binaria completa -->
      <div style="background: rgba(0, 229, 255, 0.06); border: 1px solid var(--cyan); border-radius: 4px; padding: 10px 14px;">
        <div style="font-size: 11px; color: var(--cyan); font-family: var(--font-display); letter-spacing: 0.1em; margin-bottom: 4px;">
          PAQUETE BINARIO INTERCEPTADO //
        </div>
        <div style="font-family: var(--font-mono); font-size: 14px; color: var(--text-white); font-weight: bold; letter-spacing: 0.08em; word-break: normal; overflow-wrap: break-word; hyphens: none;">
          ${puzzleActual.codigoBinario}
        </div>
      </div>

      <!-- Herramienta visual interactiva paso a paso -->
      <div class="bin-step-tool" style="padding: 12px 14px;">
        <div class="cripto-tabs">
          <button id="bin-tab-mensaje" class="cripto-tab-btn active">PASO A PASO (MENSAJE)</button>
          <button id="bin-tab-lab" class="cripto-tab-btn">SIMULADOR INTERACTIVO (LAB)</button>
        </div>

        <!-- Pestaña 1: Mensaje paso a paso -->
        <div id="bin-panel-mensaje">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: var(--font-display); font-size: 11px; color: var(--green-bright); letter-spacing: 0.05em;">
              🔬 CONVERSIÓN BIT POR BIT (BASE 2 ➔ ASCII)
            </span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="bin-btn-prev" class="puzzle__btn" style="padding: 2px 8px; font-size: 11px; min-width: 28px;">◀</button>
              <span id="bin-nav-contador" style="font-family: var(--font-mono); font-size: 12px; color: var(--yellow-warn); min-width: 75px; text-align: center;">Byte 1/${puzzleActual.analisis.length}</span>
              <button id="bin-btn-next" class="puzzle__btn" style="padding: 2px 8px; font-size: 11px; min-width: 28px;">▶</button>
            </div>
          </div>
          <div id="bin-paso-card"></div>
        </div>

        <!-- Pestaña 2: Simulador interactivo / Bit Flipper -->
        <div id="bin-panel-lab" style="display: none;">
          <div style="font-family: var(--font-display); font-size: 11px; color: var(--cyan); margin-bottom: 8px; letter-spacing: 0.05em;">
            ⚡ SIMULADOR: CONMUTA LOS 8 BITS O ESCRIBE UN CARÁCTER
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
            <label style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">Carácter:</label>
            <input id="bin-lab-input" type="text" maxlength="1" value="A" style="width: 44px; text-align: center; font-family: var(--font-mono); font-size: 14px; background: rgba(0,0,0,0.6); border: 1px solid var(--cyan); color: var(--green-bright); border-radius: 3px; padding: 2px;" />
            <span style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">← Escribe aquí o haz clic en los bits:</span>
          </div>
          <div id="bin-lab-bits" style="display: flex; gap: 4px; margin-bottom: 8px;"></div>
          <div id="bin-lab-resultado" style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--cyan); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); border-radius: 2px;"></div>
        </div>

      </div>

    </div>
  `;

  function renderizarPasoVisual(idx) {
    const paso = puzzleActual.analisis[idx];
    if (!paso) return;

    const elCard = document.getElementById('bin-paso-card');
    const elContador = document.getElementById('bin-nav-contador');
    if (elContador) elContador.textContent = `Byte ${idx + 1}/${puzzleActual.analisis.length}`;
    if (!elCard) return;

    const bitsHTML = paso.potencias.map(p => `
      <div class="bin-bit-box ${p.activo ? 'active' : 'inactive'}">
        <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">2^${Math.log2(p.pot)}</div>
        <div style="font-size: 10px; color: var(--cyan); font-family: var(--font-mono); font-weight: bold;">${p.pot}</div>
        <div style="font-size: 16px; font-family: var(--font-mono); font-weight: bold; color: ${p.activo ? 'var(--green-bright)' : 'var(--text-dim)'}; margin: 2px 0;">${p.bit}</div>
        <div style="font-size: 10px; color: ${p.activo ? 'var(--green-bright)' : 'transparent'}; font-family: var(--font-mono);">${p.activo ? '+' + p.pot : '0'}</div>
      </div>
    `).join('');

    elCard.innerHTML = `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">
            Byte actual: <strong style="color: var(--cyan); font-size: 14px;">${paso.binario}</strong>
          </div>
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--yellow-warn);">
            Carácter: <strong style="color: var(--green-bright); font-size: 14px;">'${paso.caracter}'</strong> (ASCII ${paso.ascii})
          </div>
        </div>
        <div style="display: flex; gap: 4px; margin-bottom: 8px;">
          ${bitsHTML}
        </div>
        <div style="background: rgba(0, 0, 0, 0.4); border-left: 3px solid var(--green-bright); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); border-radius: 2px;">
          <span style="color: var(--yellow-warn);">Cálculo:</span> ${paso.ecuacion}
        </div>
      </div>
    `;
  }

  // Lógica del simulador interactivo
  let labBits = [0, 1, 0, 0, 0, 0, 0, 1]; // 'A' (65)
  const POTENCIAS = [128, 64, 32, 16, 8, 4, 2, 1];

  function actualizarLabDesdeBits() {
    let valor = 0;
    POTENCIAS.forEach((pot, i) => {
      if (labBits[i] === 1) valor += pot;
    });
    const caracter = (valor >= 32 && valor <= 126) ? String.fromCharCode(valor) : `[0x${valor.toString(16).toUpperCase()}]`;

    const elInput = document.getElementById('bin-lab-input');
    if (elInput && valor >= 32 && valor <= 126) {
      elInput.value = String.fromCharCode(valor);
    }

    const elBitsCont = document.getElementById('bin-lab-bits');
    if (elBitsCont) {
      elBitsCont.innerHTML = POTENCIAS.map((pot, i) => {
        const activo = labBits[i] === 1;
        return `
          <div data-bit-idx="${i}" class="bin-bit-box ${activo ? 'active' : 'inactive'}" title="Haz clic para conmutar este bit">
            <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">2^${Math.log2(pot)}</div>
            <div style="font-size: 10px; color: var(--cyan); font-family: var(--font-mono); font-weight: bold;">${pot}</div>
            <div style="font-size: 16px; font-family: var(--font-mono); font-weight: bold; color: ${activo ? 'var(--green-bright)' : 'var(--text-dim)'}; margin: 2px 0;">${labBits[i]}</div>
            <div style="font-size: 10px; color: ${activo ? 'var(--green-bright)' : 'transparent'}; font-family: var(--font-mono);">${activo ? '+' + pot : '0'}</div>
          </div>
        `;
      }).join('');

      elBitsCont.querySelectorAll('.bin-bit-box').forEach(box => {
        box.onclick = () => {
          const idx = parseInt(box.getAttribute('data-bit-idx'), 10);
          labBits[idx] = labBits[idx] === 1 ? 0 : 1;
          actualizarLabDesdeBits();
        };
      });
    }

    const elRes = document.getElementById('bin-lab-resultado');
    if (elRes) {
      const sumandos = POTENCIAS.filter((p, i) => labBits[i] === 1);
      const eq = sumandos.length > 0 ? sumandos.join(' + ') : '0';
      elRes.innerHTML = `
        <span style="color: var(--yellow-warn);">Suma:</span> ${eq} = <strong style="color: var(--green-bright); font-size: 14px;">${valor}</strong>
        ➔ Carácter decodificado: <strong style="color: var(--cyan); font-size: 14px;">'${caracter}'</strong>
      `;
    }
  }

  // Manejo de pestañas
  const tabMensaje = document.getElementById('bin-tab-mensaje');
  const tabLab = document.getElementById('bin-tab-lab');
  const panelMensaje = document.getElementById('bin-panel-mensaje');
  const panelLab = document.getElementById('bin-panel-lab');

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
      actualizarLabDesdeBits();
    };
  }

  const labInput = document.getElementById('bin-lab-input');
  if (labInput) {
    labInput.oninput = (e) => {
      const val = e.target.value;
      if (val && val.length > 0) {
        const code = val.charCodeAt(0);
        const bin = code.toString(2).padStart(8, '0');
        labBits = bin.split('').map(b => parseInt(b, 10));
        actualizarLabDesdeBits();
      }
    };
  }

  // Renderizar primer paso
  renderizarPasoVisual(0);

  const btnPrev = document.getElementById('bin-btn-prev');
  const btnNextByte = document.getElementById('bin-btn-next');

  if (btnPrev) {
    btnPrev.onclick = () => {
      indicePasoActual = (indicePasoActual - 1 + puzzleActual.analisis.length) % puzzleActual.analisis.length;
      renderizarPasoVisual(indicePasoActual);
    };
  }
  if (btnNextByte) {
    btnNextByte.onclick = () => {
      indicePasoActual = (indicePasoActual + 1) % puzzleActual.analisis.length;
      renderizarPasoVisual(indicePasoActual);
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
      cerrarPuzzleBinario();
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
    btn.onclick = () => procesarRespuestaBinario(btn, opcionTexto);
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
        procesarTiempoAgotadoBinario();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

function procesarRespuestaBinario(botonSeleccionado, opcionTexto) {
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

    guardarProgresoBinario({
      resuelto: true,
      textoDescifrado: puzzleActual.textoOriginal,
      puntosGanados: pts,
      firewall: 'FIREWALL_alpha'
    });

    feedbackSuccess(pts, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ CÓDIGO BINARIO AUTENTICADO (+${pts} PTS)</strong><br>
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

    guardarProgresoBinario({
      ultimoFallo: Date.now(),
      fallidos: ((getState().criptoProgress?.binario?.fallidos) || 0) + 1
    });

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>❌ DECODIFICACIÓN BINARIA FALLIDA (-20% INTEGRIDAD)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

function procesarTiempoAgotadoBinario() {
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

  feedbackError(20, 'Tiempo agotado. La señal binaria colapsó.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // SEÑAL PERDIDA (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Suite de tests unitarios de Tipo Binario.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoBinario() {
  console.group('%c[TEST SUITE] Puzzle Tipo Binario (tipoBinario.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleBinario(1);
  assert(puzzle.tipo === 'BINARIO', 'Tipo debe ser BINARIO');
  assert(typeof puzzle.codigoBinario === 'string' && puzzle.codigoBinario.length > 0, 'Debe contener código binario');
  assert(binarioATexto(puzzle.codigoBinario) === puzzle.textoOriginal, 'El binario debe decodificar a textoOriginal');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Opciones deben incluir la respuesta correcta');
  assert(puzzle.analisis.length === puzzle.textoOriginal.length, 'Debe tener un paso por cada carácter');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo Binario: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo Binario: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

