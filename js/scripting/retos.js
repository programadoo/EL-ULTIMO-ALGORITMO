/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Retos de Scripting Progresivos — FIREWALL_beta (Firewall 2)
 * Especificación: SPEC_3AVANZADO.MD (Secciones 2.2 / 2.3 y Prompt B3)
 * ══════════════════════════════════════════════════
 *
 * Sistema de 5 desafíos de programación progresivos en GhostScript:
 * - Reto 1: Automatización simple (Escaneo de puertos)
 * - Reto 2: Búsqueda eficiente (Detección de 'vera' en logs)
 * - Reto 3: Descifrado en lote (Lote de transmisiones interceptadas)
 * - Reto 4: Optimización (Mínimos ciclos de CPU y filtrado)
 * - Reto 5: Algoritmo Zachtronics (Ordenamiento de marcas de tiempo)
 *
 * Cada reto cuenta con:
 * - Enunciado y contexto narrativo de Firewall 2.
 * - Tests automáticos ejecutados en el sandbox.
 * - Criterios de eficiencia (líneas de código, operaciones de CPU, memoria).
 * - Solución de referencia validada.
 * - Desbloqueo secuencial (pasar el reto N desbloquea el N+1).
 */

import { executeGhostScript, parseGhostScript } from './ghostscript.js';
import { saveToStorage, getState, update } from '../state.js';

export const STORAGE_RETOS_KEY = 'ultimo_algoritmo_retos_progreso';

// ─────────────────────────────────────────────────
// 1. BANCO DE LOS 5 RETOS DE SCRIPTING
// ─────────────────────────────────────────────────

export const BANCO_RETOS = [
  {
    id: 1,
    titulo: 'Reto 1 — Automatización Simple',
    subtitulo: 'Escaneo de puertos abiertos en Firewall Beta',
    enunciado: `Dado un servidor perimetral con una lista de puertos inspeccionados, escribe un script en GhostScript que escanee los puertos, localice el puerto que se encuentra abierto (puerto 443 o el puerto objetivo) y lo transmita a "ghost@nexus". Además, retorna el puerto encontrado con RETURN.`,
    criterios: {
      maxLines: 12,
      maxOps: 60,
      memoriaKB: 64,
      descripcion: 'Máximo 12 líneas de código y menos de 60 operaciones de CPU.'
    },
    codigoInicial: `// Reto 1: Automatización Simple
// Objetivo: Escanear puertos, hallar el puerto abierto (443) y enviarlo

LET puertos = SCAN "servidor.local"
LET abierto = NULL

// Escribe aquí tu bucle de inspección
LOOP 4 TIMES
  LET p = puertos[0]
  IF p == 443 THEN
    abierto = p
    SEND p TO "ghost@nexus"
  END
END

RETURN abierto
`,
    solucionReferencia: `LET puertos = SCAN "servidor.local"
LET abierto = NULL
LOOP 4 TIMES
  LET p = puertos[0]
  IF p == 443 THEN
    abierto = p
    SEND p TO "ghost@nexus"
  END
END
RETURN abierto`,
    tests: [
      {
        nombre: 'Caso 1: Puerto 443 presente en lista estándar',
        initialVars: { PUERTOS_TEST: [21, 22, 80, 443] },
        mockHandlers: {
          scan: () => [21, 22, 80, 443]
        },
        validar: (res) => {
          const sent = res.sentMessages.some(m => m.message === 443 && m.host === 'ghost@nexus');
          return sent || res.result === 443 || res.env.abierto === 443;
        }
      },
      {
        nombre: 'Caso 2: Puerto 443 al principio de la lista',
        initialVars: { PUERTOS_TEST: [443, 8080, 9001] },
        mockHandlers: {
          scan: () => [443, 8080, 9001]
        },
        validar: (res) => {
          const sent = res.sentMessages.some(m => m.message === 443);
          return sent || res.result === 443 || res.env.abierto === 443;
        }
      }
    ]
  },

  {
    id: 2,
    titulo: 'Reto 2 — Búsqueda Eficiente',
    subtitulo: 'Detección del archivo con la firma de Vera',
    enunciado: `La subestación de Aurelia almacena cientos de archivos de registro. Escribe un script que escanee la lista de archivos ("archivos.local"), identifique el archivo confidencial cuyo nombre es exactamente "vera_notes.txt" (o contiene la firma de Vera) y lo envíe a "ghost@nexus" antes de que la rutina de auditoría lo purgue.`,
    criterios: {
      maxLines: 14,
      maxOps: 80,
      memoriaKB: 128,
      descripcion: 'Máximo 14 líneas de código y menos de 80 operaciones de CPU.'
    },
    codigoInicial: `// Reto 2: Búsqueda Eficiente
// Objetivo: Localizar "vera_notes.txt" en la lista de archivos

LET archivos = SCAN "archivos.local"
LET hallado = NULL

LOOP 4 TIMES
  LET f = archivos[0]
  IF f == "vera_notes.txt" THEN
    hallado = f
    SEND f TO "ghost@nexus"
  END
END

RETURN hallado
`,
    solucionReferencia: `LET archivos = SCAN "archivos.local"
LET hallado = NULL
LOOP 4 TIMES
  LET f = archivos[0]
  IF f == "vera_notes.txt" THEN
    hallado = f
    SEND f TO "ghost@nexus"
  END
END
RETURN hallado`,
    tests: [
      {
        nombre: 'Caso 1: vera_notes.txt en posición 2',
        mockHandlers: {
          scan: () => ['audit_01.txt', 'system.log', 'vera_notes.txt', 'backup.dat']
        },
        validar: (res) => {
          const sent = res.sentMessages.some(m => String(m.message).includes('vera'));
          return sent || String(res.result).includes('vera') || String(res.env.hallado).includes('vera');
        }
      },
      {
        nombre: 'Caso 2: vera_notes.txt único en directorio',
        mockHandlers: {
          scan: () => ['vera_notes.txt', 'proxy.conf']
        },
        validar: (res) => {
          const sent = res.sentMessages.some(m => String(m.message).includes('vera'));
          return sent || String(res.result).includes('vera') || String(res.env.hallado).includes('vera');
        }
      }
    ]
  },

  {
    id: 3,
    titulo: 'Reto 3 — Descifrado en Lote',
    subtitulo: 'Procesamiento masivo de paquetes interceptados',
    enunciado: `Aurelia Systems ha cifrado un lote de 3 transmisiones ("log_0.enc", "log_1.enc", "log_2.enc") con la clave "VERA_KEY". Escribe un script en GhostScript que recorra los archivos, ejecute DECRYPT sobre cada uno con la clave indicada, y mantenga un contador "total" con la cantidad de archivos descifrados. Retorna el total procesado.`,
    criterios: {
      maxLines: 15,
      maxOps: 120,
      memoriaKB: 128,
      descripcion: 'Máximo 15 líneas de código y menos de 120 operaciones de CPU.'
    },
    codigoInicial: `// Reto 3: Descifrado en Lote
// Objetivo: Descifrar cada archivo con la clave "VERA_KEY" y contar el total

LET archivos = SCAN "lote.enc"
LET clave = "VERA_KEY"
LET total = 0

LOOP 3 TIMES
  LET f = archivos[total]
  DECRYPT f CON clave
  total = total + 1
END

RETURN total
`,
    solucionReferencia: `LET archivos = SCAN "lote.enc"
LET clave = "VERA_KEY"
LET total = 0
LOOP 3 TIMES
  LET f = archivos[total]
  DECRYPT f CON clave
  total = total + 1
END
RETURN total`,
    tests: [
      {
        nombre: 'Caso 1: Procesamiento de 3 archivos en lote',
        mockHandlers: {
          scan: () => ['log_0.enc', 'log_1.enc', 'log_2.enc'],
          decrypt: (f, k) => `DEC_${f}_${k}`
        },
        validar: (res) => {
          return res.result === 3 || res.env.total === 3;
        }
      },
      {
        nombre: 'Caso 2: Verificación de incremento secuencial',
        mockHandlers: {
          scan: () => ['sec_a.enc', 'sec_b.enc', 'sec_c.enc']
        },
        validar: (res) => {
          return res.env.total >= 3 || res.result >= 3;
        }
      }
    ]
  },

  {
    id: 4,
    titulo: 'Reto 4 — Optimización de CPU',
    subtitulo: 'Infiltración quirúrgica en menos de 35 operaciones',
    enunciado: `Tu script de extracción en Firewall Beta es monitoreado por un watchdog de Aurelia. Debes crackear la contraseña del usuario "admin" (segundo usuario de la lista de SCAN) y enviarla inmediatamente a "ghost@nexus" sin ejecutar operaciones redundantes. Restricción estricta: el script debe resolver el objetivo en menos de 35 operaciones de CPU.`,
    criterios: {
      maxLines: 10,
      maxOps: 35,
      memoriaKB: 64,
      descripcion: 'Menos de 10 líneas de código y estrictamente menos de 35 operaciones de CPU.'
    },
    codigoInicial: `// Reto 4: Optimización Quirúrgica
// Objetivo: Obtener clave de users[1] y enviarla con el mínimo de ciclos de CPU

LET users = SCAN "target.local"
LET pass = CRACK users[1]
IF pass != NULL THEN
  SEND pass TO "ghost@nexus"
END
RETURN pass
`,
    solucionReferencia: `LET users = SCAN "target.local"
LET pass = CRACK users[1]
IF pass != NULL THEN
  SEND pass TO "ghost@nexus"
END
RETURN pass`,
    tests: [
      {
        nombre: 'Caso 1: Crackeo directo del usuario admin (users[1])',
        mockHandlers: {
          scan: () => ['guest', 'admin', 'operator'],
          crack: (u) => (u === 'admin' ? 'omega_pass_99' : '123')
        },
        validar: (res) => {
          const sent = res.sentMessages.some(m => m.host === 'ghost@nexus');
          const bajoLimiteOps = res.operationsCount <= 35;
          return sent && bajoLimiteOps;
        }
      }
    ]
  },

  {
    id: 5,
    titulo: 'Reto 5 — Ordenamiento de Logs',
    subtitulo: 'Ordenamiento burbuja de marcas de tiempo',
    enunciado: `Las transmisiones de la base de datos de Aurelia han llegado desordenadas cronológicamente: un array de 4 valores numéricos desordenados (ej. [40, 10, 30, 20]). Implementa en GhostScript un algoritmo de ordenamiento que compare pares adyacentes (IF arr[i] > arr[i+1]) e intercambie sus posiciones mediante una variable auxiliar ("LET tmp = arr[i]"), logrando que el array final quede ordenado ascendentemente: [10, 20, 30, 40].`,
    criterios: {
      maxLines: 22,
      maxOps: 250,
      memoriaKB: 256,
      descripcion: 'Ordenamiento por comparaciones e intercambios sin desbordar memoria.'
    },
    codigoInicial: `// Reto 5: Algoritmo de Ordenamiento de Logs
// Objetivo: Ordenar el array arr ascendentemente usando intercambios

LET arr = [40, 10, 30, 20]

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

RETURN arr
`,
    solucionReferencia: `LET arr = [40, 10, 30, 20]
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
RETURN arr`,
    tests: [
      {
        nombre: 'Caso 1: Array [40, 10, 30, 20] ordenado a [10, 20, 30, 40]',
        validar: (res) => {
          const arr = res.result || res.env.arr;
          if (!Array.isArray(arr) || arr.length < 4) return false;
          return arr[0] <= arr[1] && arr[1] <= arr[2] && arr[2] <= arr[3] && arr[0] === 10 && arr[3] === 40;
        }
      }
    ]
  }
];

// ─────────────────────────────────────────────────
// 2. GESTOR DE ESTADO Y DESBLOQUEO SECUENCIAL
// ─────────────────────────────────────────────────

/**
 * Carga el estado de progreso de los retos desde localStorage.
 * Por defecto, el Reto 1 está desbloqueado.
 * @returns {{
 *   desbloqueadoHasta: number,
 *   completados: Record<number, { fecha: number, lines: number, ops: number }>
 * }}
 */
export function cargarEstadoRetos() {
  try {
    const raw = localStorage.getItem(STORAGE_RETOS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data.desbloqueadoHasta === 'number') {
        return data;
      }
    }
  } catch (e) {
    console.warn('[Retos] No se pudo leer el progreso de retos:', e);
  }

  return {
    desbloqueadoHasta: 1,
    completados: {}
  };
}

/**
 * Guarda el progreso tras completar un reto con éxito. Desbloquea el siguiente reto.
 * @param {number} idReto
 * @param {{ lines: number, ops: number }} metricas
 * @returns {{ desbloqueadoNuevo: boolean, siguienteReto: number }}
 */
export function registrarRetoCompletado(idReto, metricas = {}) {
  const estado = cargarEstadoRetos();
  const idNum = parseInt(idReto, 10);

  estado.completados[idNum] = {
    fecha: Date.now(),
    lines: metricas.lines || 0,
    ops: metricas.ops || 0
  };

  let desbloqueadoNuevo = false;
  let siguienteReto = idNum + 1;

  if (idNum >= estado.desbloqueadoHasta && idNum < BANCO_RETOS.length) {
    estado.desbloqueadoHasta = idNum + 1;
    desbloqueadoNuevo = true;
  }

  saveToStorage(STORAGE_RETOS_KEY, estado);

  // Bonificación en el estado del juego si estamos en Firewall 2
  try {
    const st = getState();
    if (st && st.currentFirewall === 1) {
      update({
        score: (st.score || 0) + 150,
        scriptingSolved: (st.scriptingSolved || 0) + 1
      });
    }
  } catch (_) {}

  return { desbloqueadoNuevo, siguienteReto };
}

/**
 * Comprueba si un reto específico está desbloqueado para el jugador.
 * @param {number} idReto
 * @returns {boolean}
 */
export function esRetoDesbloqueado(idReto) {
  const idNum = parseInt(idReto, 10);
  if (idNum === 1) return true;
  const estado = cargarEstadoRetos();
  return idNum <= (estado.desbloqueadoHasta || 1);
}

/**
 * Retorna la lista completa de retos con su metadata de estado interactivo.
 * @returns {Array<object>}
 */
export function obtenerListaRetos() {
  const estado = cargarEstadoRetos();
  return BANCO_RETOS.map(r => {
    const completado = Boolean(estado.completados[r.id]);
    const desbloqueado = r.id === 1 || r.id <= estado.desbloqueadoHasta;
    return {
      ...r,
      completado,
      desbloqueado,
      bloqueado: !desbloqueado,
      record: estado.completados[r.id] || null
    };
  });
}

// ─────────────────────────────────────────────────
// 3. MOTOR DE VALIDACIÓN Y EVALUACIÓN DE TESTS
// ─────────────────────────────────────────────────

/**
 * Valida un código GhostScript contra los tests y criterios de un reto.
 * 
 * @param {number} idReto
 * @param {string} codigo
 * @returns {{
 *   exito: boolean,
 *   pasados: number,
 *   totalTests: number,
 *   errores: string[],
 *   metricas: { lines: number, ops: number, memoriaKB: number },
 *   criteriosCumplidos: boolean,
 *   desbloqueadoNuevo?: boolean,
 *   siguienteReto?: number
 * }}
 */
export function validarReto(idReto, codigo) {
  const reto = BANCO_RETOS.find(r => r.id === parseInt(idReto, 10));
  if (!reto) {
    return {
      exito: false,
      pasados: 0,
      totalTests: 0,
      errores: [`Reto #${idReto} no encontrado en el sistema.`],
      metricas: { lines: 0, ops: 0, memoriaKB: 0 },
      criteriosCumplidos: false
    };
  }

  // 1. Análisis de líneas de código (ignorando comentarios y líneas en blanco)
  const lineasReales = codigo
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('//'));
  const linesCount = lineasReales.length;

  // 2. Verificación de sintaxis
  try {
    parseGhostScript(codigo);
  } catch (err) {
    return {
      exito: false,
      pasados: 0,
      totalTests: reto.tests.length,
      errores: [`Error de sintaxis: ${err.message}`],
      metricas: { lines: linesCount, ops: 0, memoriaKB: reto.criterios.memoriaKB },
      criteriosCumplidos: false
    };
  }

  // 3. Ejecución de la batería de tests automatizados
  let pasados = 0;
  const errores = [];
  let maxOpsUsadas = 0;

  for (let i = 0; i < reto.tests.length; i++) {
    const test = reto.tests[i];
    const initialVars = { ...(test.initialVars || {}) };
    const options = {
      ...(test.mockHandlers || {}),
      maxOperations: reto.criterios.maxOps * 2
    };

    const res = executeGhostScript(codigo, options, initialVars);

    if (!res.success) {
      errores.push(`[Test ${i + 1}: ${test.nombre}] Falló con error: ${res.error}`);
      continue;
    }

    maxOpsUsadas = Math.max(maxOpsUsadas, res.operationsCount);

    const testAprobado = test.validar(res);
    if (testAprobado) {
      pasados++;
    } else {
      errores.push(`[Test ${i + 1}: ${test.nombre}] El resultado no satisfizo las aserciones del reto.`);
    }
  }

  // 4. Verificación de criterios de eficiencia
  const cumpleLineas = linesCount <= reto.criterios.maxLines;
  const cumpleOps = maxOpsUsadas <= reto.criterios.maxOps;
  const criteriosCumplidos = cumpleLineas && cumpleOps;

  if (!cumpleLineas) {
    errores.push(`Líneas excedidas: ${linesCount} líneas (máximo permitido: ${reto.criterios.maxLines}).`);
  }
  if (!cumpleOps) {
    errores.push(`Ciclos de CPU excedidos: ${maxOpsUsadas} ops (máximo permitido: ${reto.criterios.maxOps}).`);
  }

  const exito = pasados === reto.tests.length && criteriosCumplidos;

  let desbloqueoInfo = { desbloqueadoNuevo: false, siguienteReto: reto.id + 1 };
  if (exito) {
    desbloqueoInfo = registrarRetoCompletado(reto.id, { lines: linesCount, ops: maxOpsUsadas });
  }

  return {
    exito,
    pasados,
    totalTests: reto.tests.length,
    errores,
    metricas: {
      lines: linesCount,
      ops: maxOpsUsadas,
      memoriaKB: reto.criterios.memoriaKB
    },
    criteriosCumplidos,
    desbloqueadoNuevo: desbloqueoInfo.desbloqueadoNuevo,
    siguienteReto: desbloqueoInfo.siguienteReto
  };
}

// ─────────────────────────────────────────────────
// 4. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export function testRetos() {
  console.group('%c[TEST SUITE] Retos de Scripting (retos.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Verificación del banco de retos
  assert(BANCO_RETOS.length === 5, 'Deben existir exactamente 5 retos de scripting');
  assert(BANCO_RETOS.every(r => r.criterios && r.criterios.maxLines && r.criterios.maxOps), 'Todos los retos deben tener criterios de eficiencia');

  // 2. Validación de la solución de referencia del Reto 1
  const res1 = validarReto(1, BANCO_RETOS[0].solucionReferencia);
  assert(res1.exito, `Solución de referencia Reto 1 debe pasar (errores: ${res1.errores.join(', ')})`);
  assert(res1.criteriosCumplidos, 'Reto 1 debe cumplir criterios de eficiencia');

  // 3. Validación de la solución de referencia del Reto 2
  const res2 = validarReto(2, BANCO_RETOS[1].solucionReferencia);
  assert(res2.exito, `Solución de referencia Reto 2 debe pasar (errores: ${res2.errores.join(', ')})`);

  // 4. Validación de la solución de referencia del Reto 3
  const res3 = validarReto(3, BANCO_RETOS[2].solucionReferencia);
  assert(res3.exito, `Solución de referencia Reto 3 debe pasar (errores: ${res3.errores.join(', ')})`);

  // 5. Validación de la solución de referencia del Reto 4 (Optimización)
  const res4 = validarReto(4, BANCO_RETOS[3].solucionReferencia);
  assert(res4.exito, `Solución de referencia Reto 4 debe pasar (errores: ${res4.errores.join(', ')})`);
  assert(res4.metricas.ops <= 35, `Reto 4 debe ejecutarse en <= 35 ops (obtenido: ${res4.metricas.ops})`);

  // 6. Validación de la solución de referencia del Reto 5 (Algoritmo Zachtronics)
  const res5 = validarReto(5, BANCO_RETOS[4].solucionReferencia);
  assert(res5.exito, `Solución de referencia Reto 5 debe pasar (errores: ${res5.errores.join(', ')})`);

  // 7. Prueba del sistema de desbloqueo progresivo
  assert(esRetoDesbloqueado(1), 'Reto 1 debe estar siempre desbloqueado por defecto');
  const lista = obtenerListaRetos();
  assert(lista.length === 5, 'obtenerListaRetos debe retornar 5 elementos');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Retos de Scripting: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Retos: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

