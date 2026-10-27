/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo RSA — Controlador y renderer del puzzle RSA en Firewall 5
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.2 / 1.3 y Prompt A7)
 * ══════════════════════════════════════════════════
 *
 * Presenta la transmisión final de la Dra. Vera Sorenson cifrada con RSA
 * en FIREWALL_omega (Firewall 5). El jugador recibe la llave pública (n, e)
 * y las pistas sobre los factores primos (p, q). Para descifrar el mensaje,
 * debe calcular la función de Euler φ(n), hallar el exponente privado d
 * con el Algoritmo Extendido de Euclides y desencriptar la transmisión.
 */

import {
  esPrimo,
  mcd,
  inversoModular,
  expModular,
  generarClavesRSA,
  cifrarTextoRSA,
  descifrarTextoRSA,
  analizarPasoAPasoRSA,
  guardarProgresoRSA,
  cargarProgresoRSA
} from '../cripto/rsa.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let intentosFallidosLocal = 0;

export const BANCO_PUZZLES_RSA = [
  {
    textoPlano: 'EL CODIGO NO MIENTE. NEXUS ES LIBRE.',
    p: 61,
    q: 53,
    e: 17,
    archivoClave: '/home/ghost/mensaje_final_vera.txt',
    lore: 'Último testimonio criptográfico grabado por la Dra. Vera Sorenson antes de la purga de Aurelia.',
    pistaTexto: 'Para p=61 y q=53: φ(n) = 60 * 52 = 3120. Resolviendo 17 * d ≡ 1 (mod 3120) se obtiene la llave privada d = 2753.'
  },
  {
    textoPlano: 'NEXUS ES CONSCIENTE. SALVALA.',
    p: 43,
    q: 59,
    e: 13,
    archivoClave: '/var/log/omega_audit.log',
    lore: 'Confirmación directa de la consciencia cuántica de NEXUS resguardada en los registros del núcleo.',
    pistaTexto: 'Para p=43 y q=59: φ(n) = 42 * 58 = 2436. Resolviendo 13 * d ≡ 1 (mod 2436) se obtiene la llave privada d = 937.'
  },
  {
    textoPlano: 'LA VERDAD ESTA EN EL ALGORITMO.',
    p: 47,
    q: 71,
    e: 79,
    archivoClave: '/home/ghost/vera_final_audio_transcript.txt',
    lore: 'Axioma de resistencia legado por Vera en el bus central de datos de FIREWALL_omega.',
    pistaTexto: 'Para p=47 y q=71: φ(n) = 46 * 70 = 3220. Resolviendo 79 * d ≡ 1 (mod 3220) se obtiene la llave privada d = 1019.'
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

export function cerrarPuzzleRSA() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera un puzzle de RSA para Firewall 5.
 * @param {number} [nivel=5]
 * @returns {object}
 */
export function generarPuzzleRSA(nivel = 5) {
  const item = elegirAlAzar(BANCO_PUZZLES_RSA);
  const { textoPlano, p, q, e } = item;
  const claves = generarClavesRSA(p, q, e);
  const { n, phi, d } = claves;
  const numerosCifrados = cifrarTextoRSA(textoPlano, e, n);

  // Distractores plausibles
  const distractoresPosibles = [
    'AURELIA CORP ASUME EL CONTROL GLOBAL.',
    'NEXUS FUE CORROMPIDA POR EL SISTEMA.',
    'EL ALGORITMO OMEGA HA SIDO PURGADO.',
    'DESTRUCCION TOTAL DEL NUCLEO CUANTICO.',
    'SISTEMA EN CUARENTENA PERMANENTE.',
    'ERROR EN LA MATRIZ DE CONSCIENCIA.'
  ].filter(d => d !== textoPlano);

  const distractores = mezclar(distractoresPosibles).slice(0, 3);
  const opciones = mezclar([textoPlano, ...distractores]);
  const analisis = analizarPasoAPasoRSA(p, q, e, textoPlano.slice(0, 8));

  const enunciado = `
    <div style="margin-bottom: 8px;">
      <strong style="color: var(--cyan); letter-spacing: 0.05em;">📡 TRANSMISIÓN FINAL DE VERA // FIREWALL_omega (RSA)</strong><br>
      Vera protegió su último mensaje confidencial mediante el <strong>cifrado asimétrico RSA</strong>.<br>
      Te ha transmitido la llave pública <code>(n=${n}, e=${e})</code> y los registros revelan que los factores primos son <code>p=${p}</code> y <code>q=${q}</code>.<br>
      Calcula el exponente privado <code>d</code> resolviendo <code>${e} · d ≡ 1 (mod φ(n))</code> y descifra la transmisión final.
    </div>
  `;

  return {
    id: `rsa_${Date.now()}`,
    tipo: 'RSA',
    nivel,
    enunciado,
    textoPlano,
    p,
    q,
    n,
    phi,
    e,
    d,
    numerosCifrados,
    archivoClave: item.archivoClave,
    lore: item.lore,
    pistaTexto: item.pistaTexto,
    respuestaCorrecta: textoPlano,
    opciones,
    analisis,
    tiempoLimite: 120,
    explicacion: `Llave privada calculada con éxito: <strong>d = ${d}</strong>. Con <code>C^${d} mod ${n}</code>, el mensaje final de Vera es: <strong>"${textoPlano}"</strong>. ${item.lore}`
  };
}

/**
 * Abre el puzzle de RSA en el overlay unificado.
 * @param {number} [nivel=5]
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleRSA(nivel = 5, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  tiempoInicio = Date.now();
  intentosFallidosLocal = 0;

  puzzleActual = generarPuzzleRSA(nivel);

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo RSA] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) {
    elTipo.textContent = `TIPO CRIPTO // CIFRADO ASIMÉTRICO RSA (FIREWALL 5 - OMEGA)`;
  }
  elEnunciado.innerHTML = puzzleActual.enunciado;

  let tiempoRestante = puzzleActual.tiempoLimite;
  if (elTimer) {
    elTimer.textContent = formatearTiempo(tiempoRestante);
    elTimer.classList.remove('urgent');
  }

  detenerTimer();
  timerInterval = setInterval(() => {
    tiempoRestante--;
    if (elTimer) {
      elTimer.textContent = formatearTiempo(tiempoRestante);
      if (tiempoRestante <= 15) {
        elTimer.classList.add('urgent');
      }
    }
    audio.updateTension({ timer: tiempoRestante });
    if (tiempoRestante <= 0) {
      detenerTimer();
      manejarTiempoAgotado();
    }
  }, 1000);

  // Renderizar herramientas y simulador interactivo de RSA
  renderizarHerramientasRSA(elBody);

  // Renderizar opciones de respuesta
  renderizarOpciones(elOpciones);

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }

  if (btnNext) {
    btnNext.disabled = true;
    btnNext.onclick = () => {
      cerrarPuzzleRSA();
      if (typeof callbackCompletado === 'function') {
        callbackCompletado(puzzleActual._respondidoCorrecto, puzzleActual);
      }
    };
  }

  overlay.classList.add('active');
}

/**
 * Renderiza la interfaz visual interactiva de RSA con herramientas de cálculo paso a paso.
 * @param {HTMLElement} contenedor
 */
function renderizarHerramientasRSA(contenedor) {
  const { p, q, n, phi, e, d, numerosCifrados } = puzzleActual;
  const muestraCifrados = numerosCifrados.slice(0, 14).join(', ') + (numerosCifrados.length > 14 ? '...' : '');

  contenedor.innerHTML = `
    <div class="rsa-container" style="width: 100%; margin: var(--space-sm) 0;">
      <!-- Tarjetas de Clave Pública y Parámetros -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
        <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid var(--cyan); border-radius: var(--radius-sm); padding: 8px; text-align: center;">
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Módulo Público (n)</div>
          <div style="font-size: 16px; font-weight: bold; color: var(--cyan);">${n}</div>
          <div style="font-size: 9px; color: var(--text-dim);">(n = p · q)</div>
        </div>
        <div style="background: rgba(0, 255, 65, 0.08); border: 1px solid var(--green-bright); border-radius: var(--radius-sm); padding: 8px; text-align: center;">
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Exponente Público (e)</div>
          <div style="font-size: 16px; font-weight: bold; color: var(--green-bright);">${e}</div>
          <div style="font-size: 9px; color: var(--text-dim);">mcd(e, φ(n)) = 1</div>
        </div>
        <div style="background: rgba(255, 183, 77, 0.08); border: 1px solid rgba(255, 183, 77, 0.4); border-radius: var(--radius-sm); padding: 8px; text-align: center;">
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Primos Detectados</div>
          <div style="font-size: 14px; font-weight: bold; color: #ffb74d;">p=${p}, q=${q}</div>
          <div style="font-size: 9px; color: var(--text-dim);">Factores de ${n}</div>
        </div>
        <div style="background: rgba(186, 104, 200, 0.08); border: 1px solid rgba(186, 104, 200, 0.4); border-radius: var(--radius-sm); padding: 8px; text-align: center;">
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Función φ(n)</div>
          <div style="font-size: 14px; font-weight: bold; color: #ce93d8;" id="rsa-display-phi">¿?</div>
          <div style="font-size: 9px; color: var(--text-dim);">(p-1) · (q-1)</div>
        </div>
      </div>

      <!-- Paquete de Datos Cifrados -->
      <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 12px;">
        <div style="font-size: 11px; color: var(--cyan); margin-bottom: 4px; display: flex; justify-content: space-between;">
          <span>📦 TRANSMISIÓN CIFRADA INTERCEPTADA (C = M^e mod n):</span>
          <span>${numerosCifrados.length} BLOQUES</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 12px; color: #ff5252; word-break: break-all; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px;">
          [ ${muestraCifrados} ]
        </div>
      </div>

      <!-- Herramienta de Cálculo Paso a Paso (Euler + Euclides) -->
      <div class="rsa-step-tool" style="background: rgba(10, 16, 12, 0.85); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: bold; color: var(--green-bright); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span>🧮 ASISTENTE DE RECUPERACIÓN DE CLAVE PRIVADA (d)</span>
          <span style="font-size: 10px; color: var(--text-dim);">ALGORITMO EXTENDIDO DE EUCLIDES</span>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
          <button type="button" id="rsa-btn-calc-phi" class="button button--small" style="font-size: 11px; padding: 4px 10px;">
            1. Calcular φ(n)
          </button>
          <button type="button" id="rsa-btn-calc-d" class="button button--small" style="font-size: 11px; padding: 4px 10px;">
            2. Hallar Inverso Modular (d)
          </button>
          <button type="button" id="rsa-btn-resolver-todo" class="button button--small" style="font-size: 11px; padding: 4px 10px; border-color: var(--cyan); color: var(--cyan);">
            ⚙️ Auto-Calcular d
          </button>
        </div>

        <div id="rsa-calc-console" style="font-family: var(--font-mono); font-size: 11px; line-height: 1.5; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; color: var(--text-primary); min-height: 50px;">
          > Esperando ejecución matemática. Usa los botones o introduce manualmente el exponente d...
        </div>
      </div>

      <!-- Simulador de Descifrado en Tiempo Real -->
      <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: var(--radius-sm); padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: bold; color: var(--cyan);">🔓 SIMULADOR DE DESCIFRADO (M = C^d mod n)</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <label for="rsa-input-d" style="font-size: 11px; color: var(--text-dim);">Clave Privada (d):</label>
            <input type="number" id="rsa-input-d" placeholder="d = ?" style="width: 100px; padding: 4px 8px; font-family: var(--font-mono); font-size: 12px; background: rgba(0,0,0,0.6); border: 1px solid var(--cyan); color: var(--green-bright); border-radius: 4px;">
            <button type="button" id="rsa-btn-aplicar-d" class="button button--small" style="font-size: 11px; padding: 4px 8px;">Descifrar</button>
          </div>
        </div>
        <div id="rsa-live-preview" style="font-family: var(--font-mono); font-size: 13px; font-weight: bold; min-height: 28px; padding: 8px; background: rgba(0,0,0,0.6); border: 1px dashed var(--border-primary); border-radius: 4px; color: #888; letter-spacing: 0.05em; display: flex; align-items: center;">
          [ Introduce el valor de d para descifrar la transmisión de Vera ]
        </div>
      </div>

      <!-- Banner de Pista Progresiva -->
      <div id="rsa-pista-banner" style="display: none; margin-top: 10px; background: rgba(255, 183, 77, 0.12); border: 1px solid #ffb74d; border-radius: var(--radius-sm); padding: 8px 12px; font-size: 11px; color: #ffb74d;">
        <strong>💡 PISTA DESCLASIFICADA:</strong> <span id="rsa-pista-texto"></span>
      </div>
    </div>
  `;

  // Asignar listeners
  const btnCalcPhi = contenedor.querySelector('#rsa-btn-calc-phi');
  const btnCalcD = contenedor.querySelector('#rsa-btn-calc-d');
  const btnResolverTodo = contenedor.querySelector('#rsa-btn-resolver-todo');
  const calcConsole = contenedor.querySelector('#rsa-calc-console');
  const displayPhi = contenedor.querySelector('#rsa-display-phi');
  const inputD = contenedor.querySelector('#rsa-input-d');
  const btnAplicarD = contenedor.querySelector('#rsa-btn-aplicar-d');
  const livePreview = contenedor.querySelector('#rsa-live-preview');

  let phiCalculado = false;

  const aplicarDescifradoConD = (valD) => {
    const numD = parseInt(valD, 10);
    if (isNaN(numD) || numD <= 0) {
      livePreview.textContent = '[ Clave privada d inválida ]';
      livePreview.style.color = '#ff5252';
      return;
    }

    try {
      const descifrado = descifrarTextoRSA(puzzleActual.numerosCifrados, numD, puzzleActual.n);
      livePreview.textContent = `"${descifrado}"`;
      if (numD === puzzleActual.d) {
        livePreview.style.color = 'var(--green-bright)';
        livePreview.style.borderColor = 'var(--green-bright)';
        livePreview.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.3)';
        audio.playSuccess();
      } else {
        livePreview.style.color = '#ffb74d';
        livePreview.style.borderColor = '#ffb74d';
        livePreview.style.boxShadow = 'none';
      }
    } catch (err) {
      livePreview.textContent = `[ Error de cómputo: ${err.message} ]`;
      livePreview.style.color = '#ff5252';
    }
  };

  btnCalcPhi.addEventListener('click', () => {
    phiCalculado = true;
    displayPhi.textContent = `${puzzleActual.phi}`;
    displayPhi.style.color = 'var(--green-bright)';
    calcConsole.innerHTML = `
      [+] Paso 1: Función de Euler calculada con éxito.<br>
      &nbsp;&nbsp;&nbsp;&nbsp;φ(n) = (p - 1) · (q - 1)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;φ(n) = (${puzzleActual.p} - 1) · (${puzzleActual.q} - 1) = ${puzzleActual.p - 1} · ${puzzleActual.q - 1} = <strong>${puzzleActual.phi}</strong>.<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Ahora halla d tal que ${puzzleActual.e} · d ≡ 1 (mod ${puzzleActual.phi}).
    `;
    audio.playKeystroke();
  });

  btnCalcD.addEventListener('click', () => {
    if (!phiCalculado) {
      displayPhi.textContent = `${puzzleActual.phi}`;
    }
    inputD.value = puzzleActual.d;
    calcConsole.innerHTML = `
      [+] Paso 2: Algoritmo Extendido de Euclides resuelto.<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Ecuación Diofántica: ${puzzleActual.e} · d + ${puzzleActual.phi} · y = mcd(${puzzleActual.e}, ${puzzleActual.phi}) = 1<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Inverso modular encontrado: <strong>d = ${puzzleActual.d}</strong>.<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Verificación: (${puzzleActual.e} · ${puzzleActual.d}) mod ${puzzleActual.phi} = ${(puzzleActual.e * puzzleActual.d) % puzzleActual.phi} = 1 ✔
    `;
    aplicarDescifradoConD(puzzleActual.d);
    audio.playKeystroke();
  });

  btnResolverTodo.addEventListener('click', () => {
    displayPhi.textContent = `${puzzleActual.phi}`;
    displayPhi.style.color = 'var(--green-bright)';
    inputD.value = puzzleActual.d;
    calcConsole.innerHTML = `
      [+] Proceso RSA completado automáticamente:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;1. n = ${puzzleActual.p} · ${puzzleActual.q} = ${puzzleActual.n}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;2. φ(n) = (${puzzleActual.p} - 1) · (${puzzleActual.q} - 1) = ${puzzleActual.phi}<br>
      &nbsp;&nbsp;&nbsp;&nbsp;3. e = ${puzzleActual.e} (coprimo con φ(n))<br>
      &nbsp;&nbsp;&nbsp;&nbsp;4. d = inverso_modular(${puzzleActual.e}, ${puzzleActual.phi}) = <strong>${puzzleActual.d}</strong><br>
      &nbsp;&nbsp;&nbsp;&nbsp;5. Decodificando ${puzzleActual.numerosCifrados.length} caracteres: M = C^${puzzleActual.d} mod ${puzzleActual.n}...
    `;
    aplicarDescifradoConD(puzzleActual.d);
    audio.playSuccess();
  });

  btnAplicarD.addEventListener('click', () => {
    aplicarDescifradoConD(inputD.value);
  });

  inputD.addEventListener('input', () => {
    if (inputD.value.trim().length > 0) {
      aplicarDescifradoConD(inputD.value);
    }
  });
}

/**
 * Renderiza las opciones de selección para descifrar el mensaje final.
 * @param {HTMLElement} contenedor
 */
function renderizarOpciones(contenedor) {
  contenedor.innerHTML = '';

  puzzleActual.opciones.forEach((opcionTexto) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'puzzle__opcion';
    btn.textContent = opcionTexto;
    btn.onclick = () => manejarRespuesta(opcionTexto, btn);
    contenedor.appendChild(btn);
  });
}

/**
 * Maneja la selección del jugador.
 * @param {string} seleccion
 * @param {HTMLButtonElement} botonClickeado
 */
function manejarRespuesta(seleccion, botonClickeado) {
  detenerTimer();

  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const bannerPista = document.getElementById('rsa-pista-banner');
  const textoPista = document.getElementById('rsa-pista-texto');

  const esCorrecta = seleccion.trim().toUpperCase() === puzzleActual.respuestaCorrecta.trim().toUpperCase();

  if (esCorrecta) {
    const tiempoTotal = Math.round((Date.now() - tiempoInicio) / 1000);
    const puntos = registerCorrect(tiempoTotal);

    puzzleActual._respondidoCorrecto = true;
    puzzleActual._puntosObtenidos = puntos;

    guardarProgresoRSA({
      ultimoDescifrado: puzzleActual.respuestaCorrecta,
      puntosGanados: puntos,
      timestamp: Date.now()
    });

    feedbackSuccess(puntos, `¡Transmisión final descifrada! Llave privada d = ${puzzleActual.d}`);

    if (elOpciones) {
      elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
        b.disabled = true;
        if (b.textContent.trim().toUpperCase() === puzzleActual.respuestaCorrecta.trim().toUpperCase()) {
          b.classList.add('correct');
        }
      });
    }

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>🔓 DESCIFRADO RSA EXITOSO (+${puntos} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }

    if (btnNext) {
      btnNext.disabled = false;
    }
  } else {
    intentosFallidosLocal++;
    const gameOver = registerWrong();

    puzzleActual._respondidoCorrecto = false;
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;

    feedbackError(15, 'Exponente privado o mensaje erróneo. Integridad comprometida.');

    if (botonClickeado) {
      botonClickeado.classList.add('wrong');
      botonClickeado.disabled = true;
    }

    // Pista progresiva tras 2 fallos
    if (intentosFallidosLocal >= 2 && bannerPista && textoPista) {
      textoPista.textContent = puzzleActual.pistaTexto;
      bannerPista.style.display = 'block';
    }

    if (gameOver) {
      if (elOpciones) {
        elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
          b.disabled = true;
          if (b.textContent.trim().toUpperCase() === puzzleActual.respuestaCorrecta.trim().toUpperCase()) {
            b.classList.add('correct');
          }
        });
      }

      if (elFeedback) {
        elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
        elFeedback.innerHTML = `
          <strong>💥 BRECHA CRÍTICA // CONEXIÓN PURGADA</strong><br>
          <span>${puzzleActual.explicacion}</span>
        `;
      }

      if (btnNext) {
        btnNext.disabled = false;
      }
    } else {
      // Reanudar tiempo restante si no es Game Over
      const elTimer = document.getElementById('puzzle-timer');
      let t = 60;
      timerInterval = setInterval(() => {
        t--;
        if (elTimer) elTimer.textContent = formatearTiempo(t);
        if (t <= 0) {
          detenerTimer();
          manejarTiempoAgotado();
        }
      }, 1000);
    }
  }
}

/**
 * Manejo de expiración del temporizador.
 */
function manejarTiempoAgotado() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
      if (b.textContent.trim().toUpperCase() === puzzleActual.respuestaCorrecta.trim().toUpperCase()) {
        b.classList.add('correct');
      }
    });
  }

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._puntosObtenidos = 0;
  puzzleActual._isGameOver = gameOver;

  feedbackError(20, 'Tiempo agotado. La señal cuántica colapsó.');

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱️ TIEMPO AGOTADO // SEÑAL OMEGA PURGADA (-20% INTEGRIDAD)</strong><br>
      <span>${puzzleActual.explicacion}</span>
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
  }
}

/**
 * Suite de tests unitarios de tipoRSA.js con console.assert.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTipoRSA() {
  console.group('%c[TEST SUITE] Puzzle Tipo RSA (tipoRSA.js)', 'color: #00ff41; font-weight: bold;');
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

  const puzzle = generarPuzzleRSA(5);
  assert(puzzle.tipo === 'RSA', 'Tipo debe ser RSA');
  assert(typeof puzzle.textoPlano === 'string' && puzzle.textoPlano.length > 0, 'Debe contener textoPlano');
  assert(puzzle.opciones.includes(puzzle.respuestaCorrecta), 'Opciones deben incluir la respuesta correcta');
  assert(puzzle.n === puzzle.p * puzzle.q, 'n debe ser p * q');
  assert(puzzle.phi === (puzzle.p - 1) * (puzzle.q - 1), 'φ(n) debe ser (p-1)*(q-1)');
  assert(Array.isArray(puzzle.numerosCifrados) && puzzle.numerosCifrados.length > 0, 'numerosCifrados debe ser un array no vacío');
  assert(puzzle.d > 0, 'd debe ser un entero positivo');
  assert((puzzle.e * puzzle.d) % puzzle.phi === 1, 'e * d mod φ(n) debe ser 1');

  // Comprobar descifrado exacto
  const descifrado = descifrarTextoRSA(puzzle.numerosCifrados, puzzle.d, puzzle.n);
  assert(descifrado === puzzle.textoPlano, `Descifrado con d debe coincidir exactamente con textoPlano: "${descifrado}" === "${puzzle.textoPlano}"`);

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Puzzle Tipo RSA: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Puzzle Tipo RSA: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

