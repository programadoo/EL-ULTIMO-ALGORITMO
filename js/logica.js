/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Lógica — Motor de evaluación y análisis de lógica proposicional
 * Especificación: Sección 5.2 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────
// 1. TOKENIZADOR Y PARSER RECURSIVO DESCENDENTE
// ─────────────────────────────────────────────────

/**
 * Tokeniza una expresión lógica proposicional.
 * Soporta palabras clave (AND, OR, NOT, IMPLICA, SSI),
 * símbolos matemáticos (∧, ∨, ¬, →, ↔),
 * operadores lógicos de programación (&&, ||, !, ->, <->)
 * y variables alfanuméricas.
 *
 * @param {string} expr
 * @returns {Array<{ type: string, raw?: string, name?: string }>}
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const s = String(expr || '').trim();

  while (i < s.length) {
    // Ignorar espacios en blanco
    if (/\s/.test(s[i])) {
      i++;
      continue;
    }

    // Operadores multi-carácter
    if (s.startsWith('<->', i) || s.startsWith('<=>', i) || s.startsWith('<-->', i)) {
      tokens.push({ type: 'SSI', raw: s.slice(i, i + 3) });
      i += 3;
      continue;
    }
    if (s.startsWith('->', i) || s.startsWith('=>', i) || s.startsWith('-->', i)) {
      const len = s.startsWith('-->', i) ? 3 : 2;
      tokens.push({ type: 'IMPLICA', raw: s.slice(i, i + len) });
      i += len;
      continue;
    }
    if (s.startsWith('&&', i)) {
      tokens.push({ type: 'AND', raw: '&&' });
      i += 2;
      continue;
    }
    if (s.startsWith('||', i)) {
      tokens.push({ type: 'OR', raw: '||' });
      i += 2;
      continue;
    }
    if (s.startsWith('===', i) || s.startsWith('==', i)) {
      tokens.push({ type: 'SSI', raw: '==' });
      i += (s.startsWith('===', i) ? 3 : 2);
      continue;
    }

    const ch = s[i];

    // Paréntesis
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', raw: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', raw: ')' });
      i++;
      continue;
    }

    // Símbolos lógicos unicarácter
    if (ch === '↔') {
      tokens.push({ type: 'SSI', raw: '↔' });
      i++;
      continue;
    }
    if (ch === '→') {
      tokens.push({ type: 'IMPLICA', raw: '→' });
      i++;
      continue;
    }
    if (ch === '∧' || ch === '^') {
      tokens.push({ type: 'AND', raw: ch });
      i++;
      continue;
    }
    if (ch === '∨') {
      tokens.push({ type: 'OR', raw: ch });
      i++;
      continue;
    }
    if (ch === '¬' || ch === '~' || ch === '!') {
      tokens.push({ type: 'NOT', raw: ch });
      i++;
      continue;
    }

    // Palabras / Identificadores (AND, OR, NOT, IMPLICA, SSI, variables como p, q, r, etc.)
    if (/[a-zA-Z_0-9]/.test(ch)) {
      let word = '';
      while (i < s.length && /[a-zA-Z_0-9]/.test(s[i])) {
        word += s[i];
        i++;
      }
      const upper = word.toUpperCase();
      if (upper === 'AND') {
        tokens.push({ type: 'AND', raw: word });
      } else if (upper === 'OR') {
        tokens.push({ type: 'OR', raw: word });
      } else if (upper === 'NOT') {
        tokens.push({ type: 'NOT', raw: word });
      } else if (upper === 'IMPLICA' || upper === 'THEN') {
        tokens.push({ type: 'IMPLICA', raw: word });
      } else if (upper === 'SSI' || upper === 'IFF') {
        tokens.push({ type: 'SSI', raw: word });
      } else {
        tokens.push({ type: 'IDENT', name: word });
      }
      continue;
    }

    // Carácter desconocido, saltar
    i++;
  }

  return tokens;
}

/**
 * Resuelve el valor booleano de un identificador o literal.
 * @param {string} name
 * @param {Record<string, any>} valores
 * @returns {boolean}
 */
function resolveIdent(name, valores = {}) {
  if (name in valores) {
    return Boolean(valores[name]);
  }
  const lower = name.toLowerCase();
  if (lower === 'true' || lower === '1') return true;
  if (lower === 'false' || lower === '0') return false;
  // Si no está definido, por defecto false
  return false;
}

/*
 * Gramática con precedencia lógica formal:
 * SSI (↔)           [menor precedencia]
 * IMPLICA (→)       [asociativo a la derecha]
 * OR (∨)
 * AND (∧)
 * NOT (¬)           [asociativo a la derecha / prefijo]
 * Primario: ( expr ) | Identificador | Literal
 */

function parseSSI(tokens, pos, valores) {
  let [left, nextPos] = parseImplica(tokens, pos, valores);
  while (nextPos < tokens.length && tokens[nextPos].type === 'SSI') {
    const [right, afterRight] = parseImplica(tokens, nextPos + 1, valores);
    left = (left === right);
    nextPos = afterRight;
  }
  return [left, nextPos];
}

function parseImplica(tokens, pos, valores) {
  let [left, nextPos] = parseOr(tokens, pos, valores);
  if (nextPos < tokens.length && tokens[nextPos].type === 'IMPLICA') {
    // Implicación es asociativa por la derecha: p -> q -> r equivale a p -> (q -> r)
    const [right, afterRight] = parseImplica(tokens, nextPos + 1, valores);
    left = (!left || right);
    nextPos = afterRight;
  }
  return [left, nextPos];
}

function parseOr(tokens, pos, valores) {
  let [left, nextPos] = parseAnd(tokens, pos, valores);
  while (nextPos < tokens.length && tokens[nextPos].type === 'OR') {
    const [right, afterRight] = parseAnd(tokens, nextPos + 1, valores);
    left = (left || right);
    nextPos = afterRight;
  }
  return [left, nextPos];
}

function parseAnd(tokens, pos, valores) {
  let [left, nextPos] = parseNot(tokens, pos, valores);
  while (nextPos < tokens.length && tokens[nextPos].type === 'AND') {
    const [right, afterRight] = parseNot(tokens, nextPos + 1, valores);
    left = (left && right);
    nextPos = afterRight;
  }
  return [left, nextPos];
}

function parseNot(tokens, pos, valores) {
  if (pos < tokens.length && tokens[pos].type === 'NOT') {
    const [val, nextPos] = parseNot(tokens, pos + 1, valores);
    return [!val, nextPos];
  }
  return parsePrimary(tokens, pos, valores);
}

function parsePrimary(tokens, pos, valores) {
  if (pos >= tokens.length) {
    throw new Error('Expresión lógica incompleta o mal formateada.');
  }
  const token = tokens[pos];

  if (token.type === 'LPAREN') {
    const [val, nextPos] = parseSSI(tokens, pos + 1, valores);
    if (nextPos >= tokens.length || tokens[nextPos].type !== 'RPAREN') {
      throw new Error("Paréntesis de cierre ')' no encontrado.");
    }
    return [val, nextPos + 1];
  }

  if (token.type === 'IDENT') {
    return [resolveIdent(token.name, valores), pos + 1];
  }

  throw new Error(`Token inesperado en expresión lógica: ${token.raw || token.type}`);
}

// ─────────────────────────────────────────────────
// 2. MÓDULO DE LÓGICA (SPEC 5.2)
// ─────────────────────────────────────────────────

export const Logica = {
  /** Conjunción: p ∧ q */
  and: (p, q) => Boolean(p && q),

  /** Disyunción: p ∨ q */
  or: (p, q) => Boolean(p || q),

  /** Negación: ¬p */
  not: (p) => !p,

  /** Implicación material: p → q (falsa solo si p es V y q es F) */
  implica: (p, q) => !p || Boolean(q),

  /** Bicondicional: p ↔ q (verdadera si ambos tienen el mismo valor) */
  bicondicional: (p, q) => Boolean(p) === Boolean(q),

  /**
   * Evalúa una expresión proposicional con un conjunto de asignaciones de verdad.
   * Soporta palabras reservadas (AND, OR, NOT, IMPLICA, SSI) y símbolos (∧, ∨, ¬, →, ↔, &&, ||, !).
   *
   * @param {string} expr - Expresión a evaluar, ej: "(p AND q) IMPLICA NOT r" o "(p ∧ q) → ¬r"
   * @param {Record<string, boolean>} valores - Mapa de variables y sus valores { p: true, q: false }
   * @returns {boolean}
   */
  evaluar(expr, valores = {}) {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return false;
    const [res] = parseSSI(tokens, 0, valores);
    return Boolean(res);
  },

  /**
   * Extrae la lista de variables proposicionales únicas de una expresión.
   * @param {string} expr
   * @returns {string[]}
   */
  extraerVariables(expr) {
    const tokens = tokenize(expr);
    const vars = new Set();
    const reservadas = new Set(['true', 'false', '1', '0']);
    for (const t of tokens) {
      if (t.type === 'IDENT' && !reservadas.has(t.name.toLowerCase())) {
        vars.add(t.name);
      }
    }
    return [...vars].sort();
  },

  /**
   * Genera la tabla de verdad completa para una expresión y una lista de variables.
   *
   * @param {string} expr
   * @param {string[]} [variables] - Lista de variables. Si no se pasa, se extraen automáticamente.
   * @returns {Array<{ valores: Record<string, boolean>, resultado: boolean }>}
   */
  tablaDeVerdad(expr, variables) {
    const vars = (variables && variables.length > 0)
      ? variables
      : Logica.extraerVariables(expr);

    const filas = [];
    const n = vars.length;
    const totalFilas = 1 << n;

    for (let i = 0; i < totalFilas; i++) {
      const valores = {};
      vars.forEach((v, j) => {
        valores[v] = !!(i & (1 << (n - 1 - j)));
      });
      filas.push({ valores, resultado: Logica.evaluar(expr, valores) });
    }
    return filas;
  },

  /**
   * Clasifica una fórmula proposicional en:
   * - 'tautologia': verdadera para todas las interpretaciones
   * - 'contradiccion': falsa para todas las interpretaciones
   * - 'contingencia': verdadera en algunas y falsa en otras
   *
   * @param {string} expr
   * @param {string[]} [variables]
   * @returns {'tautologia' | 'contradiccion' | 'contingencia'}
   */
  clasificar(expr, variables) {
    const tabla = Logica.tablaDeVerdad(expr, variables);
    if (tabla.length === 0) return 'contingencia';
    const todosV = tabla.every(f => f.resultado);
    const todosF = tabla.every(f => !f.resultado);
    if (todosV) return 'tautologia';
    if (todosF) return 'contradiccion';
    return 'contingencia';
  },

  /**
   * Determina si dos expresiones proposicionales son lógicamente equivalentes (expr1 ≡ expr2).
   *
   * @param {string} expr1
   * @param {string} expr2
   * @param {string[]} [variables]
   * @returns {boolean}
   */
  sonEquivalentes(expr1, expr2, variables) {
    const vars = (variables && variables.length > 0)
      ? variables
      : [...new Set([...Logica.extraerVariables(expr1), ...Logica.extraerVariables(expr2)])].sort();

    const t1 = Logica.tablaDeVerdad(expr1, vars);
    const t2 = Logica.tablaDeVerdad(expr2, vars);
    return t1.every((f, i) => f.resultado === t2[i].resultado);
  }
};

// ─────────────────────────────────────────────────
// 3. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Ejecuta la suite de pruebas unitarias de Lógica con console.assert.
 * Se ejecuta al iniciar en modo debug.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testLogica() {
  console.group('%c[TEST SUITE] Lógica Proposicional (logica.js)', 'color: #00ff41; font-weight: bold;');
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
    and, or, not, implica, bicondicional,
    evaluar, tablaDeVerdad, clasificar, sonEquivalentes
  } = Logica;

  // 1. Operadores booleanos primitivos
  assert(and(true, true) === true, 'and(T, T) === true');
  assert(and(true, false) === false, 'and(T, F) === false');
  assert(or(true, false) === true, 'or(T, F) === true');
  assert(or(false, false) === false, 'or(F, F) === false');
  assert(not(true) === false, 'not(T) === false');
  assert(not(false) === true, 'not(F) === true');
  assert(implica(true, false) === false, 'implica(T, F) === false (único caso falso)');
  assert(implica(true, true) === true, 'implica(T, T) === true');
  assert(implica(false, true) === true, 'implica(F, T) === true');
  assert(implica(false, false) === true, 'implica(F, F) === true');
  assert(bicondicional(true, true) === true, 'bicondicional(T, T) === true');
  assert(bicondicional(false, false) === true, 'bicondicional(F, F) === true');
  assert(bicondicional(true, false) === false, 'bicondicional(T, F) === false');

  // 2. Evaluador de expresiones con palabras clave del spec
  assert(evaluar('p AND q', { p: true, q: true }) === true, 'evaluar: p AND q con T, T');
  assert(evaluar('p AND q', { p: true, q: false }) === false, 'evaluar: p AND q con T, F');
  assert(evaluar('p OR q', { p: false, q: true }) === true, 'evaluar: p OR q con F, T');
  assert(evaluar('NOT p', { p: true }) === false, 'evaluar: NOT p con T');
  assert(evaluar('NOT p', { p: false }) === true, 'evaluar: NOT p con F');
  assert(evaluar('p IMPLICA q', { p: true, q: false }) === false, 'evaluar: p IMPLICA q con T, F');
  assert(evaluar('p IMPLICA q', { p: false, q: false }) === true, 'evaluar: p IMPLICA q con F, F');
  assert(evaluar('p SSI q', { p: true, q: true }) === true, 'evaluar: p SSI q con T, T');
  assert(evaluar('p SSI q', { p: true, q: false }) === false, 'evaluar: p SSI q con T, F');

  // 3. Evaluador con símbolos matemáticos (tipo B del spec: "(p ∧ q) → ¬r")
  assert(evaluar('(p ∧ q) → ¬r', { p: true, q: true, r: false }) === true, 'evaluar: (p ∧ q) → ¬r con p=T, q=T, r=F debe dar T');
  assert(evaluar('(p ∧ q) → ¬r', { p: true, q: true, r: true }) === false, 'evaluar: (p ∧ q) → ¬r con p=T, q=T, r=T debe dar F');
  assert(evaluar('p ↔ q', { p: false, q: false }) === true, 'evaluar: p ↔ q con F, F');
  assert(evaluar('p ↔ q', { p: true, q: false }) === false, 'evaluar: p ↔ q con T, F');
  assert(evaluar('p -> q', { p: true, q: false }) === false, 'evaluar: p -> q con T, F');

  // 4. Precedencia y paréntesis
  assert(evaluar('p OR q AND r', { p: false, q: true, r: false }) === false, 'Precedencia: AND tiene mayor prioridad que OR');
  assert(evaluar('(p OR q) AND r', { p: true, q: false, r: true }) === true, 'Paréntesis agrupan (p OR q) AND r');
  assert(evaluar('NOT NOT p', { p: true }) === true, 'Doble negación: NOT NOT T === T');

  // 5. Tabla de verdad
  const tabla2 = tablaDeVerdad('p AND q', ['p', 'q']);
  assert(tabla2.length === 4, 'Tabla de verdad de 2 variables debe tener 4 filas');
  assert(tabla2[0].resultado === false, 'Fila 0 (F, F) de AND debe ser F');
  assert(tabla2[3].resultado === true, 'Fila 3 (T, T) de AND debe ser T');

  const tabla3 = tablaDeVerdad('(p ∨ q) ∧ r', ['p', 'q', 'r']);
  assert(tabla3.length === 8, 'Tabla de verdad de 3 variables debe tener 8 filas');

  // 6. Clasificación de fórmulas
  assert(clasificar('p OR NOT p', ['p']) === 'tautologia', 'p OR NOT p (tercero excluido) es tautología');
  assert(clasificar('p IMPLICA (q IMPLICA p)', ['p', 'q']) === 'tautologia', 'p → (q → p) es tautología');
  assert(clasificar('p AND NOT p', ['p']) === 'contradiccion', 'p AND NOT p (principio de contradicción) es contradicción');
  assert(clasificar('NOT (p IMPLICA p)', ['p']) === 'contradiccion', 'NOT (p → p) es contradicción');
  assert(clasificar('p AND q', ['p', 'q']) === 'contingencia', 'p AND q es contingencia');
  assert(clasificar('p IMPLICA q', ['p', 'q']) === 'contingencia', 'p IMPLICA q es contingencia');

  // 7. Equivalencias lógicas fundamentales
  assert(sonEquivalentes('p IMPLICA q', 'NOT p OR q', ['p', 'q']) === true, 'Definición de implicación: p → q ≡ ¬p ∨ q');
  assert(sonEquivalentes('p IMPLICA q', '¬q → ¬p', ['p', 'q']) === true, 'Ley del contrarrecíproco: p → q ≡ ¬q → ¬p');
  assert(sonEquivalentes('p SSI q', '(p IMPLICA q) AND (q IMPLICA p)', ['p', 'q']) === true, 'Definición de bicondicional: p ↔ q ≡ (p → q) ∧ (q → p)');
  assert(sonEquivalentes('NOT (p AND q)', 'NOT p OR NOT q', ['p', 'q']) === true, '1ª Ley de De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q');
  assert(sonEquivalentes('NOT (p OR q)', 'NOT p AND NOT q', ['p', 'q']) === true, '2ª Ley de De Morgan: ¬(p ∨ q) ≡ ¬p ∧ ¬q');
  assert(sonEquivalentes('p AND q', 'p OR q', ['p', 'q']) === false, 'p AND q no es equivalente a p OR q');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Lógica: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Lógica: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
