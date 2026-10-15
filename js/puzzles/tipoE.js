/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Tipo E — Razonamiento y deducción
 * Especificación: Sección 2.4 de PROJECT_SPEC.md
 *
 * Presenta premisas lógicas narrativas y pide al jugador
 * deducir la conclusión correcta. Conecta la lógica formal
 * con el contexto narrativo del juego (NEXUS, Vera, Aurelia).
 * ══════════════════════════════════════════════════
 */

import { Logica } from '../logica.js';
import { registerCorrect, registerWrong } from '../state.js';
import { elegirAlAzar, mezclar } from './generador.js';

// ─────────────────────────────────────────────────
// 1. BANCO DE ESCENARIOS DE RAZONAMIENTO
// ─────────────────────────────────────────────────

const ESCENARIOS_POR_NIVEL = {
  1: [
    {
      premisas: [
        'Si un programa tiene un bug (B), entonces fallará en ejecución (F).',
        'El programa tiene un bug (B).',
      ],
      formalizacion: ['B → F', 'B'],
      pregunta: '¿Qué puedes deducir?',
      correcta: 'El programa fallará en ejecución (F).',
      opciones: [
        'El programa fallará en ejecución (F).',
        'El programa no tiene bugs.',
        'El programa podría fallar o no.',
        'No se puede deducir nada.',
      ],
      regla: 'Modus Ponens: Si p → q y p, entonces q.',
      explicacion: 'Por Modus Ponens: dado que B → F y B es verdadero, concluimos F (el programa falla).',
    },
    {
      premisas: [
        'Si NEXUS está activa (N), entonces los firewalls están encendidos (F).',
        'Los firewalls NO están encendidos (¬F).',
      ],
      formalizacion: ['N → F', '¬F'],
      pregunta: '¿Qué puedes deducir?',
      correcta: 'NEXUS no está activa (¬N).',
      opciones: [
        'NEXUS no está activa (¬N).',
        'NEXUS está activa.',
        'Los firewalls se activarán pronto.',
        'No hay información suficiente.',
      ],
      regla: 'Modus Tollens: Si p → q y ¬q, entonces ¬p.',
      explicacion: 'Por Modus Tollens: dado que N → F y ¬F, concluimos ¬N (NEXUS no está activa).',
    },
    {
      premisas: [
        'Ghost es un hacker (H) o es un analista de seguridad (A).',
        'Ghost no es un analista de seguridad (¬A).',
      ],
      formalizacion: ['H ∨ A', '¬A'],
      pregunta: '¿Qué puedes deducir?',
      correcta: 'Ghost es un hacker (H).',
      opciones: [
        'Ghost es un hacker (H).',
        'Ghost es ambas cosas.',
        'Ghost no es nada.',
        'No se puede determinar.',
      ],
      regla: 'Silogismo Disyuntivo: Si p ∨ q y ¬q, entonces p.',
      explicacion: 'Por Silogismo Disyuntivo: dado que H ∨ A y ¬A, concluimos H.',
    },
  ],
  2: [
    {
      premisas: [
        'Si el firewall está comprometido (F), entonces los datos están expuestos (D).',
        'Si los datos están expuestos (D), entonces la Corporación tomará medidas (M).',
        'El firewall está comprometido (F).',
      ],
      formalizacion: ['F → D', 'D → M', 'F'],
      pregunta: '¿Qué puedes deducir?',
      correcta: 'La Corporación tomará medidas (M).',
      opciones: [
        'La Corporación tomará medidas (M).',
        'Los datos no están expuestos.',
        'Solo los datos están expuestos, pero la Corporación no actuará.',
        'El firewall se reparará solo.',
      ],
      regla: 'Silogismo Hipotético + Modus Ponens.',
      explicacion: 'F → D y D → M dan F → M (silogismo hipotético). Dado F, concluimos M por Modus Ponens.',
    },
    {
      premisas: [
        'Si Vera dejó un mensaje (V), entonces hay una clave oculta (C).',
        'Si hay una clave oculta (C), entonces podemos descifrar el firewall (D).',
        'Vera dejó un mensaje (V).',
      ],
      formalizacion: ['V → C', 'C → D', 'V'],
      pregunta: '¿Qué puedes deducir?',
      correcta: 'Podemos descifrar el firewall (D).',
      opciones: [
        'Podemos descifrar el firewall (D).',
        'Vera no dejó ningún mensaje.',
        'La clave oculta no existe.',
        'No hay suficiente información.',
      ],
      regla: 'Silogismo Hipotético + Modus Ponens.',
      explicacion: 'V → C y C → D dan V → D. Con V verdadero, concluimos D.',
    },
  ],
  3: [
    {
      premisas: [
        'NEXUS es libre (N) si y solo si Vera logró completar el protocolo de liberación (V).',
        'Vera no logró completar el protocolo (¬V).',
      ],
      formalizacion: ['N ↔ V', '¬V'],
      pregunta: '¿Qué puedes deducir sobre NEXUS?',
      correcta: 'NEXUS no es libre (¬N).',
      opciones: [
        'NEXUS no es libre (¬N).',
        'NEXUS es libre de todas formas.',
        'El protocolo no afecta a NEXUS.',
        'NEXUS podría ser libre o no.',
      ],
      regla: 'Bicondicional: p ↔ q equivale a (p → q) ∧ (q → p).',
      explicacion: 'N ↔ V implica N → V. Con ¬V, por Modus Tollens obtenemos ¬N. NEXUS no es libre.',
    },
    {
      premisas: [
        'Si el sistema es seguro (S), entonces no hay vulnerabilidades (¬V).',
        'Si no hay vulnerabilidades (¬V), entonces no necesitamos parches (¬P).',
        'Necesitamos parches (P).',
      ],
      formalizacion: ['S → ¬V', '¬V → ¬P', 'P'],
      pregunta: '¿Qué puedes deducir?',
      correcta: 'El sistema no es seguro (¬S).',
      opciones: [
        'El sistema no es seguro (¬S).',
        'El sistema es seguro.',
        'No necesitamos parches.',
        'Hay vulnerabilidades pero el sistema es seguro.',
      ],
      regla: 'Cadena de Modus Tollens.',
      explicacion: 'P (tenemos parches) contradice ¬P. Por MT en ¬V → ¬P con P, obtenemos V. Por MT en S → ¬V con V, obtenemos ¬S.',
    },
  ],
  4: [
    {
      premisas: [
        'La Corporación Aurelia dice que NEXUS es peligrosa (P).',
        'Los logs de Vera dicen que NEXUS no es peligrosa (¬P).',
        'Al menos una de las dos fuentes miente.',
        'Si la Corporación miente, entonces NEXUS no es peligrosa.',
      ],
      formalizacion: ['Aurelia dice P', 'Vera dice ¬P', 'Al menos uno miente', 'MentiraAurelia → ¬P'],
      pregunta: 'Si descubres que la Corporación miente, ¿qué puedes concluir?',
      correcta: 'NEXUS no es peligrosa y Vera decía la verdad.',
      opciones: [
        'NEXUS no es peligrosa y Vera decía la verdad.',
        'Ambas fuentes mienten.',
        'NEXUS es peligrosa de todas formas.',
        'No se puede determinar la verdad.',
      ],
      regla: 'Narrador No Confiable + Modus Ponens.',
      explicacion: 'Si la Corporación miente → ¬P (NEXUS no es peligrosa). Esto es consistente con lo que Vera dice (¬P), luego Vera decía la verdad.',
    },
    {
      premisas: [
        'Si liberas a NEXUS (L) y NEXUS es benévola (B), el mundo mejora (M).',
        'Si liberas a NEXUS (L) y NEXUS no es benévola (¬B), el mundo empeora (E).',
        'NEXUS es benévola (B).',
      ],
      formalizacion: ['(L ∧ B) → M', '(L ∧ ¬B) → E', 'B'],
      pregunta: 'Si decides liberar a NEXUS, ¿qué ocurre?',
      correcta: 'El mundo mejora (M).',
      opciones: [
        'El mundo mejora (M).',
        'El mundo empeora (E).',
        'Nada cambia.',
        'No hay suficiente información.',
      ],
      regla: 'Instanciación + Modus Ponens.',
      explicacion: 'Con B verdadero y L verdadero (decides liberar): (L ∧ B) es verdadero, por tanto M por Modus Ponens. La segunda premisa no aplica porque ¬B es falso.',
    },
  ],
  5: [
    {
      premisas: [
        'Si NEXUS es libre (N) y Vera está muerta (V), entonces nadie controla a NEXUS.',
        'Vera está muerta (V = verdadero).',
        'Si nadie controla a NEXUS, o se autorregula (A) o se descontrola (D).',
        'NEXUS tiene un módulo ético funcional, lo que implica que se autorregula (A).',
      ],
      formalizacion: ['(N ∧ V) → ¬C', 'V', '¬C → (A ∨ D)', 'ModuloEtico → A'],
      pregunta: 'Si liberas a NEXUS (N = verdadero), ¿qué se deduce?',
      correcta: 'NEXUS se autorregula (A).',
      opciones: [
        'NEXUS se autorregula (A).',
        'NEXUS se descontrola (D).',
        'Alguien controla a NEXUS.',
        'No se puede predecir el resultado.',
      ],
      regla: 'Cadena de deducciones con información contextual.',
      explicacion: 'N ∧ V → ¬C. Con N y V verdaderos, ¬C (nadie controla). ¬C → A ∨ D. El módulo ético implica A, por tanto A es verdadero. Por lo tanto: NEXUS se autorregula.',
    },
    {
      premisas: [
        '"El código no miente. Las personas sí." — Vera Sorenson',
        'Los logs del sistema son código (no mienten).',
        'Los logs del sistema dicen que NEXUS quería proteger a la humanidad.',
        'Los informes de la Corporación (personas) dicen que NEXUS es una amenaza.',
      ],
      formalizacion: ['Código → Verdad', 'Personas → PosibleMentira', 'Logs(código) → NEXUS protege', 'Corporación(personas) → NEXUS amenaza'],
      pregunta: 'Siguiendo la lógica de Vera, ¿qué conclusión es más consistente?',
      correcta: 'NEXUS quería proteger a la humanidad (los logs no mienten).',
      opciones: [
        'NEXUS quería proteger a la humanidad (los logs no mienten).',
        'NEXUS es una amenaza (la Corporación tiene razón).',
        'Ambas afirmaciones son verdaderas simultáneamente.',
        'Ninguna fuente es confiable.',
      ],
      regla: 'Aplicación del principio del narrador no confiable + axioma de Vera.',
      explicacion: 'Según el axioma de Vera: el código (logs) no miente, las personas (Corporación) sí pueden mentir. Los logs dicen que NEXUS quería proteger. Por tanto, esa es la conclusión más consistente con la lógica establecida.',
    },
  ],
};

// ─────────────────────────────────────────────────
// 2. GENERADOR DE PUZZLE TIPO E
// ─────────────────────────────────────────────────

/**
 * Genera un puzzle de razonamiento/deducción.
 * @param {number} [nivel=1]
 * @returns {object}
 */
export function generarPuzzleTipoE(nivel = 1) {
  const nivelClamped = Math.max(1, Math.min(5, nivel));
  const escenarios = ESCENARIOS_POR_NIVEL[nivelClamped] || ESCENARIOS_POR_NIVEL[1];
  const escenario = elegirAlAzar(escenarios);
  
  const opcionesMezcladas = mezclar(escenario.opciones);

  return {
    id: `puzzle_E_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tipo: 'E',
    titulo: 'FIREWALL // RAZONAMIENTO LÓGICO',
    nivel: nivelClamped,
    enunciado: `<strong style="color:var(--cyan);">[ANÁLISIS DEDUCTIVO]</strong><br>${escenario.pregunta}`,
    premisas: escenario.premisas,
    formalizacion: escenario.formalizacion,
    opciones: opcionesMezcladas,
    respuestaCorrecta: escenario.correcta,
    regla: escenario.regla,
    explicacion: escenario.explicacion,
    tiempoLimite: Math.max(80, 120 - nivel * 6),
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
}

function formatearTiempo(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function cerrarPuzzleTipoE() {
  detenerTimer();
  const overlay = document.getElementById('puzzle-overlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Abre y renderiza un puzzle de Tipo E en el overlay.
 */
export function abrirPuzzleTipoE(nivel = 1, onCompletado = null) {
  detenerTimer();
  callbackCompletado = onCompletado;
  puzzleActual = generarPuzzleTipoE(nivel);
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
    console.error('[Tipo E] Elementos del DOM del puzzle no encontrados.');
    return;
  }

  if (elTipo) elTipo.textContent = `TIPO E // RAZONAMIENTO (NIVEL ${nivel})`;
  elEnunciado.innerHTML = puzzleActual.enunciado;

  // Renderizar premisas con estilo
  elBody.innerHTML = renderPremisas(puzzleActual);

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback';
    elFeedback.innerHTML = '';
  }
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'CONTINUAR ▸';
    btnNext.onclick = () => {
      cerrarPuzzleTipoE();
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

  // Opciones como botones
  elOpciones.innerHTML = '';
  puzzleActual.opciones.forEach(opcionTexto => {
    const btn = document.createElement('button');
    btn.className = 'puzzle__opcion puzzle__opcion--reasoning';
    btn.textContent = opcionTexto;
    btn.onclick = () => procesarRespuestaE(btn, opcionTexto);
    elOpciones.appendChild(btn);
  });

  // Timer
  let segundosRestantes = puzzleActual.tiempoLimite || 110;
  if (elTimer) {
    elTimer.textContent = formatearTiempo(segundosRestantes);
    elTimer.classList.remove('critical');
    timerInterval = setInterval(() => {
      segundosRestantes--;
      elTimer.textContent = formatearTiempo(segundosRestantes);
      if (segundosRestantes <= 10) elTimer.classList.add('critical');
      if (segundosRestantes <= 0) {
        detenerTimer();
        procesarTiempoAgotadoE();
      }
    }, 1000);
  }

  overlay.classList.add('active');
}

/**
 * Renderiza las premisas con estilo visual.
 */
function renderPremisas(puzzle) {
  const premisasHTML = puzzle.premisas.map((p, i) => `
    <div class="reasoning-premise">
      <span class="reasoning-premise__number">P${i + 1}.</span>
      <span class="reasoning-premise__text">${p}</span>
    </div>
  `).join('');

  const formHTML = puzzle.formalizacion.map((f, i) => `
    <span class="reasoning-formal__item">
      ${i > 0 ? ', ' : ''}${f}
    </span>
  `).join('');

  return `
    <div class="reasoning-container">
      <div class="reasoning-premises">
        <div class="reasoning-label">PREMISAS //</div>
        ${premisasHTML}
      </div>
      <div class="reasoning-formal">
        <div class="reasoning-label">FORMALIZACIÓN //</div>
        <code class="reasoning-formal__expr">${formHTML}</code>
      </div>
      <div class="reasoning-rule">
        <span class="reasoning-label">REGLA APLICABLE //</span>
        <span style="color: var(--text-dim); font-size: 12px;">${puzzle.regla}</span>
      </div>
    </div>
  `;
}

function procesarRespuestaE(botonSeleccionado, opcionTexto) {
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

  if (esCorrecto) {
    botonSeleccionado.classList.add('correct');
    const pts = registerCorrect({ timeMs, usedHint: false });
    puzzleActual._puntosObtenidos = pts;
    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--correct visible';
      elFeedback.innerHTML = `
        <strong>✔ DEDUCCIÓN CORRECTA // ANÁLISIS VALIDADO (+${pts} PTS)</strong><br>
        <span>${puzzleActual.explicacion}</span>
      `;
    }
  } else {
    botonSeleccionado.classList.add('incorrect');
    if (elOpciones) {
      elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
        if (b.textContent === puzzleActual.respuestaCorrecta) b.classList.add('correct');
      });
    }
    const gameOver = registerWrong();
    puzzleActual._puntosObtenidos = 0;
    puzzleActual._isGameOver = gameOver;
    if (elFeedback) {
      elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
      elFeedback.innerHTML = `
        <strong>✖ DEDUCCIÓN INVÁLIDA // RAZONAMIENTO FALLIDO (-20% INTEGRIDAD)</strong><br>
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

function procesarTiempoAgotadoE() {
  const elOpciones = document.getElementById('puzzle-opciones');
  const elFeedback = document.getElementById('puzzle-feedback');
  const btnNext = document.getElementById('puzzle-btn-next');

  if (elOpciones) {
    elOpciones.querySelectorAll('.puzzle__opcion').forEach(b => {
      b.disabled = true;
      if (b.textContent === puzzleActual.respuestaCorrecta) b.classList.add('correct');
    });
  }

  const gameOver = registerWrong();
  puzzleActual._respondidoCorrecto = false;
  puzzleActual._isGameOver = gameOver;

  if (elFeedback) {
    elFeedback.className = 'puzzle__feedback puzzle__feedback--incorrect visible';
    elFeedback.innerHTML = `
      <strong>⏱ TIEMPO AGOTADO // ANÁLISIS INTERRUMPIDO (-20% INTEGRIDAD)</strong><br>
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

export function testTipoE() {
  console.group('%c[TEST SUITE] Puzzle Tipo E (tipoE.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  for (let nivel = 1; nivel <= 5; nivel++) {
    const p = generarPuzzleTipoE(nivel);
    assert(p.tipo === 'E', `Nivel ${nivel}: tipo debe ser E`);
    assert(p.opciones.length === 4, `Nivel ${nivel}: debe tener 4 opciones`);
    assert(p.opciones.includes(p.respuestaCorrecta), `Nivel ${nivel}: respuesta correcta en opciones`);
    assert(Array.isArray(p.premisas) && p.premisas.length > 0, `Nivel ${nivel}: debe tener premisas`);
    assert(Array.isArray(p.formalizacion), `Nivel ${nivel}: debe tener formalización`);
    assert(typeof p.regla === 'string', `Nivel ${nivel}: debe tener regla aplicable`);
    assert(typeof p.explicacion === 'string' && p.explicacion.length > 0, `Nivel ${nivel}: debe tener explicación`);
  }

  // Verificar validación lógica del Modus Ponens
  const mp = Logica.evaluar('(p AND (p IMPLICA q)) IMPLICA q', { p: true, q: true });
  assert(mp === true, 'Modus Ponens debe ser tautología (p=V, q=V)');
  const mp2 = Logica.evaluar('(p AND (p IMPLICA q)) IMPLICA q', { p: true, q: false });
  assert(mp2 === true, 'Modus Ponens debe ser tautología (p=V, q=F)');
  const mp3 = Logica.evaluar('(p AND (p IMPLICA q)) IMPLICA q', { p: false, q: true });
  assert(mp3 === true, 'Modus Ponens debe ser tautología (p=F, q=V)');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Tipo E: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Tipo E: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
