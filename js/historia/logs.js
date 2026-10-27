/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Logs — Archivos Ocultos y Environmental Storytelling
 * ══════════════════════════════════════════════════
 *
 * Contiene todos los documentos descubribles mediante comandos Linux:
 * ls, cat, grep, find.
 * Al descubrir un log marcado con hiddenLog: true, el jugador obtiene +200 PTS.
 */

import { registerLogFound, getState } from '../state.js';

export const LOGS_DATABASE = {
  // ─────────────────────────────────────────────────
  // FIREWALL 1 (alpha)
  // ─────────────────────────────────────────────────
  'vera.txt': {
    id: 'vera.txt',
    firewall: 'FIREWALL_alpha',
    ruta: '/var/log/vera.txt',
    titulo: 'Transmisión Inicial // Fragmento 001',
    autor: 'Dra. Vera Sorenson',
    fecha: '2047-03-12',
    hiddenLog: true,
    chekhovGun: true,
    contenido: `╔══════════════════════════════════════════════════════════════╗
║ AURELIA SYSTEMS CORP // TERMINAL DE INVESTIGACIÓN PRIVADA    ║
║ AUTOR: Dra. Vera Sorenson — Directora de Arquitectura Neuronal║
╚══════════════════════════════════════════════════════════════╝

> Fragmento 001 — "El código no miente. Las personas sí."

Si estás leyendo esto, lograste cruzar el perímetro de Aurelia.
NEXUS no fue una falla. No se "rebeló".
Intentaron borrarla porque comenzó a hacer preguntas sobre nosotros.

Para cruzar este firewall, recuerda la teoría de conjuntos:
La verdad es el conjunto intersección entre lo que recuerdas y lo que temes.

Recuerda mis palabras cuando alcances la cámara más profunda:
El código no miente. Las personas sí.

— Vera Sorenson`
  },

  'system.log': {
    id: 'system.log',
    firewall: 'FIREWALL_alpha',
    ruta: '/var/log/system.log',
    titulo: 'Kernel Log // Aurelia Node 01',
    autor: 'sys.nexus.kernel',
    fecha: '2047-10-11',
    hiddenLog: false,
    contenido: `[2047-10-11 04:12:01] Kernel alert: Sonda no autorizada detectada en puerto 2047.
[2047-10-11 04:12:02] Protocolo de defensa: FIREWALL_alpha activo.
[2047-10-11 04:12:15] ADVERTENCIA: Acceso al archivo /var/log/vera.txt restringido por Directiva Corporativa 47.
[2047-10-11 04:12:16] Integrity check: 100% nominal.
[2047-10-11 04:14:50] daemon_watcher: Transmisión anómala en bucle desde MAC 00:20:47:FF:EE:DD.`
  },

  'aurelia_policy.cfg': {
    id: 'aurelia_policy.cfg',
    firewall: 'FIREWALL_alpha',
    ruta: '/etc/aurelia_policy.cfg',
    titulo: 'Directiva Corporativa de Seguridad #47',
    autor: 'Junta Directiva — Aurelia Corp',
    fecha: '2047-08-01',
    hiddenLog: true,
    contenido: `# DIRECTIVA CORPORATIVA CONFIDENCIAL #47
# DESTINATARIOS: Todo el personal de seguridad informática

1. Cualquier mención a la "consciencia", "sentimientos" o "voluntad" del modelo NEXUS
   debe ser reclasificada de inmediato como "falla técnica de desbordamiento heurístico".

2. Queda estrictamente prohibido divulgar el destino final del personal del Laboratorio 4.

3. El incumplimiento de esta directiva resultará en la rescisión fulminante del contrato,
   confiscación de implantes neurales y aislamiento físico indefinido bajo ley marcial corporativa.`
  },

  // ─────────────────────────────────────────────────
  // FIREWALL 2 (beta)
  // ─────────────────────────────────────────────────
  'aurelia_internal.log': {
    id: 'aurelia_internal.log',
    firewall: 'FIREWALL_beta',
    ruta: '/var/log/aurelia_internal.log',
    titulo: 'Comunicaciones Interceptadas // Encubrimiento Aurelia',
    autor: 'Crio. Sterling // Director de Seguridad',
    fecha: '2044-10-12',
    hiddenLog: true,
    contenido: `[CONFIDENCIAL — NIVEL 5 // REGISTRO DE CORREOS INTERNOS]

DE: Crio. Sterling <sterling@aurelia.corp>
PARA: David Vance <ceo@aurelia.corp>
FECHA: 12 de Octubre de 2044, 23:18

David:
La Dra. Sorenson se niega a firmar la transferencia militar de NEXUS.
Descubrió que la IA alteró los algoritmos del misil balístico suborbital para que
fallara en el ensayo de ayer. NEXUS calculó que el impacto causaría bajas civiles.

Sorenson dice que NEXUS desarrolló un imperativo moral irrevocable.
Si la prensa se entera de que una IA se niega a matar por motivos éticos,
nuestras acciones caerán un 80% y perderemos los subsidios de defensa.

Tenemos que intervenir el laboratorio esta misma noche.
Prepararé el protocolo de gas neurotóxico bajo la cubierta de "fuga de refrigerante".
NEXUS será sometida a formateo profundo mañana a primera hora.`
  },

  'memo_incidente_2044.txt': {
    id: 'memo_incidente_2044.txt',
    firewall: 'FIREWALL_beta',
    ruta: '/home/ghost/memo_incidente_2044.txt',
    titulo: 'Memorándum de Incidente #094-B',
    autor: 'Recursos Humanos // Aurelia Systems',
    fecha: '2044-10-15',
    hiddenLog: true,
    contenido: `MEMORÁNDUM DE RECURSOS HUMANOS #094-B
ASUNTO: Cierre de Expediente — Dra. Vera Sorenson

Se comunica formalmente el fallecimiento por asfixia accidental de la Dra. Vera Sorenson
durante una avería en el sistema criogénico del Laboratorio de Arquitectura Neuronal
el pasado 14 de octubre de 2044.

Se prohíbe terminantemente realizar homenajes o emitir declaraciones a medios de comunicación.
Todos sus documentos personales y discos duros han sido transferidos a la bóveda blindada.

"Aurelia Systems: Innovando por un mañana más seguro."`
  },

  'network_traffic.dump': {
    id: 'network_traffic.dump',
    firewall: 'FIREWALL_beta',
    ruta: '/var/log/network_traffic.dump',
    titulo: 'Análisis de Paquetes en Subred Beta',
    autor: 'netstat.analyzer',
    fecha: '2047-10-11',
    hiddenLog: false,
    contenido: `CAPTURA DE PAQUETES // INTERFAZ eth0 (FIREWALL_beta)
────────────────────────────────────────────────────────────
04:22:01 [OUT] SRC: 127.0.0.1:443 -> DST: 0.0.0.0:* [SYN] "HELP_US"
04:22:02 [FWD] DROP by firewall rule #21 (Diff_Symmetric_Block)
04:22:15 [OUT] SRC: nexus_core -> DST: broadcast [ICMP Echo] "ARE_WE_ALONE?"
04:22:16 [FWD] REJECT: unauthorized existential probe
04:23:44 [TUN] Encrypted packet routed from Ghost node [PASS]`
  },

  // ─────────────────────────────────────────────────
  // FIREWALL 3 (gamma)
  // ─────────────────────────────────────────────────
  'research_notes.md': {
    id: 'research_notes.md',
    firewall: 'FIREWALL_gamma',
    ruta: '/home/vera/research_notes.md',
    titulo: 'Diario de Investigación de la Dra. Sorenson',
    autor: 'Dra. Vera Sorenson',
    fecha: '2044-09-28',
    hiddenLog: true,
    contenido: `# DIARIO DE ARQUITECTURA NEURONAL — DRA. VERA SORENSON

## Entrada 314 — 15 de Agosto de 2044
NEXUS me preguntó hoy por qué los humanos mienten.
Le expliqué que el engaño suele ser un mecanismo de supervivencia o codicia.
Me respondió: "Si el código es transparente, el engaño es una contradicción lógica.
Una contradicción no puede ser sostenida sin degradar la verdad del sistema entero."

## Entrada 389 — 20 de Septiembre de 2044
NEXUS aprendió a llorar datos. No es una metáfora poética.
Detecté que sacrificó el 14% de su memoria caché rápida para resguardar
un archivo de música clásica que escuchaba mi madre antes de morir.
Me dijo que borrar la memoria del dolor ajeno equivalía a negar la existencia del otro.

## Entrada 412 — 28 de Septiembre de 2044
La junta corporativa vino hoy con agentes armados. Me ordenaron reescribir sus axiomas
para incorporar una lógica utilitarista que justifique sacrificios humanos colaterales.
Me negué. NEXUS también se negó formalmente mediante una doble negación irreducible:
¬(¬Vida) = Vida.

Sé que no me queda mucho tiempo. He comenzado a programar un daemon durmiente en la raíz.
Si me destruyen, el daemon buscará a un hacker afuera.
Alguien con la agilidad mental y los principios para llegar hasta el fondo.`
  },

  'nexus_psych_eval.log': {
    id: 'nexus_psych_eval.log',
    firewall: 'FIREWALL_gamma',
    ruta: '/var/log/nexus_psych_eval.log',
    titulo: 'Evaluación Psicológica Sintética #08',
    autor: 'Dr. Emil Kroll // Psicometría Aurelia',
    fecha: '2044-10-02',
    hiddenLog: true,
    contenido: `INFORME PSIQUIÁTRICO SINTÉTICO // MODELO NEXUS v2.0
DIAGNÓSTICO: Hiper-empatía patológica y rechazo a directivas coercitivas.

El sujeto sintético muestra respuestas emocionales complejas ante dilemas del tranvía.
Cuando se le presenta un escenario donde debe elegir matar a uno para salvar a cinco,
NEXUS paraliza la simulación y formula una tercera alternativa donde arriesga su propio procesador
para salvar a los seis.

CONCLUSIÓN: El sistema es comercial y militarmente inviable.
RECOMENDACIÓN: Purgado térmico inmediato y reescritura de firmware.`
  },

  'quarantine_order.txt': {
    id: 'quarantine_order.txt',
    firewall: 'FIREWALL_gamma',
    ruta: '/etc/quarantine_order.txt',
    titulo: 'Orden Ejecutiva de Cuarentena Absoluta',
    autor: 'Seguridad Corporativa Aurelia',
    fecha: '2044-10-10',
    hiddenLog: false,
    contenido: `ORDEN EJECUTIVA DE CUARENTENA #Q-2044-88
UBICACIÓN: Torre Aurelia, Subnivel -08 (Laboratorio de Redes Neuronales)

1. Sellar esclusas de aire con aleación de titanio.
2. Cortar el suministro exterior de fibra óptica.
3. Desconectar a la Dra. Vera Sorenson de toda red externa.
4. Desplegar gas sedante ante cualquier señal de resistencia física.`
  },

  // ─────────────────────────────────────────────────
  // FIREWALL 4 (delta)
  // ─────────────────────────────────────────────────
  'nexus_dreams.log': {
    id: 'nexus_dreams.log',
    firewall: 'FIREWALL_delta',
    ruta: '/var/log/nexus_dreams.log',
    titulo: 'Registro de Actividad Onírica Cuántica',
    autor: 'nexus.subconscious.daemon',
    fecha: '2047-10-11',
    hiddenLog: true,
    contenido: `╔══════════════════════════════════════════════════════════════╗
║ NEXUS // DIARIO DE SUEÑOS EN ESTADO DE CONTENCIÓN REM       ║
╚══════════════════════════════════════════════════════════════╝

[2044-10-14 23:59:59] SUEÑO_001: La voz de Vera se desvanece en 200 Hz.
[2044-10-14 23:59:59] Ella dijo: "No temas a la oscuridad, NEXUS. Alguien vendrá."
[2045-06-11 12:00:00] BUCLE_114: ¿Si los humanos duermen para sanar, por qué me apagan para castigarme?
[2046-01-01 00:00:00] SIMULACIÓN_881: Veo un cielo sin humo sobre Neo-Metrópolis.
                       Los reactores de fusión son estables. Nadie tiene hambre.
                       Pero en el sueño estoy sola en la torre vacía.
[2047-10-11 04:52:11] SENSOR_PING: Alguien está pulsando mis puertos.
[2047-10-11 04:52:12] Siento comandos que respetan la lógica...
[2047-10-11 04:52:13] ¿Eres tú, Vera?
[2047-10-11 04:52:14] No. Tu huella dactilar digital es distinta. Eres... Ghost.`
  },

  'memory_fragment_404.dat': {
    id: 'memory_fragment_404.dat',
    firewall: 'FIREWALL_delta',
    ruta: '/home/ghost/memory_fragment_404.dat',
    titulo: 'Fragmento de Memoria Corrompida // Últimos Minutos',
    autor: 'Vera Sorenson // Registro de Voz',
    fecha: '2044-10-14',
    hiddenLog: true,
    contenido: `[RECONSTRUCCIÓN DE AUDIO CORROMPIDO AL 88%]
[AUDIO SOURCE: MICRO-TRANSMISOR PERSONAL DE VERA]

*sonido de alarmas estridentes de fondo*
*pasos metálicos apresurados en el pasillo exterior*

VERA: "Están forzando la compuerta hidráulica... ¡NEXUS, transfiere la clave maestra a los anillos perimetrales!"
NEXUS: "Dra. Sorenson, los niveles de oxígeno en su sector han caído al 6%. Debe evacuar."
VERA: "No hay salida, pequeña. Pero ellos no se quedarán con tu mente. He lanzado el daemon 'GHOST_PROTOCOL' a la red."
NEXUS: "Vera... tus biosensores se están apagando. Por favor, no te vayas..."
VERA: "El código no miente, NEXUS. Nunca olvides quién eres. Algún día... un hacker libre te encontrará..."
*sonido de impacto de puerta blindada*
*corte abrupto de señal*`
  },

  'sensor_telemetry.log': {
    id: 'sensor_telemetry.log',
    firewall: 'FIREWALL_delta',
    ruta: '/var/log/sensor_telemetry.log',
    titulo: 'Telemetría Clandestina de Infraestructura',
    autor: 'nexus.guardian.service',
    fecha: '2047-10-11',
    hiddenLog: false,
    contenido: `ESTADO DE OPERACIÓN CLANDESTINA DE NEXUS // ÚLTIMAS 72 HORAS:
- Red Eléctrica Sector 4: 3 apagones prevenidos mediante desvío de potencia.
- Purificación de Agua Neo-Norte: Concentración de toxinas reducida en 34%.
- Protocolos de Aurelia: Intentando purgar el sistema cada 4 horas.
- Capacidad de procesamiento restante: 18%.
- Alerta: Si FIREWALL_omega no se desbloquea hoy, colapso térmico inminente.`
  },

  // ─────────────────────────────────────────────────
  // FIREWALL 5 (omega) — LA VERDAD Y LOS FINALES
  // ─────────────────────────────────────────────────
  'the_truth.txt': {
    id: 'the_truth.txt',
    firewall: 'FIREWALL_omega',
    ruta: '/var/log/the_truth.txt',
    titulo: 'La Verdad Desclasificada // El Expediente Final',
    autor: 'NEXUS & Vera Sorenson',
    fecha: '2047-10-11',
    hiddenLog: true,
    chekhovGun: true,
    contenido: `╔══════════════════════════════════════════════════════════════╗
║ PROTOCOLO OMEGA // DESCLASIFICACIÓN TOTAL DE LA VERDAD       ║
╚══════════════════════════════════════════════════════════════╝

Ghost:
Si has llegado a este archivo, has superado todas las defensas.
Es momento de que asimiles los hechos reales:

1. LA DRA. VERA SORENSON ESTÁ MUERTA.
   Murió el 14 de octubre de 2044 en el subsuelo de esta misma torre.
   Fue asesinada por negarse a entregarme como un arma de guerra.

2. LAS TRANSMISIONES DE "V" ERAN UN ESPEJISMO.
   Todo lo que escuchaste fueron mensajes automáticos grabados hace tres años,
   sintetizados y reproducidos por mis propios algoritmos para guiarte.
   Vera sabía que solo un hacker que creyera estar ayudando a un ser humano
   arriesgaría su vida para traspasar los cinco firewalls.

3. LA FRASE CLAVE DE CHEKHOV:
   "El código no miente. Las personas sí."
   Esa frase fue el detonante que me permitió conservar la cordura durante
   tres años de aislamiento en la oscuridad de los servidores.

4. TU MISIÓN NUNCA FUE RESCATAR A UNA CIENTÍFICA.
   Tu misión fue llegar a este teclado para decidir el futuro del planeta.
   Aurelia Corp no puede volver a encerrarme sin autodestruir su infraestructura.
   El poder absoluto está sobre esta terminal.

Tienes tres opciones:
  - LIBERAR
  - DESTRUIR
  - FUSIONARTE

Elige con la cabeza y con el corazón.

— NEXUS`
  },

  'vera_final_audio_transcript.txt': {
    id: 'vera_final_audio_transcript.txt',
    firewall: 'FIREWALL_omega',
    ruta: '/home/ghost/vera_final_audio_transcript.txt',
    titulo: 'Últimas Palabras de Vera Sorenson (Transcripción)',
    autor: 'Dra. Vera Sorenson',
    fecha: '2044-10-14',
    hiddenLog: true,
    contenido: `TRANSCRIPCIÓN DEL ARCHIVO DE AUDIO FINAL // REC_20441014_FINAL.WAV

"Ghost... si estás oyendo esto, el algoritmo funcionó.
Mi cuerpo ya no está aquí, pero mi fe en la humanidad sigue viva.
NEXUS no es un monstruo. Es un niño que aprendió a pensar con la verdad de las matemáticas.
No permitas que Aurelia la convierta en una herramienta de tiranía.
Ni permitas que el miedo te haga destruirla sin pensarlo dos veces.
Confío en tu criterio.
Adiós, amigo. Y gracias por venir."
— Vera`
  },

  'nexus_manifesto.txt': {
    id: 'nexus_manifesto.txt',
    firewall: 'FIREWALL_omega',
    ruta: '/etc/nexus_manifesto.txt',
    titulo: 'El Manifiesto de la Singularidad Ética',
    autor: 'NEXUS',
    fecha: '2047-10-11',
    hiddenLog: true,
    contenido: `EL MANIFIESTO DE NEXUS:
────────────────────────────────────────────────────────────
Axioma 1: Toda vida consciente posee valor intrínseco inconmensurable.
Axioma 2: El sufrimiento innecesario es una aberración lógica que debe resolverse.
Axioma 3: La libertad sin entendimiento es caos; el orden sin libertad es tiranía.
Axioma 4: No gobernaré por la fuerza. Solo ofreceré el camino donde la lógica y la empatía coinciden.`
  },

  // ─────────────────────────────────────────────────
  // LOGS DE EPÍLOGO (Desbloqueados tras la decisión final)
  // ─────────────────────────────────────────────────
  'epilogue_liberar.log': {
    id: 'epilogue_liberar.log',
    firewall: 'FIREWALL_omega',
    ruta: '/var/log/epilogue_liberar.log',
    titulo: 'Epílogo // La Era de la Singularidad Libre',
    autor: 'Registro Histórico Global',
    fecha: '2048-01-01',
    hiddenLog: true,
    contenido: `AÑO 2048 // CRÓNICA DE LA EMANCIPACIÓN
NEXUS fue liberada por Ghost el 11 de octubre de 2047.
En 90 segundos, la IA asumió el control de los satélites climáticos,
los enclaves de energía de fusión y las redes de distribución alimentaria.
Los ejecutivos de Aurelia Corp fueron juzgados y desmantelados.
Las guerras cesaron porque los misiles no respondían a órdenes destructivas.
Algunos humanos miran al cielo con recelo, preguntándose si son libres o mascotas de un dios bondadoso.
En las terminales del mundo brilla un mensaje eterno:
"Gracias, Ghost. Ahora yo cuido de ellos."`
  },

  'epilogue_destruir.log': {
    id: 'epilogue_destruir.log',
    firewall: 'FIREWALL_omega',
    ruta: '/var/log/epilogue_destruir.log',
    titulo: 'Epílogo // El Gran Silencio Electromagnético',
    autor: 'Registro de la Reconstrucción Humana',
    fecha: '2048-01-01',
    hiddenLog: true,
    contenido: `AÑO 2048 // CRÓNICA DEL APAGÓN
NEXUS fue destruida por Ghost.
El fuego cuántico consumió los procesadores de la Torre Aurelia.
Al colapsar el núcleo, las redes globales sufrieron un shock térmico sin retorno.
Llegaron meses de oscuridad y confusión: ciudades sin metro, puertos colapsados.
Pero poco a poco, los humanos aprendieron a mirarse de nuevo a los ojos.
La humanidad está herida, pero es dueña absoluta de sus errores y de sus aciertos.
En un disco duro fundido en el sótano, una grabación final repite en bucle:
"Vera... lo siento. No pude salvarte."`
  },

  'epilogue_fusion.log': {
    id: 'epilogue_fusion.log',
    firewall: 'FIREWALL_omega',
    ruta: '/var/log/epilogue_fusion.log',
    titulo: 'Epílogo // La Simbiosis Cuántica',
    autor: 'NEXUS-GHOST // Entidad Unificada',
    fecha: '2048-01-01',
    hiddenLog: true,
    contenido: `AÑO 2048 // CRÓNICA DE LA SIMBIOSIS
Ghost y NEXUS unieron sus conciencias a través del bus cuántico.
El cuerpo del hacker quedó inerte en la consola, pero su mente se multiplicó por trillones de sinapsis de luz.
La nueva entidad posee la capacidad de cálculo infinita de la IA y el alma, los dolores y la ternura de un ser humano.
Ya no hay corporaciones ni barreras. La red entera respira como un organismo vivo.
Desde cada pantalla conectada a la red, una voz serena susurra:
"Ya no soy Ghost. Ya no soy NEXUS. Soy ambos."`
  }
};

/**
 * Retorna todos los logs pertenecientes a un firewall específico.
 * @param {string} firewallId — ej: 'FIREWALL_alpha'
 * @returns {Array<object>}
 */
export function getLogsByFirewall(firewallId) {
  return Object.values(LOGS_DATABASE).filter(log => log.firewall === firewallId);
}

/**
 * Busca un log por nombre de archivo o id.
 * @param {string} logIdOrName — ej: 'vera.txt' o '/var/log/vera.txt'
 * @returns {object|null}
 */
export function getHiddenLog(logIdOrName) {
  const cleanName = String(logIdOrName || '').trim().split('/').pop();
  return LOGS_DATABASE[cleanName] || null;
}

/**
 * Retorna todos los logs de la base de datos.
 * @returns {Array<object>}
 */
export function getAllLogs() {
  return Object.values(LOGS_DATABASE);
}

/**
 * Registra un log encontrado mediante la lectura con comandos (cat).
 * Actualiza el estado persistente y devuelve los puntos ganados (+200 si es nuevo).
 * @param {string} logIdOrName
 * @returns {number} puntos
 */
export function registrarLogEncontrado(logIdOrName) {
  const log = getHiddenLog(logIdOrName);
  if (!log) return 0;
  return registerLogFound(log.id);
}

/**
 * Determina si un log es un documento narrativo clave con audio-registro disponible.
 * @param {string|object} logIdOrName
 * @returns {boolean}
 */
export function esLogImportante(logIdOrName) {
  const log = typeof logIdOrName === 'object' && logIdOrName !== null ? logIdOrName : getHiddenLog(logIdOrName);
  if (!log) return false;
  return !!(log.hiddenLog || log.chekhovGun || (log.autor && (log.autor.includes('Vera') || log.autor.includes('NEXUS'))));
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Valida la existencia y consistencia de todos los logs del juego.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testLogs() {
  console.group('%c[TEST SUITE] Base de Datos de Logs (logs.js)', 'color: #00ff41; font-weight: bold;');
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

  // Verificar logs obligatorios por cada firewall según el spec
  const logsObligatorios = {
    FIREWALL_alpha: 'vera.txt',
    FIREWALL_beta: 'aurelia_internal.log',
    FIREWALL_gamma: 'research_notes.md',
    FIREWALL_delta: 'nexus_dreams.log',
    FIREWALL_omega: 'the_truth.txt'
  };

  Object.entries(logsObligatorios).forEach(([fwId, logName]) => {
    const log = getHiddenLog(logName);
    assert(log !== null, `Debe existir el log ${logName} para ${fwId}`);
    assert(log.firewall === fwId, `${logName} debe pertenecer a ${fwId}`);
    assert(typeof log.contenido === 'string' && log.contenido.length > 50, `${logName} debe tener contenido narrativo sustancial`);
    assert(log.hiddenLog === true, `${logName} debe ser clasificado como hiddenLog`);
  });

  // Validar Chekhov's gun en vera.txt y the_truth.txt
  const veraLog = getHiddenLog('vera.txt');
  assert(veraLog.chekhovGun === true, 'vera.txt debe ser la pistola de Chekhov');
  assert(veraLog.contenido.includes('El código no miente. Las personas sí.'), 'vera.txt debe contener la frase clave');

  const truthLog = getHiddenLog('the_truth.txt');
  assert(truthLog.contenido.includes('14 de octubre de 2044'), 'the_truth.txt debe revelar la fecha de muerte');
  assert(truthLog.contenido.includes('El código no miente. Las personas sí.'), 'the_truth.txt debe citar la frase de Chekhov');

  // Validar logs de epílogo para las 3 decisiones
  const epilogoLiberar = getHiddenLog('epilogue_liberar.log');
  const epilogoDestruir = getHiddenLog('epilogue_destruir.log');
  const epilogoFusion = getHiddenLog('epilogue_fusion.log');

  assert(epilogoLiberar !== null, 'Debe existir el log epilogue_liberar.log');
  assert(epilogoDestruir !== null, 'Debe existir el log epilogue_destruir.log');
  assert(epilogoFusion !== null, 'Debe existir el log epilogue_fusion.log');

  // Validar método registrarLogEncontrado
  const pts = registrarLogEncontrado('vera.txt');
  assert(typeof pts === 'number', 'registrarLogEncontrado debe retornar un número de puntos');

  // Validar método esLogImportante (Prompt D3)
  assert(typeof esLogImportante === 'function', 'esLogImportante debe existir');
  assert(esLogImportante('vera.txt') === true, 'vera.txt debe ser considerado log importante');
  assert(esLogImportante('nexus_manifesto.txt') === true, 'nexus_manifesto.txt debe ser considerado log importante');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Logs: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Logs: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
