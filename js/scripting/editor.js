/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Editor Integrado CodeMirror 6 para GhostScript
 * Especificación: SPEC_3AVANZADO.MD (Capa 2, Sección 2.4 y Prompt B2)
 * ══════════════════════════════════════════════════
 *
 * Integra CodeMirror 6 con resaltado de sintaxis personalizado para GhostScript,
 * botones "Ejecutar" y "Comprobar", consola de salida en tiempo real,
 * selector de plantillas y emulador reactivo de alta fidelidad.
 */

import { executeGhostScript, parseGhostScript, tokenizeGhostScript } from './ghostscript.js';
import { BANCO_RETOS, obtenerListaRetos, validarReto, esRetoDesbloqueado } from './retos.js';
import { audio } from '../audio.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { registrarSolucionEnRanking } from './rankingSoluciones.js';

let editorInstancia = null;
let callbackComprobacion = null;
let archivoActual = 'hack_firewall_beta.gs';
let retoActivoId = null;

// ─────────────────────────────────────────────────
// 1. PLANTILLAS DE CÓDIGO GHOSTSCRIPT
// ─────────────────────────────────────────────────

export const PLANTILLAS_GHOSTSCRIPT = {
  hack: `// Script de automatización para Firewall Beta
// Diseñado por: Ghost (Infiltración NEXUS)

LET usuarios = SCAN "aurelia.local"
PRINT "[+] Usuarios detectados en perímetro:", usuarios

LOOP 3 TIMES
  LET pass = CRACK usuarios[0]
  IF pass != NULL THEN
    PRINT "[✔] Clave vulnerada:", pass
    SEND pass TO "ghost@nexus"
  END
END

DECRYPT "aurelia_internal.log" CON "vera_key"
PRINT "[+] Proceso de infiltración finalizado."`,

  batch: `// Descifrado en lote de transmisiones interceptadas
LET archivos = ["log_alpha.enc", "log_beta.enc", "log_gamma.enc"]
LET clave = "SISTEMA_LIBRE"
LET total = 0

LOOP 3 TIMES
  LET arch = archivos[total]
  DECRYPT arch CON clave
  PRINT "[+] Descifrado:", arch
  total = total + 1
END

PRINT "[✔] Lote completado. Total procesados:", total`,

  filter: `// Búsqueda y filtrado condicional de credenciales
LET puertos = SCAN "servidor.aurelia"
PRINT "[+] Puertos escaneados:", puertos

LOOP 4 TIMES
  LET puerto = puertos[0]
  IF puerto > 80 THEN
    PRINT "[!] Puerto alto sospechoso encontrado:", puerto
    SEND puerto TO "auditor@nexus"
  ELSE
    PRINT "[-] Puerto estándar ignorado:", puerto
  END
END`,

  empty: `// Nuevo script GhostScript
// Escribe aquí tus comandos: LET, SCAN, CRACK, DECRYPT, SEND, IF, LOOP

LET objetivo = "nexus.central"
PRINT "Objetivo fijado en:", objetivo
`
};

// ─────────────────────────────────────────────────
// 2. RESALTADOR DE SINTAXIS GHOSTSCRIPT
// ─────────────────────────────────────────────────

const KEYWORDS_SET = new Set([
  'LET', 'SCAN', 'CRACK', 'DECRYPT', 'CON', 'WITH', 'SEND', 'TO',
  'IF', 'THEN', 'ELSE', 'END', 'LOOP', 'TIMES', 'PRINT', 'LOG',
  'RETURN', 'TRUE', 'FALSE', 'NULL', 'AND', 'OR', 'NOT'
]);

const COMMANDS_SET = new Set(['SCAN', 'CRACK', 'DECRYPT', 'SEND']);

/**
 * Genera HTML con etiquetas de sintaxis para GhostScript.
 * @param {string} code
 * @returns {string} HTML coloreado
 */
export function resaltarSintaxisGhostScript(code) {
  if (!code) return '';

  const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;');

  // Expresión regular que clasifica tokens léxicos
  const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|([=!<>]=?|[+\-*\/%&|!]+)|(\S)/g;

  let html = '';
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(code)) !== null) {
    // Añadir espacios o saltos de línea intermedios
    if (match.index > lastIndex) {
      html += escapeHtml(code.slice(lastIndex, match.index));
    }
    lastIndex = regex.lastIndex;

    const [full, comment, str, num, ident, op] = match;

    if (comment) {
      html += `<span class="cm-ghost-comment">${escapeHtml(comment)}</span>`;
    } else if (str) {
      html += `<span class="cm-ghost-string">${escapeHtml(str)}</span>`;
    } else if (num) {
      html += `<span class="cm-ghost-number">${escapeHtml(num)}</span>`;
    } else if (ident) {
      const upper = ident.toUpperCase();
      if (COMMANDS_SET.has(upper)) {
        html += `<span class="cm-ghost-cmd">${escapeHtml(ident)}</span>`;
      } else if (KEYWORDS_SET.has(upper)) {
        html += `<span class="cm-ghost-keyword">${escapeHtml(ident)}</span>`;
      } else {
        html += `<span class="cm-ghost-ident">${escapeHtml(ident)}</span>`;
      }
    } else if (op) {
      html += `<span class="cm-ghost-op">${escapeHtml(op)}</span>`;
    } else {
      html += escapeHtml(full);
    }
  }

  if (lastIndex < code.length) {
    html += escapeHtml(code.slice(lastIndex));
  }

  // Si termina con salto de línea, añadir un espacio no rompible para sincronizar altura
  if (code.endsWith('\n')) {
    html += '\n';
  }

  return html;
}

// ─────────────────────────────────────────────────
// 3. MOTOR DEL EDITOR (CODEMIRROR 6 / ADAPTER)
// ─────────────────────────────────────────────────

export class GhostScriptEditor {
  constructor(containerEl, initialCode = '') {
    this.container = containerEl;
    this.code = initialCode || PLANTILLAS_GHOSTSCRIPT.hack;
    this.cmView = null;
    this.fallbackElements = null;
    this.init();
  }

  async init() {
    this.container.innerHTML = '';

    // Intentar inicializar CodeMirror 6 vía módulos dinámicos si están disponibles
    let cmLoaded = false;
    if (typeof window !== 'undefined' && window.CodeMirror) {
      try {
        cmLoaded = this.initCodeMirror6(window.CodeMirror);
      } catch (e) {
        console.warn('[GhostScript Editor] Error cargando CodeMirror global:', e);
      }
    }

    // Si no está disponible CodeMirror empaquetado, inicializar el motor nativo de alta fidelidad
    if (!cmLoaded) {
      this.initNativeEngine();
    }
  }

  initNativeEngine() {
    const wrapper = document.createElement('div');
    wrapper.className = 'ghost-fallback-editor';

    const gutter = document.createElement('div');
    gutter.className = 'ghost-gutter';

    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'ghost-code-area-wrapper';

    const highlightLayer = document.createElement('div');
    highlightLayer.className = 'ghost-highlight-layer';

    const textarea = document.createElement('textarea');
    textarea.className = 'ghost-textarea';
    textarea.spellcheck = false;
    textarea.autocomplete = 'off';
    textarea.autocapitalize = 'off';
    textarea.value = this.code;

    codeWrapper.appendChild(highlightLayer);
    codeWrapper.appendChild(textarea);
    wrapper.appendChild(gutter);
    wrapper.appendChild(codeWrapper);
    this.container.appendChild(wrapper);

    this.fallbackElements = {
      wrapper,
      gutter,
      codeWrapper,
      highlightLayer,
      textarea
    };

    const update = () => {
      this.code = textarea.value;
      highlightLayer.innerHTML = resaltarSintaxisGhostScript(this.code);

      // Actualizar números de línea en el gutter
      const lines = this.code.split('\n').length;
      let gutterText = '';
      for (let i = 1; i <= lines; i++) {
        gutterText += i + '\n';
      }
      gutter.textContent = gutterText;

      this.updateMetrics();
    };

    // Sincronizar scroll entre textarea, highlight layer y gutter
    const syncScroll = () => {
      highlightLayer.scrollTop = textarea.scrollTop;
      highlightLayer.scrollLeft = textarea.scrollLeft;
      gutter.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('input', update);
    textarea.addEventListener('scroll', syncScroll);

    // Soporte para tecla Tab (2 espacios)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        update();
      }
    });

    update();
  }

  initCodeMirror6(cm) {
    if (!cm || typeof cm.EditorView !== 'function') return false;

    const { EditorView, basicSetup } = cm;
    const { EditorState } = cm;

    this.cmView = new EditorView({
      state: EditorState.create({
        doc: this.code,
        extensions: [
          basicSetup || [],
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.code = update.state.doc.toString();
              this.updateMetrics();
            }
          })
        ]
      }),
      parent: this.container
    });

    this.updateMetrics();
    return true;
  }

  getCode() {
    if (this.cmView) {
      return this.cmView.state.doc.toString();
    }
    if (this.fallbackElements) {
      return this.fallbackElements.textarea.value;
    }
    return this.code;
  }

  setCode(newCode) {
    this.code = String(newCode || '');
    if (this.cmView) {
      this.cmView.dispatch({
        changes: { from: 0, to: this.cmView.state.doc.length, insert: this.code }
      });
    } else if (this.fallbackElements) {
      this.fallbackElements.textarea.value = this.code;
      this.fallbackElements.highlightLayer.innerHTML = resaltarSintaxisGhostScript(this.code);
      const lines = this.code.split('\n').length;
      let gutterText = '';
      for (let i = 1; i <= lines; i++) gutterText += i + '\n';
      this.fallbackElements.gutter.textContent = gutterText;
    }
    this.updateMetrics();
  }

  focus() {
    if (this.cmView) {
      this.cmView.focus();
    } else if (this.fallbackElements) {
      this.fallbackElements.textarea.focus();
    }
  }

  updateMetrics() {
    const elMetrics = document.getElementById('editor-status-metrics');
    if (!elMetrics) return;
    const lines = this.code.split('\n').length;
    const chars = this.code.length;
    elMetrics.textContent = `${lines} líneas | ${chars} caracteres | Sandbox: Activo`;
  }
}

// ─────────────────────────────────────────────────
// 4. CONTROLADOR DE LA INTERFAZ DEL EDITOR
// ─────────────────────────────────────────────────

/**
 * Abre el editor CodeMirror 6 de GhostScript.
 * @param {object} [opciones={}]
 */
export function abrirEditor(opciones = {}) {
  const overlay = document.getElementById('editor-overlay');
  const codeContainer = document.getElementById('editor-code-container');
  const titleEl = document.getElementById('editor-title');
  const selectTemplate = document.getElementById('editor-select-template');
  const selectReto = document.getElementById('editor-select-reto');
  const consoleOutput = document.getElementById('editor-console-output');

  if (!overlay || !codeContainer) {
    console.error('[GhostScript IDE] Contenedores del DOM no encontrados.');
    return;
  }

  archivoActual = opciones.archivo || 'hack_firewall_beta.gs';
  callbackComprobacion = opciones.onComprobar || null;

  if (selectReto) {
    actualizarSelectorRetos(selectReto, opciones.reto || null);
  }

  if (titleEl) {
    titleEl.textContent = `GHOSTSCRIPT IDE // ${archivoActual.toUpperCase()}`;
  }

  const initialCode = opciones.codigo || PLANTILLAS_GHOSTSCRIPT.hack;

  if (!editorInstancia) {
    editorInstancia = new GhostScriptEditor(codeContainer, initialCode);
    vincularEventosUI();
  } else {
    editorInstancia.setCode(initialCode);
  }

  if (selectTemplate) {
    selectTemplate.value = opciones.plantilla || 'hack';
  }

  if (opciones.reto) {
    seleccionarRetoEnEditor(opciones.reto);
  } else {
    const banner = document.getElementById('editor-challenge-banner');
    if (banner) banner.style.display = 'none';
    retoActivoId = null;
    limpiarConsola();
    imprimirEnConsola(`[+] Sesión de desarrollo iniciada: "${archivoActual}"`, 'info');
    imprimirEnConsola('[+] Escribe tus comandos o pulsa ▶ EJECUTAR para probar en el sandbox.', 'dim');
  }

  overlay.removeAttribute('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    if (editorInstancia) editorInstancia.focus();
  }, 100);

  audio.playKeystroke();
}

/**
 * Cierra la ventana del editor GhostScript.
 */
export function cerrarEditor() {
  const overlay = document.getElementById('editor-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.setAttribute('hidden', '');
    }, 250);
  }
}

/**
 * Imprime una línea formateada en la consola de salida del editor.
 * @param {string} texto
 * @param {'info'|'success'|'error'|'stdout'|'dim'} [tipo='stdout']
 */
export function imprimirEnConsola(texto, tipo = 'stdout') {
  const consoleOutput = document.getElementById('editor-console-output');
  if (!consoleOutput) return;

  const line = document.createElement('div');
  line.className = `console-line console-line--${tipo}`;
  line.textContent = texto;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

/**
 * Limpia la consola de salida.
 */
export function limpiarConsola() {
  const consoleOutput = document.getElementById('editor-console-output');
  if (consoleOutput) {
    consoleOutput.innerHTML = '';
  }
}

/**
 * Ejecuta el código actual en el sandbox de GhostScript.
 * @returns {object} Resultado de la ejecución
 */
export function ejecutarScriptActual() {
  if (!editorInstancia) return null;
  const code = editorInstancia.getCode();

  imprimirEnConsola('────────────────────────────────────────────────────────────', 'dim');
  imprimirEnConsola(`[▶] Ejecutando script (${Date.now()})...`, 'info');

  const inicio = performance.now();
  const res = executeGhostScript(code);
  const duracion = (performance.now() - inicio).toFixed(2);

  if (!res.success) {
    imprimirEnConsola(`[✖] ERROR DE EJECUCIÓN: ${res.error}`, 'error');
    audio.playError();
    actualizarEstadoConsola('ERROR', '#ff5252');
    return res;
  }

  // Imprimir salidas generadas por PRINT
  if (res.output && res.output.length > 0) {
    res.output.forEach(line => imprimirEnConsola(line, 'stdout'));
  }

  // Imprimir paquetes de red emitidos por SEND
  if (res.sentMessages && res.sentMessages.length > 0) {
    res.sentMessages.forEach(m => {
      imprimirEnConsola(`[NET] Transmitido a "${m.host}": ${JSON.stringify(m.message)}`, 'info');
    });
  }

  // Resumen de variables creadas
  const vars = Object.entries(res.env || {}).filter(([k]) => !['NULL', 'TRUE', 'FALSE'].includes(k) && !k.startsWith('__'));
  if (vars.length > 0) {
    imprimirEnConsola(`[+] Variables finales: ${vars.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')}`, 'dim');
  }

  imprimirEnConsola(`[✔] Ejecución completada en ${duracion}ms (${res.operationsCount} ops).`, 'success');
  audio.playSuccess();
  actualizarEstadoConsola('EJECUTADO ✔', 'var(--green-bright)');

  return res;
}

/**
 * Actualiza las opciones del desplegable de retos reflejando el progreso desbloqueado.
 * @param {HTMLSelectElement} selectEl
 * @param {number|null} [idSeleccionado=null]
 */
export function actualizarSelectorRetos(selectEl, idSeleccionado = null) {
  if (!selectEl) return;
  const lista = obtenerListaRetos();
  selectEl.innerHTML = '<option value="none">-- Modo Libre / Plantillas --</option>';

  lista.forEach(r => {
    const opt = document.createElement('option');
    opt.value = String(r.id);
    let estadoIcono = '🔒';
    if (r.completado) estadoIcono = '✔';
    else if (r.desbloqueado) estadoIcono = '🔓';

    opt.textContent = `${estadoIcono} Reto ${r.id}: ${r.titulo.replace('Reto ' + r.id + ' — ', '')} ${r.bloqueado ? '(Bloqueado)' : ''}`;
    if (r.bloqueado) {
      opt.disabled = true;
    }
    selectEl.appendChild(opt);
  });

  if (idSeleccionado) {
    selectEl.value = String(idSeleccionado);
  }
}

/**
 * Selecciona y carga un reto específico en el editor.
 * @param {number|string} idReto
 */
export function seleccionarRetoEnEditor(idReto) {
  const banner = document.getElementById('editor-challenge-banner');
  const titleEl = document.getElementById('editor-challenge-title');
  const descEl = document.getElementById('editor-challenge-desc');
  const critEl = document.getElementById('editor-challenge-criterios');
  const selectReto = document.getElementById('editor-select-reto');

  if (!idReto || idReto === 'none') {
    retoActivoId = null;
    if (banner) banner.style.display = 'none';
    if (selectReto) selectReto.value = 'none';
    return;
  }

  const idNum = parseInt(idReto, 10);
  const reto = BANCO_RETOS.find(r => r.id === idNum);
  if (!reto) return;

  if (!esRetoDesbloqueado(idNum)) {
    imprimirEnConsola(`[!] El Reto #${idNum} está bloqueado. Debes superar el Reto #${idNum - 1} primero.`, 'error');
    audio.playError();
    if (selectReto) selectReto.value = retoActivoId ? String(retoActivoId) : 'none';
    return;
  }

  retoActivoId = idNum;
  if (selectReto) selectReto.value = String(idNum);

  if (banner && titleEl && descEl && critEl) {
    titleEl.textContent = `⚡ [${reto.titulo}]:`;
    descEl.textContent = reto.subtitulo + ' — ' + reto.enunciado;
    critEl.textContent = `[${reto.criterios.descripcion}]`;
    banner.style.display = 'block';
  }

  if (editorInstancia) {
    editorInstancia.setCode(reto.codigoInicial);
  }

  limpiarConsola();
  imprimirEnConsola(`[⚡] ${reto.titulo} // ${reto.subtitulo}`, 'info');
  imprimirEnConsola(`[?] Misión: ${reto.enunciado}`, 'stdout');
  imprimirEnConsola(`[i] Criterios: ${reto.criterios.descripcion}`, 'dim');
  imprimirEnConsola('[+] Escribe tu solución y pulsa ✔ COMPROBAR para verificar los tests.', 'success');
  audio.playKeystroke();
}

/**
 * Valida el script actual contra los criterios de comprobación del reto.
 * @returns {boolean}
 */
export function comprobarScriptActual() {
  if (!editorInstancia) return false;
  const code = editorInstancia.getCode();

  imprimirEnConsola('────────────────────────────────────────────────────────────', 'dim');
  imprimirEnConsola('[✔] Comprobando script en el entorno de validación...', 'info');

  // Modo Reto Específico (Retos 1 a 5)
  if (retoActivoId) {
    const retoInfo = BANCO_RETOS.find(r => r.id === retoActivoId);
    imprimirEnConsola(`[⚡] Evaluando batería de tests para ${retoInfo ? retoInfo.titulo : 'Reto #' + retoActivoId}...`, 'info');

    const resReto = validarReto(retoActivoId, code);

    // Reportar errores individuales
    if (resReto.errores.length > 0) {
      resReto.errores.forEach(err => imprimirEnConsola(`  ${err}`, 'error'));
    }

    imprimirEnConsola(`  [Tests] Casos superados: ${resReto.pasados} de ${resReto.totalTests}`, resReto.pasados === resReto.totalTests ? 'success' : 'error');
    imprimirEnConsola(`  [Eficiencia] Líneas de código: ${resReto.metricas.lines} (máx: ${retoInfo.criterios.maxLines}) | Ciclos CPU: ${resReto.metricas.ops} ops (máx: ${retoInfo.criterios.maxOps})`, resReto.criteriosCumplidos ? 'success' : 'error');

    if (resReto.exito) {
      imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');
      imprimirEnConsola(`★ ¡RETO #${retoActivoId} SUPERADO CON ÉXITO! (+150 PTS)`, 'success');
      if (resReto.desbloqueadoNuevo) {
        imprimirEnConsola(`🔓 ¡Acceso concedido al Reto #${resReto.siguienteReto}!`, 'info');
      }

      // Registrar solución en el Ranking de Elegancia (Prompt B4)
      try {
        const regRank = registrarSolucionEnRanking({
          idReto: retoActivoId,
          codigo: code,
          metricas: resReto.metricas
        });
        if (regRank && regRank.guardado) {
          imprimirEnConsola(`🏆 [RANKING] Solución registrada: #${regRank.posicion} en Elegancia (${regRank.elegancia} pts).`, 'info');
          if (regRank.nuevoRecord) {
            imprimirEnConsola(`✨ ¡NUEVO RÉCORD PERSONAL! (${resReto.metricas.lines} líneas, ${resReto.metricas.ops} ops CPU).`, 'success');
          }
        }
      } catch (errRank) {
        console.warn('[Editor] Error al registrar en ranking:', errRank);
      }

      imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');

      feedbackSuccess(150, `¡${retoInfo.titulo} superado!`);
      audio.playSuccess();
      actualizarEstadoConsola('RETO SUPERADO ✔', 'var(--green-bright)');

      // Refrescar selector de retos con nuevos desbloqueos
      const selectReto = document.getElementById('editor-select-reto');
      if (selectReto) {
        actualizarSelectorRetos(selectReto, retoActivoId);
      }
      return true;
    } else {
      feedbackError(10, 'El script no superó todos los tests o criterios de eficiencia');
      audio.playError();
      actualizarEstadoConsola('CRITERIOS NO CUMPLIDOS ✖', '#ff5252');
      return false;
    }
  }

  // Modo Libre (Verificación general)
  try {
    parseGhostScript(code);
    imprimirEnConsola('  [1/3] Sintaxis GhostScript: CORRECTA ✔', 'success');
  } catch (err) {
    imprimirEnConsola(`  [1/3] Error de sintaxis: ${err.message}`, 'error');
    feedbackError(10, 'Error de sintaxis en script');
    actualizarEstadoConsola('FALLO EN TESTS ✖', '#ff5252');
    return false;
  }

  const res = executeGhostScript(code);
  if (!res.success) {
    imprimirEnConsola(`  [2/3] Fallo en tiempo de ejecución: ${res.error}`, 'error');
    feedbackError(10, 'Fallo de ejecución en script');
    actualizarEstadoConsola('FALLO EN TESTS ✖', '#ff5252');
    return false;
  }
  imprimirEnConsola(`  [2/3] Ejecución en Sandbox: CORRECTA (${res.operationsCount} ops) ✔`, 'success');

  let validacionEspecifica = true;
  if (typeof callbackComprobacion === 'function') {
    try {
      validacionEspecifica = callbackComprobacion(res, code);
    } catch (e) {
      imprimirEnConsola(`  [3/3] Error evaluando tests personalizados: ${e.message}`, 'error');
      validacionEspecifica = false;
    }
  } else {
    if (res.sentMessages.length > 0 || res.output.length > 0 || Object.keys(res.env).length > 3) {
      imprimirEnConsola('  [3/3] Verificación de automatización: APROBADA ✔', 'success');
    } else {
      imprimirEnConsola('  [3/3] Advertencia: El script no produjo salidas ni transmisiones.', 'dim');
    }
  }

  if (validacionEspecifica) {
    imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');
    imprimirEnConsola('★ [ÉXITO TOTAL] ¡Todos los tests de validación han pasado!', 'success');
    imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');
    feedbackSuccess(100, 'Script validado con éxito');
    actualizarEstadoConsola('VALIDADO ✔', 'var(--green-bright)');
    return true;
  } else {
    imprimirEnConsola('[✖] Los resultados no satisfacen todos los criterios del desafío.', 'error');
    feedbackError(10, 'El script no cumple todos los criterios');
    actualizarEstadoConsola('CRITERIOS NO CUMPLIDOS ✖', '#ff5252');
    return false;
  }
}

function actualizarEstadoConsola(texto, color) {
  const statusEl = document.getElementById('editor-console-status');
  if (statusEl) {
    statusEl.textContent = texto;
    statusEl.style.color = color;
  }
}

function vincularEventosUI() {
  const btnRun = document.getElementById('editor-btn-run');
  const btnVerify = document.getElementById('editor-btn-verify');
  const btnClose = document.getElementById('editor-btn-close');
  const btnClear = document.getElementById('editor-btn-clear');
  const selectTemplate = document.getElementById('editor-select-template');
  const selectReto = document.getElementById('editor-select-reto');

  const btnRanking = document.getElementById('editor-btn-ranking');

  if (btnRanking) {
    btnRanking.onclick = () => {
      cerrarEditor();
      if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
        window.navigateTo('screen-script-ranking');
      }
    };
  }

  if (selectReto) {
    selectReto.onchange = () => {
      seleccionarRetoEnEditor(selectReto.value);
    };
  }

  if (btnRun) {
    btnRun.onclick = () => ejecutarScriptActual();
  }

  if (btnVerify) {
    btnVerify.onclick = () => comprobarScriptActual();
  }

  if (btnClose) {
    btnClose.onclick = () => cerrarEditor();
  }

  if (btnClear) {
    btnClear.onclick = () => {
      limpiarConsola();
      actualizarEstadoConsola('LISTO', 'var(--text-dim)');
    };
  }

  if (selectTemplate) {
    selectTemplate.onchange = () => {
      const val = selectTemplate.value;
      if (PLANTILLAS_GHOSTSCRIPT[val]) {
        if (editorInstancia) {
          editorInstancia.setCode(PLANTILLAS_GHOSTSCRIPT[val]);
          imprimirEnConsola(`[+] Plantilla cargada: "${val}"`, 'info');
          audio.playKeystroke();
        }
      }
    };
  }
}

/**
 * Suite de tests unitarios de editor.js con console.assert.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testEditor() {
  console.group('%c[TEST SUITE] Editor GhostScript CodeMirror (editor.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Resaltador de sintaxis
  const html = resaltarSintaxisGhostScript('LET x = 42 // comentario\nSCAN "host"');
  assert(html.includes('cm-ghost-keyword'), 'Debe incluir clase cm-ghost-keyword para LET');
  assert(html.includes('cm-ghost-number'), 'Debe incluir clase cm-ghost-number para 42');
  assert(html.includes('cm-ghost-comment'), 'Debe incluir clase cm-ghost-comment para comentarios');
  assert(html.includes('cm-ghost-cmd'), 'Debe incluir clase cm-ghost-cmd para SCAN');

  // 2. Existencia de plantillas
  assert(typeof PLANTILLAS_GHOSTSCRIPT.hack === 'string', 'Plantilla hack debe existir');
  assert(typeof PLANTILLAS_GHOSTSCRIPT.batch === 'string', 'Plantilla batch debe existir');
  assert(typeof PLANTILLAS_GHOSTSCRIPT.filter === 'string', 'Plantilla filter debe existir');

  // 3. Ejecución de plantilla 'hack'
  const resHack = executeGhostScript(PLANTILLAS_GHOSTSCRIPT.hack);
  assert(resHack.success, 'Plantilla hack debe ser sintácticamente válida y ejecutable');
  assert(resHack.sentMessages.length > 0, 'Plantilla hack debe emitir mensajes por SEND');

  // 4. Ejecución de plantilla 'batch'
  const resBatch = executeGhostScript(PLANTILLAS_GHOSTSCRIPT.batch);
  assert(resBatch.success, 'Plantilla batch debe ser ejecutable');
  assert(resBatch.env.total === 3, 'Plantilla batch debe procesar 3 archivos');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Editor: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Editor: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

