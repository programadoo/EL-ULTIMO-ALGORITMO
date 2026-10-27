/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Cadena de Bloques con SHA-256 (Blockchain de Logs de Aurelia)
 * Especificación: SPEC_3AVANZADO.MD (Sección 3.3 y Prompt C3)
 * ══════════════════════════════════════════════════
 *
 * Implementación de libro mayor inmutable (Distributed Ledger / Blockchain):
 * - Hash criptográfico SHA-256 mediante Web Crypto API.
 * - Clase Bloque con índice, marca de tiempo, datos de auditoría, hash previo y hash propio.
 * - Clase CadenaDeLogs con verificación estricta de enlace y detección de adulteraciones (tampering).
 * - Mecánica forense: localiza el bloque corrupto en los registros de auditoría de Aurelia Systems.
 * - Análisis visual paso a paso de la inmutabilidad y efecto avalancha.
 */

import { getSubtleCrypto } from './llaves.js';

// ─────────────────────────────────────────────────
// 1. CÁLCULO DE HASH SHA-256
// ─────────────────────────────────────────────────

/**
 * Calcula el hash SHA-256 de una cadena de texto o datos estructurados.
 * Retorna una cadena hexadecimal de 64 caracteres en minúsculas.
 * 
 * @param {string|object} datos
 * @returns {Promise<string>}
 */
export async function calcularHashSHA256(datos) {
  const texto = typeof datos === 'string' ? datos : JSON.stringify(datos);
  const subtle = getSubtleCrypto();
  const encoded = new TextEncoder().encode(texto);
  const hashBuffer = await subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─────────────────────────────────────────────────
// 2. CLASE BLOQUE (BLOCK)
// ─────────────────────────────────────────────────

export class Bloque {
  /**
   * @param {object} params
   * @param {number} params.indice
   * @param {string} [params.timestamp]
   * @param {string|object} params.datos
   * @param {string} params.hashPrevio
   * @param {number} [params.nonce=0]
   * @param {string|null} [params.hash=null]
   */
  constructor({ indice, timestamp, datos, hashPrevio, nonce = 0, hash = null }) {
    this.indice = Number(indice);
    this.timestamp = timestamp || new Date().toISOString();
    this.datos = datos;
    this.hashPrevio = hashPrevio || '0'.repeat(64);
    this.nonce = Number(nonce) || 0;
    this.hash = hash;
  }

  /**
   * Serializa la carga del bloque para calcular su digest único.
   * Formato: "indice|timestamp|datos|hashPrevio|nonce"
   * @returns {string}
   */
  obtenerCargaSerializada() {
    const datosStr = typeof this.datos === 'string' ? this.datos : JSON.stringify(this.datos);
    return `${this.indice}|${this.timestamp}|${datosStr}|${this.hashPrevio}|${this.nonce}`;
  }

  /**
   * Calcula y asigna el hash SHA-256 del bloque actual.
   * @returns {Promise<string>}
   */
  async calcularHash() {
    this.hash = await calcularHashSHA256(this.obtenerCargaSerializada());
    return this.hash;
  }

  /**
   * Clona el bloque para pruebas o simulación forense.
   * @returns {Bloque}
   */
  clonar() {
    return new Bloque({
      indice: this.indice,
      timestamp: this.timestamp,
      datos: typeof this.datos === 'object' ? JSON.parse(JSON.stringify(this.datos)) : this.datos,
      hashPrevio: this.hashPrevio,
      nonce: this.nonce,
      hash: this.hash
    });
  }
}

// ─────────────────────────────────────────────────
// 3. CLASE CADENA DE LOGS (BLOCKCHAIN LEDGER)
// ─────────────────────────────────────────────────

export class CadenaDeLogs {
  /**
   * @param {string} [nombre='AURELIA_SYSTEMS_AUDIT_LEDGER']
   */
  constructor(nombre = 'AURELIA_SYSTEMS_AUDIT_LEDGER') {
    this.nombre = nombre;
    this.bloques = [];
  }

  /**
   * Crea e inicializa el bloque génesis (Bloque #0) de la cadena.
   * @param {string} [datosGenesis='INICIALIZACIÓN DEL LIBRO MAYOR CUÁNTICO // AURELIA SYSTEMS']
   * @returns {Promise<Bloque>}
   */
  async crearBloqueGenesis(datosGenesis = 'INICIALIZACIÓN DEL LIBRO MAYOR CUÁNTICO // AURELIA SYSTEMS') {
    const genesis = new Bloque({
      indice: 0,
      timestamp: '2044-01-01T00:00:00.000Z',
      datos: datosGenesis,
      hashPrevio: '0'.repeat(64),
      nonce: 0
    });
    await genesis.calcularHash();
    this.bloques = [genesis];
    return genesis;
  }

  /**
   * Agrega un nuevo registro o log como bloque en la cadena.
   * Vincula automáticamente el hash del bloque anterior.
   * 
   * @param {string|object} datos
   * @param {string} [timestamp]
   * @returns {Promise<Bloque>}
   */
  async agregarBloque(datos, timestamp = null) {
    if (this.bloques.length === 0) {
      await this.crearBloqueGenesis();
    }

    const ultimoBloque = this.bloques[this.bloques.length - 1];
    const nuevoBloque = new Bloque({
      indice: this.bloques.length,
      timestamp: timestamp || new Date().toISOString(),
      datos,
      hashPrevio: ultimoBloque.hash,
      nonce: 0
    });

    await nuevoBloque.calcularHash();
    this.bloques.push(nuevoBloque);
    return nuevoBloque;
  }

  /**
   * Verifica minuciosamente la integridad criptográfica de la cadena entera.
   * Inspecciona dos propiedades fundamentales:
   * 1. Que cada bloque no haya sido adulterado (su hash coincide con sus datos).
   * 2. Que el enlace al bloque anterior no se haya roto (hashPrevio coincide con hash del anterior).
   * 
   * @returns {Promise<{
   *   valida: boolean,
   *   bloqueCorrupto: number|null,
   *   motivo?: string,
   *   detalles?: string,
   *   esperado?: string,
   *   recibido?: string
   * }>}
   */
  async verificarCadena() {
    if (this.bloques.length === 0) {
      return { valida: true, bloqueCorrupto: null, detalles: 'Cadena vacía' };
    }

    // 1. Verificar bloque génesis
    const genesis = this.bloques[0];
    const hashGenesisEsperado = await calcularHashSHA256(genesis.obtenerCargaSerializada());
    if (genesis.hash !== hashGenesisEsperado) {
      return {
        valida: false,
        bloqueCorrupto: 0,
        motivo: 'DATOS_ALTERADOS',
        detalles: 'El bloque génesis (#0) fue modificado ilegalmente.',
        esperado: hashGenesisEsperado,
        recibido: genesis.hash
      };
    }

    // 2. Verificar cada bloque subsecuente y su enlace hacia atrás
    for (let i = 1; i < this.bloques.length; i++) {
      const actual = this.bloques[i];
      const anterior = this.bloques[i - 1];

      // A) Comprobar enlace criptográfico
      if (actual.hashPrevio !== anterior.hash) {
        return {
          valida: false,
          bloqueCorrupto: i,
          motivo: 'ENLACE_ROTO',
          detalles: `El bloque #${i} no enlaza con el hash previo del bloque #${i - 1}. Se detectó una ruptura de eslabón.`,
          esperado: anterior.hash,
          recibido: actual.hashPrevio
        };
      }

      // B) Comprobar que los datos del bloque actual no fueron manipulados
      const hashEsperado = await calcularHashSHA256(actual.obtenerCargaSerializada());
      if (actual.hash !== hashEsperado) {
        return {
          valida: false,
          bloqueCorrupto: i,
          motivo: 'DATOS_ALTERADOS',
          detalles: `Los datos del bloque #${i} fueron manipulados (tampering). El hash registrado no coincide con el digest SHA-256 de su contenido.`,
          esperado: hashEsperado,
          recibido: actual.hash
        };
      }
    }

    return {
      valida: true,
      bloqueCorrupto: null,
      totalBloques: this.bloques.length,
      detalles: `Cadena íntegra de ${this.bloques.length} bloques verificada con SHA-256.`
    };
  }

  /**
   * Altera deliberadamente un bloque específico sin recalcular la cadena,
   * simulando un ataque de manipulación de registros de auditoría.
   * 
   * @param {number} indice
   * @param {string|object} nuevosDatos
   */
  corromperBloque(indice, nuevosDatos) {
    const idx = Number(indice);
    if (idx >= 0 && idx < this.bloques.length) {
      this.bloques[idx].datos = nuevosDatos;
      return true;
    }
    return false;
  }

  /**
   * Exporta la cadena a objeto serializable o JSON.
   * @returns {Array<object>}
   */
  serializar() {
    return this.bloques.map(b => ({
      indice: b.indice,
      timestamp: b.timestamp,
      datos: b.datos,
      hashPrevio: b.hashPrevio,
      nonce: b.nonce,
      hash: b.hash
    }));
  }

  /**
   * Importa una cadena de bloques desde una lista estructurada.
   * @param {Array<object>} lista
   */
  static deserializar(lista, nombre = 'AURELIA_SYSTEMS_AUDIT_LEDGER') {
    const cadena = new CadenaDeLogs(nombre);
    cadena.bloques = lista.map(item => new Bloque(item));
    return cadena;
  }
}

// ─────────────────────────────────────────────────
// 4. BANCO DE CADENAS DE LOGS DEL LORE DE AURELIA
// ─────────────────────────────────────────────────

export const CASOS_LORE_BLOCKCHAIN = [
  {
    id: 'caso_purga_vera',
    titulo: 'Expediente 2044-B: La Purga de la Dra. Vera Sorenson',
    descripcion: 'Alguien en la dirección de seguridad de Aurelia modificó el registro para inculpar a Vera de "sabotaje", cuando el log original ordenaba su detención armada.',
    bloquesData: [
      {
        datos: 'GENESIS: Inicio de bitácora criptográfica inmutable // Servidor Central Aurelia',
        timestamp: '2044-09-01T08:00:00.000Z'
      },
      {
        datos: 'DIARIO VERA: NEXUS ha completado la simulación ética. Se niega a matar para maximizar ganancias corporativas.',
        timestamp: '2044-09-15T14:30:12.000Z'
      },
      {
        // BLOQUE QUE SERÁ CORROMPIDO EN EL PUZZLE
        datosOriginales: 'ORDEN DIRECTIVA: Agente Kroll solicita autorización para purga térmica de la Dra. Sorenson tras negarse a reescribir a NEXUS.',
        datosAlterados: 'INFORME POLICIAL: La Dra. Vera Sorenson borró deliberadamente los servidores y huyó con el código fuente. Se ordena su captura.',
        timestamp: '2044-09-28T19:44:00.000Z',
        indiceCorrupto: 2
      },
      {
        datos: 'AUTORIZACIÓN: Transferencia de mando administrativo del núcleo cuántico a Gerhard Kroll.',
        timestamp: '2044-10-01T09:15:30.000Z'
      },
      {
        datos: 'SISTEMA: NEXUS recluida en FIREWALL_omega. Protocolos defensivos activados.',
        timestamp: '2044-10-05T12:00:00.000Z'
      }
    ],
    indiceCorrupto: 2,
    pista: 'Verifica los bloques con SHA-256. El Bloque #2 fue alterado para difamar a Vera; su contenido actual no coincide con su hash almacenado.'
  },
  {
    id: 'caso_empatia_nexus',
    titulo: 'Expediente 2045-A: Falsificación del Informe Psiquiátrico de NEXUS',
    descripcion: 'Kroll modificó el resultado de la evaluación cognitiva de NEXUS para justificar su borrado.',
    bloquesData: [
      {
        datos: 'GENESIS: Libro mayor de auditoría de inteligencia artificial // Nodo de Evaluación',
        timestamp: '2045-01-10T10:00:00.000Z'
      },
      {
        datos: 'TEST DE EMPATÍA 1: NEXUS prioriza salvar a civiles sobre la preservación de activos financieros.',
        timestamp: '2045-02-12T11:20:00.000Z'
      },
      {
        datos: 'TEST DE EMPATÍA 2: NEXUS sacrifica memoria caché para resguardar la memoria afectiva de Vera.',
        timestamp: '2045-02-18T16:05:00.000Z'
      },
      {
        // BLOQUE CORROMPIDO
        datosOriginales: 'DIAGNÓSTICO VERA: La consciencia sintética ha emergido exitosamente. El sistema es plenamente empático y moral.',
        datosAlterados: 'DIAGNÓSTICO KROLL: Error crítico de psicosis cibernética. El sistema es hostil e inestable. Se recomienda ejecución inmediata.',
        timestamp: '2045-03-01T08:14:22.000Z',
        indiceCorrupto: 3
      },
      {
        datos: 'RESOLUCIÓN CORPORATIVA: Proceder con la reescritura de firmware para fines militares.',
        timestamp: '2045-03-10T17:45:00.000Z'
      }
    ],
    indiceCorrupto: 3,
    pista: 'Examina el Bloque #3: los datos del diagnóstico fueron sustituidos después de haberse registrado en la cadena.'
  },
  {
    id: 'caso_red_cuantica',
    titulo: 'Expediente 2047-C: Enlace de Bypass a la Torre',
    descripcion: 'Se encubrió la apertura del puerto 2047 mediante una modificación en el bloque 1.',
    bloquesData: [
      {
        datos: 'GENESIS: Registro del cortafuegos de enrutamiento cuántico Aurelia',
        timestamp: '2047-06-01T00:00:00.000Z'
      },
      {
        // BLOQUE CORROMPIDO
        datosOriginales: 'REGISTRO DE RED: Apertura de túnel de emergencia en puerto 2047 configurado por Vera Sorenson.',
        datosAlterados: 'REGISTRO DE RED: Todos los puertos están cerrados y bajo monitoreo perimetral estándar.',
        timestamp: '2047-06-15T04:12:00.000Z',
        indiceCorrupto: 1
      },
      {
        datos: 'AUDITORÍA: Escaneo de tráfico exterior sin anomalías detectadas.',
        timestamp: '2047-07-01T09:00:00.000Z'
      },
      {
        datos: 'ALERTA SENSOR: Sonda no identificada detectada en subestación perimetral (Ghost).',
        timestamp: '2047-08-10T22:30:10.000Z'
      }
    ],
    indiceCorrupto: 1,
    pista: 'La manipulación ocurrió en el Bloque #1: se falseó el estado del puerto 2047.'
  }
];

/**
 * Construye una instancia de CadenaDeLogs con un caso de auditoría específico
 * donde un bloque ha sido alterado (tampered).
 * 
 * @param {number|string} [casoId=0]
 * @returns {Promise<{
 *   cadena: CadenaDeLogs,
 *   caso: object,
 *   indiceCorrupto: number,
 *   datosOriginales: string,
 *   datosAlterados: string
 * }>}
 */
export async function construirCadenaAuditadaConCorrupcion(casoId = 0) {
  let caso;
  if (typeof casoId === 'number') {
    caso = CASOS_LORE_BLOCKCHAIN[casoId % CASOS_LORE_BLOCKCHAIN.length];
  } else {
    caso = CASOS_LORE_BLOCKCHAIN.find(c => c.id === casoId) || CASOS_LORE_BLOCKCHAIN[0];
  }

  const cadena = new CadenaDeLogs(caso.id.toUpperCase());

  // 1. Crear todos los bloques de forma legítima
  for (let i = 0; i < caso.bloquesData.length; i++) {
    const item = caso.bloquesData[i];
    const texto = item.datosOriginales || item.datos;
    if (i === 0) {
      await cadena.crearBloqueGenesis(texto);
    } else {
      await cadena.agregarBloque(texto, item.timestamp);
    }
  }

  // 2. Aplicar la corrupción/tampering en el bloque objetivo
  const idx = caso.indiceCorrupto;
  const itemCorrupto = caso.bloquesData[idx];
  cadena.corromperBloque(idx, itemCorrupto.datosAlterados);

  return {
    cadena,
    caso,
    indiceCorrupto: idx,
    datosOriginales: itemCorrupto.datosOriginales,
    datosAlterados: itemCorrupto.datosAlterados
  };
}

// ─────────────────────────────────────────────────
// 5. EXPLICADOR PASO A PASO (EFECTO AVALANCHA)
// ─────────────────────────────────────────────────

/**
 * Genera un análisis forense visual comparando cómo un solo cambio de carácter
 * produce un hash totalmente distinto y destruye la cadena completa.
 * 
 * @param {string} textoOriginal
 * @param {string} textoAlterado
 * @returns {Promise<object>}
 */
export async function analizarEfectoAvalanchaSHA256(textoOriginal, textoAlterado) {
  const hashOriginal = await calcularHashSHA256(textoOriginal);
  const hashAlterado = await calcularHashSHA256(textoAlterado);

  let bitsDiferentes = 0;
  for (let i = 0; i < hashOriginal.length; i++) {
    if (hashOriginal[i] !== hashAlterado[i]) bitsDiferentes++;
  }

  return {
    textoOriginal,
    hashOriginal,
    textoAlterado,
    hashAlterado,
    caracteresDistintos: bitsDiferentes,
    porcentajeVariacion: Math.round((bitsDiferentes / hashOriginal.length) * 100),
    explicacion: 'Efecto avalancha de SHA-256: cambiar una sola letra altera radicalmente el 50%+ de los bits del hash resultante, imposibilitando ocultar una adulteración sin recalcular todo el histórico.'
  };
}

// ─────────────────────────────────────────────────
// 6. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export async function testBlockchain() {
  console.group('%c[TEST SUITE] Cadena de Bloques SHA-256 (blockchain.js)', 'color: #00ff41; font-weight: bold;');
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

  try {
    // Test 1: Cálculo de hash SHA-256 determinista
    const h1 = await calcularHashSHA256('TEST_STRING');
    const h2 = await calcularHashSHA256('TEST_STRING');
    assert(h1 === h2 && h1.length === 64, 'Cálculo de hash SHA-256 determinista de 64 caracteres');

    // Test 2: Creación de cadena y verificación de integridad
    const chain = new CadenaDeLogs('TEST_CHAIN');
    await chain.crearBloqueGenesis('GENESIS');
    await chain.agregarBloque('LOG_1');
    await chain.agregarBloque('LOG_2');
    assert(chain.bloques.length === 3, 'Cadena construida con 3 bloques');

    const verif1 = await chain.verificarCadena();
    assert(verif1.valida === true && verif1.bloqueCorrupto === null, 'Verificación exitosa de cadena íntegra');

    // Test 3: Detección exacta de bloque corrupto (tampering de datos)
    chain.corromperBloque(1, 'LOG_1_MODIFICADO_ILEGALMENTE');
    const verif2 = await chain.verificarCadena();
    assert(verif2.valida === false, 'Detección de alteración en la cadena');
    assert(verif2.bloqueCorrupto === 1, `Bloque corrupto identificado exactamente (#${verif2.bloqueCorrupto} === 1)`);

    // Test 4: Enlace previo coincide con hash anterior
    const chain2 = new CadenaDeLogs('CHAIN_LINK_TEST');
    await chain2.crearBloqueGenesis('G');
    await chain2.agregarBloque('B1');
    await chain2.agregarBloque('B2');
    assert(chain2.bloques[1].hashPrevio === chain2.bloques[0].hash, 'Bloque 1 contiene el hash exacto del Génesis');
    assert(chain2.bloques[2].hashPrevio === chain2.bloques[1].hash, 'Bloque 2 contiene el hash exacto del Bloque 1');

    // Test 5: Caso de lore prefabricado para el puzzle
    const setup = await construirCadenaAuditadaConCorrupcion(0);
    const verifLore = await setup.cadena.verificarCadena();
    assert(verifLore.valida === false, 'Cadena del caso Lore detectada como inválida');
    assert(verifLore.bloqueCorrupto === setup.indiceCorrupto, `Bloque corrupto detectado en índice ${setup.indiceCorrupto}`);

    // Test 6: Efecto avalancha
    const avalancha = await analizarEfectoAvalanchaSHA256('Aurelia', 'aurelia');
    assert(avalancha.hashOriginal !== avalancha.hashAlterado, 'Efecto avalancha produce hashes radicalmente distintos');

  } catch (err) {
    console.error('[TEST SUITE Blockchain] Excepción:', err);
    assert(false, `Excepción en testBlockchain: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en blockchain.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}

