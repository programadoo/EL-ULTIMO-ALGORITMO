/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Conversión Hexadecimal Bidireccional
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.4 y Fase C)
 * ══════════════════════════════════════════════════
 *
 * Funciones de codificación y decodificación de texto a hexadecimal
 * y viceversa, con análisis paso a paso para herramientas visuales.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_HEX_KEY = 'ultimo_algoritmo_hex';

/**
 * Convierte un número decimal a representación hexadecimal con padding de 2 caracteres.
 * @param {number} num - Entero (0..255)
 * @param {number} [padding=2] - Longitud mínima
 * @returns {string} Cadena hexadecimal en mayúsculas (ej. "48", "6F")
 */
export function numeroAHex(num, padding = 2) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  return n.toString(16).toUpperCase().padStart(padding, '0');
}

/**
 * Convierte una cadena hexadecimal a número entero decimal.
 * @param {string} hex - Cadena hexadecimal
 * @returns {number}
 */
export function hexANumero(hex) {
  if (typeof hex !== 'string') return 0;
  const limpio = hex.replace(/[^0-9a-fA-F]/g, '');
  return parseInt(limpio, 16) || 0;
}

/**
 * Convierte una cadena de texto a código hexadecimal (bytes ASCII).
 * @param {string} texto - Texto a codificar
 * @param {string} [separador=' '] - Delimitador entre bytes
 * @returns {string} Bytes hexadecimales (ej. "48 6F 6C 61" para "Hola")
 */
export function textoAHex(texto, separador = ' ') {
  if (typeof texto !== 'string') return '';
  const bytes = [];
  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i);
    bytes.push(numeroAHex(code, 2));
  }
  return bytes.join(separador);
}

/**
 * Convierte una secuencia de código hexadecimal a texto legible.
 * Soporta entradas separadas por espacios, prefijos '0x', dos puntos, o bloques contiguos.
 * @param {string} hex - Secuencia hexadecimal
 * @returns {string} Texto decodificado
 */
export function hexATexto(hex) {
  if (typeof hex !== 'string') return '';

  let grupos = [];
  const normalizado = hex.trim();

  // Si contiene separadores o prefijos 0x
  if (/[\s,:_\-]/.test(normalizado) || normalizado.toLowerCase().includes('0x')) {
    grupos = normalizado
      .replace(/0x/gi, ' ')
      .split(/[\s,:_\-]+/)
      .filter(Boolean);
  } else {
    // Si es un bloque contiguo sin delimitadores, tomar pares de caracteres
    const limpio = normalizado.replace(/[^0-9a-fA-F]/g, '');
    for (let i = 0; i < limpio.length; i += 2) {
      grupos.push(limpio.slice(i, i + 2));
    }
  }

  let resultado = '';
  for (const byteStr of grupos) {
    if (!byteStr) continue;
    const code = parseInt(byteStr, 16);
    if (!isNaN(code) && code > 0) {
      resultado += String.fromCharCode(code);
    }
  }

  return resultado;
}

/**
 * Genera un análisis educativo paso a paso para la visualización interactiva.
 * Descompone cada carácter en su código ASCII, sus dos nibbles (alto y bajo),
 * y la fórmula de conversión en base 16.
 * 
 * @param {string} entrada - Texto o secuencia hexadecimal
 * @param {boolean} [esHex=false] - Indica si la entrada ya es hexadecimal
 * @returns {Array<{ caracter: string, ascii: number, hex: string, nibbleAlto: string, valAlto: number, nibbleBajo: string, valBajo: number, ecuacion: string, binario: string }>}
 */
export function analizarPasoAPasoHex(entrada, esHex = false) {
  let texto = '';
  if (esHex) {
    texto = hexATexto(entrada);
  } else {
    texto = String(entrada || '');
  }

  const pasos = [];

  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    const code = texto.charCodeAt(i);
    const hex = numeroAHex(code, 2);

    const nibbleAltoChar = hex[0];
    const nibbleBajoChar = hex[1];

    const valAlto = parseInt(nibbleAltoChar, 16);
    const valBajo = parseInt(nibbleBajoChar, 16);

    const binario = code.toString(2).padStart(8, '0');
    const binFormateado = `${binario.slice(0, 4)} ${binario.slice(4)}`;

    const ecuacion = `(${valAlto} × 16) + (${valBajo} × 1) = ${valAlto * 16} + ${valBajo} = ${code} ('${ch}')`;

    pasos.push({
      indice: i,
      caracter: ch,
      ascii: code,
      hex,
      nibbleAlto: nibbleAltoChar,
      valAlto,
      prodAlto: valAlto * 16,
      nibbleBajo: nibbleBajoChar,
      valBajo,
      prodBajo: valBajo,
      ecuacion,
      binario: binFormateado
    });
  }

  return pasos;
}

/**
 * Guarda el progreso de puzzles hexadecimales en localStorage y sincroniza con el state.
 * @param {object} progreso
 * @returns {boolean}
 */
export function guardarProgresoHex(progreso = {}) {
  try {
    const previo = cargarProgresoHex() || {};
    const nuevo = {
      ...previo,
      ...progreso,
      actualizadoEn: Date.now()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_HEX_KEY, JSON.stringify(nuevo));
    }

    const state = getState();
    const words = (state.wordsDecrypted || 0) + (progreso.resuelto ? 1 : 0);
    update({
      wordsDecrypted: words,
      criptoProgress: {
        ...(state.criptoProgress || {}),
        hex: nuevo
      }
    });

    saveToStorage();
    return true;
  } catch (err) {
    console.warn('[Hex] Error al guardar progreso:', err);
    return false;
  }
}

/**
 * Carga el progreso de puzzles hexadecimales desde localStorage.
 * @returns {object|null}
 */
export function cargarProgresoHex() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_HEX_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Hex] Error al cargar progreso:', err);
  }
  const state = getState();
  return (state && state.criptoProgress && state.criptoProgress.hex) || null;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT (testHex)
// ─────────────────────────────────────────────────

/**
 * Ejecuta pruebas unitarias del módulo hexadecimal.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testHex() {
  console.group('%c[TEST SUITE] Hexadecimal (hex.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Conversión de número a hex y viceversa
  assert(numeroAHex(72, 2) === '48', '72 debe ser 48 en hexadecimal');
  assert(hexANumero('48') === 72, '48 debe convertirse a 72');
  assert(numeroAHex(255, 2) === 'FF', '255 debe ser FF');
  assert(numeroAHex(10, 2) === '0A', '10 debe ser 0A con padding 2');

  // 2. Conversión texto a hex ("Hola" del spec: 48 6F 6C 61)
  const hexHola = textoAHex('Hola');
  assert(hexHola === '48 6F 6C 61', 'Hola debe ser "48 6F 6C 61" exactamente como en el spec');

  // 3. Conversión hex a texto
  assert(hexATexto('48 6F 6C 61') === 'Hola', 'Debe decodificar "48 6F 6C 61" a "Hola"');
  assert(hexATexto('486F6C61') === 'Hola', 'Debe decodificar bloque contiguo sin espacios');
  assert(hexATexto('0x48, 0x6F, 0x6C, 0x61') === 'Hola', 'Debe soportar prefijos 0x y comas');

  // 4. Frase de lore de NEXUS
  const frase = 'VERA';
  const hexFrase = textoAHex(frase);
  assert(hexATexto(hexFrase) === frase, 'Bidireccionalidad completa con palabras en mayúsculas');

  // 5. Análisis paso a paso
  const pasos = analizarPasoAPasoHex('H');
  assert(pasos.length === 1, 'Debe retornar 1 paso para "H"');
  assert(pasos[0].ascii === 72, 'Código ASCII de "H" debe ser 72');
  assert(pasos[0].hex === '48', 'Hex de "H" debe ser 48');
  assert(pasos[0].nibbleAlto === '4', 'Nibble alto debe ser 4');
  assert(pasos[0].nibbleBajo === '8', 'Nibble bajo debe ser 8');
  assert(pasos[0].prodAlto === 64, '4 × 16 debe ser 64');
  assert(pasos[0].prodBajo === 8, '8 × 1 debe ser 8');

  // 6. Persistencia en localStorage
  const saved = guardarProgresoHex({ resuelto: true, prueba: 'hex_ok' });
  assert(saved === true, 'guardarProgresoHex debe completarse con éxito');
  const loaded = cargarProgresoHex();
  assert(loaded !== null && loaded.prueba === 'hex_ok', 'cargarProgresoHex debe recuperar los datos');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Hexadecimal: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Hexadecimal: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

