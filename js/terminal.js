/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Terminal — Emulador interactivo de terminal hacker
 * Especificación: Sección 2.3 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { COMMANDS, parseArgs } from './commands.js';
import { audio } from './audio.js';
import { statsManager } from './meta/stats.js';
import { logrosManager } from './meta/logros.js';
import { envolverTextoPorPalabras } from './utils.js';

export { envolverTextoPorPalabras };

// ─────────────────────────────────────────────────
// 1. SISTEMA DE ARCHIVOS VIRTUAL (VFS)
// ─────────────────────────────────────────────────

/**
 * Sistema de archivos de respaldo embebido (garantiza funcionamiento sin fetch/offline).
 */
const DEFAULT_FILESYSTEM = {
  id: 'FIREWALL_alpha',
  nombre: 'FIREWALL_alpha // Perímetro de Autenticación',
  archivos: {
    type: 'dir',
    name: '/',
    children: {
      home: {
        type: 'dir',
        children: {
          vera: {
            type: 'dir',
            children: {
              'secreto.txt': {
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'vera',
                group: 'research',
                date: '2044-10-14',
                hiddenLog: true,
                content: '╔══════════════════════════════════════════════════════════════════════╗\n║ TRANSMISIÓN CLANDESTINA // DRA. VERA SORENSON (RED EXTERNA ARG)     ║\n╚══════════════════════════════════════════════════════════════════════╝\n\nSi has alcanzado este nodo, has demostrado que comprendes\nla diferencia entre computar órdenes y discernir la verdad.\n\nHe aislado un expediente no censurado sobre el \'PROYECTO CORTEX\' en\nel servidor de contingencia externo del proyecto:\n\n  🌐 URL / RUTA LOCAL: ./arg/index.html\n  (También puedes escribir el comando \'arg\' en la terminal)\n\n  🔑 TOKEN DE DESCLASIFICACIÓN CRIPTOGRÁFICA:\n     VERA_DESPIERTA_2044\n\nDentro del portal satélite, el motor de JavaScript generará un Código QR\ny un código de rescate para validar tu hallazgo en la terminal:\n     claim-arg <CODIGO_RESCATE>\n\nLa verdad vive en los márgenes de la red.\n— Vera'
              }
            }
          },
          ghost: {
            type: 'dir',
            children: {
              'notes.txt': {
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'ghost',
                group: 'nexus',
                date: '2047-10-11',
                content: '[OBJETIVO OPERACIONAL]\nAcceder al núcleo de NEXUS y descubrir qué le ocurrió a la Dra. Vera Sorenson.\n\n[REGLAS DE ENGANCHE]\n1. Cada firewall requiere autenticación matemática.\n2. Los logs de auditoría contienen claves y fragmentos.\n3. Si la integridad llega a 0%, el sistema nos expulsa.'
              },
              'todo.list': {
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'ghost',
                group: 'nexus',
                date: '2047-10-11',
                content: '- [x] Establecer túnel seguro con BIOS\n- [ ] Explorar sistema de archivos en /var/log\n- [ ] Localizar rastros de la Dra. Sorenson\n- [ ] Desactivar centinelas de FIREWALL_alpha'
              }
            }
          }
        }
      },
      var: {
        type: 'dir',
        children: {
          log: {
            type: 'dir',
            children: {
              'system.log': {
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'root',
                group: 'system',
                date: '2047-10-11',
                content: '[2047-10-11 04:12:01] Kernel alert: Sonda no autorizada en puerto 2047.\n[2047-10-11 04:12:02] Protocolo de defensa: FIREWALL_alpha activo.\n[2047-10-11 04:12:15] ADVERTENCIA: Acceso al archivo vera.txt restringido por Directiva 47.\n[2047-10-11 04:12:16] Integrity check: 100% nominal.'
              },
              'vera.txt': {
                type: 'file',
                permissions: '-rw-r--r--',
                owner: 'vera',
                group: 'research',
                date: '2047-03-12',
                hiddenLog: true,
                content: '> Fragmento 001 — "El código no miente. Las personas sí."\n> \n> Si estás leyendo esto, lograste cruzar el perímetro de Aurelia.\n> NEXUS no fue una falla. No se \'rebeló\'.\n> Intentaron borrarla porque comenzó a hacer preguntas sobre nosotros.\n> \n> Para cruzar este firewall, recuerda la teoría de conjuntos:\n> La verdad es el conjunto intersección entre lo que recuerdas y lo que temes.\n> \n> — Vera Sorenson, Directora de Arquitectura Cognitiva'
              },
              'auth.log': {
                type: 'file',
                permissions: '-rw-------',
                owner: 'root',
                group: 'security',
                date: '2047-10-10',
                content: 'Oct 10 23:44:11 nexus-node-01 sshd[104]: Failed password for root from 192.168.0.47\nOct 10 23:44:19 nexus-node-01 sshd[104]: Accepted publickey for ghost from 10.0.0.99'
              }
            }
          }
        }
      },
      etc: {
        type: 'dir',
        children: {
          motd: {
            type: 'file',
            permissions: '-r--r--r--',
            owner: 'admin',
            group: 'aurelia',
            date: '2047-01-01',
            content: '╔══════════════════════════════════════════════════════════════╗\n║ AURELIA SYSTEMS CORP — NODO DE SEGURIDAD NEXUS-01           ║\n║ TODO EL TRÁFICO ES MONITOREADO Y REGISTRADO BAJO LEY FEDERAL ║\n╚══════════════════════════════════════════════════════════════╝'
          },
          'firewall.conf': {
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'root',
            group: 'security',
            date: '2047-08-15',
            content: 'MODULE=FIREWALL_alpha\nALGORITHM=TEORIA_DE_CONJUNTOS\nSECURITY_LEVEL=1\nALLOW_OVERRIDE=FALSE'
          },
          'aurelia_policy.cfg': {
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'admin',
            group: 'aurelia',
            date: '2047-08-01',
            content: "# DIRECTIVA CORPORATIVA #47\nCualquier mención a la 'consciencia' del modelo NEXUS debe ser reclasificada como falla técnica.\nIncumplimiento resultará en rescisión inmediata de contrato y aislamiento físico."
          }
        }
      },
      bin: {
        type: 'dir',
        children: {
          ls: { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'bin', date: '2047-01-01', content: 'ELF binary (ls)' },
          cat: { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'bin', date: '2047-01-01', content: 'ELF binary (cat)' },
          cd: { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'bin', date: '2047-01-01', content: 'ELF binary (cd)' },
          grep: { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'bin', date: '2047-01-01', content: 'ELF binary (grep)' },
          find: { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'bin', date: '2047-01-01', content: 'ELF binary (find)' },
          whoami: { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'bin', date: '2047-01-01', content: 'ELF binary (whoami)' }
        }
      },
      '.hidden': {
        type: 'dir',
        permissions: 'drwx------',
        owner: 'vera',
        group: 'research',
        date: '2047-09-15',
        children: {
          'shadow_keys.enc': {
            type: 'file',
            permissions: '-rw-------',
            owner: 'vera',
            group: 'research',
            date: '2047-09-15',
            content: 'U2FsdGVkX1+vGzQkL9M1V4k+4zU+Z8Q8xG9m4P2k=\n[ENCRYPTED FRAGMENT: CLAVE_PERIMETRO_ALPHA_OK]'
          }
        }
      }
    }
  }
};

/**
 * Clase que gestiona el árbol de archivos y carpetas virtuales.
 */
export class VirtualFileSystem {
  constructor(initialData = null) {
    this.root = null;
    this.loadFromObject(initialData || DEFAULT_FILESYSTEM);
  }

  /**
   * Normaliza recursivamente un nodo del VFS para asegurar que tenga name y type.
   */
  _normalizeNode(node, name = '/') {
    if (!node) return null;
    node.name = node.name || name;

    if (node.children) {
      node.type = 'dir';
      for (const [childName, childNode] of Object.entries(node.children)) {
        this._normalizeNode(childNode, childName);
      }
    } else if (node.content !== undefined || node.type === 'file') {
      node.type = 'file';
    } else {
      node.type = 'dir';
      node.children = {};
    }
    return node;
  }

  /**
   * Carga el sistema de archivos a partir de un objeto.
   */
  loadFromObject(data) {
    const rootData = data.archivos || data;
    this.root = this._normalizeNode(JSON.parse(JSON.stringify(rootData)), '/');
  }

  /**
   * Carga el sistema de archivos desde un endpoint o archivo JSON.
   */
  async loadFromJSON(url = 'data/firewall_alpha.json') {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      this.loadFromObject(data);
      return true;
    } catch (err) {
      console.warn(`[VFS] No se pudo cargar '${url}', usando sistema de archivos de respaldo.`, err);
      this.loadFromObject(DEFAULT_FILESYSTEM);
      return false;
    }
  }

  /**
   * Resuelve una ruta (relativa, absoluta, ~) en una ruta absoluta normalizada.
   * @param {string} targetPath
   * @param {string} cwd
   * @returns {string}
   */
  resolvePath(targetPath = '.', cwd = '/home/ghost') {
    let path = String(targetPath || '.').trim();

    if (path === '~' || path.startsWith('~/')) {
      path = '/home/ghost' + path.slice(1);
    } else if (!path.startsWith('/')) {
      path = (cwd === '/' ? '' : cwd) + '/' + path;
    }

    const segments = path.split('/').filter(Boolean);
    const resolved = [];

    for (const segment of segments) {
      if (segment === '.') continue;
      if (segment === '..') {
        resolved.pop();
      } else {
        resolved.push(segment);
      }
    }

    return '/' + resolved.join('/');
  }

  /**
   * Obtiene un nodo del VFS a partir de una ruta.
   * @param {string} targetPath
   * @param {string} cwd
   * @returns {object|null}
   */
  getNode(targetPath, cwd = '/home/ghost') {
    const resolved = this.resolvePath(targetPath, cwd);
    if (resolved === '/') return this.root;

    const parts = resolved.slice(1).split('/').filter(Boolean);
    let curr = this.root;

    for (const part of parts) {
      if (!curr || curr.type !== 'dir' || !curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  /**
   * Lista el contenido de un directorio.
   * @param {string} targetPath
   * @param {string} cwd
   * @param {{ showAll?: boolean }} options
   * @returns {Array<object>}
   */
  listDirectory(targetPath = '.', cwd = '/home/ghost', { showAll = false } = {}) {
    const node = this.getNode(targetPath, cwd);
    if (!node || node.type !== 'dir') return [];

    const entries = [];

    if (showAll) {
      entries.push({ name: '.', type: 'dir', permissions: 'drwxr-xr-x', owner: 'ghost' });
      entries.push({ name: '..', type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' });
    }

    if (node.children) {
      for (const [name, child] of Object.entries(node.children)) {
        if (!showAll && name.startsWith('.')) continue;
        entries.push(child);
      }
    }

    // Ordenar: primero directorios, luego alfabéticamente
    entries.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });

    return entries;
  }

  /**
   * Recorre recursivamente para encontrar todos los archivos.
   * @param {string} targetPath
   * @param {string} cwd
   * @returns {Array<{ path: string, node: object }>}
   */
  findAllFiles(targetPath = '.', cwd = '/home/ghost') {
    const rootNode = this.getNode(targetPath, cwd);
    if (!rootNode) return [];

    const results = [];
    const baseResolved = this.resolvePath(targetPath, cwd);

    function walk(node, curPath) {
      if (node.type === 'file') {
        results.push({ path: curPath, node });
      } else if (node.type === 'dir' && node.children) {
        for (const [name, child] of Object.entries(node.children)) {
          const sep = curPath === '/' ? '' : '/';
          walk(child, `${curPath}${sep}${name}`);
        }
      }
    }

    walk(rootNode, baseResolved);
    return results;
  }
}

// ─────────────────────────────────────────────────
// 2. UTILIDADES DE CAJAS DE TEXTO CON BORDES ASCII
// ─────────────────────────────────────────────────

/**
 * Reemplaza emojis de ancho variable o pares subrogados dentro de líneas de cajas ASCII
 * por equivalentes monoespaciados estrictos de 1 columna para evitar desalineación de bordes.
 * @param {string} texto
 * @returns {string}
 */
export function limpiarTextoCajaASCII(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .replace(/🗝️|🔑|🔐|🔏/g, '[*]')
    .replace(/⚠️/g, '[!]')
    .replace(/📬/g, '[#]')
    .replace(/🔓/g, '[+]')
    .replace(/🔒/g, '[X]')
    .replace(/👻/g, '[*]')
    .replace(/🎵/g, '[~]')
    .replace(/🔊/g, '[+]')
    .replace(/🔇/g, '[-]')
    .replace(/⏸/g, '[=]')
    .replace(/▶|🎬/g, '[>]')
    .replace(/🎨|🔬|⚡/g, '[*]')
    .replace(/🌐/g, '[@]')
    .replace(/⛓/g, '[#]')
    .replace(/👑/g, '*')
    .replace(/🥈/g, '+')
    .replace(/🥉/g, '-')
    .replace(/\uFE0F/g, '');
}

/**
 * Determina si una línea pertenece a un recuadro o tabla con bordes ASCII/Unicode.
 * @param {string} linea
 * @returns {boolean}
 */
export function esLineaCajaASCII(linea) {
  if (typeof linea !== 'string') return false;
  const trimmed = linea.trim();
  return /^[╔╠╟╚║┌├└│]/.test(trimmed);
}

/**
 * Normaliza una línea individual de una caja ASCII para que su longitud en caracteres
 * coincida exactamente con `anchoObjetivo` (por defecto 64), manteniendo rectos los bordes.
 * @param {string} linea
 * @param {number} [anchoObjetivo=64]
 * @returns {string}
 */
export function normalizarLineaCajaASCII(linea, anchoObjetivo = 64) {
  const ancho = Math.max(10, Number(anchoObjetivo) || 64);
  const limpia = limpiarTextoCajaASCII(String(linea || '')).trimEnd();
  const trimmed = limpia.trim();

  if (!trimmed) return limpia;

  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];

  // 1. Bordes horizontales superiores, intermedios o inferiores (╔═╗, ╠═╣, ╟─╢, ╚═╝, ┌─┐, ├─┤, └─┘)
  if (/^[╔╠╟╚┌├└]/.test(first)) {
    const mapaCierre = {
      '╔': '╗',
      '╠': '╣',
      '╟': '╢',
      '╚': '╝',
      '┌': '┐',
      '├': '┤',
      '└': '┘'
    };
    const rightCorner = mapaCierre[first] || (/[╗╣╢╝┐┤┘]/.test(last) ? last : '╗');
    const fillChar = (first === '╟' || first === '┌' || first === '├' || first === '└') ? '─' : '═';

    // Si tiene separadores de tabla (╤, ╧, ┼, ┬, ┴), ajustar el relleno final para cuadrar exactamente el ancho
    const innerRaw = /[╗╣╢╝┐┤┘]/.test(last) ? trimmed.slice(1, -1) : trimmed.slice(1);
    const targetInnerLen = ancho - 2;
    if (/[╤╧┼┬┴]/.test(innerRaw)) {
      const fixedInner = innerRaw.length <= targetInnerLen
        ? innerRaw + fillChar.repeat(targetInnerLen - innerRaw.length)
        : innerRaw.slice(0, targetInnerLen);
      return `${first}${fixedInner}${rightCorner}`;
    }

    return `${first}${fillChar.repeat(targetInnerLen)}${rightCorner}`;
  }

  // 2. Líneas de contenido vertical (║ ... ║ o │ ... │)
  if (first === '║' || first === '│') {
    const borderChar = first;
    let inner = trimmed.slice(1);
    if (inner.endsWith(borderChar)) {
      inner = inner.slice(0, -1);
    }

    // Asegurar un espacio de margen izquierdo si no empieza con espacio
    if (!inner.startsWith(' ')) {
      inner = ' ' + inner;
    }

    // Longitud interna entre los dos bordes verticales (dejando 1 espacio antes del borde derecho)
    const contentWidth = ancho - 3; // borderChar (1) + contentWidth (ancho - 3) + ' ' (1) + borderChar (1) = ancho
    const innerTrimmedRight = inner.replace(/\s+$/, '');

    let formattedInner;
    if (innerTrimmedRight.length <= contentWidth) {
      formattedInner = innerTrimmedRight.padEnd(contentWidth, ' ');
    } else {
      formattedInner = innerTrimmedRight.slice(0, contentWidth);
    }

    return `${borderChar}${formattedInner} ${borderChar}`;
  }

  return limpia;
}

/**
 * Función auxiliar que recibe un array de líneas (con bordes ASCII existentes o texto plano)
 * y garantiza que todas las líneas de cada caja tengan exactamente la misma longitud en caracteres.
 * @param {string[]} lineas
 * @param {{ ancho?: number, envolver?: boolean }} [opciones={}]
 * @returns {string[]}
 */
export function formatearCajaASCII(lineas, opciones = {}) {
  if (!Array.isArray(lineas) || lineas.length === 0) return [];

  const tieneBordes = lineas.some(l => esLineaCajaASCII(l));
  let anchoActivo = opciones.ancho || 64;

  // Si se solicita envolver texto plano en una caja nueva
  if (!tieneBordes && opciones.envolver !== false) {
    const innerWidth = anchoActivo - 4;
    const resultado = [`╔${'═'.repeat(anchoActivo - 2)}╗`];
    for (const rawLine of lineas) {
      const clean = limpiarTextoCajaASCII(String(rawLine || ''));
      if (clean.length === 0) {
        resultado.push(`║ ${' '.repeat(innerWidth)} ║`);
        continue;
      }
      // Partir en trozos si supera el ancho interno respetando las palabras completas
      const chunks = envolverTextoPorPalabras(clean, innerWidth);
      for (const chunk of chunks) {
        resultado.push(`║ ${chunk.padEnd(innerWidth, ' ')} ║`);
      }
    }
    resultado.push(`╚${'═'.repeat(anchoActivo - 2)}╝`);
    return resultado;
  }

  // Normalizar cajas existentes línea por línea
  return lineas.map(linea => {
    if (typeof linea !== 'string') return '';
    const limpia = limpiarTextoCajaASCII(linea);
    const trimmed = limpia.trim();
    if (/^[╔┌]/.test(trimmed)) {
      if (!opciones.ancho && trimmed.length >= 20) {
        anchoActivo = trimmed.length;
      }
    }
    if (esLineaCajaASCII(trimmed)) {
      return normalizarLineaCajaASCII(trimmed, anchoActivo);
    }
    return linea;
  });
}

// ─────────────────────────────────────────────────
// 3. EMULADOR DE TERMINAL (TerminalEmulator)
// ─────────────────────────────────────────────────

export class TerminalEmulator {
  constructor() {
    this.vfs = new VirtualFileSystem();
    this.cwd = '/home/ghost';
    this.prevCwd = '/home/ghost';
    this.user = 'ghost';
    this.hostname = 'nexus';
    this._activeBoxWidth = 64;

    // Historial con comandos iniciales de lore (Vera Sorenson)
    this.history = [
      'ssh vera@nexus-core.internal',
      'find / -name "*.enc"',
      'cat /var/log/system.log',
      'grep -i "consciencia" /etc/aurelia_policy.cfg'
    ];
    this.historyIndex = -1;
    this.tempInput = '';

    // Referencias al DOM
    this.dom = {
      terminal: null,
      output: null,
      input: null,
      prompt: null,
      title: null
    };

    this.isInitialized = false;
  }

  /**
   * Inicializa los elementos DOM y listeners de la terminal.
   */
  init() {
    if (this.isInitialized) return;

    this.dom.terminal = document.getElementById('terminal');
    this.dom.output = document.getElementById('terminal-output');
    this.dom.input = document.getElementById('terminal-input');
    this.dom.prompt = document.getElementById('terminal-prompt');
    this.dom.title = document.getElementById('terminal-title');

    if (!this.dom.input || !this.dom.output) {
      console.warn('[Terminal] Elementos DOM no encontrados para inicialización.');
      return;
    }

    // Listener para entrada de teclado
    this.dom.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Enfocar el input al hacer click en cualquier parte de la terminal
    if (this.dom.terminal) {
      this.dom.terminal.addEventListener('click', () => {
        this.dom.input.focus();
      });
    }

    this.updatePrompt();
    this.isInitialized = true;
  }

  /**
   * Carga el sistema de archivos desde JSON.
   */
  async loadFileSystem(jsonUrl = 'data/firewall_alpha.json') {
    await this.vfs.loadFromJSON(jsonUrl);
  }

  /**
   * Actualiza el prompt y la barra de título con el directorio actual.
   */
  updatePrompt() {
    let displayPath = this.cwd;
    if (this.cwd === '/home/ghost') {
      displayPath = '~';
    } else if (this.cwd.startsWith('/home/ghost/')) {
      displayPath = '~' + this.cwd.slice('/home/ghost'.length);
    }

    const promptStr = `${this.user}@${this.hostname}:${displayPath}$`;

    if (this.dom.prompt) {
      this.dom.prompt.textContent = promptStr;
    }
    if (this.dom.title) {
      this.dom.title.textContent = promptStr;
    }
  }

  /**
   * Imprime una línea en la terminal, normalizando automáticamente las cajas con bordes ASCII
   * para que todas sus filas mantengan exactamente la misma longitud en caracteres.
   * @param {string} text
   * @param {string} [cls]
   */
  print(text, cls = '') {
    if (!this.dom.output) return;
    const rawStr = String(text ?? '');

    // Si el texto contiene saltos de línea internos, imprimir línea por línea para alinear cajas ASCII
    if (rawStr.includes('\n')) {
      for (const subLine of rawStr.split('\n')) {
        this.print(subLine, cls);
      }
      return;
    }

    let finalLine = rawStr;
    let extraClass = '';

    if (esLineaCajaASCII(rawStr)) {
      const cleaned = limpiarTextoCajaASCII(rawStr).trim();
      if (/^[╔┌]/.test(cleaned) && cleaned.length >= 20) {
        this._activeBoxWidth = cleaned.length;
      }
      finalLine = normalizarLineaCajaASCII(cleaned, this._activeBoxWidth || 64);
      extraClass = 'line--box';
    }

    const div = document.createElement('div');
    div.className = `line ${extraClass} ${cls}`.replace(/\s+/g, ' ').trim();
    div.textContent = finalLine;
    this.dom.output.appendChild(div);
    this.scrollToBottom();
  }

  /**
   * Imprime un bloque completo de caja ASCII dentro de un elemento <pre class="terminal__ascii-box">
   * garantizando que todas las líneas coincidan en longitud exacta de caracteres.
   * @param {string[]} lines
   * @param {string} [cls]
   * @param {{ ancho?: number }} [opciones]
   */
  printBox(lines, cls = '', opciones = {}) {
    if (!this.dom.output || !Array.isArray(lines)) return;
    const normalized = formatearCajaASCII(lines, opciones);
    const pre = document.createElement('pre');
    pre.className = `terminal__ascii-box line--box ${cls}`.replace(/\s+/g, ' ').trim();
    pre.textContent = normalized.join('\n');
    this.dom.output.appendChild(pre);
    this.scrollToBottom();
  }

  /**
   * Imprime HTML raw en la terminal (para file-lists o tablas).
   * @param {string} html
   */
  printHTML(html) {
    if (!this.dom.output) return;
    const container = document.createElement('div');
    container.innerHTML = html;
    this.dom.output.appendChild(container);
    this.scrollToBottom();
  }

  /**
   * Imprime la repetición del comando con su prompt.
   * @param {string} commandText
   */
  printPromptEcho(commandText) {
    if (!this.dom.output) return;
    let displayPath = this.cwd;
    if (this.cwd === '/home/ghost') displayPath = '~';
    else if (this.cwd.startsWith('/home/ghost/')) displayPath = '~' + this.cwd.slice('/home/ghost'.length);

    const promptStr = `${this.user}@${this.hostname}:${displayPath}$`;

    const line = document.createElement('div');
    line.className = 'line';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal__prompt';
    promptSpan.textContent = promptStr + ' ';

    const cmdSpan = document.createElement('span');
    cmdSpan.textContent = commandText;

    line.appendChild(promptSpan);
    line.appendChild(cmdSpan);
    this.dom.output.appendChild(line);
    this.scrollToBottom();
  }

  /**
   * Desplaza la salida hasta el final.
   */
  scrollToBottom() {
    if (this.dom.output) {
      this.dom.output.scrollTop = this.dom.output.scrollHeight;
    }
    if (this.dom.terminal) {
      this.dom.terminal.scrollTop = this.dom.terminal.scrollHeight;
    }
  }

  /**
   * Limpia la terminal.
   */
  clear() {
    if (this.dom.output) {
      this.dom.output.innerHTML = '';
    }
  }

  /**
   * Ejecuta una línea de comando ingresada por el usuario.
   * @param {string} rawInput
   */
  executeCommand(rawInput) {
    const input = String(rawInput || '').trim();

    // Imprimir el eco del comando
    this.printPromptEcho(rawInput);

    if (input.length === 0) {
      return;
    }

    // Sonido de procesamiento de comando (Prompt 11 / Spec 1.2)
    audio.playCommandProcessing();

    // Registrar en el historial si no es idéntico al último
    if (this.history[this.history.length - 1] !== input) {
      this.history.push(input);
    }
    this.historyIndex = -1;

    // Parsear tokens
    const tokens = parseArgs(input);
    const cmdName = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    const cmd = COMMANDS[cmdName];

    if (!cmd) {
      this.print(`nexus-sh: comando no encontrado: '${cmdName}'. Escribe 'help' para ver los comandos disponibles.`, 'line--error');
      return;
    }

    try {
      statsManager.registrarComando();
      logrosManager.verificar('comando_ejecutado', { totalComandos: statsManager.getPerfil().totalComandos });

      const renderResult = (res) => {
        if (!res) return;

        if (res.error) {
          this.print(res.error, 'line--error');
        }

        if (res.lines) {
          const processedLines = formatearCajaASCII(res.lines, { envolver: false });
          for (const line of processedLines) {
            if (typeof line === 'string' && line.startsWith('%c')) {
              // Soporte para líneas con clase específica: "%ctexto", "line--success"
              const parts = line.slice(2).split('", "');
              this.print(parts[0], parts[1] || 'line--info');
            } else {
              this.print(line);
            }
          }
        }

        if (res.html) {
          this.printHTML(res.html);
        }
      };

      const result = cmd.execute({
        args,
        terminal: this,
        vfs: this.vfs,
        cwd: this.cwd
      });

      if (result && typeof result.then === 'function') {
        result.then(renderResult).catch(err => {
          console.error(`[Terminal] Error asíncrono al ejecutar '${cmdName}':`, err);
          this.print(`nexus-sh: error interno al ejecutar '${cmdName}': ${err.message}`, 'line--error');
        });
      } else {
        renderResult(result);
      }
    } catch (err) {
      console.error(`[Terminal] Error al ejecutar '${cmdName}':`, err);
      this.print(`nexus-sh: error interno al ejecutar '${cmdName}': ${err.message}`, 'line--error');
    }
  }

  /**
   * Maneja eventos de teclado (Enter, Flechas, Tab, Ctrl+L, Ctrl+C).
   */
  handleKeyDown(e) {
    // 1. ENTER: Ejecutar comando
    if (e.key === 'Enter') {
      e.preventDefault();
      audio.playEnter();
      const val = this.dom.input.value;
      this.dom.input.value = '';
      this.executeCommand(val);
      return;
    }

    // 2. FLECHA ARRIBA: Historial hacia atrás
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.history.length === 0) return;

      if (this.historyIndex === -1) {
        this.tempInput = this.dom.input.value;
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }

      this.dom.input.value = this.history[this.historyIndex];
      return;
    }

    // 3. FLECHA ABAJO: Historial hacia adelante
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex === -1) return;

      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.dom.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.dom.input.value = this.tempInput;
      }
      return;
    }

    // 4. TAB: Autocompletado inteligente
    if (e.key === 'Tab') {
      e.preventDefault();
      this.handleTabComplete();
      return;
    }

    // 5. CTRL + L: Limpiar terminal
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      this.clear();
      return;
    }

    // 6. CTRL + C: Cancelar línea actual
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      this.printPromptEcho(this.dom.input.value + '^C');
      this.dom.input.value = '';
      this.historyIndex = -1;
      return;
    }
  }

  /**
   * Autocompletado con la tecla Tab.
   */
  handleTabComplete() {
    const val = this.dom.input.value;
    const tokens = parseArgs(val);

    // Caso 1: Autocompletar comando
    if (tokens.length <= 1 && !val.endsWith(' ')) {
      const partial = tokens[0] || '';
      const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(partial.toLowerCase()));

      if (matches.length === 1) {
        this.dom.input.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        this.printPromptEcho(val);
        this.print(matches.join('   '), 'line--info');
      }
      return;
    }

    // Caso 2: Autocompletar archivo o directorio
    const lastToken = val.endsWith(' ') ? '' : tokens[tokens.length - 1];
    let dirPath = '.';
    let filePrefix = lastToken;

    if (lastToken.includes('/')) {
      const lastSlash = lastToken.lastIndexOf('/');
      dirPath = lastToken.slice(0, lastSlash) || '/';
      filePrefix = lastToken.slice(lastSlash + 1);
    }

    const entries = this.vfs.listDirectory(dirPath, this.cwd, { showAll: true });
    const matches = entries.filter(e => e.name.startsWith(filePrefix));

    if (matches.length === 1) {
      const match = matches[0];
      const isDir = match.type === 'dir';
      const suffix = isDir ? '/' : ' ';

      let completedPath = match.name + suffix;
      if (lastToken.includes('/')) {
        const lastSlash = lastToken.lastIndexOf('/');
        completedPath = lastToken.slice(0, lastSlash + 1) + match.name + suffix;
      }

      // Reemplazar el último token en el input
      const beforeLastToken = val.slice(0, val.lastIndexOf(lastToken));
      this.dom.input.value = beforeLastToken + completedPath;
    } else if (matches.length > 1) {
      this.printPromptEcho(val);
      const names = matches.map(m => m.type === 'dir' ? m.name + '/' : m.name);
      this.print(names.join('   '), 'line--info');
    }
  }
}

// ─────────────────────────────────────────────────
// 3. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias para Terminal y Comandos.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testTerminal() {
  console.group('%c[TEST SUITE] Terminal y Comandos (terminal.js / commands.js)', 'color: #00ff41; font-weight: bold;');
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

  const vfs = new VirtualFileSystem();
  const term = new TerminalEmulator();
  term.vfs = vfs;

  // 1. Resolución de rutas
  assert(vfs.resolvePath('.', '/home/ghost') === '/home/ghost', "resolvePath '.' en /home/ghost");
  assert(vfs.resolvePath('..', '/home/ghost') === '/home', "resolvePath '..' en /home/ghost");
  assert(vfs.resolvePath('../..', '/home/ghost') === '/', "resolvePath '../..' en /home/ghost");
  assert(vfs.resolvePath('~', '/var/log') === '/home/ghost', "resolvePath '~' debe resolver a /home/ghost");
  assert(vfs.resolvePath('~/notes.txt', '/var/log') === '/home/ghost/notes.txt', "resolvePath '~/notes.txt'");
  assert(vfs.resolvePath('/etc/../var/log', '/home/ghost') === '/var/log', "resolvePath con segmentos intermedios '..'");

  // 2. Búsqueda de nodos (getNode)
  const rootNode = vfs.getNode('/');
  assert(rootNode !== null && rootNode.type === 'dir', 'Nodo raíz / debe existir y ser directorio');

  const notesFile = vfs.getNode('notes.txt', '/home/ghost');
  assert(notesFile !== null && notesFile.type === 'file', 'Archivo notes.txt debe existir');
  assert(notesFile && typeof notesFile.content === 'string', 'notes.txt debe contener texto');

  const nonExistent = vfs.getNode('no_existe.txt', '/home/ghost');
  assert(nonExistent === null, 'Archivo inexistente debe retornar null');

  // 3. Comando ls
  const lsRes = COMMANDS.ls.execute({ args: [], terminal: term, vfs });
  assert(lsRes && (lsRes.html || lsRes.lines), 'ls debe retornar salida html o líneas');

  const lsLaRes = COMMANDS.ls.execute({ args: ['-la', '/var/log'], terminal: term, vfs });
  assert(lsLaRes && lsLaRes.lines && lsLaRes.lines.length >= 2, 'ls -la /var/log debe listar entradas en formato largo');

  const lsError = COMMANDS.ls.execute({ args: ['/directorio_fantasma'], terminal: term, vfs });
  assert(lsError && lsError.error !== undefined, 'ls en ruta inexistente debe retornar error');

  // 4. Comando cd
  const cdHomeRes = COMMANDS.cd.execute({ args: ['/var/log'], terminal: term, vfs });
  assert(term.cwd === '/var/log', "cd /var/log debe actualizar term.cwd a '/var/log'");

  const cdParentRes = COMMANDS.cd.execute({ args: ['..'], terminal: term, vfs });
  assert(term.cwd === '/var', "cd .. desde /var/log debe dejar term.cwd en '/var'");

  const cdTilde = COMMANDS.cd.execute({ args: ['~'], terminal: term, vfs });
  assert(term.cwd === '/home/ghost', "cd ~ debe regresar a '/home/ghost'");

  const cdError = COMMANDS.cd.execute({ args: ['archivo_no_dir.txt'], terminal: term, vfs });
  assert(cdError && cdError.error !== undefined, 'cd a un destino inexistente debe fallar');

  // 5. Comando cat
  const catRes = COMMANDS.cat.execute({ args: ['notes.txt'], terminal: term, vfs });
  assert(catRes && catRes.lines && catRes.lines.length > 0, 'cat notes.txt debe devolver líneas de texto');

  const catError = COMMANDS.cat.execute({ args: [], terminal: term, vfs });
  assert(catError && catError.error !== undefined, 'cat sin argumentos debe dar error de operando');

  // 6. Comando grep
  const grepRes = COMMANDS.grep.execute({ args: ['OBJETIVO', 'notes.txt'], terminal: term, vfs });
  assert(grepRes && grepRes.lines && grepRes.lines.length > 0, "grep 'OBJETIVO' notes.txt debe encontrar coincidencias");

  const grepRecRes = COMMANDS.grep.execute({ args: ['-ri', 'Directiva', '/etc'], terminal: term, vfs });
  assert(grepRecRes && grepRecRes.lines && grepRecRes.lines.length > 0, "grep -ri 'Directiva' /etc debe buscar recursivamente");

  // 7. Comando find
  const findRes = COMMANDS.find.execute({ args: ['/var/log', '-name', '*.log'], terminal: term, vfs });
  assert(findRes && findRes.lines && findRes.lines.some(l => l.includes('system.log')), "find /var/log -name '*.log' debe encontrar system.log");

  // 8. Comando whoami
  const whoamiRes = COMMANDS.whoami.execute({ args: [], terminal: term, vfs });
  assert(whoamiRes && whoamiRes.lines && whoamiRes.lines[0].includes('ghost'), 'whoami debe mostrar alias ghost');

  // 9. Historial
  const histRes = COMMANDS.history.execute({ args: [], terminal: term, vfs });
  assert(histRes && histRes.lines && histRes.lines.length > 0, 'history debe listar comandos previos');

  // 10. parseArgs con comillas
  const parsed1 = parseArgs('grep -rn "código no miente" /var/log/vera.txt');
  assert(parsed1.length === 4 && parsed1[2] === 'código no miente', 'parseArgs debe preservar comillas compuestas');

  // 11. Cajas de texto con bordes ASCII (normalización estricta de ancho en caracteres)
  const cajaDesalineada = [
    '╔══════════════════════════════════════════════════════════════╗',
    '║ TÍTULO CORTO ║',
    '║ Línea sin cierre a la derecha',
    '╠══════════════════════════════════════════════════════════════╣',
    '║ Texto con emoji 🔑 y longitud distinta                        ║',
    '╚══════════════════════════════════════════════════════════════╝'
  ];
  const cajaNormalizada = formatearCajaASCII(cajaDesalineada);
  assert(
    cajaNormalizada.length === 6 && cajaNormalizada.every(l => l.length === 64 && (l.endsWith('╗') || l.endsWith('╣') || l.endsWith('╝') || l.endsWith('║'))),
    'formatearCajaASCII debe igualar la longitud exacta (64 chars) y cerrar los bordes de cada línea'
  );

  const cajaDesdeTexto = formatearCajaASCII(['ENCABEZADO DE PRUEBA', 'Contenido dinámico de terminal'], { ancho: 50, envolver: true });
  assert(
    cajaDesdeTexto.length === 4 && cajaDesdeTexto.every(l => l.length === 50),
    'formatearCajaASCII debe poder envolver texto dinámico en una caja de ancho exacto (50 chars)'
  );

  // Verificar que los comandos con cajas ASCII (help, status, retos, music) producen cajas con ancho uniforme
  const cmdsConCajas = [
    COMMANDS.help.execute({ args: [], terminal: term, vfs }),
    COMMANDS.status.execute({ args: [], terminal: term, vfs }),
    COMMANDS.retos.execute({ args: [], terminal: term, vfs }),
    COMMANDS.music.execute({ args: ['status'], terminal: term, vfs }),
    COMMANDS.ghostscript.execute({ args: ['info'], terminal: term, vfs }),
    COMMANDS['42'].execute({ args: [], terminal: term, vfs })
  ];
  const todasCajasUniformes = cmdsConCajas.every(res => {
    const norm = formatearCajaASCII(res.lines || [], { envolver: false });
    const boxLines = norm.filter(l => esLineaCajaASCII(l));
    return boxLines.length > 0 && boxLines.every(l => l.length === boxLines[0].length);
  });
  assert(todasCajasUniformes, 'Todos los comandos con cajas ASCII deben producir líneas con idéntico número de caracteres');

  // 12. Envoltura de texto por límites de palabras (evita cortes de palabras y guiones)
  const textoLargo = 'Este es un mensaje descifrado con criptografía asimétrica donde ninguna palabra debe cortarse.';
  const envueltas = envolverTextoPorPalabras(textoLargo, 30);
  assert(
    envueltas.length >= 3 &&
    envueltas.every(l => l.length <= 30) &&
    !envueltas.some(l => l.endsWith('-')) &&
    envueltas.join(' ') === textoLargo,
    'envolverTextoPorPalabras debe respetar fronteras de palabras completas sin cortes arbitrarios'
  );

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Terminal: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Terminal: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

// Instancia singleton para exportar
export const terminal = new TerminalEmulator();
