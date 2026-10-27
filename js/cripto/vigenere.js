/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Cifrado Vigenère
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.3 y Prompt A3)
 * ══════════════════════════════════════════════════
 *
 * Provee funciones para cifrar y descifrar mediante el cifrado
 * polialfabético de Vigenère, alineación de clave por caracteres alfabéticos,
 * análisis paso a paso y persistencia de progreso en localStorage.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_VIGENERE_KEY = 'ultimo_algoritmo_vigenere';

/**
 * Normaliza y limpia una clave de Vigenère, asegurando que contenga sólo letras A-Z en mayúsculas.
 * @param {string} clave
 * @returns {string} Clave limpia (mínimo 1 carácter, 'A' por defecto)
 */
export function limpiarClave(clave) {
  if (typeof clave !== 'string') return 'A';
  const limpia = clave.toUpperCase().replace(/[^A-Z]/g, '');
  return limpia.length > 0 ? limpia : 'A';
}

/**
 * Cifra un texto utilizando el cifrado de Vigenère y la clave alfabética proporcionada.
 * Preserva mayúsculas, minúsculas, espacios, signos y puntuación.
 * El índice de la clave sólo avanza al encontrar caracteres alfabéticos.
 * 
 * @param {string} texto - Texto en claro a cifrar
 * @param {string} clave - Clave alfabética (ej. "LEMON")
 * @returns {string} Texto cifrado
 */
export function cifrar(texto, clave) {
  if (typeof texto !== 'string') return '';
  const key = limpiarClave(clave);
  let keyIdx = 0;
  let resultado = '';

  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i);

    // Mayúsculas: A (65) - Z (90)
    if (code >= 65 && code <= 90) {
      const shift = key.charCodeAt(keyIdx % key.length) - 65;
      resultado += String.fromCharCode(((code - 65 + shift) % 26) + 65);
      keyIdx++;
    }
    // Minúsculas: a (97) - z (122)
    else if (code >= 97 && code <= 122) {
      const shift = key.charCodeAt(keyIdx % key.length) - 65;
      resultado += String.fromCharCode(((code - 97 + shift) % 26) + 97);
      keyIdx++;
    }
    // No alfabéticos
    else {
      resultado += texto[i];
    }
  }

  return resultado;
}

/**
 * Descifra un texto cifrado con Vigenère utilizando la clave alfabética.
 * 
 * @param {string} textoCifrado - Texto a descifrar
 * @param {string} clave - Clave alfabética original
 * @returns {string} Texto descifrado
 */
export function descifrar(textoCifrado, clave) {
  if (typeof textoCifrado !== 'string') return '';
  const key = limpiarClave(clave);
  let keyIdx = 0;
  let resultado = '';

  for (let i = 0; i < textoCifrado.length; i++) {
    const code = textoCifrado.charCodeAt(i);

    // Mayúsculas
    if (code >= 65 && code <= 90) {
      const shift = key.charCodeAt(keyIdx % key.length) - 65;
      resultado += String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      keyIdx++;
    }
    // Minúsculas
    else if (code >= 97 && code <= 122) {
      const shift = key.charCodeAt(keyIdx % key.length) - 65;
      resultado += String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
      keyIdx++;
    }
    // No alfabéticos
    else {
      resultado += textoCifrado[i];
    }
  }

  return resultado;
}

/**
 * Genera un análisis educativo paso a paso del proceso de cifrado o descifrado.
 * 
 * @param {string} texto - Texto de entrada
 * @param {string} clave - Clave alfabética
 * @param {boolean} [esCifrado=true] - true para cifrado, false para descifrado
 * @returns {Array<object>} Desglose de cada carácter con operaciones matemáticas
 */
export function analizarPasoAPasoVigenere(texto, clave, esCifrado = true) {
  if (typeof texto !== 'string') return [];
  const key = limpiarClave(clave);
  const pasos = [];
  let keyIdx = 0;

  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    const code = texto.charCodeAt(i);
    const esMayus = code >= 65 && code <= 90;
    const esMinus = code >= 97 && code <= 122;
    const esLetra = esMayus || esMinus;

    if (esLetra) {
      const base = esMayus ? 65 : 97;
      const kChar = key[keyIdx % key.length];
      const shift = kChar.charCodeAt(0) - 65;
      const valOriginal = code - base;
      const valResultado = esCifrado
        ? (valOriginal + shift) % 26
        : (valOriginal - shift + 26) % 26;
      const resChar = String.fromCharCode(valResultado + base);
      const formula = esCifrado
        ? `(${valOriginal} + ${shift}) mod 26 = ${valResultado} ('${resChar}')`
        : `(${valOriginal} - ${shift} + 26) mod 26 = ${valResultado} ('${resChar}')`;

      pasos.push({
        indice: i,
        caracter: ch,
        esLetra: true,
        charOriginal: ch,
        charClave: kChar,
        shift,
        valOriginal,
        valResultado,
        charResultado: resChar,
        formula
      });
      keyIdx++;
    } else {
      pasos.push({
        indice: i,
        caracter: ch,
        esLetra: false,
        charOriginal: ch,
        charClave: '-',
        shift: 0,
        valOriginal: code,
        valResultado: code,
        charResultado: ch,
        formula: 'Sin cambio (no alfabético)'
      });
    }
  }

  return pasos;
}

/**
 * Guarda el progreso de puzzles Vigenère en localStorage y actualiza state.
 * @param {object} progreso
 * @returns {boolean}
 */
export function guardarProgresoVigenere(progreso = {}) {
  try {
    const previo = cargarProgresoVigenere() || {};
    const nuevo = {
      ...previo,
      ...progreso,
      actualizadoEn: Date.now()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_VIGENERE_KEY, JSON.stringify(nuevo));
    }

    const state = getState();
    const words = (state.wordsDecrypted || 0) + (progreso.resuelto ? 1 : 0);
    update({
      wordsDecrypted: words,
      criptoProgress: {
        ...(state.criptoProgress || {}),
        vigenere: nuevo
      }
    });

    saveToStorage();
    return true;
  } catch (err) {
    console.warn('[Vigenere] Error al guardar progreso:', err);
    return false;
  }
}

/**
 * Carga el progreso de puzzles Vigenère desde localStorage o state.
 * @returns {object|null}
 */
export function cargarProgresoVigenere() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_VIGENERE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Vigenere] Error al cargar progreso:', err);
  }
  const state = getState();
  return (state && state.criptoProgress && state.criptoProgress.vigenere) || null;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT (testVigenere)
// ─────────────────────────────────────────────────

/**
 * Ejecuta pruebas unitarias del módulo Vigenère.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testVigenere() {
  console.group('%c[TEST SUITE] Vigenère (vigenere.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Limpieza de clave
  assert(limpiarClave('lemon') === 'LEMON', 'limpiarClave debe convertir a mayúsculas');
  assert(limpiarClave('L-E-M-O-N 123!') === 'LEMON', 'limpiarClave debe ignorar símbolos y números');
  assert(limpiarClave('') === 'A', 'Clave vacía debe ser A por defecto');

  // 2. Ejemplo oficial del SPEC_3AVANZADO.MD: ATTACKATDAWN + LEMON = LXFOPVEFRNHR
  const textoPlanoSpec = 'ATTACKATDAWN';
  const claveSpec = 'LEMON';
  const cifradoSpec = cifrar(textoPlanoSpec, claveSpec);
  assert(cifradoSpec === 'LXFOPVEFRNHR', 'ATTACKATDAWN con clave LEMON debe dar LXFOPVEFRNHR exactamente como en el spec');

  // 3. Descifrado oficial del spec
  const descifradoSpec = descifrar('LXFOPVEFRNHR', 'LEMON');
  assert(descifradoSpec === 'ATTACKATDAWN', 'LXFOPVEFRNHR con clave LEMON debe descifrar a ATTACKATDAWN');

  // 4. Preservación de mayúsculas, minúsculas y caracteres especiales
  const textoMixto = 'Attack at Dawn, Agent 007!';
  const cifradoMixto = cifrar(textoMixto, 'Lemon');
  const descifradoMixto = descifrar(cifradoMixto, 'Lemon');
  assert(descifradoMixto === textoMixto, 'Debe preservar mayúsculas, minúsculas, espacios y puntuación');

  // 5. Análisis paso a paso
  const pasos = analizarPasoAPasoVigenere('AT', 'LE', true);
  assert(pasos.length === 2, 'analizarPasoAPasoVigenere debe generar 2 pasos');
  assert(pasos[0].charClave === 'L', "Primer carácter de clave debe ser 'L'");
  assert(pasos[0].charResultado === 'L', "A (0) + L (11) debe ser L");
  assert(pasos[1].charClave === 'E', "Segundo carácter de clave debe ser 'E'");
  assert(pasos[1].charResultado === 'X', "T (19) + E (4) debe ser X (23)");

  // 6. Persistencia
  const guardado = guardarProgresoVigenere({ resuelto: true, prueba: 'vigenere_ok' });
  assert(guardado === true, 'guardarProgresoVigenere debe retornar true');
  const cargado = cargarProgresoVigenere();
  assert(cargado !== null && cargado.prueba === 'vigenere_ok', 'cargarProgresoVigenere debe recuperar el progreso');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Vigenère: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Vigenère: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

