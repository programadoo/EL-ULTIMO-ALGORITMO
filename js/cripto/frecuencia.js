/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Análisis de Frecuencia y Sustitución Simple
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.5 y Prompt A4)
 * ══════════════════════════════════════════════════
 *
 * Provee herramientas para analizar la distribución estadística de letras
 * en un texto cifrado, generar gráficos de barras visuales comparativas
 * contra el idioma español, y ejecutar cifrado/descifrado por sustitución monoalfabética.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_FRECUENCIA_KEY = 'ultimo_algoritmo_frecuencia';

// Frecuencias relativas de letras en el idioma español (%)
export const FRECUENCIAS_REFERENCIA_ES = {
  E: 13.68, A: 12.53, O: 8.68, S: 7.98, R: 6.87,
  N: 6.71,  I: 6.25,  D: 5.86, L: 4.97, C: 4.68,
  T: 4.63,  U: 3.93,  M: 3.15, P: 2.51, B: 1.42,
  G: 1.01,  V: 0.90,  Y: 0.90, Q: 0.88, H: 0.70,
  F: 0.69,  Z: 0.52,  J: 0.44, X: 0.22, W: 0.01,
  K: 0.02
};

const ALFABETO_BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Analiza la frecuencia absoluta y porcentual de cada letra en un texto.
 * 
 * @param {string} texto - Texto a analizar
 * @returns {{ total: number, conteos: Object<string, number>, porcentajes: Object<string, number>, ordenadas: Array<{ letra: string, count: number, porcentaje: number, porcentajeRef: number }> }}
 */
export function analizarFrecuencia(texto) {
  if (typeof texto !== 'string') {
    return { total: 0, conteos: {}, porcentajes: {}, ordenadas: [] };
  }

  const limpio = texto.toUpperCase().replace(/[^A-Z]/g, '');
  const total = limpio.length;
  const conteos = {};

  for (let i = 0; i < ALFABETO_BASE.length; i++) {
    conteos[ALFABETO_BASE[i]] = 0;
  }

  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i];
    conteos[ch] = (conteos[ch] || 0) + 1;
  }

  const porcentajes = {};
  const ordenadas = [];

  for (let i = 0; i < ALFABETO_BASE.length; i++) {
    const ch = ALFABETO_BASE[i];
    const count = conteos[ch];
    const pct = total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;
    porcentajes[ch] = pct;
    ordenadas.push({
      letra: ch,
      count,
      porcentaje: pct,
      porcentajeRef: FRECUENCIAS_REFERENCIA_ES[ch] || 0
    });
  }

  // Ordenar por porcentaje observado descendente
  ordenadas.sort((a, b) => b.porcentaje - a.porcentaje);

  return { total, conteos, porcentajes, ordenadas };
}

/**
 * Genera una representación de barras visuales en formato texto/ASCII para la terminal.
 * 
 * @param {string} texto
 * @param {number} [anchoMax=24]
 * @returns {Array<string>} Líneas con las barras gráficas
 */
export function generarBarrasVisualesTexto(texto, anchoMax = 24) {
  const { total, ordenadas } = analizarFrecuencia(texto);
  if (total === 0) return ['[!] No se encontraron caracteres alfabéticos para analizar.'];

  const lineas = [
    `ANÁLISIS ESTADÍSTICO DE FRECUENCIA // TOTAL LETRAS: ${total}`,
    '─────────────────────────────────────────────────────────────────',
    ' Letra | % Obs   | Gráfico de Frecuencia    | % Ref ES'
  ];

  const maxPct = Math.max(...ordenadas.map(o => o.porcentaje), 1);

  ordenadas.filter(o => o.count > 0).forEach(item => {
    const longitud = Math.round((item.porcentaje / maxPct) * anchoMax);
    const barra = '█'.repeat(longitud).padEnd(anchoMax, '░');
    const letraFmt = `  ${item.letra}  `;
    const pctObsFmt = `${item.porcentaje.toFixed(1)}%`.padStart(6, ' ');
    const pctRefFmt = `${item.porcentajeRef.toFixed(1)}%`.padStart(6, ' ');

    lineas.push(`${letraFmt}| ${pctObsFmt} | [${barra}] | ${pctRefFmt}`);
  });

  lineas.push('─────────────────────────────────────────────────────────────────');
  return lineas;
}

/**
 * Cifra un texto aplicando una sustitución monoalfabética simple.
 * @param {string} texto - Texto en claro
 * @param {Object<string, string>|string} mapaOSustituto - Mapeo de A-Z o alfabeto de 26 letras permutadas
 * @returns {string} Texto cifrado
 */
export function cifrarSustitucion(texto, mapaOSustituto) {
  if (typeof texto !== 'string') return '';
  const mapa = construirMapaDirecto(mapaOSustituto);

  let resultado = '';
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    const upper = ch.toUpperCase();
    if (mapa[upper]) {
      const cifrado = mapa[upper];
      resultado += (ch === upper) ? cifrado : cifrado.toLowerCase();
    } else {
      resultado += ch;
    }
  }

  return resultado;
}

/**
 * Descifra un texto cifrado por sustitución monoalfabética simple.
 * @param {string} textoCifrado
 * @param {Object<string, string>|string} mapaOSustituto
 * @returns {string} Texto descifrado
 */
export function descifrarSustitucion(textoCifrado, mapaOSustituto) {
  if (typeof textoCifrado !== 'string') return '';
  const mapaDirecto = construirMapaDirecto(mapaOSustituto);
  const mapaInverso = {};

  for (const [origen, destino] of Object.entries(mapaDirecto)) {
    mapaInverso[destino] = origen;
  }

  let resultado = '';
  for (let i = 0; i < textoCifrado.length; i++) {
    const ch = textoCifrado[i];
    const upper = ch.toUpperCase();
    if (mapaInverso[upper]) {
      const descifrado = mapaInverso[upper];
      resultado += (ch === upper) ? descifrado : descifrado.toLowerCase();
    } else {
      resultado += ch;
    }
  }

  return resultado;
}

/**
 * Aplica una sustitución parcial a un texto cifrado, útil para hipótesis del jugador.
 * @param {string} textoCifrado
 * @param {Object<string, string>} hipotesis - Ej: { 'W': 'E', 'Q': 'A' }
 * @returns {string}
 */
export function aplicarSustitucionParcial(textoCifrado, hipotesis = {}) {
  if (typeof textoCifrado !== 'string') return '';
  let res = '';

  for (let i = 0; i < textoCifrado.length; i++) {
    const ch = textoCifrado[i];
    const upper = ch.toUpperCase();
    if (hipotesis[upper]) {
      const repl = hipotesis[upper];
      res += (ch === upper) ? repl : repl.toLowerCase();
    } else {
      res += ch;
    }
  }

  return res;
}

/**
 * Normaliza cualquier formato de clave de sustitución a un objeto { A: 'X', B: 'Y', ... }.
 * @private
 */
function construirMapaDirecto(mapaOSustituto) {
  const mapa = {};
  if (typeof mapaOSustituto === 'string') {
    const alfabetoClave = mapaOSustituto.toUpperCase().replace(/[^A-Z]/g, '');
    for (let i = 0; i < ALFABETO_BASE.length; i++) {
      const orig = ALFABETO_BASE[i];
      const dest = alfabetoClave[i] || orig;
      mapa[orig] = dest;
    }
  } else if (typeof mapaOSustituto === 'object' && mapaOSustituto !== null) {
    for (const [k, v] of Object.entries(mapaOSustituto)) {
      mapa[k.toUpperCase()] = String(v).toUpperCase();
    }
  }
  return mapa;
}

/**
 * Guarda el progreso de puzzles de análisis de frecuencia en localStorage.
 * @param {object} progreso
 * @returns {boolean}
 */
export function guardarProgresoFrecuencia(progreso = {}) {
  try {
    const previo = cargarProgresoFrecuencia() || {};
    const nuevo = {
      ...previo,
      ...progreso,
      actualizadoEn: Date.now()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_FRECUENCIA_KEY, JSON.stringify(nuevo));
    }

    const state = getState();
    const words = (state.wordsDecrypted || 0) + (progreso.resuelto ? 1 : 0);
    update({
      wordsDecrypted: words,
      criptoProgress: {
        ...(state.criptoProgress || {}),
        frecuencia: nuevo
      }
    });

    saveToStorage();
    return true;
  } catch (err) {
    console.warn('[Frecuencia] Error al guardar progreso:', err);
    return false;
  }
}

/**
 * Carga el progreso de puzzles de análisis de frecuencia desde localStorage o state.
 * @returns {object|null}
 */
export function cargarProgresoFrecuencia() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_FRECUENCIA_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Frecuencia] Error al cargar progreso:', err);
  }
  const state = getState();
  return (state && state.criptoProgress && state.criptoProgress.frecuencia) || null;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT (testFrecuencia)
// ─────────────────────────────────────────────────

/**
 * Ejecuta pruebas unitarias del módulo de análisis de frecuencia.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testFrecuencia() {
  console.group('%c[TEST SUITE] Análisis de Frecuencia (frecuencia.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Conteo de frecuencias básicas
  const res = analizarFrecuencia('AAAA BBB CC D');
  assert(res.total === 10, 'Total de letras debe ser 10');
  assert(res.conteos.A === 4, "A debe aparecer 4 veces");
  assert(res.conteos.B === 3, "B debe aparecer 3 veces");
  assert(res.porcentajes.A === 40, "A debe ser el 40%");
  assert(res.ordenadas[0].letra === 'A', "Letra más frecuente debe ser A");
  assert(res.ordenadas[1].letra === 'B', "Segunda letra debe ser B");

  // 2. Generación de barras visuales en formato texto
  const barras = generarBarrasVisualesTexto('HOLA MUNDO');
  assert(barras.length > 3, 'Debe generar encabezados y líneas de gráfico');
  assert(barras.some(l => l.includes('█')), 'Debe contener caracteres de bloque');

  // 3. Sustitución monoalfabética simple
  const alfabetoCifrado = 'QWERTYUIOPASDFGHJKLZXCVBNM'; // Teclado QWERTY como clave de sustitución
  const textoOriginal = 'EL CODIGO NO MIENTE';
  const textoCifrado = cifrarSustitucion(textoOriginal, alfabetoCifrado);
  assert(textoCifrado !== textoOriginal, 'El texto cifrado debe diferir del original');
  const textoDescifrado = descifrarSustitucion(textoCifrado, alfabetoCifrado);
  assert(textoDescifrado === textoOriginal, 'Descifrado debe restituir el texto original con exactitud');

  // 4. Preservación de caracteres especiales
  const mixto = '¡Vera Sorenson, 2044!';
  const cifMixto = cifrarSustitucion(mixto, alfabetoCifrado);
  assert(cifMixto.includes('¡') && cifMixto.includes('2044!'), 'Debe preservar signos y números');
  assert(descifrarSustitucion(cifMixto, alfabetoCifrado) === mixto, 'Descifrado preserva formato');

  // 5. Sustitución parcial (hipótesis de jugador)
  const parcial = aplicarSustitucionParcial('QWE', { Q: 'E', W: 'L' });
  assert(parcial === 'ELE', 'Sustitución parcial debe reemplazar las letras hipotetizadas');

  // 6. Persistencia
  const guardado = guardarProgresoFrecuencia({ resuelto: true, prueba: 'freq_ok' });
  assert(guardado === true, 'guardarProgresoFrecuencia debe completarse');
  const cargado = cargarProgresoFrecuencia();
  assert(cargado !== null && cargado.prueba === 'freq_ok', 'cargarProgresoFrecuencia debe recuperar el progreso');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Análisis de Frecuencia: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Análisis de Frecuencia: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

