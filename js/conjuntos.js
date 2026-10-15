/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Conjuntos — Motor de operaciones de teoría de conjuntos
 * Especificación: Sección 5.1 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

/**
 * Normaliza cualquier iterable, Array o Set a una instancia de Set.
 * Permite que las funciones acepten tanto Sets como Arrays/iterables de forma segura.
 * @param {Iterable<any>|Set<any>} s
 * @returns {Set<any>}
 */
function toSet(s) {
  if (s instanceof Set) return s;
  if (!s) return new Set();
  return new Set(s);
}

/**
 * Módulo de Conjuntos con todas las operaciones requeridas por el spec:
 * union, interseccion, diferencia, diferenciaSimetrica, pertenece,
 * subconjunto, subconjuntoPropio, iguales, cardinalidad, vacio.
 */
export const Conjuntos = {
  /**
   * Unión A ∪ B: elementos que pertenecen a A, a B o a ambos.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {Set}
   */
  union: (a, b) => new Set([...toSet(a), ...toSet(b)]),

  /**
   * Intersección A ∩ B: elementos que pertenecen simultáneamente a A y a B.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {Set}
   */
  interseccion: (a, b) => {
    const sB = toSet(b);
    return new Set([...toSet(a)].filter(x => sB.has(x)));
  },

  /**
   * Diferencia A \ B: elementos que pertenecen a A pero no a B.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {Set}
   */
  diferencia: (a, b) => {
    const sB = toSet(b);
    return new Set([...toSet(a)].filter(x => !sB.has(x)));
  },

  /**
   * Diferencia simétrica A △ B: elementos en A o en B, pero no en ambos.
   * Equivalente a (A \ B) ∪ (B \ A).
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {Set}
   */
  diferenciaSimetrica: (a, b) => {
    const sA = toSet(a);
    const sB = toSet(b);
    return new Set([
      ...[...sA].filter(x => !sB.has(x)),
      ...[...sB].filter(x => !sA.has(x))
    ]);
  },

  /**
   * Pertenencia x ∈ A: determina si el elemento x pertenece al conjunto A.
   * @param {any} x
   * @param {Set|Iterable} a
   * @returns {boolean}
   */
  pertenece: (x, a) => toSet(a).has(x),

  /**
   * Subconjunto A ⊆ B: todos los elementos de A están en B.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {boolean}
   */
  subconjunto: (a, b) => {
    const sB = toSet(b);
    return [...toSet(a)].every(x => sB.has(x));
  },

  /**
   * Subconjunto propio A ⊂ B: A ⊆ B y |A| < |B|.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {boolean}
   */
  subconjuntoPropio: (a, b) => {
    const sA = toSet(a);
    const sB = toSet(b);
    return Conjuntos.subconjunto(sA, sB) && sA.size < sB.size;
  },

  /**
   * Igualdad A = B: A y B contienen exactamente los mismos elementos.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} b
   * @returns {boolean}
   */
  iguales: (a, b) => {
    const sA = toSet(a);
    const sB = toSet(b);
    return sA.size === sB.size && [...sA].every(x => sB.has(x));
  },

  /**
   * Cardinalidad |A|: cantidad de elementos únicos en A.
   * @param {Set|Iterable} a
   * @returns {number}
   */
  cardinalidad: (a) => toSet(a).size,

  /**
   * Conjunto vacío ∅.
   * @returns {Set}
   */
  vacio: () => new Set(),

  // ── Utilidades auxiliares para puzzles y visualización ──

  /**
   * Complemento Aᶜ respecto a un conjunto universo U: U \ A.
   * @param {Set|Iterable} a
   * @param {Set|Iterable} universo
   * @returns {Set}
   */
  complemento: (a, universo) => Conjuntos.diferencia(universo, a),

  /**
   * Representación en cadena para terminal y UI: "{ 1, 2, 3 }" o "∅".
   * @param {Set|Iterable} a
   * @returns {string}
   */
  aTexto: (a) => {
    const s = toSet(a);
    if (s.size === 0) return '∅';
    const elementos = [...s].sort((x, y) => {
      if (typeof x === 'number' && typeof y === 'number') return x - y;
      return String(x).localeCompare(String(y));
    });
    return `{ ${elementos.join(', ')} }`;
  }
};

/**
 * Suite de tests unitarios para Conjuntos con console.assert.
 * Se ejecuta al iniciar en modo debug.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testConjuntos() {
  console.group('%c[TEST SUITE] Conjuntos (conjuntos.js)', 'color: #00ff41; font-weight: bold;');
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

  const {
    union, interseccion, diferencia, diferenciaSimetrica,
    pertenece, subconjunto, subconjuntoPropio, iguales,
    cardinalidad, vacio
  } = Conjuntos;

  const A = new Set([1, 2, 3]);
  const B = new Set([2, 3, 4]);
  const C = new Set([1, 2, 3]);
  const V = vacio();

  // 1. Cardinalidad y vacío
  assert(cardinalidad(V) === 0, 'El conjunto vacío debe tener cardinalidad 0');
  assert(cardinalidad(A) === 3, 'El conjunto A={1,2,3} debe tener cardinalidad 3');
  assert(V instanceof Set, 'vacio() debe retornar una instancia de Set');

  // 2. Pertenencia
  assert(pertenece(2, A) === true, 'El elemento 2 pertenece al conjunto A');
  assert(pertenece(4, A) === false, 'El elemento 4 no pertenece al conjunto A');
  assert(pertenece(1, V) === false, 'Ningún elemento pertenece al conjunto vacío');

  // 3. Igualdad
  assert(iguales(A, C) === true, 'A y C con mismos elementos deben ser iguales');
  assert(iguales(A, B) === false, 'A y B con elementos distintos no deben ser iguales');
  assert(iguales(V, vacio()) === true, 'Dos conjuntos vacíos deben ser iguales');

  // 4. Unión
  const uAB = union(A, B);
  assert(cardinalidad(uAB) === 4, 'Unión de A={1,2,3} y B={2,3,4} debe tener 4 elementos');
  assert(pertenece(1, uAB) && pertenece(2, uAB) && pertenece(3, uAB) && pertenece(4, uAB), 'Unión debe contener todos los elementos');
  assert(iguales(union(A, V), A) === true, 'A ∪ ∅ debe ser igual a A');

  // 5. Intersección
  const iAB = interseccion(A, B);
  assert(iguales(iAB, new Set([2, 3])) === true, 'A ∩ B debe ser {2, 3}');
  assert(iguales(interseccion(A, new Set([5, 6])), V) === true, 'Intersección disjunta debe ser vacía');
  assert(iguales(interseccion(A, V), V) === true, 'A ∩ ∅ debe ser vacío');

  // 6. Diferencia
  const dAB = diferencia(A, B);
  assert(iguales(dAB, new Set([1])) === true, 'A \\ B debe ser {1}');
  const dBA = diferencia(B, A);
  assert(iguales(dBA, new Set([4])) === true, 'B \\ A debe ser {4}');
  assert(iguales(diferencia(A, A), V) === true, 'A \\ A debe ser vacío');

  // 7. Diferencia simétrica
  const dsAB = diferenciaSimetrica(A, B);
  assert(iguales(dsAB, new Set([1, 4])) === true, 'A △ B debe ser {1, 4}');
  assert(iguales(diferenciaSimetrica(A, A), V) === true, 'A △ A debe ser vacío');
  assert(iguales(diferenciaSimetrica(A, V), A) === true, 'A △ ∅ debe ser A');

  // 8. Subconjunto
  const sub = new Set([1, 2]);
  assert(subconjunto(sub, A) === true, '{1, 2} debe ser subconjunto de {1, 2, 3}');
  assert(subconjunto(A, A) === true, 'Todo conjunto debe ser subconjunto de sí mismo');
  assert(subconjunto(V, A) === true, 'El conjunto vacío es subconjunto de cualquier conjunto');
  assert(subconjunto(B, A) === false, 'B={2,3,4} no es subconjunto de A={1,2,3}');

  // 9. Subconjunto propio
  assert(subconjuntoPropio(sub, A) === true, '{1, 2} es subconjunto propio de {1, 2, 3}');
  assert(subconjuntoPropio(A, A) === false, 'Un conjunto no es subconjunto propio de sí mismo');
  assert(subconjuntoPropio(V, A) === true, '∅ es subconjunto propio de A no vacío');
  assert(subconjuntoPropio(V, V) === false, '∅ no es subconjunto propio de ∅');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Conjuntos: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Conjuntos: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
