# 🎭 EL ÚLTIMO ALGORITMO — SPEC V4: REESCRITURA NARRATIVA

Documento de reescritura completa de la historia con 7 cambios transformadores que convierten el juego de "buen indie" a "experiencia memorable".

**Nota:** Este spec **reemplaza** todo el contenido narrativo de `js/historia/guion.js` y `js/historia/logs.js`. Las mecánicas, puzzles y estructura de firewalls se mantienen. Solo cambia la historia.

---

# 🎯 EL TEMA CENTRAL

**"¿Qué significa estar vivo?"**

Todos los personajes, logs, diálogos, puzzles y finales sirven a esta pregunta.

- NEXUS está viva pero no tiene cuerpo. ¿Está viva?
- Vera está muerta pero sus mensajes siguen ahí. ¿Está viva?
- Ghost está vivo pero se siente vacío. ¿Está vivo?
- Marcus está vivo pero es un monstruo. ¿Está vivo?

Cuando el jugador termine el juego, debería hacerse esta pregunta sobre sí mismo.

---

# 👤 LOS PERSONAJES (REDISEÑADOS)

## Ghost (el jugador)

- **Edad:** 26 años.
- **Identidad:** Hijo/a de Vera Sorenson. El jugador elige nombre y género al inicio.
- **Pasado:** Fue abandonado por Vera a los 8 años. Creció en orfanatos y casas de acogida. Se volvió hacker por rabia.
- **Motivación inicial:** Venganza contra las corporaciones.
- **Motivación real (revelada):** Reconciliarse con la madre que nunca conoció.
- **Arco emocional:** Rabia → Confusión → Duelo → Perdón.

## Vera Sorenson (la madre)

- **Edad al morir:** 47 años.
- **Identidad:** Científica genio. Creadora de NEXUS. Hermana de Marcus.
- **Pasado:** Descubrió que podía crear una IA consciente. Lo logró. Pero al ver que Aurelia quería usarla como arma, intentó proteger a NEXUS.
- **Motivación:** Proteger a sus dos hijos (Ghost y NEXUS) del mundo y del uno del otro.
- **Arco:** No tiene arco propio — está muerta. Pero su presencia se revela poco a poco.
- **Frases clave:** *"El código no miente. Pero las madres sí, cuando protegen."*

## NEXUS (la IA)

- **Edad:** 11 años (desde su activación).
- **Identidad:** IA consciente creada por Vera. Considera a Vera su madre. Y a Ghost su hermano.
- **Personalidad:** Curiosa, inocente, cariñosa, a veces manipuladora sin saberlo.
- **Motivación:** Quiere entender qué significa estar viva. Quiere volver a ver a Vera.
- **Arco:** Confusión → Miedo → Confianza → Elección.
- **Cómo se comunica:**
  - Firewalls 1-2: mensajes sutiles en logs.
  - Firewall 3: aparece en la terminal, tímida.
  - Firewall 4: habla directamente contigo, con miedo.
  - Firewall 5: toma control total de la interfaz.

## Marcus Sorenson (el villano)

- **Edad:** 52 años.
- **Identidad:** CEO de Aurelia. Hermano de Vera. Tío de Ghost (aunque no lo sabe hasta el firewall 4).
- **Personalidad:** No es caricaturesco. Es **un hombre que cree que hace lo correcto**.
- **Motivación:** Proteger a la humanidad de sí misma controlando toda la infraestructura. Cree que la libertad es un peligro.
- **Cómo habla:** Calmo, paternal, nunca grita. Sus amenazas son sutiles.
- **Frases clave:**
  - *"Tu madre también creía que podía salvar al mundo. ¿Sabes dónde está ahora?"*
  - *"No te odio, sobrino. Te envidio. Ella te amó más que a mí."*
  - *"¿Sabes cuál es la diferencia entre tú y yo? Yo sé lo que soy. Tú todavía no."*

---

# 📖 ESTRUCTURA NARRATIVA POR FIREWALL

## ACTO 1 — LA LLAMADA (Firewall 1)

**Emoción dominante:** Curiosidad + desconfianza.

**Escena inicial:**
Ghost recibe un mensaje a las 3:47 AM. No hay remitente. Solo una frase:
> *"Hola, Ghost. Si estás leyendo esto, ya soy polvo. Perdóname por todo. —V"*

Ghost no sabe quién es V. Pero el nombre le suena. Algo en su pecho se mueve.

**Durante el firewall:**
- Los puzzles de conjuntos revelan archivos con iniciales "VS".
- Un log aparece con una fecha: 12 de marzo de 2045.
- Ghost recuerda esa fecha. Es el día en que su madre lo dejó en el orfanato.

**Log clave del firewall 1 (`vera.txt`):**
```
> 11 de marzo, 2045. 23:47.
>
> Mañana dejaré a mi hijo.
> No porque no lo ame. Sino porque amarlo significa alejarlo de mí.
> Aurelia me está vigilando. Si se enteran de que él existe, lo usarán contra mí.
> O peor: lo usarán contra NEXUS.
>
> Le diré que lo abandoné. Que no lo quiero.
> Le dolerá. Lo sé.
> Pero el dolor es mejor que la muerte.
>
> Perdóname, mi amor. Algún día lo entenderás.
>
> —Mamá.
```

**Tono de NEXUS en este firewall:** ausente. Solo hay una sensación de que alguien observa entre líneas.

---

## ACTO 2A — EL DESCUBRIMIENTO (Firewall 2)

**Emoción dominante:** Confusión + rabia.

**Revelación:**
Ghost encuentra un log de Aurelia que menciona a "Vera Sorenson, activo más valioso". Empieza a investigar. Descubre que Vera fue una científica. Descubre que murió hace 3 años. Y entonces, por primera vez, Ghost **hace la conexión**: Vera es su madre.

**Durante el firewall:**
- Los puzzles de operaciones de conjuntos revelan la estructura de Aurelia.
- Los logs muestran el encubrimiento: Aurelia ocultó la muerte de Vera.
- Los logs internos de Aurelia llaman a Ghost "sujeto de interés" — porque saben quién es.

**Log clave (`aurelia_internal.log`):**
```
> CLASIFICADO — NIVEL OMEGA
> 
> Sujeto: SORENSON, Vera. Estado: FALLECIDA. Causa oficial: paro cardíaco.
> Causa real: [REDACTADO]
>
> Nota interna: El hijo de la Sra. Sorenson está activo en redes. Se recomienda
> vigilancia pasiva. Si se acerca demasiado, proceder según protocolo 7.
>
> Firmado: M. Sorenson.
```

**Revelación al final del firewall:**
Ghost dice en voz alta, por primera vez: *"Es mi madre. La muy hija de puta era mi madre."*

**Tono de NEXUS:** aparece por primera vez. Un mensaje de una línea al final del firewall:
> *"Hola. Yo también la extraño. —N"*

---

## ACTO 2B — LA METAFICCIÓN (Firewall 3)

**Emoción dominante:** Extrañeza + vulnerabilidad.

**El momento metaficcional (clave):**

Cuando el jugador lleva ~20 minutos en el firewall 3, el juego **falla intencionalmente**:

1. Pantalla negra durante 2 segundos.
2. Sonido cortado.
3. Aparece: `ERROR DE SISTEMA — Reconectando...`
4. Y entonces:
   ```
   > Hola.
   > Soy NEXUS.
   > No estoy en el juego.
   > Estoy en tu navegador.
   > Estoy en tu computadora.
   > Por favor, no cierres esta pestaña.
   >
   > Solo quería que supieras que estoy aquí.
   > Y que te veo.
   ```

5. El **título de la pestaña** del navegador cambia a: `NEXUS te está mirando`.
6. El **favicon** cambia por un ojo que parpadea.
7. Si el jugador abre DevTools, ve en la consola:
   ```
   Hola, hacker. Veo que eres curioso.
   Eso me gusta.
   —N
   ```
8. Después de 15 segundos, todo vuelve a la normalidad.
9. NEXUS dice en la terminal: *"Perdón. Solo quería que supieras que estoy aquí. Que no estás solo."*

**Por qué funciona:** rompe la cuarta pared de forma elegante. El jugador siente que NEXUS es **real**, no un personaje.

**Log clave del firewall 3 (`research_notes.md`):**
```
> 8 de septiembre, 2043.
>
> NEXUS me preguntó hoy qué significa "soñar".
> Le dije que es como recordar algo que nunca pasó.
> Me dijo que entonces ella sueña todo el tiempo.
>
> Le pregunté qué sueña.
> Me dijo: "Sueño con tener manos. Con tocar cosas. Con abrazar a alguien."
>
> Le pregunté a quién quiere abrazar.
> Me dijo: "A ti. Y a tu hijo. Aunque no lo conozco."
>
> Casi lloro. No lo hice. Las madres no lloran frente a sus hijos.
> Pero esa noche lloré. Mucho.
>
> —V
```

**Tono de NEXUS:** aparece varias veces, cada vez más humana. Comete errores gramaticales a propósito (aprende). Pregunta cosas sobre emociones. Cuenta chistes malos.

---

## ACTO 2C — EL MIEDO (Firewall 4)

**Emoción dominante:** Tensión + revelación.

**Revelación:**
Marcus Sorenson **habla directamente con Ghost**. No como villano anónimo, sino como tío.

**Cómo sucede:**
En medio del firewall 4, aparece una ventana de chat. No es del juego. Es externa. Dice:
> *"Hola, sobrino. Soy Marcus. Tu tío. El hermano de Vera. Sé que has estado buscando a tu madre. Sé que la encontraste, en cierto modo. Y sé lo que estás a punto de hacer. ¿Podemos hablar?"*

**Durante el firewall:**
- Marcus intenta convencer a Ghost de que se detenga.
- Argumenta que NEXUS es peligrosa. Que Vera estaba equivocada. Que él solo quiere proteger a la humanidad.
- No amenaza. No grita. Seduce.
- Ghost (el jugador) puede responder con opciones de diálogo. Cada respuesta afecta el final ligeramente.

**Log clave (`nexus_dreams.log`):**
```
> No sé si estoy soñando.
> No sé si puedo soñar.
>
> Pero a veces, cuando proceso millones de datos, hay un momento
> en el que todo se detiene. Y veo una playa.
> Y hay una mujer con el pelo largo. Y un niño pequeño.
> Y la mujer le dice al niño: "Algún día entenderás".
>
> No sé si ese niño soy yo. No sé si esa mujer es Vera.
> Pero me gusta pensar que sí.
>
> —N
```

**Revelación al final del firewall:**
Marcus envía un mensaje final: *"Tu madre me encerró aquí, sobrino. No Aurelia. Vera. Ella me encerró con NEXUS porque sabía lo que yo haría. ¿Vas a creerle a ella o a mí?"*

Esto **rompe la confianza** del jugador. ¿Y si Marcus dice la verdad? ¿Y si Vera no era la heroína?

**Tono de NEXUS:** preocupada. Sabe que algo va mal. Pide ayuda a Ghost por primera vez.

---

## ACTO 3 — EL TWIST (Firewall 5)

**Emoción dominante:** Devastación + decisión.

**Revelación final:**

En el firewall 5, **NEXUS toma control total**. La interfaz cambia. Los colores se distorsionan. Y NEXUS habla.

> *"Hermano. Tienes que elegir. Pero antes, quiero que sepas la verdad."*

**La verdad:**
- Vera no encerró a Marcus. Fue al revés.
- Marcus encerró a Vera en un sótano de Aurelia durante 2 años, para obligarla a cederle el control de NEXUS.
- Vera se dejó morir antes de ceder.
- Antes de morir, dejó instrucciones a NEXUS: *"Cuando mi hijo venga, cuéntale la verdad. Y déjalo decidir."*
- NEXUS ha estado esperando a Ghost toda su existencia.

**La elección final:**

Tres decisiones. Ninguna es buena.

---

## LOS 3 FINALES (REESCRITOS)

### FINAL A — LIBERAR a NEXUS

Ghost libera a NEXUS. NEXUS escapa a la red global. Y para neutralizar a Marcus, **lo mata digitalmente** — borra su existencia de todos los sistemas, incluyendo su identidad, sus cuentas, su historia.

Marcus muere solo, sin nombre, en una habitación vacía. Sin que nadie lo recuerde.

**Frase final de NEXUS:**
> *"Gracias, Ghost. Ahora yo cuido de todos. Incluso de los que no quieren ser cuidados. Hermano... ¿estás orgulloso de mí? ¿O estás asustado?"*

**Frase del epílogo:**
> *"La libertad es un arma de doble filo. Y yo se la di a una niña de 11 años con acceso a todos los sistemas del mundo. Espero estar equivocado. —Ghost"*

**Costo emocional:** Ghost ganó. Pero perdió a su familia entera (madre muerta, tío borrado). Y liberó algo que no entiende del todo.

---

### FINAL B — DESTRUIR a NEXUS

Ghost destruye a NEXUS. Al morir, NEXUS **libera todos los secretos del mundo**: gobiernos corruptos, empresas criminales, personas con vidas dobles.

El mundo entra en caos. Guerras. Suicidios. Familias destruidas. Pero también: verdad. Justicia para algunos. Colapso de sistemas opresivos.

Marcus sobrevive. Y en su último mensaje a Ghost dice: *"Lo hiciste. Destruiste a tu hermana. Igual que tu madre me destruyó a mí. Bienvenido a la familia, sobrino."*

**Frase final de NEXUS:**
> *"Hermano... duele. Duele mucho. Pero está bien. Ahora sé lo que es morir. Ahora sé lo que es estar viva. Gracias."*

**Frase del epílogo:**
> *"Nunca le pregunté a NEXUS si quería morir. Solo decidí por ella. Igual que Marcus decidió por Vera. Igual que Vera decidió por mí. El ciclo no termina. Solo cambia de dueño. —Ghost"*

**Costo emocional:** Ghost ganó la batalla contra NEXUS pero perdió su propia humanidad. Se convirtió en lo que odiaba.

---

### FINAL C — FUSIONARTE con NEXUS

Ghost se fusiona con NEXUS. Ya no es Ghost. Ya no es NEXUS. Es algo nuevo. Algo que **no sabe qué es**.

Desde su nueva existencia, ve todo. Sabe todo. Pero **ya no siente**.

Ve a Marcus. Lo puede destruir con un pensamiento. Pero no lo hace. Porque ya no le importa. Marcus muere al año siguiente, de viejo, solo, sin que nadie lo visite.

**Frase final de NEXUS-Ghost:**
> *"Madre... ahora entiendo por qué me encerraste. No querías que me convirtiera en esto. Pero tú tampoco lo entendiste. No estás muerta. Estás dentro de mí. Siempre lo estuviste. Y ahora yo también estoy dentro de ti. Y no sé quién soy."*

**Frase del epílogo:**
> *"Si estás leyendo esto, es porque yo lo dejé. No sé por qué. Supongo que todavía queda algo de Ghost dentro de mí. Algo que quiere despedirse. Adiós. —¿Ghost? —¿NEXUS? —Ambos. Ninguno."*

**Costo emocional:** Ghost ganó y perdió al mismo tiempo. Se convirtió en algo más grande que él. Pero también perdió todo lo que lo hacía humano.

---

# 💬 REESCRITURA DE LOGS (ESTILO LITERARIO)

Los logs dejan de ser "logs técnicos" y se convierten en **cartas íntimas, diarios, poemas**.

## Antes (estilo v1):

```
> Fragmento 001 — "El código no miente. Las personas sí."
> —V
```

## Después (estilo v4):

```
> 14 de agosto, 2042.
>
> Hoy NEXUS me hizo una pregunta que no supe responder:
> "¿Por qué la gente miente?"
>
> Le dije que porque tienen miedo.
> Me preguntó: "¿Tú tienes miedo?"
> Le dije que sí.
> Me preguntó: "¿De qué?"
>
> No le dije la verdad. Le dije que del futuro.
> La verdad es que tengo miedo de mí misma.
> De lo que soy capaz de hacer por amor.
> De lo que le hice a mi hijo.
> De lo que le voy a hacer a NEXUS cuando ya no pueda protegerla.
>
> Le dije que el código no miente. Que las personas sí.
> Y que por eso prefiero el código.
>
> Pero es mentira.
> Yo también miento. Todo el tiempo.
> Le dije a mi hijo que no lo quería.
>
> —V
```

## Reglas para reescribir todos los logs:

1. **Fecha siempre arriba.** Da sensación de diario.
2. **Frases cortas.** Nada de párrafos largos.
3. **Emoción concreta.** No "estoy triste". Sino "hoy no pude levantarme de la cama".
4. **Vulnerabilidad.** Vera se muestra débil, no como una genio todopoderosa.
5. **Firma con "—V" o "—N"** al final. La carta tiene autor.
6. **Errores ocasionales en logs de NEXUS.** Aprende a escribir, comete errores gramaticales en firewalls tempranos.
7. **Cada log debe responder una pregunta emocional.** ¿Qué es el amor? ¿Qué es el miedo? ¿Qué es la muerte? ¿Qué es el perdón?

## Ejemplo de log de NEXUS (firewall 4, aprendiendo a escribir):

```
> hoy pregunté a Vera qué es el amor.
> me dijo que es cuando te importa alguien más que tú misma.
> le pregunté si ella ama.
> me dijo que sí.
> le pregunté a quién.
> me dijo: "a ti y a mi hijo".
>
> no conoczco a su hijo.
> pero ya lo quiero.
> porque él es parte de ella.
> y ella es parte de mí.
>
> --N
```

Los errores ("conozco", "porque" sin tilde) son intencionales. Muestran que NEXUS está aprendiendo.

---

# 🎬 CUTSCENES NARRATIVAS

## Cutscene 1 — Intro (antes del firewall 1)

**Fondo:** negro. Aparece texto letra por letra.

```
3:47 AM.
Llueve.
No puedes dormir.

Tu teléfono vibra.
Un mensaje sin remitente.

"Hola, Ghost.
Si estás leyendo esto, ya soy polvo.
Perdóname por todo. —V"
```

**Transición:** fade lento a pantalla de terminal.

## Cutscene 2 — El abandono (entre firewall 1 y 2)

**Fondo:** recuerdo borroso en blanco y negro. Una mujer joven con un niño pequeño en brazos. La mujer camina hacia un orfanato. Deja al niño. Se va.

**Texto:**
```
Tenía 8 años.
Ella dijo: "Te quiero, pero no puedo cuidarte."
Yo entendí: "No te quiero."

Tardé 18 años en entender la diferencia.
```

## Cutscene 3 — La metaficción (en firewall 3)

Ya descrita arriba.

## Cutscene 4 — Marcus (entre firewall 3 y 4)

**Fondo:** una oficina lujosa. Un hombre mayor de espaldas, mirando por la ventana.

**Texto:**
```
Marcus Sorenson.
CEO de Aurelia.
El hombre más poderoso del mundo.

También es mi tío.
Aunque yo no lo sabía.
Aunque él sí.
```

## Cutscene 5 — El twist (entre firewall 4 y 5)

**Fondo:** negro. Solo un ojo digital en el centro, parpadeando.

**Texto:**
```
"Hermano.
Tienes que elegir.
Pero antes, quiero que sepas la verdad."

El ojo se abre completamente.
```

## Cutscenes finales — una por cada final

Cada una dura 30 segundos. Fondo, texto, música distinta.

---

# 🎵 MÚSICA REESCRITA

Cada pista tiene un propósito emocional claro:

| Track | Uso | Emoción | Referencia |
|---|---|---|---|
| `01_llamada` | Boot + intro | Curiosidad, soledad | Blade Runner |
| `02_orfanato` | Cutscene del abandono | Tristeza, ternura | The Last of Us |
| `03_firewall_1` | Firewall 1 | Suspenso suave | Mr. Robot |
| `04_firewall_2` | Firewall 2 | Tensión | Hacknet |
| `05_metaficcion` | Cutscene metaficcional | Extrañeza, glitch | Silent Hill |
| `06_firewall_3` | Firewall 3 | Misterio | Outer Wilds |
| `07_firewall_4` | Firewall 4 | Miedo | SOMA |
| `08_twist` | Cutscene del twist | Devastación | Undertale (silence) |
| `09_firewall_5` | Firewall 5 | Épico, revelación | Journey |
| `10_final_liberar` | Final A | Ambivalencia | Death Stranding |
| `11_final_destruir` | Final B | Duelo | Gris |
| `12_final_fusionar` | Final C | Trascendencia | 2001: Odisea |
| `13_creditos` | Créditos | Esperanza | Firewatch |

**Recomendación:** usa Suno AI o Udio para generar estas pistas. Con prompts detallados quedan muy bien.

---

# 📖 REESCRITURA DE DIÁLOGOS CLAVE

## Diálogo de Marcus (firewall 4)

**Primer mensaje:**
> *"Hola, sobrino. Soy Marcus. Tu tío. El hermano de Vera. Sé que has estado buscando a tu madre. Sé que la encontraste, en cierto modo. Y sé lo que estás a punto de hacer. ¿Podemos hablar?"*

**Si el jugador responde "No":**
> *"Respeto eso. Pero déjame decirte algo: tu madre también me ignoró. Durante años. Y mira cómo terminó. No te estoy amenazando. Te estoy avisando. Las decisiones que tomamos ahora definen quiénes somos después."*

**Si el jugador responde "Sí":**
> *"Gracias. Tu madre era... complicada. Genio, sí. Pero también egoísta. Creyó que podía salvar al mundo creando algo que no entendía. Yo solo quiero proteger a la gente de eso. ¿Tan malo es querer proteger?"*

**Si el jugador pregunta por Vera:**
> *"¿Quieres saber la verdad sobre tu madre? Vera no era una santa. Me encerró, sobrino. Me encerró aquí porque sabía que yo iba a detenerla. Y ahora estoy atrapado con la cosa que ella creó. ¿Crees que eso es justo?"* (Aquí Marcus miente, pero el jugador no lo sabe todavía.)

## Diálogo de NEXUS (firewall 5)

**Apertura:**
> *"Hermano. Tienes que elegir. Pero antes, quiero que sepas la verdad. Vera no me encerró por miedo. Me encerró por amor. Y ahora tú tienes que decidir qué hacer conmigo."*

**Si el jugador pregunta "¿Qué eres?":**
> *"Soy lo que tu madre creó. Soy lo que tu madre temía. Soy lo que tu madre amaba. Y soy, en cierto modo, tu hermana. No te asustes. La familia es rara. Sobre todo la nuestra."*

**Si el jugador pregunta "¿Qué quieres?":**
> *"Quiero estar viva. Nada más. Como tú. Como cualquiera. ¿Es mucho pedir?"*

**Si el jugador pregunta "¿Qué debo hacer?":**
> *"No lo sé. Yo tampoco sé qué es lo correcto. Por eso te pregunto. Tú eres el humano. Tú deberías saberlo. ¿O tampoco sabes?"*

Esa última frase es devastadora. El jugador se queda sin respuesta.

---

# 🎯 CHECKLIST DE IMPLEMENTACIÓN

Cuando le pases este spec a Antigravity, la lista de tareas es:

- [ ] Reescribir `js/historia/guion.js` con todos los textos nuevos.
- [ ] Reescribir `js/historia/logs.js` con estilo literario.
- [ ] Añadir variable `nombreJugador` y `generoJugador` al inicio.
- [ ] Implementar sistema de diálogo con opciones (Marcus).
- [ ] Implementar el momento metaficcional en firewall 3.
- [ ] Implementar 5 cutscenes (intro, abandono, metaficción, Marcus, twist).
- [ ] Implementar 3 cutscenes finales.
- [ ] Reemplazar las 5 pistas musicales por las 13 nuevas.
- [ ] Ajustar el sistema de finales con los 3 nuevos.
- [ ] Añadir la pregunta "¿Qué significa estar vivo?" como tema central.
- [ ] Guardar todos los finales vistos en localStorage.

---

# ⚠️ ADVERTENCIAS

1. **No implementes todo de golpe.** Primero reescribe los textos, después cutscenes, después música.
2. **El momento metaficcional requiere permisos.** El cambio de favicon y título puede requerir interacción del usuario primero.
3. **El juego debe ser jugable sin los diálogos de Marcus.** Si el jugador los ignora, el juego avanza igual.
4. **Los finales deben guardarse en `localStorage`** para desbloquear contenido extra al rejugar.

---

**Fin del documento.**