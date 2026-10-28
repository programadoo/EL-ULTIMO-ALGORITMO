/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Máquina Enigma Simplificada (M3) — Firewall 3
 * Especificación: SPEC_3AVANZADO.MD (Sección 1.1 y Prompt A5)
 * ══════════════════════════════════════════════════
 *
 * Simulación histórica y criptográfica de la máquina Enigma:
 * - 3 rotores intercambiables (I, II, III) con cableado histórico.
 * - 26 posiciones ajustables (A-Z, 0-25).
 * - Mecanismo de avance (odómetro con muescas de giro / stepping).
 * - Reflector simétrico (UKW-B).
 * - Clavijero / Plugboard (Steckerbrett) para permutación de pares.
 * - Cifrado recíproco: cifrar(mensaje) === descifrar(cifrado) con la misma configuración.
 * - Soporte de persistencia en localStorage para el progreso en Firewall 3.
 */

export const STORAGE_ENIGMA_KEY = 'ultimo_algoritmo_enigma';

// Cableados históricos estándar de rotores Enigma (A-Z)
export const CABLEADO_ROTORES = {
  1: {
    nombre: 'Rotor I',
    cableado: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    muesca: 'Q' // Muesca en la posición 16 ('Q') para arrastrar el siguiente rotor
  },
  2: {
    nombre: 'Rotor II',
    cableado: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    muesca: 'E' // Muesca en la posición 4 ('E')
  },
  3: {
    nombre: 'Rotor III',
    cableado: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    muesca: 'V' // Muesca en la posición 21 ('V')
  }
};

// Reflector B estándar histórico (UKW-B)
export const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Convierte un carácter a índice 0-25.
 * @param {string} ch
 * @returns {number}
 */
function charToIdx(ch) {
  return ch.toUpperCase().charCodeAt(0) - 65;
}

/**
 * Convierte un índice 0-25 a carácter 'A'-'Z'.
 * @param {number} idx
 * @returns {string}
 */
function idxToChar(idx) {
  return String.fromCharCode(((idx % 26) + 26) % 26 + 65);
}

/**
 * Clase principal que implementa la Máquina Enigma M3.
 */
export class Enigma {
  /**
   * @param {number[]} [rotores=[1, 2, 3]] - Selección de rotores (ej: [1, 2, 3])
   * @param {number[]} [posiciones=[0, 0, 0]] - Posiciones iniciales 0-25 (ej: [0, 0, 0])
   * @param {string} [reflector='B'] - Tipo de reflector ('B')
   */
  constructor(rotores = [1, 2, 3], posiciones = [0, 0, 0], reflector = 'B') {
    this.rotores = [...rotores];
    this.posiciones = posiciones.map(p => ((Number(p) % 26) + 26) % 26);
    this.reflectorTipo = reflector;
    this.plugboard = new Map();
  }

  /**
   * Configura la posición de un rotor específico (0 = rápido, 1 = medio, 2 = lento).
   * @param {number} rotorIdx - 0, 1 o 2
   * @param {number|string} posicion - 0-25 o 'A'-'Z'
   */
  configurar(rotorIdx, posicion) {
    if (rotorIdx < 0 || rotorIdx >= this.posiciones.length) return;
    const pos = typeof posicion === 'string' ? charToIdx(posicion) : Number(posicion);
    this.posiciones[rotorIdx] = ((pos % 26) + 26) % 26;
  }

  /**
   * Conecta un par de letras en el plugboard (clavijero).
   * @param {string} letraA
   * @param {string} letraB
   */
  conectarPlugboard(letraA, letraB) {
    const a = String(letraA).toUpperCase();
    const b = String(letraB).toUpperCase();
    if (!/[A-Z]/.test(a) || !/[A-Z]/.test(b) || a === b) return;

    // Desconectar conexiones previas si existían
    if (this.plugboard.has(a)) {
      const prev = this.plugboard.get(a);
      this.plugboard.delete(prev);
    }
    if (this.plugboard.has(b)) {
      const prev = this.plugboard.get(b);
      this.plugboard.delete(prev);
    }

    this.plugboard.set(a, b);
    this.plugboard.set(b, a);
  }

  /**
   * Limpia todas las conexiones del plugboard.
   */
  limpiarPlugboard() {
    this.plugboard.clear();
  }

  /**
   * Hace avanzar el odómetro de los rotores antes de codificar cada tecla.
   * Aplica stepping clásico: el rotor 0 (derecha/rápido) avanza siempre;
   * si alcanza la muesca arrastra el rotor 1; y el rotor 1 arrastra el rotor 2.
   */
  rotar() {
    const r0Info = CABLEADO_ROTORES[this.rotores[0]] || CABLEADO_ROTORES[1];
    const r1Info = CABLEADO_ROTORES[this.rotores[1]] || CABLEADO_ROTORES[2];

    const muesca0 = charToIdx(r0Info.muesca);
    const muesca1 = charToIdx(r1Info.muesca);

    const paso1 = this.posiciones[0] === muesca0;
    const paso2 = this.posiciones[1] === muesca1;

    // Rotor 0 (rápido) siempre avanza
    this.posiciones[0] = (this.posiciones[0] + 1) % 26;

    // Rotor 1 (medio) avanza si rotor 0 tocó su muesca o por doble paso
    if (paso1 || paso2) {
      this.posiciones[1] = (this.posiciones[1] + 1) % 26;
    }

    // Rotor 2 (lento) avanza si rotor 1 tocó su muesca
    if (paso2) {
      this.posiciones[2] = (this.posiciones[2] + 1) % 26;
    }
  }

  /**
   * Pasa un carácter por un rotor en dirección directa (ida) o inversa (vuelta).
   * @param {string} letra
   * @param {number} rotorIdx - 0, 1, 2
   * @param {boolean} reverso - false = ida, true = vuelta
   * @returns {string}
   */
  pasarPorRotor(letra, rotorIdx, reverso = false) {
    const rotorNum = this.rotores[rotorIdx] || 1;
    const cableado = CABLEADO_ROTORES[rotorNum]?.cableado || CABLEADO_ROTORES[1].cableado;
    const pos = this.posiciones[rotorIdx] || 0;

    const inIdx = (charToIdx(letra) + pos) % 26;

    if (!reverso) {
      // Ida: contacto directo
      const outChar = cableado[inIdx];
      const outIdx = ((charToIdx(outChar) - pos) % 26 + 26) % 26;
      return idxToChar(outIdx);
    } else {
      // Vuelta: búsqueda inversa en el cableado
      const charToFind = idxToChar(inIdx);
      const revIdx = cableado.indexOf(charToFind);
      const outIdx = ((revIdx - pos) % 26 + 26) % 26;
      return idxToChar(outIdx);
    }
  }

  /**
   * Aplica la reflexión simétrica con UKW-B.
   * @param {string} letra
   * @returns {string}
   */
  reflector(letra) {
    const idx = charToIdx(letra);
    return REFLECTOR_B[idx];
  }

  /**
   * Procesa una letra a través de todos los componentes de la máquina Enigma:
   * 1. Plugboard
   * 2. Rotor 0 → Rotor 1 → Rotor 2 (Ida)
   * 3. Reflector B
   * 4. Rotor 2 → Rotor 1 → Rotor 0 (Vuelta)
   * 5. Plugboard
   * @param {string} letra
   * @returns {string}
   */
  procesarLetra(letra) {
    // 1. Plugboard
    let ch = this.plugboard.get(letra) || letra;

    // 2. Rotores (ida)
    for (let i = 0; i < this.rotores.length; i++) {
      ch = this.pasarPorRotor(ch, i, false);
    }

    // 3. Reflector
    ch = this.reflector(ch);

    // 4. Rotores (vuelta)
    for (let i = this.rotores.length - 1; i >= 0; i--) {
      ch = this.pasarPorRotor(ch, i, true);
    }

    // 5. Plugboard otra vez
    ch = this.plugboard.get(ch) || ch;

    return ch;
  }

  /**
   * Cifra o descifra una cadena de texto.
   * La máquina Enigma es estrictamente simétrica.
   * @param {string} mensaje
   * @returns {string}
   */
  cifrar(mensaje) {
    if (typeof mensaje !== 'string') return '';
    let resultado = '';
    for (const letra of mensaje.toUpperCase()) {
      if (!/[A-Z]/.test(letra)) {
        resultado += letra;
        continue;
      }
      this.rotar();
      resultado += this.procesarLetra(letra);
    }
    return resultado;
  }

  /**
   * Descifrar es idéntico a cifrar con la misma configuración inicial.
   * @param {string} mensajeCifrado
   * @returns {string}
   */
  descifrar(mensajeCifrado) {
    return this.cifrar(mensajeCifrado);
  }
}

/**
 * Función auxiliar para cifrar un texto con una configuración fija sin alterar instancias.
 * @param {string} mensaje
 * @param {number[]} [rotores=[1,2,3]]
 * @param {number[]} [posiciones=[0,0,0]]
 * @param {Array<[string, string]>} [plugboardPares=[]]
 * @returns {string}
 */
export function cifrarEnigma(mensaje, rotores = [1, 2, 3], posiciones = [0, 0, 0], plugboardPares = []) {
  const maquina = new Enigma(rotores, posiciones, 'B');
  for (const [a, b] of plugboardPares) {
    maquina.conectarPlugboard(a, b);
  }
  return maquina.cifrar(mensaje);
}

/**
 * Descifra un mensaje Enigma restableciendo la máquina a las posiciones iniciales.
 * @param {string} mensajeCifrado
 * @param {number[]} [rotores=[1,2,3]]
 * @param {number[]} [posiciones=[0,0,0]]
 * @param {Array<[string, string]>} [plugboardPares=[]]
 * @returns {string}
 */
export function descifrarEnigma(mensajeCifrado, rotores = [1, 2, 3], posiciones = [0, 0, 0], plugboardPares = []) {
  return cifrarEnigma(mensajeCifrado, rotores, posiciones, plugboardPares);
}

/**
 * Guarda el progreso del puzzle Enigma en localStorage.
 * @param {object} data
 */
export function guardarProgresoEnigma(data = {}) {
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_ENIGMA_KEY) || '{}');
    const updated = { ...prev, ...data, fecha: Date.now() };
    localStorage.setItem(STORAGE_ENIGMA_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('[Enigma] Error al guardar progreso:', e);
    return null;
  }
}

/**
 * Lee el progreso del puzzle Enigma desde localStorage.
 * @returns {object|null}
 */
export function cargarProgresoEnigma() {
  try {
    const raw = localStorage.getItem(STORAGE_ENIGMA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export function testEnigma() {
  console.group('%c[TEST SUITE] Máquina Enigma (enigma.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  // 1. Simetría e invariante fundamental: cifrar y luego descifrar devuelve el texto original
  const mensajeOriginal = 'EL CODIGO NO MIENTE PERO LAS MADRES SI';
  const cifrado = cifrarEnigma(mensajeOriginal, [1, 2, 3], [5, 12, 20]);
  assert(cifrado !== mensajeOriginal, 'El mensaje cifrado debe diferir del original');
  assert(cifrado.length === mensajeOriginal.length, 'La longitud debe coincidir');

  const descifrado = descifrarEnigma(cifrado, [1, 2, 3], [5, 12, 20]);
  assert(descifrado === mensajeOriginal, 'Descifrar con la misma clave debe recuperar el mensaje exacto');

  // 2. Propiedad Enigma: una letra nunca se cifra a sí misma
  let nuncaASiMisma = true;
  for (let i = 0; i < mensajeOriginal.length; i++) {
    if (/[A-Z]/.test(mensajeOriginal[i]) && mensajeOriginal[i] === cifrado[i]) {
      nuncaASiMisma = false;
      break;
    }
  }
  assert(nuncaASiMisma, 'Enigma nunca cifra una letra a sí misma (propiedad histórica del reflector)');

  // 3. Plugboard (permutación de clavijas)
  const enigmaConPlug = new Enigma([1, 2, 3], [0, 0, 0]);
  enigmaConPlug.conectarPlugboard('A', 'Z');
  assert(enigmaConPlug.plugboard.get('A') === 'Z' && enigmaConPlug.plugboard.get('Z') === 'A', 'Plugboard conecta pares simétricos');

  const conPlug = cifrarEnigma('HOLA NEXUS', [1, 2, 3], [0, 0, 0], [['A', 'Z'], ['E', 'O']]);
  const descPlug = descifrarEnigma(conPlug, [1, 2, 3], [0, 0, 0], [['A', 'Z'], ['E', 'O']]);
  assert(descPlug === 'HOLA NEXUS', 'Cifrado y descifrado con plugboard activo es recíproco');

  // 4. Persistencia en localStorage
  const saved = guardarProgresoEnigma({ resuelto: true, puzzleId: 'enigma_fw3_01' });
  assert(saved && saved.resuelto === true, 'Progreso guardado correctamente en localStorage');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Enigma: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Enigma: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

