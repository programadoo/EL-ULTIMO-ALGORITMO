/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo C — Comandos de Linux
 * Especificación: Sección 2.4 de PROJECT_SPEC.md
 *
 * Muestra un escenario narrativo y pregunta qué comando
 * de Linux utilizarías para resolver la situación.
 * ══════════════════════════════════════════════════
 */

import { registerCorrect, registerWrong } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';
import { feedbackSuccess, feedbackError } from '../ui/feedback.js';
import { audio } from '../audio.js';

// ─────────────────────────────────────────────────
// 1. BANCO DE ESCENARIOS POR NIVEL
// ─────────────────────────────────────────────────

const ESCENARIOS_POR_NIVEL = {
  1: [
    {
      narrativa: 'Acabas de conectarte al servidor del firewall. Necesitas ver qué archivos hay en el directorio actual para buscar pistas.',
      correcta: 'ls',
      opciones: ['ls', 'pwd', 'cd ..', 'echo "hello"'],
      explicacion: 'El comando `ls` lista los archivos y directorios del directorio actual. Es el primer paso para explorar un sistema de archivos desconocido.'
    },
    {
      narrativa: 'Encontraste un archivo llamado `vera.txt` que podría contener un mensaje oculto de la Dra. Sorenson. Necesitas leer su contenido.',
      correcta: 'cat vera.txt',
      opciones: ['cat vera.txt', 'ls vera.txt', 'rm vera.txt', 'mv vera.txt /tmp/'],
      explicacion: 'El comando `cat` concatena y muestra el contenido de un archivo. Es la forma más rápida de leer archivos de texto en la terminal.'
    },
    {
      narrativa: 'Detectas un directorio sospechoso llamado `.hidden/` en el listado. Necesitas entrar en él para investigar.',
      correcta: 'cd .hidden/',
      opciones: ['cd .hidden/', 'cat .hidden/', 'ls .hidden/', 'rm -rf .hidden/'],
      explicacion: 'El comando `cd` (change directory) cambia tu directorio de trabajo actual. Los directorios que empiezan con `.` son ocultos en Linux.'
    },
    {
      narrativa: 'Quieres saber quién eres en el sistema, qué usuario eres actualmente.',
      correcta: 'whoami',
      opciones: ['whoami', 'id', 'uname', 'hostname'],
      explicacion: 'El comando `whoami` muestra el nombre del usuario actual. En este caso: ghost@nexus.'
    },
    {
      narrativa: 'La pantalla está llena de texto y necesitas limpiarla para ver mejor.',
      correcta: 'clear',
      opciones: ['clear', 'reset', 'cls', 'exit'],
      explicacion: 'El comando `clear` limpia la pantalla del terminal. Es diferente de `exit` que cierra la sesión, y `cls` que solo funciona en Windows.'
    },
  ],
  2: [
    {
      narrativa: 'Sospechas que un archivo en el directorio contiene la palabra "password" oculta. Necesitas buscarlo rápidamente.',
      correcta: 'grep "password" *',
      opciones: ['grep "password" *', 'find . -name "password"', 'cat * | more', 'ls -la password'],
      explicacion: '`grep` busca patrones de texto dentro de archivos. El `*` indica que busque en todos los archivos del directorio actual.'
    },
    {
      narrativa: 'Necesitas encontrar todos los archivos `.log` en el sistema de archivos del firewall, incluyendo subdirectorios.',
      correcta: 'find . -name "*.log"',
      opciones: ['find . -name "*.log"', 'ls *.log', 'grep -r ".log" .', 'locate *.log'],
      explicacion: '`find . -name "*.log"` busca recursivamente todos los archivos cuyo nombre termine en `.log` a partir del directorio actual.'
    },
    {
      narrativa: 'Quieres revisar los últimos comandos que ejecutó el usuario anterior (Vera) en esta terminal.',
      correcta: 'history',
      opciones: ['history', 'cat ~/.bash_history', 'last', 'log --recent'],
      explicacion: '`history` muestra el historial de comandos ejecutados en la sesión. En el contexto del juego, revela los últimos comandos de Vera Sorenson.'
    },
    {
      narrativa: 'Necesitas ver los permisos detallados de todos los archivos, incluyendo los ocultos.',
      correcta: 'ls -la',
      opciones: ['ls -la', 'ls -R', 'dir', 'stat *'],
      explicacion: '`ls -la` lista todos los archivos (`-a` incluye ocultos) con formato largo (`-l`), mostrando permisos, propietario, tamaño y fecha.'
    },
  ],
  3: [
    {
      narrativa: 'Detectaste que hay un archivo llamado `encryption_key.txt` en algún lugar del sistema de archivos. Necesitas encontrarlo.',
      correcta: 'find / -name "encryption_key.txt"',
      opciones: ['find / -name "encryption_key.txt"', 'grep -r "encryption_key" /', 'locate encryption_key.txt', 'ls -R / | grep key'],
      explicacion: '`find / -name "encryption_key.txt"` busca desde la raíz (`/`) un archivo con ese nombre exacto. Es la forma más precisa y confiable.'
    },
    {
      narrativa: 'Dentro de un archivo largo llamado `aurelia_internal.log`, buscas todas las líneas que contengan la palabra "NEXUS" para entender las referencias internas.',
      correcta: 'grep "NEXUS" aurelia_internal.log',
      opciones: ['grep "NEXUS" aurelia_internal.log', 'cat aurelia_internal.log', 'find . -name "NEXUS"', 'head aurelia_internal.log'],
      explicacion: '`grep` filtra y muestra solo las líneas que contienen el patrón especificado. Es más eficiente que leer el archivo completo con `cat`.'
    },
    {
      narrativa: 'Necesitas escanear la red interna del firewall para encontrar otros nodos y posibles vulnerabilidades.',
      correcta: 'nmap 192.168.1.0/24',
      opciones: ['nmap 192.168.1.0/24', 'ping 192.168.1.1', 'netstat -an', 'traceroute nexus.local'],
      explicacion: '`nmap` escanea redes para descubrir hosts y servicios activos. El rango `/24` escanea las 256 direcciones de la subred.'
    },
  ],
  4: [
    {
      narrativa: 'Quieres conectarte al nodo de otro hacker (usuario "phantom") en el servidor `nexus.local` para iniciar una sesión co-op.',
      correcta: 'ssh phantom@nexus.local',
      opciones: ['ssh phantom@nexus.local', 'telnet nexus.local', 'ftp phantom@nexus.local', 'ping phantom@nexus.local'],
      explicacion: '`ssh` (Secure Shell) establece una conexión cifrada a un host remoto. Es el método seguro estándar para acceso remoto en Linux.'
    },
    {
      narrativa: 'Quieres elevar tus privilegios para acceder a un directorio protegido del sistema NEXUS.',
      correcta: 'sudo ls /root/nexus_core/',
      opciones: ['sudo ls /root/nexus_core/', 'su root', 'chmod 777 /root/nexus_core/', 'login root'],
      explicacion: '`sudo` permite ejecutar un comando con privilegios de superusuario sin cambiar de sesión completa. Es más seguro que usar `su`.'
    },
    {
      narrativa: 'Quieres ver los procesos activos en el sistema para identificar si NEXUS está ejecutando algún módulo sospechoso.',
      correcta: 'ps aux',
      opciones: ['ps aux', 'ls /proc/', 'top -n1', 'systemctl status'],
      explicacion: '`ps aux` muestra todos los procesos activos con información detallada: usuario, PID, uso de CPU/memoria y el comando ejecutado.'
    },
  ],
  5: [
    {
      narrativa: 'NEXUS ha cifrado un archivo crucial. Necesitas buscar recursivamente en todos los archivos del sistema cualquier referencia a "Vera" ignorando mayúsculas/minúsculas.',
      correcta: 'grep -ri "vera" /',
      opciones: ['grep -ri "vera" /', 'find / -name "*vera*"', 'cat /var/log/*.log | grep vera', 'locate vera'],
      explicacion: '`grep -ri` busca recursivamente (`-r`) ignorando mayúsculas (`-i`). Desde `/` rastrea todo el sistema de archivos en busca del patrón.'
    },
    {
      narrativa: 'Necesitas ver las conexiones de red activas para identificar si NEXUS está transmitiendo datos hacia afuera.',
      correcta: 'netstat -tuln',
      opciones: ['netstat -tuln', 'ifconfig', 'ip route', 'arp -a'],
      explicacion: '`netstat -tuln` muestra conexiones TCP/UDP activas (`-tu`), en modo escucha (`-l`), con puertos numéricos (`-n`). Ideal para detectar conexiones sospechosas.'
    },
    {
      narrativa: 'Necesitas saber cuál es el manual de un comando desconocido llamado "nexus-decrypt" que encontraste en el sistema.',
      correcta: 'man nexus-decrypt',
      opciones: ['man nexus-decrypt', 'nexus-decrypt --help', 'info nexus-decrypt', 'which nexus-decrypt'],
      explicacion: '`man` abre la página del manual de un comando. Es la forma estándar y más completa de obtener documentación sobre cualquier comando en Linux.'
    },
  ],
};

// ─────────────────────────────────────────────────
// 2. GENERADOR DE PUZZLE TIPO C
// ─────────────────────────────────────────────────

/**
 * Genera un puzzle de comandos Linux.
 * @param {number} [nivel=1]
 * @returns {object}
 */
export function generarPuzzleTipoC(nivel = 1) {
  const nivelClamped = Math.max(1, Math.min(5, nivel));
  const escenarios = ESCENARIOS_POR_NIVEL[nivelClamped] || ESCENARIOS_POR_NIVEL[1];
  const escenario = elegirAlAzar(escenarios);
  
  const opcionesMezcladas = mezclar(escenario.opciones);

  return {
    id: `puzzle_C_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tipo: 'C',
    titulo: 'FIREWALL // COMANDOS LINUX',
    nivel: nivelClamped,
    enunciado: `<em style="color:var(--cyan);">[ESCENARIO DE MISIÓN]</em><br>${escenario.narrativa}<br><br><strong>¿Qué comando utilizas?</strong>`,
    opciones: opcionesMezcladas,
    respuestaCorrecta: escenario.correcta,
    explicacion: escenario.explicacion,
    tiempoLimite: Math.max(60, 85 - nivel * 5),
  };
}

// ─────────────────────────────────────────────────
// 3. RENDERER DEL PUZZLE EN EL DOM
// ─────────────────────────────────────────────────

let timerInterval = null;
let puzzleActual = null;
let callbackCompletado = null;
let tiempoInicio = 0;

function detenerTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  audio.updateTension({ timer: null });
}

function formatearTiempo(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function cerrarPuzzleTipoC() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Abre y renderiza un puzzle de Tipo C en el overlay.
 */
export function abrirPuzzleTipoC(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  puzzleActual = generarPuzzleTipoC(nivel);
  tiempoInicio = Date.now();

  const overlay = document.getElementById('puzzle-overlay');
  const elTipo = document.getElementById('puzzle-tipo');
  const elTimer = document.getElementById('puzzle-timer');
  const elEnunciado = document.getElementById('puzzle-enunciado');
  const elBody = document.getElementById('puzzle-body');
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (!overlay || !elEnunciado || !elBody || !elOpciones) {
    console.error('[Tipo C] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) elTipo.textContent = `TIPO C // COMANDOS LINUX (NIVEL ${nivel})`;
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar terminal visual
  elBody.innerHTML = `
    <div class="command-scenario">
      <div class="command-scenario__terminal">
        <div class="command-scenario__header">
          <span class="terminal__dot terminal__dot--red"></span>
          <span class="terminal__dot terminal__dot--yellow"></span>
          <span class="terminal__dot terminal__dot--green"></span>
          <span style="color: var(--text-dim); font-size: 11px; margin-left: 8px;">ghost@nexus:~$</span>
        </div>
        <div class="command-scenario__body">
          <span style="color: var(--green-bright);">ghost@nexus</span><span style="color: var(--text-dim);">:</span><span style="color: var(--cyan);">~</span><span style="color: var(--text-dim);">$ </span>
          <span class="typing-cursor" style="color: var(--green-bright);">█</span>
        </div>
      </div>
    </div>
  `;

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzleTipoC();
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

  // Opciones como botones estilo comando
  elOpciones.innerHTML = '';
  puzzleActual.opciones.forEach(opcionTexto => {
    const btn = document.createElement('button');
    btn.className = 'puzzle__opcion puzzle__opcion--command';
    btn.innerHTML = `<code>$ ${opcionTexto}</code>`;
    btn.onclick = () => procesarRespuestaC(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Timer
  let segundosRestantes = puzzleActual.tiempoLimite || 80;
  if (elTimer) {
    elTimer.textContent = formatearTiempo(segundosRestantes);
    elTimer.classList.remove('critical');
    timerInterval = setInterval(() => {
      segundosRestantes--;
      elTimer.textContent = formatearTiempo(segundosRestantes);
      audio.updateTension({ timer: segundosRestantes });
      if (segundosRestantes <= 10) elTimer.classList.add('critical');
      if (segundosRestantes <= 0) {
        detenerTimer();
        procesarTiempoAgotadoC();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

function procesarRespuestaC(botonSeleccionado, opcionTexto) {
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

    feedbackSuccess(pts, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ COMANDO EJECUTADO // ACCESO CONCEDIDO (+${pts} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  } else {
    botonSeleccionado.classList.add('incorrect');
    if (elOpciones) {
      elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
        if (b.querySelector('code') && b.querySelector('code').textContent.includes(puzzleActual.respuestaCorrecta)) {
          b.classList.add('correct');
        }
      });
    }
    const gameOver = registerWrong();
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;

    feedbackError(20, puzzleActual.explicacion, coords);

    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>✖ COMANDO RECHAZADO // ACCESO DENEGADO (-20% INTEGRIDAD)</strong><br>
        <span>El comando correcto era: <code style="color:var(--green-bright)">${puzzleActual.respuestaCorrecta}</code></span><br>
        <span>${puzzleActual.explicacion}</span>
        ${gameOver ? '<br><strong style="color:var(--red-alert)">[ALERTA CRÍTICA] ¡Integridad en 0%! Sistema bloqueado.</strong>' : ''}
      `;
    }
  }

  if (btnNext) {
    btnNext.disabled = false;
    btnNext.textContent = puzzleActual._isGameOver ? 'EXPULSIÓN DEL SISTEMA ▸' : 'CONTINUAR ▸';
    btnNext.focus();
  }
}

function procesarTiempoAgotadoC() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
      if (b.querySelector('code') && b.querySelector('code').textContent.includes(puzzleActual.respuestaCorrecta)) {
        b.classList.add('correct');
      }
    });
  }

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._isGameOver = gameOver;

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱ TIEMPO AGOTADO // CONEXIÓN EXPIRADA (-20% INTEGRIDAD)</strong><br>
      <span>El comando correcto era: <code style="color:var(--green-bright)">${puzzleActual.respuestaCorrecta}</code></span><br>
      <span>${puzzleActual.explicacion}</span>
      ${gameOver ? '<br><strong style="color:var(--red-alert)">[ALERTA CRÍTICA] ¡Integridad en 0%! Sistema bloqueado.</strong>' : ''}
    `;
  }

  if (btnNext) {
    btnNext.disabled = false;
    btnNext.textContent = gameOver ? 'EXPULSIÓN DEL SISTEMA ▸' : 'CONTINUAR ▸';
    btnNext.focus();
  }
}

// ─────────────────────────────────────────────────
// 4. TESTS
// ─────────────────────────────────────────────────

export function testTipoC() {
  console.group('%c[TEST SUITE] Puzzle Tipo C (tipoC.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  for (let nivel = 1; nivel <= 5; nivel++) {
    const p = generarPuzzleTipoC(nivel);
    assert(p.tipo === 'C', `Nivel ${nivel}: tipo debe ser C`);
    assert(p.opciones.length === 4, `Nivel ${nivel}: debe tener 4 opciones`);
    assert(p.opciones.includes(p.respuestaCorrecta), `Nivel ${nivel}: respuesta correcta en opciones`);
    assert(typeof p.explicacion === 'string' && p.explicacion.length > 0, `Nivel ${nivel}: debe tener explicación`);
    assert(typeof p.enunciado === 'string' && p.enunciado.length > 0, `Nivel ${nivel}: debe tener enunciado`);
  }

  // Verificar que la mezcla no pierde opciones
  const p = generarPuzzleTipoC(1);
  assert(new Set(p.opciones).size === 4, 'Todas las opciones deben ser únicas');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Tipo C: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Tipo C: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
