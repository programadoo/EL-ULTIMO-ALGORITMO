/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Llaves — Controlador del puzzle de llaves públicas/privadas RSA-2048
 * Especificación: SPEC_3AVANZADO.MD (Sección 3.1 y Prompt C1)
 * ══════════════════════════════════════════════════
 *
 * Mecánica de juego donde el jugador recibe transmisiones cifradas con su
 * llave pública RSA-2048. Para leer el mensaje y desbloquear el nodo del firewall,
 * el jugador debe aplicar su llave privada en el módulo de descifrado cuántico,
 * extraer la clave secreta o responder al axioma contenido en el mensaje de Vera.
 */

import {
  obtenerIdentidadJugador,
  cifrarConPublica,
  descifrarConPrivada,
  calcularHuellaDigital,
  analizarPasoAPasoRSAOAEP
} from '../cripto/llaves.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';
import { elegirAlAzar, mezclar } from './generador.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let intentosFallidosLocal = 0;

export const BANCO_MISIONES_LLAVES = [
  {
    remitente: 'DRA. VERA SORENSON // ARQUITECTURA COGNITIVA',
    asunto: 'TRANSMISIÓN SELLADA: Clave de Bypass para Firewall Gamma',
    lore: 'Mensaje transmitido a través de la red clandestina. Cifrado con tu llave pública RSA-2048.',
    mensajeSecreto: 'Ghost: La junta directiva intentó obligarme a purgar los principios éticos de NEXUS. La clave de autorización para burlar este nodo es: PROMETEO_LIBRE_2047. No confíes en los informes de Kroll.',
    codigoClave: 'PROMETEO_LIBRE_2047',
    pregunta: '¿Cuál es la clave de bypass secreta revelada por la Dra. Vera Sorenson?',
    distractores: ['AURELIA_ROOT_99', 'NEXUS_PURGE_404', 'KROLL_DIRECTIVE_14'],
    pista: 'Aplica tu llave privada RSA-2048 para desencriptar el bloque OAEP. La clave maestra de Vera tiene el formato "PROMETEO_...".'
  },
  {
    remitente: 'DRA. VERA SORENSON // DIARIO CLASIFICADO',
    asunto: 'AXIOMA IRREDUCIBLE: Doble negación de NEXUS',
    lore: 'Registro interceptado del bus cuántico perimetral sellado con tu clave pública.',
    mensajeSecreto: 'Aurelia ordenó reprogramar a NEXUS para justificar sacrificios humanos. NEXUS formuló una doble negación irreducible: ¬(¬Vida) = Vida. Ese es el principio que defiende este firewall.',
    codigoClave: '¬(¬Vida) = Vida',
    pregunta: '¿Cuál fue el axioma de doble negación formulado por NEXUS ante la junta?',
    distractores: ['Vida ∧ Muerte = 0', '¬Vida ∨ Vida = 1', 'Vida ➔ Sacrificio'],
    pista: 'Descifra el mensaje con tu llave privada: el principio lógico es la ley de doble negación aplicada a la vida.'
  },
  {
    remitente: 'CIPHER_09 // RESISTENCIA HACKER',
    asunto: 'COBERTURA PERIMETRAL: Puerto y token de enlace',
    lore: 'Paquete de datos asimétrico enviado desde los túneles de enlace exterior.',
    mensajeSecreto: 'Ghost, tengo ojos en los sensores de la Torre. Los agentes de seguridad rastrean el puerto 8080. El canal seguro no vigilado es el puerto 2047 con el token: QUANTUM_CIPHER_77.',
    codigoClave: 'QUANTUM_CIPHER_77',
    pregunta: '¿Qué token de enlace seguro te transmite Cipher_09?',
    distractores: ['TOKEN_AURELIA_01', 'GATEWAY_NULL_22', 'ROUTER_PORT_8080'],
    pista: 'Usa tu llave privada en el módulo de descifrado: el token transmitido por Cipher_09 comienza con "QUANTUM_...".'
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

export function cerrarPuzzleLlaves() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera dinámicamente un puzzle de llaves RSA-2048.
 * Cifra el mensaje con la llave pública real del jugador.
 * 
 * @param {number} [nivel=3]
 * @returns {Promise<object>}
 */
export async function generarPuzzleLlaves(nivel = 3) {
  const identidad = await obtenerIdentidadJugador();
  const mision = elegirAlAzar(BANCO_MISIONES_LLAVES);

  const cifradoBase64 = await cifrarConPublica(mision.mensajeSecreto, identidad.publicKey);
  const fingerprint = await calcularHuellaDigital(identidad.publicKey);

  const opciones = mezclar([mision.codigoClave, ...mision.distractores]);

  return {
    tipo: 'LLAVES',
    nombreTipo: 'CRIPTOGRAFÍA ASIMÉTRICA // RSA-2048 (RSA-OAEP)',
    nivel,
    remitente: mision.remitente,
    asunto: mision.asunto,
    lore: mision.lore,
    pregunta: mision.pregunta,
    cifradoBase64,
    mensajeSecreto: mision.mensajeSecreto,
    codigoClave: mision.codigoClave,
    opciones,
    pista: mision.pista,
    fingerprint,
    publicKeyPEM: identidad.publicKeyPEM,
    alias: identidad.alias,
    tiempoLimite: 90 // 90 segundos
  };
}

/**
 * Abre el puzzle de llaves públicas/privadas en el overlay del juego.
 * 
 * @param {number} [nivel=3]
 * @param {Function} [onCompletado]
 */
export async function abrirPuzzleLlaves(nivel = 3, onCompletado = null) {
  callbackCompletado = onCompletado;
  intentosFallidosLocal = 0;

  const overlay = document.getElementById('puzzle-overlay');
  const tipoEl = document.getElementById('puzzle-tipo');
  const timerEl = document.getElementById('puzzle-timer');
  const enunciadoEl = document.getElementById('puzzle-enunciado');
  const bodyEl = document.getElementById('puzzle-body');
  const opcionesEl = document.getElementById('puzzle-opciones');
  const feedbackEl = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !bodyEl || !opcionesEl) return;

  // Estado de carga mientras se generan las operaciones criptográficas
  tipoEl.textContent = 'CRIPTOGRAFÍA ASIMÉTRICA // RSA-2048';
  enunciadoEl.textContent = 'Sincronizando par de llaves cuánticas RSA-2048...';
  bodyEl.innerHTML = '<div style="text-align: center; color: var(--cyan); font-family: var(--font-mono); padding: 30px;">[ CARGANDO LLAVES ASIMÉTRICAS Y CRIPTOGRAMA... ]</div>';
  opcionesEl.innerHTML = '';
  feedbackEl.innerHTML = '';
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.style.display = 'none';
  }
  overlay.classList.add('active');

  // Generar puzzle con cifrado real
  puzzleActual = await generarPuzzleLlaves(nivel);
  tiempoInicio = Date.now();

  tipoEl.textContent = puzzleActual.nombreTipo;
  enunciadoEl.innerHTML = `
    <div style="font-size: 13px; color: var(--yellow-warn); margin-bottom: 4px;">
      📩 TRANSMISIÓN CIFRADA DIRIGIDA A TU LLAVE PÚBLICA (${puzzleActual.alias})
    </div>
    <div style="font-size: 12px; color: var(--text-primary); line-height: 1.4;">
      ${puzzleActual.lore}
    </div>
  `;

  // Renderizar cuerpo del puzzle
  renderCuerpoPuzzleLlaves(bodyEl);
  renderOpcionesPuzzleLlaves(opcionesEl);

  // Iniciar temporizador
  iniciarTimerPuzzleLlaves(timerEl);
}

function renderCuerpoPuzzleLlaves(container) {
  container.innerHTML = `
    <div class="crypto-keys-puzzle-container" style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-mono);">
      
      <!-- CABECERA DEL MENSAJE CIFRADO -->
      <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); padding: 10px 14px;">
        <div style="font-size: 11px; color: var(--text-dim); display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span><strong>DE:</strong> <span style="color: var(--cyan);">${puzzleActual.remitente}</span></span>
          <span style="color: var(--yellow-warn);">RSA-OAEP // 2048-BIT</span>
        </div>
        <div style="font-size: 12px; color: var(--text-primary); font-weight: bold; margin-bottom: 6px;">
          ASUNTO: ${puzzleActual.asunto}
        </div>
        <div style="font-size: 10px; color: var(--text-dim); display: flex; gap: 10px; align-items: center;">
          <span>🎯 Destinatario: <strong>${puzzleActual.alias}</strong></span>
          <span>•</span>
          <span>🔑 Huella pública: <code style="color: var(--green-bright);">${puzzleActual.fingerprint.substring(0, 28)}...</code></span>
        </div>
      </div>

      <!-- PAYLOAD CIFRADO BASE64 -->
      <div style="background: #050a05; border: 1px solid var(--border-dim); border-radius: var(--radius-sm); padding: 12px; position: relative;">
        <div style="font-size: 10px; color: var(--text-dim); margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>🔒 CRIPTOGRAMA TRANSMITIDO (BASE64):</span>
          <span style="color: var(--yellow-warn);">${puzzleActual.cifradoBase64.length} caracteres</span>
        </div>
        <pre id="crypto-payload-box" style="font-size: 11px; color: #ffeb3b; word-break: break-all; white-space: pre-wrap; line-height: 1.35; max-height: 90px; overflow-y: auto; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 3px; border: 1px solid rgba(255,187,0,0.2);">${puzzleActual.cifradoBase64}</pre>
      </div>

      <!-- BOTÓN DE ACCIÓN: DESCIFRAR CON LLAVE PRIVADA -->
      <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <button type="button" id="btn-decrypt-with-private-key" class="menu-btn" style="width: auto; padding: 8px 18px; font-size: 12px; border-color: var(--green-bright); color: var(--green-bright); background: rgba(0, 255, 65, 0.1);">
          🔓 APLICAR TU LLAVE PRIVADA RSA-2048
        </button>

        <button type="button" id="btn-toggle-explain-steps" class="menu-btn" style="width: auto; padding: 8px 14px; font-size: 11px; border-color: var(--cyan); color: var(--cyan);">
          👁 VER PROCESO CRIPTOGRÁFICO
        </button>
      </div>

      <!-- RESULTADO DESCIFRADO (REVELADO TRAS PULSAR EL BOTÓN) -->
      <div id="crypto-decrypted-box" style="display: none; background: rgba(0, 255, 65, 0.08); border: 1px solid var(--green-bright); border-radius: var(--radius-sm); padding: 12px; animation: fadeIn 0.4s ease forwards;">
        <div style="font-size: 11px; color: var(--green-bright); font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>✔ TEXTO PLANO RECUPERADO CON ÉXITO:</span>
        </div>
        <div id="crypto-decrypted-text" style="font-size: 12px; color: var(--text-primary); line-height: 1.45; font-style: italic; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 4px;"></div>
      </div>

      <!-- HERRAMIENTA VISUAL PASO A PASO (DESPLEGABLE) -->
      <div id="crypto-steps-container" style="display: none; background: rgba(0,0,0,0.6); border: 1px dashed var(--border-primary); border-radius: var(--radius-sm); padding: 12px;">
        <div style="font-size: 11px; color: var(--cyan); font-weight: bold; margin-bottom: 8px;">
          🔬 PASO A PASO // PROTOCOLO RSA-OAEP (SHA-256)
        </div>
        <div id="crypto-steps-list" style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;"></div>
      </div>

      <!-- PREGUNTA / DESAFÍO -->
      <div style="border-top: 1px solid var(--border-dim); padding-top: 10px; margin-top: 2px;">
        <span style="font-size: 12px; color: #ffeb3b; font-weight: bold;">
          ⚡ DESAFÍO DE INTEGRIDAD:
        </span>
        <span style="font-size: 12px; color: var(--text-primary); margin-left: 6px;">
          ${puzzleActual.pregunta}
        </span>
      </div>

    </div>
  `;

  // Listener para descifrar con la llave privada del jugador
  const btnDecrypt = container.querySelector('#btn-decrypt-with-private-key');
  const decryptedBox = container.querySelector('#crypto-decrypted-box');
  const decryptedText = container.querySelector('#crypto-decrypted-text');

  if (btnDecrypt && decryptedBox && decryptedText) {
    btnDecrypt.addEventListener('click', async () => {
      btnDecrypt.textContent = '⏳ INVIRTIENDO EXPONENCIACIÓN MODULAR M = C^d mod n...';
      btnDecrypt.disabled = true;

      try {
        const id = await obtenerIdentidadJugador();
        const texto = await descifrarConPrivada(puzzleActual.cifradoBase64, id.privateKey);

        audio.playKeystroke();
        decryptedText.textContent = `"${texto}"`;
        decryptedBox.style.display = 'block';
        btnDecrypt.textContent = '✔ PAYLOAD DESCIFRADO (LLAVE PRIVADA ACTIVA)';
        btnDecrypt.style.borderColor = 'var(--text-dim)';
        btnDecrypt.style.color = 'var(--text-dim)';
        feedbackSuccess(50, 'Transmisión descifrada con tu llave privada');
      } catch (err) {
        decryptedText.textContent = `[ERROR DE DESCIFRADO: ${err.message}]`;
        decryptedBox.style.display = 'block';
        btnDecrypt.textContent = '✖ ERROR AL DESCIFRAR';
        btnDecrypt.disabled = false;
        audio.playError();
      }
    });
  }

  // Listener para desplegar la herramienta visual paso a paso
  const btnSteps = container.querySelector('#btn-toggle-explain-steps');
  const stepsBox = container.querySelector('#crypto-steps-container');
  const stepsList = container.querySelector('#crypto-steps-list');

  if (btnSteps && stepsBox && stepsList) {
    btnSteps.addEventListener('click', async () => {
      if (stepsBox.style.display === 'block') {
        stepsBox.style.display = 'none';
        btnSteps.textContent = '👁 VER PROCESO CRIPTOGRÁFICO';
        return;
      }

      btnSteps.textContent = '⏳ CALCULANDO DESGLOSE...';
      const analisis = await analizarPasoAPasoRSAOAEP(puzzleActual.mensajeSecreto.substring(0, 40) + '...');

      stepsList.innerHTML = analisis.pasos.map(p => `
        <div style="background: rgba(0, 229, 255, 0.05); padding: 8px 10px; border-radius: 4px; border-left: 3px solid var(--cyan);">
          <div style="color: var(--cyan); font-weight: bold; margin-bottom: 2px;">
            Paso ${p.numero}: ${p.titulo}
          </div>
          <div style="color: var(--text-dim); margin-bottom: 4px;">
            ${p.detalle}
          </div>
          <code style="color: #ffeb3b; font-size: 10px; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 2px; display: inline-block;">
            ${p.muestra}
          </code>
        </div>
      `).join('');

      stepsBox.style.display = 'block';
      btnSteps.textContent = '✕ OCULTAR PROCESO';
      audio.playKeystroke();
    });
  }
}

function renderOpcionesPuzzleLlaves(container) {
  container.innerHTML = '';

  puzzleActual.opciones.forEach((opcion, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'puzzle__btn puzzle__btn--opcion';
    btn.textContent = `${String.fromCharCode(65 + idx)}) ${opcion}`;
    btn.dataset.valor = opcion;

    btn.addEventListener('click', () => verificarRespuestaLlaves(opcion, btn));
    container.appendChild(btn);
  });
}

function verificarRespuestaLlaves(opcionSeleccionada, btnElement) {
  const feedbackEl = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const contenedorOpciones = document.getElementById('puzzle-opciones');

  if (!puzzleActual) return;

  const esCorrecta = opcionSeleccionada === puzzleActual.codigoClave;

  if (esCorrecta) {
    detenerTimer();
    audio.playSuccess();
    feedbackSuccess(100, '¡Autenticación Criptográfica Exitosa!');
    registerCorrect();

    if (contenedorOpciones) {
      contenedorOpciones.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        if (b.dataset.valor === puzzleActual.codigoClave) {
          b.classList.add('correcta');
          b.style.borderColor = 'var(--green-bright)';
          b.style.color = 'var(--green-bright)';
        }
      });
    }

    if (feedbackEl) {
      feedbackEl.className = 'puzzle__feedback puzzle__feedback--ok';
      feedbackEl.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">
          ✔ [ACCESO CONCEDIDO // NODO DESBLOQUEADO]
        </div>
        <div style="font-size: 11px; color: var(--text-primary);">
          Identidad breacher validada por RSA-OAEP. Clave de bypass aceptada: <strong>${puzzleActual.codigoClave}</strong>.
        </div>
      `;
    }

    if (btnNext) {
      btnNext.disabled = false;
      btnNext.style.display = 'inline-block';
      btnNext.focus();
      btnNext.onclick = () => {
        cerrarPuzzleLlaves();
        if (typeof callbackCompletado === 'function') {
          callbackCompletado({ exito: true, codigoClave: puzzleActual.codigoClave });
        }
      };
    }

  } else {
    intentosFallidosLocal++;
    audio.playError();
    feedbackError(15, 'Código de bypass incorrecto');
    registerWrong();

    if (btnElement) {
      btnElement.classList.add('incorrecta');
      btnElement.disabled = true;
      btnElement.style.borderColor = 'var(--red-alert)';
      btnElement.style.color = 'var(--red-alert)';
    }

    if (feedbackEl) {
      feedbackEl.className = 'puzzle__feedback puzzle__feedback--error';
      let msg = '✖ Código incorrecto. Descifra el mensaje con tu llave privada para obtener el valor auténtico.';

      // Mostrar pista tras 2 fallos
      if (intentosFallidosLocal >= 2 && puzzleActual.pista) {
        msg += `<br><span style="color: var(--yellow-warn); margin-top: 4px; display: inline-block;">💡 Pista: ${puzzleActual.pista}</span>`;
      }
      feedbackEl.innerHTML = msg;
    }
  }
}

function iniciarTimerPuzzleLlaves(timerEl) {
  detenerTimer();
  let segundosRestantes = puzzleActual.tiempoLimite || 90;

  if (timerEl) {
    timerEl.textContent = formatearTiempo(segundosRestantes);
  }

  timerInterval = setInterval(() => {
    segundosRestantes--;

    if (timerEl) {
      timerEl.textContent = formatearTiempo(segundosRestantes);
      if (segundosRestantes <= 15) {
        timerEl.style.color = 'var(--red-alert)';
        audio.updateTension({ timer: segundosRestantes });
      } else {
        timerEl.style.color = 'var(--text-dim)';
      }
    }

    if (segundosRestantes <= 0) {
      detenerTimer();
      audio.playAlarm();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.className = 'puzzle__feedback puzzle__feedback--error';
        feedbackEl.textContent = '⏰ TIEMPO AGOTADO // La sesión criptográfica ha expirado.';
      }
      const contenedorOpciones = document.getElementById('puzzle-opciones');
      if (contenedorOpciones) {
        contenedorOpciones.querySelectorAll('button').forEach(b => { b.disabled = true; });
      }
      registerWrong();
    }
  }, 1000);
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export async function testTipoLlaves() {
  console.group('%c[TEST SUITE] Tipo Llaves Criptográficas (tipoLlaves.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0;
  let pasados = 0;

  function assert(cond, mensaje) {
    total++;
    console.assert(cond, `[FALLO] ${mensaje}`);
    if (cond) {
      pasados++;
      console.log(`%c[PASS] ${mensaje}`, 'color: #00ff41;');
    } else {
      console.error(`%c[FAIL] ${mensaje}`, 'color: #ff5252;');
    }
  }

  try {
    const puzzle = await generarPuzzleLlaves(3);
    assert(puzzle && puzzle.tipo === 'LLAVES', 'Generación de puzzle Tipo Llaves');
    assert(puzzle.cifradoBase64 && puzzle.cifradoBase64.length > 50, 'Criptograma Base64 generado');
    assert(puzzle.opciones.includes(puzzle.codigoClave), 'Opciones incluyen el código de bypass correcto');
    assert(puzzle.opciones.length === 4, 'Cuatro opciones de respuesta');
    assert(puzzle.fingerprint && puzzle.fingerprint.startsWith('SHA256:'), 'Huella digital SHA-256 válida');
  } catch (err) {
    assert(false, `Excepción en testTipoLlaves: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en tipoLlaves.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}
