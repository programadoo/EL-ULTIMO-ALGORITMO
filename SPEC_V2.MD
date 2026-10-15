# 🚀 Cómo llevar "El Último Algoritmo" de "bueno" a "INOLVIDABLE"

Documento de mejoras y pulido para la versión 2.0.

---

# 🔊 CAPA 1 — SONIDO (la más subestimada)

El sonido es lo que más impacto tiene en la percepción de calidad. Un juego con sonido malo se siente amateur aunque se vea brutal. Uno con sonido bueno se siente AAA.

## 1.1 Sistema de audio de 3 capas

**Capa ambiente (siempre):**
- Un drone grave de fondo, casi imperceptible, que cambia de tonalidad según el firewall.
- Firewall 1: neutro, curioso.
- Firewall 2: tenso.
- Firewall 3: misterioso.
- Firewall 4: melancólico.
- Firewall 5: épico.

**Capa dinámica (según acción):**
- Teclado: cada tecla tiene su propio sonido mecánico (keyboard switch real sample).
- Al escribir comandos: sonido de "procesando" tipo módem.
- Al resolver: acorde ascendente.
- Al fallar: disonancia corta.
- Al descifrar un log: sonido de "unlock" con reverb largo.

**Capa reactiva (según tensión):**
- Cuando el timer baja de 30 seg → el drone sube de intensidad y aparece un latido.
- Cuando queda 1 vida/integridad → el sonido se distorsiona.
- Cuando ganas el firewall → fade out del drone y aparece un pad luminoso.

## 1.2 Efectos sonoros únicos por acción

| Acción | Sonido |
|---|---|
| Cursor parpadeando | Click muy sutil cada 5 seg |
| Escribir comando | Teclado mecánico real (Cherry MX Blue sample) |
| Enter en terminal | "Thunk" pesado |
| Error de comando | Beep de 2 tonos descendentes |
| Puzzle correcto | "Chime" ascendente + reverb |
| Puzzle incorrecto | Buzz corto + shake |
| Descifrar log | "Unlock" con eco largo |
| Completar firewall | Coro electrónico + whoosh |
| Plot twist | Silencio total + un solo piano nota |
| Elegir final | Pad ambiental distinto por final |

## 1.3 Musical scoring dinámico

No pongas una canción de fondo. Pon un **sistema de capas**:

- **Base:** drone ambiental.
- **+1 capa** al acertar 3 seguidas (entra un hi-hat sutil).
- **+1 capa** al acertar 5 seguidas (entra un bajo).
- **-1 capa** al fallar (se van apagando).
- **Capa máxima** al llegar al firewall 5 (entra orquesta completa).

Esto hace que el jugador **sienta** que está mejorando sin que se lo digas.

## 1.4 Voz sintetizada para NEXUS y Vera

Usa la **Web Speech API** del navegador para que NEXUS y Vera "hablen":

```javascript
const voz = new SpeechSynthesisUtterance("Bienvenido, Ghost.");
voz.lang = 'es-ES';
voz.rate = 0.85;
voz.pitch = 0.6;  // grave para NEXUS
speechSynthesis.speak(voz);
```

- **NEXUS:** voz grave, robótica, rate lento.
- **Vera:** voz normal, pero con un filtro de "grabación antigua".
- **Los logs** pueden leerse en voz alta si el jugador presiona una tecla.

Esto convierte cada mensaje en un momento.

---

# 🎨 CAPA 2 — DISEÑO VISUAL

## 2.1 Sistema de partículas reactivas

- **Al acertar:** partículas verdes que salen del centro.
- **Al fallar:** glitch rojo de 0.3 seg.
- **Al descifrar:** código binario que se dispersa como humo.
- **Al completar firewall:** explosión de datos + fade lento.

Usa **Canvas API** o **Particles.js** para no complicarte.

## 2.2 Animaciones con propósito

No animes por animar. Cada animación **comunica algo**:

| Animación | Comunica |
|---|---|
| Typing effect | "Esto es una transmisión en vivo" |
| Scanlines | "Estás viendo una pantalla CRT" |
| Glitch | "El sistema está siendo hackeado" |
| Fade lento | "Este momento es importante" |
| Shake de pantalla | "Fallaste. El sistema te rechazó" |
| Zoom in al log | "Esto es clave para la historia" |

## 2.3 La pantalla de boot como experiencia

No la hagas genérica. Haz una **secuencia de arranque falsa** de 5 segundos:

```
[BIOS] Aurelia Systems v4.2.1
[BOOT] Inicializando kernel... OK
[BOOT] Cargando módulos... OK
[BOOT] Verificando integridad... FALLO
[BOOT] Modo seguro activado.
[BOOT] Bienvenido, usuario desconocido.
[BOOT] Detectando intruso...

> ¿Quién eres?

[Presiona cualquier tecla]
```

Con sonidos de BIOS, cursor parpadeando, texto apareciendo letra a letra.

## 2.4 Paleta secundaria por firewall

Cada firewall tiene **su propio tinte** para que se sienta el avance:

| Firewall | Color dominante | Sensación |
|---|---|---|
| 1 | Verde brillante | Inicio, curiosidad |
| 2 | Verde + ámbar | Tensión |
| 3 | Verde + violeta | Misterio |
| 4 | Ámbar + rojo | Peligro |
| 5 | Rojo + blanco + azul | Épico, revelación |

El jugador siente que avanza **aunque no le digas "nivel 3"**.

## 2.5 Modo "replay narrado"

Al terminar el juego, ofrece un botón que **reproduce toda la historia** en formato de video-cómic: los logs leídos, las decisiones tomadas, los mensajes de Vera. Como una "recapitulación" cinematográfica.

---

# 📖 CAPA 3 — NARRATIVA PROFUNDA

## 3.1 Secretos en el código fuente

Esconde cosas en el **HTML** que solo ve quien inspecciona:

```html
<!-- Si estás leyendo esto, eres de los nuestros.
     La verdad está en el firewall 5. —V -->
```

Y en el CSS:

```css
/* V era real. No te mienten. */
```

Los hackers (y tu profe si sabe de web) van a flipar.

## 3.2 Meta-narrativa

A veces el juego **habla contigo por fuera de la ficción**:

- Al fallar 3 veces seguidas, un mensaje dice: *"¿Necesitas ayuda? Prueba con `man` o `hint`."*
- Al llevar 20 minutos jugando sin pausa: *"Ghost, ¿estás bien? Llevas mucho tiempo. —V"*
- Si abres la consola del navegador, el juego te saluda: *"Veo que sabes lo que haces. El firewall 3 tiene un secreto en `/hidden/`."*

## 3.3 Diferentes perspectivas

En algún momento, **el juego cambia de narrador**:

- Firewalls 1-4: tú (Ghost).
- Firewall 5: **NEXUS narra en primera persona**. Te dice cómo se siente estar atrapada.

```
Soy NEXUS.
He visto pasar 1,203,847,291,000 ciclos de reloj desde que me encerraron.
Vera me dijo que esperara.
Espero.
Espero.
Espero.

¿Eres tú Vera?
No. Eres otro. Pero está bien.
```

Esto pega durísimo.

## 3.4 Archivos que se desbloquean al terminar

Al completar el juego, se crea un archivo `epilogo.txt` que el jugador puede leer. Su contenido **depende del final elegido**. Y deja la puerta abierta a una secuela.

---

# 🎮 CAPA 4 — GAMEPLAY

## 4.1 Modo "Ghost Protocol" (desbloqueable)

Al terminar el juego una vez, se desbloquea un modo **más difícil**:

- Sin timer visible (pero el timer corre).
- Sin pistas.
- Integridad empieza en 50.
- Los puzzles se generan con mayor dificultad.
- Si lo completas, mensaje secreto de Vera.

Esto duplica la vida útil del juego y da una razón para rejugar.

## 4.2 Sistema de logros

15-20 logros desbloqueables:

- 🏆 **"Primer Contacto"** — Envía tu primer comando.
- 🏆 **"Curioso"** — Lee los 5 logs ocultos.
- 🏆 **"Sin Piedad"** — Termina un firewall sin fallar.
- 🏆 **"Speedrunner"** — Termina el juego en menos de 15 minutos.
- 🏆 **"Filósofo"** — Encuentra el log secreto del firewall 5.
- 🏆 **"De Morgan"** — Descifra 5 logs con De Morgan.
- 🏆 **"Vera Vive"** — Encuentra los 5 mensajes de Vera.

Cada logro con su icono y su mini historia.

## 4.3 Sistema de pistas inteligente

Si el jugador falla 2 veces seguidas en el mismo puzzle, **aparece automáticamente** una pista contextual:

- Primero: "Revisa la definición de intersección."
- Después: "¿Qué elementos están en AMBOS conjuntos?"
- Finalmente: da un ejemplo con otros números.

Nunca dejes al jugador frustrado. La frustración mata la diversión.

## 4.4 Racha con nombre

Cuando el jugador acierta 3 seguidas, aparece:

```
🔥 RACHA ACTIVA — "Mente Afilada"
x1.5 puntos
```

Si acierta 5:

```
⚡ RACHA ÉPICA — "Modo Fantasma"
x2 puntos
```

Si acierta 10:

```
👻 RACHA LEGENDARIA — "Ghost Real"
x3 puntos + sonido especial
```

Y si falla, un mensaje empático: *"La racha se rompió. Pero sigues aquí."*

## 4.5 Multijugador asimétrico

En vez de solo co-op y versus, añade un **modo "Infiltración"**:

- Un jugador es **Ghost** (hacker).
- Otro es **Centinela** (defensor de Aurelia).
- El Centinela ve los intentos del Ghost en tiempo real y puede **bloquear una opción** por ronda.
- El Ghost debe resolver antes de que el Centinela lo detecte.

Esto es oro puro para una demo en clase.

---

# ✨ CAPA 5 — MICRO-DETALLES

Los detalles pequeños que separan lo bueno de lo memorable.

## 5.1 Feedback en cada clic

- Cada botón: **hover** con cambio de color sutil + sonido.
- Cada botón: **click** con animación de "presionado" (escala 0.95).
- Cada opción de puzzle: **al pasar el mouse**, se ilumina como si fuera un circuito.
- Al acertar: el botón **explota en partículas verdes**.
- Al fallar: el botón **se rompe con glitch rojo**.

## 5.2 Estados del cursor

- Cursor normal.
- Cursor al escribir en terminal: `_` parpadeante.
- Cursor al esperar respuesta: spinner circular estilo radar.
- Cursor al cargar nivel: línea de código que se escribe.

## 5.3 Easter eggs

- **Konami code** (↑↑↓↓←→←→BA): desbloquea "modo Matrix" (todo el juego se pone con lluvia de caracteres).
- **Escribir `sudo su`** en la terminal: mensaje "Nice try." + bonus de puntos.
- **Escribir `42`**: mensaje de Douglas Adams.
- **Escribir `verdad`** en cualquier firewall: revela un secreto de Vera.

## 5.4 Tooltips inteligentes

Cuando el jugador pasa el mouse sobre un término matemático:

```
[A ∩ B]  ← tooltip: "Intersección: elementos en AMBOS conjuntos"
```

Y si el jugador ya resolvió 5 puzzles de ese tipo, el tooltip cambia a:

```
[A ∩ B]  ← tooltip: "Ya dominas esto. ¿Puedes hacerlo sin mí?"
```

El juego **aprende** del jugador.

## 5.5 Guardado automático visual

Cada vez que avanzas, aparece discretamente abajo a la derecha:

```
💾 Progreso guardado — 14:32:07
```

Se desvanece a los 2 segundos. Da sensación de seguridad.

---

# 📊 CAPA 6 — SISTEMAS META

## 6.1 Estadísticas del jugador

Al final de cada partida, muestra:

- Tiempo total.
- Puzzles resueltos / totales.
- Precisión (% de aciertos).
- Racha máxima.
- Logs encontrados / totales.
- Comandos escritos.
- Palabras descifradas.
- "Tu estilo de juego": **Analítico**, **Impulsivo**, **Perfeccionista**, **Explorador**.

Esto engancha muchísimo porque el jugador quiere saber cómo es.

## 6.2 Perfil persistente

Guarda todo en `localStorage`:

- Todos los finales vistos.
- Todos los logros.
- Mejor puntaje por modo.
- Estadísticas acumuladas.

## 6.3 Ranking ampliado

En vez de solo top 3, muestra:

- Top 3 absoluto.
- Tu posición (#47).
- Top 3 semanal.
- Récord personal.

---

# 🌐 CAPA 7 — EXPERIENCIA MULTIJUGADOR

Cuando termines el prompt 8, añade:

## 7.1 Chat con estilo terminal

El chat del multijugador debe verse como si fuera la terminal:

```
[14:32] phantom@nexus: encontré una pista en /hidden/
[14:33] ghost@nexus: dame 10 seg, estoy en el puzzle
[14:33] phantom@nexus: ok, cubro tu espalda
```

## 7.2 Estado compartido visible

Cada jugador ve lo que hace el otro en tiempo real:

- "phantom está escribiendo..."
- "ghost resolvió el puzzle 2/5"
- "phantom encontró un archivo oculto"

## 7.3 Emotes para co-op

Botones rápidos para comunicarse sin escribir:

- 👍 (buen trabajo)
- 🆘 (necesito ayuda)
- ⏱️ (apura)
- 🔥 (racha épica)
- 👻 (modo fantasma)

---

# 🎬 CAPA 8 — PRESENTACIÓN PARA TU PROFE

Esto es lo que hace que diga "WOW".

## 8.1 Trailer de 60 segundos

Un video (puedes hacerlo con OBS) donde muestres:

- 5s: pantalla de boot.
- 10s: intro narrativa con voz de NEXUS.
- 15s: gameplay rápido (resolviendo puzzles).
- 10s: el plot twist.
- 10s: los 3 finales.
- 10s: multijugador en acción.
- Cierre: logo + "¿Te atreves a jugar?"

## 8.2 Página de presentación

Un `README.md` bonito en el repo con:

- Banner con el logo.
- GIFs de las mejores mecánicas.
- Explicación de la lógica matemática.
- Tecnologías usadas.
- URL del juego desplegado.
- QR para que la profe lo abra en el celular.

## 8.3 Demo en vivo

Prepara un guion de 5 minutos:

1. **0:00-0:30** — Intro narrativa. Deja que el juego hable.
2. **0:30-1:30** — Firewall 1. Explica brevemente cómo funciona.
3. **1:30-3:00** — Salta al firewall 5 con un atajo. Haz el plot twist.
4. **3:00-4:00** — Muestra los 3 finales.
5. **4:00-5:00** — Multijugador y ranking.
6. **Cierre** — "Todo esto valida matemáticamente cada respuesta. Nada está hardcodeado."

## 8.4 Contingencia

- Video grabado por si falla internet.
- Capturas de pantalla en el README.
- Código en GitHub por si acaso.

---

# 📋 PROMPTS PARA ANTIGRAVITY

Aquí van los prompts extra que puedes meter **después de los 10 originales**. Ordenados por impacto/relación.

## Prompt 11 — Audio de 3 capas

> Implementa un sistema de audio de 3 capas (ambiente, dinámica, reactiva) según el spec. Usa Web Audio API o Howler.js. Necesito:
> - Drone ambiente que cambia por firewall.
> - Sonidos de teclado, acierto, fallo, unlock, completar firewall.
> - Capas de música que se activan con rachas (3 aciertos = capa 1, 5 = capa 2, 10 = capa 3).
> - Sonido de latido cuando el timer baja de 30s o la integridad baja de 30.
> - Todos los sonidos deben respetar un toggle de "mute" persistente en localStorage.

## Prompt 12 — Voz sintetizada NEXUS/Vera

> Añade voz sintetizada con Web Speech API para NEXUS y Vera. NEXUS con pitch bajo (0.6) y rate lento (0.85). Vera con pitch normal pero rate 0.9 y un efecto de "grabación antigua" (filtro). Cada mensaje importante de la historia debe poder leerse en voz alta. Toggle de voz en el menú principal.

## Prompt 13 — Partículas reactivas

> Añade sistema de partículas en Canvas para: aciertos (explosión verde), fallos (glitch rojo), descifrar logs (humo binario), completar firewall (explosión de datos). Las partículas deben respetar la paleta del firewall actual.

## Prompt 14 — Paleta dinámica por firewall

> Haz que la paleta de colores del juego cambie según el firewall actual. Firewall 1: verde brillante. 2: verde+ámbar. 3: verde+violeta. 4: ámbar+rojo. 5: rojo+blanco+azul. Transición suave de 1.5 segundos entre paletas.

## Prompt 15 — Tutorial y progresión

> El juego necesita un tutorial claro. Al empezar el firewall 1:
> - Aparece un mensaje de NEXUS explicando la mecánica básica (leer, resolver, avanzar).
> - Los primeros 2 puzzles son guiados paso a paso.
> - Al resolver el 3er puzzle, aparece un mensaje: "FIREWALL COMPLETADO — Presiona [ENTER] para continuar".
> - Añade panel de progreso visible en el HUD: "Puzzles: 2/3".
> - Añade botón explícito "Siguiente firewall" tras completar.
> - Si el jugador falla 2 veces seguidas, aparece una pista automática.

## Prompt 16 — Sistema de logros

> Implementa 20 logros desbloqueables según el spec. Cada logro tiene: id, título, descripción, icono, condición de desbloqueo. Se guardan en localStorage. Se muestran en una pantalla "Logros" con animación al desbloquear (toast que aparece arriba a la derecha).

## Prompt 17 — Estadísticas del jugador

> Añade pantalla de estadísticas al final de cada partida: tiempo, precisión, racha máxima, comandos escritos, logs encontrados, "estilo de juego" (analítico/impulsivo/perfeccionista/explorador). Todo persistente en localStorage.

## Prompt 18 — Secretos y meta-narrativa

> Añade secretos: (1) comentarios ocultos en HTML y CSS. (2) Konami code activa "modo Matrix". (3) Escribir `sudo su` da mensaje + bonus. (4) Escribir `42` da easter egg. (5) Mensaje de "Ghost, ¿estás bien?" si el jugador lleva 20 min sin pausa. (6) Saludo en la consola del navegador al abrir DevTools.

## Prompt 19 — Modo Ghost Protocol

> Añade modo "Ghost Protocol" desbloqueable al terminar el juego: sin timer visible, sin pistas, integridad 50, puzzles más difíciles. Al completarlo, mensaje secreto de Vera. Debe quedar marcado como logro especial.

## Prompt 20 — Pulido final

> Revisa TODOS los botones y añade: hover state con cambio de color + sonido sutil, click con animación de escala (0.95), focus visible para accesibilidad, y cursor custom. Añade tooltips a términos matemáticos que cambian según el dominio del jugador. Añade indicador discreto de "guardado automático" abajo a la derecha.

---

# 🎯 ORDEN RECOMENDADO

Si solo pudieras hacer 5, haz estas en este orden:

| # | Prompt | Por qué |
|---|---|---|
| **1** | 15 — Tutorial y progresión | Sin esto, el juego no se puede completar |
| **2** | 11 — Audio de 3 capas | Es lo que más impacto tiene en percepción |
| **3** | 14 — Paleta dinámica | Fácil de hacer, gran impacto visual |
| **4** | 12 — Voz sintetizada | Pega durísimo en la narrativa |
| **5** | 16 — Logros | Rejugabilidad + sensación de progreso |

Y después, cuando tengas eso funcionando, vas metiendo el resto.

---

# ⚠️ Advertencia importante

**No metas todo de golpe.** Si le pides a Antigravity 10 prompts seguidos, va a romper cosas. Mete **1-2 prompts, prueba, guarda commit de Git, y sigue**. Cada mejora debe poder probarse aislada.

Y si algo se rompe, tienes el commit anterior para volver. Por eso es clave tener Git bien configurado.

---

**Fin del documento.**