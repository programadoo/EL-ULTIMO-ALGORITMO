/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Commands — Implementación de comandos para el emulador de terminal
 * Especificación: Sección 2.3 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { registerLogFound, getState, registerPuzzleSolvedInFirewall, isGhostProtocolUnlocked } from './state.js';
import { abrirCualquierPuzzle } from './puzzles/generador.js';
import { audio } from './audio.js';
import { logrosManager } from './meta/logros.js';
import { statsManager } from './meta/stats.js';
import { secretosManager } from './meta/secretos.js';

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

        // Si es un log oculto narrativo, otorgar puntos y feedback temático
        if (node.hiddenLog) {
          const fileName = node.name || arg.split('/').pop();
          const pts = registerLogFound(fileName);
          if (pts > 0) {
            lines.push(`%c[NEXUS CLASSIFIED LOG] ◈ Fragmento descubierto: '${fileName}' (+${pts} PTS)`, 'line--success');
          }
        }

        // Imprimir contenido del archivo
        const contentLines = String(node.content || '').split('\n');
        lines.push(...contentLines);
      }

      return { lines };
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
      const fwDefaultType = { 1: 'A', 2: 'A', 3: 'B', 4: 'D', 5: 'E' }[fw] || 'A';

      let tipo = fwDefaultType;
      let nivel = fw;

      if (args.length > 0) {
        const first = args[0].toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(first)) {
          tipo = first;
          if (args[1]) nivel = parseInt(args[1], 10) || 1;
        } else if (!isNaN(parseInt(args[0], 10))) {
          nivel = parseInt(args[0], 10);
          if (args[1] && ['A', 'B', 'C', 'D', 'E'].includes(args[1].toUpperCase())) {
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
    description: 'Controla la música cyberpunk de fondo (on, off, toggle)',
    usage: 'music [on|off|toggle]',
    execute({ args }) {
      const action = (args[0] || 'toggle').toLowerCase();
      if (action === 'on') {
        audio.startMusic();
        return { lines: ['[🎵] Música Cyberpunk Synthwave: ACTIVADA (124 BPM Loop)'] };
      } else if (action === 'off') {
        audio.stopMusic();
        return { lines: ['[🎵] Música Cyberpunk Synthwave: PAUSADA'] };
      } else {
        const isPlaying = audio.toggleMusic();
        return { lines: [`[🎵] Música Cyberpunk Synthwave: ${isPlaying ? 'ACTIVADA (124 BPM Loop)' : 'PAUSADA'}`] };
      }
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
  }
};
