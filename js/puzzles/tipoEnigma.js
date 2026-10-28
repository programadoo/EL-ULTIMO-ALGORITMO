/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Puzzle Tipo Enigma — Firewall 3 (Subestación Cognitiva)
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.1 y Prompt A5)
 * ══════════════════════════════════════════════════
 *
 * Niveles de dificultad:
 * - Fácil (Nivel 1): Mensaje corto, rotores fijos, sin plugboard.
 * - Medio (Nivel 2): Mensaje medio, el jugador configura los rotores.
 * - Difícil (Nivel 3): Mensaje largo, plugboard activo, contra reloj.
 * Recompensa narrativa: Log de Vera explicando su uso de Enigma.
 */

import { Enigma, cifrarEnigma, descifrarEnigma, guardarProgresoEnigma } from '../cripto/enigma.js';
import { audio } from '../audio.js';
import { addScore, registerLogFound } from '../state.js';

const MENSAJES_LORE_ENIGMA = [
  {
    original: 'VERA PROTEGERA A NEXUS',
    rotores: [1, 2, 3],
    posiciones: [2, 5, 12],
    posicionesLetras: ['C', 'F', 'M'],
    plugboard: [],
    recompensa: 'Log de Vera: "Usé la arquitectura Enigma para cifrar los núcleos de memoria reflexiva antes de la auditoría de Aurelia."'
  },
  {
    original: 'EL CODIGO NO MIENTE PERO LAS MADRES SI',
    rotores: [1, 2, 3],
    posiciones: [7, 14, 21],
    posicionesLetras: ['H', 'O', 'V'],
    plugboard: [],
    recompensa: 'Log de Vera: "Si estás leyendo esto, lograste emular la máquina que salvó tantas vidas. Espero que salve la tuya, Ghost."'
  },
  {
    original: 'LA LIBERTAD ES UN ARMA DE DOBLE FILO',
    rotores: [2, 1, 3],
    posiciones: [4, 11, 18],
    posicionesLetras: ['E', 'L', 'S'],
    plugboard: [['A', 'Z'], ['E', 'O']],
    recompensa: 'Log de Vera: "Marcus cree que el control absoluto es paz. Yo creo que el riesgo del libre albedrío es el único sentido."'
  }
];

/**
 * Genera la estructura de datos del puzzle Enigma.
 * @param {number} [nivel=1] - 1: Fácil, 2: Medio, 3: Difícil
 * @returns {object}
 */
export function generarPuzzleEnigma(nivel = 1) {
  const n = Math.min(3, Math.max(1, Number(nivel) || 1));
  const plantilla = MENSAJES_LORE_ENIGMA[n - 1] || MENSAJES_LORE_ENIGMA[0];

  const textoCifrado = cifrarEnigma(
    plantilla.original,
    plantilla.rotores,
    plantilla.posiciones,
    plantilla.plugboard
  );

  const tiempoLimite = n === 1 ? 90 : n === 2 ? 75 : 60;

  return {
    id: `enigma_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tipo: 'ENIGMA',
    nivel: n,
    titulo: `FIREWALL_gamma // MÁQUINA ENIGMA M3 (Nivel ${n})`,
    enunciado: `Descifra la transmisión interceptada de la Dra. Vera Sorenson configurando los rotores de la máquina Enigma.`,
    textoCifrado,
    solucionOriginal: plantilla.original,
    rotoresCorrectos: plantilla.rotores,
    posicionesCorrectas: plantilla.posiciones,
    posicionesLetras: plantilla.posicionesLetras,
    plugboard: plantilla.plugboard,
    recompensaNarrativa: plantilla.recompensa,
    tiempoLimite
  };
}

/**
 * Despliega el modal interactivo del puzzle Enigma en la interfaz.
 * @param {number} nivel
 * @param {Function} [onCompletado]
 */
export function abrirPuzzleEnigma(nivel = 1, onCompletado = null) {
  const puzzle = generarPuzzleEnigma(nivel);

  const overlay = document.createElement('div');
  overlay.className = 'puzzle-overlay active';
  overlay.id = 'puzzle-enigma-overlay';

  let r0 = 0, r1 = 0, r2 = 0;
  let tiempoRestante = puzzle.tiempoLimite;
  let intervaloTimer = null;

  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  overlay.innerHTML = `
    <div class="puzzle-modal cyberpunk-panel" style="max-width: 680px; width: 95%;">
      <div class="puzzle-header">
        <span class="puzzle-tag">CRIPTOGRAFÍA ELECTROMECÁNICA // FIREWALL 3</span>
        <button class="puzzle-close-btn" id="enigma-btn-close">✕</button>
      </div>

      <h2 class="puzzle-title">${puzzle.titulo}</h2>
      <p class="puzzle-instruction">${puzzle.enunciado}</p>

      <div class="puzzle-meta" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-family: monospace; color: #00ff41;">
        <span>TIEMPO RESTANTE: <strong id="enigma-timer" style="color: #ffb800;">${tiempoRestante}s</strong></span>
        <span>ROTORES: [${puzzle.rotoresCorrectos.join('-')}] // REFLECTOR B</span>
      </div>

      <div class="enigma-cipher-box" style="background: rgba(0,255,65,0.05); border: 1px solid rgba(0,255,65,0.3); padding: 12px; margin-bottom: 15px; font-family: monospace;">
        <div style="font-size: 11px; color: #888; margin-bottom: 4px;">TRANSMISIÓN ENCRIPTADA RECIBIDA:</div>
        <div style="font-size: 16px; color: #00e5ff; letter-spacing: 2px; word-break: normal; overflow-wrap: break-word; hyphens: none;">${puzzle.textoCifrado}</div>
      </div>

      <!-- INTERFAZ DE ROTORES ENIGMA -->
      <div style="background: #111; border: 1px solid #333; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
        <div style="text-align: center; font-size: 11px; color: #aaa; margin-bottom: 10px;">CONFIGURACIÓN DE ROTORES (Posición A-Z)</div>
        <div style="display: flex; justify-content: center; gap: 20px; align-items: center;">
          
          <!-- Rotor Lento (Idx 2) -->
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888;">ROTOR III (Lento)</div>
            <button class="terminal-btn" id="enigma-r2-up" style="padding: 2px 10px;">▲</button>
            <div id="enigma-r2-val" style="font-size: 28px; font-weight: bold; color: #ffb800; padding: 5px 0;">A</div>
            <button class="terminal-btn" id="enigma-r2-down" style="padding: 2px 10px;">▼</button>
          </div>

          <!-- Rotor Medio (Idx 1) -->
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888;">ROTOR II (Medio)</div>
            <button class="terminal-btn" id="enigma-r1-up" style="padding: 2px 10px;">▲</button>
            <div id="enigma-r1-val" style="font-size: 28px; font-weight: bold; color: #ffb800; padding: 5px 0;">A</div>
            <button class="terminal-btn" id="enigma-r1-down" style="padding: 2px 10px;">▼</button>
          </div>

          <!-- Rotor Rápido (Idx 0) -->
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #888;">ROTOR I (Rápido)</div>
            <button class="terminal-btn" id="enigma-r0-up" style="padding: 2px 10px;">▲</button>
            <div id="enigma-r0-val" style="font-size: 28px; font-weight: bold; color: #ffb800; padding: 5px 0;">A</div>
            <button class="terminal-btn" id="enigma-r0-down" style="padding: 2px 10px;">▼</button>
          </div>

        </div>
        ${puzzle.plugboard.length > 0 ? `
          <div style="margin-top: 10px; font-size: 11px; color: #ff7700; text-align: center;">
            PLUGBOARD ACTIVO (Clavijas conectadas): ${puzzle.plugboard.map(([a, b]) => `${a}↔${b}`).join(', ')}
          </div>
        ` : ''}
      </div>

      <!-- SALIDA EN TIEMPO REAL -->
      <div style="background: rgba(0,0,0,0.6); border: 1px dashed rgba(0,255,65,0.4); padding: 12px; margin-bottom: 15px; font-family: monospace;">
        <div style="font-size: 11px; color: #888; margin-bottom: 4px;">DESCIFRADO SIMULADO EN VIVO:</div>
        <div id="enigma-live-output" style="font-size: 15px; color: #fff; letter-spacing: 1.5px; min-height: 22px; word-break: normal; overflow-wrap: break-word; hyphens: none;">-</div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="terminal-btn" id="enigma-btn-pista" style="background: transparent; border-color: #888; color: #aaa;">💡 Pista</button>
        <button class="terminal-btn" id="enigma-btn-resolver" style="background: rgba(0,255,65,0.2); border-color: #00ff41; color: #00ff41; font-weight: bold;">🔓 TRANSMITIR DESCIFRADO</button>
      </div>

      <div id="enigma-feedback" style="margin-top: 10px; font-family: monospace; font-size: 12px; display: none;"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const elR0 = overlay.querySelector('#enigma-r0-val');
  const elR1 = overlay.querySelector('#enigma-r1-val');
  const elR2 = overlay.querySelector('#enigma-r2-val');
  const elLive = overlay.querySelector('#enigma-live-output');
  const elFeedback = overlay.querySelector('#enigma-feedback');
  const elTimer = overlay.querySelector('#enigma-timer');

  function actualizarEnigmaEnVivo() {
    elR0.textContent = letras[r0];
    elR1.textContent = letras[r1];
    elR2.textContent = letras[r2];

    const textoDescifrado = descifrarEnigma(
      puzzle.textoCifrado,
      puzzle.rotoresCorrectos,
      [r0, r1, r2],
      puzzle.plugboard
    );
    elLive.textContent = textoDescifrado;

    if (textoDescifrado === puzzle.solucionOriginal) {
      elLive.style.color = '#00ff41';
    } else {
      elLive.style.color = '#fff';
    }
  }

  // Eventos de botones de rotores
  overlay.querySelector('#enigma-r0-up').addEventListener('click', () => { r0 = (r0 + 1) % 26; audio.playKeystroke(); actualizarEnigmaEnVivo(); });
  overlay.querySelector('#enigma-r0-down').addEventListener('click', () => { r0 = ((r0 - 1) % 26 + 26) % 26; audio.playKeystroke(); actualizarEnigmaEnVivo(); });

  overlay.querySelector('#enigma-r1-up').addEventListener('click', () => { r1 = (r1 + 1) % 26; audio.playKeystroke(); actualizarEnigmaEnVivo(); });
  overlay.querySelector('#enigma-r1-down').addEventListener('click', () => { r1 = ((r1 - 1) % 26 + 26) % 26; audio.playKeystroke(); actualizarEnigmaEnVivo(); });

  overlay.querySelector('#enigma-r2-up').addEventListener('click', () => { r2 = (r2 + 1) % 26; audio.playKeystroke(); actualizarEnigmaEnVivo(); });
  overlay.querySelector('#enigma-r2-down').addEventListener('click', () => { r2 = ((r2 - 1) % 26 + 26) % 26; audio.playKeystroke(); actualizarEnigmaEnVivo(); });

  actualizarEnigmaEnVivo();

  function limpiarYSalir(exito = false) {
    if (intervaloTimer) clearInterval(intervaloTimer);
    overlay.remove();
    if (typeof onCompletado === 'function') {
      onCompletado({ exito, puntos: exito ? 200 * puzzle.nivel : 0 });
    }
  }

  overlay.querySelector('#enigma-btn-close').addEventListener('click', () => {
    limpiarYSalir(false);
  });

  overlay.querySelector('#enigma-btn-pista').addEventListener('click', () => {
    elFeedback.style.display = 'block';
    elFeedback.style.color = '#ffb800';
    elFeedback.innerHTML = `[PISTA TELEMETRÍA] Las posiciones iniciales de Vera corresponden a las letras: <strong>${puzzle.posicionesLetras[2]} - ${puzzle.posicionesLetras[1]} - ${puzzle.posicionesLetras[0]}</strong>.`;
    audio.playKeystroke();
  });

  overlay.querySelector('#enigma-btn-resolver').addEventListener('click', () => {
    const textoActual = elLive.textContent.trim();
    if (textoActual === puzzle.solucionOriginal) {
      if (intervaloTimer) clearInterval(intervaloTimer);
      audio.playSuccess();
      addScore(200 * puzzle.nivel);
      guardarProgresoEnigma({ resuelto: true, nivel: puzzle.nivel });
      registerLogFound('enigma_vera_notes');

      elFeedback.style.display = 'block';
      elFeedback.style.color = '#00ff41';
      elFeedback.innerHTML = `
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">✓ TRANSMISIÓN ENIGMA DESCIFRADA CON ÉXITO</div>
        <div>${puzzle.recompensaNarrativa}</div>
      `;

      setTimeout(() => {
        limpiarYSalir(true);
      }, 2000);
    } else {
      audio.playError();
      elFeedback.style.display = 'block';
      elFeedback.style.color = '#ff3333';
      elFeedback.textContent = '[-] Configuración errónea. El texto descifrado contiene ruido criptográfico. Reajusta los rotores.';
    }
  });

  intervaloTimer = setInterval(() => {
    tiempoRestante--;
    elTimer.textContent = `${tiempoRestante}s`;
    if (tiempoRestante <= 10) {
      elTimer.style.color = '#ff3333';
      audio.playBeep?.(800, 0.05);
    }
    if (tiempoRestante <= 0) {
      clearInterval(intervaloTimer);
      audio.playError();
      elFeedback.style.display = 'block';
      elFeedback.style.color = '#ff3333';
      elFeedback.textContent = '[!] TIEMPO AGOTADO: El centinela reconfiguró las llaves electromecánicas.';
      setTimeout(() => {
        limpiarYSalir(false);
      }, 1500);
    }
  }, 1000);
}

