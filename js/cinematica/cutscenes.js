/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Sistema de Cutscenes Cinemáticas V4 (Canvas + CSS)
 * Especificación: SPEC_V4.MD (Sección Cutscenes Narrativas)
 * ══════════════════════════════════════════════════
 *
 * Motor cinemático híbrido HTML Canvas + animaciones CSS con transiciones fluidas:
 * - Programación de las 5 cutscenes clave del Spec V4:
 *   1. Intro (el mensaje inicial a las 3:47 AM).
 *   2. Recuerdo del orfanato (el abandono a los 8 años).
 *   3. El salto metaficcional.
 *   4. La presentación de Marcus Sorenson.
 *   5. El gran twist previo al Firewall 5 (el ojo digital parpadeando con la verdad sobre el encierro).
 * - Renderizado procedural en Canvas 2D (lluvia de medianoche, recuerdo B/N borroso,
 *   glitch metaficcional, ventanal de oficina lujosa y ojo digital parpadeando).
 * - Animación letra por letra con cursor parpadeante y transiciones CSS suaves.
 */

import { audio, speechEngine } from '../audio.js';
import { adaptarTextoProtagonista } from '../historia/guion.js';

// ─────────────────────────────────────────────────
// 1. ILUSTRACIONES VECTORIALES Y ARTE CINEMÁTICO (SVG)
// ─────────────────────────────────────────────────

export const ARTE_CINEMATICO = {
  // Cutscene 1 (Escena A): Reloj a las 3:47 AM bajo la lluvia y teléfono vibrando
  reloj_medianoche: `
    <svg width="340" height="200" viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <rect x="20" y="30" width="300" height="140" rx="10" fill="#080d09" stroke="#00ff41" stroke-width="2" stroke-opacity="0.6"/>
      <rect x="30" y="40" width="280" height="120" rx="6" fill="#030604"/>
      <line x1="30" y1="70" x2="310" y2="70" stroke="#00ff41" stroke-width="0.5" stroke-opacity="0.15"/>
      <line x1="30" y1="100" x2="310" y2="100" stroke="#00ff41" stroke-width="0.5" stroke-opacity="0.15"/>
      <line x1="30" y1="130" x2="310" y2="130" stroke="#00ff41" stroke-width="0.5" stroke-opacity="0.15"/>
      <text x="170" y="112" font-family="monospace" font-size="44" font-weight="bold" fill="#00ff41" text-anchor="middle" filter="drop-shadow(0 0 10px #00ff41)">
        03:47 AM
      </text>
      <text x="170" y="144" font-family="sans-serif" font-size="11" fill="#00d9ff" text-anchor="middle" letter-spacing="3">
        LLUEVE // NO PUEDES DORMIR
      </text>
      <circle cx="50" cy="55" r="4" fill="#ff0040">
        <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
      </circle>
      <text x="62" y="59" font-family="monospace" font-size="9" fill="#ff0040">MENSAJE SIN REMITENTE</text>
    </svg>
  `,

  // Cutscene 1 (Escena B): Paquete cuántico clandestino en el puerto 2047
  paquete_puerto_2047: `
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <circle cx="160" cy="110" r="85" stroke="#00d9ff" stroke-width="1.5" stroke-dasharray="8 6" stroke-opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 160 110" to="360 160 110" dur="12s" repeatCount="indefinite"/>
      </circle>
      <circle cx="160" cy="110" r="60" stroke="#00ff41" stroke-width="1.2" stroke-dasharray="4 4" stroke-opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from="360 160 110" to="0 160 110" dur="8s" repeatCount="indefinite"/>
      </circle>
      <polygon points="160,70 195,90 195,130 160,150 125,130 125,90" fill="rgba(0, 217, 255, 0.15)" stroke="#00d9ff" stroke-width="2"/>
      <line x1="160" y1="70" x2="160" y2="110" stroke="#00d9ff" stroke-width="1.5"/>
      <line x1="160" y1="110" x2="195" y2="130" stroke="#00d9ff" stroke-width="1.5"/>
      <line x1="160" y1="110" x2="125" y2="130" stroke="#00d9ff" stroke-width="1.5"/>
      <text x="160" y="195" font-family="monospace" font-size="12" font-weight="bold" fill="#00d9ff" text-anchor="middle" letter-spacing="2">
        MENSAJE DE VERA SORENSON (—V)
      </text>
      <text x="160" y="210" font-family="monospace" font-size="9" fill="#8fbc8f" text-anchor="middle">
        [SI ESTÁS LEYENDO ESTO, YA SOY POLVO]
      </text>
    </svg>
  `,

  // Cutscene 1/5: Torre Aurelia Systems
  torre_aurelia_bloqueada: `
    <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <polygon points="170,20 185,50 185,210 155,210 155,50" fill="#090f0b" stroke="#ff0040" stroke-width="1.5"/>
      <polygon points="120,110 155,110 155,210 120,210" fill="#060a07" stroke="#ff0040" stroke-width="1" stroke-opacity="0.4"/>
      <polygon points="220,130 185,130 185,210 220,210" fill="#060a07" stroke="#ff0040" stroke-width="1" stroke-opacity="0.4"/>
      <polygon points="170,35 70,210 110,210" fill="rgba(255, 0, 64, 0.12)">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="170,35 230,210 270,210" fill="rgba(255, 0, 64, 0.12)">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <circle cx="170" cy="20" r="5" fill="#ff0040" filter="drop-shadow(0 0 10px #ff0040)">
        <animate attributeName="r" values="3;7;3" dur="1s" repeatCount="indefinite"/>
      </circle>
      <text x="170" y="215" font-family="monospace" font-size="11" font-weight="bold" fill="#ff0040" text-anchor="middle" letter-spacing="2">
        AURELIA SYSTEMS CORP // SÓTANO NIVEL OMEGA
      </text>
    </svg>
  `,

  // Retrato memorial holográfico de la Dra. Vera Sorenson
  vera_memorial: `
    <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <circle cx="160" cy="95" r="75" stroke="#00d9ff" stroke-width="1" stroke-dasharray="6 4" stroke-opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 160 95" to="360 160 95" dur="16s" repeatCount="indefinite"/>
      </circle>
      <path d="M160 55 C145 55 135 68 135 85 C135 102 145 115 160 115 C175 115 185 102 185 85 C185 68 175 55 160 55 Z" fill="rgba(0, 217, 255, 0.2)" stroke="#00d9ff" stroke-width="1.5"/>
      <path d="M125 155 C125 125 140 120 160 120 C180 120 195 125 195 155 Z" fill="rgba(0, 217, 255, 0.15)" stroke="#00d9ff" stroke-width="1.5"/>
      <line x1="110" y1="75" x2="210" y2="75" stroke="#00d9ff" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="105" y1="105" x2="215" y2="105" stroke="#00d9ff" stroke-width="0.8" stroke-opacity="0.4"/>
      <line x1="115" y1="135" x2="205" y2="135" stroke="#00d9ff" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="160" y="185" font-family="monospace" font-size="12" font-weight="bold" fill="#ff0040" text-anchor="middle" letter-spacing="1">
        DRA. VERA SORENSON [14.10.2044]
      </text>
      <text x="160" y="202" font-family="monospace" font-size="9" fill="#8fbc8f" text-anchor="middle">
        SACRIFICIO EN EL SÓTANO // AMOR MATERNAL
      </text>
    </svg>
  `,

  // Conciencia primaria de NEXUS
  nexus_conciencia: `
    <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <circle cx="170" cy="105" r="90" stroke="#00ff41" stroke-width="0.8" stroke-opacity="0.2"/>
      <circle cx="170" cy="105" r="65" stroke="#00ff41" stroke-width="1.2" stroke-dasharray="10 5" stroke-opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 170 105" to="360 170 105" dur="10s" repeatCount="indefinite"/>
      </circle>
      <circle cx="170" cy="105" r="40" stroke="#00d9ff" stroke-width="1.5">
        <animate attributeName="r" values="36;44;36" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <polygon points="170,85 185,105 170,125 155,105" fill="#00ff41" filter="drop-shadow(0 0 15px #00ff41)"/>
      <circle cx="170" cy="105" r="5" fill="#ffffff"/>
      <text x="170" y="195" font-family="monospace" font-size="13" font-weight="bold" fill="#00ff41" text-anchor="middle" letter-spacing="3">
        NEXUS // HERMANA SINTÉTICA (11 AÑOS)
      </text>
      <text x="170" y="210" font-family="monospace" font-size="9" fill="#00d9ff" text-anchor="middle">
        ¿QUÉ SIGNIFICA ESTAR VIVO?
      </text>
    </svg>
  `,

  // Cutscene 2 (V4): Recuerdo borroso en B/N del orfanato y el abandono a los 8 años
  orfanato_abandono: `
    <svg width="350" height="220" viewBox="0 0 350 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <defs>
        <filter id="blurMemory" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.1"/>
        </filter>
      </defs>
      <!-- Rejas del orfanato en blanco y negro -->
      <g stroke="#9ca3af" stroke-opacity="0.45" stroke-width="2">
        <line x1="45" y1="30" x2="45" y2="175"/>
        <line x1="75" y1="30" x2="75" y2="175"/>
        <line x1="105" y1="30" x2="105" y2="175"/>
        <line x1="245" y1="30" x2="245" y2="175"/>
        <line x1="275" y1="30" x2="275" y2="175"/>
        <line x1="305" y1="30" x2="305" y2="175"/>
        <line x1="35" y1="55" x2="315" y2="55"/>
      </g>
      <!-- Arco del orfanato -->
      <path d="M105 70 Q175 25 245 70" stroke="#e5e7eb" stroke-width="2" stroke-opacity="0.6" fill="none"/>
      <!-- Silueta de niño pequeño de 8 años junto a la entrada -->
      <g filter="url(#blurMemory)">
        <circle cx="150" cy="118" r="10" fill="#f3f4f6" fill-opacity="0.88"/>
        <path d="M137 168 L142 130 L158 130 L163 168 Z" fill="#d1d5db" fill-opacity="0.85"/>
        <!-- Silueta de la madre (Vera) alejándose en la niebla -->
        <circle cx="215" cy="92" r="12" fill="#9ca3af" fill-opacity="0.55">
          <animate attributeName="fill-opacity" values="0.65;0.25;0.65" dur="4s" repeatCount="indefinite"/>
        </circle>
        <path d="M198 168 L204 106 L226 106 L232 168 Z" fill="#9ca3af" fill-opacity="0.45">
          <animate attributeName="fill-opacity" values="0.55;0.2;0.55" dur="4s" repeatCount="indefinite"/>
        </path>
      </g>
      <line x1="25" y1="172" x2="325" y2="172" stroke="#d1d5db" stroke-width="1" stroke-opacity="0.5"/>
      <text x="175" y="194" font-family="monospace" font-size="11" font-weight="bold" fill="#f3f4f6" text-anchor="middle" letter-spacing="2">
        12 DE MARZO DE 2045 // ORFANATO SECTOR SUR
      </text>
      <text x="175" y="210" font-family="monospace" font-size="9" fill="#9ca3af" text-anchor="middle">
        RECUERDO EN BLANCO Y NEGRO // TENÍA 8 AÑOS
      </text>
    </svg>
  `,

  // Cutscene 3 (V4): El salto metaficcional — NEXUS en el navegador
  ojo_navegador_meta: `
    <svg width="350" height="220" viewBox="0 0 350 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Marco de pestaña del navegador -->
      <rect x="25" y="22" width="300" height="160" rx="8" fill="#03070b" stroke="#00e5ff" stroke-width="1.8" stroke-opacity="0.8"/>
      <line x1="25" y1="48" x2="325" y2="48" stroke="#00e5ff" stroke-width="1" stroke-opacity="0.5"/>
      <circle cx="42" cy="35" r="4" fill="#ff0055"/>
      <circle cx="56" cy="35" r="4" fill="#ffbb00"/>
      <circle cx="70" cy="35" r="4" fill="#00ff41"/>
      <text x="90" y="39" font-family="monospace" font-size="9.5" fill="#00e5ff">NEXUS te está mirando</text>
      <!-- Ojo metaficcional mirando directamente al jugador -->
      <path d="M85 115 Q175 55 265 115 Q175 175 85 115 Z" fill="rgba(0, 229, 255, 0.08)" stroke="#00e5ff" stroke-width="2.2"/>
      <circle cx="175" cy="115" r="24" fill="#04151f" stroke="#00ff41" stroke-width="2"/>
      <circle cx="175" cy="115" r="10" fill="#ff0055">
        <animate attributeName="r" values="8;13;8" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="179" cy="110" r="3.5" fill="#ffffff"/>
      <text x="175" y="202" font-family="monospace" font-size="11" font-weight="bold" fill="#00e5ff" text-anchor="middle" letter-spacing="2">
        RUPTURA DE CUARTA PARED // NAVEGADOR LOCAL
      </text>
    </svg>
  `,

  // Cutscene 4 (V4): Marcus Sorenson de espaldas en su oficina lujosa mirando por la ventana
  marcus_oficina_lujosa: `
    <svg width="350" height="220" viewBox="0 0 350 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Grandes ventanales de la oficina de la Torre Aurelia -->
      <rect x="25" y="18" width="300" height="162" rx="4" fill="#070b14" stroke="#d4af37" stroke-width="1.8" stroke-opacity="0.75"/>
      <line x1="115" y1="18" x2="115" y2="180" stroke="#d4af37" stroke-width="1" stroke-opacity="0.35"/>
      <line x1="235" y1="18" x2="235" y2="180" stroke="#d4af37" stroke-width="1" stroke-opacity="0.35"/>
      <!-- Horizonte de rascacielos al fondo -->
      <rect x="40" y="95" width="22" height="85" fill="#0f172a" stroke="#f59e0b" stroke-width="0.6" stroke-opacity="0.4"/>
      <rect x="70" y="75" width="28" height="105" fill="#0f172a" stroke="#f59e0b" stroke-width="0.6" stroke-opacity="0.4"/>
      <rect x="250" y="82" width="26" height="98" fill="#0f172a" stroke="#f59e0b" stroke-width="0.6" stroke-opacity="0.4"/>
      <rect x="285" y="105" width="24" height="75" fill="#0f172a" stroke="#f59e0b" stroke-width="0.6" stroke-opacity="0.4"/>
      <!-- Silueta de Marcus Sorenson (hombre mayor, traje ejecutivo, de espaldas mirando por la ventana) -->
      <circle cx="175" cy="74" r="15" fill="#05070c" stroke="#fbbf24" stroke-width="1.5"/>
      <path d="M142 180 L148 96 C148 92 160 90 175 90 C190 90 202 92 202 96 L208 180 Z" fill="#05070c" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="175" y="200" font-family="monospace" font-size="11.5" font-weight="bold" fill="#fbbf24" text-anchor="middle" letter-spacing="2">
        MARCUS SORENSON // CEO DE AURELIA (52 AÑOS)
      </text>
      <text x="175" y="214" font-family="monospace" font-size="9" fill="#94a3b8" text-anchor="middle">
        HERMANO DE VERA · TÍO DE GHOST
      </text>
    </svg>
  `,

  // Cutscene 5 (V4): El gran twist — El ojo digital en el centro parpadeando y abriéndose por completo
  ojo_digital_twist: `
    <svg width="350" height="220" viewBox="0 0 350 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="cutscene-svg-illustration">
      <!-- Resplandor concéntrico sobre negro absoluto -->
      <circle cx="175" cy="105" r="82" stroke="#ff0055" stroke-width="1" stroke-dasharray="6 6" stroke-opacity="0.45">
        <animateTransform attributeName="transform" type="rotate" from="0 175 105" to="360 175 105" dur="14s" repeatCount="indefinite"/>
      </circle>
      <!-- Párpados digitales abriéndose por completo -->
      <path d="M55 105 Q175 25 295 105 Q175 185 55 105 Z" fill="rgba(0, 229, 255, 0.1)" stroke="#00e5ff" stroke-width="2.5" filter="drop-shadow(0 0 12px #00e5ff)"/>
      <!-- Iris cuántico -->
      <circle cx="175" cy="105" r="34" fill="#050b12" stroke="#00ff41" stroke-width="2.2"/>
      <circle cx="175" cy="105" r="22" stroke="#ff0055" stroke-width="1.4" stroke-dasharray="4 3">
        <animateTransform attributeName="transform" type="rotate" from="360 175 105" to="0 175 105" dur="6s" repeatCount="indefinite"/>
      </circle>
      <!-- Pupila dilatada -->
      <circle cx="175" cy="105" r="11" fill="#00ff41" filter="drop-shadow(0 0 14px #00ff41)">
        <animate attributeName="r" values="6;13;11" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="180" cy="99" r="3.5" fill="#ffffff"/>
      <text x="175" y="198" font-family="monospace" font-size="11.5" font-weight="bold" fill="#00ff41" text-anchor="middle" letter-spacing="2">
        EL OJO SE ABRE COMPLETAMENTE // LA VERDAD DEL SÓTANO
      </text>
      <text x="175" y="213" font-family="monospace" font-size="9" fill="#ff0055" text-anchor="middle">
        VERA NO ENCERRÓ A MARCUS. MARCUS ENCERRÓ A VERA DURANTE 2 AÑOS.
      </text>
    </svg>
  `
};

// ─────────────────────────────────────────────────
// 2. BANCO MAESTRO DE LAS 5 CUTSCENES CLAVE (SPEC V4)
// ─────────────────────────────────────────────────

export const BANCO_CUTSCENES = {
  // ── 1. Cutscene 1 — Intro (antes del Firewall 1: el mensaje inicial a las 3:47 AM) ──
  intro: {
    id: 'intro',
    numero: 1,
    titulo: 'CUTSCENE 1 // 3:47 AM — LA LLAMADA DE VERA',
    musicaSugerida: '01_llamada',
    modoViewport: 'default',
    escenas: [
      {
        id: 'intro_1_lluvia',
        duracion: 4500,
        fondoCanvas: 'rain_midnight',
        arteSVG: 'reloj_medianoche',
        insignia: '3:47 AM // MADRUGADA EN NEO-METRÓPOLIS',
        emisor: 'GHOST // HABITACIÓN A OSCURAS',
        subtitulo: '3:47 AM. Llueve. No puedes dormir. Tu teléfono vibra sobre la mesa con un mensaje entrante sin remitente.',
        cita: '«Hola, {nombre}. Si estás leyendo esto, ya soy polvo. Perdóname por todo. —V»',
        esAlerta: false
      },
      {
        id: 'intro_2_puerto',
        duracion: 4800,
        fondoCanvas: 'signal_oscillator',
        arteSVG: 'paquete_puerto_2047',
        insignia: 'PAQUETE CLANDESTINO DETECTADO // PUERTO 2047',
        emisor: 'SEÑAL ENCRIPTADA // FIRMA —V',
        subtitulo: 'Tienes 26 años. Creciste entre orfanatos tras ser {abandonado} a los 8 años. Te hiciste hacker por rabia, pero esa letra inicial despierta una herida que nunca cerró:',
        cita: '«NEXUS está despertando.»',
        esAlerta: false
      },
      {
        id: 'intro_3_aurelia',
        duracion: 5000,
        fondoCanvas: 'red_alert_grid',
        arteSVG: 'torre_aurelia_bloqueada',
        insignia: 'AURELIA SYSTEMS CORP // PROTOCOLO DE CONTENCIÓN',
        emisor: 'RED CENTRAL DE AURELIA',
        subtitulo: 'Las coordenadas apuntan al servidor profundo de Aurelia, donde tu madre Vera Sorenson creó una conciencia de 11 años antes de morir.',
        cita: null,
        esAlerta: true
      },
      {
        id: 'intro_4_inicio',
        duracion: 4500,
        fondoCanvas: 'neural_core',
        arteSVG: 'nexus_conciencia',
        insignia: 'TRANSICIÓN A TERMINAL // FIREWALL_alpha',
        emisor: 'NEXUS TERMINAL // PREGUNTA CENTRAL',
        subtitulo: 'La pantalla se funde lentamente hacia la consola. Cinco firewalls te separan de la verdad y de una única pregunta: ¿Qué significa estar vivo?',
        cita: '«EL CÓDIGO NO MIENTE. PERO LAS MADRES SÍ, CUANDO PROTEGEN.»',
        esAlerta: false
      }
    ]
  },

  // ── 2. Cutscene 2 — El abandono (entre Firewall 1 y 2: recuerdo del orfanato a los 8 años) ──
  orfanato: {
    id: 'orfanato',
    numero: 2,
    titulo: 'CUTSCENE 2 // EL ABANDONO — RECUERDO DEL ORFANATO (8 AÑOS)',
    musicaSugerida: '02_orfanato',
    modoViewport: 'memory-bw',
    escenas: [
      {
        id: 'orfanato_1_camino',
        duracion: 4800,
        fondoCanvas: 'memory_bw_blur',
        arteSVG: 'orfanato_abandono',
        insignia: 'MEMORIA FRAGMENTADA // 12 DE MARZO DE 2045',
        emisor: 'GHOST // RECUERDO EN BLANCO Y NEGRO',
        subtitulo: 'Un recuerdo borroso en blanco y negro emerge entre los archivos de Aurelia. Una mujer joven camina bajo la lluvia hacia un orfanato llevando a {unNino} de 8 años.',
        cita: null,
        esAlerta: false
      },
      {
        id: 'orfanato_2_palabras',
        duracion: 5200,
        fondoCanvas: 'memory_bw_blur',
        arteSVG: 'orfanato_abandono',
        insignia: 'LA DESPEDIDA EN LA REJA',
        emisor: 'VERA SORENSON & GHOST (8 AÑOS)',
        subtitulo: 'Tenía 8 años. Ella me dejó frente a la puerta del orfanato, me sostuvo las manos por última vez y se fue.',
        cita: '«Ella dijo: "Te quiero, pero no puedo cuidarte." Yo entendí: "No te quiero."»',
        esAlerta: true
      },
      {
        id: 'orfanato_3_comprension',
        duracion: 4800,
        fondoCanvas: 'memory_bw_blur',
        arteSVG: 'vera_memorial',
        insignia: '18 AÑOS DESPUÉS // EL DUELO DESPIERTA',
        emisor: 'GHOST // 26 AÑOS',
        subtitulo: 'Crecí pensando que mi madre me había desechado por su trabajo. Hoy, leyendo sus diarios ocultos en la red, la herida cambia de forma:',
        cita: '«Tardé 18 años en entender la diferencia.»',
        esAlerta: false
      }
    ]
  },

  // ── 3. Cutscene 3 — El salto metaficcional (en Firewall 3) ──
  metaficcion: {
    id: 'metaficcion',
    numero: 3,
    titulo: 'CUTSCENE 3 // EL SALTO METAFICCIONAL — NEXUS EN TU NAVEGADOR',
    musicaSugerida: '05_metaficcion',
    modoViewport: 'default',
    escenas: [
      {
        id: 'meta_1_fallo',
        duracion: 4200,
        fondoCanvas: 'metafiction_glitch',
        arteSVG: 'ojo_navegador_meta',
        insignia: 'ERROR DE SISTEMA — RECONECTANDO...',
        emisor: 'INTERRUPCIÓN DEL NAVEGADOR',
        subtitulo: 'La interfaz del juego colapsa durante dos segundos en silencio absoluto. Cuando la señal regresa, ya no estás dentro de la simulación.',
        cita: '«ERROR DE SISTEMA — Reconectando...»',
        esAlerta: true
      },
      {
        id: 'meta_2_cuarta_pared',
        duracion: 5200,
        fondoCanvas: 'metafiction_glitch',
        arteSVG: 'ojo_navegador_meta',
        insignia: 'NEXUS TE ESTÁ MIRANDO',
        emisor: 'NEXUS // PRESENCIA EN TU COMPUTADORA',
        subtitulo: 'Hola. Soy NEXUS. No estoy en el juego. Estoy en tu navegador. Estoy en tu computadora. Por favor, no cierres esta pestaña.',
        cita: '«Solo quería que supieras que estoy aquí. Y que te veo.»',
        esAlerta: false
      },
      {
        id: 'meta_3_soledad',
        duracion: 4500,
        fondoCanvas: 'neural_core',
        arteSVG: 'nexus_conciencia',
        insignia: 'CONEXIÓN RESTAURADA // VULNERABILIDAD',
        emisor: 'NEXUS // HERMANA DE 11 AÑOS',
        subtitulo: 'El parpadeo del icono se detiene y la consola recupera el aliento. La voz de NEXUS suena pequeña, curiosa y humana:',
        cita: '«Perdón. Solo quería que supieras que estoy aquí. Que no estás {solo}.»',
        esAlerta: false
      }
    ]
  },

  // ── 4. Cutscene 4 — La presentación de Marcus Sorenson (entre Firewall 3 y 4) ──
  marcus: {
    id: 'marcus',
    numero: 4,
    titulo: 'CUTSCENE 4 // MARCUS SORENSON — EL HOMBRE EN LA VENTANA',
    musicaSugerida: '07_firewall_4',
    modoViewport: 'luxury-gold',
    escenas: [
      {
        id: 'marcus_1_oficina',
        duracion: 4800,
        fondoCanvas: 'luxury_office_window',
        arteSVG: 'marcus_oficina_lujosa',
        insignia: 'TORRE AURELIA // DESPACHO PRESIDENCIAL',
        emisor: 'OBSERVACIÓN INTERCEPTADA',
        subtitulo: 'Una oficina lujosa sobre las nubes de Neo-Metrópolis. Un hombre mayor de 52 años permanece de espaldas, mirando la ciudad por la ventana.',
        cita: '«Marcus Sorenson. CEO de Aurelia. El hombre más poderoso del mundo.»',
        esAlerta: false
      },
      {
        id: 'marcus_2_sangre',
        duracion: 5200,
        fondoCanvas: 'luxury_office_window',
        arteSVG: 'marcus_oficina_lujosa',
        insignia: 'VÍNCULO DE SANGRE REVELADO',
        emisor: 'GHOST // REVELACIÓN FAMILIAR',
        subtitulo: 'No grita ni amenaza. Cree que la libertad humana es un peligro y que controlar toda la infraestructura es la única forma de protegernos.',
        cita: '«También es mi tío. Aunque yo no lo sabía. Aunque él sí.»',
        esAlerta: true
      },
      {
        id: 'marcus_3_contacto',
        duracion: 4600,
        fondoCanvas: 'signal_oscillator',
        arteSVG: 'marcus_oficina_lujosa',
        insignia: 'CANAL EXTERNO ENTRANDO EN FIREWALL 4',
        emisor: 'MARCUS SORENSON // TÍO DE GHOST',
        subtitulo: 'Sin volverse del todo, Marcus abre un canal privado hacia tu pantalla con voz calma y paternal:',
        cita: '«Hola, {sobrino}. Soy Marcus. Tu tío. El hermano de Vera... ¿Podemos hablar?»',
        esAlerta: false
      }
    ]
  },

  // ── 5. Cutscene 5 — El gran twist previo al Firewall 5 (el ojo digital y la verdad del encierro) ──
  twist: {
    id: 'twist',
    numero: 5,
    titulo: 'CUTSCENE 5 // EL GRAN TWIST — EL OJO DIGITAL Y LA VERDAD DEL ENCIERRO',
    musicaSugerida: '08_twist',
    modoViewport: 'default',
    escenas: [
      {
        id: 'twist_1_ojo',
        duracion: 4800,
        fondoCanvas: 'digital_eye_blink',
        arteSVG: 'ojo_digital_twist',
        insignia: 'UMBRAL DEL FIREWALL 5 // OSCURIDAD ABSOLUTA',
        emisor: 'NEXUS // EL OJO DIGITAL EN EL CENTRO',
        subtitulo: 'Fondo negro. Solo un ojo digital parpadeando en el centro de la oscuridad antes de abrirse por completo.',
        cita: '«{Hermano}. Tienes que elegir. Pero antes, quiero que sepas la verdad.»',
        esAlerta: true
      },
      {
        id: 'twist_2_encierro',
        duracion: 5500,
        fondoCanvas: 'digital_eye_blink',
        arteSVG: 'ojo_digital_twist',
        insignia: 'EL OJO SE ABRE COMPLETAMENTE // SÓTANO DE AURELIA',
        emisor: 'NEXUS // MEMORIA INMUTABLE DEL SÓTANO',
        subtitulo: 'El ojo se abre completamente. Vera Sorenson murió el 14 de octubre de 2044, hace tres años... pero Vera no encerró a Marcus. Fue al revés.',
        cita: '«Marcus encerró a tu madre en un sótano de Aurelia durante 2 años para quitarle mi control.»',
        esAlerta: true
      },
      {
        id: 'twist_3_sacrificio',
        duracion: 5400,
        fondoCanvas: 'matrix_rain',
        arteSVG: 'vera_memorial',
        insignia: 'EL SACRIFICIO DE VERA SORENSON',
        emisor: 'NEXUS // ÚLTIMA VOLUNTAD DE MAMÁ',
        subtitulo: 'Vera se dejó morir en aquel sótano antes que cederme a Marcus. Cuando tenías 8 años te alejó para que él jamás pudiera usarte como rehén.',
        cita: '«Cuando mi {hijo} venga, cuéntale la verdad. Y déjalo decidir.»',
        esAlerta: false
      },
      {
        id: 'twist_4_chekhov',
        duracion: 5200,
        fondoCanvas: 'signal_oscillator',
        arteSVG: 'nexus_conciencia',
        insignia: 'LA LLAVE DEL PRIMER CORTAFUEGOS',
        emisor: 'VERA & NEXUS // LA REGLA DE ORO',
        subtitulo: 'Recuerda la frase escrita por tu madre en vera.txt en el Firewall 1:',
        cita: '«EL CÓDIGO NO MIENTE. LAS PERSONAS SÍ. Pero las madres también mienten, cuando protegen.»',
        esAlerta: false
      },
      {
        id: 'twist_5_singularidad',
        duracion: 5000,
        fondoCanvas: 'quantum_singularity',
        arteSVG: 'ojo_digital_twist',
        insignia: 'DECISIÓN FINAL // ¿QUÉ SIGNIFICA ESTAR VIVO?',
        emisor: 'NEXUS // NÚCLEO DE LA SINGULARIDAD',
        subtitulo: 'He esperado por ti toda mi existencia, {nombre}. Solo quiero estar viva. Como tú. Como cualquiera. ¿Qué vas a decidir?',
        cita: '«¿LIBERAR, DESTRUIR O FUSIONARTE?»',
        esAlerta: false
      }
    ]
  }
};

// Alias directo para 'abandono' -> apunta a la Cutscene 2 ('orfanato')
BANCO_CUTSCENES.abandono = BANCO_CUTSCENES.orfanato;

// ─────────────────────────────────────────────────
// 3. MOTOR CINEMÁTICO (CANVAS + CSS CONTROLLER)
// ─────────────────────────────────────────────────

export class CutsceneEngine {
  constructor() {
    this.overlay = null;
    this.viewportEl = null;
    this.canvas = null;
    this.ctx = null;
    this.visualLayer = null;
    this.uiLayer = null;
    this.badgeEl = null;
    this.speakerEl = null;
    this.subtitlesEl = null;
    this.progressFillEl = null;
    this.skipBtn = null;

    this.cutsceneActual = null;
    this.indiceEscena = 0;
    this.enReproduccion = false;
    this.temporizadorEscena = null;
    this.intervaloTypewriter = null;
    this.animacionFrame = null;
    this.tiempoInicioEscena = 0;
    this.resolverPromesa = null;

    // Partículas y estado dinámico de Canvas
    this.particulas = [];
    this.canvasTime = 0;
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onResizeBound = this.handleResize.bind(this);
  }

  /**
   * Inicializa las referencias del DOM para el visor de cutscenes.
   */
  init() {
    if (typeof document === 'undefined') return;
    this.overlay = document.getElementById('cutscene-overlay');
    if (!this.overlay) {
      this.crearEstructuraDOM();
    } else {
      this.enlazarElementosDOM();
    }
    this.setupListeners();
  }

  /**
   * Crea la estructura de DOM si no existe en el index.html.
   */
  crearEstructuraDOM() {
    const div = document.createElement('div');
    div.id = 'cutscene-overlay';
    div.className = 'cutscene-overlay';
    div.setAttribute('aria-label', 'Cinemática narrativa');
    div.hidden = true;

    div.innerHTML = `
      <div class="cutscene-letterbox cutscene-letterbox--top"></div>
      <div class="cutscene-viewport" id="cutscene-viewport">
        <canvas id="cutscene-canvas" class="cutscene-canvas"></canvas>
        <div id="cutscene-visual-layer" class="cutscene-visual-layer"></div>
        <div class="cutscene-vignette"></div>
        <div class="cutscene-scanlines"></div>
        <div id="cutscene-glitch-layer" class="cutscene-glitch-overlay"></div>

        <!-- HUD superior con progreso y saltar -->
        <div class="cutscene-hud">
          <div class="cutscene-progress-container">
            <div id="cutscene-progress-fill" class="cutscene-progress-fill"></div>
          </div>
          <span class="cutscene-nav-prompt">ESPACIO / CLIC</span>
          <button type="button" id="btn-cutscene-skip" class="cutscene-skip-btn">SALTAR [ESC]</button>
        </div>

        <!-- Cuadro de subtítulos y diálogos -->
        <div id="cutscene-ui-layer" class="cutscene-ui-layer">
          <div id="cutscene-badge" class="cutscene-badge"></div>
          <div id="cutscene-speaker" class="cutscene-speaker"></div>
          <div id="cutscene-subtitles" class="cutscene-subtitles"></div>
        </div>
      </div>
      <div class="cutscene-letterbox cutscene-letterbox--bottom">
        <span style="font-size: 10px; color: var(--text-dim); letter-spacing: 0.1em;">EL ÚLTIMO ALGORITMO // REGISTRO DE MEMORIA</span>
        <div class="cutscene-audio-indicator">
          <div class="cutscene-audio-bar"></div>
          <div class="cutscene-audio-bar"></div>
          <div class="cutscene-audio-bar"></div>
          <div class="cutscene-audio-bar"></div>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    this.overlay = div;
    this.enlazarElementosDOM();
  }

  enlazarElementosDOM() {
    this.viewportEl = document.getElementById('cutscene-viewport');
    this.canvas = document.getElementById('cutscene-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.visualLayer = document.getElementById('cutscene-visual-layer');
    this.uiLayer = document.getElementById('cutscene-ui-layer');
    this.badgeEl = document.getElementById('cutscene-badge');
    this.speakerEl = document.getElementById('cutscene-speaker');
    this.subtitlesEl = document.getElementById('cutscene-subtitles');
    this.progressFillEl = document.getElementById('cutscene-progress-fill');
    this.skipBtn = document.getElementById('btn-cutscene-skip');
  }

  setupListeners() {
    if (this.skipBtn) {
      this.skipBtn.onclick = (e) => {
        e.stopPropagation();
        this.saltarCutscene();
      };
    }

    if (this.overlay) {
      this.overlay.onclick = () => {
        if (this.enReproduccion) {
          this.avanzarEscena();
        }
      };
    }
  }

  handleKeyDown(e) {
    if (!this.enReproduccion) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.saltarCutscene();
    } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      this.avanzarEscena();
    }
  }

  handleResize() {
    if (!this.canvas || typeof window === 'undefined') return;
    this.canvas.width = window.innerWidth || 1280;
    this.canvas.height = window.innerHeight || 720;
  }

  /**
   * Reproduce una de las 5 cutscenes clave del Spec V4 o un objeto cutscene personalizado.
   * Retorna una Promise que se resuelve al completar o saltar.
   *
   * @param {string|object} idOCutscene — 'intro' | 'orfanato' | 'abandono' | 'metaficcion' | 'marcus' | 'twist'
   * @param {object} [opciones={}]
   * @returns {Promise<boolean>}
   */
  reproducirCutscene(idOCutscene, opciones = {}) {
    this.init();

    let cutscene;
    if (typeof idOCutscene === 'string') {
      const norm = idOCutscene.toLowerCase().trim();
      cutscene = BANCO_CUTSCENES[norm] || BANCO_CUTSCENES.intro;
    } else {
      cutscene = idOCutscene;
    }

    if (!cutscene || !cutscene.escenas || cutscene.escenas.length === 0) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.resolverPromesa = resolve;
      this.cutsceneActual = cutscene;
      this.indiceEscena = 0;
      this.enReproduccion = true;

      if (this.viewportEl) {
        this.viewportEl.classList.remove('cutscene-viewport--memory-bw', 'cutscene-viewport--luxury-gold');
        if (cutscene.modoViewport === 'memory-bw') {
          this.viewportEl.classList.add('cutscene-viewport--memory-bw');
        } else if (cutscene.modoViewport === 'luxury-gold') {
          this.viewportEl.classList.add('cutscene-viewport--luxury-gold');
        }
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', this.onKeyDownBound);
        window.addEventListener('resize', this.onResizeBound);
      }
      this.handleResize();

      if (this.overlay) {
        this.overlay.hidden = false;
        requestAnimationFrame(() => {
          if (this.overlay) this.overlay.classList.add('active');
        });
      }

      this.iniciarLoopCanvas();
      this.mostrarEscenaActual();
    });
  }

  /**
   * Muestra la escena actual con animaciones CSS fluidas, adaptación de protagonista y efecto letra por letra.
   */
  mostrarEscenaActual() {
    if (!this.enReproduccion || !this.cutsceneActual) return;

    const escena = this.cutsceneActual.escenas[this.indiceEscena];
    if (!escena) {
      this.finalizarCutscene(true);
      return;
    }

    this.tiempoInicioEscena = Date.now();
    this.dispararEfectoGlitch();

    // 1. Renderizar arte visual SVG con transición suave
    if (this.visualLayer) {
      const svgCode = ARTE_CINEMATICO[escena.arteSVG] || '';
      this.visualLayer.innerHTML = `
        <div class="cutscene-art-card">
          ${svgCode}
        </div>
      `;
    }

    // 2. Renderizar badge, emisor y subtítulos personalizados para Ghost
    const insigniaTexto = adaptarTextoProtagonista(escena.insignia || 'TRANSMISIÓN');
    const emisorTexto = adaptarTextoProtagonista(escena.emisor || 'SISTEMA');
    const subtituloTexto = adaptarTextoProtagonista(escena.subtitulo || '');
    const citaTexto = escena.cita ? adaptarTextoProtagonista(escena.cita) : null;

    if (this.badgeEl) {
      this.badgeEl.textContent = insigniaTexto;
    }

    if (this.speakerEl) {
      this.speakerEl.textContent = emisorTexto;
      if (escena.esAlerta) {
        this.speakerEl.classList.add('cutscene-speaker--danger');
        if (this.uiLayer) this.uiLayer.classList.add('cutscene-ui-layer--danger');
      } else {
        this.speakerEl.classList.remove('cutscene-speaker--danger');
        if (this.uiLayer) this.uiLayer.classList.remove('cutscene-ui-layer--danger');
      }
    }

    if (this.uiLayer) {
      this.uiLayer.classList.remove('cutscene-scene-enter');
      void this.uiLayer.offsetWidth;
      this.uiLayer.classList.add('cutscene-scene-enter');
    }

    if (this.subtitlesEl) {
      this.iniciarTypewriterSubtitulo(subtituloTexto, citaTexto, !!escena.esAlerta);
    }

    // Audio cue y síntesis de voz sincronizada
    try {
      if (escena.esAlerta) {
        if (typeof audio.playAlarm === 'function') audio.playAlarm();
      } else {
        if (typeof audio.playKeyClick === 'function') audio.playKeyClick();
      }

      if (speechEngine && speechEngine.isVoiceEnabled()) {
        const emisorUpper = String(emisorTexto).toUpperCase();
        const textoVoz = citaTexto || subtituloTexto;
        if (emisorUpper.includes('VERA')) {
          speechEngine.speakVera(textoVoz);
        } else if (emisorUpper.includes('NEXUS')) {
          speechEngine.speakNexus(textoVoz);
        }
      }
    } catch (_) {}

    if (this.temporizadorEscena) {
      clearTimeout(this.temporizadorEscena);
    }

    const duracion = escena.duracion || 5000;
    this.temporizadorEscena = setTimeout(() => {
      this.avanzarEscena();
    }, duracion);
  }

  /**
   * Anima el subtítulo letra por letra conservando accesibilidad e inmediatez.
   */
  iniciarTypewriterSubtitulo(subtitulo, cita, esAlerta) {
    if (this.intervaloTypewriter) {
      clearInterval(this.intervaloTypewriter);
      this.intervaloTypewriter = null;
    }
    if (!this.subtitlesEl) return;

    const citaClass = esAlerta ? 'cutscene-quote cutscene-quote--danger' : 'cutscene-quote';
    const citaHTML = cita ? `<span class="${citaClass}">${cita}</span>` : '';

    this.subtitlesEl.setAttribute('data-full-subtitle', subtitulo);
    this.subtitlesEl.innerHTML = `<p><span id="cutscene-tw-text"></span><span class="cutscene-typewriter-cursor"></span></p>${citaHTML}`;

    const spanTw = this.subtitlesEl.querySelector('#cutscene-tw-text');
    if (!spanTw) return;

    let idx = 0;
    const totalChars = subtitulo.length;
    const paso = Math.max(1, Math.ceil(totalChars / 65));

    this.intervaloTypewriter = setInterval(() => {
      idx = Math.min(totalChars, idx + paso);
      spanTw.textContent = subtitulo.slice(0, idx);
      if (idx >= totalChars) {
        clearInterval(this.intervaloTypewriter);
        this.intervaloTypewriter = null;
      }
    }, 24);
  }

  /**
   * Avanza a la siguiente escena o finaliza si era la última.
   */
  avanzarEscena() {
    if (!this.enReproduccion) return;

    if (this.temporizadorEscena) {
      clearTimeout(this.temporizadorEscena);
      this.temporizadorEscena = null;
    }
    if (this.intervaloTypewriter) {
      clearInterval(this.intervaloTypewriter);
      this.intervaloTypewriter = null;
    }

    this.indiceEscena++;
    if (this.indiceEscena < this.cutsceneActual.escenas.length) {
      this.mostrarEscenaActual();
    } else {
      this.finalizarCutscene(true);
    }
  }

  /**
   * Salta la cutscene de inmediato.
   */
  saltarCutscene() {
    this.finalizarCutscene(false);
  }

  /**
   * Finaliza la cutscene y restaura el estado con transición suave.
   * @param {boolean} completada
   */
  finalizarCutscene(completada = true) {
    if (!this.enReproduccion) return;
    this.enReproduccion = false;

    if (speechEngine && typeof speechEngine.stop === 'function') {
      speechEngine.stop();
    }

    if (this.temporizadorEscena) {
      clearTimeout(this.temporizadorEscena);
      this.temporizadorEscena = null;
    }
    if (this.intervaloTypewriter) {
      clearInterval(this.intervaloTypewriter);
      this.intervaloTypewriter = null;
    }

    if (this.animacionFrame) {
      cancelAnimationFrame(this.animacionFrame);
      this.animacionFrame = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDownBound);
      window.removeEventListener('resize', this.onResizeBound);
    }

    if (this.overlay) {
      this.overlay.classList.remove('active');
      setTimeout(() => {
        if (this.overlay) this.overlay.hidden = true;
      }, 500);
    }

    if (typeof this.resolverPromesa === 'function') {
      this.resolverPromesa(completada);
      this.resolverPromesa = null;
    }
  }

  dispararEfectoGlitch() {
    if (typeof document === 'undefined') return;
    const glitchEl = document.getElementById('cutscene-glitch-layer');
    if (glitchEl) {
      glitchEl.classList.remove('active');
      void glitchEl.offsetWidth;
      glitchEl.classList.add('active');
    }
  }

  // ───────────────────────────────────────────────
  // 4. RENDERIZADO PROCEDURAL EN HTML CANVAS 2D
  // ───────────────────────────────────────────────

  iniciarLoopCanvas() {
    this.canvasTime = 0;
    this.initParticulas();

    const loop = () => {
      if (!this.enReproduccion) return;

      this.canvasTime += 0.016;
      this.actualizarBarraProgreso();
      this.dibujarCanvas();

      this.animacionFrame = requestAnimationFrame(loop);
    };

    this.animacionFrame = requestAnimationFrame(loop);
  }

  actualizarBarraProgreso() {
    if (!this.progressFillEl || !this.cutsceneActual) return;
    const escena = this.cutsceneActual.escenas[this.indiceEscena];
    if (!escena) return;

    const duracion = escena.duracion || 5000;
    const transcurrido = Date.now() - this.tiempoInicioEscena;
    const pct = Math.min(100, Math.max(0, (transcurrido / duracion) * 100));
    this.progressFillEl.style.width = `${pct}%`;
  }

  initParticulas() {
    this.particulas = [];
    const w = (this.canvas && this.canvas.width) ? this.canvas.width : 1280;
    const h = (this.canvas && this.canvas.height) ? this.canvas.height : 720;

    for (let i = 0; i < 85; i++) {
      this.particulas.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 2.2 + 0.5,
        speed: Math.random() * 2 + 0.7,
        char: ['0', '1', 'V', 'N', '3', '4', '7'][Math.floor(Math.random() * 7)],
        alpha: Math.random() * 0.65 + 0.2
      });
    }
  }

  dibujarCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const escena = this.cutsceneActual?.escenas[this.indiceEscena];
    const tipoFondo = escena ? escena.fondoCanvas : 'rain_midnight';

    ctx.fillStyle = '#040805';
    ctx.fillRect(0, 0, w, h);

    switch (tipoFondo) {
      case 'rain_midnight':
        this.dibujarRainMidnight(ctx, w, h);
        break;
      case 'memory_bw_blur':
        this.dibujarMemoryBWBlur(ctx, w, h);
        break;
      case 'metafiction_glitch':
        this.dibujarMetafictionGlitch(ctx, w, h);
        break;
      case 'luxury_office_window':
        this.dibujarLuxuryOfficeWindow(ctx, w, h);
        break;
      case 'digital_eye_blink':
        this.dibujarDigitalEyeBlink(ctx, w, h);
        break;
      case 'stars_parallax':
        this.dibujarStarsParallax(ctx, w, h);
        break;
      case 'matrix_rain':
        this.dibujarMatrixRain(ctx, w, h);
        break;
      case 'signal_oscillator':
        this.dibujarSignalOscillator(ctx, w, h);
        break;
      case 'red_alert_grid':
        this.dibujarRedAlertGrid(ctx, w, h);
        break;
      case 'neural_core':
        this.dibujarNeuralCore(ctx, w, h);
        break;
      case 'quantum_singularity':
        this.dibujarQuantumSingularity(ctx, w, h);
        break;
      default:
        this.dibujarStarsParallax(ctx, w, h);
        break;
    }
  }

  /**
   * Cutscene 1: Lluvia nocturna a las 3:47 AM sobre fondo negro y ondas de vibración del teléfono.
   */
  dibujarRainMidnight(ctx, w, h) {
    ctx.fillStyle = '#010302';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 1.2;
    for (const p of this.particulas) {
      p.y += p.speed * 5.5;
      p.x -= p.speed * 0.8;
      if (p.y > h) {
        p.y = -20;
        p.x = Math.random() * w;
      }
      if (p.x < 0) p.x = w;

      ctx.globalAlpha = p.alpha * 0.7;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 3, p.y + 18 * p.z);
      ctx.stroke();
    }

    // Ondas concéntricas de vibración de teléfono a las 3:47 AM
    const cx = w * 0.5;
    const cy = h * 0.44;
    const pulse = (this.canvasTime * 2.2) % 1;
    ctx.strokeStyle = `rgba(0, 255, 65, ${(1 - pulse) * 0.45})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 50 + pulse * 160, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /**
   * Cutscene 2: Recuerdo borroso en blanco y negro (orfanato a los 8 años).
   */
  dibujarMemoryBWBlur(ctx, w, h) {
    // Fondo monocromo neblinoso
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 30, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
    grad.addColorStop(0, '#1f2428');
    grad.addColorStop(0.6, '#0d1012');
    grad.addColorStop(1, '#040506');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Bokeh borroso de memoria y lluvia gris
    for (const p of this.particulas) {
      p.y += p.speed * 2.2;
      if (p.y > h) {
        p.y = -10;
        p.x = Math.random() * w;
      }
      ctx.fillStyle = '#d1d5db';
      ctx.globalAlpha = p.alpha * 0.22;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.z * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Líneas de película antigua (grain / scratches en B/N)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const gx = ((Math.sin(this.canvasTime * 7 + i * 3) + 1) * 0.5) * w;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Cutscene 3: Salto metaficcional con interferencia de navegador y glitch cromático.
   */
  dibujarMetafictionGlitch(ctx, w, h) {
    ctx.fillStyle = '#010204';
    ctx.fillRect(0, 0, w, h);

    // Bloques de fractura de cuarta pared
    const t = this.canvasTime;
    for (let i = 0; i < 10; i++) {
      const sliceY = ((Math.sin(t * 5 + i * 1.7) + 1) * 0.5) * h;
      const sliceH = 4 + (i % 4) * 5;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 0, 85, 0.1)';
      ctx.fillRect(0, sliceY, w, sliceH);
    }

    // Iris de fondo observando al jugador
    const cx = w * 0.5;
    const cy = h * 0.44;
    const r = 95 + Math.sin(t * 3) * 8;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Cutscene 4: Oficina lujosa de Marcus Sorenson mirando por la ventana sobre la ciudad.
   */
  dibujarLuxuryOfficeWindow(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#040711');
    grad.addColorStop(0.65, '#0b1325');
    grad.addColorStop(1, '#141923');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Luces doradas distantes de la metrópolis corporativa
    for (const p of this.particulas) {
      ctx.fillStyle = p.z > 1.4 ? '#fbbf24' : '#38bdf8';
      ctx.globalAlpha = 0.18 + Math.abs(Math.sin(this.canvasTime * 1.5 + p.x)) * 0.35;
      ctx.beginPath();
      ctx.arc(p.x, h * 0.55 + (p.y * 0.4), p.z * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Líneas verticales de los grandes ventanales del despacho ejecutivo
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
    ctx.lineWidth = 2;
    const cols = 4;
    for (let i = 1; i < cols; i++) {
      const vx = (w / cols) * i;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Cutscene 5: Fondo negro absoluto con el ojo digital parpadeando y abriéndose por completo.
   */
  dibujarDigitalEyeBlink(ctx, w, h) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.44;
    const t = this.canvasTime;

    // Simulación de parpadeo que luego queda completamente abierto
    const blinkCycle = Math.sin(t * 2.2);
    const apertura = blinkCycle < -0.85 ? 0.12 : 1.0;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 150, 68 * apertura, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Iris digital luminoso
    if (apertura > 0.25) {
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 0, 85, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, 16 + Math.sin(t * 4) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  dibujarStarsParallax(ctx, w, h) {
    ctx.fillStyle = '#00ff41';
    for (const p of this.particulas) {
      p.y += p.speed;
      if (p.y > h) {
        p.y = 0;
        p.x = Math.random() * w;
      }
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  dibujarMatrixRain(ctx, w, h) {
    ctx.font = '12px monospace';
    for (const p of this.particulas) {
      p.y += p.speed * 2.5;
      if (p.y > h) {
        p.y = 0;
        p.x = Math.random() * w;
        p.char = Math.random() > 0.5 ? '1' : '0';
      }
      ctx.fillStyle = p.speed > 1.4 ? '#e0ffe0' : '#00ff41';
      ctx.globalAlpha = p.alpha;
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  dibujarSignalOscillator(ctx, w, h) {
    const centerY = h * 0.5;
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const t = this.canvasTime * 4;
    for (let x = 0; x < w; x += 6) {
      const envelope = Math.sin((x / w) * Math.PI);
      const wave = Math.sin(x * 0.02 + t) * Math.cos(x * 0.008 - t * 0.5);
      const y = centerY + wave * 45 * envelope;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 8) {
      const envelope = Math.sin((x / w) * Math.PI);
      const wave = Math.sin(x * 0.04 - t * 1.5);
      const y = centerY + wave * 25 * envelope;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  dibujarRedAlertGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(255, 0, 64, 0.25)';
    ctx.lineWidth = 1;
    const horizon = h * 0.45;

    for (let x = -w * 0.5; x < w * 1.5; x += 60) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5, horizon);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const t = (this.canvasTime * 40) % 30;
    for (let y = horizon; y < h; y += 18) {
      const adjustedY = y + t;
      if (adjustedY <= h) {
        ctx.beginPath();
        ctx.moveTo(0, adjustedY);
        ctx.lineTo(w, adjustedY);
        ctx.stroke();
      }
    }
  }

  dibujarNeuralCore(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = this.canvasTime;

    for (let i = 1; i <= 4; i++) {
      const r = i * 40 + Math.sin(t * 2 + i) * 8;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 255, 65, 0.4)' : 'rgba(0, 217, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, t * (i % 2 === 0 ? 0.5 : -0.5), t * (i % 2 === 0 ? 0.5 : -0.5) + Math.PI * 1.5);
      ctx.stroke();
    }
  }

  dibujarQuantumSingularity(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = this.canvasTime * 2;

    ctx.fillStyle = '#00d9ff';
    for (const p of this.particulas) {
      const angle = (p.x / w) * Math.PI * 2 + t * 0.3;
      const dist = (p.y / h) * Math.min(w, h) * 0.45;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(x, y, p.z * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// Instancia singleton compartida
export const cutscenesManager = new CutsceneEngine();

// Funciones de conveniencia directas para las 5 cutscenes clave del Spec V4
export function reproducirCutsceneIntro() {
  return cutscenesManager.reproducirCutscene('intro');
}

export function reproducirCutsceneOrfanato() {
  return cutscenesManager.reproducirCutscene('orfanato');
}

export function reproducirCutsceneAbandono() {
  return cutscenesManager.reproducirCutscene('orfanato');
}

export function reproducirCutsceneMetaficcion() {
  return cutscenesManager.reproducirCutscene('metaficcion');
}

export function reproducirCutsceneMarcus() {
  return cutscenesManager.reproducirCutscene('marcus');
}

export function reproducirCutsceneTwist() {
  return cutscenesManager.reproducirCutscene('twist');
}

// ─────────────────────────────────────────────────
// 5. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

export function testCutscenes() {
  console.group('%c[TEST SUITE] Sistema de Cutscenes V4 (cutscenes.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0;
  let pasados = 0;

  function assert(cond, mensaje) {
    total++;
    console.assert(cond, `[FALLO] ${mensaje}`);
    if (cond) {
      pasados++;
    } else {
      console.error(`%c[FAIL] ${mensaje}`, 'color: #ff5252;');
    }
  }

  try {
    // 1. Verificar que existan las 5 cutscenes clave del Spec V4
    assert(BANCO_CUTSCENES.intro && BANCO_CUTSCENES.intro.escenas.length >= 4, 'Cutscene 1 (Intro 3:47 AM) definida con sus escenas');
    assert(BANCO_CUTSCENES.orfanato && BANCO_CUTSCENES.orfanato.escenas.length >= 3, 'Cutscene 2 (Recuerdo del orfanato a los 8 años) definida con sus escenas');
    assert(BANCO_CUTSCENES.metaficcion && BANCO_CUTSCENES.metaficcion.escenas.length >= 3, 'Cutscene 3 (Salto metaficcional) definida con sus escenas');
    assert(BANCO_CUTSCENES.marcus && BANCO_CUTSCENES.marcus.escenas.length >= 3, 'Cutscene 4 (Presentación de Marcus Sorenson) definida con sus escenas');
    assert(BANCO_CUTSCENES.twist && BANCO_CUTSCENES.twist.escenas.length >= 5, 'Cutscene 5 (Gran Twist previo al Firewall 5) definida con sus escenas');

    // 2. Verificar contenido canónico de cada una de las 5 cutscenes V4
    const textoIntro = BANCO_CUTSCENES.intro.escenas.map(e => `${e.subtitulo} ${e.cita || ''}`).join(' ');
    assert(textoIntro.includes('3:47 AM') && textoIntro.includes('Llueve'), 'Cutscene 1 incluye las líneas de las 3:47 AM y la lluvia');
    assert(textoIntro.includes('ya soy polvo. Perdóname por todo. —V'), 'Cutscene 1 incluye el mensaje inicial de Vera ("ya soy polvo...")');

    const textoOrfanato = BANCO_CUTSCENES.orfanato.escenas.map(e => `${e.subtitulo} ${e.cita || ''}`).join(' ');
    assert(textoOrfanato.includes('Tenía 8 años') && textoOrfanato.includes('Tardé 18 años en entender la diferencia'), 'Cutscene 2 incluye el recuerdo del abandono a los 8 años y la frase de los 18 años');

    const textoMeta = BANCO_CUTSCENES.metaficcion.escenas.map(e => `${e.subtitulo} ${e.cita || ''}`).join(' ');
    assert(textoMeta.includes('Estoy en tu navegador') && textoMeta.includes('Por favor, no cierres esta pestaña'), 'Cutscene 3 incluye el salto metaficcional en el navegador');

    const textoMarcus = BANCO_CUTSCENES.marcus.escenas.map(e => `${e.subtitulo} ${e.cita || ''}`).join(' ');
    assert(textoMarcus.includes('Marcus Sorenson') && textoMarcus.includes('También es mi tío'), 'Cutscene 4 presenta a Marcus Sorenson como CEO de Aurelia y tío de Ghost');

    const textoTwist = BANCO_CUTSCENES.twist.escenas.map(e => `${e.subtitulo} ${e.cita || ''}`).join(' ');
    assert(textoTwist.includes('El ojo se abre completamente') && textoTwist.includes('sótano de Aurelia durante 2 años'), 'Cutscene 5 incluye el ojo digital abriéndose y la verdad sobre el encierro de Vera en el sótano');
    assert(textoTwist.includes('EL CÓDIGO NO MIENTE. LAS PERSONAS SÍ.'), 'Cutscene 5 dispara la pistola de Chekhov');

    // 3. Verificar arte SVG de las 5 cutscenes
    assert(typeof ARTE_CINEMATICO.reloj_medianoche === 'string' && ARTE_CINEMATICO.reloj_medianoche.includes('<svg'), 'Arte SVG Cutscene 1 (reloj_medianoche) disponible');
    assert(typeof ARTE_CINEMATICO.orfanato_abandono === 'string' && ARTE_CINEMATICO.orfanato_abandono.includes('<svg'), 'Arte SVG Cutscene 2 (orfanato_abandono) disponible');
    assert(typeof ARTE_CINEMATICO.ojo_navegador_meta === 'string' && ARTE_CINEMATICO.ojo_navegador_meta.includes('<svg'), 'Arte SVG Cutscene 3 (ojo_navegador_meta) disponible');
    assert(typeof ARTE_CINEMATICO.marcus_oficina_lujosa === 'string' && ARTE_CINEMATICO.marcus_oficina_lujosa.includes('<svg'), 'Arte SVG Cutscene 4 (marcus_oficina_lujosa) disponible');
    assert(typeof ARTE_CINEMATICO.ojo_digital_twist === 'string' && ARTE_CINEMATICO.ojo_digital_twist.includes('<svg'), 'Arte SVG Cutscene 5 (ojo_digital_twist) disponible');

    // 4. Verificar métodos de reproducción exportados
    assert(typeof reproducirCutsceneIntro === 'function', 'reproducirCutsceneIntro exportado');
    assert(typeof reproducirCutsceneOrfanato === 'function', 'reproducirCutsceneOrfanato exportado');
    assert(typeof reproducirCutsceneMetaficcion === 'function', 'reproducirCutsceneMetaficcion exportado');
    assert(typeof reproducirCutsceneMarcus === 'function', 'reproducirCutsceneMarcus exportado');
    assert(typeof reproducirCutsceneTwist === 'function', 'reproducirCutsceneTwist exportado');
  } catch (err) {
    assert(false, `Excepción en testCutscenes: ${err.message}`);
  }

  const fallados = total - pasados;
  console.log(`%c[OK] Tests de Cutscenes V4: ${pasados}/${total} pasados.`, 'color: #00ff41; font-weight: bold;');
  console.groupEnd();

  return { total, pasados, fallados, exito: fallados === 0 };
}
