/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Conversión Binaria Bidireccional
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.4 y Fase C)
 * ══════════════════════════════════════════════════
 *
 * Funciones de codificación y decodificación de texto a binario
 * y viceversa, con análisis paso a paso para herramientas visuales.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_BINARIO_KEY = 'ultimo_algoritmo_binario';

/**
 * Convierte un número decimal a representación binaria con padding configurable.
 * @param {number} num - Entero (0..255)
 * @param {number} [bits=8] - Longitud en bits
 * @returns {string} Cadena binaria (ej. "01001000")
 */
export function numeroABinario(num, bits = 8) {
  const n = Math.max(0, parseInt(num, 10) || 0);
  return n.toString(2).padStart(bits, '0');
}

/**
 * Convierte una cadena binaria a número entero decimal.
 * @param {string} binario - Cadena de ceros y unos
 * @returns {number}
 */
export function binarioANumero(binario) {
  if (typeof binario !== 'string') return 0;
  const limpio = binario.replace(/[^01]/g, '');
  return parseInt(limpio, 2) || 0;
}

/**
 * Convierte una cadena de texto a su representación en código binario (ASCII de 8 bits).
 * @param {string} texto - Texto a codificar
 * @param {string} [separador=' '] - Delimitador entre bytes
 * @returns {string} Bytes binarios separados
 */
export function textoABinario(texto, separador = ' ') {
  if (typeof texto !== 'string') return '';
  const bytes = [];
  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i);
    bytes.push(numeroABinario(code, 8));
  }
  return bytes.join(separador);
}

/**
 * Convierte una secuencia de código binario a texto legible.
 * Soporta entradas separadas por espacios, comas, o sin delimitador (múltiplos de 8 bits).
 * @param {string} binario - Secuencia binaria
 * @returns {string} Texto decodificado
 */
export function binarioATexto(binario) {
  if (typeof binario !== 'string') return '';

  let grupos = [];
  // Si contiene espacios o separadores visibles
  if (/[\s,_\-]/.test(binario.trim())) {
    grupos = binario.trim().split(/[\s,_\-]+/).filter(Boolean);
  } else {
    // Si es un bloque contiguo de bits, dividir cada 8 bits
    const limpio = binario.replace(/[^01]/g, '');
    for (let i = 0; i < limpio.length; i += 8) {
      grupos.push(limpio.slice(i, i + 8));
    }
  }

  let resultado = '';
  for (const grupo of grupos) {
    if (!grupo) continue;
    const code = parseInt(grupo, 2);
    if (!isNaN(code) && code > 0) {
      resultado += String.fromCharCode(code);
    }
  }

  return resultado;
}

/**
 * Genera un análisis educativo paso a paso para la visualización interactiva.
 * Descompone cada carácter en su código ASCII, sus 8 bits y las potencias de base 2.
 * 
 * @param {string} entrada - Texto o secuencia binaria
 * @param {boolean} [esBinario=false] - Indica si la entrada ya es binaria
 * @returns {Array<{ caracter: string, ascii: number, binario: string, bits: number[], potencias: Array<{ pot: number, bit: number, activo: boolean, valor: number }>, ecuacion: string }>}
 */
export function analizarPasoAPasoBinario(entrada, esBinario = false) {
  let texto = '';
  if (esBinario) {
    texto = binarioATexto(entrada);
  } else {
    texto = String(entrada || '');
  }

  const pasos = [];
  const POTENCIAS_2 = [128, 64, 32, 16, 8, 4, 2, 1];

  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    const code = texto.charCodeAt(i);
    const bin = numeroABinario(code, 8);
    const bits = bin.split('').map(b => parseInt(b, 10));

    const potencias = POTENCIAS_2.map((pot, idx) => {
      const bit = bits[idx];
      return {
        pot,
        bit,
        activo: bit === 1,
        valor: bit === 1 ? pot : 0
      };
    });

    const sumandos = potencias.filter(p => p.activo).map(p => p.pot);
    const ecuacion = sumandos.length > 0
      ? `${sumandos.join(' + ')} = ${code} ('${ch}')`
      : `0 = 0`;

    pasos.push({
      indice: i,
      caracter: ch,
      ascii: code,
      binario: bin,
      bits,
      potencias,
      ecuacion
    });
  }

  return pasos;
}

/**
 * Guarda el progreso de puzzles binarios en localStorage y sincroniza con el state.
 * @param {object} progreso
 * @returns {boolean}
 */
export function guardarProgresoBinario(progreso = {}) {
  try {
    const previo = cargarProgresoBinario() || {};
    const nuevo = {
      ...previo,
      ...progreso,
      actualizadoEn: Date.now()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_BINARIO_KEY, JSON.stringify(nuevo));
    }

    const state = getState();
    const words = (state.wordsDecrypted || 0) + (progreso.resuelto ? 1 : 0);
    update({
      wordsDecrypted: words,
      criptoProgress: {
        ...(state.criptoProgress || {}),
        binario: nuevo
      }
    });

    saveToStorage();
    return true;
  } catch (err) {
    console.warn('[Binario] Error al guardar progreso:', err);
    return false;
  }
}

/**
 * Carga el progreso de puzzles binarios desde localStorage.
 * @returns {object|null}
 */
export function cargarProgresoBinario() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_BINARIO_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Binario] Error al cargar progreso:', err);
  }
  const state = getState();
  return (state && state.criptoProgress && state.criptoProgress.binario) || null;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT (testBinario)
// ─────────────────────────────────────────────────

/**
 * Ejecuta pruebas unitarias del módulo binario.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testBinario() {
  console.group('%c[TEST SUITE] Binario (binario.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Conversión de número a binario y viceversa
  assert(numeroABinario(72, 8) === '01001000', '72 debe ser 01001000 en 8 bits');
  assert(binarioANumero('01001000') === 72, '01001000 debe convertirse a 72');
  assert(numeroABinario(0, 8) === '00000000', '0 debe ser 00000000');
  assert(numeroABinario(255, 8) === '11111111', '255 debe ser 11111111');

  // 2. Conversión texto a binario ("Hola" del spec)
  const binHola = textoABinario('Hola');
  assert(binHola === '01001000 01101111 01101100 01100001', 'Hola debe coincidir con el ejemplo del spec');

  // 3. Conversión binario a texto
  assert(binarioATexto('01001000 01101111 01101100 01100001') === 'Hola', 'Debe decodificar "Hola" correctamente');
  assert(binarioATexto('01001000011011110110110001100001') === 'Hola', 'Debe decodificar bloque contiguo sin espacios');

  // 4. Frase de Vera Sorenson
  const frase = 'NEXUS';
  const binFrase = textoABinario(frase);
  assert(binarioATexto(binFrase) === frase, 'Bidireccionalidad en palabras completas');

  // 5. Análisis paso a paso
  const pasos = analizarPasoAPasoBinario('H');
  assert(pasos.length === 1, 'Debe retornar 1 paso para "H"');
  assert(pasos[0].ascii === 72, 'El código ASCII de "H" debe ser 72');
  assert(pasos[0].binario === '01001000', 'El binario de "H" debe ser 01001000');
  assert(pasos[0].potencias.find(p => p.pot === 64).activo === true, 'Potencia 64 debe estar activa');
  assert(pasos[0].potencias.find(p => p.pot === 8).activo === true, 'Potencia 8 debe estar activa');
  assert(pasos[0].potencias.find(p => p.pot === 32).activo === false, 'Potencia 32 debe estar inactiva');

  // 6. Persistencia en localStorage
  const saved = guardarProgresoBinario({ resuelto: true, prueba: 'bin_ok' });
  assert(saved === true, 'guardarProgresoBinario debe completarse');
  const loaded = cargarProgresoBinario();
  assert(loaded !== null && loaded.prueba === 'bin_ok', 'cargarProgresoBinario debe recuperar los datos');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Binario: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Binario: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

