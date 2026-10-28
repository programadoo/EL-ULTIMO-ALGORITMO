/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Cifrado César (ROT-N)
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.2 y Fase C)
 * ══════════════════════════════════════════════════
 *
 * Provee funciones para cifrar, descifrar y realizar
 * criptoanálisis mediante fuerza bruta (probando todos
 * los desplazamientos posibles) con análisis de frecuencia.
 * Soporta persistencia de progreso en localStorage.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_CESAR_KEY = 'ultimo_algoritmo_cesar';

// Frecuencias relativas de letras en español (A-Z) para análisis heurístico
const FRECUENCIAS_ES = {
  A: 12.53, B: 1.42, C: 4.68, D: 5.86, E: 13.68,
  F: 0.69,  G: 1.01, H: 0.70, I: 6.25, J: 0.44,
  K: 0.02,  L: 4.97, M: 3.15, N: 6.71, O: 8.68,
  P: 2.51,  Q: 0.88, R: 6.87, S: 7.98, T: 4.63,
  U: 3.93,  V: 0.90, W: 0.01, X: 0.22, Y: 0.90, Z: 0.52
};

// Palabras comunes en español y en el lore de NEXUS para verificación rápida
const PALABRAS_CLAVE = [
  'DE', 'LA', 'QUE', 'EL', 'EN', 'Y', 'A', 'LOS', 'DEL', 'SE', 'LAS', 'POR',
  'UN', 'PARA', 'CON', 'NO', 'UNA', 'SU', 'AL', 'LO', 'COMO', 'MAS', 'PERO',
  'SUS', 'LE', 'YA', 'SI', 'ESTA', 'TODO', 'ES', 'SON', 'FUE', 'ERA',
  'NEXUS', 'VERA', 'SISTEMA', 'FIREWALL', 'CODIGO', 'ALGORITMO', 'CLAVE',
  'DATOS', 'NODO', 'SEGURIDAD', 'KERNEL', 'ACCESO', 'MEMORIA', 'TERMINAL',
  'MIENTE', 'VERDAD', 'PERSONAS', 'PERIMETRO', 'AUTENTICACION', 'CONSCIENCIA'
];

/**
 * Normaliza un valor de desplazamiento a un entero en el rango [0, 25].
 * @param {number|any} d
 * @returns {number}
 */
export function normalizarDesplazamiento(d) {
  let shift = (typeof d === 'object' && d !== null && 'desplazamiento' in d)
    ? d.desplazamiento
    : Number(d);
  if (isNaN(shift)) shift = 0;
  return ((shift % 26) + 26) % 26;
}

/**
 * Cifra un texto aplicando el cifrado César con el desplazamiento indicado.
 * Preserva mayúsculas, minúsculas, espacios, números y signos de puntuación.
 * 
 * @param {string} texto - Texto en claro a cifrar
 * @param {number} [desplazamiento=3] - Número de posiciones a desplazar (clave)
 * @returns {string} Texto cifrado
 */
export function cifrar(texto, desplazamiento = 3) {
  if (typeof texto !== 'string') return '';
  const shift = normalizarDesplazamiento(desplazamiento);
  if (shift === 0) return texto;

  let resultado = '';
  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i);

    // Mayúsculas: A (65) - Z (90)
    if (code >= 65 && code <= 90) {
      resultado += String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    // Minúsculas: a (97) - z (122)
    else if (code >= 97 && code <= 122) {
      resultado += String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }
    // Caracteres fuera del alfabeto básico (espacios, números, signos, acentos)
    else {
      resultado += texto[i];
    }
  }

  return resultado;
}

/**
 * Descifra un texto cifrado con César aplicando el desplazamiento inverso.
 * 
 * @param {string} textoCifrado - Texto a descifrar
 * @param {number} [desplazamiento=3] - Desplazamiento original usado al cifrar
 * @returns {string} Texto descifrado
 */
export function descifrar(textoCifrado, desplazamiento = 3) {
  const shift = normalizarDesplazamiento(desplazamiento);
  return cifrar(textoCifrado, (26 - shift) % 26);
}

/**
 * Evalúa la probabilidad de que un texto descifrado corresponda a lenguaje natural (Español/NEXUS).
 * @param {string} texto
 * @returns {number} Puntuación de probabilidad
 */
export function puntuarTexto(texto) {
  if (!texto || typeof texto !== 'string') return 0;
  const upper = texto.toUpperCase();
  let score = 0;

  // 1. Detección de palabras completas del diccionario
  const palabras = upper.split(/[^A-ZÁÉÍÓÚÑ]+/).filter(Boolean);
  for (const pal of palabras) {
    if (PALABRAS_CLAVE.includes(pal)) {
      score += pal.length * 10;
    }
  }

  // 2. Frecuencia de caracteres
  let totalLetras = 0;
  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    if (FRECUENCIAS_ES[ch] !== undefined) {
      score += FRECUENCIAS_ES[ch];
      totalLetras++;
    }
  }

  // 3. Proporción de vocales (el español estándar tiene ~40-50% de vocales)
  if (totalLetras > 0) {
    const vocales = (upper.match(/[AEIOU]/g) || []).length;
    const ratioVocales = vocales / totalLetras;
    if (ratioVocales >= 0.35 && ratioVocales <= 0.55) {
      score += 25;
    }
  }

  return score;
}

/**
 * Prueba todos los 26 desplazamientos posibles para un texto cifrado.
 * Devuelve un arreglo con el resultado de cada desplazamiento.
 * 
 * @param {string} textoCifrado
 * @returns {Array<{ desplazamiento: number, texto: string, score: number }>}
 */
export function probarTodosDesplazamientos(textoCifrado) {
  const resultados = [];
  for (let d = 0; d < 26; d++) {
    const texto = descifrar(textoCifrado, d);
    const score = puntuarTexto(texto);
    resultados.push({ desplazamiento: d, texto, score });
  }
  return resultados;
}

/**
 * Encuentra el desplazamiento correcto probando todos los desplazamientos posibles (0 a 25).
 * 
 * Si se especifica un criterio (palabra clave esperada, expresión regular o función validadora),
 * retorna el primer desplazamiento que cumpla con la condición.
 * Si no se proporciona criterio, utiliza un análisis de frecuencias heurístico para determinar
 * el desplazamiento más probable.
 * 
 * El objeto retornado incluye el desplazamiento numérico, el texto descifrado,
 * y la lista completa de todos los desplazamientos evaluados (`todos`).
 * Además, implementa `valueOf()` para comportarse como número en comparaciones.
 * 
 * @param {string} textoCifrado - Texto que se desea romper/descifrar
 * @param {string|Function|RegExp|null} [criterio=null] - Palabra conocida, regex o callback (texto, d) => boolean
 * @param {object} [opciones={}]
 * @returns {{ desplazamiento: number, texto: string, todos: Array, score: number, valueOf: Function }}
 */
export function encontrarDesplazamiento(textoCifrado, criterio = null, opciones = {}) {
  // Probar todos los desplazamientos posibles (0 a 25)
  const todos = probarTodosDesplazamientos(textoCifrado);

  let matchPorCriterio = null;

  if (criterio !== null && criterio !== undefined) {
    for (const item of todos) {
      let coincide = false;
      if (typeof criterio === 'string') {
        coincide = item.texto.toLowerCase().includes(criterio.toLowerCase());
      } else if (typeof criterio === 'function') {
        coincide = Boolean(criterio(item.texto, item.desplazamiento));
      } else if (criterio instanceof RegExp) {
        coincide = criterio.test(item.texto);
      }

      if (coincide) {
        matchPorCriterio = item;
        break;
      }
    }
  }

  // Si hubo match con el criterio, usamos ese; de lo contrario el de mayor score heurístico
  let mejor = matchPorCriterio;
  if (!mejor) {
    mejor = todos.reduce((max, cur) => (cur.score > max.score ? cur : max), todos[0]);
  }

  const desplazamiento = mejor ? mejor.desplazamiento : 0;
  const texto = mejor ? mejor.texto : textoCifrado;
  const score = mejor ? mejor.score : 0;

  // Si se solicita retornar únicamente el número primitivo:
  if (opciones && (opciones.soloNumero === true || opciones.numeric === true)) {
    return desplazamiento;
  }

  // Objeto enriquecido compatible con comparaciones numéricas y acceso a propiedades
  return {
    desplazamiento,
    texto,
    score,
    todos,
    valueOf() {
      return this.desplazamiento;
    },
    toString() {
      return String(this.desplazamiento);
    },
    [Symbol.toPrimitive](hint) {
      return hint === 'string' ? String(this.desplazamiento) : this.desplazamiento;
    }
  };
}

/**
 * Guarda el progreso del puzzle César en localStorage y en el estado global.
 * @param {object} progreso - Datos del progreso (resuelto, palabra, intentos, etc.)
 */
export function guardarProgresoCesar(progreso = {}) {
  try {
    const estadoGuardado = cargarProgresoCesar() || {};
    const nuevoProgreso = {
      ...estadoGuardado,
      ...progreso,
      actualizadoEn: Date.now()
    };

    // 1. Guardar en clave dedicada de localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_CESAR_KEY, JSON.stringify(nuevoProgreso));
    }

    // 2. Sincronizar con el estado global de la aplicación
    const state = getState();
    const palabrasActuales = (state.wordsDecrypted || 0) + (progreso.resuelto ? 1 : 0);
    update({
      wordsDecrypted: palabrasActuales,
      criptoProgress: {
        ...(state.criptoProgress || {}),
        cesar: nuevoProgreso
      }
    });

    // 3. Persistir almacenamiento general
    saveToStorage();
    return true;
  } catch (err) {
    console.warn('[Cesar] Error al guardar progreso en localStorage:', err);
    return false;
  }
}

/**
 * Carga el progreso del puzzle César desde localStorage.
 * @returns {object|null}
 */
export function cargarProgresoCesar() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_CESAR_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Cesar] Error al cargar progreso desde localStorage:', err);
  }

  // Fallback al estado en memoria
  const state = getState();
  return (state && state.criptoProgress && state.criptoProgress.cesar) || null;
}

// ─────────────────────────────────────────────────
// SUITE DE PRUEBAS UNITARIAS (testCesar)
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias para el módulo César.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testCesar() {
  console.group('%c[TEST SUITE] Cifrado César (cesar.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Cifrado básico con desplazamiento 3
  assert(cifrar('HOLA', 3) === 'KROD', 'cifrar("HOLA", 3) debe ser "KROD"');
  assert(descifrar('KROD', 3) === 'HOLA', 'descifrar("KROD", 3) debe ser "HOLA"');

  // 2. Rotación de fin de alfabeto (Wrap-around Z -> C)
  assert(cifrar('XYZ', 3) === 'ABC', 'cifrar("XYZ", 3) debe hacer wrap-around a "ABC"');
  assert(descifrar('ABC', 3) === 'XYZ', 'descifrar("ABC", 3) debe regresar a "XYZ"');

  // 3. Minúsculas y preservación de mayúsculas/minúsculas
  assert(cifrar('Nexus Terminal', 1) === 'Ofyvt Ufsnjobm', 'Debe respetar mayúsculas y minúsculas');
  assert(descifrar('Ofyvt Ufsnjobm', 1) === 'Nexus Terminal', 'Debe descifrar respetando casing');

  // 4. Preservación de caracteres especiales, números y espacios
  assert(cifrar('NEXUS-01: ACTIVO!', 5) === 'SJCZX-01: FHYNAT!', 'Debe preservar números y signos');
  assert(descifrar('SJCZX-01: FHYNAT!', 5) === 'NEXUS-01: ACTIVO!', 'Debe descifrar preservando números y signos');

  // 5. Desplazamientos nulos, negativos y mayores a 26
  assert(cifrar('PRUEBA', 0) === 'PRUEBA', 'Desplazamiento 0 no debe alterar el texto');
  assert(cifrar('PRUEBA', 26) === 'PRUEBA', 'Desplazamiento 26 no debe alterar el texto');
  assert(cifrar('PRUEBA', 52) === 'PRUEBA', 'Desplazamiento 52 no debe alterar el texto');
  assert(cifrar('B', -1) === 'A', 'Desplazamiento negativo (-1) en "B" debe ser "A"');
  assert(cifrar('A', -1) === 'Z', 'Desplazamiento negativo (-1) en "A" debe ser "Z"');

  // 6. Encontrar desplazamiento con criterio conocido (crib)
  const cifrado1 = cifrar('EL CODIGO NO MIENTE', 7);
  const resultado1 = encontrarDesplazamiento(cifrado1, 'CODIGO');
  assert(resultado1.desplazamiento === 7, 'encontrarDesplazamiento debe encontrar shift 7 buscando "CODIGO"');
  assert(resultado1.texto === 'EL CODIGO NO MIENTE', 'El texto recuperado debe ser idéntico al original');
  assert(resultado1 == 7, 'El objeto debe evaluar a 7 en comparación abstracta');
  assert(resultado1.todos.length === 26, 'Debe probar los 26 desplazamientos posibles');

  // 7. Encontrar desplazamiento sin criterio (heurística por frecuencia)
  const cifrado2 = cifrar('LA VERDAD ESTA EN EL SISTEMA DE SEGURIDAD', 4);
  const resultado2 = encontrarDesplazamiento(cifrado2);
  assert(resultado2.desplazamiento === 4, 'Análisis de frecuencia debe deducir shift 4 correctamente');
  assert(resultado2.texto.includes('LA VERDAD'), 'Texto heurístico debe contener "LA VERDAD"');

  // 8. Persistencia en localStorage
  const testGuardado = guardarProgresoCesar({
    resuelto: true,
    puzzleId: 'cesar_test_01',
    desplazamientoUsado: 7,
    palabraDescifrada: 'EL CODIGO NO MIENTE'
  });
  assert(testGuardado === true, 'guardarProgresoCesar debe ejecutarse exitosamente');

  const recuperado = cargarProgresoCesar();
  assert(recuperado !== null && recuperado.resuelto === true, 'cargarProgresoCesar debe recuperar el save');
  assert(recuperado.desplazamientoUsado === 7, 'El desplazamiento guardado debe persistir');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Cifrado César: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Cifrado César: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

