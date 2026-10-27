/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo Blockchain — Auditoría Forense de Cadena de Bloques SHA-256
 * Especificación: SPEC_3AVANZADO.MD (Sección 3.3 y Prompt C3)
 * ══════════════════════════════════════════════════
 *
 * Puzzle interactivo donde el jugador debe auditar los registros
 * criptográficos inmutables de Aurelia Systems. Mediante el recálculo
 * de hashes SHA-256 y la verificación de enlaces (hashPrevio),
 * el jugador debe identificar el bloque corrupto/manipulado (tampered)
 * que encubre la persecución de la Dra. Vera Sorenson y la reclusión de NEXUS.
 */

import {
  construirCadenaAuditadaConCorrupcion,
  calcularHashSHA256,
  analizarEfectoAvalanchaSHA256,
  CASOS_LORE_BLOCKCHAIN
} from '../cripto/blockchain.js';
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

export function cerrarPuzzleBlockchain() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Genera el puzzle de auditoría forense de blockchain SHA-256.
 * @param {number} [nivel=4]
 * @returns {Promise<object>}
 */
export async function generarPuzzleBlockchain(nivel = 4) {
  // Seleccionar caso de lore de forma determinista o según el nivel
  const casoIndex = (nivel - 1) % CASOS_LORE_BLOCKCHAIN.length;
  const auditoria = await construirCadenaAuditadaConCorrupcion(casoIndex);

  const opciones = auditoria.cadena.bloques.map(b => ({
    indice: b.indice,
    etiqueta: `Bloque #${b.indice} ${b.indice === 0 ? '(Génesis)' : ''}`.trim(),
    esCorrecta: b.indice === auditoria.indiceCorrupto,
    datos: b.datos,
    hash: b.hash,
    hashPrevio: b.hashPrevio,
    timestamp: b.timestamp
  }));

  return {
    tipo: 'BLOCKCHAIN',
    nombreTipo: 'CADENA DE BLOQUES // AUDITORÍA SHA-256',
    nivel,
    caso: auditoria.caso,
    cadena: auditoria.cadena,
    bloques: auditoria.cadena.bloques,
    indiceCorrupto: auditoria.indiceCorrupto,
    datosOriginales: auditoria.datosOriginales,
    datosAlterados: auditoria.datosAlterados,
    opciones,
    pista: auditoria.caso.pista || 'Verifica los bloques con SHA-256. El hash almacenado de uno de ellos no coincidirá con sus datos manipulados.',
    tiempoLimite: 90
  };
}

/**
 * Abre el puzzle de auditoría de blockchain en el overlay central.
 * @param {number} [nivel=4]
 * @param {Function} [onCompletado]
 */
export async function abrirPuzzleBlockchain(nivel = 4, onCompletado = null) {
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

  tipoEl.textContent = 'LIBRO MAYOR // AUDITORÍA SHA-256';
  enunciadoEl.textContent = 'Compilando bloques históricos de Aurelia Systems y verificando hashes...';
  bodyEl.innerHTML = '<div style="text-align: center; color: var(--cyan); font-family: var(--font-mono); padding: 30px;">[ CARGANDO CADENA DE BLOQUES Y RESÚMENES SHA-256... ]</div>';
  opcionesEl.innerHTML = '';
  feedbackEl.innerHTML = '';
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.style.display = 'none';
  }
  overlay.classList.add('active');

  puzzleActual = await generarPuzzleBlockchain(nivel);
  tiempoInicio = Date.now();

  tipoEl.textContent = puzzleActual.nombreTipo;
  enunciadoEl.innerHTML = `
    <div style="font-size: 13px; color: var(--yellow-warn); margin-bottom: 4px;">
      ⚠️ ADULTERACIÓN DETECTADA // LIBRO MAYOR DE AUDITORÍA: ${puzzleActual.caso.titulo}
    </div>
    <div style="font-size: 12px; color: var(--text-primary); line-height: 1.4;">
      ${puzzleActual.caso.descripcion}
      <br>
      <span style="color: var(--cyan); font-size: 11px;">
        💡 En una cadena SHA-256, cada bloque sella sus datos y el hash del bloque previo. Si alguien alteró un texto histórico sin recalcular el resto, la integridad matemática estará rota.
      </span>
    </div>
  `;

  renderCuerpoPuzzleBlockchain(bodyEl);
  renderOpcionesPuzzleBlockchain(opcionesEl);
  iniciarTimerPuzzleBlockchain(timerEl);
}

function renderCuerpoPuzzleBlockchain(container) {
  const bloques = puzzleActual.bloques;

  container.innerHTML = `
    <div class="blockchain-puzzle-container" style="display: flex; flex-direction: column; gap: 14px; font-family: var(--font-mono);">
      
      <!-- ENCABEZADO DE LA CADENA -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 229, 255, 0.05); border: 1px solid var(--border-primary); border-radius: var(--radius-sm); padding: 8px 12px; flex-wrap: wrap; gap: 6px;">
        <span style="font-size: 11px; color: var(--cyan); font-weight: bold;">
          ⛓ REGISTRO INMUTABLE: ${puzzleActual.caso.id.toUpperCase()} (${bloques.length} BLOQUES)
        </span>
        <span style="font-size: 10px; color: var(--text-dim);">
          ESTÁNDAR: SHA-256 / 256-BIT DIGEST
        </span>
      </div>

      <!-- VISOR DE BLOQUES EN CADENA -->
      <div class="blockchain-scroll-track" style="display: flex; flex-direction: column; gap: 10px; max-height: 290px; overflow-y: auto; padding-right: 4px;">
        ${bloques.map((b, idx) => `
          <div class="block-card" id="block-card-${b.indice}" style="background: var(--bg-secondary); border: 1px solid var(--border-dim); border-radius: var(--radius-sm); padding: 10px; transition: all 0.3s ease;">
            
            <!-- CABECERA DEL BLOQUE -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px dashed var(--border-dim); padding-bottom: 4px;">
              <span style="font-size: 12px; color: #ffeb3b; font-weight: bold;">
                ${b.indice === 0 ? '⚓ BLOQUE #0 [GÉNESIS]' : `📦 BLOQUE #${b.indice}`}
              </span>
              <span style="font-size: 10px; color: var(--text-dim);">
                📅 ${b.timestamp}
              </span>
            </div>

            <!-- CONTENIDO DEL BLOQUE -->
            <div style="font-size: 11px; color: var(--text-primary); line-height: 1.4; background: rgba(0,0,0,0.4); padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
              ${typeof b.datos === 'string' ? b.datos : JSON.stringify(b.datos)}
            </div>

            <!-- ENLACE DE HASH PREVIO Y PROPIO -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; margin-bottom: 6px;">
              <div>
                <span style="color: var(--text-dim); display: block;">Hash Previo (Enlace):</span>
                <code style="color: var(--cyan); font-size: 9px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${b.hashPrevio}">
                  ${b.hashPrevio.substring(0, 16)}...${b.hashPrevio.substring(56)}
                </code>
              </div>
              <div>
                <span style="color: var(--text-dim); display: block;">Hash Registrado en Bloque:</span>
                <code style="color: var(--green-bright); font-size: 9px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${b.hash}">
                  ${b.hash.substring(0, 16)}...${b.hash.substring(56)}
                </code>
              </div>
            </div>

            <!-- ESTADO FORENSE DEL BLOQUE -->
            <div id="block-status-${b.indice}" style="padding: 4px 8px; border-radius: 3px; font-size: 10px; text-align: center; background: rgba(0,0,0,0.5); border: 1px dashed var(--border-dim); color: var(--text-dim);">
              ○ PENDIENTE DE AUDITORÍA CRIPTOGRÁFICA
            </div>

          </div>
        `).join('')}
      </div>

      <!-- BOTONES DE ACCIÓN FORENSE -->
      <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <button type="button" id="btn-audit-blockchain" class="menu-btn" style="width: auto; padding: 8px 18px; font-size: 12px; border-color: var(--cyan); color: var(--cyan); background: rgba(0, 229, 255, 0.08);">
          🔍 AUDITAR INTEGRIDAD SHA-256 (ESCANEO COMPLETO)
        </button>

        <button type="button" id="btn-toggle-avalanche" class="menu-btn" style="width: auto; padding: 8px 14px; font-size: 11px; border-color: var(--yellow-warn); color: var(--yellow-warn);">
          🔬 ANALIZAR EFECTO AVALANCHA (SHA-256)
        </button>
      </div>

      <!-- VISOR DE EFECTO AVALANCHA (OCULTO POR DEFECTO) -->
      <div id="avalanche-container" style="display: none; background: rgba(0,0,0,0.7); border: 1px dashed var(--border-primary); border-radius: var(--radius-sm); padding: 10px;">
        <div style="font-size: 11px; color: var(--yellow-warn); font-weight: bold; margin-bottom: 6px;">
          🔬 EXPERIMENTO FORENSE // EFECTO AVALANCHA
        </div>
        <div id="avalanche-content" style="font-size: 10px; line-height: 1.4; color: var(--text-dim);"></div>
      </div>

      <!-- INSTRUCCIÓN DE RESOLUCIÓN -->
      <div style="border-top: 1px solid var(--border-dim); padding-top: 8px;">
        <span style="font-size: 12px; color: #ffeb3b; font-weight: bold;">
          ⚡ ELECCIÓN FORENSE:
        </span>
        <span style="font-size: 12px; color: var(--text-primary); margin-left: 6px;">
          Selecciona cuál de los bloques fue adulterado en la cadena de Aurelia:
        </span>
      </div>

    </div>
  `;

  // Listener para auditar la cadena paso a paso
  const btnAudit = container.querySelector('#btn-audit-blockchain');
  if (btnAudit) {
    btnAudit.addEventListener('click', async () => {
      btnAudit.disabled = true;
      btnAudit.textContent = '⏳ ESCANEANDO ESLABONES Y RECALCULANDO HASHES...';

      const cadena = puzzleActual.cadena;

      for (let i = 0; i < cadena.bloques.length; i++) {
        const b = cadena.bloques[i];
        const statusBox = container.querySelector(`#block-status-${b.indice}`);
        const cardBox = container.querySelector(`#block-card-${b.indice}`);

        if (statusBox) {
          statusBox.innerHTML = '⚡ <em>Calculando digest SHA-256...</em>';
        }

        // Breve pausa para efecto visual de escáner en tiempo real
        await new Promise(r => setTimeout(r, 180));

        // Calcular hash real esperado de los datos actuales
        const hashRecalculado = await calcularHashSHA256(b.obtenerCargaSerializada());
        const datosValidos = (hashRecalculado === b.hash);

        // Verificar enlace previo
        let enlaceValido = true;
        if (i > 0) {
          const anterior = cadena.bloques[i - 1];
          enlaceValido = (b.hashPrevio === anterior.hash);
        }

        if (statusBox && cardBox) {
          if (datosValidos && enlaceValido) {
            statusBox.style.background = 'rgba(0, 255, 65, 0.12)';
            statusBox.style.border = '1px solid var(--green-bright)';
            statusBox.style.color = 'var(--green-bright)';
            statusBox.innerHTML = '✔ <strong>BLOQUE ÍNTEGRO</strong> // Hash validado (SHA-256 coincide)';
            cardBox.style.borderColor = 'var(--green-bright)';
          } else if (!datosValidos) {
            statusBox.style.background = 'rgba(255, 82, 82, 0.15)';
            statusBox.style.border = '1px solid var(--red-alert)';
            statusBox.style.color = 'var(--red-alert)';
            statusBox.innerHTML = `
              ❌ <strong>¡CORRUPCIÓN DETECTADA! (TAMPERING)</strong><br>
              <span style="font-size: 9px; display: block; margin-top: 2px;">
                Hash almacenado: <code>${b.hash.substring(0, 20)}...</code><br>
                Hash real calculado: <code>${hashRecalculado.substring(0, 20)}...</code>
              </span>
            `;
            cardBox.style.borderColor = 'var(--red-alert)';
            cardBox.style.boxShadow = '0 0 10px rgba(255, 82, 82, 0.4)';
            audio.playAlarm();
          } else {
            statusBox.style.background = 'rgba(255, 152, 0, 0.15)';
            statusBox.style.border = '1px solid #ff9800';
            statusBox.style.color = '#ff9800';
            statusBox.innerHTML = '⚠️ <strong>RUPTURA DE ENLACE</strong> // Hash previo no coincide con bloque anterior';
            cardBox.style.borderColor = '#ff9800';
          }
        }
      }

      btnAudit.textContent = '✔ AUDITORÍA FINALIZADA';
      audio.playSuccess();
    });
  }

  // Listener para el demostrador de efecto avalancha
  const btnAvalanche = container.querySelector('#btn-toggle-avalanche');
  const boxAvalanche = container.querySelector('#avalanche-container');
  const contentAvalanche = container.querySelector('#avalanche-content');

  if (btnAvalanche && boxAvalanche && contentAvalanche) {
    btnAvalanche.addEventListener('click', async () => {
      const isHidden = boxAvalanche.style.display === 'none';
      if (isHidden) {
        boxAvalanche.style.display = 'block';
        btnAvalanche.textContent = '🔼 OCULTAR ANÁLISIS DE AVALANCHA';

        contentAvalanche.innerHTML = '⏳ Calculando variación de bits...';
        const analisis = await analizarEfectoAvalanchaSHA256(
          puzzleActual.datosOriginales,
          puzzleActual.datosAlterados
        );

        contentAvalanche.innerHTML = `
          <div style="margin-bottom: 6px;">
            <strong style="color: var(--green-bright);">Texto Original:</strong> "${analisis.textoOriginal}"<br>
            <span style="font-size: 9px; color: var(--cyan);">SHA-256: <code>${analisis.hashOriginal}</code></span>
          </div>
          <div style="margin-bottom: 6px;">
            <strong style="color: var(--red-alert);">Texto Alterado:</strong> "${analisis.textoAlterado}"<br>
            <span style="font-size: 9px; color: var(--yellow-warn);">SHA-256: <code>${analisis.hashAlterado}</code></span>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 6px; border-radius: 4px; border-left: 3px solid var(--yellow-warn);">
            ⚡ <strong>Impacto Avalancha:</strong> ${analisis.caracteresDistintos} de 64 caracteres alterados (${analisis.porcentajeVariacion}% de variación en el digest).<br>
            ${analisis.explicacion}
          </div>
        `;
      } else {
        boxAvalanche.style.display = 'none';
        btnAvalanche.textContent = '🔬 ANALIZAR EFECTO AVALANCHA (SHA-256)';
      }
    });
  }
}

function renderOpcionesPuzzleBlockchain(container) {
  container.innerHTML = '';

  puzzleActual.opciones.forEach(op => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-btn';
    btn.id = `btn-op-bloque-${op.indice}`;
    btn.style.width = '100%';
    btn.style.textAlign = 'left';
    btn.style.padding = '8px 12px';
    btn.style.fontSize = '12px';

    btn.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: var(--cyan);">${op.etiqueta}</span>
        <span style="font-size: 10px; color: var(--text-dim); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${typeof op.datos === 'string' ? op.datos : JSON.stringify(op.datos)}
        </span>
      </div>
    `;

    btn.addEventListener('click', () => verificarRespuestaBlockchain(op.indice, btn));
    container.appendChild(btn);
  });
}

async function verificarRespuestaBlockchain(indiceElegido, botonPresionado) {
  const feedbackEl = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');
  const opcionesCont = document.getElementById('puzzle-opciones');

  const esCorrecto = (indiceElegido === puzzleActual.indiceCorrupto);

  if (esCorrecto) {
    detenerTimer();
    audio.playSuccess();

    if (botonPresionado) {
      botonPresionado.style.borderColor = 'var(--green-bright)';
      botonPresionado.style.background = 'rgba(0, 255, 65, 0.15)';
    }

    if (opcionesCont) {
      opcionesCont.querySelectorAll('button').forEach(b => {
        b.disabled = true;
      });
    }

    const tiempoUsado = Math.floor((Date.now() - tiempoInicio) / 1000);
    const puntos = Math.max(120, 250 - tiempoUsado * 2 - intentosFallidosLocal * 30);
    registerCorrect(puntos, puzzleActual.tiempoLimite - tiempoUsado);

    if (feedbackEl) {
      feedbackEl.className = 'puzzle__feedback puzzle__feedback--success';
      feedbackEl.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">
          ✔ ¡CORRUPCIÓN LOCALIZADA Y AUDITADA! (+${puntos} PTS)
        </div>
        <div style="font-size: 11px; line-height: 1.4; color: var(--text-primary);">
          Has identificado con éxito el <strong>Bloque #${indiceElegido}</strong> como el eslabón adulterado. 
          Aurelia Systems modificó este registro para falsear la historia, pero la inmutabilidad de SHA-256 los delató.
          <br>
          <span style="color: var(--yellow-warn);">Texto original restaurado:</span> "${puzzleActual.datosOriginales}"
        </div>
      `;
    }

    feedbackSuccess();

    if (btnNext) {
      btnNext.disabled = false;
      btnNext.style.display = 'block';
      btnNext.textContent = 'CONTINUAR // RESTAURAR BITÁCORA';
      btnNext.onclick = () => {
        cerrarPuzzleBlockchain();
        if (typeof callbackCompletado === 'function') {
          callbackCompletado({
            completado: true,
            tipo: 'BLOCKCHAIN',
            bloqueCorrupto: indiceElegido,
            puntos
          });
        }
      };
    }
  } else {
    intentosFallidosLocal++;
    registerWrong();
    audio.playGlitch();

    if (botonPresionado) {
      botonPresionado.style.borderColor = 'var(--red-alert)';
      botonPresionado.style.animation = 'glitch-anim 0.3s';
    }

    if (feedbackEl) {
      feedbackEl.className = 'puzzle__feedback puzzle__feedback--error';
      feedbackEl.innerHTML = `
        <div style="font-weight: bold; font-size: 12px; margin-bottom: 2px;">
          ✖ ERROR DE AUDITORÍA FORENSE
        </div>
        <div style="font-size: 11px; color: var(--text-primary);">
          El Bloque #${indiceElegido} tiene un hash matemáticamente válido. Busca el bloque cuyo contenido no coincide con su digest SHA-256 o usa el botón de escaneo completo.
        </div>
      `;
    }

    feedbackError();
  }
}

function iniciarTimerPuzzleBlockchain(timerEl) {
  detenerTimer();
  let segundosRestantes = puzzleActual.tiempoLimite;

  if (timerEl) {
    timerEl.textContent = formatearTiempo(segundosRestantes);
    timerEl.style.color = 'var(--text-dim)';
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
        feedbackEl.textContent = '⏰ TIEMPO AGOTADO // La auditoría ha sido bloqueada por el cortafuegos.';
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

export async function testTipoBlockchain() {
  console.group('%c[TEST SUITE] Tipo Blockchain SHA-256 (tipoBlockchain.js)', 'color: #00ff41; font-weight: bold;');
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
    const puzzle = await generarPuzzleBlockchain(4);
    assert(puzzle && puzzle.tipo === 'BLOCKCHAIN', 'Generación de puzzle Tipo Blockchain');
    assert(Array.isArray(puzzle.bloques) && puzzle.bloques.length >= 4, 'Cadena contiene al menos 4 bloques');
    assert(typeof puzzle.indiceCorrupto === 'number' && puzzle.indiceCorrupto > 0, 'Índice de bloque corrupto definido');
    assert(puzzle.opciones.some(o => o.esCorrecta), 'Al menos una opción marcada como correcta');

    // Verificar que la auditoría automática localiza el bloque corrupto
    const resAuditoria = await puzzle.cadena.verificarCadena();
    assert(resAuditoria.valida === false, 'La cadena manipulada es reportada como inválida');
    assert(resAuditoria.bloqueCorrupto === puzzle.indiceCorrupto, `El bloque detectado (#${resAuditoria.bloqueCorrupto}) coincide con el índice corrupto (#${puzzle.indiceCorrupto})`);
  } catch (err) {
    assert(false, `Excepción en testTipoBlockchain: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en tipoBlockchain.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}

