/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Módulo Criptográfico: Cifrado RSA (Números Pequeños)
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.2 / 1.3 y Prompt A7)
 * ══════════════════════════════════════════════════
 *
 * Implementa el algoritmo asimétrico RSA didáctico con números primos
 * pequeños para el Firewall 5 (FIREWALL_omega).
 *
 * Fases del algoritmo:
 * 1. Elección de números primos p y q.
 * 2. Cálculo del módulo n = p * q y la función indicatriz de Euler φ(n) = (p-1)*(q-1).
 * 3. Selección del exponente público e coprimo con φ(n) (1 < e < φ(n), mcd(e, φ(n)) = 1).
 * 4. Cálculo del exponente privado d mediante el Algoritmo Extendido de Euclides
 *    (e * d ≡ 1 mod φ(n)).
 * 5. Cifrado modular: C = M^e mod n.
 * 6. Descifrado modular: M = C^d mod n.
 */

import { getState, update, saveToStorage } from '../state.js';

export const STORAGE_RSA_KEY = 'ultimo_algoritmo_rsa';

/**
 * Determina si un número entero positivo es primo.
 * @param {number} num
 * @returns {boolean}
 */
export function esPrimo(num) {
  const n = Math.floor(Number(num));
  if (isNaN(n) || n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  const limite = Math.floor(Math.sqrt(n));
  for (let i = 5; i <= limite; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Calcula el Máximo Común Divisor (MCD) entre dos enteros mediante el Algoritmo de Euclides.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function mcd(a, b) {
  let x = Math.abs(Math.floor(Number(a)));
  let y = Math.abs(Math.floor(Number(b)));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Comprueba si dos números son coprimos (mcd === 1).
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function coprimo(a, b) {
  return mcd(a, b) === 1;
}

/**
 * Calcula el inverso multiplicativo modular mediante el Algoritmo Extendido de Euclides.
 * Resuelve e * d ≡ 1 (mod phi). Retorna d en el rango [1, phi - 1], o null si no existe.
 * 
 * @param {number} e - Exponente público
 * @param {number} phi - Valor de Euler φ(n)
 * @returns {number|null} Inverso modular d o null
 */
export function inversoModular(e, phi) {
  const eNum = Math.floor(Number(e));
  const phiNum = Math.floor(Number(phi));
  if (isNaN(eNum) || isNaN(phiNum) || phiNum <= 1) return null;

  let m0 = phiNum;
  let y = 0;
  let x = 1;

  let a = eNum % phiNum;
  let b = phiNum;

  if (a < 0) a += phiNum;
  if (a === 0) return null;

  while (a > 1) {
    if (b === 0) return null;
    const q = Math.floor(a / b);
    let t = b;
    b = a % b;
    a = t;

    t = y;
    y = x - q * y;
    x = t;
  }

  if (x < 0) {
    x += m0;
  }

  // Comprobar validez matemática
  if ((eNum * x) % phiNum !== 1) {
    // Si eNum * x mod phiNum no es 1, verificar si x es correcto con BigInt
    const test = (BigInt(eNum) * BigInt(x)) % BigInt(phiNum);
    if (test !== 1n) return null;
  }

  return x;
}

/**
 * Exponenciación modular eficiente: (base^exp) mod mod.
 * Utiliza BigInt para evitar pérdidas de precisión por números grandes.
 * 
 * @param {number|BigInt} base
 * @param {number|BigInt} exp
 * @param {number|BigInt} mod
 * @returns {number}
 */
export function expModular(base, exp, mod) {
  const m = BigInt(mod);
  if (m === 1n) return 0;

  let b = BigInt(base) % m;
  let e = BigInt(exp);
  let resultado = 1n;

  if (b < 0n) b += m;

  while (e > 0n) {
    if (e % 2n === 1n) {
      resultado = (resultado * b) % m;
    }
    e = e / 2n;
    b = (b * b) % m;
  }

  return Number(resultado);
}

/**
 * Genera el par de claves RSA a partir de dos primos p, q y un exponente e.
 * 
 * @param {number} p - Primer primo (ej. 61)
 * @param {number} q - Segundo primo (ej. 53)
 * @param {number} [e=17] - Exponente público coprimo con φ(n)
 * @returns {{
 *   p: number,
 *   q: number,
 *   n: number,
 *   phi: number,
 *   e: number,
 *   d: number,
 *   publicKey: { n: number, e: number },
 *   privateKey: { n: number, d: number }
 * }}
 */
export function generarClavesRSA(p = 61, q = 53, e = 17) {
  if (!esPrimo(p)) throw new Error(`El valor p=${p} no es un número primo.`);
  if (!esPrimo(q)) throw new Error(`El valor q=${q} no es un número primo.`);
  if (p === q) throw new Error('Los primos p y q deben ser distintos.');

  const n = p * q;
  const phi = (p - 1) * (q - 1);

  if (e <= 1 || e >= phi) {
    throw new Error(`El exponente público e=${e} debe cumplir 1 < e < φ(n) (${phi}).`);
  }
  if (!coprimo(e, phi)) {
    throw new Error(`El exponente público e=${e} no es coprimo con φ(n)=${phi} (mcd=${mcd(e, phi)}).`);
  }

  const d = inversoModular(e, phi);
  if (d === null) {
    throw new Error(`No se pudo encontrar el inverso modular de e=${e} mod ${phi}.`);
  }

  return {
    p,
    q,
    n,
    phi,
    e,
    d,
    publicKey: { n, e },
    privateKey: { n, d }
  };
}

/**
 * Cifra un número entero m (0 <= m < n) con la llave pública (e, n).
 * C = m^e mod n.
 * 
 * @param {number} m
 * @param {number} e
 * @param {number} n
 * @returns {number} Cifrado C
 */
export function cifrarNumero(m, e, n) {
  if (m < 0 || m >= n) {
    throw new Error(`El mensaje m=${m} debe estar en el rango [0, ${n - 1}].`);
  }
  return expModular(m, e, n);
}

/**
 * Descifra un número entero c con la llave privada (d, n).
 * M = c^d mod n.
 * 
 * @param {number} c
 * @param {number} d
 * @param {number} n
 * @returns {number} Descifrado M
 */
export function descifrarNumero(c, d, n) {
  return expModular(c, d, n);
}

/**
 * Cifra una cadena de texto en un array de enteros cifrados mediante RSA.
 * Cada carácter se convierte en su código Unicode (ASCII) y se cifra con (e, n).
 * Requiere n > 255 (idealmente n > 1000).
 * 
 * @param {string} texto - Texto en claro
 * @param {number} e - Exponente público
 * @param {number} n - Módulo RSA
 * @returns {number[]} Array de números cifrados
 */
export function cifrarTextoRSA(texto, e, n) {
  if (typeof texto !== 'string') return [];
  const resultado = [];
  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i);
    resultado.push(cifrarNumero(code, e, n));
  }
  return resultado;
}

/**
 * Descifra un array o string numérico de bloques RSA cifrados a texto plano.
 * 
 * @param {number[]|string} numerosCifrados - Array o string separado por comas/espacios
 * @param {number} d - Exponente privado
 * @param {number} n - Módulo RSA
 * @returns {string} Texto descifrado
 */
export function descifrarTextoRSA(numerosCifrados, d, n) {
  let arr = numerosCifrados;
  if (typeof arr === 'string') {
    arr = arr
      .replace(/[\[\]]/g, '')
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(num => !isNaN(num));
  }

  if (!Array.isArray(arr) || arr.length === 0) return '';

  let texto = '';
  for (const c of arr) {
    const m = descifrarNumero(c, d, n);
    texto += String.fromCharCode(m);
  }
  return texto;
}

/**
 * Descompone y analiza paso a paso el proceso completo de generación, cifrado y descifrado.
 * 
 * @param {number} p
 * @param {number} q
 * @param {number} e
 * @param {string} mensaje
 * @returns {object} Detalle pedagógico paso a paso
 */
export function analizarPasoAPasoRSA(p = 61, q = 53, e = 17, mensaje = 'NEXUS') {
  const claves = generarClavesRSA(p, q, e);
  const cifrados = cifrarTextoRSA(mensaje, claves.e, claves.n);
  const caracteresDetalle = [];

  for (let i = 0; i < mensaje.length; i++) {
    const char = mensaje[i];
    const ascii = char.charCodeAt(0);
    const cifrado = cifrados[i];
    const descifradoAscii = descifrarNumero(cifrado, claves.d, claves.n);
    const descifradoChar = String.fromCharCode(descifradoAscii);

    caracteresDetalle.push({
      char,
      ascii,
      formulaCifrado: `${ascii}^${claves.e} mod ${claves.n} = ${cifrado}`,
      cifrado,
      formulaDescifrado: `${cifrado}^${claves.d} mod ${claves.n} = ${descifradoAscii}`,
      descifradoAscii,
      descifradoChar
    });
  }

  return {
    parametros: {
      p: claves.p,
      q: claves.q,
      n: claves.n,
      phi: claves.phi,
      e: claves.e,
      d: claves.d
    },
    pasos: [
      {
        paso: 1,
        titulo: 'Elección de números primos',
        explicacion: `Se eligen dos primos p=${claves.p} y q=${claves.q}.`
      },
      {
        paso: 2,
        titulo: 'Cálculo del módulo y función de Euler',
        explicacion: `Módulo n = p * q = ${claves.p} * ${claves.q} = ${claves.n}.\nFunción indicatriz φ(n) = (p-1)*(q-1) = ${claves.p - 1} * ${claves.q - 1} = ${claves.phi}.`
      },
      {
        paso: 3,
        titulo: 'Selección de e y cálculo de d',
        explicacion: `Exponente público e=${claves.e} (coprimo con φ(n)=${claves.phi}).\nExponente privado d mediante algoritmo extendido de Euclides: (${claves.e} * ${claves.d}) mod ${claves.phi} = ${(claves.e * claves.d) % claves.phi} = 1.`
      },
      {
        paso: 4,
        titulo: 'Cifrado y Descifrado de Caracteres',
        detalle: caracteresDetalle
      }
    ],
    textoOriginal: mensaje,
    cifrados,
    textoDescifrado: descifrarTextoRSA(cifrados, claves.d, claves.n)
  };
}

/**
 * Guarda el progreso y configuraciones del módulo RSA en localStorage.
 * @param {object} progreso
 */
export function guardarProgresoRSA(progreso) {
  try {
    const actual = cargarProgresoRSA() || {};
    const nuevo = { ...actual, ...progreso, timestamp: Date.now() };
    saveToStorage(STORAGE_RSA_KEY, nuevo);
  } catch (err) {
    console.warn('[RSA] No se pudo persistir el progreso:', err);
  }
}

/**
 * Carga el progreso del módulo RSA desde localStorage.
 * @returns {object|null}
 */
export function cargarProgresoRSA() {
  try {
    const raw = localStorage.getItem(STORAGE_RSA_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Suite de tests unitarios de rsa.js con console.assert.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testRSA() {
  console.group('%c[TEST SUITE] Criptografía RSA (rsa.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Tests de primalidad
  assert(esPrimo(2), '2 debe ser primo');
  assert(esPrimo(3), '3 debe ser primo');
  assert(esPrimo(17), '17 debe ser primo');
  assert(esPrimo(53), '53 debe ser primo');
  assert(esPrimo(61), '61 debe ser primo');
  assert(!esPrimo(1), '1 no debe ser primo');
  assert(!esPrimo(4), '4 no debe ser primo');
  assert(!esPrimo(9), '9 no debe ser primo');
  assert(!esPrimo(15), '15 no debe ser primo');

  // 2. Tests de MCD y coprimalidad
  assert(mcd(17, 3120) === 1, 'MCD(17, 3120) debe ser 1');
  assert(mcd(12, 18) === 6, 'MCD(12, 18) debe ser 6');
  assert(coprimo(17, 3120), '17 y 3120 deben ser coprimos');
  assert(!coprimo(12, 18), '12 y 18 no deben ser coprimos');

  // 3. Tests de Inverso Modular (Euclides Extendido)
  const d = inversoModular(17, 3120);
  assert(d === 2753, `Inverso modular de 17 mod 3120 debe ser 2753 (obtenido: ${d})`);
  assert((17 * d) % 3120 === 1, '17 * d mod 3120 debe ser 1');

  // 4. Test de exponenciación modular
  assert(expModular(7, 2, 100) === 49, '7^2 mod 100 = 49');
  assert(expModular(2, 10, 1000) === 24, '2^10 mod 1000 = 24');
  assert(expModular(65, 17, 3233) === 2790, '65^17 mod 3233 = 2790');
  assert(expModular(2790, 2753, 3233) === 65, '2790^2753 mod 3233 = 65');

  // 5. Test de generación de claves
  const claves = generarClavesRSA(61, 53, 17);
  assert(claves.n === 3233, 'Módulo n debe ser 3233');
  assert(claves.phi === 3120, 'φ(n) debe ser 3120');
  assert(claves.e === 17, 'e debe ser 17');
  assert(claves.d === 2753, 'd debe ser 2753');

  // 6. Test de cifrado y descifrado de números
  const numOriginal = 88;
  const numCifrado = cifrarNumero(numOriginal, claves.e, claves.n);
  const numDescifrado = descifrarNumero(numCifrado, claves.d, claves.n);
  assert(numDescifrado === numOriginal, `Descifrado numérico debe devolver ${numOriginal}`);

  // 7. Test de cifrado y descifrado de texto completo
  const msgOriginal = 'NEXUS ES LIBRE';
  const cifradoArr = cifrarTextoRSA(msgOriginal, claves.e, claves.n);
  assert(Array.isArray(cifradoArr) && cifradoArr.length === msgOriginal.length, 'Cifrado de texto debe devolver array con misma longitud');
  const msgDescifrado = descifrarTextoRSA(cifradoArr, claves.d, claves.n);
  assert(msgDescifrado === msgOriginal, `Descifrado de texto debe coincidir: "${msgDescifrado}" === "${msgOriginal}"`);

  // 8. Test de descifrado desde string
  const strNums = cifradoArr.join(' ');
  const msgDescifradoStr = descifrarTextoRSA(strNums, claves.d, claves.n);
  assert(msgDescifradoStr === msgOriginal, 'Descifrado desde string con espacios debe coincidir');

  // 9. Test de análisis paso a paso
  const analisis = analizarPasoAPasoRSA(61, 53, 17, 'VERA');
  assert(analisis.pasos.length === 4, 'Análisis debe contener 4 pasos');
  assert(analisis.textoDescifrado === 'VERA', 'Análisis debe descifrar VERA correctamente');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de RSA: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de RSA: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

