/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Feedback — Sistema de Respuestas Visuales, Hápticas y Sonoras
 * Especificación: Sección 2.2, 4.3 y Fase 5 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { audio } from '../audio.js';
import { particulas } from './particulas.js';

// Contenedor persistente de notificaciones flotantes (toasts)
let toastContainer = null;

function ensureToastContainer() {
  if (typeof document === 'undefined') return null;
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.getElementById('nexus-feedback-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'nexus-feedback-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 99999;
        pointer-events: none;
        max-width: 380px;
      `;
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Sacude la pantalla para simular impacto de error o intrusión.
 * @param {number} [durationMs=400]
 */
export function shakeScreen(durationMs = 400) {
  if (typeof document === 'undefined') return;
  const target = document.body;
  target.classList.add('shake');
  setTimeout(() => {
    target.classList.remove('shake');
  }, durationMs);

  // Respuesta háptica en dispositivos móviles
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate([60, 40, 80]); } catch (_) {}
  }
}

/**
 * Destello visual verde o rojo en pantalla completa.
 * @param {'green'|'red'|'cyan'} [color='green']
 * @param {number} [durationMs=350]
 */
export function flashScreen(color = 'green', durationMs = 350) {
  if (typeof document === 'undefined') return;
  const flash = document.createElement('div');
  const bgMap = {
    green: 'rgba(0, 255, 65, 0.18)',
    red: 'rgba(255, 0, 64, 0.22)',
    cyan: 'rgba(0, 217, 255, 0.20)',
    purple: 'rgba(176, 0, 255, 0.22)'
  };

  flash.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${bgMap[color] || bgMap.green};
    z-index: 99998;
    pointer-events: none;
    transition: opacity ${durationMs}ms ease-out;
    opacity: 1;
  `;

  document.body.appendChild(flash);
  requestAnimationFrame(() => {
    flash.style.opacity = '0';
  });

  setTimeout(() => {
    if (flash.parentNode) flash.parentNode.removeChild(flash);
  }, durationMs + 50);
}

/**
 * Dispara una perturbación glitch en pantalla.
 * @param {number} [durationMs=300]
 */
export function triggerGlitch(durationMs = 300) {
  if (typeof document === 'undefined') return;
  document.body.classList.add('glitch');
  audio.playGlitch();
  setTimeout(() => {
    document.body.classList.remove('glitch');
  }, durationMs);
}

/**
 * Muestra un toast cibernético flotante con animación.
 * @param {object} opciones
 * @param {string} opciones.titulo
 * @param {string} [opciones.mensaje]
 * @param {'success'|'error'|'warning'|'info'|'log'} [opciones.tipo='info']
 * @param {number} [opciones.duracion=3500]
 */
export function showFeedbackToast({ titulo, mensaje = '', tipo = 'info', duracion = 3500 }) {
  const container = ensureToastContainer();
  if (!container) return;

  const toast = document.createElement('div');
  const colores = {
    success: { border: 'var(--green-bright)', glow: 'var(--green-glow)', text: 'var(--green-bright)', icon: '✔' },
    error:   { border: 'var(--red-alert)',    glow: 'var(--red-glow)',   text: 'var(--red-alert)',    icon: '✖' },
    warning: { border: 'var(--yellow-warn)',  glow: 'var(--yellow-glow)',text: 'var(--yellow-warn)',  icon: '⚠' },
    info:    { border: 'var(--cyan)',         glow: 'var(--cyan-glow)',  text: 'var(--cyan)',         icon: '◈' },
    log:     { border: 'var(--purple-glitch)',glow: 'rgba(176,0,255,0.4)', text: 'var(--purple-glitch)', icon: '✦' }
  };

  const c = colores[tipo] || colores.info;

  toast.className = 'feedback-toast';
  toast.style.cssText = `
    background: rgba(10, 14, 10, 0.94);
    border: 1px solid ${c.border};
    box-shadow: 0 0 14px ${c.glow}, inset 0 0 10px rgba(0,0,0,0.8);
    border-radius: 4px;
    padding: 12px 18px;
    font-family: var(--font-mono);
    color: var(--text-primary);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transform: translateX(120%);
    transition: transform 0.28s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.25s ease;
    opacity: 0;
    pointer-events: auto;
    cursor: pointer;
  `;

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: ${mensaje ? '4px' : '0'};">
      <span style="color: ${c.text}; font-size: 16px; font-weight: bold;">${c.icon}</span>
      <span style="font-family: var(--font-display); font-size: 12px; letter-spacing: 0.1em; color: ${c.text}; font-weight: bold;">
        ${titulo}
      </span>
    </div>
    ${mensaje ? `<div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; font-family: var(--font-narrative);">${mensaje}</div>` : ''}
  `;

  toast.onclick = () => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  };

  container.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Salida automática
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }
  }, duracion);
}

/**
 * Notificación rápida de acierto / resolución de puzzle.
 * @param {number} puntos
 * @param {string} [mensaje]
 * @param {object} [coords]
 */
export function feedbackSuccess(puntos = 100, mensaje = 'Autenticación superada con éxito', coords = null) {
  flashScreen('green', 300);
  audio.playSuccess();
  particulas.emitSuccess(coords?.x, coords?.y);
  showFeedbackToast({
    titulo: `+${puntos} PTS // NODO DESBLOQUEADO`,
    mensaje,
    tipo: 'success'
  });
}

/**
 * Notificación rápida de fallo / daño de integridad.
 * @param {number} [integridadPerdida=20]
 * @param {string} [mensaje]
 * @param {object} [coords]
 */
export function feedbackError(integridadPerdida = 20, mensaje = 'Fallo de autenticación detectado por el centinela', coords = null) {
  shakeScreen(450);
  flashScreen('red', 400);
  audio.playError();
  particulas.emitError(coords?.x, coords?.y);
  showFeedbackToast({
    titulo: `-${integridadPerdida}% INTEGRIDAD // ALERTA`,
    mensaje,
    tipo: 'error'
  });
}

/**
 * Notificación de log oculto hallado (Prompt 11 playUnlock & Prompt 13 emitBinarySmoke).
 * @param {string} nombreLog
 * @param {string} fragmento
 * @param {object} [coords]
 */
export function feedbackLogUnlocked(nombreLog, fragmento = '', coords = null) {
  flashScreen('cyan', 400);
  audio.playUnlock();
  particulas.emitBinarySmoke(coords?.x, coords?.y);
  showFeedbackToast({
    titulo: `LOG DESCLASIFICADO: ${nombreLog} (+200 PTS)`,
    mensaje: fragmento || 'Nuevo documento de inteligencia recuperado de la memoria central.',
    tipo: 'log',
    duracion: 5000
  });
}

/**
 * Efecto de pantalla completa para cuando se vulnera un firewall completo.
 */
export function feedbackFirewallBreach() {
  audio.playFirewallComplete();
  particulas.emitFirewallBreach();
}

/**
 * Suite de tests unitarios de feedback.
 */
export function testFeedback() {
  console.group('%c[TEST SUITE] Feedback Visual y Sonoro (feedback.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(typeof shakeScreen === 'function', 'shakeScreen debe ser una función');
  assert(typeof flashScreen === 'function', 'flashScreen debe ser una función');
  assert(typeof triggerGlitch === 'function', 'triggerGlitch debe ser una función');
  assert(typeof showFeedbackToast === 'function', 'showFeedbackToast debe ser una función');
  assert(typeof feedbackSuccess === 'function', 'feedbackSuccess debe ser una función');
  assert(typeof feedbackError === 'function', 'feedbackError debe ser una función');
  assert(typeof feedbackLogUnlocked === 'function', 'feedbackLogUnlocked debe ser una función');
  assert(typeof feedbackFirewallBreach === 'function', 'feedbackFirewallBreach debe ser una función');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Feedback: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Feedback: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
