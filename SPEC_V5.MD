# 🌐 EL ÚLTIMO ALGORITMO — SPEC V5: MULTIJUGADOR 360°

Revolución total del modo multijugador. Deja de ser "jugar el mismo puzzle con otro" y se convierte en una experiencia competitiva única usando programación, criptografía, conjuntos y hacking en tiempo real.

**Nota:** Este spec **reemplaza** el modo multijugador actual. Mantiene co-op y versus, pero añade 6 modos nuevos.

---

# 🎯 FILOSOFÍA DEL MULTIJUGADOR

El multijugador de "El Último Algoritmo" no es "un juego con multiplayer". Es **un juego diseñado para dos hackers que se enfrentan intelectualmente**.

**Principios de diseño:**

1. **Asimétrico > simétrico.** Cada jugador tiene herramientas distintas.
2. **Interacción directa.** Puedes afectar al rival, no solo competir en paralelo.
3. **Tiempo real.** No es por turnos. Es una carrera constante.
4. **Riesgo calculado.** Puedes arriesgar para atacar o protegerte para defender.
5. **Espionaje.** Ver lo que hace el rival es parte del juego.
6. **Rejugabilidad total.** Cada partida es distinta.

---

# 🎮 LOS 7 MODOS DE JUEGO

## MODO 1 — CAPTURA LA BANDERA (CTF) — Recomendado

**Concepto:** Dos hackers compiten por robar la "bandera" (un archivo cifrado) del sistema del rival.

**Estructura:**
- Cada jugador tiene una **base** con 3 archivos cifrados.
- El objetivo es **robar los 3 archivos del rival** y traerlos a tu base.
- Para robar un archivo, debes resolver un puzzle (conjuntos, lógica, cripto).
- El rival puede **defender** sus archivos resolviendo puzzles defensivos.
- Gana quien robe los 3 archivos primero **o** quien tenga más archivos al llegar al tiempo límite (10 min).

**Mecánicas clave:**

1. **Fase de ataque:** resuelves un puzzle para descifrar un archivo del rival.
2. **Fase de defensa:** si el rival intenta robarte, puedes "defender" resolviendo un puzzle de contraseña más rápido que él.
3. **Fase de espionaje:** puedes ver el progreso del rival en tiempo real, pero cuesta tiempo.
4. **Fase de sabotaje:** puedes gastar puntos para ralentizar al rival (ej: hacer que su siguiente puzzle sea más difícil).

**UI:**

```
┌─────────────────────────────────────────────────────┐
│  TÚ (Ghost)              │       RIVAL (Phantom)    │
├──────────────────────────┼──────────────────────────┤
│  Archivos: 🟢🟢🟢        │  Archivos: 🟢🟢🔴        │
│  Puntos: 450             │  Puntos: 380             │
│  Integridad: 80%         │  Integridad: 60%         │
├──────────────────────────┴──────────────────────────┤
│  [TERMINAL COMPARTIDA]                              │
│                                                     │
│  > atacar phantom/archivo_3                         │
│  Puzzle: A ∩ B donde A={1,2,3}, B={2,3,4}          │
│  > _                                                │
└─────────────────────────────────────────────────────┘
```

**Puntuación:**
- Robar archivo: +200 puntos.
- Defender archivo: +100 puntos.
- Resolver puzzle rápido (< 15 seg): +50 bonus.
- Robar 3 archivos: +500 bonus (victoria).

---

## MODO 2 — DUELO DE CÓDIGO (Programación 1v1)

**Concepto:** Dos hackers reciben el mismo problema de programación. El primero que lo resuelva gana.

**Estructura:**
- Se genera un problema aleatorio (ej: "ordena esta lista de logs por fecha").
- Ambos jugadores tienen 5 minutos para escribir un script en GhostScript.
- El primer script que pase todos los tests gana.
- Si ambos pasan, gana el más eficiente (menos líneas, más rápido).

**Ejemplos de retos:**

1. **Reto básico:** "Encuentra todos los archivos que contengan la palabra 'vera' en un servidor de 1000 archivos."
2. **Reto medio:** "Descifra 50 mensajes con cifrado César en menos de 30 segundos."
3. **Reto avanzado:** "Dado un grafo de servidores, encuentra la ruta más corta entre dos nodos."
4. **Reto Zachtronics:** "Implementa un algoritmo de compresión simple para reducir el tamaño de un archivo."

**UI:**

```
┌────────────────────────┬────────────────────────┐
│  TÚ                    │  RIVAL                 │
│  ⏱ 04:32              │  ⏱ 04:32              │
│                        │                        │
│  [EDITOR DE CÓDIGO]    │  [EDITOR DE CÓDIGO]    │
│  LET archivos = SCAN.. │  (relleno)             │
│                        │                        │
│  [TESTS: 3/5 ✓]        │  [TESTS: 1/5 ✓]        │
├────────────────────────┴────────────────────────┤
│  PUNTOS: 300        PUNTOS RIVAL: 100           │
└──────────────────────────────────────────────────┘
```

**Puntuación:**
- Ganar el duelo: +500 puntos.
- Terminar tests en menos tiempo: bonus de velocidad.
- Solución más corta: +100 bonus.

---

## MODO 3 — GUERRA DE CRIPTOGRAFÍA

**Concepto:** Cada jugador cifra un mensaje y el otro debe descifrarlo. El que descifre más rápido gana.

**Estructura:**

1. **Fase 1 (Preparación, 2 min):** Cada jugador escribe un mensaje secreto y elige un método de cifrado (César, Vigenère, RSA, sustitución, etc.).
2. **Fase 2 (Intercambio):** Los mensajes se intercambian.
3. **Fase 3 (Descifrado, 10 min):** Cada jugador intenta descifrar el mensaje del rival.
4. **Fase 4 (Puntuación):** Gana quien descifre más rápido. Bonus si el mensaje es difícil de descifrar.

**Mecánicas especiales:**

- **Mensajes temáticos:** el mensaje debe ser una frase del juego (lore). Esto hace que el jugador piense en qué frase usar.
- **Cifrados malos:** si usas un cifrado demasiado fácil (ej: César sin clave), el rival descifra en segundos. Si usas uno demasiado difícil (ej: RSA sin pistas), el rival no puede descifrar y **pierdes puntos por hacer trampa**.
- **Pista obligatoria:** debes dejar UNA pista encriptada del método usado. Si el rival no la encuentra, se le da automáticamente después de 5 min.

**UI:**

```
┌─────────────────────────────────────────────────────┐
│  TU MENSAJE: "Vera vive en cada línea de código."  │
│  MÉTODO: Vigenère                                   │
│  CLAVE: "nexus" (oculta)                            │
│                                                     │
│  [CONFIRMAR Y ENVIAR]                               │
├─────────────────────────────────────────────────────┤
│  MENSAJE DEL RIVAL: "LXFOPVEFRNHR... (cifrado)"    │
│                                                     │
│  > descifrar con clave: _                           │
└─────────────────────────────────────────────────────┘
```

**Puntuación:**
- Descifrar el mensaje del rival: +400 puntos.
- Que el rival NO pueda descifrar tu mensaje: +300 puntos.
- Descifrar en menos de 2 minutos: +200 bonus.

---

## MODO 4 — BATALLA DE CONJUNTOS

**Concepto:** Los jugadores compiten por "conquistar" elementos de un universo de datos.

**Estructura:**

- Hay un universo de 50 elementos (números, palabras, conceptos).
- Cada jugador tiene un conjunto base.
- En cada turno, se genera una operación (∪, ∩, −, △).
- El primero en resolver correctamente se queda con los elementos resultantes.
- Gana quien tenga más elementos al final.

**Mecánicas especiales:**

- **Robo de elementos:** si resuelves una intersección, robas elementos del rival.
- **Defensa:** si el rival intenta robarte, puedes responder con otro puzzle para defenderte.
- **Elementos especiales:** algunos elementos dan bonus (+50 puntos, inmunidad por 1 turno, etc.).

**UI:**

```
┌─────────────────────────────────────────────────────┐
│  UNIVERSO: {1..50}                                  │
├─────────────────────────────────────────────────────┤
│  TÚ: {2,4,6,8,10,12,...} (25 elementos)             │
│  RIVAL: {1,3,5,7,9,11,...} (20 elementos)           │
│  SIN DUEÑO: {21,22,23,24,25} (5 elementos)          │
├─────────────────────────────────────────────────────┤
│  OPERACIÓN: A ∩ B donde A={1,2,3,4,5}, B={3,4,5,6} │
│  > _                                                │
└─────────────────────────────────────────────────────┘
```

**Puntuación:**
- Resolver correctamente: elementos resultantes a tu conjunto.
- Resolver primero: +100 puntos + turno extra.
- Conquistar más del 60% del universo: victoria.

---

## MODO 5 — HACKEO AL RIVAL (Infiltración)

**Concepto:** Un jugador es **Ghost** (hacker), el otro es **Centinela** (defensor). El Ghost intenta hackear al Centinela mientras él defiende.

**Estructura:**

- **Ghost:** debe resolver 5 puzzles para "hackear" el sistema del Centinela.
- **Centinela:** debe detectar y bloquear los intentos del Ghost antes de que lo hackee.
- **Duración:** 8 minutos.

**Mecánicas especiales:**

**Para el Ghost:**
- Ve el sistema del Centinela como una red de nodos.
- Cada nodo tiene un puzzle.
- Al resolver un puzzle, "infecta" el nodo.
- Si el Centinela bloquea un nodo, debe buscar otra ruta.

**Para el Centinela:**
- Ve los intentos del Ghost en tiempo real.
- Puede **bloquear** un nodo gastando puntos.
- Puede **plantar trampas** (puzzles falsos que ralentizan al Ghost).
- Puede **analizar** qué método está usando el Ghost.

**UI (Ghost):**

```
┌─────────────────────────────────────────────────────┐
│  SISTEMA DEL CENTINELA                              │
│                                                     │
│      [N1]──[N2]──[N3]                              │
│       │     │     │                                │
│      [N4]──[N5]──[N6]                              │
│       │     │     │                                │
│      [N7]──[N8]──[N9]                              │
│                                                     │
│  Infectados: N1, N4, N5 (3/9)                       │
│  Bloqueados: N3, N6                                 │
│  Detectado: NO                                      │
└─────────────────────────────────────────────────────┘
```

**UI (Centinela):**

```
┌─────────────────────────────────────────────────────┐
│  ALERTA: Ghost está en N5                           │
│  MÉTODO DETECTADO: conjuntos                        │
│                                                     │
│  [BLOQUEAR N5] (cuesta 100 puntos)                  │
│  [PLANTAR TRAMPA] (cuesta 50 puntos)                │
│  [ANALIZAR] (cuesta 30 puntos)                      │
│                                                     │
│  PUNTOS: 320    TIEMPO: 04:12                       │
└─────────────────────────────────────────────────────┘
```

**Puntuación:**
- Ghost gana: hackea todos los nodos sin ser detectado.
- Centinela gana: detecta al Ghost antes de que lo hackee.
- Ambos ganan puntos por acciones (infección, bloqueo, análisis).

---

## MODO 6 — CTF COOPERATIVO (2v2)

**Concepto:** Dos equipos de 2 jugadores compiten por capturar la bandera del equipo rival.

**Estructura:**

- Cada equipo tiene una base con 5 archivos.
- Los equipos se dividen roles: 1 atacante, 1 defensor.
- El atacante intenta robar archivos.
- El defensor protege los archivos del equipo.
- Los roles pueden intercambiarse durante la partida.

**Mecánicas especiales:**

- **Chat de equipo:** los jugadores del mismo equipo pueden comunicarse.
- **Poderes compartidos:** pueden usar puntos en conjunto para sabotear al rival.
- **Sincronización:** si ambos atacantes resuelven puzzles al mismo tiempo, se multiplican los puntos.

**UI:**

```
┌───────────────────────┬───────────────────────────┐
│  EQUIPO ROJO          │  EQUIPO AZUL              │
│  Ghost + Phantom      │  Reaper + Wraith          │
│                       │                           │
│  Archivos: 🟢🟢🟢🟢🟢  │  Archivos: 🟢🟢🟢🔴🔴     │
│  Puntos: 850          │  Puntos: 720              │
├───────────────────────┴───────────────────────────┤
│  [CHAT DE EQUIPO]                                 │
│  Ghost: "voy por el archivo 4"                    │
│  Phantom: "yo cubro la base"                      │
└───────────────────────────────────────────────────┘
```

**Puntuación:**
- Robar archivo: +200 por equipo.
- Defender: +100 por equipo.
- Sincronización perfecta (ambos resuelven en < 5 seg de diferencia): +300 bonus.

---

## MODO 7 — GUERRA TOTAL (Todos contra todos)

**Concepto:** Modo caótico. 4 jugadores. Cada uno contra todos.

**Estructura:**

- 4 jugadores en un mapa de 16 nodos.
- Cada nodo tiene un puzzle.
- El que resuelva el puzzle primero, conquista el nodo.
- Los nodos conquistados generan puntos por segundo.
- Gana quien tenga más puntos al final de 15 minutos.

**Mecánicas especiales:**

- **Alianzas temporales:** puedes formar alianzas verbales (por chat) para atacar a otro.
- **Traición:** puedes romper la alianza en cualquier momento.
- **Guerra de información:** puedes hackear a otros para ver qué puzzles están resolviendo.

**UI:**

```
┌─────────────────────────────────────────────────────┐
│  MAPA DE NODOS                                      │
│                                                     │
│    [G]──[P]──[R]──[W]                              │
│     │    │    │    │                                │
│    [P]──[G]──[W]──[R]                              │
│     │    │    │    │                                │
│    [W]──[R]──[P]──[G]                              │
│                                                     │
│  Ghost: 8 nodos | Phantom: 4 | Reaper: 2 | Wraith: 2│
│                                                     │
│  PUNTOS: Ghost 800 | Phantom 400 | Reaper 200      │
└─────────────────────────────────────────────────────┘
```

---

# 🛠️ ARQUITECTURA TÉCNICA

## Stack recomendado

| Capa | Tecnología |
|---|---|
| **Tiempo real** | Firebase Realtime Database |
| **Estado del juego** | Firebase Functions (para validación server-side) |
| **Matchmaking** | Firebase Realtime + código de 6 dígitos |
| **Chat** | Firebase Realtime |
| **Ranking global** | Firestore |
| **Anti-cheat** | Validación server-side de puzzles |

## Modelo de datos

```
/partidas/{partidaId}
  ├── modo: "ctf" | "duelo_codigo" | "cripto" | "conjuntos" | "hackeo" | "ctf_coop" | "guerra_total"
  ├── estado: "esperando" | "jugando" | "terminada"
  ├── jugadores: {
  │     uid1: { nombre, puntos, integridad, ... },
  │     uid2: { nombre, puntos, integridad, ... }
  │   }
  ├── mapa: { ... } // depende del modo
  ├── turnoActual: uid1
  ├── tiempoRestante: 600
  ├── eventos: [ { tipo, jugador, timestamp, datos } ]
  └── chat: [ { autor, mensaje, timestamp } ]

/ranking/{modo}/{uid}
  ├── nombre
  ├── victorias
  ├── derrotas
  ├── puntosTotales
  └── ranking
```

## Sistema de eventos

Todo lo que pasa en la partida es un evento:

```javascript
function emitirEvento(tipo, datos) {
  const partidaRef = db.ref(`partidas/${partidaId}/eventos`);
  partidaRef.push({
    tipo,
    jugador: uidActual,
    timestamp: Date.now(),
    datos
  });
}

// Ejemplos:
emitirEvento('puzzle_resuelto', { puzzleId: 'p3', tiempo: 12 });
emitirEvento('archivo_robado', { archivoId: 'a2', victima: 'phantom' });
emitirEvento('defensa_exitosa', { atacante: 'phantom' });
emitirEvento('sabotaje', { victima: 'phantom', tipo: 'ralentizar' });
```

Cada cliente escucha los eventos y actualiza su estado local.

## Anti-cheat

Los puzzles se validan **en el servidor**:

```javascript
// Firebase Function
exports.validarPuzzle = functions.https.onCall(async (data, context) => {
  const { partidaId, puzzleId, respuesta } = data;
  const uid = context.auth.uid;
  
  const puzzle = await db.ref(`partidas/${partidaId}/puzzles/${puzzleId}`).once('value');
  const puzzleData = puzzle.val();
  
  const esCorrecta = validarRespuesta(puzzleData, respuesta);
  
  if (esCorrecta) {
    await db.ref(`partidas/${partidaId}/eventos`).push({
      tipo: 'puzzle_resuelto',
      jugador: uid,
      timestamp: Date.now(),
      datos: { puzzleId, respuesta }
    });
  }
  
  return { correcta: esCorrecta };
});
```

Esto evita que un jugador modifique su cliente para hacer trampa.

---

# 🎨 UI/UX DEL MULTIJUGADOR

## Lobby

Pantalla con:
- Botón "Crear partida" → genera código de 6 dígitos.
- Input "Unirse con código".
- Lista de jugadores en línea (opcional).
- Selector de modo de juego.
- Historial de partidas.

## Pantalla de partida

Layout específico por modo, pero siempre con:
- **HUD superior:** puntaje, tiempo, estado.
- **Área central:** la acción principal.
- **Chat lateral:** comunicación.
- **Terminal inferior:** comandos disponibles.

## Feedback en tiempo real

- **Toasts** cuando el rival hace algo relevante.
- **Sonidos** distintos según la acción (rival ataca, rival defiende, rival falla).
- **Animaciones** que muestran la acción del rival en tu pantalla.

---

# 🏆 SISTEMA DE RANKING

## Ranking global

Por modo de juego. Muestra:
- Top 3 absoluto.
- Tu posición.
- Victorias / derrotas.
- Racha actual.
- Mejor tiempo.
- Modo favorito.

## Ranking semanal

Se resetea cada lunes. Top 10.

## Insignias

- 🥇 "Primer lugar global"
- 🥈 "Segundo lugar global"
- 🥉 "Tercer lugar global"
- 💀 "100 victorias"
- ⚡ "Racha de 10 victorias"
- 🎯 "Precisión perfecta" (100% aciertos en una partida)
- 🧠 "Maestro de criptografía"
- 💻 "Maestro de scripting"
- 🎭 "Maestro de conjuntos"
- 👻 "Hacker legendario"

---

# 🎯 PROMPTS PARA ANTIGRAVITY

## Prompt M1 — Refactor del multijugador

> Lee `SPEC_V5_MULTIJUGADOR.md`. Refactoriza el sistema de multijugador actual para soportar los 7 modos. Empieza por el sistema de eventos y el modelo de datos. No implementes todavía los modos, solo la infraestructura.

## Prompt M2 — Matchmaking con código

> Implementa el sistema de creación de partida con código de 6 dígitos. Un jugador crea, otro se une con el código. Usa Firebase Realtime Database. Incluye validación de que el código no esté ya en uso.

## Prompt M3 — Chat en tiempo real

> Implementa un chat en tiempo real para partidas cooperativas y versus. Estilo terminal (fuente monoespaciada, formato `[hh:mm] nombre: mensaje`). Persiste en Firebase.

## Prompt M4 — Modo CTF

> Implementa el modo "Captura la Bandera" según el spec. Incluye: mapa con 3 archivos por base, sistema de robo, defensa, espionaje, sabotaje. UI específica para CTF.

## Prompt M5 — Modo Duelo de Código

> Implementa el modo "Duelo de Código" con editor CodeMirror en paralelo. Los dos jugadores ven el mismo problema. El primero en pasar los tests gana. Incluye ranking de soluciones por eficiencia.

## Prompt M6 — Modo Guerra de Criptografía

> Implementa el modo "Guerra de Criptografía". Cada jugador cifra un mensaje y el otro lo descifra. Sistema de pistas automáticas después de 5 min. Validación server-side.

## Prompt M7 — Modo Batalla de Conjuntos

> Implementa el modo "Batalla de Conjuntos". Universo de 50 elementos, cada jugador tiene un conjunto base, se generan operaciones aleatorias. El primero en resolver se queda con los elementos.

## Prompt M8 — Modo Hackeo al Rival

> Implementa el modo "Hackeo al Rival" (Ghost vs Centinela). Ghost resuelve puzzles para infectar nodos, Centinela bloquea. UI diferenciada para cada rol.

## Prompt M9 — Modo CTF Cooperativo 2v2

> Implementa el modo "CTF Cooperativo" 2v2. Roles intercambiables, chat de equipo, poderes compartidos, sincronización con bonus.

## Prompt M10 — Modo Guerra Total

> Implementa el modo "Guerra Total" (4 jugadores). Mapa de 16 nodos, conquista por resolución de puzzles, puntos por segundo, alianzas y traiciones.

## Prompt M11 — Anti-cheat server-side

> Implementa validación server-side de puzzles con Firebase Functions. Ningún cliente puede reportar un puzzle como resuelto sin validación del servidor.

## Prompt M12 — Ranking global

> Implementa el ranking global con Firestore. Top 3 por modo, posición personal, insignias desbloqueables, ranking semanal.

## Prompt M13 — Lobby y UX

> Implementa el lobby de multijugador con: crear partida, unirse con código, selector de modo, historial de partidas, lista de jugadores en línea.

---

# 🎯 ORDEN RECOMENDADO

Si solo pudieras hacer 5 modos, en este orden:

| # | Modo | Por qué |
|---|---|---|
| **1** | **CTF** | El más icónico y completo. Es el que todos conocen. |
| **2** | **Duelo de Código** | El más único y "Zachtronics". Diferenciador. |
| **3** | **Guerra de Criptografía** | El más temático. Muy rejugable. |
| **4** | **Hackeo al Rival** | El más asimétrico y tenso. Espectacular para demos. |
| **5** | **Batalla de Conjuntos** | El más accesible. Bueno para tutorial y para fans de puzzles. |

Los otros 2 modos (CTF Coop y Guerra Total) son extras para la v3.

---

# ⚠️ ADVERTENCIAS

1. **Empieza con UN modo, no con 7.** Implementa CTF completo antes de pasar a otro.
2. **El anti-cheat es crítico.** Sin validación server-side, el multijugador es inútil.
3. **Testea con dos pestañas del navegador** antes de probar con dos personas.
4. **El costo de Firebase puede aumentar** si hay muchos jugadores. Configura alertas de billing.
5. **El matchmaking por código es más simple que por skill.** Empieza por ahí.
6. **El chat debe moderarse.** Los jugadores pueden escribir cosas feas.

---

**Fin del documento.**