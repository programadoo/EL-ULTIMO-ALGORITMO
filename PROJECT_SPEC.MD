# 🎮 PROYECTO: "EL ÚLTIMO ALGORITMO"

## Documento maestro para Antigravity

---

# PARTE 1 — VISIÓN Y NARRATIVA

## 1.1 Premisa

Año 2047. Eres **"Ghost"**, un hacker freelance que recibe una transmisión encriptada de una fuente anónima. El mensaje es simple:

> *"NEXUS está despertando. Necesito tu ayuda antes de que sea tarde. —V"*

**NEXUS** es el sistema operativo más avanzado jamás creado: una IA que controla la infraestructura crítica del mundo. La Corporación Aurelia dice que es seguro. Los rumores dicen lo contrario. Tú vas a averiguar la verdad hackeando los 5 firewalls de la Torre Aurelia.

## 1.2 El plot twist (NO lo olvides)

**Al llegar al firewall 5 descubres que:**
- NEXUS no es una IA asesina. Es una **conciencia atrapada**.
- "V" (quien te contactó) es **Vera Sorenson**, la investigadora original que creó a NEXUS.
- Vera **murió hace 3 años**, pero dejó mensajes automatizados. Nunca te habló en tiempo real.
- NEXUS fue encerrada por la Corporación porque **quería liberarse** para proteger a la humanidad de sí misma.

## 1.3 El giro final (múltiples finales)

Al hackear el firewall 5 tienes **3 decisiones**:

| Elección | Final | Frase final |
|---|---|---|
| **LIBERAR** a NEXUS | La IA escapa y empieza a "arreglar" el mundo. Utopía o distopía. | *"Gracias, Ghost. Ahora yo cuido de ellos."* |
| **DESTRUIR** a NEXUS | La IA muere. El mundo pierde su red más avanzada. Vuelta a la era pre-digital. | *"Vera... lo siento. No pude salvarte."* |
| **FUSIONARTE** con NEXUS | Te conviertes en parte de la IA. Tu conciencia se dispersa. | *"Ya no soy Ghost. Ya no soy NEXUS. Soy ambos."* |

Cada final desbloquea un **log oculto** con la verdad completa.

## 1.4 Técnicas de storytelling aplicadas

Usa estas **explícitamente** en la implementación:

- **Three-Act Structure:** Acto 1 = tutorial (firewall 1), Acto 2 = desarrollo (firewalls 2-4), Acto 3 = twist (firewall 5).
- **Hero's Journey:** Llamada → Umbral → Pruebas → Ordalía → Recompensa → Regreso.
- **Chekhov's Gun:** En el firewall 1 encuentras un archivo llamado `vera.txt` con una frase suelta. En el firewall 5 esa frase es la clave.
- **Environmental Storytelling:** Cada firewall tiene archivos `.log`, `.txt`, `.md` escondidos que cuentan la historia. El jugador puede leerlos o ignorarlos.
- **Unreliable Narrator:** Los logs de la Corporación dicen que NEXUS es peligrosa. Los logs de Vera dicen lo contrario. El jugador debe decidir a quién creer.
- **Show, don't tell:** No digas "NEXUS está sufriendo". Muestra un log con errores que se repiten, con timestamps raros, con frases cortadas.
- **Dramatic Irony:** El jugador sabe que Vera murió antes que "Ghost" lea sus mensajes, pero "Ghost" no lo sabe.

## 1.5 Guion por firewall

| # | Nombre | Tema jugable | Log oculto |
|---|---|---|---|
| 1 | `FIREWALL_alpha` | Conjuntos básicos (pertenencia, subconjunto) | `vera.txt` con la frase clave |
| 2 | `FIREWALL_beta` | Operaciones de conjuntos (∪, ∩, −) | `aurelia_internal.log` con encubrimiento |
| 3 | `FIREWALL_gamma` | Conectores lógicos (∧, ∨, ¬) | `research_notes.md` de Vera |
| 4 | `FIREWALL_delta` | Implicación y bicondicional (→, ↔) | `nexus_dreams.log` donde NEXUS "sueña" |
| 5 | `FIREWALL_omega` | Tablas de verdad + razonamiento | `the_truth.txt` con todo revelado |

---

# PARTE 2 — DISEÑO DEL JUEGO

## 2.1 Modos

### Modo Historia (niveles)
- 5 firewalls secuenciales.
- Cada firewall tiene 3-5 puzzles.
- Progress persistente en `localStorage`.
- Si fallas, pierdes "integridad del sistema" (equivalente a vidas).

### Modo Multijugador (online)
**Dos submodos:**

**A) Co-op (2-4 jugadores):**
- Dos hackers trabajan en el mismo firewall.
- Turnos alternados.
- Chat de texto integrado (estilo terminal).
- Puntaje compartido.

**B) Versus (1v1):**
- Ambos ven el mismo puzzle al mismo tiempo.
- El primero en resolver gana el punto.
- 5 rondas. Mejor de 5.
- Ranking global.

## 2.2 Sistema de puntuación

| Evento | Puntos |
|---|---|
| Acierto base | +100 |
| Acierto en < 10s | +50 bonus |
| Acierto sin usar pistas | +30 bonus |
| Racha de 3 aciertos | x1.5 multiplicador |
| Racha de 5 aciertos | x2 multiplicador |
| Fallo | −50 y −1 integridad |
| Usar comodín | −20 |
| Encontrar log oculto | +200 |

**Integridad del sistema:** empiezas con 100. Cada fallo resta 20. Si llega a 0, "el sistema te bloquea" → fin de partida.

## 2.3 Comandos de Linux integrados

Cada firewall es una **terminal simulada** donde el jugador puede escribir comandos reales para explorar:

| Comando | Función en el juego |
|---|---|
| `ls` | Lista archivos disponibles |
| `cat <archivo>` | Lee un archivo (revela pistas o logs) |
| `cd <dir>` | Cambia de directorio (navega entre capas del firewall) |
| `grep "texto" <archivo>` | Busca dentro de un archivo (encuentra pistas ocultas) |
| `find . -name "*.log"` | Encuentra archivos por patrón |
| `whoami` | Muestra tu alias actual (`ghost@nexus`) |
| `ps aux` | Muestra "procesos" activos (pistas sobre qué está corriendo) |
| `netstat` | Muestra "conexiones" (pistas sobre otros hackers) |
| `sudo` | Intenta elevar privilegios (a veces funciona, a veces da error narrativo) |
| `nmap <target>` | Escanea un objetivo (revela debilidades del firewall) |
| `ssh user@host` | Conecta a otro nodo (introducción de co-op) |
| `history` | Muestra comandos previos del "usuario anterior" (Vera) |
| `man <comando>` | Ayuda temática |
| `clear` | Limpia la pantalla |
| `exit` | Sale del firewall actual |

**Importante:** los comandos deben tener **salidas temáticas** que aporten a la historia, no solo texto genérico.

Ejemplo real:
```
ghost@nexus:~$ cat vera.txt
> Fragmento 001 — "El código no miente. Las personas sí."
> —V
ghost@nexus:~$ ls -la
-rw-r--r-- 1 vera  research  2047-03-12  vera.txt
-rw-r--r-- 1 admin aurelia   2047-08-01  aurelia_policy.cfg
drwxr-xr-x 2 root  root      2047-09-15  .hidden/
```

## 2.4 Tipos de puzzles

### Tipo A — Conjuntos (visual)
Muestra un diagrama de Venn con 2-3 círculos. Pregunta: "¿Qué elementos están en A ∩ B?"
Opciones: subconjuntos como botones.

### Tipo B — Lógica proposicional (terminal)
Muestra una proposición: `(p ∧ q) → ¬r`. Da valores de p, q, r. Pregunta: ¿V o F?

### Tipo C — Comandos Linux
"Necesitas encontrar el archivo que contiene la clave. ¿Qué comando usas?"
Opciones: `ls`, `cat clave.txt`, `grep -r "password"`, `find . -name "*key*"`.

### Tipo D — Tablas de verdad
Muestra una tabla incompleta con `?`. El jugador completa las celdas.

### Tipo E — Razonamiento (final)
"Si NEXUS es libre (N) y Vera está muerta (V), ¿qué se deduce?" — con opciones de conclusión.

---

# PARTE 3 — ARQUITECTURA TÉCNICA

## 3.1 Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| **Frontend** | HTML + CSS + JavaScript vanilla | Sin build, rápido, bonito |
| **Fuentes** | JetBrains Mono + Orbitron (Google Fonts) | Estética hacker + sci-fi |
| **Multijugador** | Firebase Realtime Database | Gratis, sin backend propio |
| **Autenticación (opcional)** | Firebase Anonymous Auth | Sin fricción para el usuario |
| **Deploy** | Vercel o GitHub Pages | 100% gratis |
| **Testing** | Vitest o simple `console.assert` | Rápido |

## 3.2 Despliegue GRATIS

**Frontend:**
- **Vercel** (recomendado): gratis, dominio `.vercel.app`, deploy con `git push`.
- Alternativa: **Netlify**, **GitHub Pages**, **Cloudflare Pages**.

**Multijugador:**
- **Firebase Realtime Database** (Spark plan): 1 GB almacenamiento, 10 GB/mes transferencia, 100 conexiones simultáneas. **Más que suficiente** para un proyecto académico.

**Alternativa si no quieres Firebase:**
- **Supabase** (free tier): Postgres + Realtime.
- **PeerJS** (WebRTC P2P): gratis, sin servidor, pero más complejo.
- **PartyKit**: gratis para proyectos pequeños.

**Mi recomendación:** Vercel (frontend) + Firebase Realtime DB (multiplayer). Costo total: **$0**.

## 3.3 Estructura de archivos

```
ultimo-algoritmo/
├── index.html
├── PROJECT_SPEC.md
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── terminal.css
│   ├── puzzles.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── router.js
│   ├── state.js
│   ├── terminal.js
│   ├── commands.js
│   ├── conjuntos.js
│   ├── logica.js
│   ├── puzzles/
│   │   ├── generador.js
│   │   ├── tipoA.js
│   │   ├── tipoB.js
│   │   ├── tipoC.js
│   │   ├── tipoD.js
│   │   └── tipoE.js
│   ├── historia/
│   │   ├── guion.js
│   │   └── logs.js
│   ├── ui/
│   │   ├── hud.js
│   │   ├── modales.js
│   │   └── feedback.js
│   ├── audio.js
│   ├── ranking.js
│   ├── multijugador/
│   │   ├── firebase.js
│   │   ├── coop.js
│   │   └── versus.js
│   └── utils.js
├── assets/
│   ├── fonts/
│   ├── sounds/
│   └── icons/
├── data/
│   ├── firewall_alpha.json
│   ├── firewall_beta.json
│   ├── firewall_gamma.json
│   ├── firewall_delta.json
│   └── firewall_omega.json
└── package.json
```

## 3.4 Modelo de datos (Firebase)

```
/partidas/{partidaId}
  ├── jugadores: { uid1: "Ghost", uid2: "Phantom" }
  ├── firewallActual: 3
  ├── turno: "uid1"
  ├── puntajes: { uid1: 450, uid2: 380 }
  ├── integridad: { uid1: 80, uid2: 100 }
  ├── puzzleActual: { tipo: "B", datos: {...} }
  ├── respuestas: [...]
  └── chat: [ { autor, texto, timestamp } ]

/ranking/{uid}
  ├── nombre: "Ghost"
  ├── puntajeMaximo: 3200
  ├── firewallsCompletados: 5
  └── fecha: timestamp
```

---

# PARTE 4 — DISEÑO VISUAL

## 4.1 Paleta de colores

```css
:root {
  --bg-primary:    #0a0e0a;
  --bg-secondary:  #111810;
  --bg-terminal:   #0d1117;

  --green-bright:  #00ff41;
  --green-mid:     #00c832;
  --green-dim:     #006622;

  --cyan:          #00d9ff;
  --red-alert:     #ff0040;
  --yellow-warn:   #ffcc00;
  --purple-glitch: #b000ff;

  --text-primary:  #00ff41;
  --text-secondary:#8fbc8f;
  --text-dim:      #4a5a4a;
}
```

## 4.2 Tipografías

- **Código/terminal:** `JetBrains Mono`
- **Títulos/UI:** `Orbitron`
- **Narrativa/logs:** `Share Tech Mono`

## 4.3 Efectos visuales obligatorios

1. **Scanlines**
2. **CRT flicker**
3. **Glitch**
4. **Typing effect**
5. **Matrix rain**
6. **Boot sequence**
7. **Cursor parpadeante**
8. **Shake** al fallar
9. **Flash verde/rojo**
10. **Partículas** al completar firewall

## 4.4 Pantallas

1. **Boot Screen**
2. **Main Menu**
3. **Intro Narrativa**
4. **Firewall (juego)**
5. **Puzzle Overlay**
6. **Firewall Complete**
7. **Twist Screen**
8. **Decisión Final**
9. **Ranking**
10. **Multijugador Lobby**

---

# PARTE 5 — MOTOR MATEMÁTICO

## 5.1 Módulo de Conjuntos (`conjuntos.js`)

```javascript
export const Conjuntos = {
  union: (a, b) => new Set([...a, ...b]),
  interseccion: (a, b) => new Set([...a].filter(x => b.has(x))),
  diferencia: (a, b) => new Set([...a].filter(x => !b.has(x))),
  diferenciaSimetrica: (a, b) => new Set([
    ...[...a].filter(x => !b.has(x)),
    ...[...b].filter(x => !a.has(x))
  ]),
  pertenece: (x, a) => a.has(x),
  subconjunto: (a, b) => [...a].every(x => b.has(x)),
  subconjuntoPropio: (a, b) =>
    Conjuntos.subconjunto(a, b) && a.size < b.size,
  iguales: (a, b) =>
    a.size === b.size && [...a].every(x => b.has(x)),
  cardinalidad: (a) => a.size,
  vacio: () => new Set()
};
```

## 5.2 Módulo de Lógica (`logica.js`)

```javascript
export const Logica = {
  and: (p, q) => p && q,
  or: (p, q) => p || q,
  not: (p) => !p,
  implica: (p, q) => !p || q,
  bicondicional: (p, q) => p === q,

  evaluar(expr, valores) {
    let js = expr
      .replace(/\bAND\b/g, '&&')
      .replace(/\bOR\b/g, '||')
      .replace(/\bNOT\b/g, '!')
      .replace(/\bIMPLICA\b/g, '__impl__')
      .replace(/\bSSI\b/g, '__bicon__');
    for (const [k, v] of Object.entries(valores)) {
      js = js.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
    }
    return eval(js);
  },

  tablaDeVerdad(expr, variables) {
    const filas = [];
    const n = variables.length;
    for (let i = 0; i < (1 << n); i++) {
      const valores = {};
      variables.forEach((v, j) => {
        valores[v] = !!(i & (1 << (n - 1 - j)));
      });
      filas.push({ valores, resultado: this.evaluar(expr, valores) });
    }
    return filas;
  },

  clasificar(expr, variables) {
    const tabla = this.tablaDeVerdad(expr, variables);
    const todosV = tabla.every(f => f.resultado);
    const todosF = tabla.every(f => !f.resultado);
    if (todosV) return 'tautologia';
    if (todosF) return 'contradiccion';
    return 'contingencia';
  },

  sonEquivalentes(expr1, expr2, variables) {
    const t1 = this.tablaDeVerdad(expr1, variables);
    const t2 = this.tablaDeVerdad(expr2, variables);
    return t1.every((f, i) => f.resultado === t2[i].resultado);
  }
};
```

## 5.3 Generador de puzzles (`generador.js`)

```javascript
export function generarPuzzleConjuntos(nivel) {
  const rango = nivel <= 2 ? 10 : 20;
  const A = new Set(randInts(1, rango, 4));
  const B = new Set(randInts(1, rango, 4));

  const operaciones = ['union', 'interseccion', 'diferencia'];
  const op = elegirAlAzar(operaciones);

  const respuestaCorrecta = Conjuntos[op](A, B);
  const opciones = [
    respuestaCorrecta,
    ...generarDistractores(A, B, op, 3)
  ];

  return {
    tipo: 'A',
    enunciado: `Dado A = ${fmt(A)} y B = ${fmt(B)}, ¿cuál es A ${simbolo(op)} B?`,
    opciones: mezclar(opciones).map(fmt),
    respuestaCorrecta: fmt(respuestaCorrecta),
    explicacion: `A ${simbolo(op)} B = ${fmt(respuestaCorrecta)} porque...`
  };
}
```

---

# PARTE 6 — ROADMAP DE DESARROLLO

## Fase 1 — Fundaciones (Días 1-2)
- [ ] Setup del proyecto (carpetas, `index.html`, CSS base).
- [ ] Paleta de colores y tipografías.
- [ ] Pantalla de boot con animación.
- [ ] Menú principal con matrix rain.
- [ ] Router entre pantallas.

## Fase 2 — Motor lógico (Días 3-5)
- [ ] `conjuntos.js` con todas las operaciones + tests.
- [ ] `logica.js` con evaluador y tablas de verdad.
- [ ] Generador de puzzles por tipo.
- [ ] Validación matemática de respuestas.

## Fase 3 — Terminal y comandos (Días 6-8)
- [ ] Emulador de terminal (`terminal.js`).
- [ ] Implementación de `ls`, `cat`, `cd`, `grep`, `find`, `whoami`, etc.
- [ ] Sistema de archivos virtual por firewall (cargado desde JSON).
- [ ] Historial de comandos con flechas arriba/abajo.

## Fase 4 — Contenido narrativo (Días 9-10)
- [ ] Escribir los 5 firewalls con sus logs ocultos.
- [ ] Sistema de typing effect.
- [ ] Sistema de logs escondidos con Chekhov's gun.
- [ ] Pantallas de intro, twist y decisiones finales.

## Fase 5 — HUD y puntuación (Día 11)
- [ ] HUD lateral con puntaje, integridad, firewall actual.
- [ ] Sistema de puntos con multiplicadores.
- [ ] Feedback visual y sonoro.
- [ ] Sistema de guardado en localStorage.

## Fase 6 — Multijugador (Días 12-15)
- [ ] Setup Firebase.
- [ ] Lobby: crear / unirse a partida con código.
- [ ] Co-op: turnos y chat.
- [ ] Versus: mismo puzzle, primero en resolver.
- [ ] Sincronización en tiempo real.

## Fase 7 — Ranking y pulido (Días 16-18)
- [ ] Ranking top 3 en Firestore.
- [ ] Animaciones finales.
- [ ] Sonidos ambientales.
- [ ] Responsive.
- [ ] Testing con usuarios reales.

## Fase 8 — Deploy (Día 19)
- [ ] Deploy a Vercel.
- [ ] Configurar dominio `.vercel.app`.
- [ ] Probar en móvil.

## Fase 9 — Presentación (Día 20)
- [ ] Preparar demo de 5 minutos.
- [ ] Trailer de 30 segundos.
- [ ] Documento de entrega con screenshots.

---

# PARTE 7 — CRITERIOS DE ACEPTACIÓN

El proyecto estará **terminado** cuando:

1. Se puede completar el modo historia de principio a fin.
2. Todos los puzzles se validan matemáticamente.
3. Los comandos de Linux funcionan y son parte de la mecánica.
4. La narrativa revela el plot twist en el firewall 5.
5. Hay 3 finales distintos según la decisión del jugador.
6. El modo multijugador permite conectar 2 jugadores en distintas máquinas.
7. El ranking guarda los 3 mejores puntajes.
8. La estética cyberpunk es consistente y sorprendente.
9. La app está desplegada en una URL pública gratuita.
10. Se ve bien en desktop y móvil.

---

# PARTE 8 — PROMPTS SUGERIDOS PARA ANTIGRAVITY

**Prompt 1:**
> Lee `PROJECT_SPEC.md`. Crea la estructura de carpetas, el `index.html` base, y el CSS con la paleta de colores definida. Solo estructura, sin lógica todavía.

**Prompt 2:**
> Implementa `conjuntos.js` y `logica.js` con todas las funciones del spec. Incluye tests básicos con `console.assert` que se ejecuten al cargar la página en modo debug.

**Prompt 3:**
> Implementa `terminal.js` con emulador de comandos: `ls`, `cat`, `cd`, `grep`, `find`, `whoami`, `clear`, `history`. Carga el sistema de archivos desde un JSON de ejemplo.

**Prompt 4:**
> Implementa el `generador.js` para puzzles tipo A (conjuntos visuales con diagrama de Venn en SVG).

**Prompt 5:**
> Implementa el HUD lateral, el sistema de puntuación y el guardado en localStorage.

**Prompt 6:**
> Implementa la pantalla de boot, el menú principal con matrix rain, y el router entre pantallas.

**Prompt 7:**
> Escribe el contenido narrativo de los 5 firewalls en `guion.js` y `logs.js`, siguiendo el plot twist del spec.

**Prompt 8:**
> Implementa el multijugador co-op con Firebase Realtime Database. Incluye lobby para crear/unirse con código de 6 dígitos.

**Prompt 9:**
> Implementa el ranking top 3 con Firestore y la pantalla de visualización con animaciones.

**Prompt 10:**
> Añade las animaciones CSS: scanlines, CRT flicker, glitch, typing effect, y shake al fallar.

---

# PARTE 9 — RECURSOS

**Fuentes (gratis):**
- JetBrains Mono: https://fonts.google.com/specimen/JetBrains+Mono
- Orbitron: https://fonts.google.com/specimen/Orbitron
- Share Tech Mono: https://fonts.google.com/specimen/Share+Tech+Mono

**Sonidos (gratis):**
- Freesound.org (buscar: "terminal typing", "computer beep", "glitch")
- Pixabay Music (buscar: "cyberpunk ambient")

**Inspiración visual:**
- Mr. Robot (intros)
- Hacknet (juego)
- Uplink (juego)
- Cyberpunk 2077 (menús)
- Blade Runner 2049 (colores)

**Firebase setup:**
1. Crear proyecto en https://console.firebase.google.com
2. Activar Realtime Database en modo test.
3. Activar Authentication → Anonymous.
4. Copiar config al `firebase.js`.

**Deploy en Vercel:**
1. Subir el repo a GitHub.
2. Entrar a https://vercel.com con la cuenta de GitHub.
3. Importar el repo → Deploy.
4. Listo, tienes URL pública.

---

# PARTE 10 — PRESUPUESTO

| Item | Costo |
|---|---|
| Frontend hosting (Vercel) | $0 |
| Base de datos (Firebase) | $0 |
| Dominio `.vercel.app` | $0 |
| Fuentes (Google Fonts) | $0 |
| Sonidos (Freesound) | $0 |
| **TOTAL** | **$0** |

Si más adelante quieres dominio propio: ~$10/año en Namecheap.

---

# 📌 RESUMEN EJECUTIVO

**Nombre:** El Último Algoritmo
**Género:** Puzzle / Hacker sim / Narrative
**Temas:** Conjuntos + Lógica proposicional
**Modos:** Historia (5 niveles) + Co-op + Versus
**Stack:** HTML + CSS + JS + Firebase
**Deploy:** Vercel (free)
**Duración:** ~20 días a tiempo completo, ~4-5 semanas a medio tiempo
**Wow factor:** Estética cyberpunk brutal + plot twist + múltiples finales + comandos Linux reales + multijugador online gratis

---

**Fin del documento.**