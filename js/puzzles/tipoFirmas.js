/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Firmas — Verificación de Firmas Digitales con RSA-PSS
 * Especificación: SPEC_3AVANZADO.MD (Sección 3.2 y Prompt C2)
 * ══════════════════════════════════════════════════
 *
 * Puzzle interactivo donde el jugador debe comprobar si una transmisión
 * proviene realmente de la Dra. Vera Sorenson o si se trata de un honeypot
 * falsificado por Aurelia Systems / Kroll para inducir al jugador a destruir NEXUS.
 */

import {
  obtenerIdentidadVeraSorenson,
  generarMuestrasTransmisionesVera,
  verificarFirma,
  analizarPasoAPasoRSAPSS
} from '../cripto/firmas.js';
import { registerCorrect, registerWrong, getState } from '../state.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';
import { mezclar } from './generador.js';

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;
let intentosFallidosLocal = 0;

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

export function cerrarPuzzleFirmas() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera el puzzle de verificación de firmas RSA-PSS.
 * @param {number} [nivel=3]
 * @returns {Promise<object>}
 */
export async function generarPuzzleFirmas(nivel = 3) {
  const vera = await obtenerIdentidadVeraSorenson();
  const muestras = await generarMuestrasTransmisionesVera();

  // Seleccionar 2 transmisiones competidoras: la legítima y la de Aurelia
  const legitima = muestras.find(m => m.esAutenticoVera);
  const falsa = muestras.find(m => !m.esAutenticoVera);

  const opciones = mezclar([
    {
      id: legitima.id,
      etiqueta: 'DIRECTIVA 1: ' + legitima.asunto,
      esCorrecta: true,
      mensaje: legitima.mensaje,
      firma: legitima.firmaBase64,
      clave: legitima.claveSeguridad,
      remitente: legitima.remitenteDeclarado,
      origenReal: legitima.origenReal
    },
    {
      id: falsa.id,
      etiqueta: 'DIRECTIVA 2: ' + falsa.asunto,
      esCorrecta: false,
      mensaje: falsa.mensaje,
      firma: falsa.firmaBase64,
      clave: falsa.claveSeguridad,
      remitente: falsa.remitenteDeclarado,
      origenReal: falsa.origenReal
    }
  ]);

  return {
    tipo: 'FIRMAS',
    nombreTipo: 'FIRMAS DIGITALES // RSA-PSS (SHA-256)',
    nivel,
    veraFingerprint: vera.fingerprint,
    veraPEM: vera.pemPublica,
    opciones,
    legitimaId: legitima.id,
    codigoClave: legitima.claveSeguridad,
    pista: 'Usa el verificador RSA-PSS. La firma auténtica de Vera Sorenson es la única que valida matemáticamente contra su llave pública. El mensaje de purga es un honeypot de Aurelia.',
    tiempoLimite: 90
  };
}

/**
 * Abre el puzzle de verificación de firmas en el overlay central.
 * @param {number} [nivel=3]
 * @param {Function} [onCompletado]
 */
export async function abrirPuzzleFirmas(nivel = 3, onCompletado = null) {
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

  tipoEl.textContent = 'AUTENTICACIÓN // FIRMAS DIGITALES RSA-PSS';
  enunciadoEl.textContent = 'Calculando resúmenes criptográficos y llaves de verificación...';
  bodyEl.innerHTML = '<div style="text-align: center; color: var(--cyan); font-family: var(--font-mono); padding: 30px;">[ CARGANDO TRANSMISIONES Y HASHES SHA-256... ]</div>';
  opcionesEl.innerHTML = '';
  feedbackEl.innerHTML = '';
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.style.display = 'none';
  }
  overlay.classList.add('active');

  puzzleActual = await generarPuzzleFirmas(nivel);
  tiempoInicio = Date.now();

  tipoEl.textContent = puzzleActual.nombreTipo;
  enunciadoEl.innerHTML = `
    <div style="font-size: 13px; color: var(--yellow-warn); margin-bottom: 4px;">
      ⚠️ INTRUSIÓN DE MENSAJERÍA // SOSPECHA DE SUPLANTACIÓN CORPORATIVA
    </div>
    <div style="font-size: 12px; color: var(--text-primary); line-height: 1.4;">
      Has recibido dos directivas contradictorias firmadas como "Dra. Vera Sorenson". Una de ellas es una trampa de Aurelia Corp para engañarte y que destruyas a NEXUS. Verifica las firmas con la llave pública conocida de Vera para determinar cuál es auténtica.
    </div>
  `;

  renderCuerpoPuzzleFirmas(bodyEl);
  renderOpcionesPuzzleFirmas(opcionesEl);
  iniciarTimerPuzzleFirmas(timerEl);
}

function renderCuerpoPuzzleFirmas(container) {
  container.innerHTML = `
    <div class="signatures-puzzle-container" style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-mono);">
      
      <!-- IDENTIDAD CONOCIDA DE VERA SORENSON -->
      <div style="background: rgba(0, 255, 65, 0.05); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); padding: 10px 14px;">
        <div style="font-size: 10px; color: var(--text-dim); margin-bottom: 2px;">
          🔑 LLAVE PÚBLICA CONFIABLE // DRA. VERA SORENSON:
        </div>
        <div style="font-size: 11px; color: var(--green-bright); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <span>Huella SHA-256: <code>${puzzleActual.veraFingerprint}</code></span>
          <span style="color: var(--cyan); font-size: 10px;">RSA-PSS // e=65537 // 2048-BIT</span>
        </div>
      </div>

      <!-- TRANSMISIONES EN COMPARACIÓN -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${puzzleActual.opciones.map((op, idx) => `
          <div class="sig-card" id="sig-card-${op.id}" style="background: var(--bg-secondary); border: 1px solid var(--border-dim); border-radius: var(--radius-sm); padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 10px; color: #ffeb3b; font-weight: bold; margin-bottom: 4px;">
                PAQUETE #${idx + 1}
              </div>
              <div style="font-size: 11px; color: var(--text-primary); font-weight: bold; margin-bottom: 6px;">
                ${op.etiqueta}
              </div>
              <div style="font-size: 11px; color: var(--text-dim); line-height: 1.4; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; margin-bottom: 8px; max-height: 110px; overflow-y: auto;">
                "${op.mensaje}"
              </div>
              <div style="font-size: 10px; color: var(--text-dim); margin-bottom: 6px;">
                Firma RSA-PSS (Base64):
                <code style="display: block; word-break: break-all; color: var(--cyan); font-size: 9px; max-height: 38px; overflow: hidden;">
                  ${op.firma.substring(0, 60)}...
                </code>
              </div>
            </div>

            <!-- ESTADO DE LA VERIFICACIÓN -->
            <div id="sig-status-${op.id}" style="margin-top: 8px; padding: 6px; border-radius: 3px; font-size: 11px; text-align: center; background: rgba(0,0,0,0.5); border: 1px dashed var(--border-dim); color: var(--text-dim);">
              ○ PENDIENTE DE VERIFICACIÓN
            </div>
          </div>
        `).join('')}
      </div>

      <!-- BOTONES DE HERRAMIENTA -->
      <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <button type="button" id="btn-verify-all-signatures" class="menu-btn" style="width: auto; padding: 8px 18px; font-size: 12px; border-color: var(--cyan); color: var(--cyan); background: rgba(0, 229, 255, 0.08);">
          🔍 VERIFICAR FIRMAS CON LA LLAVE DE VERA
        </button>

        <button type="button" id="btn-toggle-explain-pss" class="menu-btn" style="width: auto; padding: 8px 14px; font-size: 11px; border-color: var(--yellow-warn); color: var(--yellow-warn);">
          👁 ¿CÓMO FUNCIONA RSA-PSS?
        </button>
      </div>

      <!-- DESGLOSE EXPLICATIVO (OCULTO POR DEFECTO) -->
      <div id="pss-steps-container" style="display: none; background: rgba(0,0,0,0.6); border: 1px dashed var(--border-primary); border-radius: var(--radius-sm); padding: 12px;">
        <div style="font-size: 11px; color: var(--yellow-warn); font-weight: bold; margin-bottom: 8px;">
          🔬 MECÁNICA DE VERIFICACIÓN RSA-PSS // PKCS#1 v2.1
        </div>
        <div id="pss-steps-list" style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;"></div>
      </div>

      <!-- PREGUNTA -->
      <div style="border-top: 1px solid var(--border-dim); padding-top: 8px;">
        <span style="font-size: 12px; color: #ffeb3b; font-weight: bold;">
          ⚡ ELECCIÓN CRÍTICA:
        </span>
        <span style="font-size: 12px; color: var(--text-primary); margin-left: 6px;">
          ¿Cuál de las directivas fue legítimamente firmada por la Dra. Vera Sorenson?
        </span>
      </div>

    </div>
  `;

  // Listener para verificar firmas con Web Crypto API
  const btnVerify = container.querySelector('#btn-verify-all-signatures');
  if (btnVerify) {
    btnVerify.addEventListener('click', async () => {
      btnVerify.textContent = '⏳ VERIFICANDO HASHES Y SALTS RSA-PSS...';
      btnVerify.disabled = true;

      const vera = await obtenerIdentidadVeraSorenson();

      for (const op of puzzleActual.opciones) {
        const statusBox = container.querySelector(`#sig-status-${op.id}`);
        const cardBox = container.querySelector(`#sig-card-${op.id}`);

        const esValida = await verificarFirma(op.mensaje, op.firma, vera.publicKey);

        if (statusBox && cardBox) {
          if (esValida) {
            statusBox.style.background = 'rgba(0, 255, 65, 0.12)';
            statusBox.style.border = '1px solid var(--green-bright)';
            statusBox.style.color = 'var(--green-bright)';
            statusBox.innerHTML = '✔ <strong>FIRMA AUTÉNTICA</strong><br><span style="font-size: 9px;">Origen validado: Dra. Vera Sorenson</span>';
            cardBox.style.borderColor = 'var(--green-bright)';
          } else {
            statusBox.style.background = 'rgba(255, 82, 82, 0.12)';
            statusBox.style.border = '1px solid var(--red-alert)';
            statusBox.style.color = 'var(--red-alert)';
            statusBox.innerHTML = '✖ <strong>FIRMA FALSIFICADA // INVÁLIDA</strong><br><span style="font-size: 9px;">Discrepancia de hash: No proviene de Vera</span>';
            cardBox.style.borderColor = 'var(--red-alert)';
          }
        }
      }

      btnVerify.textContent = '✔ VERIFICACIÓN MATEMÁTICA COMPLETADA';
      audio.playSuccess();
      feedbackSuccess(50, 'Firmas auditadas con RSA-PSS');
    });
  }

  // Listener para desplegar la herramienta explicativa
  const btnExplain = container.querySelector('#btn-toggle-explain-pss');
  const stepsBox = container.querySelector('#pss-steps-container');
  const stepsList = container.querySelector('#pss-steps-list');

  if (btnExplain && stepsBox && stepsList) {
    btnExplain.addEventListener('click', async () => {
      if (stepsBox.style.display === 'block') {
        stepsBox.style.display = 'none';
        btnExplain.textContent = '👁 ¿CÓMO FUNCIONA RSA-PSS?';
        return;
      }

      const muestra = puzzleActual.opciones[0];
      const analisis = await analizarPasoAPasoRSAPSS(muestra.mensaje, muestra.firma, muestra.esCorrecta);

      stepsList.innerHTML = analisis.pasos.map(p => `
        <div style="background: rgba(255, 187, 0, 0.05); padding: 8px 10px; border-radius: 4px; border-left: 3px solid var(--yellow-warn);">
          <div style="color: var(--yellow-warn); font-weight: bold; margin-bottom: 2px;">
            Paso ${p.numero}: ${p.titulo}
          </div>
          <div style="color: var(--text-dim); margin-bottom: 4px;">
            ${p.detalle}
          </div>
          <code style="color: var(--cyan); font-size: 10px; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 2px; display: inline-block;">
            ${p.muestra}
          </code>
        </div>
      `).join('');

      stepsBox.style.display = 'block';
      btnExplain.textContent = '✕ OCULTAR ANÁLISIS';
      audio.playKeystroke();
    });
  }
}

function renderOpcionesPuzzleFirmas(container) {
  container.innerHTML = '';

  puzzleActual.opciones.forEach((op, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'puzzle__btn puzzle__btn--opcion';
    btn.textContent = `ACEPTAR ${op.etiqueta.toUpperCase()}`;
    btn.dataset.id = op.id;

    btn.addEventListener('click', () => verificarEleccionFirma(op, btn));
    container.appendChild(btn);
  });
}

function verificarEleccionFirma(opcionSeleccionada, btnElement) {
  const feedbackEl = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const contenedorOpciones = document.getElementById('puzzle-opciones');

  if (!puzzleActual) return;

  if (opcionSeleccionada.esCorrecta) {
    detenerTimer();
    audio.playSuccess();
    feedbackSuccess(150, '¡Directiva auténtica identificada!');
    registerCorrect();

    if (contenedorOpciones) {
      contenedorOpciones.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        if (b.dataset.id === puzzleActual.legitimaId) {
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
          ✔ [FIRMA AUTÉNTICA VALIDADA // TRAMPA DE AURELIA EVITADA]
        </div>
        <div style="font-size: 11px; color: var(--text-primary);">
          Has verificado con éxito la firma RSA-PSS de la Dra. Vera Sorenson. La directiva corporativa era un honeypot de Kroll. Clave de bypass: <strong>${puzzleActual.codigoClave}</strong>.
        </div>
      `;
    }

    if (btnNext) {
      btnNext.disabled = false;
      btnNext.style.display = 'inline-block';
      btnNext.focus();
      btnNext.onclick = () => {
        cerrarPuzzleFirmas();
        if (typeof callbackCompletado === 'function') {
          callbackCompletado({ exito: true, codigoClave: puzzleActual.codigoClave });
        }
      };
    }

  } else {
    intentosFallidosLocal++;
    audio.playAlarm();
    feedbackError(25, '¡ALERTA! Has elegido una orden falsificada');
    registerWrong();

    if (btnElement) {
      btnElement.classList.add('incorrecta');
      btnElement.disabled = true;
      btnElement.style.borderColor = 'var(--red-alert)';
      btnElement.style.color = 'var(--red-alert)';
    }

    if (feedbackEl) {
      feedbackEl.className = 'puzzle__feedback puzzle__feedback--error';
      let msg = '⚠️ ¡PELIGRO! Esa directiva NO tiene la firma auténtica de Vera Sorenson. Proviene de los servidores de Aurelia Systems para destruir el núcleo de NEXUS.';

      if (intentosFallidosLocal >= 2 && puzzleActual.pista) {
        msg += `<br><span style="color: var(--yellow-warn); margin-top: 4px; display: inline-block;">💡 Pista: ${puzzleActual.pista}</span>`;
      }
      feedbackEl.innerHTML = msg;
    }
  }
}

function iniciarTimerPuzzleFirmas(timerEl) {
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
        feedbackEl.textContent = '⏰ TIEMPO AGOTADO // La verificación criptográfica ha expirado.';
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

export async function testTipoFirmas() {
  console.group('%c[TEST SUITE] Tipo Firmas Digitales (tipoFirmas.js)', 'color: #00ff41; font-weight: bold;');
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
    const puzzle = await generarPuzzleFirmas(3);
    assert(puzzle && puzzle.tipo === 'FIRMAS', 'Generación de puzzle Tipo Firmas');
    assert(Array.isArray(puzzle.opciones) && puzzle.opciones.length === 2, 'Dos directivas para comparar');
    assert(puzzle.opciones.some(o => o.esCorrecta), 'Contiene la directiva auténtica de Vera');
    assert(puzzle.opciones.some(o => !o.esCorrecta), 'Contiene la directiva falsificada de Aurelia');
    assert(puzzle.veraFingerprint && puzzle.veraFingerprint.startsWith('SHA256:'), 'Huella SHA-256 de Vera presente');
  } catch (err) {
    assert(false, `Excepción en testTipoFirmas: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en tipoFirmas.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}

