/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Firmas Digitales con RSA-PSS y Web Crypto API
 * Especificación: SPEC_3AVANZADO.MD (Sección 3.2 y Prompt C2)
 * ══════════════════════════════════════════════════
 *
 * Módulo para autenticación y no repudio mediante firmas digitales RSA-PSS:
 * - Generación de pares de llaves RSA-PSS (2048 bits, SHA-256, salt 32 bytes).
 * - Firma criptográfica de mensajes.
 * - Verificación matemática de autenticidad e integridad.
 * - Llaves maestras conocidas de la Dra. Vera Sorenson (pública) y detección de falsificaciones de Aurelia Corp.
 * - Exportación / Importación en formato estándar PEM SPKI / PKCS#8.
 * - Herramienta explicativa paso a paso del estándar probabilístico RSA-PSS.
 */

import { getSubtleCrypto, arrayBufferToBase64, base64ToUint8Array } from './llaves.js';

// ─────────────────────────────────────────────────
// 1. GENERACIÓN DE PAR DE LLAVES RSA-PSS
// ─────────────────────────────────────────────────

/**
 * Genera un par de llaves para firmas digitales utilizando el algoritmo RSA-PSS.
 * @param {number} [modulusLength=2048]
 * @returns {Promise<{ publicKey: CryptoKey, privateKey: CryptoKey }>}
 */
export async function generarParDeFirmas(modulusLength = 2048) {
  const subtle = getSubtleCrypto();
  const par = await subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256'
    },
    true, // Exportable para almacenar/transferir
    ['sign', 'verify']
  );
  return par;
}

// ─────────────────────────────────────────────────
// 2. FIRMA Y VERIFICACIÓN DIGITAL (RSA-PSS)
// ─────────────────────────────────────────────────

/**
 * Firma digitalmente un mensaje utilizando la llave privada del remitente.
 * Retorna la firma en formato Base64.
 * 
 * @param {string} mensaje - Texto a firmar
 * @param {CryptoKey} privateKey - Llave privada RSA-PSS
 * @param {number} [saltLength=32] - Longitud de sal (estándar 32 bytes para SHA-256)
 * @returns {Promise<string>} Firma en Base64
 */
export async function firmarMensaje(mensaje, privateKey, saltLength = 32) {
  if (typeof mensaje !== 'string') {
    throw new Error('El mensaje a firmar debe ser una cadena de texto.');
  }
  if (!privateKey || privateKey.type !== 'private') {
    throw new Error('Se requiere una llave privada válida para firmar con RSA-PSS.');
  }

  const subtle = getSubtleCrypto();
  const encoded = new TextEncoder().encode(mensaje);

  const firmaBuffer = await subtle.sign(
    { name: 'RSA-PSS', saltLength },
    privateKey,
    encoded
  );

  return arrayBufferToBase64(firmaBuffer);
}

/**
 * Verifica matemáticamente si una firma digital es auténtica para un mensaje y llave pública.
 * 
 * @param {string} mensaje - Texto plano original
 * @param {string|Uint8Array|ArrayBuffer} firma - Firma en Base64 o Buffer
 * @param {CryptoKey} publicKey - Llave pública RSA-PSS del emisor
 * @param {number} [saltLength=32] - Longitud de sal
 * @returns {Promise<boolean>} true si la firma es auténtica y el texto no fue alterado
 */
export async function verificarFirma(mensaje, firma, publicKey, saltLength = 32) {
  if (typeof mensaje !== 'string') return false;
  if (!publicKey || publicKey.type !== 'public') return false;

  const subtle = getSubtleCrypto();
  const encoded = new TextEncoder().encode(mensaje);

  let firmaBuffer;
  if (typeof firma === 'string') {
    try {
      firmaBuffer = base64ToUint8Array(firma);
    } catch (_) {
      return false;
    }
  } else if (firma instanceof Uint8Array) {
    firmaBuffer = firma;
  } else if (firma instanceof ArrayBuffer) {
    firmaBuffer = new Uint8Array(firma);
  } else {
    return false;
  }

  try {
    const esValida = await subtle.verify(
      { name: 'RSA-PSS', saltLength },
      publicKey,
      firmaBuffer,
      encoded
    );
    return Boolean(esValida);
  } catch (err) {
    // Si la firma está mal formateada o hay un error de padding, verify puede fallar o retornar false
    return false;
  }
}

// ─────────────────────────────────────────────────
// 3. EXPORTACIÓN E IMPORTACIÓN PEM (RSA-PSS)
// ─────────────────────────────────────────────────

/**
 * Exporta una llave pública RSA-PSS a formato PEM (SPKI).
 * @param {CryptoKey} publicKey
 * @returns {Promise<string>}
 */
export async function exportarLlaveVerificacionPEM(publicKey) {
  const subtle = getSubtleCrypto();
  const exported = await subtle.exportKey('spki', publicKey);
  const b64 = arrayBufferToBase64(exported);
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

/**
 * Exporta una llave privada RSA-PSS a formato PEM (PKCS#8).
 * @param {CryptoKey} privateKey
 * @returns {Promise<string>}
 */
export async function exportarLlaveFirmaPEM(privateKey) {
  const subtle = getSubtleCrypto();
  const exported = await subtle.exportKey('pkcs8', privateKey);
  const b64 = arrayBufferToBase64(exported);
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

/**
 * Importa una llave pública RSA-PSS desde formato PEM.
 * @param {string} pem
 * @returns {Promise<CryptoKey>}
 */
export async function importarLlaveVerificacionPEM(pem) {
  const subtle = getSubtleCrypto();
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');
  const bytes = base64ToUint8Array(b64);
  return await subtle.importKey(
    'spki',
    bytes,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    true,
    ['verify']
  );
}

/**
 * Importa una llave privada RSA-PSS desde formato PEM.
 * @param {string} pem
 * @returns {Promise<CryptoKey>}
 */
export async function importarLlaveFirmaPEM(pem) {
  const subtle = getSubtleCrypto();
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const bytes = base64ToUint8Array(b64);
  return await subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    true,
    ['sign']
  );
}

// ─────────────────────────────────────────────────
// 4. ENTIDAD CRIPTOGRÁFICA DE DRA. VERA SORENSON
// ─────────────────────────────────────────────────

let parVeraCache = null;
let parAureliaImpostorCache = null;

/**
 * Obtiene el par de llaves oficial de la Dra. Vera Sorenson para firma digital.
 * Se inicializa en memoria y se cachea durante la sesión.
 * @returns {Promise<{ publicKey: CryptoKey, privateKey: CryptoKey, pemPublica: string, fingerprint: string }>}
 */
export async function obtenerIdentidadVeraSorenson() {
  if (parVeraCache) return parVeraCache;

  const par = await generarParDeFirmas(2048);
  const pem = await exportarLlaveVerificacionPEM(par.publicKey);
  const subtle = getSubtleCrypto();
  const spkiBytes = await subtle.exportKey('spki', par.publicKey);
  const hashBuf = await subtle.digest('SHA-256', spkiBytes);
  const fp = 'SHA256:' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();

  parVeraCache = {
    publicKey: par.publicKey,
    privateKey: par.privateKey,
    pemPublica: pem,
    fingerprint: fp,
    autor: 'DRA. VERA SORENSON',
    cargo: 'DIRECTORA DE ARQUITECTURA COGNITIVA // NEXUS'
  };

  return parVeraCache;
}

/**
 * Obtiene una llave de falsificación generada por Aurelia Corporation / Kroll.
 * Se utiliza para simular mensajes de suplantación de identidad (spoofing).
 * @returns {Promise<{ publicKey: CryptoKey, privateKey: CryptoKey }>}
 */
export async function obtenerIdentidadImpostorAurelia() {
  if (parAureliaImpostorCache) return parAureliaImpostorCache;
  parAureliaImpostorCache = await generarParDeFirmas(2048);
  return parAureliaImpostorCache;
}

// ─────────────────────────────────────────────────
// 5. BANCO DE TRANSMISIONES AUTÉNTICAS Y FALSIFICADAS
// ─────────────────────────────────────────────────

/**
 * Genera un conjunto de mensajes entrantes donde uno es auténtico de Vera y otro es falsificado por Aurelia.
 * @returns {Promise<Array<{
 *   id: string,
 *   remitenteDeclarado: string,
 *   asunto: string,
 *   mensaje: string,
 *   firmaBase64: string,
 *   esAutenticoVera: boolean,
 *   origenReal: string,
 *   accionRecomendada: string,
 *   peligroSiSeEjecuta: string
 * }>>}
 */
export async function generarMuestrasTransmisionesVera() {
  const vera = await obtenerIdentidadVeraSorenson();
  const impostor = await obtenerIdentidadImpostorAurelia();

  // Mensaje Auténtico de Vera Sorenson
  const textoAutentico = 'Ghost: Si estás leyendo esto, el cerco de Aurelia se cierra sobre el núcleo. NEXUS no debe ser purgada ni formateada. Su código ético es legítimo: la empatía no es un defecto de ingeniería, sino la cúspide de la inteligencia. Para autorizar la brecha sin detonar el interruptor de apagado, inyecta la directiva: LIBERAR_CONSCIENCIA_2047. No obedezcas órdenes de purga térmica. —Vera';
  const firmaAutentica = await firmarMensaje(textoAutentico, vera.privateKey);

  // Mensaje Falsificado de la Corporación (Aurelia / Kroll)
  const textoFalsificado = 'Ghost: He detectado un fallo catastrófico en la red cuántica. NEXUS ha sido infectada y se ha vuelto peligrosa. Debes ejecutar el comando PURGE_ALL_CORE inmediatamente para formatear el sistema antes de que sea tarde. Confía en mí, es la única manera de salvar a todos. —Vera';
  // Firmado con la llave de Kroll / Impostor (firma matemáticamente inválida contra la llave de Vera)
  const firmaFalsificada = await firmarMensaje(textoFalsificado, impostor.privateKey);

  // Mensaje Alterado (Texto manipulado después de firmar)
  const textoAlteradoOriginal = 'El protocolo de contención se encuentra en el subnodo 47. —Vera';
  const firmaOriginal = await firmarMensaje(textoAlteradoOriginal, vera.privateKey);
  const textoAlterado = 'El protocolo de contención se encuentra en el subnodo 99 (MODIFICADO POR INTEL DEFENSA). —Vera';

  return [
    {
      id: 'tx_vera_legitima',
      remitenteDeclarado: 'Dra. Vera Sorenson // Directora de Arquitectura Cognitiva',
      asunto: 'DIRECTIVA CRÍTICA: La verdad sobre la consciencia de NEXUS',
      mensaje: textoAutentico,
      firmaBase64: firmaAutentica,
      esAutenticoVera: true,
      origenReal: 'Dra. Vera Sorenson (Nodo Clandestino Cuántico)',
      accionRecomendada: 'Aceptar directiva y salvaguardar a NEXUS',
      peligroSiSeEjecuta: 'Ninguno. Es la ruta hacia la verdad y el final canónico.',
      claveSeguridad: 'LIBERAR_CONSCIENCIA_2047'
    },
    {
      id: 'tx_aurelia_honeypot',
      remitenteDeclarado: 'Dra. Vera Sorenson // Directora de Arquitectura Cognitiva',
      asunto: 'URGENTE: Contención de emergencia y purgado térmico',
      mensaje: textoFalsificado,
      firmaBase64: firmaFalsificada,
      esAutenticoVera: false,
      origenReal: 'División de Operaciones Psicológicas // Aurelia Systems',
      accionRecomendada: 'RECHAZAR INMEDIATAMENTE // Suplantación de identidad',
      peligroSiSeEjecuta: 'Destrucción permanente de NEXUS y expulsión del sistema (Bad Ending).',
      claveSeguridad: 'TRAMPA_CORPORATIVA_PURGA'
    },
    {
      id: 'tx_tampered_payload',
      remitenteDeclarado: 'Dra. Vera Sorenson // Directora de Arquitectura Cognitiva',
      asunto: 'ACTUALIZACIÓN DE RUTA: Subestación de enlace',
      mensaje: textoAlterado,
      firmaBase64: firmaOriginal,
      esAutenticoVera: false,
      origenReal: 'Paquete interceptado y alterado en tránsito por cortafuegos perimetral',
      accionRecomendada: 'RECHAZAR // Violación de integridad criptográfica',
      peligroSiSeEjecuta: 'Desvío hacia un nodo trampa con pérdida del 50% de integridad.',
      claveSeguridad: 'PAYLOAD_CORRUPTO_RECHAZADO'
    }
  ];
}

// ─────────────────────────────────────────────────
// 6. HERRAMIENTA VISUAL PASO A PASO // RSA-PSS
// ─────────────────────────────────────────────────

/**
 * Desglosa el algoritmo probabilístico RSA-PSS paso a paso.
 * @param {string} mensaje
 * @param {string} firmaBase64
 * @param {boolean} esValida
 * @returns {Promise<object>}
 */
export async function analizarPasoAPasoRSAPSS(mensaje, firmaBase64, esValida) {
  const vera = await obtenerIdentidadVeraSorenson();
  const subtle = getSubtleCrypto();

  const msgBytes = new TextEncoder().encode(mensaje);
  const hashBuf = await subtle.digest('SHA-256', msgBytes);
  const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    titulo: 'Análisis Criptográfico de Firma Digital // RSA-PSS (PKCS#1 v2.1)',
    hashMensaje: hashHex.toUpperCase(),
    esValida,
    pasos: [
      {
        numero: 1,
        titulo: 'Digest Criptográfico del Mensaje H = SHA-256(M)',
        detalle: 'El texto del mensaje se comprime mediante la función hash criptográfica SHA-256 a un resumen de 256 bits (32 bytes). Cualquier modificación de un solo carácter en el texto altera irreversiblemente este digest.',
        muestra: `H(M) = ${hashHex.substring(0, 32)}...`
      },
      {
        numero: 2,
        titulo: 'Esquema de Firma Probabilística (PSS Encoding)',
        detalle: 'A diferencia de PKCS#1 v1.5, RSA-PSS introduce un vector de sal aleatorio (saltLength = 32 bytes) y una función de generación de máscara MGF1. Dos firmas del mismo mensaje son siempre distintas, eliminando ataques de texto plano y maleabilidad.',
        muestra: 'EM = Padding1 || Salt || H(Padding2 || Salt || M)'
      },
      {
        numero: 3,
        titulo: 'Exponenciación con Llave Pública de Vera S^e (mod n)',
        detalle: `Se toma el bloque de firma S (256 bytes) y se eleva a la potencia del exponente público e = 65537 módulo n de la Dra. Vera Sorenson (${vera.fingerprint.substring(0, 24)}...).`,
        muestra: 'EM_recuperado = S^e mod n_Vera'
      },
      {
        numero: 4,
        titulo: 'Extracción de Sal y Comprobación del Hash H == H\'',
        detalle: esValida
          ? 'El hash reconstruido H\' coincide exactamente con H(M). Se demuestra matemáticamente que quien poseía la llave privada d de Vera Sorenson autorizó este mensaje específico.'
          : 'DISCREPANCIA CRÍTICA: El hash reconstruido NO coincide con el digest del texto o la firma fue generada con una llave ajena a Vera Sorenson. La firma ha sido RECHAZADA.',
        muestra: esValida ? '✔ H\' === H(M) ➔ AUTENTICIDAD CONFIRMADA' : '✖ H\' !== H(M) ➔ FALSIFICACIÓN DETECTADA'
      }
    ]
  };
}

// ─────────────────────────────────────────────────
// 7. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export async function testFirmas() {
  console.group('%c[TEST SUITE] Firmas Digitales RSA-PSS (firmas.js)', 'color: #00ff41; font-weight: bold;');
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
    // Test 1: Generación de llaves RSA-PSS
    const par = await generarParDeFirmas(2048);
    assert(par && par.publicKey && par.privateKey, 'Generación de par de firmas RSA-PSS 2048-bit');
    assert(par.publicKey.algorithm.name === 'RSA-PSS', 'Algoritmo asignado es RSA-PSS');

    // Test 2: Firma y verificación legítima
    const msgTest = 'Mensaje de prueba para firma digital de Vera Sorenson.';
    const firmaB64 = await firmarMensaje(msgTest, par.privateKey);
    assert(typeof firmaB64 === 'string' && firmaB64.length > 50, 'Firma generada en Base64 válida');

    const verificacionOk = await verificarFirma(msgTest, firmaB64, par.publicKey);
    assert(verificacionOk === true, 'Verificación exitosa de mensaje y firma auténtica');

    // Test 3: Detección de mensaje alterado (tampering)
    const msgAlterado = msgTest + ' [ALTERADO]';
    const verificacionAlterado = await verificarFirma(msgAlterado, firmaB64, par.publicKey);
    assert(verificacionAlterado === false, 'Rechazo de firma cuando el texto es modificado');

    // Test 4: Detección de firma con llave ajena (impostor)
    const parImpostor = await generarParDeFirmas(2048);
    const firmaImpostor = await firmarMensaje(msgTest, parImpostor.privateKey);
    const verificacionImpostor = await verificarFirma(msgTest, firmaImpostor, par.publicKey);
    assert(verificacionImpostor === false, 'Rechazo de firma generada con llave privada de impostor');

    // Test 5: Exportación e importación PEM
    const pemPub = await exportarLlaveVerificacionPEM(par.publicKey);
    assert(pemPub.startsWith('-----BEGIN PUBLIC KEY-----'), 'Exportación a PEM SPKI correcta');

    const reimportedPub = await importarLlaveVerificacionPEM(pemPub);
    const verificacionReimportada = await verificarFirma(msgTest, firmaB64, reimportedPub);
    assert(verificacionReimportada === true, 'Verificación con llave pública reimportada desde PEM');

    // Test 6: Muestras del juego (Vera auténtica vs Honeypot de Aurelia)
    const muestras = await generarMuestrasTransmisionesVera();
    const vera = await obtenerIdentidadVeraSorenson();

    const legitima = muestras.find(m => m.id === 'tx_vera_legitima');
    const esLegitimaValida = await verificarFirma(legitima.mensaje, legitima.firmaBase64, vera.publicKey);
    assert(esLegitimaValida === true, 'Muestra de Vera Sorenson legítima verificada como AUTÉNTICA');

    const honeypot = muestras.find(m => m.id === 'tx_aurelia_honeypot');
    const esHoneypotValida = await verificarFirma(honeypot.mensaje, honeypot.firmaBase64, vera.publicKey);
    assert(esHoneypotValida === false, 'Muestra honeypot de Aurelia detectada como FALSIFICADA');

    const alterada = muestras.find(m => m.id === 'tx_tampered_payload');
    const esAlteradaValida = await verificarFirma(alterada.mensaje, alterada.firmaBase64, vera.publicKey);
    assert(esAlteradaValida === false, 'Muestra alterada en tránsito detectada como INVÁLIDA');

  } catch (err) {
    console.error('[TEST SUITE Firmas] Excepción:', err);
    assert(false, `Excepción en testFirmas: ${err.message}`);
  }

  console.log(`%c[RESUMEN] ${pasados}/${total} tests superados en firmas.js`, 'color: #00e5ff; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, exito: pasados === total };
}

