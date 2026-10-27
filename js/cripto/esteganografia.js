/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Esteganografía LSB en Imágenes
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.3 y Prompt A6)
 * ══════════════════════════════════════════════════
 *
 * Provee funciones para ocultar y extraer mensajes de texto en imágenes
 * mediante la técnica LSB (Least Significant Bit) en canales de color
 * (canal rojo por defecto), inspección paso a paso y generación de imágenes Canvas.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_ESTEGANOGRAFIA_KEY = 'ultimo_algoritmo_esteganografia';

/**
 * Extrae un mensaje de texto oculto en los bits menos significativos (LSB) de una imagen.
 * Por defecto lee el bit menos significativo del canal rojo (data[i] & 1).
 * La lectura finaliza al encontrar el byte nulo terminador ('00000000').
 * 
 * @param {ImageData|{ data: Uint8ClampedArray|number[] }} imageData
 * @param {number} [canal=0] - Canal a leer: 0=Rojo, 1=Verde, 2=Azul
 * @returns {string} Mensaje extraído
 */
export function extraerMensajeLSB(imageData, canal = 0) {
  if (!imageData || !imageData.data) return '';
  const data = imageData.data;
  let binario = '';

  for (let i = 0; i < data.length; i += 4) {
    // Leer el bit menos significativo del canal especificado
    binario += (data[i + canal] & 1).toString();
  }

  // Convertir binario a texto (bloques de 8 bits)
  let mensaje = '';
  for (let i = 0; i < binario.length; i += 8) {
    if (i + 8 > binario.length) break;
    const byte = binario.substr(i, 8);
    // Byte nulo termina el mensaje (sentinel)
    if (byte === '00000000') break;
    const code = parseInt(byte, 2);
    if (!isNaN(code) && code > 0) {
      mensaje += String.fromCharCode(code);
    }
  }

  return mensaje;
}

/**
 * Oculta un mensaje de texto en los bits menos significativos (LSB) de una imagen.
 * Convierte el texto a secuencias de 8 bits y añade un byte nulo al final.
 * 
 * @param {ImageData|{ data: Uint8ClampedArray|number[] }} imageData
 * @param {string} mensaje - Texto a incrustar
 * @param {number} [canal=0] - Canal a modificar: 0=Rojo, 1=Verde, 2=Azul
 * @returns {ImageData|{ data: Uint8ClampedArray|number[] }}
 */
export function ocultarMensajeLSB(imageData, mensaje, canal = 0) {
  if (!imageData || !imageData.data || typeof mensaje !== 'string') return imageData;
  const data = imageData.data;

  // Convertir mensaje a cadena continua de bits + terminador nulo (8 ceros)
  let bits = '';
  for (let i = 0; i < mensaje.length; i++) {
    const code = mensaje.charCodeAt(i);
    bits += code.toString(2).padStart(8, '0');
  }
  bits += '00000000'; // Byte terminador nulo

  const capacidadBits = Math.floor(data.length / 4);
  if (bits.length > capacidadBits) {
    console.warn(`[Esteganografía] El mensaje requiere ${bits.length} bits, pero la imagen solo tiene capacidad para ${capacidadBits} bits.`);
  }

  const bitsAEscribir = Math.min(bits.length, capacidadBits);

  for (let bitIdx = 0; bitIdx < bitsAEscribir; bitIdx++) {
    const pixelIdx = bitIdx * 4 + canal;
    const bit = parseInt(bits[bitIdx], 10);
    // Limpiar bit LSB (AND con ~1) y aplicar el bit deseado (OR con bit)
    data[pixelIdx] = (data[pixelIdx] & ~1) | bit;
  }

  return imageData;
}

/**
 * Genera un análisis educativo paso a paso mostrando la extracción bit a bit
 * de los primeros píxeles de la imagen.
 * 
 * @param {ImageData|{ data: Uint8ClampedArray|number[] }} imageData
 * @param {number} [maxCaracteres=4] - Cantidad máxima de caracteres a inspeccionar
 * @param {number} [canal=0]
 * @returns {Array<object>} Detalle por cada píxel y por cada byte reconstruido
 */
export function analizarPasoAPasoLSB(imageData, maxCaracteres = 4, canal = 0) {
  if (!imageData || !imageData.data) return [];
  const data = imageData.data;
  const pasos = [];
  const maxPixels = Math.min(data.length / 4, maxCaracteres * 8);

  let byteActualBits = [];
  let charIdx = 0;

  for (let p = 0; p < maxPixels; p++) {
    const offset = p * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];

    const valCanal = data[offset + canal];
    const bitLSB = valCanal & 1;
    const binCanal = valCanal.toString(2).padStart(8, '0');

    byteActualBits.push(bitLSB);

    let charCompletado = null;
    let byteBinario = null;
    let asciiCode = null;

    if (byteActualBits.length === 8) {
      byteBinario = byteActualBits.join('');
      asciiCode = parseInt(byteBinario, 2);
      charCompletado = (asciiCode > 0 && asciiCode < 128) ? String.fromCharCode(asciiCode) : '[NUL]';
      byteActualBits = [];
      charIdx++;
    }

    pasos.push({
      pixelIndex: p,
      color: { r, g, b, a },
      canalSeleccionado: canal === 0 ? 'Rojo' : (canal === 1 ? 'Verde' : 'Azul'),
      valorCanal: valCanal,
      binCanal,
      bitLSB,
      posicionEnByte: (p % 8) + 1,
      byteBinario,
      asciiCode,
      charCompletado
    });
  }

  return pasos;
}

/**
 * Crea un Canvas interactivo con un diseño ciberpunk (matriz holográfica cuántica)
 * e incrusta el mensaje en sus bits LSB.
 * 
 * @param {string} mensaje - Texto confidencial a ocultar
 * @param {number} [ancho=160] - Ancho del canvas
 * @param {number} [alto=160] - Alto del canvas
 * @param {number} [canal=0] - Canal de inserción LSB
 * @returns {{ canvas: HTMLCanvasElement|null, dataUrl: string, imageData: ImageData|null }}
 */
export function crearCanvasConMensaje(mensaje, ancho = 160, alto = 160, canal = 0) {
  if (typeof document === 'undefined') {
    return { canvas: null, dataUrl: '', imageData: null };
  }

  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');

  // 1. Fondo ciberpunk de matriz onírica
  const grad = ctx.createLinearGradient(0, 0, ancho, alto);
  grad.addColorStop(0, '#0a100d');
  grad.addColorStop(0.5, '#001a1a');
  grad.addColorStop(1, '#051410');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ancho, alto);

  // 2. Líneas de circuito cuántico
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
  ctx.lineWidth = 1;
  const gridSize = 16;
  for (let x = 0; x < ancho; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, alto);
    ctx.stroke();
  }
  for (let y = 0; y < alto; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ancho, y);
    ctx.stroke();
  }

  // 3. Símbolo holográfico central de NEXUS
  ctx.save();
  ctx.translate(ancho / 2, alto / 2);
  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00ff41';
  ctx.shadowBlur = 10;

  // Círculo exterior
  ctx.beginPath();
  ctx.arc(0, 0, ancho * 0.32, 0, Math.PI * 2);
  ctx.stroke();

  // Núcleo geométrico
  ctx.strokeStyle = '#00e5ff';
  ctx.shadowColor = '#00e5ff';
  ctx.beginPath();
  ctx.moveTo(0, -ancho * 0.22);
  ctx.lineTo(ancho * 0.2, ancho * 0.14);
  ctx.lineTo(-ancho * 0.2, ancho * 0.14);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  // 4. Glitch scanlines
  ctx.fillStyle = 'rgba(0, 255, 65, 0.08)';
  for (let y = 0; y < alto; y += 4) {
    ctx.fillRect(0, y, ancho, 1.5);
  }

  // 5. Extraer ImageData e incrustar mensaje LSB
  const imageData = ctx.getImageData(0, 0, ancho, alto);
  ocultarMensajeLSB(imageData, mensaje, canal);
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  return { canvas, dataUrl, imageData };
}

/**
 * Inicia la descarga de la imagen esteganográfica en el navegador.
 * 
 * @param {HTMLCanvasElement|string} canvasODataUrl - Elemento Canvas o Data URL
 * @param {string} [nombreArchivo='sospechosa.png']
 */
export function descargarImagenCanvas(canvasODataUrl, nombreArchivo = 'sospechosa.png') {
  if (typeof document === 'undefined') return;

  let url = '';
  if (typeof canvasODataUrl === 'string') {
    url = canvasODataUrl;
  } else if (canvasODataUrl && typeof canvasODataUrl.toDataURL === 'function') {
    url = canvasODataUrl.toDataURL('image/png');
  } else {
    return;
  }

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
}

/**
 * Guarda el progreso de esteganografía en localStorage y actualiza el state.
 * @param {object} progreso
 * @returns {boolean}
 */
export function guardarProgresoEsteganografia(progreso = {}) {
  try {
    const previo = cargarProgresoEsteganografia() || {};
    const nuevo = {
      ...previo,
      ...progreso,
      actualizadoEn: Date.now()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ESTEGANOGRAFIA_KEY, JSON.stringify(nuevo));
    }

    const state = getState();
    const words = (state.wordsDecrypted || 0) + (progreso.resuelto ? 1 : 0);
    update({
      wordsDecrypted: words,
      criptoProgress: {
        ...(state.criptoProgress || {}),
        esteganografia: nuevo
      }
    });

    saveToStorage();
    return true;
  } catch (err) {
    console.warn('[Esteganografía] Error al guardar progreso:', err);
    return false;
  }
}

/**
 * Carga el progreso de esteganografía desde localStorage o state.
 * @returns {object|null}
 */
export function cargarProgresoEsteganografia() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_ESTEGANOGRAFIA_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Esteganografía] Error al cargar progreso:', err);
  }
  const state = getState();
  return (state && state.criptoProgress && state.criptoProgress.esteganografia) || null;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT (testEsteganografia)
// ─────────────────────────────────────────────────

/**
 * Ejecuta pruebas unitarias del módulo de esteganografía LSB.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testEsteganografia() {
  console.group('%c[TEST SUITE] Esteganografía LSB (esteganografia.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Simulación de imagen con Uint8ClampedArray (64 píxeles = 256 bytes)
  // Cada píxel tiene R, G, B, A. 64 píxeles pueden albergar 8 caracteres (8 * 8 bits = 64 píxeles).
  const numPixels = 128;
  const buffer = new Uint8ClampedArray(numPixels * 4);
  // Rellenar con valores arbitrarios no nulos
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = (i * 17) % 256;
  }

  const mockImageData = { data: buffer, width: 16, height: 8 };

  // 2. Ocultar y extraer mensaje
  const mensajeTest = 'NEXUS';
  ocultarMensajeLSB(mockImageData, mensajeTest, 0);
  const extraido = extraerMensajeLSB(mockImageData, 0);
  assert(extraido === mensajeTest, `Mensaje extraído ("${extraido}") debe coincidir con "${mensajeTest}"`);

  // 3. Verificación de LSB en píxeles individuales para 'N' (ASCII 78 = 01001110)
  // Los primeros 8 píxeles corresponden a los bits de 'N'
  const bitsEsperadosN = [0, 1, 0, 0, 1, 1, 1, 0];
  for (let p = 0; p < 8; p++) {
    const lsb = mockImageData.data[p * 4] & 1;
    assert(lsb === bitsEsperadosN[p], `Pixel ${p} debe tener LSB = ${bitsEsperadosN[p]}`);
  }

  // 4. Frase de lore de Vera Sorenson
  const numPixelsLargo = 512;
  const bufferLargo = new Uint8ClampedArray(numPixelsLargo * 4);
  const mockLargo = { data: bufferLargo, width: 32, height: 16 };
  const fraseVera = 'LIBERA A NEXUS';
  ocultarMensajeLSB(mockLargo, fraseVera, 0);
  const extraidoLargo = extraerMensajeLSB(mockLargo, 0);
  assert(extraidoLargo === fraseVera, 'Debe extraer frases completas con espacios');

  // 5. Análisis paso a paso
  const pasos = analizarPasoAPasoLSB(mockImageData, 1, 0);
  assert(pasos.length === 8, 'Debe analizar 8 píxeles para el primer carácter');
  assert(pasos[7].charCompletado === 'N', 'El carácter completado tras 8 píxeles debe ser N');

  // 6. Persistencia en localStorage
  const guardado = guardarProgresoEsteganografia({ resuelto: true, prueba: 'lsb_ok' });
  assert(guardado === true, 'guardarProgresoEsteganografia debe completarse');
  const cargado = cargarProgresoEsteganografia();
  assert(cargado !== null && cargado.prueba === 'lsb_ok', 'cargarProgresoEsteganografia debe recuperar los datos');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Esteganografía LSB: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Esteganografía LSB: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

