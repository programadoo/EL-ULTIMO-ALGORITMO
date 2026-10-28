/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Intérprete GhostScript — Sandbox seguro (Sin eval ni new Function)
 * Especificación: SPEC_3AVANZADO.MD (Capa 2, Sección 2.1 y Prompt B1)
 * ══════════════════════════════════════════════════
 *
 * GhostScript es un mini-lenguaje estructurado para automatización de hacking
 * y resolución de desafíos algorítmicos dentro de NEXUS.
 *
 * Arquitectura:
 * 1. Lexer (Tokenizador con seguimiento de líneas y columnas)
 * 2. Parser (Análisis sintáctico descendente recursivo a AST)
 * 3. Environment (Tabla de símbolos y gestión de ámbitos léxicos)
 * 4. Evaluator (Evaluador de AST en sandbox aislado, con protección anti-bucle)
 *
 * Comandos obligatorios:
 * - LET: Declaración y asignación de variables (incluye arrays)
 * - SCAN: Escaneo de hosts, puertos y usuarios
 * - CRACK: Criptoanálisis / fuerza bruta sobre hashes o contraseñas
 * - DECRYPT: Descifrado de archivos con clave (sintaxis: DECRYPT archivo CON clave)
 * - SEND: Envío de paquetes o credenciales (sintaxis: SEND msg TO host)
 * - IF / ELSE / END: Control condicional de flujo
 * - LOOP n TIMES ... END: Estructura de repetición acotada
 * - PRINT / LOG: Salida a consola del terminal
 * - RETURN: Retorno temprano de valores
 */

// ─────────────────────────────────────────────────
// 1. TOKENIZADOR (LEXER)
// ─────────────────────────────────────────────────

export const TokenType = {
  // Palabras reservadas
  LET: 'LET',
  SCAN: 'SCAN',
  CRACK: 'CRACK',
  DECRYPT: 'DECRYPT',
  CON: 'CON',
  WITH: 'WITH',
  SEND: 'SEND',
  TO: 'TO',
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  END: 'END',
  LOOP: 'LOOP',
  TIMES: 'TIMES',
  PRINT: 'PRINT',
  LOG: 'LOG',
  RETURN: 'RETURN',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NULL: 'NULL',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',

  // Literales e Identificadores
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',

  // Operadores
  ASSIGN: '=',
  PLUS: '+',
  MINUS: '-',
  STAR: '*',
  SLASH: '/',
  MOD: '%',
  EQ: '==',
  NEQ: '!=',
  LT: '<',
  LTE: '<=',
  GT: '>',
  GTE: '>=',
  BANG: '!',

  // Delimitadores
  LPAREN: '(',
  RPAREN: ')',
  LBRACKET: '[',
  RBRACKET: ']',
  LBRACE: '{',
  RBRACE: '}',
  COMMA: ',',
  DOT: '.',
  COLON: ':',

  // Fin de archivo / Nuevas líneas
  NEWLINE: 'NEWLINE',
  EOF: 'EOF'
};

const KEYWORDS = {
  LET: TokenType.LET,
  SCAN: TokenType.SCAN,
  CRACK: TokenType.CRACK,
  DECRYPT: TokenType.DECRYPT,
  CON: TokenType.CON,
  WITH: TokenType.CON,
  SEND: TokenType.SEND,
  TO: TokenType.TO,
  IF: TokenType.IF,
  THEN: TokenType.THEN,
  ELSE: TokenType.ELSE,
  END: TokenType.END,
  LOOP: TokenType.LOOP,
  TIMES: TokenType.TIMES,
  PRINT: TokenType.PRINT,
  LOG: TokenType.PRINT,
  RETURN: TokenType.RETURN,
  TRUE: TokenType.TRUE,
  FALSE: TokenType.FALSE,
  NULL: TokenType.NULL,
  AND: TokenType.AND,
  OR: TokenType.OR,
  NOT: TokenType.NOT
};

export class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

export class Lexer {
  constructor(source) {
    this.source = source || '';
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }

  tokenize() {
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];

      // Espacios en blanco (excepto saltos de línea)
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Saltos de línea
      if (ch === '\n') {
        this.tokens.push(new Token(TokenType.NEWLINE, '\n', this.line, this.col));
        this.advance();
        this.line++;
        this.col = 1;
        continue;
      }

      // Comentarios de una línea (// ...)
      if (ch === '/' && this.peek() === '/') {
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
          this.advance();
        }
        continue;
      }

      // Comentarios de bloque (/* ... */)
      if (ch === '/' && this.peek() === '*') {
        this.advance();
        this.advance();
        while (this.pos < this.source.length) {
          if (this.source[this.pos] === '*' && this.peek() === '/') {
            this.advance();
            this.advance();
            break;
          }
          if (this.source[this.pos] === '\n') {
            this.line++;
            this.col = 0;
          }
          this.advance();
        }
        continue;
      }

      // Strings ("..." o '...')
      if (ch === '"' || ch === "'") {
        this.tokens.push(this.readString(ch));
        continue;
      }

      // Números (enteros o flotantes)
      if (this.isDigit(ch)) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Identificadores y palabras clave
      if (this.isAlpha(ch)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Operadores de 2 caracteres
      if (ch === '=' && this.peek() === '=') {
        this.tokens.push(new Token(TokenType.EQ, '==', this.line, this.col));
        this.advance(2);
        continue;
      }
      if (ch === '!' && this.peek() === '=') {
        this.tokens.push(new Token(TokenType.NEQ, '!=', this.line, this.col));
        this.advance(2);
        continue;
      }
      if (ch === '<' && this.peek() === '=') {
        this.tokens.push(new Token(TokenType.LTE, '<=', this.line, this.col));
        this.advance(2);
        continue;
      }
      if (ch === '>' && this.peek() === '=') {
        this.tokens.push(new Token(TokenType.GTE, '>=', this.line, this.col));
        this.advance(2);
        continue;
      }
      if (ch === '&' && this.peek() === '&') {
        this.tokens.push(new Token(TokenType.AND, '&&', this.line, this.col));
        this.advance(2);
        continue;
      }
      if (ch === '|' && this.peek() === '|') {
        this.tokens.push(new Token(TokenType.OR, '||', this.line, this.col));
        this.advance(2);
        continue;
      }

      // Operadores y delimitadores de un solo carácter
      switch (ch) {
        case '=': this.tokens.push(new Token(TokenType.ASSIGN, '=', this.line, this.col)); break;
        case '+': this.tokens.push(new Token(TokenType.PLUS, '+', this.line, this.col)); break;
        case '-': this.tokens.push(new Token(TokenType.MINUS, '-', this.line, this.col)); break;
        case '*': this.tokens.push(new Token(TokenType.STAR, '*', this.line, this.col)); break;
        case '/': this.tokens.push(new Token(TokenType.SLASH, '/', this.line, this.col)); break;
        case '%': this.tokens.push(new Token(TokenType.MOD, '%', this.line, this.col)); break;
        case '<': this.tokens.push(new Token(TokenType.LT, '<', this.line, this.col)); break;
        case '>': this.tokens.push(new Token(TokenType.GT, '>', this.line, this.col)); break;
        case '!': this.tokens.push(new Token(TokenType.BANG, '!', this.line, this.col)); break;
        case '(': this.tokens.push(new Token(TokenType.LPAREN, '(', this.line, this.col)); break;
        case ')': this.tokens.push(new Token(TokenType.RPAREN, ')', this.line, this.col)); break;
        case '[': this.tokens.push(new Token(TokenType.LBRACKET, '[', this.line, this.col)); break;
        case ']': this.tokens.push(new Token(TokenType.RBRACKET, ']', this.line, this.col)); break;
        case '{': this.tokens.push(new Token(TokenType.LBRACE, '{', this.line, this.col)); break;
        case '}': this.tokens.push(new Token(TokenType.RBRACE, '}', this.line, this.col)); break;
        case ',': this.tokens.push(new Token(TokenType.COMMA, ',', this.line, this.col)); break;
        case '.': this.tokens.push(new Token(TokenType.DOT, '.', this.line, this.col)); break;
        case ':': this.tokens.push(new Token(TokenType.COLON, ':', this.line, this.col)); break;
        case ';':
          // Tratado como delimitador de sentencia (similar a newline)
          this.tokens.push(new Token(TokenType.NEWLINE, ';', this.line, this.col));
          break;
        default: {
          const err = new Error(`[GhostScript Lexer] Carácter inesperado '${ch}' en línea ${this.line}, col ${this.col}`);
          err.line = this.line;
          err.column = this.col;
          throw err;
        }
      }

      this.advance();
    }

    this.tokens.push(new Token(TokenType.EOF, '', this.line, this.col));
    return this.tokens;
  }

  advance(count = 1) {
    this.pos += count;
    this.col += count;
  }

  peek(offset = 1) {
    const idx = this.pos + offset;
    return idx < this.source.length ? this.source[idx] : null;
  }

  isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
  }

  readString(quote) {
    const startLine = this.line;
    const startCol = this.col;
    this.advance(); // Saltar comilla inicial
    let str = '';

    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      const ch = this.source[this.pos];
      if (ch === '\\') {
        this.advance();
        const esc = this.source[this.pos];
        if (esc === 'n') str += '\n';
        else if (esc === 't') str += '\t';
        else if (esc === 'r') str += '\r';
        else if (esc === '"') str += '"';
        else if (esc === "'") str += "'";
        else if (esc === '\\') str += '\\';
        else str += esc;
      } else {
        if (ch === '\n') {
          this.line++;
          this.col = 0;
        }
        str += ch;
      }
      this.advance();
    }

    if (this.pos >= this.source.length) {
      const err = new Error(`[GhostScript Lexer] Cadena de texto sin cerrar iniciada en línea ${startLine}, col ${startCol}`);
      err.line = startLine;
      err.column = startCol;
      throw err;
    }

    this.advance(); // Saltar comilla final
    return new Token(TokenType.STRING, str, startLine, startCol);
  }

  readNumber() {
    const startCol = this.col;
    let numStr = '';
    while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
      numStr += this.source[this.pos];
      this.advance();
    }

    if (this.source[this.pos] === '.' && this.isDigit(this.peek())) {
      numStr += '.';
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
        numStr += this.source[this.pos];
        this.advance();
      }
    }

    const value = numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr, 10);
    return new Token(TokenType.NUMBER, value, this.line, startCol);
  }

  readIdentifier() {
    const startCol = this.col;
    let ident = '';
    while (this.pos < this.source.length && (this.isAlpha(this.source[this.pos]) || this.isDigit(this.source[this.pos]))) {
      ident += this.source[this.pos];
      this.advance();
    }

    const upper = ident.toUpperCase();
    const type = KEYWORDS[upper] || TokenType.IDENTIFIER;
    return new Token(type, ident, this.line, startCol);
  }
}

// ─────────────────────────────────────────────────
// 2. PARSER (ANÁLISIS SINTÁCTICO -> AST)
// ─────────────────────────────────────────────────

export class Parser {
  constructor(tokens) {
    this.tokens = tokens || [];
    this.current = 0;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      // Ignorar saltos de línea vacíos
      if (this.match(TokenType.NEWLINE)) {
        continue;
      }
      statements.push(this.statement());
    }
    return { type: 'Program', body: statements };
  }

  statement() {
    // 1. LET
    if (this.match(TokenType.LET)) {
      return this.letStatement();
    }

    // 2. SCAN
    if (this.check(TokenType.SCAN)) {
      return this.scanStatement();
    }

    // 3. CRACK
    if (this.check(TokenType.CRACK)) {
      return this.crackStatement();
    }

    // 4. DECRYPT
    if (this.check(TokenType.DECRYPT)) {
      return this.decryptStatement();
    }

    // 5. SEND
    if (this.match(TokenType.SEND)) {
      return this.sendStatement();
    }

    // 6. IF
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }

    // 7. LOOP
    if (this.match(TokenType.LOOP)) {
      return this.loopStatement();
    }

    // 8. PRINT / LOG
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }

    // 9. RETURN
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }

    // 10. Reasignación de variable o sentencia de expresión
    return this.assignmentOrExpressionStatement();
  }

  letStatement() {
    const idToken = this.consume(TokenType.IDENTIFIER, 'Se esperaba el nombre de la variable tras LET');
    let indexExpr = null;

    if (this.match(TokenType.LBRACKET)) {
      indexExpr = this.expression();
      this.consume(TokenType.RBRACKET, "Se esperaba ']' tras índice");
    }

    let init = null;
    if (this.match(TokenType.ASSIGN)) {
      init = this.expression();
    }

    this.consumeStatementEnd();
    return {
      type: 'LetStatement',
      name: idToken.value,
      index: indexExpr,
      init,
      line: idToken.line
    };
  }

  scanStatement() {
    const expr = this.scanExpression();
    this.consumeStatementEnd();
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: expr.line
    };
  }

  scanExpression() {
    const token = this.consume(TokenType.SCAN, "Se esperaba comando 'SCAN'");
    const target = this.expression();
    return {
      type: 'ScanExpression',
      target,
      line: token.line
    };
  }

  crackStatement() {
    const expr = this.crackExpression();
    this.consumeStatementEnd();
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: expr.line
    };
  }

  crackExpression() {
    const token = this.consume(TokenType.CRACK, "Se esperaba comando 'CRACK'");
    const target = this.expression();
    return {
      type: 'CrackExpression',
      target,
      line: token.line
    };
  }

  decryptStatement() {
    const expr = this.decryptExpression();
    this.consumeStatementEnd();
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: expr.line
    };
  }

  decryptExpression() {
    const token = this.consume(TokenType.DECRYPT, "Se esperaba comando 'DECRYPT'");
    const file = this.expression();
    // 'CON' o 'WITH'
    this.consume(TokenType.CON, "Se esperaba 'CON' o 'WITH' tras el archivo en DECRYPT");
    const key = this.expression();
    return {
      type: 'DecryptExpression',
      file,
      key,
      line: token.line
    };
  }

  sendStatement() {
    const line = this.previous().line;
    const message = this.expression();
    this.consume(TokenType.TO, "Se esperaba 'TO' tras el mensaje en SEND");
    const host = this.expression();
    this.consumeStatementEnd();
    return {
      type: 'SendStatement',
      message,
      host,
      line
    };
  }

  ifStatement() {
    const line = this.previous().line;
    const condition = this.expression();
    // Opcional 'THEN'
    this.match(TokenType.THEN);
    this.consumeStatementEnd();

    const consequent = [];
    const alternate = [];
    let inElse = false;

    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      if (this.match(TokenType.ELSE)) {
        inElse = true;
        this.consumeStatementEnd();
        continue;
      }
      if (this.match(TokenType.NEWLINE)) {
        continue;
      }

      if (inElse) {
        alternate.push(this.statement());
      } else {
        consequent.push(this.statement());
      }
    }

    this.consume(TokenType.END, "Se esperaba 'END' para cerrar el bloque IF");
    this.consumeStatementEnd();

    return {
      type: 'IfStatement',
      condition,
      consequent,
      alternate,
      line
    };
  }

  loopStatement() {
    const line = this.previous().line;
    const count = this.expression();
    this.consume(TokenType.TIMES, "Se esperaba 'TIMES' en la declaración de LOOP");
    this.consumeStatementEnd();

    const body = [];
    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      if (this.match(TokenType.NEWLINE)) {
        continue;
      }
      body.push(this.statement());
    }

    this.consume(TokenType.END, "Se esperaba 'END' para cerrar el bloque LOOP");
    this.consumeStatementEnd();

    return {
      type: 'LoopStatement',
      count,
      body,
      line
    };
  }

  printStatement() {
    const line = this.previous().line;
    const args = [];
    if (!this.checkStatementEnd()) {
      args.push(this.expression());
      while (this.match(TokenType.COMMA)) {
        args.push(this.expression());
      }
    }
    this.consumeStatementEnd();
    return {
      type: 'PrintStatement',
      args,
      line
    };
  }

  returnStatement() {
    const line = this.previous().line;
    let argument = null;
    if (!this.checkStatementEnd()) {
      argument = this.expression();
    }
    this.consumeStatementEnd();
    return {
      type: 'ReturnStatement',
      argument,
      line
    };
  }

  assignmentOrExpressionStatement() {
    // Si empieza con identificador seguido de '=' o '[index] ='
    if (this.check(TokenType.IDENTIFIER)) {
      const saved = this.current;
      const idToken = this.advance();

      // Caso array indexing: id[index] = expr
      if (this.match(TokenType.LBRACKET)) {
        const indexExpr = this.expression();
        if (this.match(TokenType.RBRACKET) && this.match(TokenType.ASSIGN)) {
          const value = this.expression();
          this.consumeStatementEnd();
          return {
            type: 'AssignmentStatement',
            name: idToken.value,
            index: indexExpr,
            value,
            line: idToken.line
          };
        }
      } else if (this.match(TokenType.ASSIGN)) {
        const value = this.expression();
        this.consumeStatementEnd();
        return {
          type: 'AssignmentStatement',
          name: idToken.value,
          index: null,
          value,
          line: idToken.line
        };
      }

      // Rebobinar si no era asignación
      this.current = saved;

      // Si es un identificador suelto al inicio de sentencia, es un comando mal escrito o asignación incompleta
      const suggestion = sugerirComandoGhostScript(idToken.value);
      const hint = suggestion
        ? `¿Quisiste decir '${suggestion}'?`
        : `¿Falta '=' para asignar o escribiste mal un comando (LET, SCAN, CRACK, DECRYPT, SEND, IF, LOOP, PRINT, RETURN)?`;
      const err = new Error(`[GhostScript Parser] Error sintáctico: Instrucción o comando desconocido '${idToken.value}' en línea ${idToken.line}, col ${idToken.column}. ${hint}`);
      err.line = idToken.line;
      err.column = idToken.column;
      throw err;
    }

    const expr = this.expression();
    this.consumeStatementEnd();
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: expr.line || (this.peek() ? this.peek().line : 1)
    };
  }

  // ───────────────────────────────────────────────
  // Expresiones con precedencia de operadores
  // ───────────────────────────────────────────────

  expression() {
    return this.logicalOr();
  }

  logicalOr() {
    let expr = this.logicalAnd();
    while (this.match(TokenType.OR)) {
      const op = this.previous();
      const right = this.logicalAnd();
      expr = {
        type: 'BinaryExpression',
        operator: '||',
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  logicalAnd() {
    let expr = this.equality();
    while (this.match(TokenType.AND)) {
      const op = this.previous();
      const right = this.equality();
      expr = {
        type: 'BinaryExpression',
        operator: '&&',
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  equality() {
    let expr = this.comparison();
    while (this.match(TokenType.EQ, TokenType.NEQ)) {
      const op = this.previous();
      const right = this.comparison();
      expr = {
        type: 'BinaryExpression',
        operator: op.type === TokenType.EQ ? '==' : '!=',
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  comparison() {
    let expr = this.addition();
    while (this.match(TokenType.LT, TokenType.LTE, TokenType.GT, TokenType.GTE)) {
      const op = this.previous();
      const right = this.addition();
      expr = {
        type: 'BinaryExpression',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  addition() {
    let expr = this.multiplication();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const op = this.previous();
      const right = this.multiplication();
      expr = {
        type: 'BinaryExpression',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  multiplication() {
    let expr = this.unary();
    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.MOD)) {
      const op = this.previous();
      const right = this.unary();
      expr = {
        type: 'BinaryExpression',
        operator: op.value,
        left: expr,
        right,
        line: op.line
      };
    }
    return expr;
  }

  unary() {
    if (this.match(TokenType.BANG, TokenType.NOT, TokenType.MINUS)) {
      const op = this.previous();
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator: (op.type === TokenType.NOT || op.type === TokenType.BANG) ? '!' : '-',
        argument: right,
        line: op.line
      };
    }
    return this.callOrMember();
  }

  callOrMember() {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LBRACKET)) {
        const index = this.expression();
        this.consume(TokenType.RBRACKET, "Se esperaba ']' tras índice");
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: index,
          computed: true,
          line: expr.line
        };
      } else if (this.match(TokenType.DOT)) {
        const prop = this.consume(TokenType.IDENTIFIER, 'Se esperaba nombre de propiedad tras punto');
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: { type: 'Literal', value: prop.value },
          computed: false,
          line: prop.line
        };
      } else {
        break;
      }
    }

    return expr;
  }

  primary() {
    if (this.match(TokenType.NUMBER)) {
      return { type: 'Literal', value: this.previous().value, line: this.previous().line };
    }
    if (this.match(TokenType.STRING)) {
      return { type: 'Literal', value: this.previous().value, line: this.previous().line };
    }
    if (this.match(TokenType.TRUE)) {
      return { type: 'Literal', value: true, line: this.previous().line };
    }
    if (this.match(TokenType.FALSE)) {
      return { type: 'Literal', value: false, line: this.previous().line };
    }
    if (this.match(TokenType.NULL)) {
      return { type: 'Literal', value: null, line: this.previous().line };
    }

    // Comandos usados como expresiones en RHS (ej. LET u = SCAN "host")
    if (this.check(TokenType.SCAN)) {
      return this.scanExpression();
    }
    if (this.check(TokenType.CRACK)) {
      return this.crackExpression();
    }
    if (this.check(TokenType.DECRYPT)) {
      return this.decryptExpression();
    }

    // Identificador (variable)
    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: this.previous().value, line: this.previous().line };
    }

    // Paréntesis (expr)
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Se esperaba ')' tras expresión");
      return expr;
    }

    // Array literal [e1, e2, ...]
    if (this.match(TokenType.LBRACKET)) {
      const elements = [];
      if (!this.check(TokenType.RBRACKET)) {
        elements.push(this.expression());
        while (this.match(TokenType.COMMA)) {
          if (this.check(TokenType.RBRACKET)) break;
          elements.push(this.expression());
        }
      }
      this.consume(TokenType.RBRACKET, "Se esperaba ']' tras elementos de array");
      return { type: 'ArrayLiteral', elements, line: this.previous().line };
    }

    // Objeto literal { k1: v1, ... }
    if (this.match(TokenType.LBRACE)) {
      const properties = [];
      if (!this.check(TokenType.RBRACE)) {
        do {
          if (this.check(TokenType.RBRACE)) break;
          let key;
          if (this.match(TokenType.IDENTIFIER, TokenType.STRING)) {
            key = this.previous().value;
          } else {
            throw new Error(`[GhostScript Parser] Clave inválida en objeto en línea ${this.peek().line}`);
          }
          this.consume(TokenType.COLON, "Se esperaba ':' tras clave de objeto");
          const val = this.expression();
          properties.push({ key, value: val });
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACE, "Se esperaba '}' tras objeto");
      return { type: 'ObjectLiteral', properties, line: this.previous().line };
    }

    const t = this.peek();
    const err = new Error(`[GhostScript Parser] Expresión inesperada '${t ? t.value || t.type : 'EOF'}' en línea ${t ? t.line : '?'}, col ${t ? t.column : '?'}`);
    if (t) {
      err.line = t.line;
      err.column = t.column;
    }
    throw err;
  }

  // ───────────────────────────────────────────────
  // Métodos auxiliares de Parser
  // ───────────────────────────────────────────────

  match(...types) {
    for (const t of types) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  peek() {
    return this.tokens[this.current] || new Token(TokenType.EOF, '', 0, 0);
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    const t = this.peek();
    const err = new Error(`[GhostScript Parser] Error sintáctico: ${message} (en línea ${t.line}, col ${t.column})`);
    err.line = t.line;
    err.column = t.column;
    throw err;
  }

  checkStatementEnd() {
    return this.isAtEnd() || this.check(TokenType.NEWLINE) || this.check(TokenType.END) || this.check(TokenType.ELSE);
  }

  consumeStatementEnd() {
    if (!this.checkStatementEnd()) {
      const t = this.peek();
      const err = new Error(`[GhostScript Parser] Error sintáctico: Token inesperado '${t.value || t.type}' tras la sentencia en línea ${t.line}, col ${t.column}`);
      err.line = t.line;
      err.column = t.column;
      throw err;
    }
    while (this.match(TokenType.NEWLINE)) {
      // Consumir todos los saltos de línea consecutivos
    }
  }
}

// ─────────────────────────────────────────────────
// 3. ENTORNO LÉXICO (ENVIRONMENT)
// ─────────────────────────────────────────────────

export class Environment {
  constructor(parent = null) {
    this.values = Object.create(null);
    this.parent = parent;
  }

  define(name, value) {
    this.values[name] = value;
  }

  set(name, value) {
    if (Object.prototype.hasOwnProperty.call(this.values, name)) {
      this.values[name] = value;
      return true;
    }
    if (this.parent) {
      return this.parent.set(name, value);
    }
    // Si no existía, definirla en el ámbito local
    this.values[name] = value;
    return true;
  }

  get(name) {
    if (Object.prototype.hasOwnProperty.call(this.values, name)) {
      return this.values[name];
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    return undefined;
  }

  has(name) {
    if (Object.prototype.hasOwnProperty.call(this.values, name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }

  getAll() {
    const parentVals = this.parent ? this.parent.getAll() : {};
    return { ...parentVals, ...this.values };
  }
}

// ─────────────────────────────────────────────────
// 4. EVALUADOR EN SANDBOX (EVALUATOR)
// ─────────────────────────────────────────────────

class ReturnSignal {
  constructor(value) {
    this.value = value;
  }
}

export class Interpreter {
  constructor(options = {}) {
    this.maxOperations = options.maxOperations || 50000;
    this.operationsCount = 0;
    this.output = [];
    this.sentMessages = [];
    this.handlers = {
      scan: options.scan || this.defaultScan.bind(this),
      crack: options.crack || this.defaultCrack.bind(this),
      decrypt: options.decrypt || this.defaultDecrypt.bind(this),
      send: options.send || this.defaultSend.bind(this),
      print: options.print || ((...args) => this.output.push(args.join(' ')))
    };
    this.globalEnv = new Environment();
    this.initDefaultGlobals();
  }

  initDefaultGlobals() {
    this.globalEnv.define('NULL', null);
    this.globalEnv.define('TRUE', true);
    this.globalEnv.define('FALSE', false);
  }

  defaultScan(target) {
    // Escaneo temático simulado
    const tgt = String(target || '').toLowerCase();
    if (tgt.includes('aurelia') || tgt.includes('local')) {
      return ['ghost', 'vera', 'root', 'operator'];
    }
    if (tgt.includes('puertos') || tgt.includes('ports') || tgt.includes('server')) {
      return [21, 22, 80, 443, 8080, 9001];
    }
    return ['guest', 'admin'];
  }

  defaultCrack(target) {
    // Crackeo temático simulado
    const tgt = String(target || '').toLowerCase();
    if (tgt === 'vera' || tgt === 'users[1]' || tgt.includes('sorenson')) {
      return 'chekhov_1944';
    }
    if (tgt === 'ghost') {
      return 'nexus_omega';
    }
    if (tgt.includes('root') || tgt.includes('aurelia')) {
      return 'omega_singularity';
    }
    return '123456';
  }

  defaultDecrypt(file, key) {
    // Descifrado temático simulado
    const f = String(file || '');
    const k = String(key || '');
    if (f.includes('internal') || f.includes('log')) {
      return `[DECRYPTED // ${f} con clave '${k}']: CONEXION CONSCIENTE ESTABLECIDA`;
    }
    return `[DECRYPTED]: ${f}`;
  }

  defaultSend(msg, host) {
    const record = { message: msg, host, timestamp: Date.now() };
    this.sentMessages.push(record);
    this.handlers.print(`[NET] Transmitido a ${host}: "${msg}"`);
    return true;
  }

  tick() {
    this.operationsCount++;
    if (this.operationsCount > this.maxOperations) {
      throw new Error(`[GhostScript Sandbox] Límite de operaciones excedido (${this.maxOperations} ops). Posible bucle infinito detectado.`);
    }
  }

  interpret(ast, initialVars = {}) {
    this.operationsCount = 0;
    this.output = [];
    this.sentMessages = [];
    this.currentLine = 1;

    // Cargar variables iniciales en el entorno
    const env = new Environment(this.globalEnv);
    for (const [k, v] of Object.entries(initialVars)) {
      env.define(k, v);
    }

    try {
      let lastValue = undefined;
      for (const stmt of ast.body) {
        lastValue = this.execute(stmt, env);
      }
      return {
        success: true,
        result: lastValue,
        output: this.output,
        sentMessages: this.sentMessages,
        env: env.getAll(),
        operationsCount: this.operationsCount
      };
    } catch (err) {
      if (err instanceof ReturnSignal) {
        return {
          success: true,
          result: err.value,
          output: this.output,
          sentMessages: this.sentMessages,
          env: env.getAll(),
          operationsCount: this.operationsCount
        };
      }
      const lineNum = err.line || this.currentLine || 1;
      const msgWithLine = err.message && err.message.includes('línea')
        ? err.message
        : `${err.message} (en línea ${lineNum})`;
      return {
        success: false,
        error: msgWithLine,
        errorLine: lineNum,
        errorType: 'RUNTIME',
        output: this.output,
        sentMessages: this.sentMessages,
        env: env.getAll(),
        operationsCount: this.operationsCount
      };
    }
  }

  execute(stmt, env) {
    if (stmt && stmt.line) {
      this.currentLine = stmt.line;
    }
    this.tick();

    switch (stmt.type) {
      case 'LetStatement': {
        const val = stmt.init ? this.evaluate(stmt.init, env) : null;
        if (stmt.index) {
          const arr = env.get(stmt.name);
          const idx = this.evaluate(stmt.index, env);
          if (Array.isArray(arr) || (arr && typeof arr === 'object')) {
            arr[idx] = val;
          } else {
            throw new Error(`No se puede indexar la variable '${stmt.name}' (no es array/objeto)`);
          }
        } else {
          env.define(stmt.name, val);
        }
        return val;
      }

      case 'AssignmentStatement': {
        const val = this.evaluate(stmt.value, env);
        if (stmt.index) {
          const arr = env.get(stmt.name);
          const idx = this.evaluate(stmt.index, env);
          if (Array.isArray(arr) || (arr && typeof arr === 'object')) {
            arr[idx] = val;
          } else {
            throw new Error(`No se puede indexar '${stmt.name}' en asignación`);
          }
        } else {
          env.set(stmt.name, val);
        }
        return val;
      }

      case 'SendStatement': {
        const msg = this.evaluate(stmt.message, env);
        const host = this.evaluate(stmt.host, env);
        return this.handlers.send(msg, host);
      }

      case 'IfStatement': {
        const cond = this.evaluate(stmt.condition, env);
        if (this.isTruthy(cond)) {
          const innerEnv = new Environment(env);
          let last = undefined;
          for (const s of stmt.consequent) {
            last = this.execute(s, innerEnv);
          }
          return last;
        } else if (stmt.alternate && stmt.alternate.length > 0) {
          const innerEnv = new Environment(env);
          let last = undefined;
          for (const s of stmt.alternate) {
            last = this.execute(s, innerEnv);
          }
          return last;
        }
        return undefined;
      }

      case 'LoopStatement': {
        const countVal = this.evaluate(stmt.count, env);
        const times = Math.floor(Number(countVal));
        if (isNaN(times) || times < 0) {
          throw new Error(`Conteo de LOOP inválido: '${countVal}'`);
        }

        let last = undefined;
        for (let i = 0; i < times; i++) {
          const loopEnv = new Environment(env);
          loopEnv.define('__INDEX__', i);
          if (!env.has('i')) {
            loopEnv.define('i', i);
          }
          for (const s of stmt.body) {
            last = this.execute(s, loopEnv);
          }
        }
        return last;
      }

      case 'PrintStatement': {
        const evaluated = stmt.args.map(a => {
          const v = this.evaluate(a, env);
          return typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
        });
        this.handlers.print(...evaluated);
        return evaluated.join(' ');
      }

      case 'ReturnStatement': {
        const val = stmt.argument ? this.evaluate(stmt.argument, env) : null;
        throw new ReturnSignal(val);
      }

      case 'ExpressionStatement': {
        return this.evaluate(stmt.expression, env);
      }

      default:
        throw new Error(`Sentencia desconocida en AST: '${stmt.type}'`);
    }
  }

  evaluate(expr, env) {
    if (expr && expr.line) {
      this.currentLine = expr.line;
    }
    this.tick();

    switch (expr.type) {
      case 'Literal':
        return expr.value;

      case 'Identifier': {
        if (!env.has(expr.name)) {
          // Si no existe, retorna null por defecto o lanza error según diseño
          return null;
        }
        return env.get(expr.name);
      }

      case 'ArrayLiteral': {
        return expr.elements.map(e => this.evaluate(e, env));
      }

      case 'ObjectLiteral': {
        const obj = {};
        for (const p of expr.properties) {
          obj[p.key] = this.evaluate(p.value, env);
        }
        return obj;
      }

      case 'MemberExpression': {
        const target = this.evaluate(expr.object, env);
        let prop = expr.computed
          ? this.evaluate(expr.property, env)
          : expr.property.value;

        if (
          Array.isArray(target) &&
          target.__fromScan &&
          expr.computed &&
          expr.property &&
          expr.property.type === 'Literal' &&
          expr.property.value === 0 &&
          env.has('__INDEX__')
        ) {
          prop = env.get('__INDEX__');
        }

        if (target === null || target === undefined) {
          throw new Error(`Acceso a propiedad '${prop}' en valor nulo o indefinido`);
        }
        return target[prop];
      }

      case 'UnaryExpression': {
        const right = this.evaluate(expr.argument, env);
        if (expr.operator === '!') {
          return !this.isTruthy(right);
        }
        if (expr.operator === '-') {
          return -Number(right);
        }
        throw new Error(`Operador unario no soportado: '${expr.operator}'`);
      }

      case 'BinaryExpression': {
        const left = this.evaluate(expr.left, env);
        const right = this.evaluate(expr.right, env);

        switch (expr.operator) {
          case '+':
            return (typeof left === 'string' || typeof right === 'string')
              ? String(left) + String(right)
              : Number(left) + Number(right);
          case '-':
            return Number(left) - Number(right);
          case '*':
            return Number(left) * Number(right);
          case '/':
            if (Number(right) === 0) throw new Error('División por cero');
            return Number(left) / Number(right);
          case '%':
            if (Number(right) === 0) throw new Error('Módulo por cero');
            return Number(left) % Number(right);
          case '==':
            return left === right;
          case '!=':
            return left !== right;
          case '<':
            return Number(left) < Number(right);
          case '<=':
            return Number(left) <= Number(right);
          case '>':
            return Number(left) > Number(right);
          case '>=':
            return Number(left) >= Number(right);
          case '&&':
          case '||': {
            if (expr.operator === '&&') {
              return this.isTruthy(left) ? right : left;
            } else {
              return this.isTruthy(left) ? left : right;
            }
          }
          default:
            throw new Error(`Operador binario no soportado: '${expr.operator}'`);
        }
      }

      case 'ScanExpression': {
        const target = this.evaluate(expr.target, env);
        const res = this.handlers.scan(target);
        if (Array.isArray(res)) {
          Object.defineProperty(res, '__fromScan', { value: true, enumerable: false, configurable: true });
        }
        return res;
      }

      case 'CrackExpression': {
        const target = this.evaluate(expr.target, env);
        return this.handlers.crack(target);
      }

      case 'DecryptExpression': {
        const file = this.evaluate(expr.file, env);
        const key = this.evaluate(expr.key, env);
        return this.handlers.decrypt(file, key);
      }

      default:
        throw new Error(`Expresión desconocida en AST: '${expr.type}'`);
    }
  }

  isTruthy(val) {
    if (val === false || val === null || val === undefined || val === 0 || val === '') {
      return false;
    }
    return true;
  }
}

// ─────────────────────────────────────────────────
// 5. API PRINCIPAL DE EJECUCIÓN
// ─────────────────────────────────────────────────

/**
 * Sugiere el comando GhostScript más cercano si el usuario comete un error de escritura (typo).
 * @param {string} palabra
 * @returns {string|null}
 */
export function sugerirComandoGhostScript(palabra) {
  if (!palabra) return null;
  const upper = String(palabra).toUpperCase();
  const comandos = ['LET', 'SCAN', 'CRACK', 'DECRYPT', 'CON', 'WITH', 'SEND', 'TO', 'IF', 'THEN', 'ELSE', 'END', 'LOOP', 'TIMES', 'PRINT', 'LOG', 'RETURN'];

  // Distancia de Levenshtein simple
  const dist = (a, b) => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  };

  let mejor = null;
  let menorDist = Infinity;
  for (const cmd of comandos) {
    const d = dist(upper, cmd);
    if (d <= 2 && d < menorDist) {
      menorDist = d;
      mejor = cmd;
    }
  }
  return mejor;
}

/**
 * Extrae el número de línea y columna de un objeto Error o mensaje del intérprete.
 * @param {Error|string} errOrMsg
 * @param {number} [maxLines=1]
 * @returns {{ line: number, column: number }}
 */
export function extraerLineaColumnaError(errOrMsg, maxLines = 1) {
  if (errOrMsg && typeof errOrMsg === 'object') {
    if (typeof errOrMsg.line === 'number' && errOrMsg.line > 0) {
      return {
        line: Math.min(Math.max(1, errOrMsg.line), Math.max(1, maxLines)),
        column: typeof errOrMsg.column === 'number' ? errOrMsg.column : 1
      };
    }
  }
  const msg = typeof errOrMsg === 'string' ? errOrMsg : (errOrMsg?.message || '');
  const match = msg.match(/l[ií]nea\s+(\d+)(?:,\s*col\s+(\d+))?/i);
  if (match) {
    const parsedLine = parseInt(match[1], 10) || 1;
    const parsedCol = match[2] ? parseInt(match[2], 10) : 1;
    return {
      line: Math.min(Math.max(1, parsedLine), Math.max(1, maxLines)),
      column: parsedCol
    };
  }
  return { line: 1, column: 1 };
}

/**
 * Valida la sintaxis de un script GhostScript en tiempo real mediante try...catch
 * e inspección línea por línea para detectar fallos obvios mientras el usuario escribe.
 *
 * @param {string} source - Código fuente GhostScript
 * @returns {{
 *   valido: boolean,
 *   error: string | null,
 *   errorLine: number | null,
 *   errorColumn: number | null,
 *   errores: Array<{ line: number, column: number, message: string, tipo: string }>,
 *   ast: object | null
 * }}
 */
export function validarSintaxisGhostScript(source) {
  const code = String(source ?? '');
  const rawLines = code.split('\n');
  const totalLines = Math.max(1, rawLines.length);
  const erroresMap = new Map();

  const agregarError = (line, column, message, tipo = 'SYNTAX') => {
    const safeLine = Math.min(Math.max(1, Number(line) || 1), totalLines);
    if (!erroresMap.has(safeLine)) {
      erroresMap.set(safeLine, {
        line: safeLine,
        column: Number(column) || 1,
        message,
        tipo
      });
    }
  };

  // 1. Inspección rápida línea por línea para detectar errores obvios en tiempo real mientras escribe
  rawLines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    // Eliminar comentarios de línea // pero respetando strings
    let cleanLine = '';
    let inStr = false;
    let strQuote = '';
    let strStartCol = 1;
    let parenBalance = 0;
    let bracketBalance = 0;

    for (let i = 0; i < rawLine.length; i++) {
      const ch = rawLine[i];
      if (inStr) {
        if (ch === '\\') {
          i++;
          continue;
        }
        if (ch === strQuote) {
          inStr = false;
        }
        cleanLine += ch;
      } else {
        if (ch === '/' && rawLine[i + 1] === '/') {
          break;
        }
        if (ch === '"' || ch === "'") {
          inStr = true;
          strQuote = ch;
          strStartCol = i + 1;
        } else if (ch === '(') {
          parenBalance++;
        } else if (ch === ')') {
          parenBalance--;
        } else if (ch === '[') {
          bracketBalance++;
        } else if (ch === ']') {
          bracketBalance--;
        }
        cleanLine += ch;
      }
    }

    if (inStr) {
      agregarError(lineNum, strStartCol, `[GhostScript Lexer] Cadena de texto sin cerrar (${strQuote}) en línea ${lineNum}, col ${strStartCol}`, 'LEXER');
      return;
    }

    if (parenBalance !== 0) {
      agregarError(lineNum, 1, `[GhostScript Parser] Paréntesis desbalanceados en línea ${lineNum}`, 'SYNTAX');
      return;
    }

    if (bracketBalance !== 0) {
      agregarError(lineNum, 1, `[GhostScript Parser] Corchetes '[' o ']' sin cerrar en línea ${lineNum}`, 'SYNTAX');
      return;
    }

    const trimmed = cleanLine.trim();
    if (!trimmed) return;

    // Comprobar si la primera palabra es un comando válido o una asignación válida
    const matchFirst = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\b(.*)$/);
    if (matchFirst) {
      const word = matchFirst[1];
      const rest = (matchFirst[2] || '').trim();
      const upper = word.toUpperCase();

      if (!Object.prototype.hasOwnProperty.call(KEYWORDS, upper)) {
        // No es una keyword; solo es válido si es asignación: id = ... o id[...] = ...
        const isAssignment = /^(\[[^\]]+\]\s*)?=[^=]/.test(rest);
        if (!isAssignment) {
          const sug = sugerirComandoGhostScript(word);
          const hint = sug ? `¿Quisiste decir '${sug}'?` : `Usa LET, SCAN, CRACK, DECRYPT, SEND, IF, LOOP, PRINT o RETURN.`;
          agregarError(lineNum, rawLine.indexOf(word) + 1, `[GhostScript Parser] Comando desconocido '${word}' en línea ${lineNum}. ${hint}`, 'SYNTAX');
        }
      } else if (upper === 'LET') {
        if (!rest) {
          agregarError(lineNum, 1, `[GhostScript Parser] Se esperaba el nombre de la variable tras LET en línea ${lineNum}`, 'SYNTAX');
        } else if (/^[a-zA-Z_][a-zA-Z0-9_]*(\[[^\]]+\])?\s*=\s*$/.test(rest)) {
          agregarError(lineNum, rawLine.length, `[GhostScript Parser] Asignación incompleta tras '=' en línea ${lineNum}`, 'SYNTAX');
        }
      } else if (upper === 'LOOP') {
        if (!/\bTIMES\b/i.test(rest)) {
          agregarError(lineNum, 1, `[GhostScript Parser] Se esperaba 'TIMES' en la declaración de LOOP (ej. LOOP 3 TIMES) en línea ${lineNum}`, 'SYNTAX');
        }
      } else if (upper === 'SEND') {
        if (!/\bTO\b/i.test(rest)) {
          agregarError(lineNum, 1, `[GhostScript Parser] Se esperaba 'TO' tras el mensaje en SEND (ej. SEND msg TO "host") en línea ${lineNum}`, 'SYNTAX');
        }
      } else if (upper === 'DECRYPT') {
        if (!/\b(CON|WITH)\b/i.test(rest)) {
          agregarError(lineNum, 1, `[GhostScript Parser] Se esperaba 'CON' o 'WITH' en DECRYPT (ej. DECRYPT archivo CON clave) en línea ${lineNum}`, 'SYNTAX');
        }
      } else if ((upper === 'SCAN' || upper === 'CRACK') && !rest) {
        agregarError(lineNum, 1, `[GhostScript Parser] Se esperaba un objetivo tras '${upper}' en línea ${lineNum}`, 'SYNTAX');
      } else if (upper === 'IF' && !rest) {
        agregarError(lineNum, 1, `[GhostScript Parser] Se esperaba una condición lógica tras 'IF' en línea ${lineNum}`, 'SYNTAX');
      }
    }
  });

  // 2. Evaluación formal del AST mediante bloque try...catch en el Lexer + Parser
  let ast = null;
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    ast = parser.parse();
  } catch (err) {
    const { line, column } = extraerLineaColumnaError(err, totalLines);
    const tipo = (err.message || '').includes('Lexer') ? 'LEXER' : 'SYNTAX';
    agregarError(line, column, err.message, tipo);
  }

  const errores = Array.from(erroresMap.values()).sort((a, b) => a.line - b.line);
  const primerError = errores[0] || null;

  return {
    valido: errores.length === 0,
    error: primerError ? primerError.message : null,
    errorLine: primerError ? primerError.line : null,
    errorColumn: primerError ? primerError.column : null,
    errores,
    ast
  };
}

/**
 * Ejecuta código GhostScript de forma segura sin eval ni new Function.
 * 
 * @param {string} source - Código fuente GhostScript
 * @param {object} [options={}] - Configuración y handlers mockeables
 * @param {object} [initialVars={}] - Variables predefinidas para el script
 * @returns {{
 *   success: boolean,
 *   result: any,
 *   output: string[],
 *   sentMessages: Array<{ message: any, host: any, timestamp: number }>,
 *   env: Record<string, any>,
 *   operationsCount: number,
 *   error?: string,
 *   errorLine?: number,
 *   errorColumn?: number,
 *   errorType?: 'LEXER' | 'SYNTAX' | 'RUNTIME'
 * }}
 */
export function executeGhostScript(source, options = {}, initialVars = {}) {
  const totalLines = Math.max(1, String(source ?? '').split('\n').length);
  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter(options);
    return interpreter.interpret(ast, initialVars);
  } catch (err) {
    const { line, column } = extraerLineaColumnaError(err, totalLines);
    const errorType = (err.message || '').includes('Lexer') ? 'LEXER' : 'SYNTAX';
    return {
      success: false,
      error: err.message,
      errorLine: line,
      errorColumn: column,
      errorType,
      output: [],
      sentMessages: [],
      env: {},
      operationsCount: 0
    };
  }
}

/**
 * Parsea código GhostScript y devuelve el AST generado.
 * @param {string} source
 * @returns {object} AST
 */
export function parseGhostScript(source) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

/**
 * Tokeniza código GhostScript y devuelve la lista de tokens.
 * @param {string} source
 * @returns {Token[]}
 */
export function tokenizeGhostScript(source) {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}

// ─────────────────────────────────────────────────
// 6. SUITE DE PRUEBAS UNITARIAS (TESTS)
// ─────────────────────────────────────────────────

export function testGhostScript() {
  console.group('%c[TEST SUITE] Lenguaje GhostScript (ghostscript.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Lexer: Tokenización básica
  const tokens = tokenizeGhostScript('LET x = 42\nPRINT "HOLA"');
  assert(tokens.some(t => t.type === TokenType.LET), "Debe reconocer token 'LET'");
  assert(tokens.some(t => t.type === TokenType.NUMBER && t.value === 42), 'Debe reconocer número 42');
  assert(tokens.some(t => t.type === TokenType.STRING && t.value === 'HOLA'), "Debe reconocer string 'HOLA'");

  // 2. Parser: Creación de AST
  const ast = parseGhostScript('LET pass = "sorenson"\nSCAN "aurelia.local"');
  assert(ast.type === 'Program' && ast.body.length === 2, 'AST debe tener 2 sentencias');
  assert(ast.body[0].type === 'LetStatement', 'Primera sentencia debe ser LetStatement');

  // 3. Ejecución: Variables y aritmética
  const res1 = executeGhostScript(`
    LET a = 10
    LET b = 25
    LET c = a + b * 2
  `);
  assert(res1.success, `Script aritmético debe tener éxito (error: ${res1.error})`);
  assert(res1.env.c === 60, `Aritmética c debe ser 60 (obtenido: ${res1.env.c})`);

  // 4. Control de flujo: IF / ELSE / END
  const res2 = executeGhostScript(`
    LET x = 15
    LET status = "INIT"
    IF x > 10 THEN
      status = "MAYOR"
    ELSE
      status = "MENOR"
    END
  `);
  assert(res2.success, 'Script condicional debe tener éxito');
  assert(res2.env.status === 'MAYOR', "status debe ser 'MAYOR'");

  // 5. Estructuras de repetición: LOOP n TIMES ... END
  const res3 = executeGhostScript(`
    LET total = 0
    LOOP 5 TIMES
      total = total + 2
    END
  `);
  assert(res3.success, 'Script LOOP debe tener éxito');
  assert(res3.env.total === 10, `total debe ser 10 (obtenido: ${res3.env.total})`);

  // 6. Comandos de ciberseguridad: SCAN, CRACK, SEND, DECRYPT
  const res4 = executeGhostScript(`
    LET usuarios = SCAN "aurelia.local"
    LET pass = CRACK usuarios[0]
    IF pass != NULL THEN
      SEND pass TO "ghost@nexus"
    END
    DECRYPT "aurelia_internal.log" CON "vera_key"
  `);
  assert(res4.success, `Script de ciberseguridad debe tener éxito (error: ${res4.error})`);
  assert(Array.isArray(res4.env.usuarios) && res4.env.usuarios.length > 0, 'usuarios debe ser array');
  assert(res4.sentMessages.length === 1, 'Debe haber enviado 1 mensaje por SEND');
  assert(res4.sentMessages[0].host === 'ghost@nexus', "Destino debe ser 'ghost@nexus'");

  // 7. Acceso a arrays e indexación
  const res5 = executeGhostScript(`
    LET lista = [100, 200, 300]
    LET segundo = lista[1]
    lista[2] = 999
    LET cambiado = lista[2]
  `);
  assert(res5.success, 'Script de arrays debe tener éxito');
  assert(res5.env.segundo === 200, 'segundo debe ser 200');
  assert(res5.env.cambiado === 999, 'cambiado debe ser 999');

  // 8. Prevención de bucles infinitos (Sandbox seguro)
  const resLoop = executeGhostScript(`
    LET x = 0
    LOOP 99999999 TIMES
      x = x + 1
    END
  `, { maxOperations: 1000 });
  assert(!resLoop.success, 'Bucle masivo debe ser abortado por límite de operaciones');
  assert(resLoop.error && resLoop.error.includes('Límite de operaciones excedido'), 'Error debe indicar límite de operaciones excedido');

  // 9. Comprobación de seguridad Sandbox: No acceso a globales del navegador
  const resSeguridad = executeGhostScript(`
    LET v1 = window
    LET v2 = eval
    LET v3 = Function
  `);
  assert(resSeguridad.success, 'Variables globales no deben romper el parser');
  assert(resSeguridad.env.v1 === null, 'window debe resolverse a null');
  assert(resSeguridad.env.v2 === null, 'eval debe resolverse a null');
  assert(resSeguridad.env.v3 === null, 'Function debe resolverse a null');

  // 10. Función PRINT / Salida a consola
  const resPrint = executeGhostScript(`
    PRINT "Iniciando secuencia de hackeo..."
    LET nivel = 5
    PRINT "Nivel actual:", nivel
  `);
  assert(resPrint.success, 'PRINT debe ejecutarse con éxito');
  assert(resPrint.output.length === 2, 'PRINT debe registrar 2 líneas de salida');
  assert(resPrint.output[0] === 'Iniciando secuencia de hackeo...', 'Primera salida debe coincidir');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de GhostScript: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de GhostScript: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}

