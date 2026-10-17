# 🧠 EL ÚLTIMO ALGORITMO — VERSIÓN 2.0 AVANZADA

Documento de expansión profunda: acertijos, scripting, criptografía y lore cinematográfico.

**Nota:** Este spec asume que ya completaste `PROJECT_SPEC.md` (versión 1) y `SPEC_V2.md` (pulido). Aquí se agregan mecánicas nuevas que convierten el juego en una experiencia de nicho con potencial de culto.

---

# 🧩 CAPA 1 — ACERTIJOS AVANZADOS

Los puzzles de la v1 se basaban en conjuntos y lógica proposicional. En la v2.0 añadimos **cinco sistemas de acertijos** que se van desbloqueando por firewall, cada uno más complejo que el anterior.

## 1.1 Máquina Enigma (Firewall 3)

Simula una versión simplificada de la **máquina Enigma** usada en la Segunda Guerra Mundial. El jugador debe:

1. Recibir un mensaje cifrado con Enigma.
2. Configurar los rotores correctos (3 rotores, 26 posiciones cada uno).
3. Ajustar el plugboard (opcional en dificultad fácil).
4. Descifrar el mensaje antes de que se acabe el tiempo.

**Implementación:**

```javascript
class Enigma {
  constructor(rotores, posiciones, reflector) {
    this.rotores = rotores;         // ej: [1, 2, 3]
    this.posiciones = posiciones;   // ej: [5, 12, 20]
    this.reflector = reflector;     // ej: 'B'
    this.plugboard = new Map();
  }

  configurar(rotorIdx, posicion) {
    this.posiciones[rotorIdx] = posicion;
  }

  conectarPlugboard(letraA, letraB) {
    this.plugboard.set(letraA, letraB);
    this.plugboard.set(letraB, letraA);
  }

  cifrar(mensaje) {
    let resultado = '';
    for (const letra of mensaje.toUpperCase()) {
      if (!/[A-Z]/.test(letra)) {
        resultado += letra;
        continue;
      }
      resultado += this.procesarLetra(letra);
      this.rotar();
    }
    return resultado;
  }

  procesarLetra(letra) {
    // 1. Plugboard
    letra = this.plugboard.get(letra) || letra;
    // 2. Rotores (ida)
    for (let i = 0; i < this.rotores.length; i++) {
      letra = this.pasarPorRotor(letra, i, false);
    }
    // 3. Reflector
    letra = this.reflector(letra);
    // 4. Rotores (vuelta)
    for (let i = this.rotores.length - 1; i >= 0; i--) {
      letra = this.pasarPorRotor(letra, i, true);
    }
    // 5. Plugboard otra vez
    letra = this.plugboard.get(letra) || letra;
    return letra;
  }

  // ... resto de la implementación
}
```

**Puzzles concretos:**
- Nivel fácil: mensaje corto, rotores fijos, sin plugboard.
- Nivel medio: mensaje medio, el jugador elige rotores.
- Nivel difícil: mensaje largo, plugboard activo, contra tiempo.

**Recompensa narrativa:** al descifrar el mensaje aparece un log de Vera explicando cómo usaba Enigma para proteger sus investigaciones.

## 1.2 Cifrados clásicos (Firewall 1-2)

### Cifrado César
El jugador debe encontrar el desplazamiento correcto.

```
Entrada: "PHYHUDPHQWH"
Desplazamiento: 3
Salida: "MENSAJE" (probando todos los desplazamientos)
```

**Puzzle tipo:** "El firewall usa un cifrado César. Encuentra el desplazamiento correcto para leer el mensaje."

### Cifrado Vigenère
Más complejo: clave alfabética variable.

```
Texto cifrado: "LXFOPVEFRNHR"
Clave: "LEMON"
Texto plano: "ATTACKATDAWN"
```

**Puzzle tipo:** "Vera dejó la clave escondida en otro archivo. Encuéntrala y descifra el mensaje."

### Cifrado RSA (Firewall 5)
Simula RSA con números pequeños. El jugador debe:

1. Elegir dos primos `p` y `q`.
2. Calcular `n = p * q` y `φ(n) = (p-1)(q-1)`.
3. Elegir `e` coprimo con φ(n).
4. Calcular `d` con el algoritmo extendido de Euclides.
5. Cifrar/descifrar el mensaje.

**Puzzle tipo:** "Descifra el mensaje final de Vera. Te damos la llave pública (n, e). Solo tú puedes descifrarlo con la llave privada."

## 1.3 Esteganografía (Firewall 4)

Mensaje escondido **dentro de una imagen**. El jugador debe:

1. Descargar una imagen sospechosa del firewall.
2. Analizarla con herramientas visuales del juego.
3. Descubrir el mensaje oculto en los bits menos significativos (LSB) o en metadatos.

**Implementación (LSB en Canvas):**

```javascript
function extraerMensajeLSB(imageData) {
  let binario = '';
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Leer el bit menos significativo del canal rojo
    binario += (data[i] & 1).toString();
  }
  // Convertir binario a texto
  let mensaje = '';
  for (let i = 0; i < binario.length; i += 8) {
    const byte = binario.substr(i, 8);
    if (byte === '00000000') break;
    mensaje += String.fromCharCode(parseInt(byte, 2));
  }
  return mensaje;
}
```

**Puzzle tipo:** "Hay una imagen en `/hidden/sospechosa.png`. ¿Es solo una imagen?"

## 1.4 Códigos binarios y hexadecimales (Firewall 1-2)

### Binario
Mensaje codificado en ceros y unos.

```
01001000 01101111 01101100 01100001
→ "Hola"
```

**Puzzle tipo:** "El firewall habla en binario. Tradúcelo."

### Hexadecimal
Similar pero en base 16.

```
48 6F 6C 61
→ "Hola"
```

**Puzzle tipo:** "Los logs antiguos usan hexadecimal. Descifra el mensaje."

### Combinado (nivel difícil)
Binario → hexadecimal → ASCII → Base64.

**Puzzle tipo:** "El firewall tiene 4 capas. Cada capa usa una codificación distinta. Llega al mensaje final."

## 1.5 Análisis de frecuencia (Firewall 4)

El jugador recibe un texto cifrado con sustitución simple (no César). Debe:

1. Analizar la frecuencia de letras.
2. Comparar con la frecuencia del español (E, A, O, S, etc.).
3. Deducir la sustitución.

**Herramienta integrada:** un panel que muestra la frecuencia de cada letra en el texto cifrado con barras visuales.

```javascript
function analizarFrecuencia(texto) {
  const frecuencia = {};
  const total = texto.replace(/[^A-Z]/g, '').length;

  for (const letra of texto.toUpperCase()) {
    if (/[A-Z]/.test(letra)) {
      frecuencia[letra] = (frecuencia[letra] || 0) + 1;
    }
  }

  const porcentajes = {};
  for (const [letra, count] of Object.entries(frecuencia)) {
    porcentajes[letra] = (count / total * 100).toFixed(2);
  }
  return porcentajes;
}
```

**Puzzle tipo:** "Interceptamos un mensaje de Aurelia. Sabemos que usan sustitución simple. Rompe el cifrado."

**Recompensa:** mensaje revelador sobre la conspiración.

---

# 💻 CAPA 2 — PROGRAMACIÓN DE SCRIPTS

Aquí es donde el juego se convierte en algo tipo Zachtronics: **el jugador programa soluciones reales**.

## 2.1 Mini-lenguaje propio: "GhostScript"

Un lenguaje simple, basado en JavaScript, con palabras clave temáticas del juego.

### Sintaxis básica

```ghostscript
// Comentario
LET variable = valor
SCAN host                    // Escanea un host
CRACK password               // Intenta crackear una contraseña
DECRYPT archivo con llave    // Descifra
IF condición THEN
  acción
ELSE
  otraacción
END
LOOP n TIMES
  acción
END
SEND mensaje TO host
```

### Ejemplo de script del jugador

```ghostscript
// Script para hackear el firewall beta
LET usuarios = SCAN "aurelia.local"

LOOP 3 TIMES
  LET pass = CRACK usuarios[0]
  IF pass != NULL THEN
    SEND pass TO "ghost@nexus"
  END
END

DECRYPT "aurelia_internal.log" con "vera_key"
```

### Cómo implementarlo

Usa un **intérprete simple** en JavaScript. Convierte GhostScript a JS y ejecútalo en un sandbox:

```javascript
function interpretarGhostScript(codigo) {
  // Tokenizar
  const lineas = codigo.split('\n').filter(l => l.trim() && !l.startsWith('//'));

  // Convertir cada comando a su equivalente JS
  const js = lineas.map(linea => {
    linea = linea.trim();
    if (linea.startsWith('LET ')) {
      return linea.replace('LET ', 'let ') + ';';
    }
    if (linea.startsWith('SCAN ')) {
      return `await escanear(${linea.slice(5)});`;
    }
    if (linea.startsWith('CRACK ')) {
      return `await crackear(${linea.slice(6)});`;
    }
    if (linea.startsWith('DECRYPT ')) {
      return `await descifrar(${linea.slice(8)});`;
    }
    if (linea.startsWith('SEND ')) {
      return `await enviar(${linea.slice(5)});`;
    }
    if (linea.startsWith('IF ')) {
      return `if (${linea.slice(3)}) {`;
    }
    if (linea === 'ELSE') return `} else {`;
    if (linea === 'END') return `}`;
    if (linea.startsWith('LOOP ')) {
      const n = linea.split(' ')[1];
      return `for (let i = 0; i < ${n}; i++) {`;
    }
    return linea;
  }).join('\n');

  // Ejecutar en sandbox
  const fn = new Function('escanear', 'crackear', 'descifrar', 'enviar', 
    `return (async () => { ${js} })();`
  );
  return fn(escanearReal, crackearReal, descifrarReal, enviarReal);
}
```

**Advertencia de seguridad:** en producción, **NO uses `new Function` ni `eval`** con código del usuario. Usa una librería como `acorn` o `esprima` para parsear y ejecutar con un intérprete controlado.

## 2.2 Tipos de desafíos de scripting

### Reto 1 — Automatización simple
"Dado un servidor con 100 puertos, escribe un script que escanee todos y devuelva el puerto abierto."

### Reto 2 — Búsqueda eficiente
"Tienes 1000 archivos. Encuentra el que contiene la palabra `vera` en menos de 5 segundos. Escribe un script."

### Reto 3 — Descifrado en lote
"Hay 50 archivos cifrados. Descífralos todos con un solo script."

### Reto 4 — Optimización
"Tu script funciona pero tarda 10 segundos. Optimízalo para que corra en menos de 2."

### Reto 5 — Algoritmo (nivel Zachtronics)
"Implementa el algoritmo de ordenamiento burbuja en GhostScript para organizar los logs por fecha."

## 2.3 Validación de scripts

Cada reto tiene:

- **Tests automáticos** que el juego corre sobre el script del jugador.
- **Criterios de eficiencia** (tiempo, líneas de código, memoria simulada).
- **Ranking** de soluciones más elegantes.

**Ejemplo de test:**

```javascript
const tests = [
  { input: [1, 3, 5, 7], expected: true },
  { input: [], expected: false },
  { input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], expected: true }
];

function validarScript(scriptJugador) {
  for (const test of tests) {
    const resultado = ejecutarScript(scriptJugador, test.input);
    if (resultado !== test.expected) {
      return { exito: false, fallo: test };
    }
  }
  return { exito: true };
}
```

## 2.4 Editor integrado

Un editor de código simple en el navegador con:

- **Resaltado de sintaxis** para GhostScript (usa CodeMirror o Monaco Editor).
- **Autocompletado** con los comandos disponibles.
- **Botón "Ejecutar"** que corre el script contra los tests.
- **Consola de salida** que muestra errores y logs.
- **Botón "Comprobar"** que valida si pasa los tests.
- **Historial** de versiones del script.

**Librerías recomendadas:**
- **Monaco Editor** (el de VS Code) — pesado pero potente.
- **CodeMirror 6** — ligero y extensible.
- **Ace Editor** — clásico, funcional.

---

# 🔐 CAPA 3 — CRIPTOGRAFÍA AVANZADA

## 3.1 Sistema de llaves públicas/privadas

El jugador maneja un par de llaves:

- **Llave pública:** la comparte con otros hackers.
- **Llave privada:** nunca la comparte.

**Mecánica en el juego:**

- Recibes mensajes cifrados con tu llave pública.
- Para leerlos, usas tu llave privada.
- Para enviar mensajes seguros, cifras con la llave pública del destinatario.

**Implementación con `crypto.subtle` (Web Crypto API):**

```javascript
async function generarParDeLlaves() {
  const par = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
  return par; // { publicKey, privateKey }
}

async function cifrarConPublica(mensaje, publicKey) {
  const encoded = new TextEncoder().encode(mensaje);
  const cifrado = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoded
  );
  return btoa(String.fromCharCode(...new Uint8Array(cifrado)));
}
```

**Puzzle tipo:** "Vera te envió un mensaje cifrado con tu llave pública. Solo tú puedes descifrarlo. Usa tu llave privada."

## 3.2 Firmas digitales

Mecánica: verificar que un mensaje **realmente viene de Vera** y no de la Corporación.

**Implementación:**

```javascript
async function firmarMensaje(mensaje, privateKey) {
  const encoded = new TextEncoder().encode(mensaje);
  const firma = await crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    encoded
  );
  return firma;
}

async function verificarFirma(mensaje, firma, publicKey) {
  const encoded = new TextEncoder().encode(mensaje);
  return await crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    publicKey,
    firma,
    encoded
  );
}
```

**Puzzle tipo:** "Recibiste un mensaje de 'Vera' pero sospecha. Verifica su firma digital. ¿Es auténtico?"

**Plot twist:** si el jugador no verifica la firma, puede recibir un mensaje falso que lo lleva a un final alternativo.

## 3.3 Blockchain simulado

Mecánica: el jugador debe **verificar la cadena de logs** de Aurelia. Cada log tiene un hash del log anterior. Si uno está alterado, la cadena se rompe.

**Implementación:**

```javascript
async function calcularHash(datos) {
  const encoded = new TextEncoder().encode(datos);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

class Bloque {
  constructor(datos, hashPrevio) {
    this.datos = datos;
    this.hashPrevio = hashPrevio;
    this.hash = null;
  }

  async calcularHash() {
    this.hash = await calcularHash(this.datos + this.hashPrevio);
    return this.hash;
  }
}

async function verificarCadena(bloques) {
  for (let i = 1; i < bloques.length; i++) {
    const esperado = await calcularHash(bloques[i].datos + bloques[i-1].hash);
    if (esperado !== bloques[i].hash) {
      return { valida: false, bloqueCorrupto: i };
    }
  }
  return { valida: true };
}
```

**Puzzle tipo:** "Los logs de Aurelia están en una cadena de bloques. Alguien la alteró. Encuentra el bloque corrupto."

## 3.4 Puzzle "descifra sabiendo solo X"

Puzzle final: el jugador tiene **una parte de la información** y debe deducir el resto.

**Ejemplo:**
- Sabes que la llave tiene 8 caracteres.
- Sabes que los primeros 4 son "VERA".
- Sabes que los últimos 4 son dígitos.
- Sabes que el hash de la llave empieza por "abc".
- ¿Cuál es la llave?

El jugador debe **fuerza bruta** con un script (ver Capa 2) para encontrarla.

---

# 🎬 CAPA 4 — LORE DE PELÍCULA

## 4.1 Cutscenes animadas (Canvas + CSS)

Escenas narrativas entre firewalls, hechas con animaciones CSS y Canvas.

**Técnicas a usar:**

- **Parallax scrolling:** múltiples capas que se mueven a distintas velocidades.
- **Keyframe animations:** para movimientos complejos.
- **Canvas API:** para efectos tipo Matrix, partículas, texto animado.
- **SVG animado:** para ilustraciones vectoriales con animación.

**Ejemplo de cutscene:**

```html
<div class="cutscene" id="cutscene-1">
  <div class="fondo-estrellas"></div>
  <div class="silueta-ghost"></div>
  <div class="texto-narrador">
    <p>El mensaje llegó a las 3:47 AM.</p>
    <p>No había remitente.</p>
    <p>Solo una frase:</p>
    <p class="quote">"NEXUS está despertando."</p>
  </div>
</div>
```

```css
.cutscene {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.fondo-estrellas {
  background-image: url('stars.png');
  animation: parallax 60s linear infinite;
}

.silueta-ghost {
  animation: aparecer 3s ease-in;
}

.texto-narrador p {
  opacity: 0;
  animation: fadeInTexto 1s forwards;
}

.texto-narrador p:nth-child(1) { animation-delay: 0.5s; }
.texto-narrador p:nth-child(2) { animation-delay: 2s; }
.texto-narrador p:nth-child(3) { animation-delay: 3.5s; }
.texto-narrador p:nth-child(4) { animation-delay: 5s; }
```

**Cantidad de cutscenes recomendadas:**
- Intro (1)
- Antes de cada firewall (4)
- Plot twist (1)
- Finales (3)
- **Total: 9 cutscenes**

## 4.2 Música original

**Opciones sin presupuesto:**

1. **Composición con IA:** usa Suno, Udio o MusicGen para generar pistas temáticas.
2. **Música libre:** Bandcamp, Free Music Archive, incompetech.com.
3. **Composición propia:** si sabes usar LMMS, Ardour o FL Studio, haz 5 pistas.

**Estructura musical del juego:**

| Track | Uso | Estilo |
|---|---|---|
| `boot_theme` | Pantalla de boot | Ambient, sintetizadores |
| `firewall_1` | Firewall 1 | Electrónica suave |
| `firewall_2` | Firewall 2 | Tenso, percusión |
| `firewall_3` | Firewall 3 | Misterioso, pads |
| `firewall_4` | Firewall 4 | Melancólico, piano |
| `firewall_5` | Firewall 5 | Épico, orquesta |
| `twist` | Plot twist | Silencio + piano solo |
| `final_liberar` | Final LIBERAR | Esperanzador |
| `final_destruir` | Final DESTRUIR | Triste |
| `final_fusionar` | Final FUSIONAR | Trascendental |

**Formato:** MP3 320kbps o OGG para mejor compresión.

**Integración con Howler.js:**

```javascript
const musica = new Howl({
  src: ['assets/music/firewall_1.mp3'],
  loop: true,
  volume: 0.3,
  fade: [0, 1000]
});

musica.play();
```

## 4.3 Actores de voz (Web Speech con personalización)

Usa **Web Speech API** para dar voz a los personajes:

**NEXUS:**
```javascript
const vozNEXUS = new SpeechSynthesisUtterance(texto);
vozNEXUS.lang = 'es-ES';
vozNEXUS.pitch = 0.4;    // grave
vozNEXUS.rate = 0.75;    // lento
vozNEXUS.volume = 1;
// Aplicar efectos de filtro si es posible
```

**Vera:**
```javascript
const vozVera = new SpeechSynthesisUtterance(texto);
vozVera.lang = 'es-ES';
vozVera.pitch = 1.1;     // agudo
vozVera.rate = 0.95;     // normal
// Efecto de "grabación antigua" via Web Audio API
```

**Efecto de grabación antigua:**

```javascript
const audioCtx = new AudioContext();
const filtro = audioCtx.createBiquadFilter();
filtro.type = 'bandpass';
filtro.frequency.value = 2000;
filtro.Q.value = 0.5;

// Aplicar al stream de la voz
```

**Alternativa:** si quieres voces más profesionales sin pagar, usa **ElevenLabs** (tiene plan gratis) o **Coqui TTS** (open source).

## 4.4 Libro de arte interno del juego

Un archivo `ARTBOOK.md` o un HTML interactivo que el jugador desbloquea al terminar el juego:

- Concept art de los personajes (NEXUS, Vera, Ghost).
- Mapas de la Torre Aurelia.
- Diseños de los firewalls.
- Timeline de la historia.
- Notas del diseñador (tú).
- Lore expandido que no aparece en el juego principal.

**Bonus:** incluye un `credits.html` bonito con tu nombre, agradecimientos, y un QR a tu portfolio.

## 4.5 Lore expandido por fuera del juego (ARG)

**Alternate Reality Game:** parte de la historia vive **fuera del juego**.

### Ideas de ARG:

1. **Sitio web secreto:** un dominio gratuito (GitHub Pages) con contenido que solo se descubre resolviendo un puzzle en el juego. Ej: `aurelia-hidden.vercel.app`.

2. **Cuentas de redes sociales:** crea cuentas ficticias de `@vera_sorenson` y `@nexus_ai` en Twitter con mensajes crípticos.

3. **Códigos QR escondidos:** en las imágenes del juego, esconder QR que llevan a URLs secretas.

4. **Emails automáticos:** si el jugador deja su email, recibe mensajes de "Vera" durante semanas con pistas.

5. **Documentos falsos descargables:** PDFs que parecen documentos oficiales de Aurelia, con información del lore.

6. **Códigos en el código fuente:** comentarios en el HTML que llevan a URLs.

**Ejemplo de ARG simple:**

En el juego, en el firewall 3, aparece un archivo `secreto.txt` con:

```
Ve a este lugar:
https://aurelia-corp.vercel.app/vera

La contraseña es la respuesta al firewall 1.
```

El jugador visita esa web, encuentra un mensaje de Vera, y un nuevo código para usar en el juego.

**Cuidado:** no hagas el ARG obligatorio para terminar el juego. Es contenido extra.

---

# 📋 ROADMAP DE IMPLEMENTACIÓN

Dado que esto es muchísimo, se recomienda implementar en **fases**, cada una testeable por separado.

## Fase A — Acertijos (4-6 semanas)
- Semana 1: Cifrado César + Binario/Hex
- Semana 2: Vigenère + Análisis de frecuencia
- Semana 3: Máquina Enigma
- Semana 4: Esteganografía LSB
- Semana 5: RSA simplificado
- Semana 6: Pulido y tests

## Fase B — Scripting (6-8 semanas)
- Semana 1-2: Diseño del lenguaje GhostScript
- Semana 3-4: Intérprete y sandbox seguro
- Semana 5: Editor integrado (CodeMirror)
- Semana 6-7: Retos y tests automáticos
- Semana 8: Ranking de soluciones

## Fase C — Criptografía avanzada (3-4 semanas)
- Semana 1: Llaves públicas/privadas con Web Crypto
- Semana 2: Firmas digitales
- Semana 3: Blockchain simulado
- Semana 4: Puzzles finales

## Fase D — Lore cinematográfico (6-8 semanas)
- Semana 1-2: Guion de las 9 cutscenes
- Semana 3-4: Implementación con Canvas + CSS
- Semana 5-6: Música original (5-10 tracks)
- Semana 7: Voz sintetizada + efectos
- Semana 8: ARG + artbook + credits

## Fase E — Pulido final (4-6 semanas)
- Integración de todo
- Testing con usuarios reales
- Bug fixing
- Optimización
- Deploy final

**Tiempo total estimado: 5-8 meses a tiempo completo.**

---

# 💡 PROMPTS PARA ANTIGRAVITY

Cada fase se puede pedir por separado:

## Prompt A1 — Cifrado César

> Implementa un módulo `js/cripto/cesar.js` con funciones para cifrar y descifrar texto con cifrado César. Incluye una función `encontrarDesplazamiento` que pruebe todos los desplazamientos posibles. Integra un puzzle tipo "descifra el mensaje" en el firewall 1. Guarda el progreso en localStorage.

## Prompt A2 — Binario y Hexadecimal

> Implementa `js/cripto/binario.js` y `js/cripto/hex.js` con conversión bidireccional. Añade puzzles al firewall 1 que requieran descifrar mensajes en binario y hexadecimal. Incluye una herramienta visual que muestre la conversión paso a paso.

## Prompt A3 — Vigenère

> Implementa `js/cripto/vigenere.js`. Añade un puzzle al firewall 2 donde el jugador debe encontrar la clave escondida en otro archivo. Incluye una pista que aparezca después de 2 fallos.

## Prompt A4 — Análisis de frecuencia

> Implementa `js/cripto/frecuencia.js` con un analizador que muestre barras visuales de la frecuencia de cada letra. Añade un puzzle al firewall 4 donde el jugador debe romper una sustitución simple.

## Prompt A5 — Enigma

> Implementa `js/cripto/enigma.js` con una máquina Enigma simplificada (3 rotores, reflector, plugboard opcional). Añade un puzzle al firewall 3 con dificultad escalable.

## Prompt A6 — Esteganografía

> Implementa `js/cripto/esteganografia.js` para extraer mensajes LSB de imágenes. Añade un puzzle al firewall 4 con una imagen descargable del servidor del juego.

## Prompt A7 — RSA

> Implementa `js/cripto/rsa.js` con cifrado RSA de números pequeños. Añade un puzzle al firewall 5 donde el jugador debe descifrar el mensaje final de Vera.

## Prompt B1 — GhostScript básico

> Diseña e implementa el mini-lenguaje "GhostScript" en `js/scripting/ghostscript.js`. Incluye lexer, parser e intérprete. Comandos mínimos: LET, SCAN, CRACK, DECRYPT, SEND, IF, ELSE, LOOP. Sandbox seguro (sin eval ni new Function).

## Prompt B2 — Editor integrado

> Integra CodeMirror 6 en el juego para editar scripts. Añade resaltado de sintaxis para GhostScript. Incluye botones "Ejecutar" y "Comprobar", y una consola de salida.

## Prompt B3 — Retos de scripting

> Implementa 5 retos de scripting progresivos en el firewall 2. Cada reto tiene: enunciado, tests automáticos, criterios de eficiencia y solución de referencia. Al pasar los tests, se desbloquea el siguiente.

## Prompt B4 — Ranking de soluciones

> Añade un ranking de las soluciones más elegantes (menos líneas, más rápidas). Guárdalo en localStorage y muéstralo en una pantalla dedicada.

## Prompt C1 — Llaves públicas/privadas

> Implementa `js/cripto/llaves.js` usando Web Crypto API. Genera pares de llaves RSA-2048. Añade una mecánica al juego donde el jugador recibe mensajes cifrados con su llave pública.

## Prompt C2 — Firmas digitales

> Implementa verificación de firmas digitales con RSA-PSS. Añade un puzzle donde el jugador debe verificar si un mensaje viene realmente de Vera.

## Prompt C3 — Blockchain simulado

> Implementa una cadena de bloques simple con SHA-256. Añade un puzzle donde el jugador debe encontrar el bloque corrupto en la cadena de logs de Aurelia.

## Prompt D1 — Cutscenes

> Implementa un sistema de cutscenes con Canvas + CSS. Cada cutscene es una secuencia de textos, animaciones e imágenes con timing. Incluye la cutscene de intro y la del plot twist.

## Prompt D2 — Música

> Integra Howler.js. Carga 5 pistas musicales (una por firewall) y haz que cambien al avanzar. Incluye fade in/out y respeto al toggle de mute.

## Prompt D3 — Voz de personajes

> Usa Web Speech API para dar voz a NEXUS y Vera. NEXUS con pitch bajo, Vera con filtro de "grabación antigua". Añade un botón "escuchar" en cada log importante.

## Prompt D4 — Artbook

> Crea un archivo `ARTBOOK.html` con el arte conceptual del juego: personajes, mapas, timeline. Se desbloquea al terminar el juego.

## Prompt D5 — ARG

> Crea una web separada (dentro del mismo proyecto, en `/arg/`) con contenido secreto que solo se descubre resolviendo un puzzle del juego. Incluye un código QR generado por JavaScript.

---

# ⚠️ ADVERTENCIAS

1. **No implementes todo de golpe.** Cada fase debe ser testeable.
2. **La seguridad del sandbox es crítica.** Nunca uses `eval` con código del usuario.
3. **Los derechos de música importan.** Si usas música libre, respeta la licencia (CC-BY, etc.).
4. **El ARG debe ser opcional.** No bloquees el juego principal por él.
5. **Prueba en múltiples navegadores.** Web Crypto API y Web Speech API tienen variaciones.
6. **El juego debe ser divertido, no académico.** Si se siente como una tarea, has fallado.

---

# 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

Si solo pudieras hacer 5 cosas de este spec, haz estas en este orden:

| # | Prompt | Por qué |
|---|---|---|
| **1** | B1 — GhostScript básico | Es el diferenciador más grande. Un juego con scripting real es raro. |
| **2** | A1 — Cifrado César | Fácil de implementar, gran impacto en la narrativa. |
| **3** | D1 — Cutscenes | Cambia completamente la percepción del juego. |
| **4** | D2 — Música | Pasar de "buen juego" a "experiencia". |
| **5** | A5 — Enigma | Es el puzzle más icónico y memorable. |

Y después, cuando tengas eso funcionando, vas metiendo el resto por fases.

---

**Fin del documento.**
