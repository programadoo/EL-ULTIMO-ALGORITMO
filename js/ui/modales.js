/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Modales — Ventanas Modales y Diálogos Cyberpunk
 * Especificación: Sección 4.4 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { audio, speechEngine } from '../audio.js';
import { resetState } from '../state.js';

let activeModalOverlay = null;

/**
 * Crea o reutiliza el overlay global de modales.
 */
function getModalOverlay() {
  if (typeof document === 'undefined') return null;
  let overlay = document.getElementById('nexus-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'nexus-modal-overlay';
    overlay.className = 'puzzle-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(10, 14, 10, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    `;
    document.body.appendChild(overlay);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        cerrarModal();
      }
    });
  }
  return overlay;
}

/**
 * Muestra una ventana modal personalizada.
 * @param {object} opciones
 * @param {string} opciones.titulo
 * @param {string} opciones.cuerpoHTML
 * @param {Array<{ label: string, onClick?: Function, estilo?: string }>} [opciones.botones]
 * @param {Function} [opciones.onCerrar]
 */
export function mostrarModal({ titulo, cuerpoHTML, botones = [], onCerrar = null }) {
  const overlay = getModalOverlay();
  if (!overlay) return;

  activeModalOverlay = overlay;
  overlay.innerHTML = '';

  const modalBox = document.createElement('div');
  modalBox.className = 'puzzle';
  modalBox.style.cssText = `
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    max-width: 620px;
    width: 90%;
    box-shadow: 0 0 25px rgba(0, 255, 65, 0.2);
    position: relative;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  `;

  // Encabezado
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: 12px;
    margin-bottom: 18px;
  `;
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="color: var(--cyan); font-family: var(--font-display); font-size: 14px; letter-spacing: 0.1em; font-weight: bold;">
        ◈ ${titulo}
      </span>
    </div>
    <button id="btn-modal-close" style="background: none; border: none; color: var(--text-dim); font-size: 20px; cursor: pointer; line-height: 1; padding: 4px 8px;">
      ✕
    </button>
  `;

  // Cuerpo
  const body = document.createElement('div');
  body.style.cssText = `
    overflow-y: auto;
    font-family: var(--font-narrative);
    color: var(--text-primary);
    line-height: 1.7;
    margin-bottom: 20px;
    padding-right: 6px;
    flex: 1;
  `;
  body.innerHTML = cuerpoHTML;

  // Botones de acción
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid var(--border-primary);
    padding-top: 14px;
    margin-top: auto;
  `;

  const btnList = botones.length > 0 ? botones : [{ label: 'CERRAR', onClick: cerrarModal }];

  btnList.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.style.cssText = `
      width: auto;
      padding: 8px 24px;
      font-size: var(--fs-xs);
      ${b.estilo || ''}
    `;
    btn.textContent = b.label;
    btn.onclick = () => {
      audio.playKeyClick();
      if (typeof b.onClick === 'function') {
        b.onClick();
      } else {
        cerrarModal();
      }
    };
    footer.appendChild(btn);
  });

  modalBox.appendChild(header);
  modalBox.appendChild(body);
  modalBox.appendChild(footer);
  overlay.appendChild(modalBox);

  // Cerrar botón de cruz
  const closeBtn = header.querySelector('#btn-modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      audio.playKeyClick();
      cerrarModal();
      if (typeof onCerrar === 'function') onCerrar();
    };
  }

  // Activar animación
  overlay.style.pointerEvents = 'all';
  overlay.classList.add('active');
  overlay.style.opacity = '1';
}

/**
 * Cierra el modal activo.
 */
export function cerrarModal() {
  speechEngine.stop();
  if (activeModalOverlay) {
    activeModalOverlay.style.opacity = '0';
    activeModalOverlay.style.pointerEvents = 'none';
    activeModalOverlay.classList.remove('active');
    setTimeout(() => {
      activeModalOverlay.innerHTML = '';
    }, 250);
  }
}

/**
 * Abre el panel de Configuración del sistema.
 */
export function abrirConfiguracion() {
  const crtActivo = document.body.classList.contains('crt-flicker');
  const scanlinesActivo = document.body.classList.contains('scanlines');
  const muted = audio.isMuted();
  const voiceEnabled = speechEngine.isVoiceEnabled();

  const cuerpoHTML = `
    <div style="font-family: var(--font-mono); font-size: 13px;">
      <p style="color: var(--text-dim); margin-bottom: 16px;">
        // PARÁMETROS DEL SISTEMA NEXUS v2.0.47
      </p>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-primary); border-radius: 4px;">
          <span>AUDIO & EFECTOS SONOROS</span>
          <button id="toggle-opt-sound" class="puzzle__opcion" style="padding: 4px 14px; font-size: 11px;">
            ${muted ? '🔇 SILENCIADO' : '🔊 ACTIVADO'}
          </button>
        </label>

        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-primary); border-radius: 4px;">
          <span>VOZ SINTETIZADA (NEXUS / VERA)</span>
          <button id="toggle-opt-voice" class="puzzle__opcion" style="padding: 4px 14px; font-size: 11px;">
            ${voiceEnabled ? '🎙️ ACTIVADA' : '○ DESACTIVADA'}
          </button>
        </label>

        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-primary); border-radius: 4px;">
          <span>DRONE AMBIENTAL DE FONDO</span>
          <button id="toggle-opt-ambient" class="puzzle__opcion" style="padding: 4px 14px; font-size: 11px;">
            ${audio.isAmbientPlaying ? '⚡ ACTIVO' : '○ APAGADO'}
          </button>
        </label>

        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-primary); border-radius: 4px;">
          <span>EFECTO CRT FLICKER</span>
          <button id="toggle-opt-crt" class="puzzle__opcion" style="padding: 4px 14px; font-size: 11px;">
            ${crtActivo ? 'ON' : 'OFF'}
          </button>
        </label>

        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-primary); border-radius: 4px;">
          <span>LÍNEAS SCANLINES</span>
          <button id="toggle-opt-scan" class="puzzle__opcion" style="padding: 4px 14px; font-size: 11px;">
            ${scanlinesActivo ? 'ON' : 'OFF'}
          </button>
        </label>
      </div>

      <div style="margin-top: 24px; padding-top: 14px; border-top: 1px dashed var(--border-primary);">
        <p style="color: var(--red-alert); font-size: 11px; margin-bottom: 8px;">
          ZONA DE RIESGO:
        </p>
        <button id="btn-opt-reset-save" class="puzzle__opcion" style="border-color: var(--red-alert); color: var(--red-alert); width: 100%; text-align: center;">
          ⚠ REINICIAR PROGRESO LOCAL (BORRAR PARTIDA)
        </button>
      </div>
    </div>
  `;

  mostrarModal({
    titulo: 'CONFIGURACIÓN DE TERMINAL',
    cuerpoHTML,
    botones: [
      { label: 'ACEPTAR', onClick: cerrarModal }
    ]
  });

  // Handlers interactivos
  const btnSound = document.getElementById('toggle-opt-sound');
  if (btnSound) {
    btnSound.onclick = () => {
      const isMuted = audio.toggleMute();
      btnSound.textContent = isMuted ? '🔇 SILENCIADO' : '🔊 ACTIVADO';
    };
  }

  const btnVoice = document.getElementById('toggle-opt-voice');
  if (btnVoice) {
    btnVoice.onclick = () => {
      const isVoiceOn = speechEngine.toggleVoice();
      btnVoice.textContent = isVoiceOn ? '🎙️ ACTIVADA' : '○ DESACTIVADA';
      if (isVoiceOn) {
        speechEngine.speakNexus('Voz de terminal activada.');
      }
    };
  }

  const btnAmbient = document.getElementById('toggle-opt-ambient');
  if (btnAmbient) {
    btnAmbient.onclick = () => {
      const isPlaying = audio.toggleAmbient();
      btnAmbient.textContent = isPlaying ? '⚡ ACTIVO' : '○ APAGADO';
    };
  }

  const btnCRT = document.getElementById('toggle-opt-crt');
  if (btnCRT) {
    btnCRT.onclick = () => {
      document.body.classList.toggle('crt-flicker');
      btnCRT.textContent = document.body.classList.contains('crt-flicker') ? 'ON' : 'OFF';
    };
  }

  const btnScan = document.getElementById('toggle-opt-scan');
  if (btnScan) {
    btnScan.onclick = () => {
      document.body.classList.toggle('scanlines');
      btnScan.textContent = document.body.classList.contains('scanlines') ? 'ON' : 'OFF';
    };
  }

  const btnReset = document.getElementById('btn-opt-reset-save');
  if (btnReset) {
    btnReset.onclick = () => {
      if (confirm('¿Seguro que deseas borrar el progreso guardado en este navegador?')) {
        resetState();
        alert('Progreso reseteado a valores iniciales.');
        cerrarModal();
      }
    };
  }
}

/**
 * Abre el visor de documentos desclasificados / logs.
 * @param {string} nombreArchivo
 * @param {string} contenido
 */
export function abrirVisorLog(nombreArchivo, contenido) {
  const cuerpoHTML = `
    <div style="background: rgba(0,0,0,0.5); padding: 16px; border: 1px solid var(--border-primary); border-radius: 4px; font-family: var(--font-mono); font-size: 13px; white-space: pre-wrap; color: var(--text-primary); line-height: 1.6;">
${contenido}
    </div>
  `;

  mostrarModal({
    titulo: `VISOR DE INTELIGENCIA // ${nombreArchivo}`,
    cuerpoHTML,
    botones: [
      {
        label: '🎙️ TRANSMISIÓN DE VOZ (VERA)',
        onClick: () => {
          speechEngine.speakVera(contenido);
        }
      },
      { label: 'CERRAR ARCHIVO', onClick: cerrarModal }
    ]
  });
}

/**
 * Suite de tests unitarios de modales.
 */
export function testModales() {
  console.group('%c[TEST SUITE] Modales Cyberpunk (modales.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(typeof mostrarModal === 'function', 'mostrarModal debe ser una función');
  assert(typeof cerrarModal === 'function', 'cerrarModal debe ser una función');
  assert(typeof abrirConfiguracion === 'function', 'abrirConfiguracion debe ser una función');
  assert(typeof abrirVisorLog === 'function', 'abrirVisorLog debe ser una función');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Modales: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Modales: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
