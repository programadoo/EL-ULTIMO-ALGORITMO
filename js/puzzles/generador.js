/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Generador — Generador de puzzles matemáticos (Tipos A-E)
 * Especificación: Sección 5.3 y 2.4 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

import { Conjuntos } from '../conjuntos.js';
import { getState } from '../state.js';
import { generarPuzzleTipoB } from './tipoB.js';
import { generarPuzzleTipoC } from './tipoC.js';
import { generarPuzzleTipoD } from './tipoD.js';
import { generarPuzzleTipoE } from './tipoE.js';
import { generarPuzzleCesar } from './tipoCesar.js';
import { generarPuzzleBinario } from './tipoBinario.js';
import { generarPuzzleHex } from './tipoHex.js';
import { generarPuzzleVigenere } from './tipoVigenere.js';
import { generarPuzzleFrecuencia } from './tipoFrecuencia.js';
import { generarPuzzleEsteganografia } from './tipoEsteganografia.js';
import { generarPuzzleRSA } from './tipoRSA.js';
import { generarPuzzleLlaves } from './tipoLlaves.js';
import { generarPuzzleFirmas } from './tipoFirmas.js';
import { generarPuzzleBlockchain } from './tipoBlockchain.js';

// ─────────────────────────────────────────────────
// 1. UTILIDADES MATEMÁTICAS Y DE AZAR
// ─────────────────────────────────────────────────

/**
 * Elige un elemento al azar de un arreglo.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
export function elegirAlAzar(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Mezcla aleatoriamente un arreglo (Fisher-Yates shuffle).
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function mezclar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Genera N enteros aleatorios únicos dentro de un rango [min, max].
 * @param {number} min
 * @param {number} max
 * @param {number} count
 * @returns {number[]}
 */
export function randInts(min, max, count) {
  const disponibles = [];
  for (let i = min; i <= max; i++) disponibles.push(i);
  return mezclar(disponibles).slice(0, count).sort((a, b) => a - b);
}

/**
 * Formatea un Set o Array a notación matemática estándar: "{ 1, 2, 3 }" o "∅".
 * @param {Set|Iterable} s
 * @returns {string}
 */
export function fmt(s) {
  return Conjuntos.aTexto(s);
}

/**
 * Devuelve el símbolo matemático asociado a una operación de conjuntos.
 * @param {string} op
 * @returns {string}
 */
export function simbolo(op) {
  switch (op) {
    case 'union': return '∪';
    case 'interseccion': return '∩';
    case 'diferencia': return '\\';
    case 'diferencia_inversa': return '\\';
    case 'diferenciaSimetrica': return '△';
    default: return op;
  }
}

// ─────────────────────────────────────────────────
// 2. GENERADOR DE DIAGRAMA DE VENN EN SVG
// ─────────────────────────────────────────────────

/**
 * Distribuye coordenadas para elementos dentro de una región del diagrama de Venn.
 * @param {number[]} elementos
 * @param {number} centerX
 * @param {number} centerY
 * @returns {Array<{ val: number, x: number, y: number }>}
 */
function distribuirElementos(elementos, centerX, centerY) {
  const n = elementos.length;
  if (n === 0) return [];
  if (n === 1) return [{ val: elementos[0], x: centerX, y: centerY }];

  if (n <= 3) {
    const spacing = 26;
    return elementos.map((val, i) => ({
      val,
      x: centerX,
      y: centerY + (i - (n - 1) / 2) * spacing
    }));
  }

  // 4 o más elementos: distribución en 2 columnas
  const spacing = 22;
  const totalFilas = Math.ceil(n / 2);
  return elementos.map((val, i) => {
    const col = (i % 2 === 0) ? -14 : 14;
    const row = Math.floor(i / 2);
    return {
      val,
      x: centerX + col,
      y: centerY + (row - (totalFilas - 1) / 2) * spacing
    };
  });
}

/**
 * Genera el marcado SVG de un diagrama de Venn de 2 conjuntos con estética cyberpunk.
 * @param {object} datos
 * @param {number[]} datos.soloA - Elementos exclusivos de A (A \ B)
 * @param {number[]} datos.interseccion - Elementos comunes (A ∩ B)
 * @param {number[]} datos.soloB - Elementos exclusivos de B (B \ A)
 * @param {string} [datos.operacionDestacada] - Operación que resalta visualmente la zona
 * @returns {string} Marcado SVG
 */
export function generarDiagramaVenn2SVG({ soloA, interseccion, soloB, operacionDestacada }) {
  const coordsA = distribuirElementos(soloA, 105, 110);
  const coordsInt = distribuirElementos(interseccion, 210, 110);
  const coordsB = distribuirElementos(soloB, 315, 110);

  // Colores de sombreado según la operación del puzzle
  let fillA = 'rgba(0, 255, 65, 0.04)';
  let fillB = 'rgba(0, 229, 255, 0.04)';
  let fillLens = 'rgba(0, 255, 65, 0.06)';

  if (operacionDestacada === 'interseccion') {
    fillLens = 'rgba(0, 229, 255, 0.18)';
  } else if (operacionDestacada === 'union') {
    fillA = 'rgba(0, 255, 65, 0.12)';
    fillB = 'rgba(0, 229, 255, 0.12)';
    fillLens = 'rgba(0, 255, 200, 0.18)';
  } else if (operacionDestacada === 'diferencia') {
    fillA = 'rgba(0, 255, 65, 0.18)';
  } else if (operacionDestacada === 'diferenciaSimetrica') {
    fillA = 'rgba(0, 255, 65, 0.15)';
    fillB = 'rgba(0, 229, 255, 0.15)';
    fillLens = 'rgba(10, 14, 10, 0.8)';
  }

  const renderTexts = (coords) => coords.map(c => `
    <text x="${c.x}" y="${c.y}" class="venn-element" text-anchor="middle" dominant-baseline="central">${c.val}</text>
  `).join('');

  return `
    <div class="venn-container">
      <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de Venn interactivo">
        <defs>
          <filter id="venn-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Marco del universo -->
        <rect x="5" y="5" width="410" height="210" rx="8" fill="rgba(10, 14, 10, 0.75)" stroke="rgba(0, 255, 65, 0.18)" stroke-width="1" />
        <text x="20" y="24" class="venn-label" font-size="11" fill="var(--text-dim)">U // UNIVERSO</text>

        <!-- Círculo A -->
        <circle cx="150" cy="110" r="85" class="venn-circle venn-circle--a" fill="${fillA}" filter="url(#venn-glow)" />

        <!-- Círculo B -->
        <circle cx="270" cy="110" r="85" class="venn-circle venn-circle--b" fill="${fillB}" filter="url(#venn-glow)" />

        <!-- Lente de Intersección (resalte visual) -->
        <path d="M 210 32 A 85 85 0 0 1 210 188 A 85 85 0 0 1 210 32 Z" fill="${fillLens}" />

        <!-- Etiquetas de Conjuntos -->
        <text x="85" y="42" class="venn-label" font-weight="bold" fill="var(--green-bright)">CONJUNTO A</text>
        <text x="335" y="42" class="venn-label" font-weight="bold" fill="var(--cyan)" text-anchor="end">CONJUNTO B</text>

        <!-- Elementos colocados -->
        <g id="venn-elements-a">${renderTexts(coordsA)}</g>
        <g id="venn-elements-int">${renderTexts(coordsInt)}</g>
        <g id="venn-elements-b">${renderTexts(coordsB)}</g>
      </svg>
    </div>
  `.trim();
}

// ─────────────────────────────────────────────────
// 3. GENERADOR DE DISTRACTORES
// ─────────────────────────────────────────────────

/**
 * Genera distractores plausibles matemáticamente para operaciones de conjuntos.
 * @param {Set} A
 * @param {Set} B
 * @param {string} op
 * @param {number} [count=3]
 * @returns {Set[]}
 */
export function generarDistractores(A, B, op, count = 3) {
  let correcta;
  if (op === 'diferencia_inversa') {
    correcta = Conjuntos.diferencia(B, A);
  } else {
    correcta = Conjuntos[op](A, B);
  }

  // Candidatos plausibles basados en confusiones comunes de teoría de conjuntos
  const candidatos = [
    Conjuntos.union(A, B),
    Conjuntos.interseccion(A, B),
    Conjuntos.diferencia(A, B),
    Conjuntos.diferencia(B, A),
    Conjuntos.diferenciaSimetrica(A, B),
    new Set(A),
    new Set(B),
    Conjuntos.vacio()
  ];

  // Candidatos con elementos agregados o eliminados (distractores de conteo)
  const arrCorrecta = [...correcta];
  if (arrCorrecta.length > 1) {
    candidatos.push(new Set(arrCorrecta.slice(0, -1)));
  }

  const universo = new Set([...A, ...B]);
  for (const elem of universo) {
    if (!correcta.has(elem)) {
      candidatos.push(new Set([...correcta, elem]));
      break;
    }
  }

  // Filtrar duplicados y el resultado correcto
  const unicos = [];
  for (const cand of candidatos) {
    const esIgualCorrecta = Conjuntos.iguales(cand, correcta);
    const yaExiste = unicos.some(u => Conjuntos.iguales(u, cand));

    if (!esIgualCorrecta && !yaExiste) {
      unicos.push(cand);
      if (unicos.length >= count) break;
    }
  }

  // Si aún faltan distractores por ser un caso pequeño, fabricar variantes
  while (unicos.length < count) {
    const extra = new Set(randInts(1, 15, Math.max(1, correcta.size)));
    if (!Conjuntos.iguales(extra, correcta) && !unicos.some(u => Conjuntos.iguales(u, extra))) {
      unicos.push(extra);
    }
  }

  return unicos;
}

// ─────────────────────────────────────────────────
// 4. GENERADOR PRINCIPAL: TIPO A (SPEC 5.3)
// ─────────────────────────────────────────────────

/**
 * Genera un puzzle visual de conjuntos (Tipo A) con diagrama de Venn.
 * @param {number} [nivel=1] - Dificultad (1..5)
 * @returns {object} Objeto de puzzle completo
 */
export function generarPuzzleConjuntos(nivel = 1) {
  const rango = nivel <= 2 ? 12 : 25;

  // Garantizar que haya elementos en solo A, en la intersección y en solo B
  const countA = nivel === 1 ? 2 : 3;
  const countB = nivel === 1 ? 2 : 3;
  const countInt = nivel === 1 ? 2 : 3;

  const universo = mezclar(Array.from({ length: rango }, (_, i) => i + 1));
  const soloA = universo.slice(0, countA).sort((a, b) => a - b);
  const interseccion = universo.slice(countA, countA + countInt).sort((a, b) => a - b);
  const soloB = universo.slice(countA + countInt, countA + countInt + countB).sort((a, b) => a - b);

  const A = new Set([...soloA, ...interseccion]);
  const B = new Set([...soloB, ...interseccion]);

  // Selección de operación según nivel
  let operaciones = ['union', 'interseccion', 'diferencia'];
  if (nivel >= 2) {
    operaciones.push('diferencia_inversa');
  }
  if (nivel >= 3) {
    operaciones.push('diferenciaSimetrica');
  }

  const op = elegirAlAzar(operaciones);

  // Calcular respuesta correcta
  let respuestaCorrectaSet;
  let expresionEnunciado;
  let explicacionDetallada;

  switch (op) {
    case 'union':
      respuestaCorrectaSet = Conjuntos.union(A, B);
      expresionEnunciado = `A ∪ B`;
      explicacionDetallada = `La unión (A ∪ B) agrupa todos los elementos presentes en A, en B o en ambos: ${fmt(respuestaCorrectaSet)}.`;
      break;

    case 'interseccion':
      respuestaCorrectaSet = Conjuntos.interseccion(A, B);
      expresionEnunciado = `A ∩ B`;
      explicacionDetallada = `La intersección (A ∩ B) contiene únicamente los elementos comunes a ambos círculos: ${fmt(respuestaCorrectaSet)}.`;
      break;

    case 'diferencia':
      respuestaCorrectaSet = Conjuntos.diferencia(A, B);
      expresionEnunciado = `A \\ B`;
      explicacionDetallada = `La diferencia (A \\ B) son los elementos que pertenecen a A pero NO están en B: ${fmt(respuestaCorrectaSet)}.`;
      break;

    case 'diferencia_inversa':
      respuestaCorrectaSet = Conjuntos.diferencia(B, A);
      expresionEnunciado = `B \\ A`;
      explicacionDetallada = `La diferencia (B \\ A) son los elementos que pertenecen a B pero NO están en A: ${fmt(respuestaCorrectaSet)}.`;
      break;

    case 'diferenciaSimetrica':
      respuestaCorrectaSet = Conjuntos.diferenciaSimetrica(A, B);
      expresionEnunciado = `A △ B`;
      explicacionDetallada = `La diferencia simétrica (A △ B) son los elementos que pertenecen a A o a B, pero no a ambos: ${fmt(respuestaCorrectaSet)}.`;
      break;
  }

  // Generar distractores matemáticos plausibles
  const distractoresSets = generarDistractores(A, B, op, 3);
  const opcionesSets = mezclar([respuestaCorrectaSet, ...distractoresSets]);
  const opcionesTexto = opcionesSets.map(fmt);
  const respuestaCorrectaTexto = fmt(respuestaCorrectaSet);

  // Generar el diagrama SVG embebido
  const svg = generarDiagramaVenn2SVG({
    soloA,
    interseccion,
    soloB,
    operacionDestacada: op
  });

  return {
    id: `puzzle_A_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    tipo: 'A',
    titulo: 'FIREWALL // ANÁLISIS DE CONJUNTOS',
    nivel,
    enunciado: `Inspecciona el diagrama de Venn del sector. Determina el conjunto correspondiente a: <strong>${expresionEnunciado}</strong>`,
    conjuntos: { A, B },
    soloA,
    interseccion,
    soloB,
    operacion: op,
    simbolo: simbolo(op),
    svg,
    opciones: opcionesTexto,
    respuestaCorrecta: respuestaCorrectaTexto,
    respuestaCorrectaSet,
    explicacion: explicacionDetallada,
    tiempoLimite: Math.max(60, 90 - nivel * 5) // Entre 65 y 85 segundos según nivel
  };
}

/**
 * Dispatcher general de puzzles (preparado para integrar tipos B, C, D, E en fases siguientes).
 * @param {string} tipo - 'A' | 'B' | 'C' | 'D' | 'E'
 * @param {number} nivel - Nivel de dificultad
 * @returns {object}
 */
export function generarPuzzle(tipo = 'A', nivel = 1) {
  const t = String(tipo || 'A').toUpperCase();
  switch (t) {
    case 'A':
      return generarPuzzleConjuntos(nivel);
    case 'B':
      return generarPuzzleTipoB(nivel);
    case 'C':
      return generarPuzzleTipoC(nivel);
    case 'D':
      return generarPuzzleTipoD(nivel);
    case 'E':
      return generarPuzzleTipoE(nivel);
    case 'CESAR':
    case 'CRIPTO':
      return generarPuzzleCesar(nivel);
    case 'BINARIO':
    case 'BIN':
      return generarPuzzleBinario(nivel);
    case 'HEX':
    case 'HEXADECIMAL':
      return generarPuzzleHex(nivel);
    case 'VIGENERE':
      return generarPuzzleVigenere(nivel);
    case 'FRECUENCIA':
    case 'SUSTITUCION':
      return generarPuzzleFrecuencia(nivel);
    case 'ESTEGANOGRAFIA':
    case 'LSB':
      return generarPuzzleEsteganografia(nivel);
    case 'RSA':
      return generarPuzzleRSA(nivel);
    case 'LLAVES':
    case 'KEYS':
    case 'ASIMETRICO':
      return generarPuzzleLlaves(nivel);
    case 'FIRMA':
    case 'FIRMAS':
    case 'RSAPSS':
    case 'PSS':
      return generarPuzzleFirmas(nivel);
    case 'BLOCKCHAIN':
    case 'CADENA':
    case 'SHA256':
    case 'LEDGER':
      return generarPuzzleBlockchain(nivel);
    default:
      console.warn(`[Generador] Tipo '${tipo}' desconocido, generando Tipo A por defecto.`);
      return generarPuzzleConjuntos(nivel);
  }
}

/**
 * Abre cualquier puzzle por tipo y nivel en el overlay unificado.
 * @param {string} tipo - 'A' | 'B' | 'C' | 'D' | 'E'
 * @param {number} nivel
 * @param {Function} [onCompletado]
 */
export async function abrirCualquierPuzzle(tipo = 'A', nivel = 1, onCompletado = null) {
  const t = String(tipo || 'A').toUpperCase();
  const st = (typeof getState === 'function') ? getState() : null;
  // En Modo Ghost Protocol (Prompt 19), los puzzles son más difíciles (+1 nivel, mín 3)
  const nivelEfectivo = (st && st.isGhostProtocol) ? Math.min(5, Math.max(3, nivel + 1)) : nivel;

  switch (t) {
    case 'A': {
      const { abrirPuzzleTipoA } = await import('./tipoA.js');
      return abrirPuzzleTipoA(nivelEfectivo, onCompletado);
    }
    case 'B': {
      const { abrirPuzzleTipoB } = await import('./tipoB.js');
      return abrirPuzzleTipoB(nivelEfectivo, onCompletado);
    }
    case 'C': {
      const { abrirPuzzleTipoC } = await import('./tipoC.js');
      return abrirPuzzleTipoC(nivelEfectivo, onCompletado);
    }
    case 'D': {
      const { abrirPuzzleTipoD } = await import('./tipoD.js');
      return abrirPuzzleTipoD(nivelEfectivo, onCompletado);
    }
    case 'E': {
      const { abrirPuzzleTipoE } = await import('./tipoE.js');
      return abrirPuzzleTipoE(nivelEfectivo, onCompletado);
    }
    case 'CESAR':
    case 'CRIPTO': {
      const { abrirPuzzleCesar } = await import('./tipoCesar.js');
      return abrirPuzzleCesar(nivelEfectivo, onCompletado);
    }
    case 'BINARIO':
    case 'BIN': {
      const { abrirPuzzleBinario } = await import('./tipoBinario.js');
      return abrirPuzzleBinario(nivelEfectivo, onCompletado);
    }
    case 'HEX':
    case 'HEXADECIMAL': {
      const { abrirPuzzleHex } = await import('./tipoHex.js');
      return abrirPuzzleHex(nivelEfectivo, onCompletado);
    }
    case 'VIGENERE': {
      const { abrirPuzzleVigenere } = await import('./tipoVigenere.js');
      return abrirPuzzleVigenere(nivelEfectivo, onCompletado);
    }
    case 'FRECUENCIA':
    case 'SUSTITUCION': {
      const { abrirPuzzleFrecuencia } = await import('./tipoFrecuencia.js');
      return abrirPuzzleFrecuencia(nivelEfectivo, onCompletado);
    }
    case 'ESTEGANOGRAFIA':
    case 'LSB': {
      const { abrirPuzzleEsteganografia } = await import('./tipoEsteganografia.js');
      return abrirPuzzleEsteganografia(nivelEfectivo, onCompletado);
    }
    case 'RSA': {
      const { abrirPuzzleRSA } = await import('./tipoRSA.js');
      return abrirPuzzleRSA(nivelEfectivo, onCompletado);
    }
    case 'LLAVES':
    case 'KEYS':
    case 'ASIMETRICO': {
      const { abrirPuzzleLlaves } = await import('./tipoLlaves.js');
      return abrirPuzzleLlaves(nivelEfectivo, onCompletado);
    }
    case 'FIRMA':
    case 'FIRMAS':
    case 'RSAPSS':
    case 'PSS': {
      const { abrirPuzzleFirmas } = await import('./tipoFirmas.js');
      return abrirPuzzleFirmas(nivelEfectivo, onCompletado);
    }
    case 'BLOCKCHAIN':
    case 'CADENA':
    case 'SHA256':
    case 'LEDGER': {
      const { abrirPuzzleBlockchain } = await import('./tipoBlockchain.js');
      return abrirPuzzleBlockchain(nivelEfectivo, onCompletado);
    }
    default: {
      const { abrirPuzzleTipoA } = await import('./tipoA.js');
      return abrirPuzzleTipoA(nivelEfectivo, onCompletado);
    }
  }
}

// ─────────────────────────────────────────────────
// 5. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias para el generador de puzzles.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testGenerador() {
  console.group('%c[TEST SUITE] Generador de Puzzles (generador.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Generación de enteros únicos
  const ints = randInts(1, 10, 5);
  assert(ints.length === 5, 'randInts debe generar 5 números');
  assert(new Set(ints).size === 5, 'randInts no debe tener duplicados');
  assert(ints.every(n => n >= 1 && n <= 10), 'randInts dentro del rango [1, 10]');

  // 2. Mezcla de arreglos
  const orig = [1, 2, 3, 4, 5];
  const shuf = mezclar(orig);
  assert(shuf.length === orig.length, 'mezclar preserva la longitud');
  assert(shuf.every(n => orig.includes(n)), 'mezclar contiene los mismos elementos');

  // 3. Formato de conjuntos
  assert(fmt(new Set([1, 2, 3])) === '{ 1, 2, 3 }', "fmt({1, 2, 3}) === '{ 1, 2, 3 }'");
  assert(fmt(new Set()) === '∅', "fmt(∅) === '∅'");

  // 4. Distractores
  const A = new Set([1, 2, 3]);
  const B = new Set([2, 3, 4]);
  const dist = generarDistractores(A, B, 'interseccion', 3);
  assert(dist.length === 3, 'generarDistractores debe retornar 3 distractores');
  assert(!dist.some(d => Conjuntos.iguales(d, Conjuntos.interseccion(A, B))), 'Ningún distractor debe ser igual a la respuesta correcta');

  // 5. Generación de Puzzle Tipo A en nivel 1
  const puzzle1 = generarPuzzle('A', 1);
  assert(puzzle1.tipo === 'A', "puzzle.tipo debe ser 'A'");
  assert(typeof puzzle1.enunciado === 'string' && puzzle1.enunciado.length > 0, 'puzzle debe tener enunciado no vacío');
  assert(Array.isArray(puzzle1.opciones) && puzzle1.opciones.length === 4, 'puzzle debe contener exactamente 4 opciones');
  assert(puzzle1.opciones.includes(puzzle1.respuestaCorrecta), 'La respuesta correcta debe estar dentro de las opciones');
  assert(new Set(puzzle1.opciones).size === 4, 'Las 4 opciones deben ser todas únicas y distintas');
  assert(typeof puzzle1.svg === 'string' && puzzle1.svg.includes('<svg') && puzzle1.svg.includes('venn-circle'), 'puzzle debe generar marcado SVG con clases de Venn');
  assert(typeof puzzle1.explicacion === 'string' && puzzle1.explicacion.length > 0, 'puzzle debe contener explicación detallada');

  // 6. Generación de Puzzle en nivel 3 (incluye más operaciones)
  const puzzle3 = generarPuzzle('A', 3);
  assert(puzzle3.nivel === 3, 'puzzle3.nivel debe ser 3');
  assert(puzzle3.opciones.includes(puzzle3.respuestaCorrecta), 'puzzle3 debe contener respuesta correcta');
  assert(puzzle3.svg.includes('venn-container'), 'puzzle3 debe contener contenedor de Venn');

  // 7. Generación de Puzzle Tipo B
  const puzzleB = generarPuzzle('B', 2);
  assert(puzzleB.tipo === 'B', "generarPuzzle('B') debe devolver tipo 'B'");
  assert(puzzleB.opciones.length === 2, "Tipo B debe tener 2 opciones (V/F)");
  assert(puzzleB.opciones.includes(puzzleB.respuestaCorrecta), "Tipo B debe incluir la respuesta correcta en sus opciones");

  // 8. Generación de Puzzle Tipo C
  const puzzleC = generarPuzzle('C', 1);
  assert(puzzleC.tipo === 'C', "generarPuzzle('C') debe devolver tipo 'C'");
  assert(puzzleC.opciones.length === 4, "Tipo C debe tener 4 opciones");
  assert(puzzleC.opciones.includes(puzzleC.respuestaCorrecta), "Tipo C debe incluir la respuesta correcta");

  // 9. Generación de Puzzle Tipo D
  const puzzleD = generarPuzzle('D', 1);
  assert(puzzleD.tipo === 'D', "generarPuzzle('D') debe devolver tipo 'D'");
  assert(Array.isArray(puzzleD.tablaConHuecos), "Tipo D debe incluir tablaConHuecos");
  assert(puzzleD.tablaConHuecos.some(f => f.oculto), "Tipo D debe tener al menos una celda oculta");

  // 10. Generación de Puzzle Tipo E
  const puzzleE = generarPuzzle('E', 1);
  assert(puzzleE.tipo === 'E', "generarPuzzle('E') debe devolver tipo 'E'");
  assert(Array.isArray(puzzleE.premisas) && puzzleE.premisas.length >= 2, "Tipo E debe contener premisas");
  assert(puzzleE.opciones.includes(puzzleE.respuestaCorrecta), "Tipo E debe incluir la conclusión correcta");

  // 11. Generación de Puzzle Tipo Binario
  const puzzleBin = generarPuzzle('BINARIO', 1);
  assert(puzzleBin.tipo === 'BINARIO', "generarPuzzle('BINARIO') debe devolver tipo 'BINARIO'");
  assert(typeof puzzleBin.codigoBinario === 'string' && puzzleBin.codigoBinario.length > 0, "Tipo Binario debe generar codigoBinario");
  assert(puzzleBin.opciones.includes(puzzleBin.respuestaCorrecta), "Tipo Binario debe incluir respuesta correcta");

  // 12. Generación de Puzzle Tipo Hexadecimal
  const puzzleHex = generarPuzzle('HEX', 1);
  assert(puzzleHex.tipo === 'HEX', "generarPuzzle('HEX') debe devolver tipo 'HEX'");
  assert(typeof puzzleHex.codigoHex === 'string' && puzzleHex.codigoHex.length > 0, "Tipo Hex debe generar codigoHex");
  assert(puzzleHex.opciones.includes(puzzleHex.respuestaCorrecta), "Tipo Hex debe incluir respuesta correcta");

  // 13. Generación de Puzzle Tipo Vigenère
  const puzzleVig = generarPuzzle('VIGENERE', 2);
  assert(puzzleVig.tipo === 'VIGENERE', "generarPuzzle('VIGENERE') debe devolver tipo 'VIGENERE'");
  assert(typeof puzzleVig.textoCifrado === 'string' && puzzleVig.textoCifrado.length > 0, "Tipo Vigenère debe generar textoCifrado");
  assert(puzzleVig.opciones.includes(puzzleVig.respuestaCorrecta), "Tipo Vigenère debe incluir respuesta correcta");

  // 14. Generación de Puzzle Tipo Frecuencia
  const puzzleFreq = generarPuzzle('FRECUENCIA', 4);
  assert(puzzleFreq.tipo === 'FRECUENCIA', "generarPuzzle('FRECUENCIA') debe devolver tipo 'FRECUENCIA'");
  assert(typeof puzzleFreq.textoCifrado === 'string' && puzzleFreq.textoCifrado.length > 0, "Tipo Frecuencia debe generar textoCifrado");
  assert(puzzleFreq.opciones.includes(puzzleFreq.respuestaCorrecta), "Tipo Frecuencia debe incluir respuesta correcta");

  // 15. Generación de Puzzle Tipo Esteganografía LSB
  const puzzleEsteg = generarPuzzle('ESTEGANOGRAFIA', 4);
  assert(puzzleEsteg.tipo === 'ESTEGANOGRAFIA', "generarPuzzle('ESTEGANOGRAFIA') debe devolver tipo 'ESTEGANOGRAFIA'");
  assert(typeof puzzleEsteg.mensajeSecreto === 'string' && puzzleEsteg.mensajeSecreto.length > 0, "Tipo Esteganografía debe generar mensajeSecreto");
  assert(puzzleEsteg.opciones.includes(puzzleEsteg.respuestaCorrecta), "Tipo Esteganografía debe incluir respuesta correcta");

  // 16. Generación de Puzzle Tipo RSA (Firewall 5)
  const puzzleRSA = generarPuzzle('RSA', 5);
  assert(puzzleRSA.tipo === 'RSA', "generarPuzzle('RSA') debe devolver tipo 'RSA'");
  assert(typeof puzzleRSA.textoPlano === 'string' && puzzleRSA.textoPlano.length > 0, "Tipo RSA debe generar textoPlano");
  assert(Array.isArray(puzzleRSA.numerosCifrados) && puzzleRSA.numerosCifrados.length > 0, "Tipo RSA debe generar numerosCifrados");
  assert(puzzleRSA.opciones.includes(puzzleRSA.respuestaCorrecta), "Tipo RSA debe incluir respuesta correcta");

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Generador: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Generador: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
