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

import {
  executeGhostScript,
  parseGhostScript,
  tokenizeGhostScript,
  validarSintaxisGhostScript,
  extraerLineaColumnaError
} from './ghostscript.js';
import { BANCO_RETOS, obtenerListaRetos, validarReto, esRetoDesbloqueado } from './retos.js';
import { getState, registerPuzzleSolvedInFirewall } from '../state.js';
import { audio } from '../audio.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { registrarSolucionEnRanking } from './rankingSoluciones.js';

let editorInstancia = null;
let callbackComprobacion = null;
let archivoActual = 'hack_firewall_beta.gs';
let retoActivoId = null;
let nivelObjetivoSuperado = false;

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
 * Genera HTML con etiquetas de sintaxis para una sola línea de GhostScript.
 * @param {string} lineCode
 * @returns {string}
 */
function resaltarLineaGhostScript(lineCode) {
  if (!lineCode) return '';

  const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;');

  const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|([=!<>]=?|[+\-*\/%&|!]+)|(\S)/g;

  let html = '';
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(lineCode)) !== null) {
    if (match.index > lastIndex) {
      html += escapeHtml(lineCode.slice(lastIndex, match.index));
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

  if (lastIndex < lineCode.length) {
    html += escapeHtml(lineCode.slice(lastIndex));
  }

  return html;
}

/**
 * Genera HTML con etiquetas de sintaxis para GhostScript y resaltado de líneas con error.
 * @param {string} code
 * @param {Map<number, { message: string }>|Record<number, string>|null} [erroresPorLinea=null]
 * @returns {string} HTML coloreado línea por línea
 */
export function resaltarSintaxisGhostScript(code, erroresPorLinea = null) {
  if (code === undefined || code === null || code === '') return '';

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const lines = String(code).split('\n');
  return lines.map((lineText, idx) => {
    const lineNum = idx + 1;
    let errMsg = null;
    if (erroresPorLinea instanceof Map && erroresPorLinea.has(lineNum)) {
      const item = erroresPorLinea.get(lineNum);
      errMsg = typeof item === 'string' ? item : item?.message;
    } else if (erroresPorLinea && typeof erroresPorLinea === 'object' && erroresPorLinea[lineNum]) {
      const item = erroresPorLinea[lineNum];
      errMsg = typeof item === 'string' ? item : item?.message;
    }

    const innerHtml = resaltarLineaGhostScript(lineText) || ' ';
    const errorBadge = errMsg
      ? `<span class="ghost-error-inline-hint">⚠ ${escapeHtml(errMsg.replace(/^\[GhostScript [^\]]+\]\s*/i, ''))}</span>`
      : '';
    const cls = errMsg ? 'ghost-code-line ghost-code-line--error' : 'ghost-code-line';

    return `<div class="${cls}" data-line="${lineNum}">${innerHtml}${errorBadge}</div>`;
  }).join('');
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
    this.erroresPorLinea = new Map();
    this.ultimoDiagnostico = { valido: true, errores: [] };
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
    gutter.setAttribute('aria-hidden', 'true');

    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'ghost-code-area-wrapper';

    const highlightLayer = document.createElement('div');
    highlightLayer.className = 'ghost-highlight-layer';

    const textarea = document.createElement('textarea');
    textarea.className = 'ghost-textarea';
    textarea.spellcheck = false;
    textarea.autocomplete = 'off';
    textarea.autocapitalize = 'off';
    textarea.setAttribute('wrap', 'off');
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
      this.validateAndRender();
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

  /**
   * Valida la sintaxis en tiempo real mientras el usuario escribe y actualiza
   * el gutter, el resaltado de línea en el editor y la barra de diagnóstico en vivo.
   */
  validateAndRender(customRuntimeError = null) {
    const diag = validarSintaxisGhostScript(this.code);
    this.ultimoDiagnostico = diag;
    this.erroresPorLinea = new Map();

    if (Array.isArray(diag.errores)) {
      diag.errores.forEach(err => {
        if (err && err.line) {
          this.erroresPorLinea.set(err.line, err);
        }
      });
    }

    if (customRuntimeError && customRuntimeError.line) {
      this.erroresPorLinea.set(customRuntimeError.line, customRuntimeError);
    }

    if (this.fallbackElements) {
      const lines = this.code.split('\n').length;
      this.fallbackElements.highlightLayer.innerHTML = resaltarSintaxisGhostScript(this.code, this.erroresPorLinea);
      this.renderGutterLines(lines, this.erroresPorLinea);
    }

    this.updateLiveSyntaxBar(customRuntimeError || (diag.errores && diag.errores[0]) || null);
    return diag;
  }

  /**
   * Resalta explícitamente una línea con error (sintáctico o de tiempo de ejecución)
   * y desplaza suavemente el editor hacia dicha línea.
   * @param {number} lineNum
   * @param {string} message
   * @param {string} [tipo='RUNTIME']
   */
  highlightErrorLine(lineNum, message, tipo = 'RUNTIME') {
    const totalLines = Math.max(1, this.code.split('\n').length);
    const safeLine = Math.min(Math.max(1, Number(lineNum) || 1), totalLines);
    const errObj = { line: safeLine, column: 1, message: String(message || 'Error en línea ' + safeLine), tipo };
    this.validateAndRender(errObj);

    if (this.fallbackElements && this.fallbackElements.textarea) {
      const targetScrollTop = Math.max(0, (safeLine - 3) * 21);
      this.fallbackElements.textarea.scrollTop = targetScrollTop;
      this.fallbackElements.highlightLayer.scrollTop = targetScrollTop;
      this.fallbackElements.gutter.scrollTop = targetScrollTop;
    }
  }

  updateLiveSyntaxBar(primaryError = null) {
    const bar = document.getElementById('editor-live-syntax-bar');
    const msgEl = document.getElementById('editor-live-syntax-msg');
    const locEl = document.getElementById('editor-live-syntax-loc');
    if (!bar || !msgEl || !locEl) return;

    if (primaryError) {
      const cleanMsg = String(primaryError.message || '').replace(/^\[GhostScript [^\]]+\]\s*/i, '');
      bar.classList.add('editor-live-syntax-bar--error');
      msgEl.textContent = `⚠️ ${cleanMsg}`;
      locEl.textContent = `LÍNEA ${primaryError.line || 1}${primaryError.column ? ', COL ' + primaryError.column : ''} ✖`;
      bar.onclick = () => {
        if (this.fallbackElements && this.fallbackElements.textarea) {
          const targetScrollTop = Math.max(0, ((primaryError.line || 1) - 3) * 21);
          this.fallbackElements.textarea.scrollTop = targetScrollTop;
          this.fallbackElements.textarea.focus();
        }
      };
    } else {
      bar.classList.remove('editor-live-syntax-bar--error');
      msgEl.textContent = '✔ Sintaxis válida — Listo para ejecutar o hackear';
      locEl.textContent = 'SIN ERRORES';
      bar.onclick = null;
    }
  }

  renderGutterLines(lineCount, erroresMap = this.erroresPorLinea) {
    if (!this.fallbackElements || !this.fallbackElements.gutter) return;
    const total = Math.max(1, Number(lineCount) || 1);
    const escapeAttr = (s) => String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let html = '';
    for (let i = 1; i <= total; i++) {
      const err = erroresMap instanceof Map ? erroresMap.get(i) : null;
      if (err) {
        const tip = escapeAttr(err.message || `Error en línea ${i}`);
        html += `<div class="ghost-gutter__line ghost-gutter__line--error" data-line="${i}" title="${tip}"><span class="ghost-gutter__warn-icon">⚠</span>${i}</div>`;
      } else {
        html += `<div class="ghost-gutter__line" data-line="${i}">${i}</div>`;
      }
    }
    this.fallbackElements.gutter.innerHTML = html;
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
              this.validateAndRender();
              this.updateMetrics();
            }
          })
        ]
      }),
      parent: this.container
    });

    this.validateAndRender();
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
      this.validateAndRender();
    } else if (this.fallbackElements) {
      this.fallbackElements.textarea.value = this.code;
      this.validateAndRender();
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
    const estadoSintaxis = this.ultimoDiagnostico && !this.ultimoDiagnostico.valido
      ? `⚠ Error L${this.ultimoDiagnostico.errorLine || 1}`
      : 'Sintaxis OK ✔';
    elMetrics.textContent = `${lines} líneas | ${chars} caracteres | ${estadoSintaxis} | Sandbox: Activo`;
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
    actualizarBotonAvanzarFirewall(false);
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
 * Emite un eco sincronizado en la terminal principal del juego si está disponible.
 * @param {string} texto
 * @param {string} [clase='line--info']
 */
function emitirEcoTerminalJuego(texto, clase = 'line--info') {
  try {
    if (typeof window !== 'undefined' && window.terminal && typeof window.terminal.print === 'function') {
      window.terminal.print(texto, clase);
    }
  } catch (_) {}
}

/**
 * Muestra u oculta el botón para avanzar al siguiente firewall tras superar el objetivo lógico.
 * @param {boolean} visible
 */
function actualizarBotonAvanzarFirewall(visible) {
  nivelObjetivoSuperado = Boolean(visible);
  const btnNextFw = document.getElementById('editor-btn-next-firewall');
  if (btnNextFw) {
    btnNextFw.style.display = visible ? 'inline-flex' : 'none';
  }
}

/**
 * Avanza al siguiente firewall tras haber validado el objetivo lógico del nivel actual.
 */
export function avanzarSiguienteFirewallDesdeEditor() {
  if (!nivelObjetivoSuperado) {
    imprimirEnConsola('[!] Primero debes ejecutar un script sin errores que cumpla el objetivo lógico del nivel actual.', 'error');
    audio.playError();
    return false;
  }

  cerrarEditor();
  emitirEcoTerminalJuego('[+] Objetivo lógico de scripting verificado. Avanzando al siguiente firewall...', 'line--success');

  if (typeof window !== 'undefined' && typeof window.__completarFirewall === 'function') {
    window.__completarFirewall();
    return true;
  }
  return false;
}

/**
 *Evalúa de forma segura con try...catch si el código es sintácticamente correcto
 * y libre de excepciones en tiempo de ejecución. Si hay errores, resalta la línea
 * exacta en el editor y muestra el mensaje devuelto por el intérprete en la consola.
 *
 * @param {string} code
 * @returns {{
 *   ok: boolean,
 *   res: object | null,
 *   errorLine: number | null,
 *   errorMsg: string | null,
 *   duracion: string
 * }}
 */
export function evaluarCodigoSeguroEnEditor(code) {
  const source = String(code ?? '');
  const rawLines = source.split('\n');
  const inicio = performance.now();

  // 1. Validar sintaxis dentro de un bloque try...catch estricto
  try {
    const diag = validarSintaxisGhostScript(source);
    if (!diag.valido) {
      const errInfo = diag.errores[0] || {
        line: diag.errorLine || 1,
        column: diag.errorColumn || 1,
        message: diag.error || 'Error de sintaxis en el código'
      };
      const errObj = new Error(errInfo.message);
      errObj.line = errInfo.line;
      errObj.column = errInfo.column;
      throw errObj;
    }
    // Confirmar parseo formal del AST
    parseGhostScript(source);
  } catch (syntaxErr) {
    const { line, column } = extraerLineaColumnaError(syntaxErr, rawLines.length);
    const lineaTexto = (rawLines[line - 1] || '').trim();
    const msgExacto = syntaxErr.message || 'Error de sintaxis desconocido';

    if (editorInstancia) {
      editorInstancia.highlightErrorLine(line, msgExacto, 'SYNTAX');
    }

    imprimirEnConsola(`[✖] ERROR DE SINTAXIS DETECTADO (Línea ${line}, Col ${column}):`, 'error');
    imprimirEnConsola(`    ${msgExacto}`, 'error');
    if (lineaTexto) {
      imprimirEnConsola(`    Línea ${line} ▸ ${lineaTexto}`, 'dim');
    }
    emitirEcoTerminalJuego(`[✖] [GhostScript IDE] Error en línea ${line}: ${msgExacto}`, 'line--error');
    actualizarBotonAvanzarFirewall(false);

    return {
      ok: false,
      res: null,
      errorLine: line,
      errorMsg: msgExacto,
      duracion: (performance.now() - inicio).toFixed(2)
    };
  }

  // 2. Ejecutar en el entorno aislado (sandbox) dentro de try...catch para capturar excepciones en tiempo de ejecución
  try {
    const res = executeGhostScript(source);
    const duracion = (performance.now() - inicio).toFixed(2);

    if (!res || !res.success) {
      const errMsg = (res && res.error) ? res.error : 'Excepción en tiempo de ejecución';
      const { line } = extraerLineaColumnaError({ line: res?.errorLine, message: errMsg }, rawLines.length);
      const runErr = new Error(errMsg);
      runErr.line = line;
      throw runErr;
    }

    // Limpiar cualquier error de tiempo de ejecución previo
    if (editorInstancia) {
      editorInstancia.validateAndRender(null);
    }

    return {
      ok: true,
      res,
      errorLine: null,
      errorMsg: null,
      duracion
    };
  } catch (runtimeErr) {
    const { line } = extraerLineaColumnaError(runtimeErr, rawLines.length);
    const lineaTexto = (rawLines[line - 1] || '').trim();
    const msgExacto = runtimeErr.message || 'Excepción en tiempo de ejecución';

    if (editorInstancia) {
      editorInstancia.highlightErrorLine(line, msgExacto, 'RUNTIME');
    }

    imprimirEnConsola(`[✖] EXCEPCIÓN EN TIEMPO DE EJECUCIÓN (Línea ${line}):`, 'error');
    imprimirEnConsola(`    ${msgExacto}`, 'error');
    if (lineaTexto) {
      imprimirEnConsola(`    Línea ${line} ▸ ${lineaTexto}`, 'dim');
    }
    emitirEcoTerminalJuego(`[✖] [GhostScript Runtime] Excepción en línea ${line}: ${msgExacto}`, 'line--error');
    actualizarBotonAvanzarFirewall(false);

    return {
      ok: false,
      res: { success: false, error: msgExacto, errorLine: line, output: [], sentMessages: [], env: {}, operationsCount: 0 },
      errorLine: line,
      errorMsg: msgExacto,
      duracion: (performance.now() - inicio).toFixed(2)
    };
  }
}

/**
 * Evalúa si un script sintácticamente válido cumple con el objetivo lógico del nivel actual
 * y registra el progreso para avanzar al siguiente firewall.
 *
 * @param {string} code
 * @param {object} resEjecucion
 * @returns {{ cumplido: boolean, detalle: string, firewallBreached: boolean }}
 */
export function evaluarObjetivoLogicoNivel(code, resEjecucion) {
  // Caso 1: Reto específico activo (Retos 1 a 5)
  if (retoActivoId) {
    const retoInfo = BANCO_RETOS.find(r => r.id === retoActivoId);
    const resReto = validarReto(retoActivoId, code);

    if (resReto.errores.length > 0) {
      resReto.errores.forEach(err => imprimirEnConsola(`  ${err}`, 'error'));
    }
    imprimirEnConsola(`  [Tests del Nivel] Casos superados: ${resReto.pasados} de ${resReto.totalTests}`, resReto.pasados === resReto.totalTests ? 'success' : 'error');
    if (retoInfo) {
      imprimirEnConsola(`  [Eficiencia] Líneas: ${resReto.metricas.lines}/${retoInfo.criterios.maxLines} | Ciclos CPU: ${resReto.metricas.ops}/${retoInfo.criterios.maxOps} ops`, resReto.criteriosCumplidos ? 'success' : 'error');
    }

    if (resReto.exito) {
      const breach = registerPuzzleSolvedInFirewall();
      actualizarBotonAvanzarFirewall(true);
      return {
        cumplido: true,
        detalle: `¡${retoInfo ? retoInfo.titulo : 'Reto #' + retoActivoId} superado! Sub-nodo de firewall vulnerado (${breach.solved}/${breach.required}).`,
        firewallBreached: breach.firewallBreached,
        resReto,
        retoInfo
      };
    }

    actualizarBotonAvanzarFirewall(false);
    return {
      cumplido: false,
      detalle: 'El código es sintácticamente válido pero aún no supera todos los casos de prueba o límites del reto actual.',
      firewallBreached: false,
      resReto,
      retoInfo
    };
  }

  // Caso 2: Callback personalizado del nivel actual
  if (typeof callbackComprobacion === 'function') {
    let aprobado = false;
    try {
      aprobado = Boolean(callbackComprobacion(resEjecucion, code));
    } catch (cbErr) {
      imprimirEnConsola(`  [!] Error al verificar objetivo del nivel: ${cbErr.message}`, 'error');
      aprobado = false;
    }

    if (aprobado) {
      const breach = registerPuzzleSolvedInFirewall();
      actualizarBotonAvanzarFirewall(true);
      return {
        cumplido: true,
        detalle: `Objetivo lógico del nivel verificado (${breach.solved}/${breach.required} sub-nodos).`,
        firewallBreached: breach.firewallBreached
      };
    }

    actualizarBotonAvanzarFirewall(false);
    return {
      cumplido: false,
      detalle: 'El script se ejecutó sin errores de sintaxis, pero no satisfizo la condición lógica del nivel.',
      firewallBreached: false
    };
  }

  // Caso 3: Modo de Hackeo de Firewall Activo (verifica que el script realice operaciones de infiltración: SCAN/CRACK/DECRYPT/SEND o cálculo lógico válido)
  const tieneTransmision = Array.isArray(resEjecucion?.sentMessages) && resEjecucion.sentMessages.length > 0;
  const tieneSalida = Array.isArray(resEjecucion?.output) && resEjecucion.output.length > 0;
  const varsCreadas = Object.keys(resEjecucion?.env || {}).filter(k => !['NULL', 'TRUE', 'FALSE'].includes(k) && !k.startsWith('__'));
  const usaComandosInfiltracion = /\b(SCAN|CRACK|DECRYPT|SEND|LOOP|IF|RETURN)\b/i.test(code);

  if ((tieneTransmision || tieneSalida || resEjecucion?.result !== undefined) && (varsCreadas.length >= 1 || usaComandosInfiltracion)) {
    const breach = registerPuzzleSolvedInFirewall();
    actualizarBotonAvanzarFirewall(true);
    return {
      cumplido: true,
      detalle: `Objetivo lógico de infiltración completado (${breach.solved}/${breach.required} sub-nodos del firewall actual).`,
      firewallBreached: breach.firewallBreached
    };
  }

  actualizarBotonAvanzarFirewall(false);
  return {
    cumplido: false,
    detalle: 'El script no tiene errores de sintaxis, pero debe ejecutar comandos lógicos de infiltración (SCAN, CRACK, DECRYPT, SEND o PRINT/RETURN) para vulnerar el nivel.',
    firewallBreached: false
  };
}

/**
 *Ejecuta el código actual en el sandbox de GhostScript con validación de sintaxis y objetivo lógico.
 * @returns {object} Resultado de la ejecución
 */
export function ejecutarScriptActual() {
  if (!editorInstancia) return null;
  const code = editorInstancia.getCode();

  imprimirEnConsola('────────────────────────────────────────────────────────────', 'dim');
  imprimirEnConsola(`[▶] Validando sintaxis y ejecutando script en sandbox seguro...`, 'info');

  const evalRes = evaluarCodigoSeguroEnEditor(code);
  if (!evalRes.ok || !evalRes.res) {
    audio.playError();
    feedbackError(10, `Error en línea ${evalRes.errorLine || 1}`);
    actualizarEstadoConsola(`ERROR LÍNEA ${evalRes.errorLine || 1} ✖`, '#ff5252');
    return evalRes.res || {
      success: false,
      error: evalRes.errorMsg,
      errorLine: evalRes.errorLine,
      output: [],
      sentMessages: [],
      env: {},
      operationsCount: 0
    };
  }

  const { res, duracion } = evalRes;
  imprimirEnConsola('  [1/2] Validación sintáctica: CORRECTA ✔', 'success');

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

  imprimirEnConsola(`[✔] Ejecución en sandbox completada en ${duracion}ms (${res.operationsCount} ops).`, 'success');

  // Evaluar también si cumple el objetivo lógico del nivel actual
  const objNivel = evaluarObjetivoLogicoNivel(code, res);
  if (objNivel.cumplido) {
    imprimirEnConsola(`  [2/2] Objetivo lógico del nivel: CUMPLIDO ✔ — ${objNivel.detalle}`, 'success');
    imprimirEnConsola('🔓 [SISTEMA] Puedes pulsar [🔓 AVANZAR FIREWALL ▸] en la barra superior para pasar al siguiente firewall.', 'info');
    emitirEcoTerminalJuego(`[+] [GhostScript IDE] ${objNivel.detalle}`, 'line--success');
    actualizarEstadoConsola('OBJETIVO CUMPLIDO ✔', 'var(--green-bright)');
  } else {
    imprimirEnConsola(`  [2/2] Estado del objetivo del nivel: ${objNivel.detalle}`, 'dim');
    actualizarEstadoConsola('EJECUTADO ✔', 'var(--green-bright)');
  }

  audio.playSuccess();
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

  actualizarBotonAvanzarFirewall(false);

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
  imprimirEnConsola('[+] Escribe tu solución y pulsa ⚡ HACKEAR / COMPROBAR para verificar el objetivo del nivel.', 'success');
  audio.playKeystroke();
}

/**
 * Valida la sintaxis y ejecución del script actual mediante try...catch y comprueba
 * si cumple el objetivo lógico del nivel actual antes de avanzar al siguiente firewall.
 * @returns {boolean}
 */
export function comprobarScriptActual() {
  if (!editorInstancia) return false;
  const code = editorInstancia.getCode();

  imprimirEnConsola('────────────────────────────────────────────────────────────', 'dim');
  imprimirEnConsola('[⚡] Iniciando validación sintáctica y evaluación del objetivo del nivel...', 'info');

  // Paso 1 y 2: Evaluar sintaxis y ejecución con try...catch estricto y resaltado de línea de error
  const evalRes = evaluarCodigoSeguroEnEditor(code);
  if (!evalRes.ok || !evalRes.res) {
    feedbackError(10, `Error en línea ${evalRes.errorLine || 1}`);
    audio.playError();
    actualizarEstadoConsola(`ERROR LÍNEA ${evalRes.errorLine || 1} ✖`, '#ff5252');
    return false;
  }

  imprimirEnConsola('  [1/3] Sintaxis GhostScript: CORRECTA ✔', 'success');
  imprimirEnConsola(`  [2/3] Ejecución en Sandbox: CORRECTA (${evalRes.res.operationsCount} ops) ✔`, 'success');

  // Paso 3: Evaluar si cumple con el objetivo lógico del nivel actual
  const objRes = evaluarObjetivoLogicoNivel(code, evalRes.res);

  if (retoActivoId && objRes.resReto) {
    const { resReto, retoInfo } = objRes;
    if (objRes.cumplido) {
      imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');
      imprimirEnConsola(`★ ¡RETO #${retoActivoId} SUPERADO CON ÉXITO! (+150 PTS)`, 'success');
      if (resReto.desbloqueadoNuevo) {
        imprimirEnConsola(`🔓 ¡Acceso concedido al Reto #${resReto.siguienteReto}!`, 'info');
      }

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

      imprimirEnConsola(`🔓 [FIREWALL] ${objRes.detalle}`, 'info');
      imprimirEnConsola('🔓 Pulsa [🔓 AVANZAR FIREWALL ▸] en la barra superior para continuar al siguiente firewall.', 'success');
      imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');

      emitirEcoTerminalJuego(`[★] [GhostScript IDE] ${objRes.detalle}`, 'line--success');
      feedbackSuccess(150, `¡${retoInfo ? retoInfo.titulo : 'Reto'} superado!`);
      audio.playSuccess();
      actualizarEstadoConsola('RETO SUPERADO ✔', 'var(--green-bright)');

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

  if (objRes.cumplido) {
    imprimirEnConsola(`  [3/3] Verificación de objetivo del nivel: APROBADA ✔ (${objRes.detalle})`, 'success');
    imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');
    imprimirEnConsola('★ [ÉXITO TOTAL] ¡Objetivo lógico del nivel superado! Listo para avanzar al siguiente firewall.', 'success');
    imprimirEnConsola('🔓 Pulsa [🔓 AVANZAR FIREWALL ▸] en la barra de herramientas para avanzar de nivel.', 'info');
    imprimirEnConsola('════════════════════════════════════════════════════════════', 'success');
    emitirEcoTerminalJuego(`[★] [GhostScript IDE] ${objRes.detalle}`, 'line--success');
    feedbackSuccess(100, 'Objetivo lógico del nivel validado con éxito');
    audio.playSuccess();
    actualizarEstadoConsola('VALIDADO ✔', 'var(--green-bright)');
    return true;
  } else {
    imprimirEnConsola(`  [3/3] Objetivo del nivel pendiente: ${objRes.detalle}`, 'error');
    imprimirEnConsola('[✖] Los resultados aún no satisfacen el objetivo lógico del nivel actual.', 'error');
    feedbackError(10, 'El script no cumple el objetivo lógico del nivel');
    audio.playError();
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
  const btnNextFirewall = document.getElementById('editor-btn-next-firewall');
  const btnClose = document.getElementById('editor-btn-close');
  const btnClear = document.getElementById('editor-btn-clear');
  const selectTemplate = document.getElementById('editor-select-template');
  const selectReto = document.getElementById('editor-select-reto');
  const btnRanking = document.getElementById('editor-btn-ranking');

  if (btnNextFirewall) {
    btnNextFirewall.onclick = () => avanzarSiguienteFirewallDesdeEditor();
  }

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
          actualizarBotonAvanzarFirewall(false);
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

  // 5. Verificación de numeración de líneas vertical (gutter) y detector de errores en tiempo real
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    const inst = new GhostScriptEditor(tempDiv, 'LET a = 1\nLET b = 2\nPRINT a + b');
    const gutterLines = tempDiv.querySelectorAll('.ghost-gutter__line');
    assert(gutterLines.length === 3, 'El gutter debe renderizar exactamente 3 bloques verticales .ghost-gutter__line para 3 líneas de código');
    assert(gutterLines[0]?.textContent === '1' && gutterLines[2]?.textContent === '3', 'Los números de línea del gutter deben ser secuenciales (1, 2, 3)');

    // Probar detección de error de sintaxis en tiempo real en la línea 2
    inst.setCode('LET a = 1\nPRNT "error de escritura"\nPRINT a');
    const errorGutterLine = tempDiv.querySelector('.ghost-gutter__line--error');
    const errorCodeLine = tempDiv.querySelector('.ghost-code-line--error');
    assert(errorGutterLine !== null && errorGutterLine.getAttribute('data-line') === '2', 'El validador en tiempo real debe marcar la línea 2 en rojo en el gutter ante un comando inválido');
    assert(errorCodeLine !== null && errorCodeLine.getAttribute('data-line') === '2', 'El validador en tiempo real debe resaltar la línea 2 en rojo en el área de código');
  }

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Editor: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Editor: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

