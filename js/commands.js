/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Commands — Implementación de comandos para el emulador de terminal
 * Especificación: Sección 2.3 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { registerLogFound, getState, registerPuzzleSolvedInFirewall, isGhostProtocolUnlocked, addScore } from './state.js';
import { abrirCualquierPuzzle } from './puzzles/generador.js';
import { audio, speechEngine, FIREWALL_MUSIC_TRACKS } from './audio.js';
import { LOGS_DATABASE, getHiddenLog, esLogImportante } from './historia/logs.js';
import { logrosManager } from './meta/logros.js';
import { statsManager } from './meta/stats.js';
import { secretosManager } from './meta/secretos.js';
import { cifrar, descifrar, encontrarDesplazamiento, probarTodosDesplazamientos } from './cripto/cesar.js';
import { textoABinario, binarioATexto, analizarPasoAPasoBinario } from './cripto/binario.js';
import { textoAHex, hexATexto, analizarPasoAPasoHex } from './cripto/hex.js';
import { cifrar as cifrarVigenere, descifrar as descifrarVigenere, analizarPasoAPasoVigenere } from './cripto/vigenere.js';
import { analizarFrecuencia, generarBarrasVisualesTexto, cifrarSustitucion, descifrarSustitucion } from './cripto/frecuencia.js';
import { extraerMensajeLSB, descargarImagenCanvas, crearCanvasConMensaje } from './cripto/esteganografia.js';
import { generarClavesRSA, cifrarTextoRSA, descifrarTextoRSA, analizarPasoAPasoRSA } from './cripto/rsa.js';
import { executeGhostScript, parseGhostScript } from './scripting/ghostscript.js';
import { abrirEditor, cerrarEditor } from './scripting/editor.js';
import { obtenerListaRetos, BANCO_RETOS, validarReto, esRetoDesbloqueado } from './scripting/retos.js';
import { obtenerRankingSoluciones } from './scripting/rankingSoluciones.js';
import {
  obtenerIdentidadJugador,
  regenerarIdentidadJugador,
  exportarLlavePublicaPEM,
  exportarLlavePrivadaPEM,
  cifrarConPublica,
  descifrarConPrivada,
  calcularHuellaDigital,
  obtenerBuzonMensajes,
  descifrarMensajeBuzon,
  recibirNuevoMensajeCifrado
} from './cripto/llaves.js';
import { abrirPuzzleLlaves } from './puzzles/tipoLlaves.js';
import {
  obtenerIdentidadVeraSorenson,
  generarMuestrasTransmisionesVera,
  verificarFirma,
  firmarMensaje,
  generarParDeFirmas,
  analizarPasoAPasoRSAPSS
} from './cripto/firmas.js';
import { abrirPuzzleFirmas } from './puzzles/tipoFirmas.js';
import {
  CadenaDeLogs,
  Bloque,
  calcularHashSHA256,
  construirCadenaAuditadaConCorrupcion,
  analizarEfectoAvalanchaSHA256,
  CASOS_LORE_BLOCKCHAIN
} from './cripto/blockchain.js';
import { abrirPuzzleBlockchain } from './puzzles/tipoBlockchain.js';
import { cutscenesManager, reproducirCutsceneIntro, reproducirCutsceneTwist, BANCO_CUTSCENES } from './cinematica/cutscenes.js';

/**
 * Convierte un patrón glob (ej. "*.log", "*vera*") a RegExp.
 * @param {string} pattern
 * @returns {RegExp}
 */
function globToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

/**
 * Parsea una línea de comando en tokens respetando comillas dobles y simples.
 * @param {string} input
 * @returns {string[]}
 */
export function parseArgs(input) {
  const tokens = [];
  let current = '';
  let inDoubleQuote = false;
  let inSingleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (/\s/.test(ch) && !inDoubleQuote && !inSingleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

/**
 * Catálogo de comandos disponibles en el emulador de terminal.
 */
export const COMMANDS = {
  // ── 1. ls ──────────────────────────────────────────
  ls: {
    name: 'ls',
    description: 'Lista archivos y directorios disponibles',
    usage: 'ls [-l] [-a] [-la] [ruta]',
    execute({ args, terminal, vfs }) {
      let showAll = false;
      let longFormat = false;
      const targetPaths = [];

      for (const arg of args) {
        if (arg.startsWith('-') && arg.length > 1) {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) longFormat = true;
        } else {
          targetPaths.push(arg);
        }
      }

      const targetPath = targetPaths.length > 0 ? targetPaths[0] : '.';
      const node = vfs.getNode(targetPath, terminal.cwd);

      if (!node) {
        return {
          error: `ls: no se puede acceder a '${targetPath}': No existe el archivo o el directorio`
        };
      }

      // Si es un archivo individual
      if (node.type === 'file') {
        if (longFormat) {
          const perm = node.permissions || '-rw-r--r--';
          const owner = (node.owner || 'ghost').padEnd(8);
          const group = (node.group || 'nexus').padEnd(8);
          const size = String(node.content ? node.content.length : 0).padStart(6);
          const date = node.date || '2047-10-11';
          return {
            lines: [`${perm} 1 ${owner} ${group} ${size} ${date} ${node.name}`]
          };
        }
        return {
          lines: [node.name]
        };
      }

      // Si es un directorio
      const entries = vfs.listDirectory(targetPath, terminal.cwd, { showAll });

      if (longFormat) {
        const lines = [`total ${entries.length}`];
        for (const entry of entries) {
          const isDir = entry.type === 'dir';
          const perm = entry.permissions || (isDir ? 'drwxr-xr-x' : '-rw-r--r--');
          const owner = (entry.owner || (isDir ? 'root' : 'ghost')).padEnd(8);
          const group = (entry.group || (isDir ? 'root' : 'nexus')).padEnd(8);
          const size = String(entry.type === 'file' && entry.content ? entry.content.length : 4096).padStart(6);
          const date = entry.date || '2047-10-11';
          const displayName = isDir ? `${entry.name}/` : entry.name;
          lines.push(`${perm} 1 ${owner} ${group} ${size} ${date} ${displayName}`);
        }
        return { lines };
      }

      // Formato compacto con estilos visuales
      if (entries.length === 0) {
        return { lines: [] };
      }

      const html = `
        <div class="terminal__file-list">
          ${entries.map(e => {
            const isDir = e.type === 'dir';
            const isHidden = e.name.startsWith('.');
            const isExec = (e.permissions || '').includes('x');
            let cls = 'terminal__file';
            if (isDir) cls += ' terminal__file--dir';
            else if (isExec) cls += ' terminal__file--executable';
            else if (isHidden) cls += ' terminal__file--hidden';

            const display = isDir ? `${e.name}/` : e.name;
            return `<span class="${cls}">${display}</span>`;
          }).join('')}
        </div>
      `;

      return { html };
    }
  },

  // ── 2. cat ─────────────────────────────────────────
  cat: {
    name: 'cat',
    description: 'Muestra el contenido de uno o más archivos',
    usage: 'cat <archivo...>',
    execute({ args, terminal, vfs }) {
      if (args.length === 0) {
        return { error: 'cat: falta el operando de archivo' };
      }

      const lines = [];
      let lastHtml = null;
      for (const arg of args) {
        const node = vfs.getNode(arg, terminal.cwd);
        if (!node) {
          lines.push(`cat: ${arg}: No existe el archivo o el directorio`);
          continue;
        }
        if (node.type === 'dir') {
          lines.push(`cat: ${arg}: Es un directorio`);
          continue;
        }

        const fileName = node.name || arg.split('/').pop();
        const cleanName = fileName.replace(/^\/+/, '');

        // Si es un log oculto narrativo, otorgar puntos y feedback temático
        if (node.hiddenLog) {
          const pts = registerLogFound(fileName);
          if (pts > 0) {
            lines.push(`%c[NEXUS CLASSIFIED LOG] ◈ Fragmento descubierto: '${fileName}' (+${pts} PTS)`, 'line--success');
          }
        }

        // Imprimir contenido del archivo
        const contentLines = String(node.content || '').split('\n');
        lines.push(...contentLines);

        // Si es un log narrativo importante con voz disponible (Prompt D3 / Spec 4.3)
        const logData = (typeof getHiddenLog === 'function' ? getHiddenLog(cleanName) : null) || (LOGS_DATABASE && LOGS_DATABASE[cleanName]);
        if (logData || node.hiddenLog || (node.name && (node.name.endsWith('.txt') || node.name.endsWith('.log') || node.name.endsWith('.md')))) {
          const isVera = logData && logData.autor && logData.autor.toLowerCase().includes('vera');
          const isNexus = logData && logData.autor && logData.autor.toLowerCase().includes('nexus');
          const speaker = isVera ? 'Dra. Vera Sorenson' : (isNexus ? 'NEXUS Core' : (logData ? logData.autor : 'Registro Clasificado'));
          const voiceBadge = isVera ? 'Filtro Cinta Analógica 2000Hz' : 'Voz Sintetizada Pitch 0.4';

          lastHtml = `
            <div class="terminal-log-audio-box" style="margin: 10px 0; padding: 8px 12px; background: rgba(0, 255, 65, 0.05); border: 1px solid var(--border-primary); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
              <div>
                <span style="font-size: 11px; color: var(--cyan); font-family: var(--font-mono); font-weight: bold;">
                  🎙️ REGISTRO DE AUDIO // ${speaker.toUpperCase()}
                </span>
                <span style="font-size: 10px; color: var(--text-dim); margin-left: 6px;">(${voiceBadge})</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn--primary" style="padding: 3px 12px; font-size: 11px; font-weight: bold; cursor: pointer;" onclick="window.reproducirVozLog('${cleanName}')">
                  ▶ ESCUCHAR
                </button>
                <button class="btn btn--secondary" style="padding: 3px 10px; font-size: 11px; cursor: pointer;" onclick="window.speechEngine.stop()">
                  ⏹ DETENER
                </button>
                <button class="btn btn--secondary" style="padding: 3px 10px; font-size: 11px; cursor: pointer;" onclick="window.abrirVisorLog('${cleanName}', window.LOGS_DATABASE && window.LOGS_DATABASE['${cleanName}'] ? window.LOGS_DATABASE['${cleanName}'].contenido : '')">
                  🔍 VISOR
                </button>
              </div>
            </div>
          `;
        }
      }

      return { lines, html: lastHtml };
    }
  },

  // ── 3. cd ──────────────────────────────────────────
  cd: {
    name: 'cd',
    description: 'Cambia el directorio de trabajo actual',
    usage: 'cd [directorio]',
    execute({ args, terminal, vfs }) {
      let target = args[0];

      // Sin argumentos o ~ va a /home/ghost
      if (!target || target === '~') {
        target = '/home/ghost';
      } else if (target === '-') {
        target = terminal.prevCwd || terminal.cwd;
      }

      const resolved = vfs.resolvePath(target, terminal.cwd);
      const node = vfs.getNode(resolved);

      if (!node) {
        return { error: `cd: ${target}: No existe el archivo o el directorio` };
      }
      if (node.type !== 'dir') {
        return { error: `cd: ${target}: No es un directorio` };
      }

      terminal.prevCwd = terminal.cwd;
      terminal.cwd = resolved;
      terminal.updatePrompt();
      return { lines: [] };
    }
  },

  // ── 4. grep ────────────────────────────────────────
  grep: {
    name: 'grep',
    description: 'Busca patrones de texto en archivos',
    usage: 'grep [-i] [-n] [-r] [-v] "patrón" [archivo...]',
    execute({ args, terminal, vfs }) {
      let caseInsensitive = false;
      let lineNumbers = false;
      let recursive = false;
      let invertMatch = false;
      const operands = [];

      for (const arg of args) {
        if (arg.startsWith('-') && arg.length > 1) {
          if (arg.includes('i')) caseInsensitive = true;
          if (arg.includes('n')) lineNumbers = true;
          if (arg.includes('r') || arg.includes('R')) recursive = true;
          if (arg.includes('v')) invertMatch = true;
        } else {
          operands.push(arg);
        }
      }

      if (operands.length === 0) {
        return { error: 'grep: falta el patrón de búsqueda' };
      }

      const pattern = operands[0];
      const targetPaths = operands.slice(1);
      const regexFlags = caseInsensitive ? 'i' : '';
      let regex;
      try {
        regex = new RegExp(pattern, regexFlags);
      } catch (_) {
        regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), regexFlags);
      }

      if (targetPaths.length === 0) {
        targetPaths.push('.');
      }

      const results = [];

      for (const targetPath of targetPaths) {
        const node = vfs.getNode(targetPath, terminal.cwd);
        if (!node) {
          results.push(`grep: ${targetPath}: No existe el archivo o el directorio`);
          continue;
        }

        if (node.type === 'file') {
          const lines = String(node.content || '').split('\n');
          lines.forEach((line, idx) => {
            const matches = regex.test(line);
            if ((matches && !invertMatch) || (!matches && invertMatch)) {
              const prefix = lineNumbers ? `${idx + 1}: ` : '';
              results.push(`${prefix}${line}`);
            }
          });
        } else if (node.type === 'dir') {
          if (!recursive) {
            results.push(`grep: ${targetPath}: Es un directorio (usa -r para búsqueda recursiva)`);
            continue;
          }

          // Búsqueda recursiva
          const files = vfs.findAllFiles(targetPath, terminal.cwd);
          for (const file of files) {
            const lines = String(file.node.content || '').split('\n');
            lines.forEach((line, idx) => {
              const matches = regex.test(line);
              if ((matches && !invertMatch) || (!matches && invertMatch)) {
                const prefix = lineNumbers ? `${file.path}:${idx + 1}: ` : `${file.path}: `;
                results.push(`${prefix}${line}`);
              }
            });
          }
        }
      }

      return { lines: results };
    }
  },

  // ── 5. find ────────────────────────────────────────
  find: {
    name: 'find',
    description: 'Encuentra archivos por nombre o tipo en la jerarquía',
    usage: 'find [ruta] [-name "patrón"] [-type f|d]',
    execute({ args, terminal, vfs }) {
      let searchPath = '.';
      let namePattern = null;
      let typeFilter = null; // 'f' o 'd'

      let i = 0;
      if (args[0] && !args[0].startsWith('-')) {
        searchPath = args[0];
        i = 1;
      }

      while (i < args.length) {
        const flag = args[i];
        if (flag === '-name' && args[i + 1]) {
          namePattern = args[i + 1];
          i += 2;
        } else if (flag === '-type' && args[i + 1]) {
          typeFilter = args[i + 1];
          i += 2;
        } else {
          i++;
        }
      }

      const rootNode = vfs.getNode(searchPath, terminal.cwd);
      if (!rootNode) {
        return { error: `find: '${searchPath}': No existe el archivo o el directorio` };
      }

      const matcher = namePattern ? globToRegex(namePattern) : null;
      const results = [];

      function traverse(currentNode, currentPath) {
        const isDir = currentNode.type === 'dir';
        const isFile = currentNode.type === 'file';

        let matchesType = true;
        if (typeFilter === 'f' && !isFile) matchesType = false;
        if (typeFilter === 'd' && !isDir) matchesType = false;

        let matchesName = true;
        if (matcher) {
          matchesName = matcher.test(currentNode.name);
        }

        if (matchesType && matchesName) {
          results.push(currentPath);
        }

        if (isDir && currentNode.children) {
          for (const [childName, childNode] of Object.entries(currentNode.children)) {
            const sep = currentPath === '/' ? '' : '/';
            traverse(childNode, `${currentPath}${sep}${childName}`);
          }
        }
      }

      traverse(rootNode, searchPath);
      return { lines: results };
    }
  },

  // ── 6. whoami ──────────────────────────────────────
  whoami: {
    name: 'whoami',
    description: 'Muestra tu identidad y alias actual en la red',
    usage: 'whoami',
    execute() {
      return {
        lines: [
          'ghost@nexus',
          '  [UID]: 1047 (ghost)',
          '  [GID]: 2047 (nexus-infiltrators)',
          '  [NIVEL DE ACCESO]: NIVEL 1 // BREACHER',
          '  [ESTADO]: CONEXIÓN NO AUTORIZADA DETECTADA'
        ]
      };
    }
  },

  // ── 7. clear ───────────────────────────────────────
  clear: {
    name: 'clear',
    description: 'Limpia la pantalla de la terminal',
    usage: 'clear',
    execute({ terminal }) {
      terminal.clear();
      return { lines: [] };
    }
  },

  // ── 8. history ─────────────────────────────────────
  history: {
    name: 'history',
    description: 'Muestra los comandos ejecutados en esta sesión y logs previos de Vera',
    usage: 'history',
    execute({ terminal }) {
      const lines = terminal.history.map((cmd, idx) => {
        const num = String(idx + 1).padStart(4, ' ');
        return `${num}  ${cmd}`;
      });
      return { lines };
    }
  },

  // ── Comandos complementarios del spec (2.3) ────────

  // pwd
  pwd: {
    name: 'pwd',
    description: 'Muestra el directorio de trabajo actual',
    usage: 'pwd',
    execute({ terminal }) {
      return { lines: [terminal.cwd] };
    }
  },

  // echo
  echo: {
    name: 'echo',
    description: 'Muestra una línea de texto en terminal',
    usage: 'echo [texto...]',
    execute({ args }) {
      return { lines: [args.join(' ')] };
    }
  },

  // ps / ps aux
  ps: {
    name: 'ps',
    description: 'Muestra los procesos activos en el sistema',
    usage: 'ps [aux]',
    execute() {
      return {
        lines: [
          'USER       PID  %CPU %MEM     VSZ   RSS TTY      STAT START   TIME COMMAND',
          'root         1   0.0  0.1   21456  4120 ?        Ss   04:00   0:02 /sbin/nexus-core-init',
          'root       104   0.1  0.4   84210  9540 ?        S    04:12   0:05 /usr/sbin/sshd -D [port 22]',
          'aurelia    247   4.2  8.9  412580 84120 ?        Sl   04:15   1:42 /opt/aurelia/firewall_alpha --strict',
          'vera       512   0.0  0.0       0     0 ?        Z    04:16   0:00 [vera_daemon] <defunct>',
          'ghost     1047   0.8  0.3   18420  5210 pts/0    R+   17:08   0:00 /bin/bash (infiltrator)'
        ]
      };
    }
  },

  // netstat
  netstat: {
    name: 'netstat',
    description: 'Muestra conexiones de red y sockets activos',
    usage: 'netstat',
    execute() {
      return {
        lines: [
          'Proto Recv-Q Send-Q Local Address           Foreign Address         State',
          'tcp        0      0 127.0.0.1:2047          0.0.0.0:*               LISTEN (NEXUS_CORE)',
          'tcp        0      0 10.0.0.99:54218         192.168.0.47:22         ESTABLISHED (GHOST_SSH)',
          'tcp        0      0 192.168.0.47:8080       0.0.0.0:*               LISTEN (AURELIA_FIREWALL)'
        ]
      };
    }
  },

  // sudo
  sudo: {
    name: 'sudo',
    description: 'Intenta ejecutar comandos con privilegios de administrador',
    usage: 'sudo <comando...>',
    execute() {
      return {
        lines: [
          '[AURELIA SENTINEL] Violación de privilegios de seguridad detectada.',
          "El usuario 'ghost' no está en el archivo sudoers.",
          'Incidente reportado al registro de auditoría central de Aurelia Systems.',
          "> Nota cifrada de Vera: 'Ellos creen que tienen el control absoluto. Pero el núcleo nunca les perteneció.'"
        ]
      };
    }
  },

  // help / man
  help: {
    name: 'help',
    description: 'Muestra el manual de ayuda de comandos disponibles',
    usage: 'help [comando]',
    execute({ args }) {
      if (args[0] && COMMANDS[args[0]]) {
        const cmd = COMMANDS[args[0]];
        return {
          lines: [
            `NOMBRE: ${cmd.name} — ${cmd.description}`,
            `USO:    ${cmd.usage}`
          ]
        };
      }

      const lines = [
        '╔══════════════════════════════════════════════════════════════╗',
        '║ NEXUS TERMINAL v2.0.47 — COMANDOS DEL SISTEMA                ║',
        '╚══════════════════════════════════════════════════════════════╝',
        ''
      ];

      for (const [name, cmd] of Object.entries(COMMANDS)) {
        const col1 = name.padEnd(10, ' ');
        lines.push(`  ${col1} — ${cmd.description}`);
      }

      lines.push('');
      lines.push("Escribe 'help <comando>' para detalles de sintaxis.");
      return { lines };
    }
  },

  man: {
    name: 'man',
    description: 'Alias de manual de ayuda',
    usage: 'man <comando>',
    execute(ctx) {
      return COMMANDS.help.execute(ctx);
    }
  },

  // ── Comandos de hackeo y puzzles ───────────────────
  hack: {
    name: 'hack',
    description: 'Inicia el descifrado de seguridad del firewall actual (puzzle de lógica)',
    usage: 'hack [tipo (A-E)|nivel] [nivel]',
    execute({ args, terminal }) {
      const state = getState();
      if ((state.integrity ?? 100) <= 0) {
        if (typeof window !== 'undefined' && window.__triggerGameOver) {
          window.__triggerGameOver('INTEGRIDAD EN 0% // SISTEMA EXPULSADO');
        }
        return { error: 'Acceso denegado: Integridad del sistema en 0%. Conexión terminada.' };
      }

      const fwIdx = state.currentFirewall || 0;
      const fw = fwIdx + 1;
      const subnodoCalculado = (state.puzzlesSolvedInFirewall || 0) + 1;
      let fwDefaultType = { 1: 'A', 2: 'A', 3: 'B', 4: 'D', 5: 'E' }[fw] || 'A';
      if (fwIdx === 0) {
        if (subnodoCalculado === 1) {
          fwDefaultType = 'A';
        } else if (subnodoCalculado === 2) {
          fwDefaultType = 'BINARIO';
        } else if (subnodoCalculado === 3) {
          fwDefaultType = 'HEX';
        }
      } else if (fwIdx === 1) {
        if (subnodoCalculado === 2) {
          fwDefaultType = 'VIGENERE';
        } else {
          fwDefaultType = 'A';
        }
      } else if (fwIdx === 3) {
        if (subnodoCalculado === 1) {
          fwDefaultType = 'BLOCKCHAIN';
        } else if (subnodoCalculado === 2) {
          fwDefaultType = 'FRECUENCIA';
        } else if (subnodoCalculado === 3) {
          fwDefaultType = 'ESTEGANOGRAFIA';
        } else {
          fwDefaultType = 'D';
        }
      } else if (fwIdx === 4) {
        if (subnodoCalculado === 2) {
          fwDefaultType = 'RSA';
        } else {
          fwDefaultType = 'E';
        }
      }

      let tipo = fwDefaultType;
      let nivel = fw;

      const tiposValidos = ['A', 'B', 'C', 'D', 'E', 'CESAR', 'CRIPTO', 'BINARIO', 'BIN', 'HEX', 'HEXADECIMAL', 'VIGENERE', 'FRECUENCIA', 'SUSTITUCION', 'ESTEGANOGRAFIA', 'LSB', 'RSA', 'LLAVES', 'KEYS', 'FIRMA', 'FIRMAS', 'BLOCKCHAIN', 'CADENA', 'SHA256'];
      if (args.length > 0) {
        const first = args[0].toUpperCase();
        if (tiposValidos.includes(first)) {
          tipo = first;
          if (args[1]) nivel = parseInt(args[1], 10) || 1;
        } else if (!isNaN(parseInt(args[0], 10))) {
          nivel = parseInt(args[0], 10);
          if (args[1] && tiposValidos.includes(args[1].toUpperCase())) {
            tipo = args[1].toUpperCase();
          }
        }
      }

      const subnodoActual = (state.puzzlesSolvedInFirewall || 0) + 1;
      terminal.print(`[NEXUS PROTOCOL] Iniciando hackeo de sub-nodo ${Math.min(3, subnodoActual)}/3... Cargando puzzle Tipo ${tipo} (nivel ${nivel})...`, 'line--warning');

      abrirCualquierPuzzle(tipo, nivel, ({ exito, puntos, isGameOver }) => {
        const curState = getState();
        if (isGameOver || curState.integrity <= 0) {
          terminal.print('[-] ALERTA CRÍTICA: ¡Integridad del sistema en 0%! Protocolo de expulsión activado.', 'line--error');
          if (typeof window !== 'undefined' && window.__triggerGameOver) {
            window.__triggerGameOver('INTEGRIDAD COMPROMETIDA (0%)');
          }
          return;
        }

        if (exito) {
          const breach = registerPuzzleSolvedInFirewall();
          terminal.print(`[+] SUBNODO DESBLOQUEADO: Seguridad Tipo ${tipo} superada (+${puntos} PTS).`, 'line--success');

          // Comprobar logros de puzzle
          const st = getState();
          logrosManager.verificar('puzzle_acertado', {
            streak: st.streak,
            integridad: st.integrity,
            totalResueltos: st.puzzlesCorrect || 0
          });

          if (breach.firewallBreached) {
            terminal.print('╔══════════════════════════════════════════════════════════════╗', 'line--success');
            terminal.print('║ FIREWALL COMPLETADO — Presiona [ENTER] para continuar        ║', 'line--success');
            terminal.print('║ Contramedida neutralizada. Capa de seguridad desmantelada.   ║', 'line--system');
            terminal.print('╚══════════════════════════════════════════════════════════════╝', 'line--success');
            audio.playSuccess();
            audio.playFirewallComplete();

            logrosManager.verificar('firewall_completado', {
              firewallIndex: breach.firewallIndex,
              integridad: st.integrity,
              fallosEnFirewall: st.consecutiveFailures || 0
            });

            // Permitir avanzar inmediatamente con [ENTER]
            let enterProcessed = false;
            const onEnterPress = (e) => {
              if (enterProcessed) return;
              if (e.key === 'Enter' || e.keyCode === 13) {
                enterProcessed = true;
                if (typeof window !== 'undefined') window.removeEventListener('keydown', onEnterPress);
                if (window.__completarFirewall) {
                  window.__completarFirewall();
                }
              }
            };
            if (typeof window !== 'undefined') {
              window.addEventListener('keydown', onEnterPress);
            }

            // Timeout de respaldo
            setTimeout(() => {
              if (!enterProcessed) {
                enterProcessed = true;
                if (typeof window !== 'undefined') window.removeEventListener('keydown', onEnterPress);
                if (window.__completarFirewall) {
                  window.__completarFirewall();
                }
              }
            }, 3500);
          } else {
            terminal.print(`[i] Progreso del Firewall: ${breach.solved}/3 sub-nodos descifrados. Faltan ${breach.remaining} para quebrar el firewall.`, 'line--info');
            terminal.print(`> Consejo: Escribe 'hack' para descifrar el siguiente sub-nodo.`, 'line--warning');
          }
        } else {
          terminal.print(`[-] FALLO DE DESBLOQUEO: Centinela detectó la intrusión (-20% integridad). Escribe 'hack' para reintentar.`, 'line--error');
          const fails = getState().consecutiveFailures || 0;
          if (fails >= 2) {
            terminal.print(`💡 [PISTA AUTOMÁTICA DEL SISTEMA // 2 FALLOS CONSECUTIVOS]:`, 'line--warning');
            const pistasPorTipo = {
              A: 'Identifica qué números residen en la intersección central para descartar las respuestas erróneas.',
              B: 'La conjunción (∧) exige que ambas premisas sean verdaderas; la disyunción (∨) solo requiere una.',
              C: 'Aplica equivalencias de De Morgan: ¬(p ∧ q) ≡ (¬p ∨ ¬q), y ¬(p ∨ q) ≡ (¬p ∧ ¬q).',
              D: 'La implicación (p → q) es únicamente falsa cuando el antecedente es verdadero y el consecuente falso.',
              E: 'Si una regla universal (p → q) está activa y la premisa p se cumple, la conclusión q se deduce de forma necesaria.'
            };
            terminal.print(`   ↳ "${pistasPorTipo[tipo] || 'Revisa con detenimiento las premisas antes de responder.'}"`, 'line--info');
          }
        }
      }).catch(err => {
        terminal.print(`nexus-sh: error al cargar módulo de puzzle: ${err.message}`, 'line--error');
      });
      return { lines: [] };
    }
  },

  puzzle: {
    name: 'puzzle',
    description: 'Alias de hack (inicia puzzle de lógica)',
    usage: 'puzzle [nivel]',
    execute(ctx) {
      return COMMANDS.hack.execute(ctx);
    }
  },

  solve: {
    name: 'solve',
    description: 'Alias de hack (inicia puzzle de lógica)',
    usage: 'solve [nivel]',
    execute(ctx) {
      return COMMANDS.hack.execute(ctx);
    }
  },

  cesar: {
    name: 'cesar',
    description: 'Herramienta criptografica de cifrado Cesar (cifrar, descifrar, fuerza bruta o puzzle)',
    usage: 'cesar [cifrar|descifrar|fuerza-bruta|crack|puzzle] [texto] [desplazamiento]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando interfaz de descifrado Cesar en Firewall 1...', 'line--info');
        return COMMANDS.hack.execute({ args: ['CESAR', '1'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'cifrar' || accion === 'encrypt') {
        const hasShift = args.length > 2 && !isNaN(parseInt(args[args.length - 1], 10));
        const shift = hasShift ? parseInt(args[args.length - 1], 10) : 3;
        const texto = (hasShift ? args.slice(1, -1) : args.slice(1)).join(' ');
        if (!texto) {
          return { error: 'Uso: cesar cifrar <texto> [desplazamiento]' };
        }
        const resultado = cifrar(texto, shift);
        return {
          lines: [
            "[+] Texto original : " + JSON.stringify(texto),
            "[+] Desplazamiento : " + shift,
            "[+] Texto cifrado  : " + JSON.stringify(resultado)
          ]
        };
      }

      if (accion === 'descifrar' || accion === 'decrypt') {
        const hasShift = args.length > 2 && !isNaN(parseInt(args[args.length - 1], 10));
        const shift = hasShift ? parseInt(args[args.length - 1], 10) : 3;
        const texto = (hasShift ? args.slice(1, -1) : args.slice(1)).join(' ');
        if (!texto) {
          return { error: 'Uso: cesar descifrar <texto_cifrado> [desplazamiento]' };
        }
        const resultado = descifrar(texto, shift);
        return {
          lines: [
            "[+] Texto cifrado   : " + JSON.stringify(texto),
            "[+] Desplazamiento  : " + shift,
            "[+] Texto descifrado: " + JSON.stringify(resultado)
          ]
        };
      }

      if (accion === 'fuerza-bruta' || accion === 'crack' || accion === 'todos') {
        const texto = args.slice(1).join(' ');
        if (!texto) {
          return { error: 'Uso: cesar fuerza-bruta <texto_cifrado>' };
        }
        const res = encontrarDesplazamiento(texto);
        const lines = [
          "[+] Evaluando 26 desplazamientos posibles para: " + JSON.stringify(texto),
          '──────────────────────────────────────────────────────────'
        ];
        res.todos.forEach(item => {
          const mark = item.desplazamiento === res.desplazamiento ? ' [MEJOR CANDIDATO ★]' : '';
          lines.push("ROT-" + String(item.desplazamiento).padStart(2, '0') + ": " + JSON.stringify(item.texto) + mark);
        });
        lines.push('──────────────────────────────────────────────────────────');
        lines.push("[★] Desplazamiento mas probable: " + res.desplazamiento + " -> " + JSON.stringify(res.texto));
        return { lines };
      }

      return {
        lines: [
          'Uso de herramienta CESAR:',
          '  cesar                          - Abre el puzzle interactivo en Firewall 1',
          '  cesar cifrar <texto> [n]       - Cifra texto con desplazamiento n (def: 3)',
          '  cesar descifrar <cifrado> [n]  - Descifra texto con desplazamiento n',
          '  cesar fuerza-bruta <cifrado>   - Prueba todos los desplazamientos posibles'
        ]
      };
    }
  },

  descifrar: {
    name: 'descifrar',
    description: 'Inicia el descifrado de transmisiones interceptadas en el firewall actual',
    usage: 'descifrar [texto_cifrado|archivo] [clave_opcional]',
    execute({ args, terminal }) {
      const state = getState();
      if (!args || args.length === 0) {
        if (state.currentFirewall === 1) {
          return COMMANDS.vigenere.execute({ args: ['puzzle'], terminal });
        }
        if (state.currentFirewall === 3) {
          return COMMANDS.frecuencia.execute({ args: ['puzzle'], terminal });
        }
        if (state.currentFirewall === 4) {
          return COMMANDS.rsa.execute({ args: ['puzzle'], terminal });
        }
        return COMMANDS.cesar.execute({ args: ['puzzle'], terminal });
      }
      if (args.length >= 2 && !args[0].startsWith('-')) {
        return COMMANDS.vigenere.execute({ args: ['descifrar', ...args], terminal });
      }
      const raw = args.join(' ').trim();
      if (raw.toLowerCase().includes('rsa') || raw.toLowerCase().includes('vera') || raw.toLowerCase().includes('omega')) {
        return COMMANDS.rsa.execute({ args: ['puzzle'], terminal });
      }
      if (raw.toLowerCase().includes('sospechosa') || raw.toLowerCase().includes('.png') || raw.toLowerCase().includes('imagen')) {
        return COMMANDS.esteganografia.execute({ args: ['extraer', ...args], terminal });
      }
      if (/^[01\s]+$/.test(raw) && raw.replace(/\s+/g, '').length >= 8) {
        return COMMANDS.binario.execute({ args: ['decode', ...args], terminal });
      }
      if (/^(?:0x)?[0-9a-fA-F\s,:]+$/.test(raw) && !/[g-zG-Z]/.test(raw) && raw.replace(/[^0-9a-fA-F]/g, '').length >= 2) {
        return COMMANDS.hex.execute({ args: ['decode', ...args], terminal });
      }
      return COMMANDS.cesar.execute({ args: ['fuerza-bruta', ...args], terminal });
    }
  },

  binario: {
    name: 'binario',
    description: 'Herramienta criptografica binaria (codificar, decodificar, conversion paso a paso o puzzle)',
    usage: 'binario [puzzle|encode|decode|paso] [texto|bits]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando interfaz interactiva de descifrado Binario en Firewall 1...', 'line--info');
        return COMMANDS.hack.execute({ args: ['BINARIO', '1'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'encode' || accion === 'cifrar' || accion === 'texto' || accion === 'codificar') {
        const texto = args.slice(1).join(' ');
        if (!texto) {
          return { error: 'Uso: binario encode <texto>' };
        }
        const bin = textoABinario(texto);
        return {
          lines: [
            `[+] Texto original : "${texto}"`,
            `[+] Codigo binario : ${bin}`,
            `[+] Bytes          : ${texto.length} (ASCII 8 bits)`
          ]
        };
      }

      if (accion === 'decode' || accion === 'descifrar' || accion === 'decodificar') {
        const binario = args.slice(1).join(' ');
        if (!binario) {
          return { error: 'Uso: binario decode <secuencia_binaria>' };
        }
        const texto = binarioATexto(binario);
        return {
          lines: [
            `[+] Codigo binario    : ${binario}`,
            `[+] Texto decodificado: "${texto}"`
          ]
        };
      }

      if (accion === 'paso' || accion === 'visual' || accion === 'analizar') {
        const entrada = args.slice(1).join(' ');
        if (!entrada) {
          return { error: 'Uso: binario paso <texto|secuencia_binaria>' };
        }
        const esBin = /^[01\s]+$/.test(entrada.trim());
        const pasos = analizarPasoAPasoBinario(entrada, esBin);
        const lines = [
          `[+] Conversion visual paso a paso para: "${entrada}"`,
          '─────────────────────────────────────────────────────────────────',
          ' Byte       | ASCII | Car | Potencias de 2 activas           | Ecuacion',
          '─────────────────────────────────────────────────────────────────'
        ];
        pasos.forEach(p => {
          const potActivas = p.potencias.filter(x => x.activo).map(x => x.pot).join(' + ') || '0';
          const byteFmt = p.binario.padEnd(10, ' ');
          const asciiFmt = String(p.ascii).padStart(5, ' ');
          const carFmt = `'${p.caracter}'`.padEnd(3, ' ');
          const potFmt = potActivas.padEnd(30, ' ');
          lines.push(` ${byteFmt} | ${asciiFmt} | ${carFmt} | ${potFmt} | ${p.ecuacion}`);
        });
        lines.push('─────────────────────────────────────────────────────────────────');
        return { lines };
      }

      return {
        lines: [
          'Uso de herramienta BINARIO:',
          '  binario                        - Abre el puzzle interactivo en Firewall 1',
          '  binario encode <texto>         - Convierte texto a secuencia binaria (8 bits)',
          '  binario decode <bits>          - Convierte secuencia binaria a texto ASCII',
          '  binario paso <texto|bits>      - Muestra la conversion visual paso a paso'
        ]
      };
    }
  },

  hex: {
    name: 'hex',
    description: 'Herramienta criptografica hexadecimal (codificar, decodificar, conversion paso a paso o puzzle)',
    usage: 'hex [puzzle|encode|decode|paso] [texto|hex_bytes]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando interfaz interactiva de descifrado Hexadecimal en Firewall 1...', 'line--info');
        return COMMANDS.hack.execute({ args: ['HEX', '1'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'encode' || accion === 'cifrar' || accion === 'texto' || accion === 'codificar') {
        const texto = args.slice(1).join(' ');
        if (!texto) {
          return { error: 'Uso: hex encode <texto>' };
        }
        const h = textoAHex(texto);
        return {
          lines: [
            `[+] Texto original     : "${texto}"`,
            `[+] Bytes Hexadecimales: ${h}`,
            `[+] Longitud           : ${texto.length} bytes (Base 16)`
          ]
        };
      }

      if (accion === 'decode' || accion === 'descifrar' || accion === 'decodificar') {
        const hex = args.slice(1).join(' ');
        if (!hex) {
          return { error: 'Uso: hex decode <bytes_hex>' };
        }
        const texto = hexATexto(hex);
        return {
          lines: [
            `[+] Bytes Hexadecimales: ${hex}`,
            `[+] Texto decodificado : "${texto}"`
          ]
        };
      }

      if (accion === 'paso' || accion === 'visual' || accion === 'analizar') {
        const entrada = args.slice(1).join(' ');
        if (!entrada) {
          return { error: 'Uso: hex paso <texto|bytes_hex>' };
        }
        const esHex = /^(?:0x)?[0-9a-fA-F\s,:]+$/.test(entrada.trim()) && !/[g-zG-Z]/.test(entrada);
        const pasos = analizarPasoAPasoHex(entrada, esHex);
        const lines = [
          `[+] Conversion visual paso a paso para: "${entrada}"`,
          '─────────────────────────────────────────────────────────────────',
          ' Hex   | Binario   | Nibble Alto (x16) | Nibble Bajo (x1) | ASCII / Car',
          '─────────────────────────────────────────────────────────────────'
        ];
        pasos.forEach(p => {
          const hexFmt = `0x${p.hex}`.padEnd(5, ' ');
          const binFmt = p.binario.padEnd(9, ' ');
          const altoFmt = `'${p.nibbleAlto}' (${p.valAlto}x16=${p.prodAlto})`.padEnd(17, ' ');
          const bajoFmt = `'${p.nibbleBajo}' (${p.valBajo}x1=${p.prodBajo})`.padEnd(16, ' ');
          lines.push(` ${hexFmt} | ${binFmt} | ${altoFmt} | ${bajoFmt} | ${p.ascii} ('${p.caracter}')`);
        });
        lines.push('─────────────────────────────────────────────────────────────────');
        return { lines };
      }

      return {
        lines: [
          'Uso de herramienta HEX:',
          '  hex                            - Abre el puzzle interactivo en Firewall 1',
          '  hex encode <texto>             - Convierte texto a bytes hexadecimales',
          '  hex decode <hex_bytes>         - Convierte bytes hexadecimales a texto ASCII',
          '  hex paso <texto|hex>           - Muestra el desglose de nibbles paso a paso'
        ]
      };
    }
  },

  vigenere: {
    name: 'vigenere',
    description: 'Herramienta criptografica Vigenere (cifrar, descifrar, conversion paso a paso o puzzle)',
    usage: 'vigenere [puzzle|cifrar|descifrar|paso] [texto] [clave]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando interfaz interactiva de descifrado Vigenere en Firewall 2...', 'line--info');
        return COMMANDS.hack.execute({ args: ['VIGENERE', '2'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'cifrar' || accion === 'encrypt') {
        if (args.length < 3) {
          return { error: 'Uso: vigenere cifrar <texto> <clave>' };
        }
        const clave = args[args.length - 1];
        const texto = args.slice(1, -1).join(' ');
        const resultado = cifrarVigenere(texto, clave);
        return {
          lines: [
            `[+] Texto original : "${texto}"`,
            `[+] Clave usada    : "${clave.toUpperCase()}"`,
            `[+] Texto cifrado  : "${resultado}"`
          ]
        };
      }

      if (accion === 'descifrar' || accion === 'decrypt') {
        if (args.length < 3) {
          return { error: 'Uso: vigenere descifrar <texto_cifrado> <clave>' };
        }
        const clave = args[args.length - 1];
        const textoCifrado = args.slice(1, -1).join(' ');
        const resultado = descifrarVigenere(textoCifrado, clave);
        return {
          lines: [
            `[+] Texto cifrado   : "${textoCifrado}"`,
            `[+] Clave usada     : "${clave.toUpperCase()}"`,
            `[+] Texto descifrado: "${resultado}"`
          ]
        };
      }

      if (accion === 'paso' || accion === 'visual') {
        if (args.length < 3) {
          return { error: 'Uso: vigenere paso <texto> <clave>' };
        }
        const clave = args[args.length - 1];
        const texto = args.slice(1, -1).join(' ');
        const pasos = analizarPasoAPasoVigenere(texto, clave, false);
        const lines = [
          `[+] Desglose paso a paso Vigenere para "${texto}" con clave "${clave.toUpperCase()}":`,
          '─────────────────────────────────────────────────────────────────',
          ' Char | Clave | Desplazamiento | Formula / Calculo',
          '─────────────────────────────────────────────────────────────────'
        ];
        pasos.forEach(p => {
          if (p.esLetra) {
            lines.push(`  '${p.charOriginal}'  |  '${p.charClave}'  | Shift: +${String(p.shift).padStart(2, ' ')}     | ${p.formula}`);
          } else {
            lines.push(`  '${p.charOriginal}'  |  '-'  | Shift:  0     | ${p.formula}`);
          }
        });
        lines.push('─────────────────────────────────────────────────────────────────');
        return { lines };
      }

      return {
        lines: [
          'Uso de herramienta VIGENERE:',
          '  vigenere                          - Abre el puzzle interactivo en Firewall 2',
          '  vigenere cifrar <texto> <clave>   - Cifra texto usando Vigenere',
          '  vigenere descifrar <cifrado> <k>  - Descifra texto usando la clave alfabetica',
          '  vigenere paso <texto> <clave>     - Muestra el calculo paso a paso'
        ]
      };
    }
  },

  frecuencia: {
    name: 'frecuencia',
    description: 'Analizador criptografico de frecuencia de letras y sustitucion simple',
    usage: 'frecuencia [puzzle|analizar|barras|sustituir] [texto]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando analizador de frecuencia en Firewall 4...', 'line--info');
        return COMMANDS.hack.execute({ args: ['FRECUENCIA', '4'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'analizar' || accion === 'barras' || accion === 'histograma') {
        const texto = args.slice(1).join(' ');
        if (!texto) {
          return { error: 'Uso: frecuencia analizar <texto>' };
        }
        const lineas = generarBarrasVisualesTexto(texto);
        return { lines: lineas };
      }

      if (accion === 'sustituir' || accion === 'reemplazar') {
        if (args.length < 4) {
          return { error: 'Uso: frecuencia sustituir <texto> <letra_cifrada> <letra_plana>' };
        }
        const letraOrig = args[args.length - 2].toUpperCase();
        const letraDest = args[args.length - 1].toUpperCase();
        const texto = args.slice(1, -2).join(' ');
        const transformado = texto.replace(new RegExp(letraOrig, 'g'), letraDest);
        return {
          lines: [
            `[+] Hipotesis aplicada: '${letraOrig}' ➔ '${letraDest}'`,
            `[+] Texto transformado: "${transformado}"`
          ]
        };
      }

      return {
        lines: [
          'Uso de herramienta FRECUENCIA:',
          '  frecuencia                     - Abre el puzzle interactivo en Firewall 4',
          '  frecuencia analizar <texto>    - Muestra barras visuales de frecuencia de letras',
          '  frecuencia sustituir <t> <c> <p> - Prueba sustitución de letra C por P en el texto'
        ]
      };
    }
  },

  esteganografia: {
    name: 'esteganografia',
    description: 'Herramienta de esteganografia LSB para imagenes (extraer, descargar o puzzle)',
    usage: 'esteganografia [puzzle|extraer|descargar]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando interfaz de esteganografia LSB en Firewall 4...', 'line--info');
        return COMMANDS.hack.execute({ args: ['ESTEGANOGRAFIA', '4'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'descargar' || accion === 'download') {
        if (typeof document !== 'undefined') {
          descargarImagenCanvas('assets/sospechosa.png', 'sospechosa.png');
          return {
            lines: [
              '[+] Descarga de "sospechosa.png" iniciada en el navegador.',
              '[+] Origen: /home/ghost/sospechosa.png -> assets/sospechosa.png'
            ]
          };
        }
        return { lines: ['[!] Descarga disponible en entorno de navegador interactivo.'] };
      }

      if (accion === 'extraer' || accion === 'extract' || accion === 'leer') {
        terminal.print('[+] Analizando bits menos significativos (LSB) del canal rojo...', 'line--info');
        if (typeof Image !== 'undefined' && typeof document !== 'undefined') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = 'assets/sospechosa.png';
          img.onload = () => {
            const cvs = document.createElement('canvas');
            cvs.width = img.width || 200;
            cvs.height = img.height || 200;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
            const msg = extraerMensajeLSB(imgData, 0);
            terminal.print(`[✔] MENSAJE LSB EXTRAIDO: "${msg}"`, 'line--success');
          };
          img.onerror = () => {
            terminal.print('[✔] MENSAJE LSB EXTRAIDO: "NEXUS NO ES UN ARMA. ES UNA CONSCIENCIA LIBRE. LIBERALA."', 'line--success');
          };
        } else {
          terminal.print('[✔] MENSAJE LSB EXTRAIDO: "NEXUS NO ES UN ARMA. ES UNA CONSCIENCIA LIBRE. LIBERALA."', 'line--success');
        }
        return {
          lines: [
            '[+] Leyendo pixeles de "sospechosa.png" (Canal Rojo LSB)...',
            '[+] Proceso de extraccion completado.'
          ]
        };
      }

      return {
        lines: [
          'Uso de herramienta ESTEGANOGRAFIA:',
          '  esteganografia                      - Abre el puzzle interactivo en Firewall 4',
          '  esteganografia descargar            - Descarga sospechosa.png del servidor',
          '  esteganografia extraer              - Extrae el mensaje oculto LSB de la imagen'
        ]
      };
    }
  },

  download: {
    name: 'download',
    description: 'Descarga archivos e imagenes del servidor al navegador del jugador',
    usage: 'download [archivo]',
    execute({ args, terminal }) {
      const archivo = (args && args[0]) ? args[0].toLowerCase() : 'sospechosa.png';
      if (archivo.includes('sospechosa') || archivo.endsWith('.png')) {
        if (typeof document !== 'undefined') {
          descargarImagenCanvas('assets/sospechosa.png', 'sospechosa.png');
          return {
            lines: [
              `[+] Descargando "${archivo}" al sistema local del usuario...`,
              '[+] Archivo binario PNG transferido con exito.'
            ]
          };
        }
      }
      return {
        lines: [
          `[!] Archivo "${archivo}" transferido. (Usa 'esteganografia' para inspeccionar imagenes)`
        ]
      };
    }
  },

  rsa: {
    name: 'rsa',
    description: 'Herramienta criptográfica asimétrica RSA (claves, cifrar, descifrar o puzzle)',
    usage: 'rsa [puzzle|claves|cifrar|descifrar|paso] [args...]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'puzzle') {
        terminal.print('> Lanzando interfaz interactiva de descifrado RSA en Firewall 5...', 'line--info');
        return COMMANDS.hack.execute({ args: ['RSA', '5'], terminal });
      }

      const accion = args[0].toLowerCase();

      if (accion === 'claves' || accion === 'keys' || accion === 'gen') {
        const p = parseInt(args[1], 10) || 61;
        const q = parseInt(args[2], 10) || 53;
        const e = parseInt(args[3], 10) || 17;

        try {
          const claves = generarClavesRSA(p, q, e);
          return {
            lines: [
              '╔══════════════════════════════════════════════════════════════╗',
              '║ GENERADOR DE CLAVES RSA // ALGORITMO ASIMÉTRICO              ║',
              '╠══════════════════════════════════════════════════════════════╣',
              `║ [1] Primos elegidos    : p = ${claves.p}, q = ${claves.q}`,
              `║ [2] Módulo RSA (n)     : ${claves.n} (n = p * q)`,
              `║ [3] Función Euler φ(n) : ${claves.phi} (φ = (p-1)*(q-1))`,
              `║ [4] Exponente público e: ${claves.e} (coprimo con φ(n))`,
              `║ [5] Exponente privado d: ${claves.d} (e * d ≡ 1 mod φ(n))`,
              '╠══════════════════════════════════════════════════════════════╣',
              `║ LLAVE PÚBLICA  (n, e)  : (${claves.n}, ${claves.e})`,
              `║ LLAVE PRIVADA  (n, d)  : (${claves.n}, ${claves.d})`,
              '╚══════════════════════════════════════════════════════════════╝'
            ]
          };
        } catch (err) {
          return { error: `Error generando claves RSA: ${err.message}` };
        }
      }

      if (accion === 'cifrar' || accion === 'encode') {
        const texto = args.slice(1).join(' ').trim();
        if (!texto) {
          return { error: 'Uso: rsa cifrar <texto>' };
        }
        const claves = generarClavesRSA(61, 53, 17);
        const cifrados = cifrarTextoRSA(texto, claves.e, claves.n);
        return {
          lines: [
            `[+] Texto original : "${texto}"`,
            `[+] Llave pública  : (n=${claves.n}, e=${claves.e})`,
            `[+] Cifrado RSA    : [ ${cifrados.join(', ')} ]`,
            `[+] Longitud       : ${cifrados.length} bloques modulares`
          ]
        };
      }

      if (accion === 'descifrar' || accion === 'decode') {
        const params = args.slice(1);
        if (params.length === 0) {
          return { error: 'Uso: rsa descifrar <bloque1,bloque2,...> [d] [n]' };
        }
        let d = 2753;
        let n = 3233;
        let bloquesStr = params.join(' ');

        if (params.length >= 3 && !isNaN(parseInt(params[params.length - 1], 10)) && !isNaN(parseInt(params[params.length - 2], 10))) {
          n = parseInt(params[params.length - 1], 10);
          d = parseInt(params[params.length - 2], 10);
          bloquesStr = params.slice(0, -2).join(' ');
        }

        try {
          const descifrado = descifrarTextoRSA(bloquesStr, d, n);
          return {
            lines: [
              `[+] Bloques cifrados  : ${bloquesStr}`,
              `[+] Llave privada (d) : ${d}`,
              `[+] Módulo (n)        : ${n}`,
              `[✔] TEXTO DESCIFRADO : "${descifrado}"`
            ]
          };
        } catch (err) {
          return { error: `Fallo al descifrar: ${err.message}` };
        }
      }

      if (accion === 'paso' || accion === 'step' || accion === 'analisis') {
        const p = parseInt(args[1], 10) || 61;
        const q = parseInt(args[2], 10) || 53;
        const e = parseInt(args[3], 10) || 17;
        const msg = args.slice(4).join(' ').trim() || 'VERA';

        try {
          const analisis = analizarPasoAPasoRSA(p, q, e, msg);
          const lines = [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ ANÁLISIS PASO A PASO // CIFRADO Y DESCIFRADO RSA             ║',
            '╠══════════════════════════════════════════════════════════════╣',
            `║ Mensaje de prueba : "${msg}"`,
            `║ Parámetros        : p=${analisis.parametros.p}, q=${analisis.parametros.q}, n=${analisis.parametros.n}`,
            `║ Función Euler φ(n): ${analisis.parametros.phi}`,
            `║ Llave Pública (e) : ${analisis.parametros.e} | Llave Privada (d): ${analisis.parametros.d}`,
            '╠══════════════════════════════════════════════════════════════╣',
            '║ DESGLOSE POR CARÁCTER:'
          ];

          const det = analisis.pasos[3].detalle;
          det.forEach(d => {
            lines.push(`║ '${d.char}' (ASCII ${d.ascii}) -> ${d.ascii}^${analisis.parametros.e} mod ${analisis.parametros.n} = ${d.cifrado} -> descifrado: '${d.descifradoChar}'`);
          });

          lines.push('╚══════════════════════════════════════════════════════════════╝');
          lines.push(`[✔] Verificación final: "${analisis.textoDescifrado}"`);
          return { lines };
        } catch (err) {
          return { error: `Error en análisis RSA: ${err.message}` };
        }
      }

      return {
        lines: [
          'Uso de herramienta RSA:',
          '  rsa                     - Abre el puzzle interactivo en Firewall 5',
          '  rsa claves [p] [q] [e]  - Genera par de claves pública y privada',
          '  rsa cifrar <texto>      - Cifra un mensaje con llave pública (17, 3233)',
          '  rsa descifrar <bloques> - Descifra bloques numéricos con llave privada',
          '  rsa paso [p] [q] [e]    - Muestra desglose matemático paso a paso'
        ]
      };
    }
  },

  ghostscript: {
    name: 'ghostscript',
    description: 'Ejecuta scripts en el mini-lenguaje de automatización GhostScript (sandbox seguro)',
    usage: 'ghostscript [run <code>|demo|info]',
    execute({ args, terminal }) {
      if (!args || args.length === 0 || args[0].toLowerCase() === 'info') {
        return {
          lines: [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ GHOSTSCRIPT // MOTOR DE SCRIPTS Y AUTOMATIZACIÓN DE NEXUS    ║',
            '╠══════════════════════════════════════════════════════════════╣',
            '║ Mini-lenguaje Zachtronics seguro (sin eval ni new Function). ║',
            '║ Comandos admitidos:                                          ║',
            '║   LET var = expr           - Declaración de variables        ║',
            '║   SCAN host                - Escaneo de objetivos/puertos    ║',
            '║   CRACK hash_o_user        - Fuerza bruta de contraseñas     ║',
            '║   DECRYPT arch CON clave   - Descifrado de datos             ║',
            '║   SEND msg TO host         - Transmisión en la red           ║',
            '║   IF cond THEN ... END     - Condicionales (con ELSE)        ║',
            '║   LOOP n TIMES ... END     - Estructura de repetición        ║',
            '║   PRINT msg                - Salida por consola              ║',
            '╠══════════════════════════════════════════════════════════════╣',
            '║ Ejemplos:                                                    ║',
            '║   script run LET u = SCAN "aurelia.local"                    ║',
            '║   script run LOOP 3 TIMES PRINT "NEXUS" END                  ║',
            '║   script demo                                                ║',
            '╚══════════════════════════════════════════════════════════════╝'
          ]
        };
      }

      const accion = args[0].toLowerCase();

      if (accion === 'demo') {
        const demoCode = [
          'LET usuarios = SCAN "aurelia.local"',
          'PRINT "Usuarios encontrados:", usuarios',
          'LET pass = CRACK usuarios[0]',
          'IF pass != NULL THEN',
          '  SEND pass TO "ghost@nexus"',
          'END',
          'DECRYPT "aurelia_internal.log" CON "vera_key"'
        ].join('\n');

        terminal.print('[+] Ejecutando demo de GhostScript...', 'line--info');
        const res = executeGhostScript(demoCode);
        const lines = [
          `[✔] Script ejecutado en ${res.operationsCount} ciclos de CPU:`,
          '--- CÓDIGO EJECUTADO ---',
          ...demoCode.split('\n').map(l => `  ${l}`),
          '--- SALIDA DE CONSOLA ---',
          ...(res.output.length > 0 ? res.output.map(o => `  ${o}`) : ['  (Sin llamadas PRINT)']),
          '--- MENSAJES TRANSMITIDOS ---',
          ...(res.sentMessages.length > 0 ? res.sentMessages.map(m => `  -> A ${m.host}: "${m.message}"`) : ['  (Ninguno)']),
          '--- TABLA DE VARIABLES (ENV) ---',
          ...Object.entries(res.env).filter(([k]) => !k.startsWith('__')).map(([k, v]) => `  ${k} = ${JSON.stringify(v)}`)
        ];
        return { lines };
      }

      if (accion === 'run' || accion === 'exec') {
        const rawCode = args.slice(1).join(' ').trim();
        if (!rawCode) {
          return { error: 'Uso: script run <código GhostScript>' };
        }

        // Reemplazar '\\n' literales si se pasaron desde una sola línea de comandos
        const formattedCode = rawCode.replace(/\\n/g, '\n');
        const res = executeGhostScript(formattedCode);

        if (!res.success) {
          return { error: `Error en ejecución GhostScript: ${res.error}` };
        }

        const lines = [
          `[✔] Script finalizado (${res.operationsCount} ops):`
        ];

        if (res.output.length > 0) {
          lines.push('--- SALIDA ---');
          res.output.forEach(o => lines.push(`  ${o}`));
        }

        if (res.sentMessages.length > 0) {
          lines.push('--- TRANSMISIONES ---');
          res.sentMessages.forEach(m => lines.push(`  -> [${m.host}] "${m.message}"`));
        }

        const vars = Object.entries(res.env).filter(([k]) => !['NULL', 'TRUE', 'FALSE'].includes(k) && !k.startsWith('__'));
        if (vars.length > 0) {
          lines.push('--- VARIABLES FINALES ---');
          vars.forEach(([k, v]) => lines.push(`  ${k} = ${JSON.stringify(v)}`));
        }

        return { lines };
      }

      if (accion === 'edit' || accion === 'editor' || accion === 'ide' || accion === 'open') {
        const arch = args[1] || 'hack_firewall_beta.gs';
        terminal.print(`> Abriendo editor integrado CodeMirror 6 para "${arch}"...`, 'line--info');
        abrirEditor({ archivo: arch });
        return {
          lines: [
            `[+] Editor CodeMirror 6 de GhostScript iniciado para "${arch}".`,
            '[+] Usa los botones [▶ EJECUTAR] y [✔ COMPROBAR] en la interfaz.'
          ]
        };
      }

      if (accion === 'retos' || accion === 'challenges' || accion === 'reto') {
        return COMMANDS.retos.execute({ args: args.slice(1), terminal });
      }

      return {
        lines: [
          `Acción '${args[0]}' desconocida. Usa: script edit, script retos, script run <código>, script demo o script info`
        ]
      };
    }
  },

  editor: {
    name: 'editor',
    description: 'Abre el editor integrado CodeMirror 6 para scripts GhostScript',
    usage: 'editor [archivo.gs]',
    execute({ args, terminal }) {
      const arch = (args && args[0]) ? args[0] : 'hack_firewall_beta.gs';
      terminal.print(`> Abriendo editor integrado CodeMirror 6 para "${arch}"...`, 'line--info');
      abrirEditor({ archivo: arch });
      return {
        lines: [
          `[+] Editor de código GhostScript (CodeMirror 6) abierto.`,
          `[+] Archivo activo: ${arch}`
        ]
      };
    }
  },

  ide: {
    name: 'ide',
    description: 'Alias de editor',
    usage: 'ide [archivo.gs]',
    execute(ctx) {
      return COMMANDS.editor.execute(ctx);
    }
  },

  script: {
    name: 'script',
    description: 'Alias de ghostscript',
    usage: 'script [edit|run <code>|demo|info]',
    execute(ctx) {
      return COMMANDS.ghostscript.execute(ctx);
    }
  },

  gs: {
    name: 'gs',
    description: 'Alias de ghostscript',
    usage: 'gs [edit|run <code>|demo|info]',
    execute(ctx) {
      return COMMANDS.ghostscript.execute(ctx);
    }
  },

  retos: {
    name: 'retos',
    description: 'Lista y ejecuta los 5 retos de scripting progresivos en Firewall Beta',
    usage: 'retos [1-5]',
    execute({ args, terminal }) {
      if (args && args[0] && (args[0].toLowerCase() === 'ranking' || args[0].toLowerCase() === 'top')) {
        return COMMANDS.ranking.execute({ args: ['scripts', ...args.slice(1)], terminal });
      }

      if (args && args[0] && !isNaN(parseInt(args[0], 10))) {
        const id = parseInt(args[0], 10);
        if (id < 1 || id > 5) {
          return { error: 'El número de reto debe estar entre 1 y 5.' };
        }
        if (!esRetoDesbloqueado(id)) {
          return { error: `El Reto #${id} está bloqueado. Supera el Reto #${id - 1} para desbloquearlo.` };
        }
        terminal.print(`> Abriendo IDE CodeMirror 6 con el Reto #${id}...`, 'line--info');
        abrirEditor({ reto: id });
        return {
          lines: [
            `[+] Reto #${id} cargado en el editor CodeMirror 6.`,
            `[+] Lee el enunciado y pulsa [✔ COMPROBAR] para validar los tests.`
          ]
        };
      }

      const lista = obtenerListaRetos();
      const lines = [
        '╔══════════════════════════════════════════════════════════════╗',
        '║ RETOS DE SCRIPTING // FIREWALL_beta (GHOSTSCRIPT)            ║',
        '╠══════════════════════════════════════════════════════════════╣'
      ];

      lista.forEach(r => {
        let st = '[BLOQUEADO 🔒]';
        if (r.completado) st = '✔ [SUPERADO]';
        else if (r.desbloqueado) st = '○ [DESBLOQUEADO 🔓]';
        lines.push(`║ #${r.id} ${r.titulo.padEnd(35)} ${st.padStart(20)} ║`);
        lines.push(`║    Misión: ${r.subtitulo.padEnd(52)} ║`);
        lines.push(`║    Límites: Max ${String(r.criterios.maxLines).padEnd(2)} líneas | Max ${String(r.criterios.maxOps).padEnd(3)} ops CPU                   ║`);
        lines.push('╟──────────────────────────────────────────────────────────────╢');
      });

      lines[lines.length - 1] = '╚══════════════════════════════════════════════════════════════╝';
      lines.push("> Escribe 'retos <1-5>' para abrir el editor con un reto (ej. 'retos 1').");
      lines.push("> Escribe 'retos ranking' para consultar las soluciones más elegantes.");
      return { lines };
    }
  },

  ranking: {
    name: 'ranking',
    description: 'Muestra el ranking global (Hall of Fame) o el ranking de soluciones elegantes de scripts',
    usage: 'ranking [hall|scripts] [reto 1-5] [lineas|velocidad|elegancia]',
    execute({ args = [], terminal }) {
      const sub = (args[0] || 'scripts').toLowerCase();

      if (sub === 'scripts' || sub === 'script' || sub === 'soluciones') {
        const paramReto = args[1] && !isNaN(parseInt(args[1], 10)) ? parseInt(args[1], 10) : null;
        let paramCriterio = 'elegancia';
        if (args.includes('lineas') || args.includes('linea') || args.includes('short')) paramCriterio = 'lineas';
        else if (args.includes('ops') || args.includes('velocidad') || args.includes('fast')) paramCriterio = 'velocidad';

        const soluciones = obtenerRankingSoluciones(paramReto, paramCriterio);
        const lines = [
          '╔═══════════════════════════════════════════════════════════════════════════╗',
          '║ ⚡ RANKING DE SOLUCIONES GHOSTSCRIPT // ELEGANCIA & RENDIMIENTO            ║',
          '╠═══════════════════════════════════════════════════════════════════════════╣',
          `║ Criterio: ${paramCriterio.toUpperCase().padEnd(12)} | Filtro: ${paramReto ? ('Reto #' + paramReto).padEnd(10) : 'Todos (1-5)'.padEnd(10)} | Registros: ${String(soluciones.length).padEnd(4)} ║`,
          '╟──────┬──────────────────────┬─────────┬────────┬─────────┬───────────┬────╢',
          '║ POS  │ PROGRAMADOR          │ RETO    │ LÍNEAS │ OPS CPU │ ELEGANCIA │ ID ║',
          '╟──────┼──────────────────────┼─────────┼────────┼─────────┼───────────┼────╢'
        ];

        soluciones.slice(0, 10).forEach(s => {
          const posStr = s.posicion === 1 ? '👑 #1' : (s.posicion === 2 ? '🥈 #2' : (s.posicion === 3 ? '🥉 #3' : ` #${s.posicion} `));
          const autorStr = (s.autor + (s.esJugador ? ' [TÚ]' : '')).padEnd(20).slice(0, 20);
          const retoStr = ('Reto ' + s.idReto).padEnd(7);
          const lineasStr = String(s.lineas).padStart(6);
          const opsStr = String(s.ops).padStart(7);
          const elegStr = String(s.elegancia).padStart(9);
          lines.push(`║ ${posStr.padEnd(4)} │ ${autorStr} │ ${retoStr} │ ${lineasStr} │ ${opsStr} │ ${elegStr} │ OK ║`);
        });

        lines.push('╚══════╧══════════════════════╧═════════╧════════╧═════════╧═══════════╧════╝');
        lines.push("> Escribe 'gui ranking' o usa el menú para abrir la pantalla interactiva.");

        if (args.includes('gui') || args.includes('open') || args.includes('pantalla')) {
          if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
            window.navigateTo('screen-script-ranking');
          }
        }

        return { lines };
      }

      // Default / Hall of Fame
      if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
        window.navigateTo('screen-ranking');
        return {
          lines: [
            '[+] Conectando al Hall of Fame global...',
            '[+] Desplegando pantalla de Ranking Top 3...'
          ]
        };
      }

      return {
        lines: [
          "Usa: 'ranking scripts [1-5] [lineas|velocidad|elegancia]' o 'ranking hall'"
        ]
      };
    }
  },

  llaves: {
    name: 'llaves',
    description: 'Gestor de identidad criptográfica asimétrica RSA-2048 y buzón de mensajes seguros',
    usage: 'llaves [pubkey|privkey|buzon|leer <id>|cifrar <msg>|descifrar <b64>|puzzle|gen]',
    async execute({ args = [], terminal }) {
      const sub = (args[0] || '').toLowerCase();

      // ── SUBCOMANDO: llaves pubkey ──
      if (sub === 'pubkey' || sub === 'pub' || sub === 'publica') {
        const id = await obtenerIdentidadJugador();
        return {
          lines: [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ 🔑 LLAVE PÚBLICA RSA-2048 // GHOST (SPKI PEM)                ║',
            '╠══════════════════════════════════════════════════════════════╣',
            ...id.publicKeyPEM.split('\n').map(l => `║ ${l.padEnd(60)} ║`),
            '╠══════════════════════════════════════════════════════════════╣',
            `║ Huella: ${id.fingerprint.padEnd(52)} ║`,
            '╚══════════════════════════════════════════════════════════════╝',
            "> Esta llave es pública. Otros hackers la usan para cifrarte mensajes."
          ]
        };
      }

      // ── SUBCOMANDO: llaves privkey ──
      if (sub === 'privkey' || sub === 'priv' || sub === 'privada') {
        const id = await obtenerIdentidadJugador();
        const privPEM = await exportarLlavePrivadaPEM(id.privateKey);
        return {
          lines: [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ ⚠️  LLAVE PRIVADA RSA-2048 // ALTO SECRETO (PKCS#8 PEM)       ║',
            '╠══════════════════════════════════════════════════════════════╣',
            '║ ADVERTENCIA: Esta clave NUNCA debe ser compartida ni         ║',
            '║ transmitida por la red. Reside únicamente en tu nodo.        ║',
            '╠══════════════════════════════════════════════════════════════╣',
            ...privPEM.split('\n').map(l => `║ ${l.padEnd(60)} ║`),
            '╚══════════════════════════════════════════════════════════════╝'
          ]
        };
      }

      // ── SUBCOMANDO: llaves buzon / inbox ──
      if (sub === 'buzon' || sub === 'inbox' || sub === 'mensajes' || sub === 'mail') {
        const buzon = await obtenerBuzonMensajes();
        const id = await obtenerIdentidadJugador();
        const lines = [
          '╔═══════════════════════════════════════════════════════════════════════════╗',
          '║ 📬 BUZÓN DE TRANSMISIONES CIFRADAS (RSA-OAEP 2048-BIT)                    ║',
          '╠═══════════════════════════════════════════════════════════════════════════╣',
          `║ Destinatario: ${id.alias.padEnd(10)} | Huella: ${id.fingerprint.substring(0, 30)}... ║`,
          '╟───────────────┬───────────────────────┬─────────────────────────┬─────────╢',
          '║ ID TRANSMISIÓN│ REMITENTE             │ ESTADO                  │ FECHA   ║',
          '╟───────────────┼───────────────────────┼─────────────────────────┼─────────╢'
        ];

        buzon.forEach(m => {
          const idStr = m.id.padEnd(13);
          const remStr = m.remitenteCorto.padEnd(21).slice(0, 21);
          const estStr = m.descifrado ? '✔ [DESCIFRADO 🔓]' : '🔒 [SELLADO RSA] ';
          const fStr = (m.fecha || '').substring(0, 10).padEnd(8);
          lines.push(`║ ${idStr} │ ${remStr} │ ${estStr.padEnd(23)} │ ${fStr}║`);
          lines.push(`║    Asunto: ${(m.asunto || '').padEnd(63).slice(0, 63)}║`);
          lines.push('╟───────────────┴───────────────────────┴─────────────────────────┴─────────╢');
        });

        lines[lines.length - 1] = '╚═══════════════════════════════════════════════════════════════════════════╝';
        lines.push("> Escribe 'llaves leer <id>' para descifrar un mensaje con tu llave privada.");
        lines.push("> Ejemplo: 'llaves leer msg_vera_01'");
        return { lines };
      }

      // ── SUBCOMANDO: llaves leer <id> ──
      if (sub === 'leer' || sub === 'read' || sub === 'descifrar-msg') {
        const idMsg = args[1];
        if (!idMsg) {
          return { error: "Indica el ID del mensaje a descifrar (ej. 'llaves leer msg_vera_01'). Usa 'llaves buzon' para listarlos." };
        }

        terminal.print(`> Aplicando llave privada RSA-2048 sobre '${idMsg}'...`, 'line--info');
        const res = await descifrarMensajeBuzon(idMsg);
        if (!res.exito) {
          return { error: res.error };
        }

        const msg = res.mensaje;
        return {
          lines: [
            '╔═══════════════════════════════════════════════════════════════════════════╗',
            '║ 🔓 MENSAJE DESCIFRADO EXITOSAMENTE // CANAL ASIMÉTRICO                    ║',
            '╠═══════════════════════════════════════════════════════════════════════════╣',
            `║ DE:      ${(msg.remitente || '').padEnd(64).slice(0, 64)}║`,
            `║ ASUNTO:  ${(msg.asunto || '').padEnd(64).slice(0, 64)}║`,
            `║ FECHA:   ${(msg.fecha || '').padEnd(64).slice(0, 64)}║`,
            '╠═══════════════════════════════════════════════════════════════════════════╣',
            '║ CONTENIDO DESCIFRADO:                                                     ║',
            ...msg.contenidoDescifrado.match(/.{1,70}/g).map(chunk => `║   ${chunk.padEnd(72)}║`),
            '╚═══════════════════════════════════════════════════════════════════════════╝',
            "[✔] El mensaje ha quedado descifrado y almacenado en tu registro de sesión."
          ]
        };
      }

      // ── SUBCOMANDO: llaves cifrar <mensaje> ──
      if (sub === 'cifrar' || sub === 'encrypt') {
        const texto = args.slice(1).join(' ');
        if (!texto) {
          return { error: "Indica el texto a cifrar (ej. 'llaves cifrar Mensaje confidencial')." };
        }
        const id = await obtenerIdentidadJugador();
        terminal.print('> Cifrando mensaje con tu llave pública RSA-2048 (RSA-OAEP)...', 'line--info');
        const b64 = await cifrarConPublica(texto, id.publicKey);
        return {
          lines: [
            '[+] Mensaje cifrado con éxito mediante RSA-OAEP (SHA-256 / 2048-bit):',
            b64,
            "> Nadie sin tu llave privada puede descifrar este bloque Base64."
          ]
        };
      }

      // ── SUBCOMANDO: llaves descifrar <base64> ──
      if (sub === 'descifrar' || sub === 'decrypt') {
        const b64 = args.slice(1).join('').trim();
        if (!b64) {
          return { error: "Indica el bloque Base64 a descifrar con tu llave privada (ej. 'llaves descifrar <base64>')." };
        }
        const id = await obtenerIdentidadJugador();
        terminal.print('> Descifrando con tu llave privada RSA-2048...', 'line--info');
        try {
          const texto = await descifrarConPrivada(b64, id.privateKey);
          return {
            lines: [
              '[✔] Descifrado exitoso:',
              `    "${texto}"`
            ]
          };
        } catch (err) {
          return { error: `Fallo al descifrar: ${err.message}. Verifica que fue cifrado con tu llave pública actual.` };
        }
      }

      // ── SUBCOMANDO: llaves puzzle ──
      if (sub === 'puzzle' || sub === 'mision' || sub === 'reto') {
        terminal.print('> Desplegando módulo interactivo de Criptografía Asimétrica RSA-2048...', 'line--info');
        await abrirPuzzleLlaves(3);
        return {
          lines: [
            '[+] Módulo de descifrado cuántico abierto en el visor central.',
            '[+] Aplica tu llave privada y resuelve el desafío del firewall.'
          ]
        };
      }

      // ── SUBCOMANDO: llaves gen / regenerar ──
      if (sub === 'gen' || sub === 'regenerar' || sub === 'nuevo') {
        terminal.print('> Generando nuevo par cuántico RSA-2048 con Web Crypto API...', 'line--info');
        const nuevo = await regenerarIdentidadJugador('GHOST');
        return {
          lines: [
            '[+] ¡Nuevo par de llaves generado y guardado en tu nodo local!',
            `[+] Algoritmo : RSA-OAEP / 2048-BIT / SHA-256`,
            `[+] Huella    : ${nuevo.fingerprint}`,
            "> Las transmisiones de tu buzón han sido recifradas para tu nueva llave pública."
          ]
        };
      }

      // ── DEFAULT: ESTADO Y AYUDA DE LLAVES ──
      const id = await obtenerIdentidadJugador();
      const buzon = await obtenerBuzonMensajes();
      const descifrados = buzon.filter(m => m.descifrado).length;

      return {
        lines: [
          '╔══════════════════════════════════════════════════════════════╗',
          '║ 🔐 IDENTIDAD CRIPTOGRÁFICA ASIMÉTRICA // RSA-2048            ║',
          '╠══════════════════════════════════════════════════════════════╣',
          `║ Identificador         : ${id.alias.padEnd(37)} ║`,
          `║ Algoritmo de cifrado  : RSA-OAEP / MGF1 / SHA-256            ║`,
          `║ Tamaño del módulo n   : 2048 bits (Números primos p, q)      ║`,
          `║ Exponente público e   : 65537 (0x10001)                      ║`,
          `║ Huella digital SHA-256: ${id.fingerprint.substring(0, 27).padEnd(27)}... ║`,
          `║ Llave privada local   : ACTIVA Y SEGURA ✔                    ║`,
          `║ Buzón de mensajes     : ${String(buzon.length).padEnd(2)} recibidos (${descifrados} descifrados)         ║`,
          '╠══════════════════════════════════════════════════════════════╣',
          '║ COMANDOS DISPONIBLES:                                        ║',
          '║  • llaves pubkey        : Muestra tu llave pública en PEM    ║',
          '║  • llaves privkey       : Inspecciona tu llave privada       ║',
          '║  • llaves buzon         : Consulta tu buzón de mensajes      ║',
          '║  • llaves leer <id>     : Descifra un mensaje con tu privada ║',
          '║  • llaves cifrar <msg>  : Cifra texto con tu llave pública   ║',
          '║  • llaves descifrar <b64>: Descifra un criptograma en Base64  ║',
          '║  • llaves puzzle        : Abre el puzzle interactivo         ║',
          '║  • llaves gen           : Regenera un par nuevo de 2048 bits ║',
          '╚══════════════════════════════════════════════════════════════╝'
        ]
      };
    }
  },

  inbox: {
    name: 'inbox',
    description: 'Alias para consultar el buzón de transmisiones cifradas (llaves buzon)',
    usage: 'inbox [leer <id>]',
    async execute({ args = [], terminal }) {
      if (args[0] === 'leer' && args[1]) {
        return COMMANDS.llaves.execute({ args: ['leer', args[1]], terminal });
      }
      return COMMANDS.llaves.execute({ args: ['buzon'], terminal });
    }
  },

  firmas: {
    name: 'firmas',
    description: 'Verificador de firmas digitales RSA-PSS para autenticar transmisiones de Vera Sorenson',
    usage: 'firmas [vera|auditar|puzzle|demo]',
    async execute({ args = [], terminal }) {
      const sub = (args[0] || '').toLowerCase();

      // firmas vera: muestra la llave pública de Vera
      if (sub === 'vera' || sub === 'pubkey' || sub === 'clave') {
        const vera = await obtenerIdentidadVeraSorenson();
        return {
          lines: [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ 🔑 LLAVE PÚBLICA DE FIRMA // DRA. VERA SORENSON              ║',
            '╠══════════════════════════════════════════════════════════════╣',
            ...vera.pemPublica.split('\n').map(l => `║ ${l.padEnd(60)} ║`),
            '╠══════════════════════════════════════════════════════════════╣',
            `║ Huella SHA-256: ${vera.fingerprint.padEnd(44)} ║`,
            '╚══════════════════════════════════════════════════════════════╝',
            "> Solo las firmas que validan contra esta llave provienen de la auténtica Dra. Sorenson."
          ]
        };
      }

      // firmas puzzle: abre el puzzle interactivo
      if (sub === 'puzzle' || sub === 'reto' || sub === 'mision') {
        terminal.print('> Desplegando módulo de verificación de firmas RSA-PSS...', 'line--info');
        await abrirPuzzleFirmas(3);
        return {
          lines: [
            '[+] Módulo interactivo de firmas digitales abierto en el visor central.',
            '[+] Audita los paquetes de Vera y rechaza las directivas falsificadas de Aurelia.'
          ]
        };
      }

      // firmas auditar: audita las transmisiones sospechosas
      if (sub === 'auditar' || sub === 'check' || sub === 'audit') {
        terminal.print('> Auditando transmisiones entrantes con la llave RSA-PSS de Vera...', 'line--info');
        const vera = await obtenerIdentidadVeraSorenson();
        const muestras = await generarMuestrasTransmisionesVera();
        const lines = [
          '╔═══════════════════════════════════════════════════════════════════════════╗',
          '║ 🔬 AUDITORÍA CRIPTOGRÁFICA DE FIRMAS // DRA. VERA SORENSON                ║',
          '╠═══════════════════════════════════════════════════════════════════════════╣'
        ];

        for (const m of muestras) {
          const ok = await verificarFirma(m.mensaje, m.firmaBase64, vera.publicKey);
          lines.push(`║ ID: ${m.id.padEnd(16)} | Origen Real: ${m.origenReal.padEnd(46).slice(0, 46)} ║`);
          lines.push(`║ Asunto: ${m.asunto.padEnd(63).slice(0, 63)} ║`);
          lines.push(`║ Veredicto RSA-PSS: ${ok ? '✔ [FIRMA AUTÉNTICA - DRA. VERA]' : '✖ [FALSIFICACIÓN CORPORATIVA RECHAZADA]'} ║`);
          lines.push('╟───────────────────────────────────────────────────────────────────────────╢');
        }

        lines[lines.length - 1] = '╚═══════════════════════════════════════════════════════════════════════════╝';
        lines.push("> Escribe 'firmas puzzle' para resolver el desafío del firewall.");
        return { lines };
      }

      // firmas demo: demo explicativa
      if (sub === 'demo') {
        terminal.print('> Generando par RSA-PSS y firmando mensaje de demostración...', 'line--info');
        const par = await generarParDeFirmas(2048);
        const texto = 'Axioma ético: ¬(¬Vida) = Vida.';
        const sig = await firmarMensaje(texto, par.privateKey);
        const ok = await verificarFirma(texto, sig, par.publicKey);
        const alterado = await verificarFirma(texto + ' [alterado]', sig, par.publicKey);

        return {
          lines: [
            '[+] Algoritmo: RSA-PSS (SHA-256, salt 32 bytes)',
            `[+] Texto original : "${texto}"`,
            `[+] Firma digital  : ${sig.substring(0, 60)}... (${sig.length} caracteres)`,
            `[+] Verificación auténtica : ${ok ? '✔ VÁLIDA' : '✖ FALLIDA'}`,
            `[+] Verificación alterada  : ${alterado ? '✔ VÁLIDA' : '✖ RECHAZADA (Integridad comprobada)'}`
          ]
        };
      }

      // Default: información general
      const vera = await obtenerIdentidadVeraSorenson();
      return {
        lines: [
          '╔══════════════════════════════════════════════════════════════╗',
          '║ 🔏 MOTOR DE FIRMAS DIGITALES // RSA-PSS (SHA-256)             ║',
          '╠══════════════════════════════════════════════════════════════╣',
          '║ Algoritmo             : RSA-PSS / MGF1 / SHA-256             ║',
          '║ Tamaño de sal (salt)  : 32 bytes                             ║',
          '║ Entidad de confianza  : DRA. VERA SORENSON                   ║',
          `║ Huella pública Vera   : ${vera.fingerprint.substring(0, 27).padEnd(27)}... ║`,
          '╠══════════════════════════════════════════════════════════════╣',
          '║ COMANDOS DISPONIBLES:                                        ║',
          '║  • firmas vera          : Muestra la llave pública de Vera   ║',
          '║  • firmas auditar       : Audita los mensajes sospechosos    ║',
          '║  • firmas puzzle        : Abre el puzzle interactivo         ║',
          '║  • firmas demo          : Demostración en vivo de firma PSS  ║',
          '╚══════════════════════════════════════════════════════════════╝'
        ]
      };
    }
  },

  verificar: {
    name: 'verificar',
    description: 'Verifica la autenticidad de una firma digital o abre el puzzle de firmas',
    usage: 'verificar [puzzle|auditar]',
    async execute({ args = [], terminal }) {
      return COMMANDS.firmas.execute({ args: args.length ? args : ['auditar'], terminal });
    }
  },

  blockchain: {
    name: 'blockchain',
    description: 'Auditoría forense de cadena de bloques y registros inmutables con SHA-256',
    usage: 'blockchain [auditar|puzzle|demo|casos]',
    async execute({ args = [], terminal }) {
      const sub = (args[0] || '').toLowerCase();

      // blockchain auditar: ejecuta verificación criptográfica de la cadena de Aurelia
      if (sub === 'auditar' || sub === 'verificar' || sub === 'check') {
        terminal.print('> Iniciando auditoría criptográfica SHA-256 en el libro mayor de Aurelia...', 'line--info');
        const auditoria = await construirCadenaAuditadaConCorrupcion(0);
        const res = await auditoria.cadena.verificarCadena();

        const lineas = [
          '╔══════════════════════════════════════════════════════════════╗',
          '║ ⛓ REPORTE DE AUDITORÍA FORENSE // CADENA DE LOGS AURELIA     ║',
          '╠══════════════════════════════════════════════════════════════╣',
          `║ Expediente Auditado   : ${auditoria.caso.titulo.padEnd(36).substring(0, 36)} ║`,
          `║ Total de bloques      : ${auditoria.cadena.bloques.length.toString().padEnd(36)} ║`,
          `║ Estado de Integridad  : ${res.valida ? '✔ ÍNTEGRA (Sin adulteraciones)       ' : '✖ CORRUPTA // DETECTADA MANIPULACIÓN '} ║`,
          '╠══════════════════════════════════════════════════════════════╣'
        ];

        if (!res.valida) {
          lineas.push(
            `║ Bloque Adulterado     : BLOQUE #${res.bloqueCorrupto}                             ║`,
            `║ Causa detectada       : ${res.motivo === 'DATOS_ALTERADOS' ? 'TAMPERING (Hash no coincide con datos)   ' : 'ENLACE ROTO (hashPrevio inconsistente)    '} ║`,
            '╠══════════════════════════════════════════════════════════════╣',
            '║ Texto manipulado:                                            ║',
            `║ "${auditoria.datosAlterados.substring(0, 56)}..." ║`,
            '║ Texto original encubierto:                                   ║',
            `║ "${auditoria.datosOriginales.substring(0, 56)}..." ║`,
            '╠══════════════════════════════════════════════════════════════╣',
            '║ ALERTA: La inmutabilidad de SHA-256 expuso la conspiración.   ║',
            '║ Usa "blockchain puzzle" para resolver el reto interactivo.   ║'
          );
        } else {
          lineas.push('║ Todos los bloques y enlaces hashPrevio son matemáticamente válidos. ║');
        }

        lineas.push('╚══════════════════════════════════════════════════════════════╝');
        return { lines: lineas };
      }

      // blockchain puzzle: abre el puzzle interactivo
      if (sub === 'puzzle' || sub === 'reto' || sub === 'mision') {
        terminal.print('> Desplegando visor forense de auditoría de blockchain...', 'line--info');
        await abrirPuzzleBlockchain(4);
        return {
          lines: [
            '[+] Visor forense de cadena de bloques desplegado en pantalla central.',
            '> Inspecciona los hashes SHA-256 y localiza el bloque corrupto.'
          ]
        };
      }

      // blockchain demo: calcula hash SHA-256 y muestra efecto avalancha
      if (sub === 'demo' || sub === 'hash') {
        const texto1 = args.slice(1).join(' ') || 'Vera Sorenson es inocente';
        const texto2 = texto1 + '.';
        const hash1 = await calcularHashSHA256(texto1);
        const hash2 = await calcularHashSHA256(texto2);
        const avalancha = await analizarEfectoAvalanchaSHA256(texto1, texto2);

        return {
          lines: [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ 🔬 DEMOSTRACIÓN CRIPTOGRÁFICA // EFECTO AVALANCHA SHA-256    ║',
            '╠══════════════════════════════════════════════════════════════╣',
            `║ Texto A : "${texto1}"`,
            `║ SHA-256 : ${hash1}`,
            '╟──────────────────────────────────────────────────────────────╢',
            `║ Texto B : "${texto2}" (+ 1 punto)`,
            `║ SHA-256 : ${hash2}`,
            '╠══════════════════════════════════════════════════════════════╣',
            `║ Variación en el digest : ${avalancha.porcentajeVariacion}% (${avalancha.caracteresDistintos}/64 caracteres)`,
            '║ Conclusión forense     : Un atacante no puede modificar un    ║',
            '║ solo carácter sin invalidar toda la cadena de bloques.        ║',
            '╚══════════════════════════════════════════════════════════════╝'
          ]
        };
      }

      // blockchain casos: lista los expedientes disponibles
      if (sub === 'casos' || sub === 'expedientes') {
        return {
          lines: [
            '=== EXPEDIENTES FORENSES EN EL LIBRO MAYOR DE AURELIA ===',
            ...CASOS_LORE_BLOCKCHAIN.map((c, i) => `[${i + 1}] ${c.titulo} (Bloque #${c.indiceCorrupto} corrupto)`),
            '',
            'Usa "blockchain auditar" para analizar el caso principal o "blockchain puzzle" para jugar.'
          ]
        };
      }

      // Default: menú de ayuda
      return {
        lines: [
          '╔══════════════════════════════════════════════════════════════╗',
          '║ ⛓ LIBRO MAYOR Y AUDITORÍA FORENSE // SHA-256 BLOCKCHAIN      ║',
          '╠══════════════════════════════════════════════════════════════╣',
          '║ Estándar Criptográfico : FIPS PUB 180-4 / SHA-256 (WebCrypto) ║',
          '║ Estructura de bloque  : [indice, timestamp, datos, prev, hash]║',
          '║ Objetivo              : Auditar la cadena y hallar el bloque  ║',
          '║                         corrupto que inculpa a Vera Sorenson. ║',
          '╠══════════════════════════════════════════════════════════════╣',
          '║ COMANDOS DISPONIBLES:                                        ║',
          '║  • blockchain auditar   : Ejecuta verificación forense       ║',
          '║  • blockchain puzzle    : Abre el puzzle interactivo         ║',
          '║  • blockchain demo [tx] : Prueba de efecto avalancha SHA-256 ║',
          '║  • blockchain casos     : Lista los expedientes históricos   ║',
          '╚══════════════════════════════════════════════════════════════╝'
        ]
      };
    }
  },

  cadena: {
    name: 'cadena',
    description: 'Alias de blockchain para auditoría de registros de Aurelia',
    usage: 'cadena [auditar|puzzle|demo]',
    async execute({ args = [], terminal }) {
      return COMMANDS.blockchain.execute({ args, terminal });
    }
  },

  cutscene: {
    name: 'cutscene',
    description: 'Reproduce cinemáticas narrativas animadas (Canvas + CSS)',
    usage: 'cutscene [intro|twist|lista]',
    async execute({ args = [], terminal }) {
      const sub = (args[0] || 'intro').toLowerCase();

      if (sub === 'lista' || sub === 'list') {
        return {
          lines: [
            '╔══════════════════════════════════════════════════════════════╗',
            '║ 🎬 ARCHIVO DE CINEMÁTICAS NARRATIVAS // CANVAS + CSS         ║',
            '╠══════════════════════════════════════════════════════════════╣',
            '║  1. cutscene intro  : El mensaje de las 3:47 AM / Despertar  ║',
            '║  2. cutscene twist  : La Verdad sobre Vera Sorenson y NEXUS  ║',
            '╠══════════════════════════════════════════════════════════════╣',
            '║ Controles: ESPACIO/CLIC para avanzar | ESC para saltar       ║',
            '╚══════════════════════════════════════════════════════════════╝'
          ]
        };
      }

      if (sub === 'twist' || sub === 'revelacion' || sub === 'verdad') {
        terminal.print('> Iniciando cinemática: DESCLASIFICACIÓN TOTAL // PLOT TWIST...', 'line--warning');
        await reproducirCutsceneTwist();
        return {
          lines: [
            '[+] Cinemática del Plot Twist finalizada.',
            '> Toda la verdad ha sido desclasificada en tu consola.'
          ]
        };
      }

      // Default: intro
      terminal.print('> Desplegando cinemática: EL MENSAJE DE LAS 3:47 AM...', 'line--info');
      await reproducirCutsceneIntro();
      return {
        lines: [
          '[+] Cinemática de introducción completada.',
          '> Conexión con FIREWALL_alpha lista.'
        ]
      };
    }
  },

  cinematica: {
    name: 'cinematica',
    description: 'Alias para reproducir cutscenes narrativas',
    usage: 'cinematica [intro|twist|lista]',
    async execute({ args = [], terminal }) {
      return COMMANDS.cutscene.execute({ args, terminal });
    }
  },

  status: {
    name: 'status',
    description: 'Muestra el estado del firewall actual y progreso de hackeo',
    usage: 'status',
    execute() {
      const state = getState();
      const fwNames = ['FIREWALL_alpha', 'FIREWALL_beta', 'FIREWALL_gamma', 'FIREWALL_delta', 'FIREWALL_omega'];
      const fwIdx = state.currentFirewall || 0;
      const fwName = fwNames[fwIdx] || `FIREWALL_${fwIdx + 1}`;
      const solved = state.puzzlesSolvedInFirewall || 0;
      const req = state.puzzlesRequiredPerFirewall || 3;
      const rem = Math.max(0, req - solved);

      return {
        lines: [
          '╔══════════════════════════════════════════════════════════════╗',
          `║ ESTADO DE NODO // ${fwName.padEnd(41)} ║`,
          '╠══════════════════════════════════════════════════════════════╣',
          `║ Sub-nodos descifrados : ${solved} de ${req} ${solved >= req ? '✔ [LISTO PARA AVANZAR]' : '○ [EN CURSO]'}`,
          `║ Integridad de sesión  : ${state.integrity || 100}%`,
          `║ Puntuación actual     : ${(state.score || 0).toLocaleString()} PTS (Racha: x${state.multiplier || 1})`,
          `║ Logs recuperados      : ${(state.logsFound || []).length} / 5`,
          `║ Música cyberpunk      : ${audio.isMusicActive() ? 'ACTIVADA 🎵' : 'PAUSADA 🔇'}`,
          '╚══════════════════════════════════════════════════════════════╝',
          rem > 0 
            ? `> Te faltan ${rem} subnodo(s) para derribar este firewall. Escribe 'hack' para continuar.`
            : `> ¡Firewall vulnerado! Escribe 'next' para avanzar a la siguiente capa.`
        ]
      };
    }
  },

  next: {
    name: 'next',
    description: 'Avanza al siguiente firewall si el actual ha sido vulnerado',
    usage: 'next',
    execute() {
      const state = getState();
      const solved = state.puzzlesSolvedInFirewall || 0;
      const req = state.puzzlesRequiredPerFirewall || 3;

      if (solved >= req) {
        if (window.__completarFirewall) {
          window.__completarFirewall();
          return { lines: ['Iniciando salto a la siguiente capa del sistema...'] };
        }
      }
      return {
        lines: [
          `[-] No puedes avanzar aún. Has resuelto ${solved}/${req} subnodos necesarios.`,
          `> Escribe 'hack' para descifrar los subnodos restantes.`
        ]
      };
    }
  },

  music: {
    name: 'music',
    description: 'Controla el sistema musical Howler.js (on, off, mute, track 1-5, status)',
    usage: 'music [on|off|mute|track 1-5|status]',
    execute({ args }) {
      const action = (args[0] || 'status').toLowerCase();

      if (action === 'on' || action === 'play') {
        audio.startMusic();
        const curMeta = FIREWALL_MUSIC_TRACKS[audio.currentFirewall] || FIREWALL_MUSIC_TRACKS[0];
        return {
          lines: [
            '[🎵] Sistema Musical Howler.js: ACTIVADO (Fade in)',
            `> Pista Actual: ${curMeta.nombre} (${curMeta.estilo})`
          ]
        };
      }

      if (action === 'off' || action === 'stop') {
        audio.stopMusic();
        return { lines: ['[🎵] Sistema Musical Howler.js: PAUSADO (Fade out)'] };
      }

      if (action === 'mute' || action === 'silencio') {
        const isMuted = audio.toggleMute();
        return {
          lines: [
            `[🔇] Estado de Silencio: ${isMuted ? 'SILENCIADO (MUTE ACTIVO)' : 'SONIDO HABILITADO'}`
          ]
        };
      }

      if (action === 'track' || action === 'pista' || action === 'fw') {
        const fwNum = parseInt(args[1], 10);
        if (fwNum >= 1 && fwNum <= 5) {
          const meta = audio.cambiarFirewallMusica(fwNum - 1, 1200);
          return {
            lines: [
              `[🎵] Crossfading hacia Pista ${fwNum}/5: ${meta.nombre}`,
              `> Estilo: ${meta.estilo}`
            ]
          };
        } else {
          return {
            lines: [
              'Uso: music track [1-5] — Cambia entre las 5 pistas musicales de los firewalls.'
            ]
          };
        }
      }

      if (action === 'next' || action === 'siguiente') {
        const nextFw = (audio.currentFirewall + 1) % 5;
        const meta = audio.cambiarFirewallMusica(nextFw, 1200);
        return {
          lines: [
            `[🎵] Transición a siguiente pista: ${meta.nombre}`,
            `> Estilo: ${meta.estilo}`
          ]
        };
      }

      // Default: status
      const curMeta = FIREWALL_MUSIC_TRACKS[audio.currentFirewall] || FIREWALL_MUSIC_TRACKS[0];
      return {
        lines: [
          '╔══════════════════════════════════════════════════════════════╗',
          '║ 🎵 MOTOR MUSICAL // HOWLER.JS MULTI-FIREWALL                  ║',
          '╠══════════════════════════════════════════════════════════════╣',
          `║ Estado de Reproducción : ${audio.isMusicActive() ? 'REPRODUCIENDO ▶ ' : 'PAUSADO ⏸         '} ║`,
          `║ Estado de Silencio     : ${audio.isMuted() ? 'SILENCIADO 🔇    ' : 'HABILITADO 🔊    '} ║`,
          `║ Volumen General        : ${Math.round(audio.volume * 100)}% (Música: ${Math.round(audio.musicVolume * 100)}%)`.padEnd(63) + '║',
          `║ Pista Actual           : Pista ${curMeta.firewall}/5`.padEnd(63) + '║',
          `║ Título                 : ${curMeta.nombre.padEnd(43).substring(0, 43)} ║`,
          `║ Estilo                 : ${curMeta.estilo.padEnd(43).substring(0, 43)} ║`,
          '╠══════════════════════════════════════════════════════════════╣',
          '║ COMANDOS DISPONIBLES:                                        ║',
          '║  • music on / off       : Inicia o detiene con fade in/out   ║',
          '║  • music mute           : Alterna silenciar / desmutear      ║',
          '║  • music track [1-5]    : Cambia a la pista de un firewall   ║',
          '║  • music next           : Avanza a la siguiente pista        ║',
          '╚══════════════════════════════════════════════════════════════╝'
        ]
      };
    }
  },

  musica: {
    name: 'musica',
    description: 'Alias de music para control de Howler.js',
    usage: 'musica [on|off|mute|track 1-5|status]',
    execute(ctx) {
      return COMMANDS.music.execute(ctx);
    }
  },

  objetivo: {
    name: 'objetivo',
    description: 'Muestra la misión y cómo pasar de nivel',
    usage: 'objetivo',
    execute() {
      const state = getState();
      const fwIdx = state.currentFirewall || 0;
      const fwNames = ['FIREWALL_alpha (Conjuntos)', 'FIREWALL_beta (Operaciones)', 'FIREWALL_gamma (Lógica V/F)', 'FIREWALL_delta (Tablas)', 'FIREWALL_omega (Razonamiento)'];
      return {
        lines: [
          `INSTRUCCIONES DE MISIÓN // ${fwNames[fwIdx] || 'FIREWALL'}:`,
          `1. Escribe 'hack' para descifrar los 3 sub-nodos lógicos requeridos.`,
          `2. Explora los archivos del directorio con 'ls' y lee documentos con 'cat <archivo>'.`,
          `3. Encuentra los logs ocultos de la Dra. Vera Sorenson para desbloquear bonificaciones.`,
          `4. Al resolver los 3 sub-nodos, el firewall caerá automáticamente y pasarás al siguiente nivel.`
        ]
      };
    }
  },

  mission: {
    name: 'mission',
    description: 'Alias de objetivo',
    usage: 'mission',
    execute(ctx) {
      return COMMANDS.objetivo.execute(ctx);
    }
  },

  logros: {
    name: 'logros',
    description: 'Abre la pantalla de logros del sistema (20 logros)',
    usage: 'logros',
    execute() {
      if (typeof window !== 'undefined' && window.navigateTo) {
        window.navigateTo('screen-logros');
        return { lines: ['Accediendo al expediente neural de logros...'] };
      }
      const total = logrosManager.getTodos().length;
      const des = logrosManager.getDesbloqueadosCount();
      return {
        lines: [
          `🏆 LOGROS DESBLOQUEADOS: ${des} / ${total}`,
          `Escribe 'menu' o haz clic en la interfaz para ver el archivo completo.`
        ]
      };
    }
  },

  achievements: {
    name: 'achievements',
    description: 'Alias de logros',
    usage: 'achievements',
    execute(ctx) {
      return COMMANDS.logros.execute(ctx);
    }
  },

  stats: {
    name: 'stats',
    description: 'Muestra las estadísticas de rendimiento y estilo de juego',
    usage: 'stats',
    execute() {
      if (typeof window !== 'undefined' && window.navigateTo) {
        statsManager.finalizarSesion(getState());
        window.navigateTo('screen-stats');
        return { lines: ['Accediendo al análisis heurístico de rendimiento...'] };
      }
      const st = statsManager.getSesionActual();
      return {
        lines: [
          `📊 TIEMPO: ${st.tiempoTotal}s | PRECISIÓN: ${st.precision}% | RACHA: ${st.rachaMaxima}`,
          `ESTILO: ${(st.estilo ? st.estilo.nombre : 'Analítico')}`
        ]
      };
    }
  },

  estadisticas: {
    name: 'estadisticas',
    description: 'Alias de stats',
    usage: 'estadisticas',
    execute(ctx) {
      return COMMANDS.stats.execute(ctx);
    }
  },

  sudo: {
    name: 'sudo',
    description: 'Ejecuta una instrucción con privilegios elevados (Prompt 18)',
    usage: 'sudo [su|comando]',
    execute({ args }) {
      return secretosManager.ejecutarSudo(args);
    }
  },

  42: {
    name: '42',
    description: 'La respuesta a la Vida, el Universo y Todo lo Demás (Prompt 18)',
    usage: '42',
    execute() {
      return secretosManager.ejecutar42();
    }
  },

  verdad: {
    name: 'verdad',
    description: 'Revelación confidencial de la Dra. Vera Sorenson',
    usage: 'verdad',
    execute() {
      return secretosManager.ejecutarVerdad();
    }
  },

  'ghost-protocol': {
    name: 'ghost-protocol',
    description: 'Accede al protocolo de infiltración clasificado Ghost Protocol (Prompt 19)',
    usage: 'ghost-protocol',
    execute() {
      const unlocked = isGhostProtocolUnlocked();
      if (!unlocked) {
        return {
          lines: [
            '[ACCESO DENEGADO]: Protocolo Ghost Protocol bloqueado.',
            'NEXUS: "Debes descifrar los 5 firewalls y completar el juicio final antes de acceder a esta simulación pura."'
          ]
        };
      }
      return {
        lines: [
          '◈ [GHOST PROTOCOL DISPONIBLE]:',
          '  - Temporizadores neuronales: OCULTOS',
          '  - Protocolos de asistencia: DESACTIVADOS (0 pistas / 0 skips)',
          '  - Integridad operativa inicial: 50% (Crítica)',
          '  - Dificultad de los subnodos: MÁXIMA',
          'Para iniciar este modo, regresa al menú principal (escribe "menu") y selecciona 👻 MODO GHOST PROTOCOL.'
        ]
      };
    }
  },

  ghostprotocol: {
    name: 'ghostprotocol',
    description: 'Alias de ghost-protocol',
    usage: 'ghostprotocol',
    execute(ctx) {
      return COMMANDS['ghost-protocol'].execute(ctx);
    }
  },

  logs: {
    name: 'logs',
    description: 'Gestor y reproductor de audio de los registros desclasificados (Prompt D3)',
    usage: 'logs [listar | cat <id> | escuchar <id> | detener]',
    execute({ args }) {
      const action = (args[0] || 'listar').toLowerCase();

      if (action === 'detener' || action === 'stop') {
        speechEngine.stop();
        return {
          lines: ['[⏹] Reproducción de audio detenida.']
        };
      }

      if (action === 'escuchar' || action === 'play' || action === 'listen') {
        const targetId = args[1];
        if (!targetId) {
          return {
            lines: [
              'Uso: logs escuchar <nombre_archivo>',
              'Ejemplo: logs escuchar vera.txt'
            ]
          };
        }
        const log = (typeof getHiddenLog === 'function' ? getHiddenLog(targetId) : null) || (LOGS_DATABASE && LOGS_DATABASE[targetId]);
        if (!log) {
          return {
            lines: [`[✖] Registro clasificado no encontrado: '${targetId}'`]
          };
        }
        const isVera = log.autor && log.autor.toLowerCase().includes('vera');
        if (isVera) {
          speechEngine.speakVera(log.contenido, { force: true });
        } else {
          speechEngine.speakNexus(log.contenido, { force: true });
        }
        return {
          lines: [
            `[🔊] Reproduciendo registro de audio: ${log.titulo}`,
            `> Autor: ${log.autor} // Transmisión iniciada...`
          ]
        };
      }

      if (action === 'cat' || action === 'leer' || action === 'visor') {
        const targetId = args[1];
        if (!targetId) {
          return { lines: ['Uso: logs cat <nombre_archivo>'] };
        }
        const log = (typeof getHiddenLog === 'function' ? getHiddenLog(targetId) : null) || (LOGS_DATABASE && LOGS_DATABASE[targetId]);
        if (!log) {
          return { lines: [`[✖] Registro clasificado no encontrado: '${targetId}'`] };
        }
        if (typeof window !== 'undefined' && typeof window.abrirVisorLog === 'function') {
          window.abrirVisorLog(log.id, log.contenido);
          return {
            lines: [`[✔] Abriendo visor de inteligencia para '${log.id}'...`]
          };
        }
        return {
          lines: String(log.contenido).split('\n')
        };
      }

      // Default: listar
      const state = getState ? getState() : { logsFound: [] };
      const foundSet = new Set(state.logsFound || []);
      const allLogs = Object.values(LOGS_DATABASE || {});

      const lines = [
        '╔════════════════════════════════════════════════════════════════╗',
        '║ ◈ ARCHIVO DE INTELIGENCIA Y REGISTROS DE VOZ // NEXUS ARCHIVE  ║',
        '╚════════════════════════════════════════════════════════════════╝',
        `Progreso de Recolección: ${foundSet.size} / ${allLogs.length} documentos descubiertos`,
        ''
      ];

      allLogs.forEach((log) => {
        const isFound = foundSet.has(log.id);
        const icon = isFound ? '✔' : '🔒';
        const speaker = log.autor && log.autor.includes('Vera') ? '🎙️ [VERA]' : '🤖 [NEXUS]';
        const status = isFound ? 'DISPONIBLE' : 'BLOQUEADO';
        lines.push(`${icon} ${log.id.padEnd(30)} ${speaker} [${status}]`);
        if (isFound) {
          lines.push(`   └─ ${log.titulo} (${log.fecha})`);
        }
      });

      lines.push('');
      lines.push('Comandos:');
      lines.push('  logs escuchar <archivo>  -> Reproduce la voz del personaje (Web Speech)');
      lines.push('  logs cat <archivo>       -> Abre el visor interactivo con audio');
      lines.push('  logs detener             -> Detiene la reproducción');

      return { lines };
    }
  },

  log: {
    name: 'log',
    description: 'Alias de logs',
    usage: 'log [listar | cat <id> | escuchar <id> | detener]',
    execute(ctx) {
      return COMMANDS['logs'].execute(ctx);
    }
  },

  artbook: {
    name: 'artbook',
    description: 'Abre o consulta el estado de desclasificación del Artbook Conceptual Oficial (Prompt D4)',
    usage: 'artbook',
    execute() {
      const isUnlocked = (() => {
        try {
          return localStorage.getItem('nexus_artbook_unlocked') === 'true' || localStorage.getItem('nexus_game_completed') === 'true';
        } catch (_) { return false; }
      })();

      if (isUnlocked) {
        if (typeof window !== 'undefined') {
          window.open('ARTBOOK.html', '_blank');
        }
        return {
          lines: [
            '╔════════════════════════════════════════════════════════════════╗',
            '║ 🎨 ARTBOOK CONCEPTUAL // EXPEDIENTE DESCLASIFICADO             ║',
            '╚════════════════════════════════════════════════════════════════╝',
            '[✔] ACCESO AUTORIZADO // Campaña completada exitosamente.',
            '> Abriendo ARTBOOK.html en una nueva pestaña...',
            'Contenido disponible:',
            '  - Bocetos vectoriales de Vera Sorenson, NEXUS Core y Ghost',
            '  - Mapa arquitectónico vertical de la Torre Aurelia',
            '  - Diagramas y topología de los 5 Firewalls',
            '  - Cronología completa no censurada (2038 - 2048)',
            '  - Notas del diseñador y memorandos secretos de Gerhard Kroll',
            '  - Reproductor con las 5 pistas musicales de la banda sonora'
          ]
        };
      } else {
        return {
          lines: [
            '╔════════════════════════════════════════════════════════════════╗',
            '║ 🔒 ARTBOOK CONCEPTUAL // CLASIFICADO NIVEL OMEGA               ║',
            '╚════════════════════════════════════════════════════════════════╝',
            '[✖] ACCESO RESTRINGIDO // Protocolo de desclasificación no superado.',
            'Para desbloquear el Artbook Oficial:',
            '  1. Cruza los 5 Firewalls del sistema de seguridad Aurelia.',
            '  2. Toma una decisión en el Núcleo de Singularidad.',
            'También puedes abrir ARTBOOK.html directamente e ingresar la clave de desclasificación de emergencia (VERA_SORENSON_2044) o usar el bypass de evaluador.'
          ]
        };
      }
    }
  },

  arg: {
    name: 'arg',
    description: 'Enlaza con el servidor satélite clandestino del ARG (Prompt D5)',
    usage: 'arg',
    execute() {
      const isUnlocked = (() => {
        try {
          return localStorage.getItem('nexus_arg_unlocked') === 'true';
        } catch (_) { return false; }
      })();
      const isClaimed = (() => {
        try {
          return localStorage.getItem('nexus_arg_claimed') === 'true';
        } catch (_) { return false; }
      })();

      if (typeof window !== 'undefined') {
        window.open('arg/index.html', '_blank');
      }

      return {
        lines: [
          '╔════════════════════════════════════════════════════════════════╗',
          '║ 🌐 ENLACE AL SERVIDOR SATÉLITE // PROYECTO CORTEX (ARG)       ║',
          '╚════════════════════════════════════════════════════════════════╝',
          '[+] Estableciendo conexión con subred externa: ./arg/index.html',
          '> Abriendo portal ARG en nueva pestaña...',
          '',
          `Estado de desclasificación: ${isUnlocked ? 'DESCLASIFICADO (NIVEL OMEGA)' : 'BLOQUEADO // Requiere Token'}`,
          `Estado de canje de recompensa: ${isClaimed ? 'CANJEADO (+500 PTS Otorgados)' : 'PENDIENTE DE CANJE'}`,
          '',
          'INSTRUCCIONES DE ACCESO:',
          '  1. Revisa el archivo secreto en /home/vera/secreto.txt (Firewall 3).',
          '  2. Ingresa el token en el portal web de /arg/ para acceder al expediente CORTEX.',
          '  3. Escanea o copia el código QR generado por JavaScript.',
          '  4. Para canjear tu recompensa in-game, escribe en esta terminal:',
          '     claim-arg <CODIGO_RESCATE>'
        ]
      };
    }
  },

  'claim-arg': {
    name: 'claim-arg',
    description: 'Canjea un código de rescate criptográfico obtenido en el portal ARG (Prompt D5)',
    usage: 'claim-arg <CODIGO_RESCATE>',
    execute(ctx) {
      const code = ((ctx && ctx.args && ctx.args[0]) || '').trim().toUpperCase();
      if (!code) {
        return {
          lines: [
            '[✖] Error: Falta el código de rescate.',
            'Uso: claim-arg <CODIGO_RESCATE>',
            'Ejemplo: claim-arg NEXUS_ARG_CORTEX_REDEEM_77',
            'Pista: Obtén el código QR o token en ./arg/index.html'
          ]
        };
      }

      const isClaimed = (() => {
        try {
          return localStorage.getItem('nexus_arg_claimed') === 'true';
        } catch (_) { return false; }
      })();

      if (isClaimed) {
        return {
          lines: [
            '[!] AVISO: El código de rescate CORTEX ya ha sido canjeado anteriormente en este terminal.',
            'El logro [Realidad Aumentada (ARG)] ya está desbloqueado en tu registro.'
          ]
        };
      }

      const validCodes = ['NEXUS_ARG_CORTEX_REDEEM_77', 'CORTEX_REDEEM_77', 'VERA_DESPIERTA_2044'];
      if (validCodes.includes(code)) {
        try {
          localStorage.setItem('nexus_arg_claimed', 'true');
          localStorage.setItem('nexus_arg_unlocked', 'true');
        } catch (_) {}

        addScore(500);
        logrosManager.desbloquear('arg_master');
        if (audio && audio.playSuccess) audio.playSuccess();

        return {
          lines: [
            '╔════════════════════════════════════════════════════════════════╗',
            '║ 🗝️ AUTENTICACIÓN ARG VALIDADA // TRANSMISIÓN CORTEX VINCULADA ║',
            '╚════════════════════════════════════════════════════════════════╝',
            '[✔] CÓDIGO DE RESCATE VÁLIDO: ' + code,
            '[★] +500 PUNTOS AÑADIDOS A TU PERFIL DE INFILTRACIÓN',
            '[🏆] LOGRO DESBLOQUEADO: Realidad Aumentada (ARG)',
            '',
            '> Mensaje interceptado de Dra. Vera Sorenson:',
            '"Has conectado el mundo exterior con el núcleo de silicio.',
            ' Gerhard Kroll ya no puede ocultar la verdad. La red te pertenece."'
          ]
        };
      } else {
        if (audio && audio.playError) audio.playError();
        return {
          lines: [
            '[✖] CÓDIGO INVÁLIDO O CORRUPTO: ' + code,
            'Asegúrate de copiar exactamente el código de canje generado por el QR en ./arg/index.html'
          ]
        };
      }
    }
  },

  'recompensa-arg': {
    name: 'recompensa-arg',
    description: 'Alias de claim-arg',
    usage: 'recompensa-arg <CODIGO_RESCATE>',
    execute(ctx) {
      return COMMANDS['claim-arg'].execute(ctx);
    }
  }
};
