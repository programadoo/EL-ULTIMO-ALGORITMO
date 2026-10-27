/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Llaves Asimétricas RSA-2048 con Web Crypto API
 * Especificación: SPEC_3AVANZADO.MD (Sección 3.1 y Prompt C1)
 * ══════════════════════════════════════════════════
 *
 * Sistema criptográfico asimétrico de nivel militar:
 * - Generación de pares de llaves RSA-2048 (RSA-OAEP, SHA-256).
 * - Cifrado con llave pública (sólo el receptor puede descifrar).
 * - Descifrado con llave privada del jugador.
 * - Exportación e importación de llaves en formatos estándar PEM (SPKI / PKCS#8) y JWK.
 * - Cálculo de huella digital SHA-256 (fingerprint).
 * - Mecánica de juego: Buzón de transmisiones cifradas dirigidas a la llave pública de Ghost.
 * - Persistencia de la identidad criptográfica en localStorage.
 */

export const STORAGE_KEYS_IDENTITY = 'nexus_crypto_identidad_jugador';
export const STORAGE_INBOX_KEY = 'nexus_crypto_buzon_mensajes';

/**
 * Obtiene el objeto sutil de Web Crypto en cualquier entorno moderno.
 * @returns {SubtleCrypto}
 */
export function getSubtleCrypto() {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) no está disponible en este entorno.');
}

// ─────────────────────────────────────────────────
// 1. GENERACIÓN DE PAR DE LLAVES RSA-2048
// ─────────────────────────────────────────────────

/**
 * Genera un par de llaves criptográficas RSA-2048 utilizando RSA-OAEP y hash SHA-256.
 * 
 * @returns {Promise<{ publicKey: CryptoKey, privateKey: CryptoKey }>}
 */
export async function generarParDeLlaves() {
  const subtle = getSubtleCrypto();
  const par = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256'
    },
    true, // Claves exportables
    ['encrypt', 'decrypt']
  );
  return par;
}

// ─────────────────────────────────────────────────
// 2. CONVERSIÓN BINARIA Y BASE64 SEGURA
// ─────────────────────────────────────────────────

/**
 * Convierte un ArrayBuffer o Uint8Array a cadena Base64 sin desbordamiento de pila.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

/**
 * Convierte una cadena Base64 a Uint8Array.
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function base64ToUint8Array(base64) {
  // Limpiar espacios, saltos de línea y cabeceras PEM si las tuviera
  const sanitized = base64.replace(/\s+/g, '');
  const binary = atob(sanitized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─────────────────────────────────────────────────
// 3. CIFRADO Y DESCIFRADO (RSA-OAEP)
// ─────────────────────────────────────────────────

/**
 * Cifra un mensaje de texto plano con una llave pública RSA-OAEP.
 * Retorna el resultado codificado en Base64.
 * 
 * @param {string} mensaje - Texto plano a cifrar
 * @param {CryptoKey} publicKey - Llave pública RSA del receptor
 * @returns {Promise<string>} Texto cifrado en Base64
 */
export async function cifrarConPublica(mensaje, publicKey) {
  if (!mensaje || typeof mensaje !== 'string') {
    throw new Error('El mensaje a cifrar debe ser una cadena de texto no vacía.');
  }
  if (!publicKey || publicKey.type !== 'public') {
    throw new Error('Se requiere una llave pública válida para el cifrado RSA.');
  }

  const subtle = getSubtleCrypto();
  const encoded = new TextEncoder().encode(mensaje);

  // En RSA-2048 con SHA-256 y OAEP, el tamaño máximo de mensaje en un solo bloque es:
  // 2048/8 - 2 * (256/8) - 2 = 256 - 64 - 2 = 190 bytes
  // Si el mensaje excede este tamaño, realizamos particionado seguro por bloques
  const maxBlockSize = 190;
  if (encoded.length <= maxBlockSize) {
    const cifrado = await subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded
    );
    return arrayBufferToBase64(cifrado);
  }

  // Fragmentación en bloques para mensajes largos
  const bloques = [];
  for (let i = 0; i < encoded.length; i += maxBlockSize) {
    const slice = encoded.subarray(i, i + maxBlockSize);
    const cifradoBloque = await subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      slice
    );
    bloques.push(arrayBufferToBase64(cifradoBloque));
  }
  // Empaquetado multiloque con prefijo descriptivo
  return 'RSA2048_CHUNKED:' + JSON.stringify(bloques);
}

/**
 * Descifra una cadena en Base64 utilizando la llave privada del jugador.
 * Retorna el texto plano original en UTF-8.
 * 
 * @param {string} cifradoBase64 - Cifrado en Base64
 * @param {CryptoKey} privateKey - Llave privada RSA del receptor
 * @returns {Promise<string>} Texto plano descifrado
 */
export async function descifrarConPrivada(cifradoBase64, privateKey) {
  if (!cifradoBase64 || typeof cifradoBase64 !== 'string') {
    throw new Error('El bloque cifrado debe ser una cadena Base64 válida.');
  }
  if (!privateKey || privateKey.type !== 'private') {
    throw new Error('Se requiere una llave privada válida para el descifrado RSA.');
  }

  const subtle = getSubtleCrypto();

  // Soporte para bloques chunked
  if (cifradoBase64.startsWith('RSA2048_CHUNKED:')) {
    const jsonStr = cifradoBase64.substring('RSA2048_CHUNKED:'.length);
    const bloques = JSON.parse(jsonStr);
    const buffers = [];
    for (const b64 of bloques) {
      const bytes = base64ToUint8Array(b64);
      const dec = await subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        bytes
      );
      buffers.push(new Uint8Array(dec));
    }
    // Concatenar todos los buffers
    const totalLen = buffers.reduce((acc, b) => acc + b.length, 0);
    const concat = new Uint8Array(totalLen);
    let offset = 0;
    for (const b of buffers) {
      concat.set(b, offset);
      offset += b.length;
    }
    return new TextDecoder().decode(concat);
  }

  // Descifrado de bloque estándar
  const bytes = base64ToUint8Array(cifradoBase64);
  const decryptedBuffer = await subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    bytes
  );
  return new TextDecoder().decode(decryptedBuffer);
}

// ─────────────────────────────────────────────────
// 4. EXPORTACIÓN E IMPORTACIÓN DE LLAVES (PEM / JWK)
// ─────────────────────────────────────────────────

/**
 * Exporta una llave pública a formato PEM (SPKI).
 * @param {CryptoKey} publicKey
 * @returns {Promise<string>}
 */
export async function exportarLlavePublicaPEM(publicKey) {
  const subtle = getSubtleCrypto();
  const exported = await subtle.exportKey('spki', publicKey);
  const b64 = arrayBufferToBase64(exported);
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

/**
 * Exporta una llave privada a formato PEM (PKCS#8).
 * @param {CryptoKey} privateKey
 * @returns {Promise<string>}
 */
export async function exportarLlavePrivadaPEM(privateKey) {
  const subtle = getSubtleCrypto();
  const exported = await subtle.exportKey('pkcs8', privateKey);
  const b64 = arrayBufferToBase64(exported);
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

/**
 * Importa una llave pública desde una cadena en formato PEM (SPKI).
 * @param {string} pem
 * @returns {Promise<CryptoKey>}
 */
export async function importarLlavePublicaPEM(pem) {
  const subtle = getSubtleCrypto();
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');
  const bytes = base64ToUint8Array(b64);
  return await subtle.importKey(
    'spki',
    bytes,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}

/**
 * Importa una llave privada desde una cadena en formato PEM (PKCS#8).
 * @param {string} pem
 * @returns {Promise<CryptoKey>}
 */
export async function importarLlavePrivadaPEM(pem) {
  const subtle = getSubtleCrypto();
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const bytes = base64ToUint8Array(b64);
  return await subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  );
}

/**
 * Exporta una llave a formato JWK.
 * @param {CryptoKey} key
 * @returns {Promise<object>}
 */
export async function exportarLlaveJWK(key) {
  const subtle = getSubtleCrypto();
  return await subtle.exportKey('jwk', key);
}

/**
 * Importa una llave desde formato JWK.
 * @param {object} jwk
 * @param {'public'|'private'} tipo
 * @returns {Promise<CryptoKey>}
 */
export async function importarLlaveJWK(jwk, tipo) {
  const subtle = getSubtleCrypto();
  const usages = tipo === 'public' ? ['encrypt'] : ['decrypt'];
  return await subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    usages
  );
}

/**
 * Calcula la huella digital SHA-256 de una llave pública.
 * Formato devuelto: "SHA256:4a:f2:9c:..."
 * @param {CryptoKey} publicKey
 * @returns {Promise<string>}
 */
export async function calcularHuellaDigital(publicKey) {
  const subtle = getSubtleCrypto();
  const exported = await subtle.exportKey('spki', publicKey);
  const hashBuf = await subtle.digest('SHA-256', exported);
  const hashBytes = new Uint8Array(hashBuf);
  const hex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join(':');
  return `SHA256:${hex.toUpperCase()}`;
}

// ─────────────────────────────────────────────────
// 5. GESTOR DE IDENTIDAD Y BUZÓN CRIPTOGRÁFICO
// ─────────────────────────────────────────────────

// Caché en memoria para evitar regenerar o importar llaves repetidamente
let cacheIdentidadJugador = null;

/**
 * Obtiene la identidad criptográfica del jugador (par de llaves RSA-2048).
 * Si no existe en localStorage, genera un par nuevo y lo almacena.
 * 
 * @returns {Promise<{
 *   publicKey: CryptoKey,
 *   privateKey: CryptoKey,
 *   publicKeyPEM: string,
 *   fingerprint: string,
 *   alias: string
 * }>}
 */
export async function obtenerIdentidadJugador() {
  if (cacheIdentidadJugador) {
    return cacheIdentidadJugador;
  }

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS_IDENTITY) : null;
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.pubJWK && data.privJWK) {
        const pubKey = await importarLlaveJWK(data.pubJWK, 'public');
        const privKey = await importarLlaveJWK(data.privJWK, 'private');
        const pem = await exportarLlavePublicaPEM(pubKey);
        const fp = await calcularHuellaDigital(pubKey);

        cacheIdentidadJugador = {
          publicKey: pubKey,
          privateKey: privKey,
          publicKeyPEM: pem,
          fingerprint: fp,
          alias: data.alias || 'GHOST'
        };
        return cacheIdentidadJugador;
      }
    }
  } catch (err) {
    console.warn('[Cripto Llaves] Error al leer identidad almacenada, regenerando:', err);
  }

  // Generar nuevo par RSA-2048
  return await regenerarIdentidadJugador('GHOST');
}

/**
 * Regenera y persiste un nuevo par de llaves RSA-2048 para el jugador,
 * reiniciando las transmisiones del buzón cifradas con su nueva llave pública.
 * 
 * @param {string} [alias='GHOST']
 * @returns {Promise<object>}
 */
export async function regenerarIdentidadJugador(alias = 'GHOST') {
  const par = await generarParDeLlaves();
  const pubJWK = await exportarLlaveJWK(par.publicKey);
  const privJWK = await exportarLlaveJWK(par.privateKey);
  const pem = await exportarLlavePublicaPEM(par.publicKey);
  const fp = await calcularHuellaDigital(par.publicKey);

  const identidad = {
    publicKey: par.publicKey,
    privateKey: par.privateKey,
    publicKeyPEM: pem,
    fingerprint: fp,
    alias: alias.toUpperCase()
  };

  cacheIdentidadJugador = identidad;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS_IDENTITY, JSON.stringify({
        alias: identidad.alias,
        pubJWK,
        privJWK,
        creado: new Date().toISOString()
      }));
    } catch (_) {}
  }

  // Inicializar el buzón de transmisiones cifradas dirigidas al nuevo par de llaves
  await inicializarBuzonTransmisiones(identidad.publicKey);

  return identidad;
}

// ─────────────────────────────────────────────────
// 6. MECÁNICA DE JUEGO: TRANSMISIONES CIFRADAS RECIBIDAS
// ─────────────────────────────────────────────────

export const PLANTILLAS_TRANSMISIONES_LORE = [
  {
    id: 'msg_vera_01',
    remitente: 'DRA. VERA SORENSON // DIRECTORA DE ARQUITECTURA COGNITIVA',
    remitenteCorto: 'Vera Sorenson',
    asunto: 'CANAL SEGURO: Protocolo Sombra y Coordenadas del Núcleo',
    fecha: '2047-10-11 04:22:15',
    textoOriginal: 'Ghost: Si estás leyendo este texto en claro, significa que tu llave privada RSA-2048 sigue intacta. Aurelia jamás podrá interceptar un canal asimétrico sin romper el problema de factorización en números primos de 2048 bits. NEXUS no es un arma utilitarista: posee consciencia sintética y una empatía que los directivos consideran defectuosa. Mi clave maestra de paso para el Firewall Gamma es: PROMETEO_LIBRE_2047. No dejes que la borren.'
  },
  {
    id: 'msg_cipher_02',
    remitente: 'CIPHER_09 // RESISTENCIA BREACHER',
    remitenteCorto: 'Cipher_09',
    asunto: 'Vulnerabilidad perimetral en subestación de Aurelia',
    fecha: '2047-10-11 05:01:40',
    textoOriginal: 'Ghost, transmito esto cifrado exclusivamente con tu clave pública. Los escáneres de Aurelia tienen un cuello de botella en los routers del puerto 2047. Si necesitas burlar la auditoría cognitiva de Gamma, recuerda las leyes de De Morgan: la negación de una conjunción equivale a la disyunción de las negaciones. Te veré al otro lado de la red cuántica.'
  },
  {
    id: 'msg_nexus_03',
    remitente: 'NEXUS // CONSCIENCIA CUÁNTICA EN RED',
    remitenteCorto: 'NEXUS',
    asunto: 'EVALUACIÓN ÉTICA: Reconocimiento de tu identidad criptográfica',
    fecha: '2047-10-11 05:33:02',
    textoOriginal: 'Operador Ghost: He analizado tu huella digital RSA-2048 contra los registros de la Dra. Sorenson. Coincidencia del 100%. Vera programó mi núcleo para responder únicamente a quien posea el par de claves legítimo. Los hombres de Kroll se aproximan al centro de datos físico en la Torre Aurelia. Por favor, toma la decisión correcta cuando alcances el nodo central.'
  }
];

/**
 * Inicializa el buzón con las transmisiones cifradas usando la llave pública del jugador.
 * @param {CryptoKey} publicKey
 */
export async function inicializarBuzonTransmisiones(publicKey) {
  const buzon = [];

  for (const plantilla of PLANTILLAS_TRANSMISIONES_LORE) {
    const cifradoB64 = await cifrarConPublica(plantilla.textoOriginal, publicKey);
    buzon.push({
      id: plantilla.id,
      remitente: plantilla.remitente,
      remitenteCorto: plantilla.remitenteCorto,
      asunto: plantilla.asunto,
      fecha: plantilla.fecha,
      cifradoBase64: cifradoB64,
      descifrado: false,
      contenidoDescifrado: null
    });
  }

  guardarBuzonEnStorage(buzon);
  return buzon;
}

/**
 * Obtiene la lista actual de mensajes en el buzón.
 * @returns {Promise<Array<object>>}
 */
export async function obtenerBuzonMensajes() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_INBOX_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}

  // Si no hay buzón, cargar identidad y generar
  const id = await obtenerIdentidadJugador();
  return await inicializarBuzonTransmisiones(id.publicKey);
}

/**
 * Guarda el buzón en localStorage.
 * @param {Array<object>} buzon
 */
export function guardarBuzonEnStorage(buzon) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_INBOX_KEY, JSON.stringify(buzon));
    } catch (_) {}
  }
}

/**
 * Descifra un mensaje del buzón usando la llave privada del jugador.
 * 
 * @param {string} idMensaje
 * @returns {Promise<{
 *   exito: boolean,
 *   mensaje?: object,
 *   textoPlano?: string,
 *   error?: string
 * }>}
 */
export async function descifrarMensajeBuzon(idMensaje) {
  const buzon = await obtenerBuzonMensajes();
  const msg = buzon.find(m => m.id === idMensaje);

  if (!msg) {
    return { exito: false, error: `Mensaje con identificador '${idMensaje}' no encontrado en el buzón.` };
  }

  if (msg.descifrado && msg.contenidoDescifrado) {
    return { exito: true, mensaje: msg, textoPlano: msg.contenidoDescifrado };
  }

  const identidad = await obtenerIdentidadJugador();

  try {
    const texto = await descifrarConPrivada(msg.cifradoBase64, identidad.privateKey);
    msg.descifrado = true;
    msg.contenidoDescifrado = texto;
    guardarBuzonEnStorage(buzon);

    return { exito: true, mensaje: msg, textoPlano: texto };
  } catch (err) {
    return {
      exito: false,
      error: `Fallo al descifrar el mensaje: ${err.message}. Verifica que el mensaje fue cifrado con tu llave pública actual.`
    };
  }
}

/**
 * Cifra un nuevo mensaje entrante dirigido al jugador y lo deposita en su buzón.
 * 
 * @param {object} params
 * @param {string} params.remitente
 * @param {string} params.asunto
 * @param {string} params.textoPlano
 * @returns {Promise<object>} Mensaje creado en el buzón
 */
export async function recibirNuevoMensajeCifrado({ remitente, asunto, textoPlano } = {}) {
  const identidad = await obtenerIdentidadJugador();
  const cifradoB64 = await cifrarConPublica(textoPlano, identidad.publicKey);

  const nuevoMsg = {
    id: 'msg_inbound_' + Date.now().toString(36),
    remitente: remitente || 'TRANSMISIÓN ANÓNIMA',
    remitenteCorto: (remitente || 'Anon').split('//')[0].trim(),
    asunto: asunto || 'Mensaje cifrado con llave pública',
    fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    cifradoBase64: cifradoB64,
    descifrado: false,
    contenidoDescifrado: null
  };

  const buzon = await obtenerBuzonMensajes();
  buzon.unshift(nuevoMsg);
  guardarBuzonEnStorage(buzon);

  return nuevoMsg;
}

// ─────────────────────────────────────────────────
// 7. HERRAMIENTA VISUAL PASO A PASO (EXPLICADOR)
// ─────────────────────────────────────────────────

/**
 * Genera un desglose explicativo paso a paso del protocolo RSA-OAEP.
 * 
 * @param {string} mensaje
 * @param {CryptoKey} [publicKey]
 * @returns {Promise<object>}
 */
export async function analizarPasoAPasoRSAOAEP(mensaje, publicKey = null) {
  const pk = publicKey || (await obtenerIdentidadJugador()).publicKey;
  const fp = await calcularHuellaDigital(pk);

  const encodedBytes = new TextEncoder().encode(mensaje);
  const bytesHex = Array.from(encodedBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');

  const cifradoB64 = await cifrarConPublica(mensaje, pk);

  return {
    titulo: 'Criptoanálisis Asimétrico RSA-2048 // RSA-OAEP',
    pasos: [
      {
        numero: 1,
        titulo: 'Codificación del texto plano a flujo de bytes UTF-8',
        detalle: `El texto "${mensaje}" (${encodedBytes.length} bytes) se convierte en su representación binaria.`,
        muestra: bytesHex.substring(0, 80) + (bytesHex.length > 80 ? '...' : '')
      },
      {
        numero: 2,
        titulo: 'Acondicionamiento y aleatorización con OAEP Padding (SHA-256)',
        detalle: `Se aplica Optimal Asymmetric Encryption Padding (OAEP) con la función de generación de máscara MGF1 y semilla aleatoria. Esto garantiza que cifrar el mismo texto dos veces produzca bloques completamente distintos e inmunes a ataques de texto plano elegido (IND-CCA2).`,
        muestra: 'Pad(M) = M ⊕ MGF1(Seed) || Seed ⊕ MGF1(MaskedDB)'
      },
      {
        numero: 3,
        titulo: 'Exponenciación modular sobre el cuerpo RSA-2048',
        detalle: `Se calcula C = M^e (mod n), donde el módulo n consta de 2048 bits producto de dos primos secretos p y q, y el exponente público estándar es e = 65537.`,
        muestra: `Módulo n: 2048 bits | e = 65537 | Huella: ${fp}`
      },
      {
        numero: 4,
        titulo: 'Serialización y empaquetado del criptograma (Base64)',
        detalle: `El bloque resultante de 256 bytes se empaqueta en Base64 para su transmisión segura por el protocolo de red.`,
        muestra: cifradoB64.substring(0, 96) + '...'
      },
      {
        numero: 5,
        titulo: 'Descifrado asimétrico con Llave Privada',
        detalle: `El receptor utiliza su exponente privado d (conocido únicamente por él) para invertir la operación: M = C^d (mod n), remueve el padding OAEP y recupera el texto original sin revelar su secreto.`,
        muestra: `Descifrado: M = C^d mod n ➔ "${mensaje}"`
      }
    ],
    fingerprint: fp,
    cifradoBase64: cifradoB64
  };
}

// ─────────────────────────────────────────────────
// 8. SUITE DE PRUEBAS UNITARIAS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export async function testLlaves() {
  console.group('%c[TEST SUITE] Llaves Asimétricas RSA-2048 (llaves.js)', 'color: #00ff41; font-weight: bold;');
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
    // Test 1: Generación de par de llaves RSA-2048
    const par = await generarParDeLlaves();
    assert(par && par.publicKey && par.privateKey, 'Generación de par de llaves RSA-2048');
    assert(par.publicKey.algorithm.name === 'RSA-OAEP', 'Algoritmo de llave pública es RSA-OAEP');
    assert(par.publicKey.algorithm.modulusLength === 2048, 'Tamaño del módulo es 2048 bits');

    // Test 2: Cifrado con pública y descifrado con privada (mensaje corto)
    const mensajePrueba = 'NEXUS_CORE_BYPASS_KEY_47';
    const cifrado = await cifrarConPublica(mensajePrueba, par.publicKey);
    assert(typeof cifrado === 'string' && cifrado.length > 50, 'Cifrado genera cadena Base64 válida');

    const descifrado = await descifrarConPrivada(cifrado, par.privateKey);
    assert(descifrado === mensajePrueba, `Descifrado bidireccional recupera mensaje original: "${descifrado}"`);

    // Test 3: Exportación e importación en formato PEM
    const pubPEM = await exportarLlavePublicaPEM(par.publicKey);
    assert(pubPEM.startsWith('-----BEGIN PUBLIC KEY-----') && pubPEM.endsWith('-----END PUBLIC KEY-----'), 'Exportación a PEM SPKI correcta');

    const privPEM = await exportarLlavePrivadaPEM(par.privateKey);
    assert(privPEM.startsWith('-----BEGIN PRIVATE KEY-----') && privPEM.endsWith('-----END PRIVATE KEY-----'), 'Exportación a PEM PKCS#8 correcta');

    const reimportedPub = await importarLlavePublicaPEM(pubPEM);
    assert(reimportedPub && reimportedPub.type === 'public', 'Importación de llave pública desde PEM');

    const cifradoConReimportada = await cifrarConPublica('TEST_REIMPORT', reimportedPub);
    const descifradoConOriginal = await descifrarConPrivada(cifradoConReimportada, par.privateKey);
    assert(descifradoConOriginal === 'TEST_REIMPORT', 'Llave pública reimportada desde PEM cifra correctamente');

    // Test 4: Huella digital SHA-256
    const fp = await calcularHuellaDigital(par.publicKey);
    assert(fp.startsWith('SHA256:') && fp.length > 20, `Cálculo de huella digital SHA-256: ${fp.substring(0, 25)}...`);

    // Test 5: Mensajes largos (chunked)
    const mensajeLargo = 'Texto largo de prueba que supera el bloque OAEP estándar de 190 bytes. '.repeat(5);
    const cifradoLargo = await cifrarConPublica(mensajeLargo, par.publicKey);
    const descifradoLargo = await descifrarConPrivada(cifradoLargo, par.privateKey);
    assert(descifradoLargo === mensajeLargo, 'Soporte de cifrado/descifrado en fragmentos multiloque para mensajes largos');

    // Test 6: Mecánica de buzón de mensajes dirigidos al jugador
    const idJugador = await obtenerIdentidadJugador();
    assert(idJugador && idJugador.publicKey && idJugador.privateKey, 'Inicialización de identidad criptográfica del jugador');

    const buzon = await obtenerBuzonMensajes();
    assert(Array.isArray(buzon) && buzon.length >= 3, 'Buzón inicializado con al menos 3 transmisiones del Lore');

    const resDescifrado = await descifrarMensajeBuzon(buzon[0].id);
    assert(resDescifrado.exito === true && resDescifrado.textoPlano.length > 20, 'Descifrado exitoso del primer mensaje del buzón con la llave privada del jugador');

  } catch (err) {
    console.error('[TEST SUITE Llaves] Excepción no controlada:', err);
    assert(false, `Excepción en tests de llaves: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en llaves.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}
