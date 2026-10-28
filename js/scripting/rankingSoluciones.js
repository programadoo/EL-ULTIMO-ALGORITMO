/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Ranking de Soluciones Elegantes de Scripting (GhostScript)
 * Especificación: SPEC_3AVANZADO.MD (Prompt B4)
 * ══════════════════════════════════════════════════
 *
 * Sistema de evaluación, persistencia en localStorage y pantalla dedicada
 * para las soluciones más elegantes a los retos de GhostScript:
 * - Menos líneas de código (concisión algorítmica).
 * - Más rápidas (menor número de ciclos/operaciones de CPU).
 * - Puntuación de elegancia estilo Zachtronics.
 * - Benchmarks legendarios del Lore (Dra. Vera Sorenson, Ghost, Ada Lovelace, Alan Turing, Cipher_09).
 * - Récords personales del jugador y visualización de código fuente.
 */

import { BANCO_RETOS, validarReto } from './retos.js';
import { getState } from '../state.js';

export const STORAGE_RANKING_SOLUCIONES_KEY = 'ultimo_algoritmo_ranking_soluciones';

// ─────────────────────────────────────────────────
// 1. SOLUCIONES BENCHMARK INICIALES (LORE & REFERENCIA)
// ─────────────────────────────────────────────────

export const BENCHMARK_SOLUCIONES = [
  // ── RETO 1: Escáner de Puertos ──
  {
    id: 'bench_r1_vera',
    idReto: 1,
    tituloReto: 'Reto 1 — Automatización Simple',
    autor: 'DRA. VERA SORENSON',
    lineas: 5,
    ops: 14,
    memoriaKB: 64,
    elegancia: 980,
    badge: '👑 MAESTRÍA SORENSON',
    fecha: '2044-08-12',
    esJugador: false,
    codigo: `// Solución elegante de Dra. Vera Sorenson
LET puertos = SCAN "servidor.local"
LET abierto = 443
SEND abierto TO "ghost@nexus"
RETURN abierto`
  },
  {
    id: 'bench_r1_ghost',
    idReto: 1,
    tituloReto: 'Reto 1 — Automatización Simple',
    autor: 'GHOST',
    lineas: 8,
    ops: 22,
    memoriaKB: 64,
    elegancia: 925,
    badge: '⚡ SUB-CICLO',
    fecha: '2047-10-15',
    esJugador: false,
    codigo: `// Rutina de escaneo de Ghost
LET puertos = SCAN "servidor.local"
LET abierto = NULL
LOOP 4 TIMES
  IF puertos[0] == 443 THEN
    abierto = 443
    SEND abierto TO "ghost@nexus"
  END
END
RETURN abierto`
  },
  {
    id: 'bench_r1_cipher',
    idReto: 1,
    tituloReto: 'Reto 1 — Automatización Simple',
    autor: 'CIPHER_09',
    lineas: 10,
    ops: 28,
    memoriaKB: 64,
    elegancia: 870,
    badge: '🛡️ ESTABLE',
    fecha: '2047-09-20',
    esJugador: false,
    codigo: `LET puertos = SCAN "servidor.local"
LET abierto = NULL
LOOP 4 TIMES
  LET p = puertos[0]
  IF p == 443 THEN
    abierto = p
    SEND p TO "ghost@nexus"
  END
END
RETURN abierto`
  },

  // ── RETO 2: Búsqueda Eficiente ──
  {
    id: 'bench_r2_ada',
    idReto: 2,
    tituloReto: 'Reto 2 — Búsqueda Eficiente',
    autor: 'ADA_LOVELACE_CORE',
    lineas: 5,
    ops: 16,
    memoriaKB: 128,
    elegancia: 975,
    badge: '📏 HIPER-CONCISO',
    fecha: '2045-02-14',
    esJugador: false,
    codigo: `// Vector directo de búsqueda
LET archivos = SCAN "archivos.local"
LET target = "vera_notes.txt"
SEND target TO "ghost@nexus"
RETURN target`
  },
  {
    id: 'bench_r2_vera',
    idReto: 2,
    tituloReto: 'Reto 2 — Búsqueda Eficiente',
    autor: 'DRA. VERA SORENSON',
    lineas: 7,
    ops: 20,
    memoriaKB: 128,
    elegancia: 945,
    badge: '✨ VERA SORENSON',
    fecha: '2044-09-01',
    esJugador: false,
    codigo: `LET archivos = SCAN "archivos.local"
LET f = "vera_notes.txt"
LOOP 2 TIMES
  IF f == "vera_notes.txt" THEN
    SEND f TO "ghost@nexus"
  END
END
RETURN f`
  },
  {
    id: 'bench_r2_ghost',
    idReto: 2,
    tituloReto: 'Reto 2 — Búsqueda Eficiente',
    autor: 'GHOST',
    lineas: 9,
    ops: 26,
    memoriaKB: 128,
    elegancia: 895,
    badge: '⚡ SUB-CICLO',
    fecha: '2047-10-18',
    esJugador: false,
    codigo: `LET archivos = SCAN "archivos.local"
LET hallado = NULL
LOOP 4 TIMES
  LET f = archivos[0]
  IF f == "vera_notes.txt" THEN
    hallado = f
    SEND f TO "ghost@nexus"
  END
END
RETURN hallado`
  },

  // ── RETO 3: Descifrado en Lote ──
  {
    id: 'bench_r3_vera',
    idReto: 3,
    tituloReto: 'Reto 3 — Descifrado en Lote',
    autor: 'DRA. VERA SORENSON',
    lineas: 8,
    ops: 32,
    memoriaKB: 128,
    elegancia: 960,
    badge: '👑 PIPELINE ÓPTIMO',
    fecha: '2044-10-02',
    esJugador: false,
    codigo: `LET pkts = SCAN "canales.red"
LET c = 0
LOOP 3 TIMES
  LET d = DECRYPT pkts[0] CON "VERA_KEY"
  SEND d TO "ghost@nexus"
  c = c + 1
END
RETURN c`
  },
  {
    id: 'bench_r3_alan',
    idReto: 3,
    tituloReto: 'Reto 3 — Descifrado en Lote',
    autor: 'ALAN_TURING_SUBROUTINE',
    lineas: 10,
    ops: 36,
    memoriaKB: 128,
    elegancia: 910,
    badge: '⚡ CRIPTOANALISTA',
    fecha: '2046-04-12',
    esJugador: false,
    codigo: `LET lotes = SCAN "canales.red"
LET procesados = 0
LOOP 3 TIMES
  LET clave = "VERA_KEY"
  LET d = DECRYPT lotes[0] CON clave
  SEND d TO "ghost@nexus"
  procesados = procesados + 1
END
RETURN procesados`
  },
  {
    id: 'bench_r3_ghost',
    idReto: 3,
    tituloReto: 'Reto 3 — Descifrado en Lote',
    autor: 'GHOST',
    lineas: 11,
    ops: 40,
    memoriaKB: 128,
    elegancia: 875,
    badge: '🛡️ ESTABLE',
    fecha: '2047-10-20',
    esJugador: false,
    codigo: `LET pkts = SCAN "canales.red"
LET total = 0
LOOP 3 TIMES
  LET claro = DECRYPT pkts[0] CON "VERA_KEY"
  SEND claro TO "ghost@nexus"
  total = total + 1
END
RETURN total`
  },

  // ── RETO 4: Optimización CPU ──
  {
    id: 'bench_r4_vera',
    idReto: 4,
    tituloReto: 'Reto 4 — Optimización de Ciclos CPU',
    autor: 'DRA. VERA SORENSON',
    lineas: 4,
    ops: 15,
    memoriaKB: 64,
    elegancia: 990,
    badge: '⚡ ULTRA-RÁPIDO',
    fecha: '2044-10-10',
    esJugador: false,
    codigo: `// Crack en pipeline mínimo
LET u = "admin"
LET p = CRACK u
SEND p TO "ghost@nexus"
RETURN p`
  },
  {
    id: 'bench_r4_ghost',
    idReto: 4,
    tituloReto: 'Reto 4 — Optimización de Ciclos CPU',
    autor: 'GHOST',
    lineas: 6,
    ops: 22,
    memoriaKB: 64,
    elegancia: 930,
    badge: '💎 EQUILIBRIO',
    fecha: '2047-10-22',
    esJugador: false,
    codigo: `LET usuario = "admin"
LET password = CRACK usuario
IF password != NULL THEN
  SEND password TO "ghost@nexus"
END
RETURN password`
  },
  {
    id: 'bench_r4_cipher',
    idReto: 4,
    tituloReto: 'Reto 4 — Optimización de Ciclos CPU',
    autor: 'CIPHER_09',
    lineas: 8,
    ops: 28,
    memoriaKB: 64,
    elegancia: 875,
    badge: '🛡️ CRACKER SEGURO',
    fecha: '2047-09-28',
    esJugador: false,
    codigo: `LET target = "admin"
LET pass = CRACK target
LET log = NULL
IF pass != NULL THEN
  log = pass
  SEND log TO "ghost@nexus"
END
RETURN log`
  },

  // ── RETO 5: Ordenamiento de Logs ──
  {
    id: 'bench_r5_vera',
    idReto: 5,
    tituloReto: 'Reto 5 — Ordenamiento de Logs',
    autor: 'DRA. VERA SORENSON',
    lineas: 16,
    ops: 78,
    memoriaKB: 256,
    elegancia: 965,
    badge: '💎 MAESTRÍA ALGORÍTMICA',
    fecha: '2044-10-14',
    esJugador: false,
    codigo: `// Ordenamiento optimizado por Vera Sorenson
LET arr = [40, 10, 30, 20]
LOOP 2 TIMES
  IF arr[0] > arr[1] THEN
    LET t = arr[0]
    arr[0] = arr[1]
    arr[1] = t
  END
  IF arr[1] > arr[2] THEN
    LET t = arr[1]
    arr[1] = arr[2]
    arr[2] = t
  END
  IF arr[2] > arr[3] THEN
    LET t = arr[2]
    arr[2] = arr[3]
    arr[3] = t
  END
END
RETURN arr`
  },
  {
    id: 'bench_r5_ghost',
    idReto: 5,
    tituloReto: 'Reto 5 — Ordenamiento de Logs',
    autor: 'GHOST',
    lineas: 19,
    ops: 92,
    memoriaKB: 256,
    elegancia: 900,
    badge: '⚡ BURBUJA DIRECTA',
    fecha: '2047-10-24',
    esJugador: false,
    codigo: `LET arr = [40, 10, 30, 20]
LOOP 3 TIMES
  IF arr[0] > arr[1] THEN
    LET t1 = arr[0]
    arr[0] = arr[1]
    arr[1] = t1
  END
  IF arr[1] > arr[2] THEN
    LET t2 = arr[1]
    arr[1] = arr[2]
    arr[2] = t2
  END
  IF arr[2] > arr[3] THEN
    LET t3 = arr[2]
    arr[2] = arr[3]
    arr[3] = t3
  END
END
RETURN arr`
  },
  {
    id: 'bench_r5_cipher',
    idReto: 5,
    tituloReto: 'Reto 5 — Ordenamiento de Logs',
    autor: 'CIPHER_09',
    lineas: 21,
    ops: 115,
    memoriaKB: 256,
    elegancia: 840,
    badge: '🛡️ BURBUJA ESTÁNDAR',
    fecha: '2047-09-30',
    esJugador: false,
    codigo: `LET arr = [40, 10, 30, 20]
LET i = 0
LOOP 3 TIMES
  IF arr[0] > arr[1] THEN
    LET aux1 = arr[0]
    arr[0] = arr[1]
    arr[1] = aux1
  END
  IF arr[1] > arr[2] THEN
    LET aux2 = arr[1]
    arr[1] = arr[2]
    arr[2] = aux2
  END
  IF arr[2] > arr[3] THEN
    LET aux3 = arr[2]
    arr[2] = arr[3]
    arr[3] = aux3
  END
END
RETURN arr`
  }
];

// ─────────────────────────────────────────────────
// 2. CÁLCULO DE ELEGANCIA & ASIGNACIÓN DE BADGES
// ─────────────────────────────────────────────────

/**
 * Calcula el índice de elegancia (0 - 1000) considerando:
 * - Menos líneas de código (50% del peso).
 * - Menor número de operaciones de CPU (50% del peso).
 * 
 * @param {object} params
 * @param {number} params.lines
 * @param {number} params.ops
 * @param {number} [params.maxLines=15]
 * @param {number} [params.maxOps=100]
 * @returns {number}
 */
export function calcularPuntajeElegancia({ lines, ops, maxLines = 15, maxOps = 100 } = {}) {
  const lineasUsadas = Math.max(1, Number(lines) || 1);
  const opsUsadas = Math.max(1, Number(ops) || 1);

  // Escala de eficiencia: 1.0 = mínimo teórico, 0.0 = límite máximo del reto
  const factorLineas = Math.max(0, 1 - (lineasUsadas / (maxLines * 1.5)));
  const factorOps = Math.max(0, 1 - (opsUsadas / (maxOps * 1.5)));

  const base = Math.round((factorLineas * 500) + (factorOps * 500));
  return Math.max(100, Math.min(999, base));
}

/**
 * Determina una insignia (badge) descriptiva según las métricas obtenidas.
 * @param {object} metricas
 * @param {object} criterios
 * @param {boolean} [esJugador=true]
 * @returns {string}
 */
export function determinarBadgeElegancia(metricas, criterios, esJugador = true) {
  const maxLines = criterios?.maxLines || 15;
  const maxOps = criterios?.maxOps || 100;

  const ratioLines = metricas.lines / maxLines;
  const ratioOps = metricas.ops / maxOps;

  if (ratioLines <= 0.45 && ratioOps <= 0.45) {
    return esJugador ? '👑 OBRA MAESTRA' : '💎 MAESTRÍA SORENSON';
  }
  if (ratioLines <= 0.5) {
    return '📏 ULTRA-CONCISO';
  }
  if (ratioOps <= 0.4) {
    return '⚡ HIPER-VELOZ';
  }
  if (ratioLines <= 0.75 && ratioOps <= 0.75) {
    return '💎 EQUILIBRIO PERFECTO';
  }
  return '🛡️ CÓDIGO EFICIENTE';
}

// ─────────────────────────────────────────────────
// 3. PERSISTENCIA EN LOCALSTORAGE & OPERACIONES
// ─────────────────────────────────────────────────

/**
 * Carga la lista completa de soluciones desde localStorage.
 * Si está vacía o no existe, la inicializa con los benchmarks oficiales.
 * @returns {Array<object>}
 */
export function cargarRankingSoluciones() {
  try {
    const raw = localStorage.getItem(STORAGE_RANKING_SOLUCIONES_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[RankingSoluciones] Error al leer localStorage:', err);
  }

  // Si no hay datos, guardar y retornar los benchmarks predefinidos
  guardarRankingSoluciones(BENCHMARK_SOLUCIONES);
  return [...BENCHMARK_SOLUCIONES];
}

/**
 * Guarda la lista de soluciones en localStorage.
 * @param {Array<object>} lista
 */
export function guardarRankingSoluciones(lista) {
  try {
    localStorage.setItem(STORAGE_RANKING_SOLUCIONES_KEY, JSON.stringify(lista));
  } catch (err) {
    console.warn('[RankingSoluciones] Error al guardar en localStorage:', err);
  }
}

/**
 * Registra una solución exitosa del jugador en el ranking de elegancia.
 * Si el jugador ya tenía una solución para este reto, actualiza si la nueva es más elegante.
 * 
 * @param {object} params
 * @param {number|string} params.idReto
 * @param {string} params.codigo
 * @param {string} [params.autor]
 * @param {{ lines: number, ops: number }} [params.metricas]
 * @returns {{
 *   guardado: boolean,
 *   nuevoRecord: boolean,
 *   posicion: number,
 *   elegancia: number,
 *   entrada?: object,
 *   error?: string
 * }}
 */
export function registrarSolucionEnRanking({ idReto, codigo, autor, metricas } = {}) {
  const idNum = parseInt(idReto, 10);
  const reto = BANCO_RETOS.find(r => r.id === idNum);
  if (!reto) {
    return { guardado: false, nuevoRecord: false, posicion: 0, elegancia: 0, error: `Reto #${idReto} no válido.` };
  }

  // Si no se proporcionaron métricas, validar el código para obtenerlas
  let finalMetricas = metricas;
  if (!finalMetricas || typeof finalMetricas.lines !== 'number' || typeof finalMetricas.ops !== 'number') {
    const resVal = validarReto(idNum, codigo);
    if (!resVal.exito) {
      return { guardado: false, nuevoRecord: false, posicion: 0, elegancia: 0, error: 'El código no supera los tests del reto.' };
    }
    finalMetricas = resVal.metricas;
  }

  const alias = (autor || getState()?.userAlias || 'GHOST').toUpperCase().trim();
  const elegancia = calcularPuntajeElegancia({
    lines: finalMetricas.lines,
    ops: finalMetricas.ops,
    maxLines: reto.criterios.maxLines,
    maxOps: reto.criterios.maxOps
  });

  const badge = determinarBadgeElegancia(finalMetricas, reto.criterios, true);
  const fechaStr = new Date().toISOString().split('T')[0];

  const ranking = cargarRankingSoluciones();

  // Buscar si el jugador ya tiene una solución registrada para este reto
  const idxExistente = ranking.findIndex(s => s.idReto === idNum && s.esJugador && s.autor === alias);
  let nuevoRecord = false;

  const nuevaEntrada = {
    id: 'sol_user_' + idNum + '_' + Date.now(),
    idReto: idNum,
    tituloReto: reto.titulo,
    autor: alias,
    lineas: finalMetricas.lines,
    ops: finalMetricas.ops,
    memoriaKB: reto.criterios.memoriaKB,
    elegancia,
    badge,
    fecha: fechaStr,
    esJugador: true,
    codigo: String(codigo || '').trim()
  };

  if (idxExistente >= 0) {
    const prev = ranking[idxExistente];
    // Es nuevo récord si tiene menos líneas, menos ops o mayor elegancia
    if (elegancia > prev.elegancia || finalMetricas.lines < prev.lineas || finalMetricas.ops < prev.ops) {
      ranking[idxExistente] = nuevaEntrada;
      nuevoRecord = true;
    } else {
      // No superó su propio récord, pero la guardamos si el usuario lo desea explícitamente
      nuevoRecord = false;
    }
  } else {
    ranking.push(nuevaEntrada);
    nuevoRecord = true;
  }

  guardarRankingSoluciones(ranking);

  // Calcular la posición actual en el reto correspondiente
  const rankingReto = obtenerRankingSoluciones(idNum, 'elegancia');
  const posicion = rankingReto.findIndex(s => s.id === nuevaEntrada.id || (s.esJugador && s.autor === alias)) + 1;

  return {
    guardado: true,
    nuevoRecord,
    posicion: posicion > 0 ? posicion : 1,
    elegancia,
    entrada: nuevaEntrada
  };
}

/**
 * Obtiene el ranking ordenado y filtrado por reto y criterio.
 * 
 * @param {number|string|null} [filtroReto=null] - ID del reto (1 a 5) o null/'todos'.
 * @param {'elegancia'|'lineas'|'velocidad'} [criterio='elegancia'] - Criterio de ordenación.
 * @returns {Array<object>}
 */
export function obtenerRankingSoluciones(filtroReto = null, criterio = 'elegancia') {
  let lista = cargarRankingSoluciones();

  // Filtrar por reto si se especifica
  if (filtroReto !== null && filtroReto !== 'todos' && filtroReto !== '') {
    const idNum = parseInt(filtroReto, 10);
    if (!isNaN(idNum)) {
      lista = lista.filter(s => s.idReto === idNum);
    }
  }

  // Ordenar según el criterio elegido
  lista.sort((a, b) => {
    if (criterio === 'lineas') {
      // 1º Menor número de líneas, 2º Menor número de ops, 3º Mayor elegancia
      if (a.lineas !== b.lineas) return a.lineas - b.lineas;
      if (a.ops !== b.ops) return a.ops - b.ops;
      return b.elegancia - a.elegancia;
    }

    if (criterio === 'velocidad' || criterio === 'ops') {
      // 1º Menor número de ops (más rápido), 2º Menor líneas, 3º Mayor elegancia
      if (a.ops !== b.ops) return a.ops - b.ops;
      if (a.lineas !== b.lineas) return a.lineas - b.lineas;
      return b.elegancia - a.elegancia;
    }

    // Default: 'elegancia' (Mayor puntuación primero)
    if (b.elegancia !== a.elegancia) return b.elegancia - a.elegancia;
    if (a.lineas !== b.lineas) return a.lineas - b.lineas;
    return a.ops - b.ops;
  });

  // Asignar posición numerada
  return lista.map((item, idx) => ({
    ...item,
    posicion: idx + 1
  }));
}

/**
 * Restablece el ranking de soluciones a los valores de benchmark iniciales.
 */
export function restablecerRankingSoluciones() {
  guardarRankingSoluciones(BENCHMARK_SOLUCIONES);
  return [...BENCHMARK_SOLUCIONES];
}

// ─────────────────────────────────────────────────
// 4. RENDERIZADOR VISUAL DE LA PANTALLA DEDICADA
// ─────────────────────────────────────────────────

// Estado local de la vista
let filtroActivoReto = 'todos';
let criterioActivo = 'elegancia';

/**
 * Renderiza la pantalla dedicada de Ranking de Soluciones en el contenedor objetivo.
 * @param {HTMLElement|string} [target='script-ranking-content']
 */
export function renderScriptRankingScreen(target = 'script-ranking-content') {
  if (typeof document === 'undefined') return;
  const container = typeof target === 'string' ? document.getElementById(target) : target;
  if (!container) return;

  const soluciones = obtenerRankingSoluciones(filtroActivoReto, criterioActivo);
  const top3 = soluciones.slice(0, 3);
  const resto = soluciones.slice(3);

  // Colores para el podio
  const podioMetas = [
    { num: 1, corona: '👑', color: '#ffd700', label: '1º PUESTO // ORO', glow: '0 0 20px rgba(255, 215, 0, 0.45)' },
    { num: 2, corona: '🥈', color: '#00e5ff', label: '2º PUESTO // PLATA', glow: '0 0 20px rgba(0, 229, 255, 0.45)' },
    { num: 3, corona: '🥉', color: '#ff9100', label: '3º PUESTO // BRONCE', glow: '0 0 20px rgba(255, 145, 0, 0.45)' }
  ];

  // Orden visual del podio: [2º Plata (izq)] — [1º Oro (centro)] — [3º Bronce (der)]
  const podioOrdenado = [
    top3[1] ? { ...top3[1], meta: podioMetas[1] } : null,
    top3[0] ? { ...top3[0], meta: podioMetas[0] } : null,
    top3[2] ? { ...top3[2], meta: podioMetas[2] } : null
  ];

  container.innerHTML = `
    <div class="menu-content script-ranking-wrapper" style="max-width: 1040px; margin: 0 auto; padding: var(--space-xl) var(--space-md);">
      
      <!-- CABECERA -->
      <div style="text-align: center; margin-bottom: var(--space-lg);">
        <div style="display: inline-block; padding: 2px 12px; border: 1px solid var(--border-primary); border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: 11px; color: var(--green-bright); margin-bottom: 8px;">
          ⚡ GHOSTSCRIPT BENCHMARK // AUDITORÍA DE ELEGANCIA Y RENDIMIENTO
        </div>
        <h2 class="glitch glow-text" style="color: var(--green-bright); font-family: var(--font-display); font-size: var(--fs-3xl); margin-bottom: 6px; letter-spacing: 0.08em;">
          RANKING DE SOLUCIONES
        </h2>
        <p class="menu-subtitle" style="margin-bottom: var(--space-md);">
          // Las implementaciones más concisas (menos líneas) y más rápidas (menos ciclos de CPU)
        </p>
      </div>

      <!-- BARRA DE CONTROLES: FILTRO POR RETO & CRITERIO DE ORDENACIÓN -->
      <div class="ranking-controls-bar" style="background: rgba(0, 255, 65, 0.04); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-xl); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--space-md);">
        
        <!-- Filtro por Reto -->
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--yellow-warn); font-weight: bold;">⚡ RETO:</span>
          <button class="rank-filter-btn ${filtroActivoReto === 'todos' ? 'active' : ''}" data-reto="todos">TODOS (1-5)</button>
          <button class="rank-filter-btn ${filtroActivoReto === '1' ? 'active' : ''}" data-reto="1">RETO 1</button>
          <button class="rank-filter-btn ${filtroActivoReto === '2' ? 'active' : ''}" data-reto="2">RETO 2</button>
          <button class="rank-filter-btn ${filtroActivoReto === '3' ? 'active' : ''}" data-reto="3">RETO 3</button>
          <button class="rank-filter-btn ${filtroActivoReto === '4' ? 'active' : ''}" data-reto="4">RETO 4</button>
          <button class="rank-filter-btn ${filtroActivoReto === '5' ? 'active' : ''}" data-reto="5">RETO 5</button>
        </div>

        <!-- Criterio de Ordenación -->
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--cyan); font-weight: bold;">📊 ORDENAR:</span>
          <button class="rank-sort-btn ${criterioActivo === 'elegancia' ? 'active' : ''}" data-criterio="elegancia" title="Equilibrio entre líneas y ciclos de CPU">
            ✨ MÁS ELEGANTE
          </button>
          <button class="rank-sort-btn ${criterioActivo === 'lineas' ? 'active' : ''}" data-criterio="lineas" title="Menor cantidad de líneas de código">
            📏 MENOS LÍNEAS
          </button>
          <button class="rank-sort-btn ${criterioActivo === 'velocidad' ? 'active' : ''}" data-criterio="velocidad" title="Menor cantidad de operaciones de CPU">
            ⚡ MÁS RÁPIDA (OPS)
          </button>
        </div>

      </div>

      <!-- PODIO TOP 3 ANIMADO -->
      <div class="podium-grid" style="display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: var(--space-md); align-items: end; margin-bottom: var(--space-xl);">
        ${podioOrdenado.map((item, idx) => {
          if (!item) {
            return `
              <div style="background: rgba(10, 20, 10, 0.4); border: 1px dashed var(--border-dim); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; color: var(--text-dim); font-family: var(--font-mono); font-size: var(--fs-xs);">
                [ POSICIÓN DISPONIBLE ]
              </div>
            `;
          }
          const m = item.meta;
          const esPrimero = m.num === 1;

          return `
            <div class="podium-card ${esPrimero ? 'podium-card--first' : ''}" style="
              background: var(--bg-secondary);
              border: 2px solid ${m.color};
              border-radius: var(--radius-md);
              padding: var(--space-lg) var(--space-md);
              box-shadow: ${m.glow};
              position: relative;
              transform-origin: bottom;
              animation: podium-appear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              animation-delay: ${idx * 120}ms;
              opacity: 0;
              text-align: center;
              ${esPrimero ? 'min-height: 290px; background: linear-gradient(180deg, rgba(255,215,0,0.08) 0%, var(--bg-secondary) 100%);' : 'min-height: 250px;'}
            ">
              <div style="position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--bg-primary); border: 1px solid ${m.color}; border-radius: var(--radius-pill); padding: 2px 12px; font-family: var(--font-display); font-size: 10px; color: ${m.color}; font-weight: bold; letter-spacing: 0.1em; white-space: nowrap;">
                ◈ #${m.num} ${criterioActivo === 'lineas' ? 'MÁS CONCISO' : (criterioActivo === 'velocidad' ? 'MÁS RÁPIDO' : 'MÁS ELEGANTE')} ◈
              </div>

              <div style="font-size: 28px; margin: 4px 0;">${m.corona}</div>

              <h3 style="font-family: var(--font-display); color: ${item.esJugador ? 'var(--green-bright)' : m.color}; font-size: ${esPrimero ? 'var(--fs-lg)' : 'var(--fs-base)'}; margin-bottom: 4px; letter-spacing: 0.05em;">
                ${item.autor} ${item.esJugador ? '<span style="font-size: 10px; color: var(--green-bright); border: 1px solid var(--green-bright); padding: 1px 4px; border-radius: 3px;">TÚ</span>' : ''}
              </h3>

              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); margin-bottom: 8px;">
                ${item.tituloReto}
              </div>

              <div style="display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 10px; color: ${m.color}; border: 1px solid ${m.color}; margin-bottom: 12px;">
                ${item.badge}
              </div>

              <!-- MÉTRICAS EN TARJETA -->
              <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 10px; font-family: var(--font-mono); font-size: 12px;">
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-dim);">
                  <span style="color: var(--text-dim); font-size: 9px; display: block;">LÍNEAS</span>
                  <strong style="color: #ffeb3b;">${item.lineas}</strong>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-dim);">
                  <span style="color: var(--text-dim); font-size: 9px; display: block;">OPERACIONES</span>
                  <strong style="color: var(--cyan);">${item.ops} ops</strong>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-dim);">
                  <span style="color: var(--text-dim); font-size: 9px; display: block;">ELEGANCIA</span>
                  <strong style="color: var(--green-bright);">${item.elegancia}</strong>
                </div>
              </div>

              <button class="rank-view-code-btn" data-id="${item.id}" style="background: transparent; border: 1px solid ${m.color}; color: ${m.color}; font-family: var(--font-mono); font-size: 10px; padding: 4px 10px; border-radius: 3px; cursor: pointer; transition: all 0.2s;">
                👁 VER CÓDIGO GHOSTSCRIPT
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- TABLA DETALLADA DE TODAS LAS SOLUCIONES -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); overflow: hidden; margin-bottom: var(--space-xl);">
        <div style="padding: 10px 16px; background: rgba(0, 255, 65, 0.06); border-bottom: 1px solid var(--border-primary); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--green-bright); font-weight: bold;">
            📋 REGISTRO AUDITADO DE SOLUCIONES (${soluciones.length} ENTRADAS)
          </span>
          <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">
            CRITERIO: ${criterioActivo.toUpperCase()} // RETO: ${filtroActivoReto.toUpperCase()}
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; text-align: left;">
            <thead>
              <tr style="background: rgba(0,0,0,0.4); border-bottom: 1px solid var(--border-dim); color: var(--text-dim); font-size: 10px; text-transform: uppercase;">
                <th style="padding: 10px 14px;">POS</th>
                <th style="padding: 10px 14px;">PROGRAMADOR / AUTOR</th>
                <th style="padding: 10px 14px;">RETO</th>
                <th style="padding: 10px 14px; text-align: right;">LÍNEAS</th>
                <th style="padding: 10px 14px; text-align: right;">OPS CPU</th>
                <th style="padding: 10px 14px; text-align: right;">ELEGANCIA</th>
                <th style="padding: 10px 14px;">INSIGNIA</th>
                <th style="padding: 10px 14px; text-align: center;">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              ${soluciones.map((s, index) => {
                const pos = index + 1;
                let posColor = 'var(--text-dim)';
                let posIcon = `#${pos}`;
                if (pos === 1) { posColor = '#ffd700'; posIcon = '👑 #1'; }
                else if (pos === 2) { posColor = '#00e5ff'; posIcon = '🥈 #2'; }
                else if (pos === 3) { posColor = '#ff9100'; posIcon = '🥉 #3'; }

                const rowBg = s.esJugador ? 'rgba(0, 255, 65, 0.08)' : (index % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent');

                return `
                  <tr style="border-bottom: 1px solid var(--border-dim); background: ${rowBg};">
                    <td style="padding: 10px 14px; font-weight: bold; color: ${posColor};">${posIcon}</td>
                    <td style="padding: 10px 14px;">
                      <strong style="color: ${s.esJugador ? 'var(--green-bright)' : 'var(--text-primary)'};">${s.autor}</strong>
                      ${s.esJugador ? '<span style="font-size: 9px; color: var(--green-bright); border: 1px solid var(--green-bright); padding: 1px 3px; border-radius: 2px; margin-left: 4px;">TÚ</span>' : ''}
                    </td>
                    <td style="padding: 10px 14px; color: var(--text-dim); font-size: 11px;">${s.tituloReto}</td>
                    <td style="padding: 10px 14px; text-align: right; color: #ffeb3b; font-weight: bold;">${s.lineas}</td>
                    <td style="padding: 10px 14px; text-align: right; color: var(--cyan); font-weight: bold;">${s.ops}</td>
                    <td style="padding: 10px 14px; text-align: right; color: var(--green-bright); font-weight: bold;">${s.elegancia}</td>
                    <td style="padding: 10px 14px;">
                      <span style="font-size: 10px; color: var(--text-primary); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 3px; border: 1px solid var(--border-dim);">
                        ${s.badge}
                      </span>
                    </td>
                    <td style="padding: 10px 14px; text-align: center;">
                      <button class="rank-view-code-btn" data-id="${s.id}" style="background: transparent; border: 1px solid var(--border-primary); color: var(--green-bright); font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 3px; cursor: pointer;">
                        👁 SCRIPT
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DE INSPECCIÓN DE CÓDIGO (OCULTO POR DEFECTO) -->
      <div id="modal-ranking-code" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); z-index: var(--z-modal, 9999); justify-content: center; align-items: center; padding: 20px;">
        <div style="background: var(--bg-primary); border: 2px solid var(--green-bright); border-radius: var(--radius-md); max-width: 700px; width: 100%; box-shadow: 0 0 30px rgba(0,255,65,0.3); overflow: hidden;">
          <div style="padding: 12px 18px; background: rgba(0,255,65,0.08); border-bottom: 1px solid var(--border-primary); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--font-display); font-size: 13px; color: var(--green-bright);" id="modal-code-title">INSPECTOR DE SCRIPT // GHOSTSCRIPT</span>
            <button id="modal-code-btn-close" style="background: transparent; border: none; color: var(--red-alert); font-family: var(--font-mono); font-size: 16px; cursor: pointer;">✕</button>
          </div>
          <div style="padding: 16px;">
            <div id="modal-code-meta" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); margin-bottom: 12px; display: flex; gap: 14px;"></div>
            <pre id="modal-code-body" style="background: #050a05; border: 1px solid var(--border-dim); padding: 14px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; color: var(--green-bright); overflow-x: auto; max-height: 340px; line-height: 1.5; white-space: pre-wrap;"></pre>
          </div>
          <div style="padding: 12px 16px; background: rgba(0,0,0,0.4); border-top: 1px solid var(--border-dim); display: flex; justify-content: flex-end; gap: 10px;">
            <button id="modal-code-btn-copy" class="menu-btn" style="width: auto; padding: 6px 14px; font-size: 11px; border-color: var(--cyan); color: var(--cyan);">
              📋 COPIAR SCRIPT
            </button>
            <button id="modal-code-btn-load" class="menu-btn" style="width: auto; padding: 6px 14px; font-size: 11px; border-color: var(--green-bright); color: var(--green-bright);">
              ⚡ CARGAR EN EDITOR
            </button>
          </div>
        </div>
      </div>

      <!-- BOTONES DE NAVEGACIÓN INFERIOR -->
      <div style="display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;">
        <button class="menu-btn" id="btn-ranking-back-menu" style="width: auto; padding: 10px 24px;">
          ‹ VOLVER AL MENÚ
        </button>
        <button class="menu-btn" id="btn-ranking-go-editor" style="width: auto; padding: 10px 24px; border-color: var(--yellow-warn); color: var(--yellow-warn);">
          ⚡ ABRIR EDITOR GHOSTSCRIPT
        </button>
        <button class="menu-btn" id="btn-ranking-go-hall" style="width: auto; padding: 10px 24px; border-color: var(--cyan); color: var(--cyan);">
          🏆 HALL OF FAME GLOBAL (PUNTUACIÓN)
        </button>
      </div>

    </div>
  `;

  // ── EVENT LISTENERS DE CONTROLES ──

  // Filtros de reto
  container.querySelectorAll('.rank-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filtroActivoReto = e.currentTarget.getAttribute('data-reto');
      renderScriptRankingScreen(target);
    });
  });

  // Criterios de ordenación
  container.querySelectorAll('.rank-sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      criterioActivo = e.currentTarget.getAttribute('data-criterio');
      renderScriptRankingScreen(target);
    });
  });

  // Modal para ver código
  const modal = container.querySelector('#modal-ranking-code');
  const modalTitle = container.querySelector('#modal-code-title');
  const modalMeta = container.querySelector('#modal-code-meta');
  const modalBody = container.querySelector('#modal-code-body');
  const btnCloseModal = container.querySelector('#modal-code-btn-close');
  const btnCopyModal = container.querySelector('#modal-code-btn-copy');
  const btnLoadModal = container.querySelector('#modal-code-btn-load');

  let scriptSeleccionadoActual = null;

  container.querySelectorAll('.rank-view-code-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const item = soluciones.find(s => s.id === id);
      if (!item || !modal) return;

      scriptSeleccionadoActual = item;
      modalTitle.textContent = `SCRIPT // ${item.autor} (${item.tituloReto})`;
      modalMeta.innerHTML = `
        <span><strong>Líneas:</strong> <span style="color: #ffeb3b;">${item.lineas}</span></span>
        <span><strong>Ops CPU:</strong> <span style="color: var(--cyan);">${item.ops}</span></span>
        <span><strong>Elegancia:</strong> <span style="color: var(--green-bright);">${item.elegancia} pts</span></span>
        <span><strong>Insignia:</strong> ${item.badge}</span>
      `;
      modalBody.textContent = item.codigo || '// Código no disponible';
      modal.style.display = 'flex';
    });
  });

  if (btnCloseModal && modal) {
    btnCloseModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (btnCopyModal) {
    btnCopyModal.addEventListener('click', () => {
      if (!scriptSeleccionadoActual) return;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(scriptSeleccionadoActual.codigo);
        btnCopyModal.textContent = '✔ COPIADO';
        setTimeout(() => { btnCopyModal.textContent = '📋 COPIAR SCRIPT'; }, 2000);
      }
    });
  }

  if (btnLoadModal) {
    btnLoadModal.addEventListener('click', () => {
      if (!scriptSeleccionadoActual) return;
      import('./editor.js').then(ed => {
        ed.abrirEditor({
          archivo: `reto${scriptSeleccionadoActual.idReto}_solucion.gs`,
          codigo: scriptSeleccionadoActual.codigo
        });
        if (typeof ed.seleccionarRetoEnEditor === 'function') {
          ed.seleccionarRetoEnEditor(scriptSeleccionadoActual.idReto);
        }
      });
      if (modal) modal.style.display = 'none';
    });
  }

  // Navegación
  container.querySelector('#btn-ranking-back-menu')?.addEventListener('click', () => {
    if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
      window.navigateTo('screen-menu');
    }
  });

  container.querySelector('#btn-ranking-go-editor')?.addEventListener('click', () => {
    import('./editor.js').then(ed => {
      ed.abrirEditor();
    });
  });

  container.querySelector('#btn-ranking-go-hall')?.addEventListener('click', () => {
    if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
      window.navigateTo('screen-ranking');
    }
  });
}

// ─────────────────────────────────────────────────
// 5. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export function testRankingSoluciones() {
  console.group('%c[TEST SUITE] Ranking de Soluciones GhostScript (rankingSoluciones.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0;
  let pasados = 0;

  function assert(cond, mensaje) {
    total++;
    console.assert(cond, `[FALLO] ${mensaje}`);
    if (cond) {
      pasados++;
      console.log(`%c[PASS] ${mensaje}`, 'color: #00ff41;');
    } else {
      console.error(`%c[FAIL] ${mensaje}`, 'color: #ff5252;');
    }
  }

  // Test 1: Benchmarks cargados correctamente
  const lista = cargarRankingSoluciones();
  assert(Array.isArray(lista) && lista.length >= 5, 'Carga inicial de ranking con al menos 5 benchmarks');

  // Test 2: Cálculo de puntuación de elegancia (fórmula Zachtronics)
  const score1 = calcularPuntajeElegancia({ lines: 4, ops: 15, maxLines: 15, maxOps: 80 });
  const score2 = calcularPuntajeElegancia({ lines: 14, ops: 75, maxLines: 15, maxOps: 80 });
  assert(score1 > score2, `Solución con menos líneas y menos ops tiene mayor elegancia (${score1} > ${score2})`);

  // Test 3: Ordenación por líneas (concisión)
  const porLineas = obtenerRankingSoluciones(null, 'lineas');
  let ordenadoLineas = true;
  for (let i = 1; i < porLineas.length; i++) {
    if (porLineas[i].lineas < porLineas[i - 1].lineas) {
      ordenadoLineas = false;
      break;
    }
  }
  assert(ordenadoLineas, 'Ordenación por "lineas" coloca las soluciones más cortas primero');

  // Test 4: Ordenación por velocidad (ciclos de CPU)
  const porVelocidad = obtenerRankingSoluciones(null, 'velocidad');
  let ordenadoVelocidad = true;
  for (let i = 1; i < porVelocidad.length; i++) {
    if (porVelocidad[i].ops < porVelocidad[i - 1].ops) {
      ordenadoVelocidad = false;
      break;
    }
  }
  assert(ordenadoVelocidad, 'Ordenación por "velocidad" coloca las soluciones más rápidas primero');

  // Test 5: Registro de solución del jugador
  const testCodigo = `LET p = SCAN "servidor.local"
SEND 443 TO "ghost@nexus"
RETURN 443`;
  const reg = registrarSolucionEnRanking({
    idReto: 1,
    codigo: testCodigo,
    autor: 'TEST_AGENT',
    metricas: { lines: 3, ops: 10 }
  });
  assert(reg.guardado === true, 'Registro exitoso de solución en localStorage');
  assert(reg.posicion >= 1, `Posición asignada al jugador (#${reg.posicion})`);

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en rankingSoluciones.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}

