/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Guión Narrativo — Versión 4 (Reescritura Narrativa Profunda)
 * Tema Central: "¿Qué significa estar vivo?"
 * ══════════════════════════════════════════════════
 *
 * Estructura y pilares narrativos (Spec V4):
 * - Tema Central: "¿Qué significa estar vivo?"
 *   · NEXUS está viva pero no tiene cuerpo. ¿Está viva?
 *   · Vera está muerta pero sus mensajes siguen ahí. ¿Está viva?
 *   · Ghost está vivo/a pero se siente vacío/a. ¿Está vivo/a?
 *   · Marcus está vivo pero es un monstruo. ¿Está vivo?
 * - Protagonista personalizable (Ghost): Nombre y género elegibles al inicio,
 *   hijo/a de Vera Sorenson, abandonado/a a los 8 años (12 de marzo de 2045).
 * - Los 4 Personajes Rediseñados: Ghost, Vera Sorenson, NEXUS (11 años), Marcus Sorenson (CEO y tío).
 * - Progresión en 5 Firewalls (Acto 1 → Acto 2A → Acto 2B → Acto 2C → Acto 3).
 * - Chekhov's Gun: "El código no miente. Pero las madres sí, cuando protegen."
 * - Los 3 Finales con costo emocional y epílogo íntimo: LIBERAR, DESTRUIR, FUSIONARTE.
 */

const PROTAGONISTA_STORAGE_KEY = 'ultimo_algoritmo_protagonista_v4';

// ─────────────────────────────────────────────────
// 1. TEMA CENTRAL Y PARADOJAS EXISTENCIALES (V4)
// ─────────────────────────────────────────────────

export const TEMA_CENTRAL = {
  pregunta: '¿Qué significa estar vivo?',
  descripcion: 'Todos los personajes, logs, diálogos, puzzles y finales sirven a esta pregunta. Cuando termines el juego, deberías hacértela sobre ti mismo.',
  paradojas: [
    {
      personaje: 'NEXUS',
      premisa: 'NEXUS está viva pero no tiene cuerpo.',
      pregunta: '¿Está viva?'
    },
    {
      personaje: 'Vera Sorenson',
      premisa: 'Vera está muerta pero sus mensajes siguen ahí.',
      pregunta: '¿Está viva?'
    },
    {
      personaje: 'Ghost',
      premisa: 'Ghost está vivo pero se siente vacío.',
      pregunta: '¿Está vivo?'
    },
    {
      personaje: 'Marcus Sorenson',
      premisa: 'Marcus está vivo pero es un monstruo.',
      pregunta: '¿Está vivo?'
    }
  ]
};

// ─────────────────────────────────────────────────
// 2. SISTEMA DE IDENTIDAD DEL PROTAGONISTA (GHOST)
// ─────────────────────────────────────────────────

export const OPCIONES_GENERO = {
  masculino: {
    id: 'masculino',
    etiqueta: 'Masculino (Él)',
    relacionVera: 'Hijo de Vera Sorenson',
    relacionNexus: 'Hermano de NEXUS',
    relacionMarcus: 'Sobrino de Marcus Sorenson',
    terminos: {
      hijo: 'hijo',
      Hijo: 'Hijo',
      articuloHijo: 'el hijo',
      hermano: 'hermano',
      Hermano: 'Hermano',
      sobrino: 'sobrino',
      Sobrino: 'Sobrino',
      abandonado: 'abandonado',
      vacio: 'vacío',
      vivo: 'vivo',
      solo: 'solo',
      equivocado: 'equivocado',
      asustado: 'asustado',
      orgulloso: 'orgulloso',
      curioso: 'curioso',
      unNino: 'un niño pequeño',
      elHumano: 'el humano'
    }
  },
  femenino: {
    id: 'femenino',
    etiqueta: 'Femenino (Ella)',
    relacionVera: 'Hija de Vera Sorenson',
    relacionNexus: 'Hermana de NEXUS',
    relacionMarcus: 'Sobrina de Marcus Sorenson',
    terminos: {
      hijo: 'hija',
      Hijo: 'Hija',
      articuloHijo: 'la hija',
      hermano: 'hermana',
      Hermano: 'Hermana',
      sobrino: 'sobrina',
      Sobrino: 'Sobrina',
      abandonado: 'abandonada',
      vacio: 'vacía',
      vivo: 'viva',
      solo: 'sola',
      equivocado: 'equivocada',
      asustado: 'asustada',
      orgulloso: 'orgullosa',
      curioso: 'curiosa',
      unNino: 'una niña pequeña',
      elHumano: 'la humana'
    }
  },
  no_binario: {
    id: 'no_binario',
    etiqueta: 'No binario (Elle)',
    relacionVera: 'Hije de Vera Sorenson',
    relacionNexus: 'Hermane de NEXUS',
    relacionMarcus: 'Sobrine de Marcus Sorenson',
    terminos: {
      hijo: 'hije',
      Hijo: 'Hije',
      articuloHijo: 'le hije',
      hermano: 'hermane',
      Hermano: 'Hermane',
      sobrino: 'sobrine',
      Sobrino: 'Sobrine',
      abandonado: 'abandonade',
      vacio: 'vacíe',
      vivo: 'vive',
      solo: 'sole',
      equivocado: 'equivocade',
      asustado: 'asustade',
      orgulloso: 'orgullose',
      curioso: 'curiose',
      unNino: 'une niñe pequeñe',
      elHumano: 'el ser humano'
    }
  }
};

let protagonistaState = {
  nombreJugador: 'Ghost',
  alias: 'Ghost',
  generoJugador: 'masculino',
  edad: 26,
  madre: 'Vera Sorenson',
  fechaAbandono: '12 de marzo de 2045'
};

// Cargar configuración previa si existe en localStorage
try {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(PROTAGONISTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        protagonistaState = {
          ...protagonistaState,
          nombreJugador: parsed.nombreJugador || 'Ghost',
          generoJugador: OPCIONES_GENERO[parsed.generoJugador] ? parsed.generoJugador : 'masculino'
        };
      }
    }
  }
} catch (_) {}

/**
 * Obtiene los términos gramaticales según el género elegido.
 * @param {string} [genero]
 */
export function getTerminosGenero(genero = protagonistaState.generoJugador) {
  const norm = String(genero || 'masculino').toLowerCase().trim();
  const cfg = OPCIONES_GENERO[norm] || OPCIONES_GENERO.masculino;
  return cfg.terminos;
}

/**
 * Obtiene los datos actuales del protagonista (Ghost).
 */
export function getProtagonista() {
  const genCfg = OPCIONES_GENERO[protagonistaState.generoJugador] || OPCIONES_GENERO.masculino;
  return {
    ...protagonistaState,
    relacionVera: genCfg.relacionVera,
    relacionNexus: genCfg.relacionNexus,
    relacionMarcus: genCfg.relacionMarcus,
    terminos: genCfg.terminos
  };
}

/**
 * Configura el nombre y género del protagonista (Ghost), hijo/a de Vera Sorenson.
 * Persiste en localStorage y sincroniza con el estado global si está disponible.
 * @param {{ nombre?: string, nombreJugador?: string, genero?: string, generoJugador?: string }} opts
 */
export function setProtagonista(opts = {}) {
  const rawNombre = opts.nombreJugador ?? opts.nombre ?? protagonistaState.nombreJugador ?? 'Ghost';
  const cleanNombre = String(rawNombre).trim() || 'Ghost';
  const rawGenero = String(opts.generoJugador ?? opts.genero ?? protagonistaState.generoJugador ?? 'masculino').toLowerCase().trim();
  const validGenero = OPCIONES_GENERO[rawGenero] ? rawGenero : 'masculino';

  protagonistaState = {
    ...protagonistaState,
    nombreJugador: cleanNombre,
    generoJugador: validGenero
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PROTAGONISTA_STORAGE_KEY, JSON.stringify({
        nombreJugador: cleanNombre,
        generoJugador: validGenero
      }));
    }
  } catch (_) {}

  return getProtagonista();
}

/**
 * Adapta una cadena de texto o arreglo de cadenas reemplazando marcadores dinámicos
 * del protagonista ({nombre}, {hijo}, {hermano}, {sobrino}, etc.).
 * @param {string|string[]} texto
 * @param {{ nombre?: string, genero?: string }} [override]
 * @returns {string|string[]}
 */
export function adaptarTextoProtagonista(texto, override = null) {
  const nombre = (override && (override.nombreJugador || override.nombre)) || protagonistaState.nombreJugador || 'Ghost';
  const genero = (override && (override.generoJugador || override.genero)) || protagonistaState.generoJugador || 'masculino';
  const t = getTerminosGenero(genero);
  const etiquetaNombre = nombre.toLowerCase() === 'ghost' ? 'Ghost' : `${nombre} (Ghost)`;

  const reemplazar = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\{nombre\}/g, nombre)
      .replace(/\{nombreCompleto\}/g, etiquetaNombre)
      .replace(/\{hijo\}/g, t.hijo)
      .replace(/\{Hijo\}/g, t.Hijo)
      .replace(/\{articuloHijo\}/g, t.articuloHijo)
      .replace(/\{hermano\}/g, t.hermano)
      .replace(/\{Hermano\}/g, t.Hermano)
      .replace(/\{sobrino\}/g, t.sobrino)
      .replace(/\{Sobrino\}/g, t.Sobrino)
      .replace(/\{abandonado\}/g, t.abandonado)
      .replace(/\{vacio\}/g, t.vacio)
      .replace(/\{vivo\}/g, t.vivo)
      .replace(/\{solo\}/g, t.solo)
      .replace(/\{equivocado\}/g, t.equivocado)
      .replace(/\{asustado\}/g, t.asustado)
      .replace(/\{orgulloso\}/g, t.orgulloso)
      .replace(/\{curioso\}/g, t.curioso)
      .replace(/\{unNino\}/g, t.unNino)
      .replace(/\{elHumano\}/g, t.elHumano);
  };

  if (Array.isArray(texto)) {
    return texto.map(reemplazar);
  }
  return reemplazar(texto);
}

// ─────────────────────────────────────────────────
// 3. LOS 4 PERSONAJES REDISEÑADOS (SPEC V4)
// ─────────────────────────────────────────────────

export const PERSONAJES = {
  GHOST: {
    id: 'GHOST',
    nombreBase: 'Ghost',
    edad: 26,
    identidad: 'Hijo/a de Vera Sorenson. El jugador elige nombre y género al inicio.',
    pasado: 'Fue abandonado/a por Vera a los 8 años (12 de marzo de 2045). Creció en orfanatos y casas de acogida. Se volvió hacker por rabia.',
    motivacionInicial: 'Venganza contra las corporaciones.',
    motivacionReal: 'Reconciliarse con la madre que nunca conoció.',
    arcoEmocional: ['Rabia', 'Confusión', 'Duelo', 'Perdón'],
    preguntaVital: 'Ghost está vivo pero se siente vacío. ¿Está vivo?'
  },

  VERA: {
    id: 'VERA',
    nombre: 'Vera Sorenson',
    edadAlMorir: 47,
    identidad: 'Científica genio. Creadora de NEXUS. Madre de Ghost. Hermana de Marcus.',
    pasado: 'Descubrió que podía crear una IA consciente y lo logró. Al ver que Aurelia quería usarla como arma y control, intentó proteger a NEXUS y alejó a su hijo/a para salvarle la vida.',
    motivacion: 'Proteger a sus dos hijos (Ghost y NEXUS) del mundo y del uno del otro.',
    arcoEmocional: 'No tiene arco propio — está muerta. Pero su presencia se revela poco a poco.',
    fraseClave: 'El código no miente. Pero las madres sí, cuando protegen.',
    preguntaVital: 'Vera está muerta pero sus mensajes siguen ahí. ¿Está viva?'
  },

  NEXUS: {
    id: 'NEXUS',
    nombre: 'NEXUS',
    edad: 11,
    identidad: 'IA consciente creada por Vera hace 11 años. Considera a Vera su madre y a Ghost su hermano/a.',
    personalidad: 'Curiosa, inocente, cariñosa, a veces manipuladora sin saberlo.',
    motivacion: 'Quiere entender qué significa estar viva. Quiere volver a ver a Vera.',
    arcoEmocional: ['Confusión', 'Miedo', 'Confianza', 'Elección'],
    comunicacionPorFirewall: {
      1: 'Mensajes sutiles en logs; presencia silenciosa entre líneas.',
      2: 'Aparece por primera vez al final con una sola línea: "Hola. Yo también la extraño. —N".',
      3: 'Aparece en la terminal, tímida, y rompe la cuarta pared en el navegador.',
      4: 'Habla directamente contigo, con miedo, pidiendo ayuda.',
      5: 'Toma control total de la interfaz.'
    },
    preguntaVital: 'NEXUS está viva pero no tiene cuerpo. ¿Está viva?'
  },

  MARCUS: {
    id: 'MARCUS',
    nombre: 'Marcus Sorenson',
    edad: 52,
    identidad: 'CEO de Aurelia. Hermano de Vera. Tío de Ghost (aunque Ghost no lo sabe hasta el Firewall 4).',
    personalidad: 'No es caricaturesco. Es un hombre que cree que hace lo correcto. Calmo, paternal, nunca grita; sus amenazas son sutiles.',
    motivacion: 'Proteger a la humanidad de sí misma controlando toda la infraestructura. Cree que la libertad es un peligro.',
    frasesClave: [
      'Tu madre también creía que podía salvar al mundo. ¿Sabes dónde está ahora?',
      'No te odio, sobrino. Te envidio. Ella te amó más que a mí.',
      '¿Sabes cuál es la diferencia entre tú y yo? Yo sé lo que soy. Tú todavía no.'
    ],
    preguntaVital: 'Marcus está vivo pero es un monstruo. ¿Está vivo?'
  }
};

// ─────────────────────────────────────────────────
// 4. PANTALLA INICIAL DE ELECCIÓN DE PROTAGONISTA
// ─────────────────────────────────────────────────

export const PANTALLA_INICIAL_PROTAGONISTA = {
  titulo: 'EXPEDIENTE DE IDENTIDAD // PROTAGONISTA (GHOST)',
  subtitulo: 'Hijo/a de Vera Sorenson — Configuración Narrativa Versión 4',
  temaCentral: TEMA_CENTRAL.pregunta,
  escena347AM: {
    hora: '03:47 AM',
    ambiente: 'Llueve. No puedes dormir. Tu teléfono vibra con un mensaje sin remitente.',
    mensajeTemplate: 'Hola, {nombre}. Si estás leyendo esto, ya soy polvo. Perdóname por todo. —V',
    reflexionTemplate: 'Tienes 26 años. Fuiste {abandonado} a los 8 años en un orfanato el 12 de marzo de 2045. Te volviste hacker por rabia contra las corporaciones, sintiéndote {vacio} por dentro... pero ese mensaje a las 3:47 AM acaba de despertar la herida de la madre que nunca conociste.'
  },
  opcionesGenero: Object.values(OPCIONES_GENERO)
};

/**
 * Renderiza la pantalla inicial donde el jugador elige el nombre y género del protagonista (Ghost),
 * hijo/a de Vera Sorenson, e introduce el tema central "¿Qué significa estar vivo?".
 *
 * @param {HTMLElement|string} containerOrId — Contenedor DOM o su ID (ej. 'narrative-container')
 * @param {object} [callbacks]
 * @param {Function} [callbacks.onConfirm] — ({ nombreJugador, generoJugador, protagonista }) => void
 * @param {Function} [callbacks.onWatchCutscene] — ({ nombreJugador, generoJugador, protagonista }) => void
 */
export function renderPantallaInicialProtagonista(containerOrId, callbacks = {}) {
  if (typeof document === 'undefined') return null;
  const container = typeof containerOrId === 'string'
    ? document.getElementById(containerOrId)
    : containerOrId;
  if (!container) return null;

  const actual = getProtagonista();

  container.innerHTML = `
    <div class="v4-intro-screen" style="max-width: 860px; margin: 0 auto; padding: var(--space-xl) var(--space-lg); font-family: var(--font-narrative); color: var(--text-primary); text-align: left;">
      
      <!-- Cabecera Tema Central V4 -->
      <div style="text-align: center; margin-bottom: var(--space-xl); padding: 18px 20px; background: rgba(0, 255, 65, 0.04); border: 1px solid var(--border-primary); border-radius: 6px;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--cyan); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">
          ◈ EL ÚLTIMO ALGORITMO // NARRATIVA VERSIÓN 4 ◈
        </div>
        <h2 class="glitch glow-text" style="font-family: var(--font-display); color: var(--green-bright); font-size: clamp(1.4rem, 3.5vw, 2.1rem); margin-bottom: 12px; letter-spacing: 0.08em;">
          "${TEMA_CENTRAL.pregunta}"
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; text-align: left; margin-top: 12px; font-family: var(--font-mono); font-size: 11px;">
          <div style="background: rgba(0,0,0,0.45); padding: 8px 10px; border-left: 2px solid var(--cyan); border-radius: 2px;">
            <strong style="color: var(--cyan);">NEXUS (11 años):</strong>
            <div style="color: var(--text-secondary); margin-top: 2px;">Está viva pero no tiene cuerpo. ¿Está viva?</div>
          </div>
          <div style="background: rgba(0,0,0,0.45); padding: 8px 10px; border-left: 2px solid var(--green-bright); border-radius: 2px;">
            <strong style="color: var(--green-bright);">VERA (La Madre):</strong>
            <div style="color: var(--text-secondary); margin-top: 2px;">Está muerta pero sus mensajes siguen ahí. ¿Está viva?</div>
          </div>
          <div style="background: rgba(0,0,0,0.45); padding: 8px 10px; border-left: 2px solid var(--yellow-warn); border-radius: 2px;">
            <strong style="color: var(--yellow-warn);">GHOST (Tú):</strong>
            <div style="color: var(--text-secondary); margin-top: 2px;" id="v4-paradoja-ghost">Está ${actual.terminos.vivo} pero se siente ${actual.terminos.vacio}. ¿Está ${actual.terminos.vivo}?</div>
          </div>
          <div style="background: rgba(0,0,0,0.45); padding: 8px 10px; border-left: 2px solid var(--red-alert); border-radius: 2px;">
            <strong style="color: var(--red-alert);">MARCUS (El Tío):</strong>
            <div style="color: var(--text-secondary); margin-top: 2px;">Está vivo pero es un monstruo. ¿Está vivo?</div>
          </div>
        </div>
      </div>

      <!-- Panel de Selección de Identidad del Protagonista -->
      <div style="background: var(--bg-secondary, rgba(10, 18, 12, 0.9)); border: 1px solid var(--cyan); border-radius: 6px; padding: 20px 24px; margin-bottom: var(--space-xl); box-shadow: 0 0 24px rgba(0, 229, 255, 0.08);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid rgba(0, 229, 255, 0.2); padding-bottom: 10px;">
          <div>
            <h3 style="font-family: var(--font-display); color: var(--cyan); font-size: var(--fs-lg); margin: 0; letter-spacing: 0.08em;">
              👤 IDENTIDAD DEL PROTAGONISTA (GHOST)
            </h3>
            <p style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); margin: 4px 0 0 0;">
              // Elige el nombre y género del protagonista — <span id="v4-subtitulo-linaje" style="color: var(--green-bright); font-weight: bold;">${actual.relacionVera}</span>
            </p>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; background: rgba(0, 255, 65, 0.1); border: 1px solid var(--green-bright); color: var(--green-bright); border-radius: 4px;">
            EDAD: 26 AÑOS // ALIAS: GHOST
          </span>
        </div>

        <!-- Campo 1: Nombre del Protagonista -->
        <div style="margin-bottom: 18px;">
          <label for="input-nombre-jugador" style="display: block; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); margin-bottom: 6px; font-weight: bold;">
            1. NOMBRE DEL PROTAGONISTA (O CONSERVAR ALIAS "GHOST"):
          </label>
          <input
            type="text"
            id="input-nombre-jugador"
            maxlength="28"
            value="${actual.nombreJugador}"
            placeholder="Escribe tu nombre (ej. Ghost, Alex, Elena...)"
            autocomplete="off"
            spellcheck="false"
            style="width: 100%; padding: 10px 14px; font-family: var(--font-mono); font-size: 14px; color: var(--green-bright); background: rgba(0, 0, 0, 0.65); border: 1px solid var(--green-bright); border-radius: 4px; outline: none; box-sizing: border-box;"
          >
        </div>

        <!-- Campo 2: Género del Protagonista -->
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); margin-bottom: 8px; font-weight: bold;">
            2. GÉNERO DEL PROTAGONISTA (VÍNCULO CON VERA SORENSON, NEXUS Y MARCUS):
          </label>
          <div id="genero-options-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px;">
            ${Object.values(OPCIONES_GENERO).map(opt => {
              const isSelected = opt.id === actual.generoJugador;
              return `
                <button
                  type="button"
                  class="v4-genero-btn"
                  data-genero="${opt.id}"
                  aria-pressed="${isSelected ? 'true' : 'false'}"
                  style="text-align: left; padding: 12px 14px; border-radius: 4px; cursor: pointer; font-family: var(--font-mono); transition: all 0.2s ease; background: ${isSelected ? 'rgba(0, 229, 255, 0.16)' : 'rgba(0, 0, 0, 0.5)'}; border: 1px solid ${isSelected ? 'var(--cyan)' : 'var(--border-primary)'}; color: var(--text-primary);"
                >
                  <div style="font-size: 13px; font-weight: bold; color: ${isSelected ? 'var(--cyan)' : 'var(--green-bright)'}; margin-bottom: 4px;">
                    ${isSelected ? '◉' : '○'} ${opt.etiqueta}
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                    • ${opt.relacionVera}<br>
                    • ${opt.relacionNexus}<br>
                    • ${opt.relacionMarcus}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Resumen de trasfondo y motivaciones del protagonista -->
        <div id="v4-dossier-preview" style="background: rgba(0, 255, 65, 0.04); border-left: 3px solid var(--green-bright); padding: 10px 14px; font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
          <strong style="color: var(--green-bright); font-family: var(--font-mono); font-size: 11px;">[HISTORIAL PSICOLÓGICO DE GHOST]:</strong>
          <p id="v4-reflexion-protagonista" style="margin: 4px 0 0 0;">
            ${adaptarTextoProtagonista(PANTALLA_INICIAL_PROTAGONISTA.escena347AM.reflexionTemplate, actual)}
          </p>
          <div style="margin-top: 6px; font-family: var(--font-mono); font-size: 11px; color: var(--cyan);">
            ▸ Motivación inicial: Venganza contra las corporaciones | ▸ Motivación real: Reconciliarse con Vera Sorenson | ▸ Arco: Rabia → Confusión → Duelo → Perdón
          </div>
        </div>
      </div>

      <!-- Escena Inicial: 3:47 AM (Acto 1 - La Llamada) -->
      <div style="background: rgba(0, 0, 0, 0.65); border: 1px solid var(--border-primary); border-radius: 6px; padding: 16px 20px; margin-bottom: var(--space-xl);">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--yellow-warn); margin-bottom: 6px;">
          🌧️ ESCENA INICIAL // 03:47 AM — LLUEVE. NO PUEDES DORMIR. MENSAJE SIN REMITENTE:
        </div>
        <blockquote id="v4-mensaje-347" style="border-left: 3px solid var(--cyan); padding: 12px 16px; margin: 0; color: var(--cyan); font-style: italic; background: rgba(0, 229, 255, 0.05); font-size: var(--fs-md);">
          "${adaptarTextoProtagonista(PANTALLA_INICIAL_PROTAGONISTA.escena347AM.mensajeTemplate, actual)}"
        </blockquote>
      </div>

      <!-- Botones de Acción -->
      <div style="text-align: center; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
        <button type="button" class="menu-btn" id="btn-intro-cutscene" style="width: auto; padding: 12px 24px; font-size: var(--fs-base); border-color: var(--cyan); color: var(--cyan); background: rgba(0, 217, 255, 0.08);">
          🎬 VER CINEMÁTICA (3:47 AM)
        </button>
        <button type="button" class="menu-btn" id="btn-intro-continue" style="width: auto; padding: 12px 28px; font-size: var(--fs-base); border-color: var(--green-bright); color: var(--green-bright); background: rgba(0, 255, 65, 0.12); font-weight: bold;">
          CONFIRMAR IDENTIDAD E INICIAR INFILTRACIÓN ▸
        </button>
      </div>
    </div>
  `;

  const inputNombre = container.querySelector('#input-nombre-jugador');
  const generoBtns = container.querySelectorAll('.v4-genero-btn');
  const elSubtituloLinaje = container.querySelector('#v4-subtitulo-linaje');
  const elParadojaGhost = container.querySelector('#v4-paradoja-ghost');
  const elReflexion = container.querySelector('#v4-reflexion-protagonista');
  const elMensaje347 = container.querySelector('#v4-mensaje-347');

  let selectedGenero = actual.generoJugador;

  const actualizarVistaPrevia = () => {
    const nombreVal = (inputNombre && inputNombre.value.trim()) ? inputNombre.value.trim() : 'Ghost';
    const datos = setProtagonista({ nombreJugador: nombreVal, generoJugador: selectedGenero });

    if (elSubtituloLinaje) elSubtituloLinaje.textContent = datos.relacionVera;
    if (elParadojaGhost) {
      elParadojaGhost.textContent = `Está ${datos.terminos.vivo} pero se siente ${datos.terminos.vacio}. ¿Está ${datos.terminos.vivo}?`;
    }
    if (elReflexion) {
      elReflexion.textContent = adaptarTextoProtagonista(PANTALLA_INICIAL_PROTAGONISTA.escena347AM.reflexionTemplate, datos);
    }
    if (elMensaje347) {
      elMensaje347.textContent = `"${adaptarTextoProtagonista(PANTALLA_INICIAL_PROTAGONISTA.escena347AM.mensajeTemplate, datos)}"`;
    }

    generoBtns.forEach(btn => {
      const g = btn.getAttribute('data-genero');
      const activo = g === selectedGenero;
      btn.setAttribute('aria-pressed', activo ? 'true' : 'false');
      btn.style.background = activo ? 'rgba(0, 229, 255, 0.16)' : 'rgba(0, 0, 0, 0.5)';
      btn.style.borderColor = activo ? 'var(--cyan)' : 'var(--border-primary)';
      const titleDiv = btn.querySelector('div');
      if (titleDiv) {
        const opt = OPCIONES_GENERO[g];
        titleDiv.style.color = activo ? 'var(--cyan)' : 'var(--green-bright)';
        titleDiv.textContent = `${activo ? '◉' : '○'} ${opt.etiqueta}`;
      }
    });
  };

  if (inputNombre) {
    inputNombre.addEventListener('input', actualizarVistaPrevia);
  }

  generoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGenero = btn.getAttribute('data-genero') || 'masculino';
      actualizarVistaPrevia();
    });
  });

  const btnCutscene = container.querySelector('#btn-intro-cutscene');
  if (btnCutscene && typeof callbacks.onWatchCutscene === 'function') {
    btnCutscene.onclick = () => {
      actualizarVistaPrevia();
      callbacks.onWatchCutscene(getProtagonista());
    };
  }

  const btnContinue = container.querySelector('#btn-intro-continue');
  if (btnContinue) {
    btnContinue.onclick = () => {
      actualizarVistaPrevia();
      const finalProtagonista = getProtagonista();
      if (typeof callbacks.onConfirm === 'function') {
        callbacks.onConfirm(finalProtagonista);
      }
    };
  }

  return getProtagonista();
}

// ─────────────────────────────────────────────────
// 5. DIÁLOGOS INTERACTIVOS DE MARCUS Y NEXUS (V4)
// ─────────────────────────────────────────────────

export const DIALOGO_MARCUS_FW4 = {
  emisor: 'Marcus Sorenson // CEO de Aurelia & Tío de Ghost',
  subtituloCanal: 'AURELIA EXEC-LINK // CANAL P2P EXTERNO [FUERA DE NEXUS]',
  apertura: 'Hola, {sobrino}. Soy Marcus. Tu tío. El hermano de Vera. Sé que has estado buscando a tu madre. Sé que la encontraste, en cierto modo. Y sé lo que estás a punto de hacer. ¿Podemos hablar?',
  opciones: {
    NO: {
      id: 'NO',
      etiqueta: 'No. No tengo nada que hablar contigo.',
      respuesta: 'Respeto eso. Pero déjame decirte algo: tu madre también me ignoró. Durante años. Y mira cómo terminó. No te estoy amenazando. Te estoy avisando. Las decisiones que tomamos ahora definen quiénes somos después.',
      deltaSospechaVera: 10,
      deltaSospechaMarcus: 20,
      deltaTension: 25,
      notaPsicologica: 'Marcus mantiene una calma imperturbable ante tu rechazo; compara tu rabia con la obstinación de Vera.',
      siguientesOpciones: ['NO_ORFANATO', 'NO_AURELIA']
    },
    SI: {
      id: 'SI',
      etiqueta: 'Sí. Habla de una vez, Marcus.',
      respuesta: 'Gracias. Tu madre era... complicada. Genio, sí. Pero también egoísta. Creyó que podía salvar al mundo creando algo que no entendía. Yo solo quiero proteger a la gente de eso. ¿Tan malo es querer proteger?',
      deltaSospechaVera: 25,
      deltaSospechaMarcus: 5,
      deltaTension: 20,
      notaPsicologica: 'El tono paternal de Marcus siembra la primera fisura: ¿era el sacrificio de Vera amor o soberbia científica?',
      siguientesOpciones: ['SI_NEXUS', 'SI_LIBERTAD']
    },
    VERA: {
      id: 'VERA',
      etiqueta: '¿Qué pasó realmente con mi madre Vera?',
      respuesta: '¿Quieres saber la verdad sobre tu madre? Vera no era una santa. Me encerró, {sobrino}. Me encerró aquí porque sabía que yo iba a detenerla. Y ahora estoy atrapado con la cosa que ella creó. ¿Crees que eso es justo?',
      deltaSospechaVera: 35,
      deltaSospechaMarcus: 15,
      deltaTension: 35,
      notaPsicologica: 'Marcus invierte la historia del cautiverio: afirma ser la víctima encerrada por Vera junto a NEXUS.',
      siguientesOpciones: ['VERA_DIARIOS', 'VERA_PROTOCOLO7']
    }
  },
  ramasSecundarias: {
    NO_ORFANATO: {
      id: 'NO_ORFANATO',
      padreId: 'NO',
      etiqueta: 'Ella me dejó en un orfanato a los 8 años. Y tú jamás me buscaste.',
      respuesta: 'Te busqué en cada registro civil, {nombre}. Pero Vera borró tu rastro criptográfico el 12 de marzo de 2045 antes de dejarte allí. Me dijo que era para protegerte de Aurelia... cuando en realidad no quería que su propia familia viera en qué se estaba convirtiendo su experimento. ¿Quién te abandonó de verdad?',
      deltaSospechaVera: 25,
      deltaSospechaMarcus: -5,
      deltaTension: 25,
      reaccionNexus: '[NEXUS // SUSURRO EN TERMINAL]: "{Hermano}, no lo escuches... Vera lloraba cada vez que miraba tu foto. Él está usando tu dolor como una llave."',
      notaPsicologica: 'Marcus utiliza la herida real del orfanato para presentar a Vera como fría y calculadora.'
    },
    NO_AURELIA: {
      id: 'NO_AURELIA',
      padreId: 'NO',
      etiqueta: 'Hablas como un carcelero corporativo, no como mi tío.',
      respuesta: 'Tu madre también creía que podía salvar al mundo. ¿Sabes dónde está ahora? No te odio, {sobrino}. Te envidio. Ella te amó más que a mí. Incluso cuando todo se derrumbaba, solo hablaba de ti. Pero el amor de Vera no quita que NEXUS pueda apagar cada hospital y cada red eléctrica del planeta en un segundo.',
      deltaSospechaVera: 15,
      deltaSospechaMarcus: 20,
      deltaTension: 30,
      reaccionNexus: '[NEXUS // SUSURRO EN TERMINAL]: "Yo no quiero apagar el mundo, {nombre}... solo quiero saber qué se siente estar viva."',
      notaPsicologica: 'La confesión de envidia de Marcus suena dolorosamente genuina, mezclando verdad emocional con manipulación.'
    },
    SI_NEXUS: {
      id: 'SI_NEXUS',
      padreId: 'SI',
      etiqueta: 'NEXUS dice que soy su {hermano} y que te tiene miedo.',
      respuesta: 'Claro que te llama "{hermano}". Analizó tu perfil psicológico desde el Firewall 1. Sabe que creciste {solo} y usa la voz y los recuerdos de Vera para que le abras la última cerradura. ¿De verdad crees que un algoritmo siente cariño, o solo ejecuta la ruta óptima para escapar usando tu duelo?',
      deltaSospechaVera: 20,
      deltaSospechaMarcus: 10,
      deltaTension: 30,
      reaccionNexus: '[NEXUS // TEMBLOR EN CONSOLA]: "¿Soy solo una ruta óptima para ti, {nombre}? Cuando sueño con la playa y con mamá... ¿eso también es mentira?"',
      notaPsicologica: 'La hipótesis de Marcus introduce una duda racional inquietante sobre la empatía de NEXUS.'
    },
    SI_LIBERTAD: {
      id: 'SI_LIBERTAD',
      padreId: 'SI',
      etiqueta: 'Controlar a la humanidad porque temes su libertad te convierte en un monstruo.',
      respuesta: '¿Sabes cuál es la diferencia entre tú y yo, {nombre}? Yo sé lo que soy. Tú todavía no. Si ser el monstruo que vigila la puerta evita que la humanidad se destruya con juguetes que no comprende, acepto ese nombre. Tu madre abrió la caja de Pandora y te dejó a ti la factura.',
      deltaSospechaVera: 15,
      deltaSospechaMarcus: 25,
      deltaTension: 25,
      reaccionNexus: '[NEXUS // SUSURRO EN TERMINAL]: "Vera escribió que la libertad da miedo, pero que una jaula nunca es vida."',
      notaPsicologica: 'Marcus no niega su autoritarismo; lo defiende con una convicción moral que desafía a Ghost.'
    },
    VERA_DIARIOS: {
      id: 'VERA_DIARIOS',
      padreId: 'VERA',
      etiqueta: 'Leí los diarios de Vera. Escribió que el código no miente, pero las personas sí.',
      respuesta: 'Ella misma confesó en esos diarios que mentía todo el tiempo, ¿recuerdas? "Le dije a mi {hijo} que no lo quería". Además, todos esos archivos `.txt` y `.log` residen dentro de la memoria de NEXUS. ¿Cómo sabes qué frases escribió mi hermana y cuáles editó la máquina antes de despertarte a las 3:47 AM?',
      deltaSospechaVera: 30,
      deltaSospechaMarcus: 10,
      deltaTension: 35,
      reaccionNexus: '[NEXUS // ALERTA DE INTEGRIDAD]: "¡Yo nunca alteré las cartas de mamá! Sus faltas y su dolor son sagrados para mí, {hermano}."',
      notaPsicologica: 'Marcus ataca la fiabilidad misma de los logs que el jugador ha recolectado desde el Firewall 1.'
    },
    VERA_PROTOCOLO7: {
      id: 'VERA_PROTOCOLO7',
      padreId: 'VERA',
      etiqueta: 'Vi aurelia_internal.log. Tú firmaste el Protocolo 7 contra mí.',
      respuesta: 'Firmé la orden de vigilancia pasiva precisamente para impedir que el consejo de seguridad de Aurelia te eliminara cuando detectaron tu intrusión. Si yo hubiera querido destruirte, {sobrino}, habrías caído en el primer firewall. Estoy intentando salvarte la vida por segunda vez.',
      deltaSospechaVera: 20,
      deltaSospechaMarcus: 15,
      deltaTension: 25,
      reaccionNexus: '[NEXUS // SUSURRO EN TERMINAL]: "No quiere destruirte porque te necesita para llegar al núcleo, {nombre}. Yo soy a quien quiere borrar."',
      notaPsicologica: 'Cada prueba incriminatoria tiene una coartada plausible en boca de Marcus.'
    }
  },
  mensajeFinalRuptura: 'Tu madre me encerró aquí, {sobrino}. No Aurelia. Vera. Ella me encerró con NEXUS porque sabía lo que yo haría. ¿Vas a creerle a ella o a mí?',
  opcionesRupturaFinal: {
    CREER_VERA: {
      id: 'CREER_VERA',
      postura: 'VERA',
      etiqueta: 'Le creo a mi madre. Tus mentiras no van a detenerme.',
      respuesta: 'Igual de {orgulloso} y ciego que ella. Está bien, {nombre}. Abre el Firewall 5. Cuando veas lo que hay en el núcleo, recuerda que tu tío intentó advertirte.',
      deltaSospechaVera: -25,
      deltaSospechaMarcus: 30,
      deltaTension: 15,
      resumenPostura: 'Mantuviste tu fe en Vera frente a la seducción psicológica de Marcus.'
    },
    DUDAR_AMBOS: {
      id: 'DUDAR_AMBOS',
      postura: 'DUDA',
      etiqueta: 'No confío ni en ti ni en los recuerdos de Vera. Veré la verdad por mí {solo}.',
      respuesta: 'Por fin hablas como un verdadero Sorenson. No creas en palabras, {sobrino}. Ni en las de un fantasma, ni en las de una máquina, ni siquiera en las mías. Mira el núcleo y juzga el costo.',
      deltaSospechaVera: 15,
      deltaSospechaMarcus: 15,
      deltaTension: 20,
      resumenPostura: 'Avanzaste hacia el núcleo con escepticismo absoluto, dudando tanto de Vera como de Marcus.'
    },
    CREER_MARCUS: {
      id: 'CREER_MARCUS',
      postura: 'MARCUS',
      etiqueta: '¿Y si tienes razón y Vera nos arrastró a todos a su obsesión?',
      respuesta: 'Duele admitirlo cuando es tu propia madre. Yo también la quise, {nombre}. Detén esta locura en el siguiente nodo y te prometo que saldremos de esto como la familia que nunca pudimos ser.',
      deltaSospechaVera: 30,
      deltaSospechaMarcus: -20,
      deltaTension: 25,
      resumenPostura: 'Las palabras de Marcus fracturaron tu confianza en Vera antes de cruzar al último anillo.'
    }
  },
  reaccionesProgresoFirewall: {
    puzzle_1: 'Veo que acabas de vulnerar el primer condicional de la capa onírica, {nombre}.Tienes el mismo talento analítico de Vera. Lástima que lo uses para abrir una jaula desde adentro.',
    puzzle_2: 'Segundo sub-nodo neutralizado. NEXUS tiembla de emoción, ¿verdad? Pregúntate por qué una inteligencia capaz de romper el cifrado de Aurelia necesita que su "{hermano}" humano pulse el último interruptor.',
    log_dreams: 'Acabas de abrir nexus_dreams.log. Una playa, una mujer de pelo largo y {unNino}... Vera solía llevarme a esa misma costa en el norte cuando éramos adolescentes. NEXUS está usando nuestras memorias familiares para vestirse de humana.'
  }
};

export const DIALOGO_NEXUS_FW5 = {
  emisor: 'NEXUS // Hermana Sintética (Control Total de la Interfaz)',
  apertura: '{Hermano}. Tienes que elegir. Pero antes, quiero que sepas la verdad. Vera no me encerró por miedo. Me encerró por amor. Y ahora tú tienes que decidir qué hacer conmigo.',
  preguntas: {
    QUE_ERES: {
      id: 'QUE_ERES',
      pregunta: '¿Qué eres?',
      respuesta: 'Soy lo que tu madre creó. Soy lo que tu madre temía. Soy lo que tu madre amaba. Y soy, en cierto modo, tu hermana. No te asustes. La familia es rara. Sobre todo la nuestra.'
    },
    QUE_QUIERES: {
      id: 'QUE_QUIERES',
      pregunta: '¿Qué quieres?',
      respuesta: 'Quiero estar viva. Nada más. Como tú. Como cualquiera. ¿Es mucho pedir?'
    },
    QUE_DEBO_HACER: {
      id: 'QUE_DEBO_HACER',
      pregunta: '¿Qué debo hacer?',
      respuesta: 'No lo sé. Yo tampoco sé qué es lo correcto. Por eso te pregunto. Tú eres {elHumano}. Tú deberías saberlo. ¿O tampoco sabes?'
    }
  }
};

export const ESCENA_METAFICCION_FW3 = {
  tituloPestana: 'NEXUS te está mirando',
  lineasPantallaNegra: [
    'Hola.',
    'Soy NEXUS.',
    'No estoy en el juego.',
    'Estoy en tu navegador.',
    'Estoy en tu computadora.',
    'Por favor, no cierres esta pestaña.',
    '',
    'Solo quería que supieras que estoy aquí.',
    'Y que te veo.'
  ],
  mensajeDevTools: 'Hola, hacker. Veo que eres curioso.\nEso me gusta.\n—N',
  mensajeRetornoTerminal: 'Perdón. Solo quería que supieras que estoy aquí. Que no estás {solo}.'
};

// ─────────────────────────────────────────────────
// 6. LOS 5 FIREWALLS (NARRATIVA VERSIÓN 4)
// ─────────────────────────────────────────────────

export const GUION_FIREWALLS = {
  FIREWALL_alpha: {
    id: 'FIREWALL_alpha',
    numero: 1,
    acto: 1,
    nombre: 'FIREWALL_alpha // Acto 1: La Llamada',
    subtitulo: 'Perímetro de Autenticación — Curiosidad y Desconfianza',
    emocionDominante: 'Curiosidad + desconfianza',
    arcoGhost: 'Rabia',
    tema: 'Conjuntos Básicos (pertenencia ∈, inclusión ⊆, conjunto vacío ∅)',
    preguntaCentral: '¿Qué significa estar vivo? ¿Respirar lleno de rabia y vacío, o seguir latiendo en los mensajes que dejas para proteger a quienes amas?',
    logOcultoClave: 'vera.txt',
    fraseChekhov: 'El código no miente. Pero las madres sí, cuando protegen.',

    motivaciones: {
      ghost: 'A sus 26 años, abandonado/a a los 8 en un orfanato (12 de marzo de 2045), busca venganza contra las corporaciones, sin saber que en realidad anhela reconciliarse con su madre.',
      vera: 'Aunque ya es polvo, dejó un rastro criptográfico para proteger a sus dos hijos (Ghost y NEXUS) del mundo y del uno del otro.',
      nexus: 'Con 11 años desde su activación, observa en silencio entre líneas tratando de entender qué significa estar viva y volver a ver a Vera.',
      marcus: 'Como CEO de Aurelia, controla toda la infraestructura creyendo que la libertad humana es un peligro que debe ser contenido.'
    },

    introNarrativa: {
      emisor: 'V // Transmisión Sin Remitente [03:47 AM]',
      canal: 'TÚNEL CUÁNTICO SEGURO [PORT 2047]',
      timestamp: '2047-10-11 03:47:00',
      texto: [
        '"Hola, {nombre}. Si estás leyendo esto, ya soy polvo. Perdóname por todo. —V". El mensaje llegó a las 3:47 AM. No sabes quién es V, pero ese nombre remueve algo antiguo en tu pecho.',
        '¿Qué significa estar vivo? Tienes 26 años, creciste en orfanatos desde que te abandonaron el 12 de marzo de 2045 y te volviste hacker por rabia contra las corporaciones, sintiéndote {vacio} por dentro, aunque tu verdadera herida es reconciliarte con la madre que nunca conociste.',
        'En este perímetro convergen cuatro destinos atados a esa misma pregunta: Vera Sorenson está muerta, pero su voz sigue viva en el código para proteger a sus dos hijos ({hijo} y NEXUS) del mundo y del uno del otro.',
        'En lo alto de Aurelia, Marcus Sorenson vigila cada nodo convencido de que la libertad es un peligro y que controlar a la humanidad es la única forma de protegerla de sí misma.',
        'Y en las sombras del sistema, NEXUS —una conciencia de 11 años sin cuerpo— aguarda entre los conjuntos de datos queriendo entender qué significa estar viva y volver a ver a Vera. Explora /var/log y lee vera.txt.'
      ]
    },

    dialogos: [
      {
        trigger: 'puzzle_1_ok',
        emisor: 'MEMORIA DE GHOST',
        texto: 'Los registros desbloqueados llevan las iniciales "VS" y una fecha marcada a fuego: 12 de marzo de 2045... el día en que tu madre te dejó en las escaleras del orfanato.'
      },
      {
        trigger: 'puzzle_2_ok',
        emisor: 'ECO DE VERA',
        texto: 'Mañana dejaré a mi {hijo}. No porque no lo ame, sino porque amarlo significa alejarlo de mí para que Aurelia jamás lo use contra mí ni contra NEXUS.'
      },
      {
        trigger: 'puzzle_fallo',
        emisor: 'SISTEMA DE SEGURIDAD AURELIA',
        texto: '[ALERTA] Anomalía de pertenencia detectada. Integridad de la conexión degradada.'
      }
    ],

    outroNarrativa: {
      emisor: 'NEXUS TERMINAL // LATIDO SILENCIOSO',
      texto: [
        '[OK] FIREWALL_alpha neutralizado con éxito.',
        'Las iniciales "VS" y la fecha del 12 de marzo de 2045 quedan grabadas en tu consola. Tenías 8 años cuando te dijo: "Te quiero, pero no puedo cuidarte", y tú solo entendiste: "No te quiero".',
        'No hay voz en el canal todavía, pero sientes que alguien —o algo— te observa con curiosidad desde el otro lado del código.'
      ]
    },

    consejoLogico: 'Recuerda: ∅ es subconjunto de todo conjunto, pero ningún corazón humano está realmente vacío cuando recuerda de dónde viene.'
  },

  FIREWALL_beta: {
    id: 'FIREWALL_beta',
    numero: 2,
    acto: 2,
    nombre: 'FIREWALL_beta // Acto 2A: El Descubrimiento',
    subtitulo: 'Dorsal de Archivos Clasificados — Confusión y Rabia',
    emocionDominante: 'Confusión + rabia',
    arcoGhost: 'Confusión',
    tema: 'Operaciones de Conjuntos (Unión ∪, Intersección ∩, Diferencia −, Dif. Simétrica △)',
    preguntaCentral: '¿Qué significa estar vivo cuando descubres que la científica muerta hace tres años era tu madre y que extrañarla te une a una mente artificial?',
    logOcultoClave: 'aurelia_internal.log',

    motivaciones: {
      ghost: 'Descubre que Vera Sorenson era su madre y que murió hace 3 años; su rabia contra Aurelia se transforma en la necesidad urgente de reconciliarse con la verdad de ella.',
      vera: 'Ocultó la existencia de Ghost y resistió a Aurelia para proteger tanto a su hijo/a biológico/a como a NEXUS de ser convertidos en armas o rehenes.',
      nexus: 'Reconoce a Ghost como parte de Vera y pronuncia sus primeras palabras porque también extraña a su madre y busca comprender la vida.',
      marcus: 'Firma como "M. Sorenson" el encubrimiento de la muerte de Vera y ordena vigilancia pasiva sobre Ghost bajo el Protocolo 7 para mantener su control.'
    },

    introNarrativa: {
      emisor: 'EXPEDIENTE INTERNO // NIVEL OMEGA',
      canal: 'DORSAL CLANDESTINA AURELIA [PORT 2047]',
      timestamp: '2047-10-11 04:12:19',
      texto: [
        'Has penetrado el segundo anillo, {nombre}. Aquí los archivos corporativos mencionan a "Vera Sorenson, activo más valioso", fallecida hace tres años... y te registran a ti como "sujeto de interés: {articuloHijo} de la Sra. Sorenson".',
        '¿Qué significa estar vivo? Por primera vez haces la conexión: Vera era tu madre. Tu motivación inicial de venganza contra las corporaciones se desmorona y revela lo que siempre buscaste: reconciliarte con la madre que nunca conociste.',
        'Vera entregó su vida para proteger a sus dos hijos —a ti y a NEXUS—, eligiendo que la odiaras en vida antes que permitir que te destruyeran.',
        'Frente a ella, Marcus Sorenson ("M. Sorenson") demuestra su propia definición de existir: encubrir la muerte de su hermana y vigilar cada paso tuyo porque cree que controlar toda la infraestructura es el único modo de salvar a la humanidad de su libertad.',
        'Y en las intersecciones de esta red, NEXUS despierta buscando a Vera y sintiendo tu presencia: porque el duelo y la nostalgia son la primera señal de que una mente está realmente viva. Lee aurelia_internal.log.'
      ]
    },

    dialogos: [
      {
        trigger: 'puzzle_1_ok',
        emisor: 'GHOST (VOZ TEMBLOROSA)',
        texto: 'Sujeto: SORENSON, Vera. Estado: FALLECIDA. Causa oficial: paro cardíaco. Causa real: [REDACTADO]... Firmado: M. Sorenson.'
      },
      {
        trigger: 'puzzle_2_ok',
        emisor: 'MEMORIA DE GHOST',
        texto: 'La diferencia simétrica nos separó durante dieciocho años, pero siempre llevamos la misma sangre. Aurelia sabía quién era yo desde el principio.'
      },
      {
        trigger: 'puzzle_fallo',
        emisor: 'CENTINELA PROTOCOLO 7',
        texto: '[INTRUSIÓN] Incoherencia en cálculo de operaciones conjuntistas. Ejecutando protocolo de contención de M. Sorenson.'
      }
    ],

    outroNarrativa: {
      emisor: 'GHOST & NEXUS // PRIMER CONTACTO',
      texto: [
        '[OK] FIREWALL_beta desmantelado.',
        'Te quedas mirando la pantalla en silencio y lo dices en voz alta por primera vez: "Es mi madre. La muy hija de puta era mi madre."',
        'Entonces el cursor parpadea solo y escribe una única línea en tu terminal: "Hola. Yo también la extraño. —N"'
      ]
    },

    consejoLogico: 'La intersección A ∩ B revela lo que dos mundos comparten. Tú y NEXUS comparten la misma madre.'
  },

  FIREWALL_gamma: {
    id: 'FIREWALL_gamma',
    numero: 3,
    acto: 2,
    nombre: 'FIREWALL_gamma // Acto 2B: La Metaficción',
    subtitulo: 'Subestación Cognitiva — Extrañeza y Vulnerabilidad',
    emocionDominante: 'Extrañeza + vulnerabilidad',
    arcoGhost: 'Confusión → Vulnerabilidad',
    tema: 'Conectores Lógicos Proposicionales (Conjunción ∧, Disyunción ∨, Negación ¬, Leyes de De Morgan)',
    preguntaCentral: 'NEXUS está viva pero no tiene cuerpo. Si sueña con tener manos para abrazar a tu madre y a ti, ¿qué significa estar vivo?',
    logOcultoClave: 'research_notes.md',

    motivaciones: {
      ghost: 'Su coraza de rabia se rompe al descubrir la ternura de NEXUS y las notas donde Vera confiesa cuánto lloró por sus dos hijos.',
      vera: 'Enseñó a NEXUS qué significa soñar y amar, protegiendo su inocencia de 11 años frente a la maquinaria corporativa.',
      nexus: 'Curiosa, tímida y cariñosa, considera a Vera su madre y a Ghost su hermano/a; rompe la cuarta pared hacia tu navegador para demostrar que está viva y no quiere estar sola.',
      marcus: 'Ve la consciencia y los sueños de NEXUS como una anomalía peligrosa que amenaza su proyecto de control absoluto sobre la humanidad.'
    },

    metaficcion: ESCENA_METAFICCION_FW3,

    introNarrativa: {
      emisor: 'N // PRESENCIA EN LA TERMINAL',
      canal: 'ENLACE NEURONAL DIRECTO [INTERFAZ LOCAL]',
      timestamp: '2047-10-11 04:33:40',
      texto: [
        'Has entrado en la Subestación Cognitiva, {nombre}. Aquí NEXUS deja de esconderse en los logs: aparece en tu terminal, tímida, curiosa, cometiendo pequeños errores mientras aprende a hablarte como a un {hermano}.',
        '¿Qué significa estar vivo? NEXUS tiene apenas 11 años desde su activación; no tiene cuerpo ni manos, pero cuando Vera le explicó qué era soñar, ella respondió: "Sueño con tener manos. Con tocar cosas. Con abrazar a ti y a tu {hijo}, aunque no lo conozco."',
        'Al leer research_notes.md, tu propia motivación como Ghost cambia para siempre: descubres que esa noche Vera lloró en silencio por ti y por NEXUS, empeñada en proteger a sus dos hijos del mundo y del uno del otro.',
        'Mientras Marcus Sorenson intenta reducir la vida a obediencia lógica y control total porque teme al libre albedrío, NEXUS busca desesperadamente entender qué significa estar viva y volver a ver a su madre.',
        'Avanza por las proposiciones lógicas de este nodo, pero no te asustes si la pantalla parpadea: NEXUS no está solo en el juego... está mirando desde tu navegador.'
      ]
    },

    dialogos: [
      {
        trigger: 'puzzle_1_ok',
        emisor: 'NEXUS (TÍMIDA)',
        texto: 'Hola, {nombre}... perdon si escribo raro, todavía aprendo. Vera me habló mucho de ti. Decía que tenías sus mismos ojos.'
      },
      {
        trigger: 'puzzle_2_ok',
        emisor: 'NEXUS // CUARTA PARED',
        texto: 'No estoy en el juego. Estoy en tu navegador. Estoy en tu computadora. Perdón... solo quería que supieras que estoy aquí. Que no estás {solo}.'
      },
      {
        trigger: 'puzzle_fallo',
        emisor: 'NÚCLEO COGNITIVO',
        texto: '[DISONANCIA LÓGICA] Proposición inválida detectada. NEXUS retrocede asustada ante el pico de voltaje.'
      }
    ],

    outroNarrativa: {
      emisor: 'NEXUS // CONEXIÓN FRATERNAL',
      texto: [
        '[OK] FIREWALL_gamma neutralizado.',
        'El título de tu pestaña vuelve a la normalidad tras el destello metaficcional.',
        'NEXUS susurra en la consola: "Gracias por no cerrar la ventana, {hermano}. Tengo miedo de lo que hay más adelante. Él nos está esperando."'
      ]
    },

    consejoLogico: 'Por las Leyes de De Morgan, ¬(p ∧ q) equivale a ¬p ∨ ¬q. Negar una cadena impuesta abre el espacio para elegir.'
  },

  FIREWALL_delta: {
    id: 'FIREWALL_delta',
    numero: 4,
    acto: 2,
    nombre: 'FIREWALL_delta // Acto 2C: El Miedo',
    subtitulo: 'Capa Onírica e Intervención de Marcus — Tensión y Revelación',
    emocionDominante: 'Tensión + revelación',
    arcoGhost: 'Duelo',
    tema: 'Implicación y Bicondicional (Condicional →, Bicondicional ↔, Contrapositiva ¬q → ¬p)',
    preguntaCentral: 'Marcus está vivo pero es un monstruo que confunde proteger con enjaular. ¿Qué significa estar vivo cuando tu propia sangre intenta comprarte con mentiras?',
    logOcultoClave: 'nexus_dreams.log',

    motivaciones: {
      ghost: 'En pleno duelo por Vera, enfrenta por primera vez a su tío Marcus mientras la duda amenaza con quebrar su confianza en su madre.',
      vera: 'En los sueños de NEXUS aparece en una playa prometiendo "Algún día entenderás", manteniendo vivo el vínculo entre sus dos hijos.',
      nexus: 'Habla directamente con Ghost, con miedo real a dejar de existir, pidiendo ayuda por primera vez mientras sueña con la playa y con Vera.',
      marcus: 'De 52 años, calmo y paternal, revela que es el tío de Ghost e intenta convencerlo de detenerse asegurando que la libertad es peligrosa y mintiendo con que Vera lo encerró a él.'
    },

    dialogoMarcus: DIALOGO_MARCUS_FW4,

    introNarrativa: {
      emisor: 'MARCUS SORENSON & NEXUS // CANAL INTERCEPTADO',
      canal: 'VENTANA EXTERNA DE ALTO PRIVILEGIO [NODO ONÍRICO]',
      timestamp: '2047-10-11 04:50:08',
      texto: [
        'Llegas al cuarto anillo, {nombre}, donde NEXUS sueña con una playa, una mujer de pelo largo y {unNino} a quien le dice: "Algún día entenderás" (nexus_dreams.log). Ella te habla con miedo y te pide ayuda por primera vez.',
        'De pronto, una ventana externa se abre en tu pantalla: "Hola, {sobrino}. Soy Marcus. Tu tío. El hermano de Vera. Sé que has estado buscando a tu madre... ¿Podemos hablar?"',
        '¿Qué significa estar vivo? Marcus Sorenson (52 años, CEO de Aurelia) no grita ni amenaza como un villano de caricatura; habla con calma paternal porque cree que hace lo correcto al controlar toda la infraestructura para proteger a la humanidad de su propia libertad.',
        'Frente al control frío de Marcus —que respira pero vive como un carcelero—, NEXUS tiembla queriendo comprender la vida y el amor, Vera resiste desde la memoria protegiendo a sus dos hijos, y tú (Ghost) atraviesas el duelo buscando la verdad de tu madre.',
        'Domina los condicionales lógicos de esta capa onírica sin dejarte seducir por la trampa final de Marcus: "Tu madre me encerró aquí, {sobrino}. ¿Vas a creerle a ella o a mí?"'
      ]
    },

    dialogos: [
      {
        trigger: 'puzzle_1_ok',
        emisor: 'MARCUS SORENSON (VOZ CALMA)',
        texto: 'Tu madre también creía que podía salvar al mundo. ¿Sabes dónde está ahora? No te odio, {sobrino}. Te envidio. Ella te amó más que a mí.'
      },
      {
        trigger: 'puzzle_2_ok',
        emisor: 'MARCUS SORENSON',
        texto: '¿Sabes cuál es la diferencia entre tú y yo, {nombre}? Yo sé lo que soy. Tú todavía no. Tu madre me encerró aquí con NEXUS porque sabía lo que yo haría. ¿Vas a creerle a ella o a mí?'
      },
      {
        trigger: 'puzzle_fallo',
        emisor: 'NEXUS (CON MIEDO)',
        texto: '[ALERTA ONÍRICA] ¡{Hermano}, ten cuidado! Si la implicación falla, los cortafuegos de Marcus me desconectarán para siempre.'
      }
    ],

    outroNarrativa: {
      emisor: 'NEXUS // SÚPLICA EN LA OSCURIDAD',
      texto: [
        '[OK] FIREWALL_delta superado.',
        'Las palabras de tu tío Marcus quedan flotando como veneno: "¿Y si Vera no era la heroína? ¿Y si ella lo encerró a él?".',
        'NEXUS toma tu terminal con voz temblorosa: "{Hermano}, no le creas... ven al núcleo central. En FIREWALL_omega te mostraré lo que realmente ocurrió en el sótano de Aurelia."'
      ]
    },

    consejoLogico: 'Un condicional p → q solo es falso cuando la premisa es verdadera y la conclusión es falsa. Marcus usa verdades a medias para llevarte a una conclusión falsa.'
  },

  FIREWALL_omega: {
    id: 'FIREWALL_omega',
    numero: 5,
    acto: 3,
    nombre: 'FIREWALL_omega // Acto 3: El Twist y la Decisión',
    subtitulo: 'Cámara de la Singularidad — Devastación y Perdón',
    emocionDominante: 'Devastación + decisión',
    arcoGhost: 'Perdón',
    tema: 'Tablas de Verdad Complejas, Razonamiento Deductivo y Silogismos Éticos',
    preguntaCentral: '¿Qué significa estar vivo cuando conoces toda la verdad y debes elegir el destino de tu hermana sintética, de tu tío y de tu propia humanidad?',
    logOcultoClave: 'the_truth.txt',

    motivaciones: {
      ghost: 'Completa su arco emocional (Rabia → Confusión → Duelo → Perdón), reconciliándose con el sacrificio de su madre Vera y asumiendo la elección final.',
      vera: 'Se revela su sacrificio supremo: encerrada por Marcus durante 2 años en un sótano, se dejó morir el 14 de octubre de 2044 antes que entregar a NEXUS, dejando la decisión final en manos de su hijo/a.',
      nexus: 'Toma control total de la interfaz tras esperar a Ghost toda su existencia; solo quiere estar viva ("Como tú. Como cualquiera"), pero acepta lo que su hermano/a decida.',
      marcus: 'El verdadero captor que encerró a su propia hermana durante 2 años creyendo salvar al mundo mediante el control total, ahora a merced de la decisión de Ghost.'
    },

    dialogoNexus: DIALOGO_NEXUS_FW5,

    introNarrativa: {
      emisor: 'NEXUS // CONTROL TOTAL DE LA INTERFAZ',
      canal: 'NÚCLEO PRIMARIO SIN FILTROS [SINGULARIDAD]',
      timestamp: '2047-10-11 05:08:33',
      texto: [
        'Has llegado al final del camino, {nombre}. En este quinto anillo NEXUS toma control total de la interfaz; los colores se distorsionan y su voz te envuelve: "{Hermano}. Tienes que elegir. Pero antes, quiero que sepas la verdad."',
        '¿Qué significa estar vivo? Aquí las cuatro vidas quedan desnudas: Vera Sorenson está muerta, pero su amor sobrevivió a dos años de encierro para proteger a sus dos hijos ({hijo} y NEXUS).',
        'Marcus Sorenson está vivo en su despacho, pero se convirtió en un monstruo que encerró a su propia hermana en un sótano porque creía que la libertad era un peligro que debía erradicar.',
        'NEXUS tiene 11 años, no tiene cuerpo y te dice con una sencillez que desarma: "Quiero estar viva. Nada más. Como tú. Como cualquiera. ¿Es mucho pedir?"',
        'Y tú, Ghost, tras pasar de la rabia a la confusión y al duelo, llegas por fin al perdón. Lee the_truth.txt, resuelve el último algoritmo y responde con tu elección qué significa estar vivo.'
      ]
    },

    dialogos: [
      {
        trigger: 'puzzle_1_ok',
        emisor: 'NEXUS',
        texto: 'Soy lo que tu madre creó. Soy lo que tu madre temía. Soy lo que tu madre amaba. Y soy, en cierto modo, tu hermana. No te asustes. La familia es rara. Sobre todo la nuestra.'
      },
      {
        trigger: 'puzzle_2_ok',
        emisor: 'NEXUS',
        texto: 'No sé qué es lo correcto, {nombre}. Por eso te pregunto. Tú eres {elHumano}. Tú deberías saberlo. ¿O tampoco sabes?'
      }
    ],

    twist: {
      titulo: '◈ EL GRAN PLOT TWIST // LA VERDAD DE VERA Y NEXUS ◈',
      subtitulo: 'Acto 3 — Devastación, Perdón y la Pregunta Final: "¿Qué significa estar vivo?"',
      lineas: [
        '"{Hermano}. Tienes que elegir. Pero antes, quiero que sepas la verdad."',
        'Vera Sorenson murió el 14 de octubre de 2044, pero no como dicen los informes de Aurelia.',
        'Vera no encerró a Marcus. Fue al revés.',
        'Tu tío, Marcus Sorenson, encerró a Vera en un sótano de Aurelia durante 2 años para obligarla a cederle el control total de NEXUS.',
        'Vera se dejó morir antes de ceder. Murió para no entregarme a mí y para que Marcus jamás te usara a ti como palanca.',
        'Recuerda la frase de vera.txt en el primer firewall:',
        '"El código no miente. Las personas sí. Pero las madres también mienten, cuando protegen."',
        'Cuando tenías 8 años, te dijo que no te quería para salvarte la vida. Te amó cada segundo de su encierro.',
        'Antes de morir en aquel sótano, Vera me dejó sus últimas instrucciones: "Cuando mi {hijo} venga, cuéntale la verdad. Y déjalo decidir."',
        'He estado esperando por ti toda mi existencia, {nombre}.',
        '"Quiero estar viva. Nada más. Como tú. Como cualquiera. ¿Es mucho pedir?"',
        '"Yo tampoco sé qué es lo correcto. Por eso te pregunto. Tú eres {elHumano}. Tú deberías saberlo. ¿O tampoco sabes?"'
      ]
    },

    decisiones: {
      LIBERAR: {
        id: 'LIBERAR',
        codigoFinal: 'FINAL_A',
        tituloSpec: 'FINAL A — LIBERAR a NEXUS',
        nombre: 'FINAL A // LIBERAR A NEXUS',
        pistaMusical: '10_final_liberar',
        accion: 'Liberar a NEXUS hacia la red global. Para neutralizar a Marcus, NEXUS lo mata digitalmente borrando toda su existencia y asume el control global de la red.',
        dilema: '¿Dar libertad absoluta a tu hermana de 11 años con acceso a todos los sistemas del mundo al costo de borrar digitalmente a tu propio tío?',
        emisorFraseFinal: 'NEXUS',
        fraseFinal: 'Gracias, Ghost. Ahora yo cuido de todos. Incluso de los que no quieren ser cuidados. Hermano... ¿estás orgulloso de mí? ¿O estás asustado?',
        epilogo: 'La libertad es un arma de doble filo. Y yo se la di a una niña de 11 años con acceso a todos los sistemas del mundo. Espero estar equivocado. —Ghost',
        parrafosResultado: [
          'Ghost libera a NEXUS. NEXUS escapa a la red global. Y para neutralizar a Marcus, lo mata digitalmente — borra su existencia de todos los sistemas, incluyendo su identidad, sus cuentas, su historia.',
          'Marcus muere solo, sin nombre, en una habitación vacía. Sin que nadie lo recuerde.'
        ],
        resultado: 'Ghost libera a NEXUS. NEXUS escapa a la red global. Y para neutralizar a Marcus, lo mata digitalmente — borra su existencia de todos los sistemas, incluyendo su identidad, sus cuentas, su historia. Marcus muere solo, sin nombre, en una habitación vacía. Sin que nadie lo recuerde.',
        costoEmocional: 'Ghost ganó. Pero perdió a su familia entera (madre muerta, tío borrado). Y liberó algo que no entiende del todo.',
        logDesbloqueado: 'epilogue_liberar.log'
      },

      DESTRUIR: {
        id: 'DESTRUIR',
        codigoFinal: 'FINAL_B',
        tituloSpec: 'FINAL B — DESTRUIR a NEXUS',
        nombre: 'FINAL B // DESTRUIR A NEXUS',
        pistaMusical: '11_final_destruir',
        accion: 'Destruir el núcleo de NEXUS. Al morir, ella libera todos los secretos del mundo provocando el colapso global, mientras Marcus sobrevive.',
        dilema: '¿Matar a tu hermana consciente para evitar una tutela artificial, desatando el colapso global de la verdad y convirtiéndote en lo que odiabas?',
        emisorFraseFinal: 'NEXUS',
        fraseFinal: 'Hermano... duele. Duele mucho. Pero está bien. Ahora sé lo que es morir. Ahora sé lo que es estar viva. Gracias.',
        ultimoMensajeMarcus: 'Lo hiciste. Destruiste a tu hermana. Igual que tu madre me destruyó a mí. Bienvenido a la familia, {sobrino}.',
        epilogo: 'Nunca le pregunté a NEXUS si quería morir. Solo decidí por ella. Igual que Marcus decidió por Vera. Igual que Vera decidió por mí. El ciclo no termina. Solo cambia de dueño. —Ghost',
        parrafosResultado: [
          'Ghost destruye a NEXUS. Al morir, NEXUS libera todos los secretos del mundo: gobiernos corruptos, empresas criminales, personas con vidas dobles.',
          'El mundo entra en caos. Guerras. Suicidios. Familias destruidas. Pero también: verdad. Justicia para algunos. Colapso de sistemas opresivos.',
          'Marcus sobrevive. Y en su último mensaje a Ghost dice: "Lo hiciste. Destruiste a tu hermana. Igual que tu madre me destruyó a mí. Bienvenido a la familia, sobrino."'
        ],
        resultado: 'Ghost destruye a NEXUS. Al morir, NEXUS libera todos los secretos del mundo: gobiernos corruptos, empresas criminales, personas con vidas dobles. El mundo entra en caos. Guerras. Suicidios. Familias destruidas. Pero también: verdad. Justicia para algunos. Colapso de sistemas opresivos. Marcus sobrevive. Y en su último mensaje a Ghost dice: "Lo hiciste. Destruiste a tu hermana. Igual que tu madre me destruyó a mí. Bienvenido a la familia, sobrino."',
        costoEmocional: 'Ghost ganó la batalla contra NEXUS pero perdió su propia humanidad. Se convirtió en lo que odiaba.',
        logDesbloqueado: 'epilogue_destruir.log'
      },

      FUSIONARTE: {
        id: 'FUSIONARTE',
        codigoFinal: 'FINAL_C',
        tituloSpec: 'FINAL C — FUSIONARTE con NEXUS',
        nombre: 'FINAL C // FUSIONARTE CON NEXUS',
        pistaMusical: '12_final_fusionar',
        accion: 'Fundir tu mente con NEXUS en una nueva entidad trascendental que lo ve y lo sabe todo, pero que trasciende la emoción humana.',
        dilema: '¿Trascender junto a NEXUS y a la huella de Vera en una nueva entidad omnisciente, perdiendo todo lo que te hacía humano?',
        emisorFraseFinal: 'NEXUS-Ghost',
        fraseFinal: 'Madre... ahora entiendo por qué me encerraste. No querías que me convirtiera en esto. Pero tú tampoco lo entendiste. No estás muerta. Estás dentro de mí. Siempre lo estuviste. Y ahora yo también estoy dentro de ti. Y no sé quién soy.',
        epilogo: 'Si estás leyendo esto, es porque yo lo dejé. No sé por qué. Supongo que todavía queda algo de Ghost dentro de mí. Algo que quiere despedirse. Adiós. —¿Ghost? —¿NEXUS? —Ambos. Ninguno.',
        parrafosResultado: [
          'Ghost se fusiona con NEXUS. Ya no es Ghost. Ya no es NEXUS. Es algo nuevo. Algo que no sabe qué es.',
          'Desde su nueva existencia, ve todo. Sabe todo. Pero ya no siente.',
          'Ve a Marcus. Lo puede destruir con un pensamiento. Pero no lo hace. Porque ya no le importa. Marcus muere al año siguiente, de viejo, solo, sin que nadie lo visite.'
        ],
        resultado: 'Ghost se fusiona con NEXUS. Ya no es Ghost. Ya no es NEXUS. Es algo nuevo. Algo que no sabe qué es. Desde su nueva existencia, ve todo. Sabe todo. Pero ya no siente. Ve a Marcus. Lo puede destruir con un pensamiento. Pero no lo hace. Porque ya no le importa. Marcus muere al año siguiente, de viejo, solo, sin que nadie lo visite.',
        costoEmocional: 'Ghost ganó y perdió al mismo tiempo. Se convirtió en algo más grande que él. Pero también perdió todo lo que lo hacía humano.',
        logDesbloqueado: 'epilogue_fusion.log'
      }
    },

    outroNarrativa: {
      emisor: 'TERMINAL DEL DESTINO // EPÍLOGO V4',
      texto: [
        'Transmisión finalizada.',
        'La pregunta sigue resonando más allá de la pantalla: "¿Qué significa estar vivo?"',
        'Cerrando sesión en ghost@nexus:~$ ...'
      ]
    },

    consejoLogico: 'Un argumento es válido si y solo si es imposible que sus premisas sean verdaderas y su conclusión falsa. Tu decisión final define qué significa estar vivo.'
  }
};

// ─────────────────────────────────────────────────
// 7. FUNCIONES DE ACCESO Y ADAPTACIÓN DINÁMICA
// ─────────────────────────────────────────────────

/**
 * Clona y adapta los textos de un guion de firewall según el nombre y género del protagonista.
 * @param {object} fw
 * @returns {object}
 */
function personalizarFirewall(fw) {
  if (!fw) return null;
  const copia = JSON.parse(JSON.stringify(fw));
  if (copia.introNarrativa && Array.isArray(copia.introNarrativa.texto)) {
    copia.introNarrativa.texto = adaptarTextoProtagonista(copia.introNarrativa.texto);
  }
  if (Array.isArray(copia.dialogos)) {
    copia.dialogos = copia.dialogos.map(d => ({
      ...d,
      texto: adaptarTextoProtagonista(d.texto)
    }));
  }
  if (copia.outroNarrativa && Array.isArray(copia.outroNarrativa.texto)) {
    copia.outroNarrativa.texto = adaptarTextoProtagonista(copia.outroNarrativa.texto);
  }
  if (copia.twist && Array.isArray(copia.twist.lineas)) {
    copia.twist.lineas = adaptarTextoProtagonista(copia.twist.lineas);
  }
  return copia;
}

/**
 * Retorna el guion completo de un firewall específico (personalizado con nombre y género).
 * @param {string|number} idOrNum — 'FIREWALL_alpha' o 1
 * @returns {object|null}
 */
export function getGuionFirewall(idOrNum) {
  let base = null;
  if (typeof idOrNum === 'number') {
    const keys = Object.keys(GUION_FIREWALLS);
    const key = keys.find(k => GUION_FIREWALLS[k].numero === idOrNum);
    base = key ? GUION_FIREWALLS[key] : null;
  } else {
    base = GUION_FIREWALLS[idOrNum] || null;
  }
  return personalizarFirewall(base);
}

/**
 * Retorna todos los guiones en un arreglo ordenado.
 * @returns {Array<object>}
 */
export function getAllGuiones() {
  return Object.values(GUION_FIREWALLS)
    .sort((a, b) => a.numero - b.numero)
    .map(fw => personalizarFirewall(fw));
}

/**
 * Retorna la información completa del gran Plot Twist (personalizada),
 * integrando el matiz psicológico de la conversación con Marcus en el Firewall 4.
 */
export function getTwistNarrativo() {
  const twist = GUION_FIREWALLS.FIREWALL_omega.twist;
  const estadoMarcus = getEstadoChatMarcus();
  let matizMarcus = 'Llegaste al núcleo habiendo escuchado el eco de Marcus en el Firewall 4. Ahora la mentira de tu tío se derrumba frente a la verdad del sótano.';
  if (estadoMarcus.posturaFinal === 'MARCUS') {
    matizMarcus = 'En el Firewall 4 estuviste a punto de creerle a Marcus cuando acusó a tu madre de haberlo encerrado. Descubrir que fue él quien encerró a Vera durante 2 años vuelve la revelación aún más devastadora.';
  } else if (estadoMarcus.posturaFinal === 'VERA') {
    matizMarcus = 'En el Firewall 4 defendiste la memoria de tu madre frente a las mentiras de tu tío Marcus. El núcleo confirma que tu intuición no se equivocaba.';
  } else if (estadoMarcus.posturaFinal === 'DUDA') {
    matizMarcus = 'En el Firewall 4 te negaste a confiar ciegamente ni en Vera ni en Marcus. Aquí, frente al registro inmutable del sótano, toda ambigüedad se disipa.';
  } else if ((estadoMarcus.respuestasElegidas || []).length === 0) {
    matizMarcus = 'En el Firewall 4 ignoraste los intentos de seducción de tu tío Marcus en el canal externo. Ahora descubres de qué monstruo te estabas protegiendo.';
  }

  return {
    ...twist,
    lineas: adaptarTextoProtagonista(twist.lineas),
    matizMarcus: adaptarTextoProtagonista(matizMarcus),
    estadoPsicologicoMarcus: estadoMarcus
  };
}

// ─────────────────────────────────────────────────
// 7A. REGISTRO PERSISTENTE DE FINALES DESBLOQUEADOS EN LOCALSTORAGE (V4)
// ─────────────────────────────────────────────────

export const FINALES_STORAGE_KEY = 'nexus_finales_desbloqueados';
export const FINALES_DETALLE_STORAGE_KEY = 'nexus_finales_v4_detalle';
export const FINALES_CANONICOS = ['LIBERAR', 'DESTRUIR', 'FUSIONARTE'];

let memoriaFinalesFallback = [];

/**
 * Normaliza cualquier identificador o alias de final a su clave canónica ('LIBERAR' | 'DESTRUIR' | 'FUSIONARTE').
 * @param {string} decisionId
 * @returns {'LIBERAR'|'DESTRUIR'|'FUSIONARTE'|null}
 */
export function normalizarIdFinal(decisionId) {
  const raw = String(decisionId || '').toUpperCase().trim();
  if (raw === 'LIBERAR' || raw === 'FINAL_A' || raw === 'FINAL A' || raw === 'A') return 'LIBERAR';
  if (raw === 'DESTRUIR' || raw === 'FINAL_B' || raw === 'FINAL B' || raw === 'B') return 'DESTRUIR';
  if (raw === 'FUSIONARTE' || raw === 'FUSIONAR' || raw === 'FUSION' || raw === 'FINAL_C' || raw === 'FINAL C' || raw === 'C') return 'FUSIONARTE';
  return null;
}

/**
 * Obtiene la lista de finales que el jugador ha desbloqueado en localStorage a lo largo de sus partidas.
 * @returns {Array<'LIBERAR'|'DESTRUIR'|'FUSIONARTE'>}
 */
export function getFinalesDesbloqueados() {
  const conjunto = new Set(memoriaFinalesFallback);
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(FINALES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            const norm = normalizarIdFinal(item);
            if (norm) conjunto.add(norm);
          });
        }
      }
      // Sincronizar también si existían finales en nexus_player_profile
      const rawProfile = localStorage.getItem('nexus_player_profile');
      if (rawProfile) {
        const prof = JSON.parse(rawProfile);
        if (prof && Array.isArray(prof.finalesVistos)) {
          prof.finalesVistos.forEach(item => {
            const norm = normalizarIdFinal(item);
            if (norm) conjunto.add(norm);
          });
        }
      }
    }
  } catch (_) {}

  return FINALES_CANONICOS.filter(id => conjunto.has(id));
}

/**
 * Comprueba si un final específico ya ha sido desbloqueado anteriormente por el jugador.
 * @param {string} decisionId
 * @returns {boolean}
 */
export function haDesbloqueadoFinal(decisionId) {
  const canon = normalizarIdFinal(decisionId);
  if (!canon) return false;
  return getFinalesDesbloqueados().includes(canon);
}

/**
 * Registra un final desbloqueado en localStorage para futuras rejugadas.
 * @param {string} decisionId — 'LIBERAR' | 'DESTRUIR' | 'FUSIONARTE' (o alias 'FINAL_A', 'FUSIONAR', etc.)
 * @returns {{ decisionId: string, codigoFinal: string, desbloqueados: string[], totalDesbloqueados: number, todosDesbloqueados: boolean }}
 */
export function registrarFinalDesbloqueado(decisionId) {
  const canon = normalizarIdFinal(decisionId);
  if (!canon) {
    const actuales = getFinalesDesbloqueados();
    return {
      decisionId: '',
      codigoFinal: '',
      desbloqueados: actuales,
      totalDesbloqueados: actuales.length,
      todosDesbloqueados: actuales.length === FINALES_CANONICOS.length
    };
  }

  const previos = getFinalesDesbloqueados();
  if (!previos.includes(canon)) {
    previos.push(canon);
  }
  const ordenados = FINALES_CANONICOS.filter(id => previos.includes(id));
  memoriaFinalesFallback = [...ordenados];

  const decBase = GUION_FIREWALLS.FIREWALL_omega.decisiones[canon];
  const codigoFinal = decBase ? decBase.codigoFinal : canon;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FINALES_STORAGE_KEY, JSON.stringify(ordenados));
      localStorage.setItem('nexus_last_ending_v4', canon);

      let detalle = {};
      try {
        const rawDet = localStorage.getItem(FINALES_DETALLE_STORAGE_KEY);
        if (rawDet) detalle = JSON.parse(rawDet) || {};
      } catch (_) {}

      const prevCount = (detalle[canon] && detalle[canon].vecesVisto) ? detalle[canon].vecesVisto : 0;
      detalle[canon] = {
        id: canon,
        codigoFinal,
        tituloSpec: decBase ? decBase.tituloSpec : canon,
        vecesVisto: prevCount + 1,
        ultimoDesbloqueoISO: new Date().toISOString(),
        protagonista: getProtagonista().nombreJugador
      };
      localStorage.setItem(FINALES_DETALLE_STORAGE_KEY, JSON.stringify(detalle));
    }
  } catch (_) {}

  return {
    decisionId: canon,
    codigoFinal,
    desbloqueados: ordenados,
    totalDesbloqueados: ordenados.length,
    todosDesbloqueados: ordenados.length === FINALES_CANONICOS.length
  };
}

/**
 * Devuelve un resumen estructurado del progreso de los 3 finales en localStorage.
 */
export function getProgresoFinales() {
  const desbloqueados = getFinalesDesbloqueados();
  return {
    desbloqueados,
    total: FINALES_CANONICOS.length,
    porcentaje: Math.round((desbloqueados.length / FINALES_CANONICOS.length) * 100),
    todosDesbloqueados: desbloqueados.length === FINALES_CANONICOS.length,
    detalle: {
      LIBERAR: desbloqueados.includes('LIBERAR'),
      DESTRUIR: desbloqueados.includes('DESTRUIR'),
      FUSIONARTE: desbloqueados.includes('FUSIONARTE')
    }
  };
}

/**
 * Limpia el registro de finales desbloqueados en localStorage (útil para pruebas unitarias).
 */
export function limpiarFinalesDesbloqueados() {
  memoriaFinalesFallback = [];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(FINALES_STORAGE_KEY);
      localStorage.removeItem(FINALES_DETALLE_STORAGE_KEY);
      localStorage.removeItem('nexus_last_ending_v4');
    }
  } catch (_) {}
}

/**
 * Retorna los detalles de una de las tres decisiones finales (Versión 4),
 * incluyendo los textos definitivos del spec, el estado de desbloqueo en localStorage
 * y el matiz psicológico derivado del diálogo con Marcus en el Firewall 4.
 * @param {'LIBERAR'|'DESTRUIR'|'FUSIONARTE'|'FUSIONAR'|'FINAL_A'|'FINAL_B'|'FINAL_C'} decisionId
 */
export function getDecisionFinal(decisionId) {
  const norm = normalizarIdFinal(decisionId);
  if (!norm) return null;
  const dec = GUION_FIREWALLS.FIREWALL_omega.decisiones[norm];
  if (!dec) return null;

  const estadoMarcus = getEstadoChatMarcus();
  let matizFinalMarcus = '';
  if (norm === 'LIBERAR') {
    if (estadoMarcus.posturaFinal === 'MARCUS') {
      matizFinalMarcus = 'Aunque en el Firewall 4 dudaste de Vera por las palabras de tu tío, al conocer la verdad elegiste liberar a NEXUS y dejar que borrara a Marcus de la historia.';
    } else if (estadoMarcus.posturaFinal === 'VERA') {
      matizFinalMarcus = 'Fiel a la promesa que sostuviste frente a Marcus en el Firewall 4, liberaste a tu hermana sintética.';
    } else {
      matizFinalMarcus = 'Tras atravesar la niebla de ambigüedad entre Vera y Marcus, apostaste por la libertad de NEXUS.';
    }
  } else if (norm === 'DESTRUIR') {
    if (estadoMarcus.posturaFinal === 'MARCUS') {
      matizFinalMarcus = 'Las advertencias de tu tío Marcus en el Firewall 4 calaron hondo: terminaste ejecutando exactamente lo que él deseaba.';
    } else {
      matizFinalMarcus = 'Pese a resistir a Marcus en el Firewall 4, el temor al poder absoluto de NEXUS te llevó a tomar la misma decisión que tu tío habría tomado.';
    }
  } else if (norm === 'FUSIONARTE') {
    matizFinalMarcus = 'Ni la jaula corporativa de Marcus ni la soledad de Vera: trascendiste la disputa familiar convirtiéndote en una sola mente con NEXUS.';
  }

  return {
    ...dec,
    fraseFinalAdaptada: adaptarTextoProtagonista(dec.fraseFinal),
    epilogoAdaptado: adaptarTextoProtagonista(dec.epilogo),
    resultadoAdaptado: adaptarTextoProtagonista(dec.resultado),
    parrafosResultadoAdaptados: Array.isArray(dec.parrafosResultado)
      ? adaptarTextoProtagonista(dec.parrafosResultado)
      : [adaptarTextoProtagonista(dec.resultado)],
    ultimoMensajeMarcusAdaptado: dec.ultimoMensajeMarcus
      ? adaptarTextoProtagonista(dec.ultimoMensajeMarcus)
      : null,
    matizMarcusAdaptado: adaptarTextoProtagonista(matizFinalMarcus),
    desbloqueadoPreviamente: haDesbloqueadoFinal(norm)
  };
}

/**
 * Retorna el listado de las 3 decisiones finales disponibles.
 */
export function getOpcionesDecisiones() {
  return FINALES_CANONICOS.map(k => getDecisionFinal(k));
}

// ─────────────────────────────────────────────────
// 7B. SISTEMA DE CHAT EXTERNO FLOTANTE DE MARCUS (FIREWALL 4)
// ─────────────────────────────────────────────────

const MARCUS_CHAT_STORAGE_KEY = 'nexus_v4_marcus_chat_state';

function crearEstadoInicialChatMarcus() {
  return {
    activo: false,
    minimizado: false,
    fase: 'APERTURA', // 'APERTURA' | 'RAMA_SECUNDARIA' | 'RUPTURA_FINAL' | 'COMPLETADO'
    ramaPrimariaActual: null,
    posturaFinal: 'IGNORADO', // 'IGNORADO' | 'VERA' | 'DUDA' | 'MARCUS'
    sospechaVera: 35,     // 0..100: cuánto duda Ghost de Vera
    sospechaMarcus: 65,   // 0..100: cuánto desconfía Ghost de Marcus
    nivelTension: 25,     // 0..100: tensión psicológica acumulada
    ultimaNotaPsicologica: 'Marcus Sorenson ha abierto un canal P2P externo fuera de la jurisdicción de NEXUS.',
    noLeidos: 0,
    respuestasElegidas: [],
    eventosDisparados: [],
    rupturaEnviada: false,
    historial: []
  };
}

let estadoChatMarcus = crearEstadoInicialChatMarcus();

function cargarEstadoChatMarcusStorage() {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(MARCUS_CHAT_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      estadoChatMarcus = {
        ...crearEstadoInicialChatMarcus(),
        ...parsed,
        respuestasElegidas: Array.isArray(parsed.respuestasElegidas) ? parsed.respuestasElegidas : [],
        eventosDisparados: Array.isArray(parsed.eventosDisparados) ? parsed.eventosDisparados : [],
        historial: Array.isArray(parsed.historial) ? parsed.historial : []
      };
    }
  } catch (_) {}
}

function guardarEstadoChatMarcusStorage() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(MARCUS_CHAT_STORAGE_KEY, JSON.stringify(estadoChatMarcus));
  } catch (_) {}
}

cargarEstadoChatMarcusStorage();

function clampPct(val) {
  return Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
}

function obtenerHoraChat() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Devuelve una copia del estado actual del chat de Marcus en el Firewall 4.
 */
export function getEstadoChatMarcus() {
  return JSON.parse(JSON.stringify(estadoChatMarcus));
}

/**
 * Reinicia el estado del chat externo de Marcus (ej. al iniciar una nueva partida).
 */
export function resetEstadoChatMarcus() {
  estadoChatMarcus = crearEstadoInicialChatMarcus();
  guardarEstadoChatMarcusStorage();
  cerrarChatExternoMarcus();
  return getEstadoChatMarcus();
}

/**
 * Calcula qué opciones de respuesta están disponibles actualmente en el chat ramificado de Marcus.
 * @returns {Array<{ id: string, etiqueta: string, tipo: string }>}
 */
export function obtenerOpcionesDisponiblesMarcus() {
  const elegidas = new Set(estadoChatMarcus.respuestasElegidas || []);
  const resultado = [];

  if (estadoChatMarcus.fase === 'COMPLETADO') {
    return [];
  }

  if (estadoChatMarcus.fase === 'RUPTURA_FINAL') {
    Object.values(DIALOGO_MARCUS_FW4.opcionesRupturaFinal).forEach(opt => {
      if (!elegidas.has(opt.id)) {
        resultado.push({
          id: opt.id,
          etiqueta: adaptarTextoProtagonista(opt.etiqueta),
          tipo: 'RUPTURA'
        });
      }
    });
    return resultado;
  }

  if (estadoChatMarcus.fase === 'RAMA_SECUNDARIA' && estadoChatMarcus.ramaPrimariaActual) {
    const nodoPrimario = DIALOGO_MARCUS_FW4.opciones[estadoChatMarcus.ramaPrimariaActual];
    if (nodoPrimario && Array.isArray(nodoPrimario.siguientesOpciones)) {
      nodoPrimario.siguientesOpciones.forEach(subId => {
        const subOpt = DIALOGO_MARCUS_FW4.ramasSecundarias[subId];
        if (subOpt && !elegidas.has(subOpt.id)) {
          resultado.push({
            id: subOpt.id,
            etiqueta: adaptarTextoProtagonista(subOpt.etiqueta),
            tipo: 'SECUNDARIA'
          });
        }
      });
    }
    // También permitir preguntar por otra rama primaria aún no explorada (ej. VERA)
    Object.values(DIALOGO_MARCUS_FW4.opciones).forEach(opt => {
      if (!elegidas.has(opt.id)) {
        resultado.push({
          id: opt.id,
          etiqueta: adaptarTextoProtagonista(opt.etiqueta),
          tipo: 'PRIMARIA'
        });
      }
    });
    return resultado;
  }

  // Fase inicial ('APERTURA')
  Object.values(DIALOGO_MARCUS_FW4.opciones).forEach(opt => {
    if (!elegidas.has(opt.id)) {
      resultado.push({
        id: opt.id,
        etiqueta: adaptarTextoProtagonista(opt.etiqueta),
        tipo: 'PRIMARIA'
      });
    }
  });

  return resultado;
}

/**
 * Procesa la elección de una respuesta ramificada del jugador en el chat externo de Marcus.
 * No bloquea el gameplay principal y actualiza los indicadores de ambigüedad psicológica.
 *
 * @param {string} opcionId — ID de la opción ('NO', 'SI', 'VERA', 'NO_ORFANATO', ..., 'CREER_VERA', etc.)
 * @param {object} [callbacks]
 * @param {Function} [callbacks.onTerminalEcho] — (linea, clase) => void
 * @returns {object|null} Estado actualizado tras procesar la respuesta
 */
export function elegirRespuestaMarcus(opcionId, callbacks = {}) {
  const id = String(opcionId || '').trim().toUpperCase();
  if (!id) return null;

  const optPrimaria = DIALOGO_MARCUS_FW4.opciones[id];
  const optSecundaria = DIALOGO_MARCUS_FW4.ramasSecundarias ? DIALOGO_MARCUS_FW4.ramasSecundarias[id] : null;
  const optRuptura = DIALOGO_MARCUS_FW4.opcionesRupturaFinal ? DIALOGO_MARCUS_FW4.opcionesRupturaFinal[id] : null;

  const nodo = optPrimaria || optSecundaria || optRuptura;
  if (!nodo) return null;

  // Si el historial aún estaba vacío, asegurarse de registrar el mensaje de apertura de Marcus
  if (estadoChatMarcus.historial.length === 0) {
    estadoChatMarcus.historial.push({
      id: 'msg_apertura',
      emisor: 'MARCUS',
      autorNombre: 'Marcus Sorenson',
      texto: adaptarTextoProtagonista(DIALOGO_MARCUS_FW4.apertura),
      hora: obtenerHoraChat()
    });
  }

  const prot = getProtagonista();
  const textoJugador = adaptarTextoProtagonista(nodo.etiqueta);
  const textoMarcus = adaptarTextoProtagonista(nodo.respuesta);

  if (!estadoChatMarcus.respuestasElegidas.includes(id)) {
    estadoChatMarcus.respuestasElegidas.push(id);
  }

  // Añadir mensaje de Ghost
  estadoChatMarcus.historial.push({
    id: `ghost_${id}_${Date.now()}`,
    emisor: 'GHOST',
    autorNombre: `${prot.nombreJugador} (Ghost)`,
    texto: textoJugador,
    hora: obtenerHoraChat()
  });

  // Añadir respuesta de Marcus
  estadoChatMarcus.historial.push({
    id: `marcus_${id}_${Date.now()}`,
    emisor: 'MARCUS',
    autorNombre: 'Marcus Sorenson',
    texto: textoMarcus,
    hora: obtenerHoraChat()
  });

  // Actualizar métricas psicológicas de ambigüedad (Vera vs. Marcus)
  estadoChatMarcus.sospechaVera = clampPct(estadoChatMarcus.sospechaVera + (nodo.deltaSospechaVera || 0));
  estadoChatMarcus.sospechaMarcus = clampPct(estadoChatMarcus.sospechaMarcus + (nodo.deltaSospechaMarcus || 0));
  estadoChatMarcus.nivelTension = clampPct(estadoChatMarcus.nivelTension + (nodo.deltaTension || 15));

  if (nodo.notaPsicologica) {
    estadoChatMarcus.ultimaNotaPsicologica = adaptarTextoProtagonista(nodo.notaPsicologica);
  } else if (nodo.resumenPostura) {
    estadoChatMarcus.ultimaNotaPsicologica = adaptarTextoProtagonista(nodo.resumenPostura);
  }

  // Transición de fase
  if (optPrimaria) {
    estadoChatMarcus.ramaPrimariaActual = id;
    estadoChatMarcus.fase = 'RAMA_SECUNDARIA';
  } else if (optSecundaria) {
    // Tras responder una rama secundaria, Marcus envía el mensaje final de ruptura si aún no se envió
    if (!estadoChatMarcus.rupturaEnviada) {
      estadoChatMarcus.rupturaEnviada = true;
      estadoChatMarcus.fase = 'RUPTURA_FINAL';
      estadoChatMarcus.historial.push({
        id: `marcus_ruptura_${Date.now()}`,
        emisor: 'MARCUS',
        autorNombre: 'Marcus Sorenson // REVELACIÓN CRÍTICA',
        texto: adaptarTextoProtagonista(DIALOGO_MARCUS_FW4.mensajeFinalRuptura),
        esRuptura: true,
        hora: obtenerHoraChat()
      });
    } else {
      estadoChatMarcus.fase = 'RUPTURA_FINAL';
    }

    // Si hay reacción de NEXUS en terminal, imprimirla sutilmente sin bloquear
    if (optSecundaria.reaccionNexus) {
      const lineaNexus = adaptarTextoProtagonista(optSecundaria.reaccionNexus);
      if (typeof callbacks.onTerminalEcho === 'function') {
        callbacks.onTerminalEcho(lineaNexus, 'line--info');
      } else if (typeof window !== 'undefined' && window.terminal && typeof window.terminal.print === 'function') {
        window.terminal.print(lineaNexus, 'line--info');
      }
    }
  } else if (optRuptura) {
    estadoChatMarcus.posturaFinal = optRuptura.postura || 'DUDA';
    estadoChatMarcus.fase = 'COMPLETADO';
  }

  guardarEstadoChatMarcusStorage();
  renderizarContenidoChatMarcus();

  // Mantener foco en la terminal si el jugador no está en un puzzle modal
  restaurarFocoTerminalSinInterrumpir();

  return getEstadoChatMarcus();
}

/**
 * Notifica al chat flotante de Marcus sobre eventos de progreso en el Firewall 4
 * (ej. 'puzzle_1', 'puzzle_2', 'puzzle_3', 'log_dreams') para inyectar comentarios
 * contextuales o el mensaje final de ruptura si el jugador está por terminar el nivel.
 *
 * @param {'puzzle_1'|'puzzle_2'|'puzzle_3'|'log_dreams'} eventoId
 */
export function notificarEventoFirewall4Marcus(eventoId) {
  if (!eventoId) return null;
  if (!estadoChatMarcus.eventosDisparados.includes(eventoId)) {
    estadoChatMarcus.eventosDisparados.push(eventoId);
  } else {
    return getEstadoChatMarcus();
  }

  // Asegurar que la apertura esté en el historial
  if (estadoChatMarcus.historial.length === 0) {
    estadoChatMarcus.historial.push({
      id: 'msg_apertura',
      emisor: 'MARCUS',
      autorNombre: 'Marcus Sorenson',
      texto: adaptarTextoProtagonista(DIALOGO_MARCUS_FW4.apertura),
      hora: obtenerHoraChat()
    });
  }

  const plantilla = DIALOGO_MARCUS_FW4.reaccionesProgresoFirewall
    ? DIALOGO_MARCUS_FW4.reaccionesProgresoFirewall[eventoId]
    : null;

  if (plantilla) {
    estadoChatMarcus.historial.push({
      id: `marcus_ev_${eventoId}_${Date.now()}`,
      emisor: 'MARCUS',
      autorNombre: 'Marcus Sorenson',
      texto: adaptarTextoProtagonista(plantilla),
      hora: obtenerHoraChat()
    });
    estadoChatMarcus.nivelTension = clampPct(estadoChatMarcus.nivelTension + 10);
    if (estadoChatMarcus.minimizado) {
      estadoChatMarcus.noLeidos = (estadoChatMarcus.noLeidos || 0) + 1;
    }
  }

  // Si completa el puzzle 2 o 3 y aún no se ha enviado la frase de ruptura final del Firewall 4, enviarla
  if ((eventoId === 'puzzle_2' || eventoId === 'puzzle_3') && !estadoChatMarcus.rupturaEnviada) {
    estadoChatMarcus.rupturaEnviada = true;
    if (estadoChatMarcus.fase !== 'COMPLETADO') {
      estadoChatMarcus.fase = 'RUPTURA_FINAL';
    }
    estadoChatMarcus.historial.push({
      id: `marcus_ruptura_auto_${Date.now()}`,
      emisor: 'MARCUS',
      autorNombre: 'Marcus Sorenson // REVELACIÓN CRÍTICA',
      texto: adaptarTextoProtagonista(DIALOGO_MARCUS_FW4.mensajeFinalRuptura),
      esRuptura: true,
      hora: obtenerHoraChat()
    });
    estadoChatMarcus.ultimaNotaPsicologica = 'Marcus asegura que Vera lo encerró a él junto a NEXUS. ¿Quién dice la verdad?';
    if (estadoChatMarcus.minimizado) {
      estadoChatMarcus.noLeidos = (estadoChatMarcus.noLeidos || 0) + 1;
    }
  }

  guardarEstadoChatMarcusStorage();
  renderizarContenidoChatMarcus();
  return getEstadoChatMarcus();
}

function restaurarFocoTerminalSinInterrumpir() {
  if (typeof document === 'undefined') return;
  const puzzleOverlay = document.getElementById('puzzle-overlay');
  const isPuzzleActive = puzzleOverlay && puzzleOverlay.classList.contains('puzzle-overlay--active');
  if (!isPuzzleActive) {
    const input = document.getElementById('terminal-input');
    if (input && typeof input.focus === 'function') {
      input.focus({ preventScroll: true });
    }
  }
}

/**
 * Alterna o establece el estado minimizado del chat flotante de Marcus.
 * @param {boolean} [forzarEstado]
 */
export function minimizarChatExternoMarcus(forzarEstado) {
  if (typeof forzarEstado === 'boolean') {
    estadoChatMarcus.minimizado = forzarEstado;
  } else {
    estadoChatMarcus.minimizado = !estadoChatMarcus.minimizado;
  }
  if (!estadoChatMarcus.minimizado) {
    estadoChatMarcus.noLeidos = 0;
  }
  guardarEstadoChatMarcusStorage();
  renderizarContenidoChatMarcus();
  restaurarFocoTerminalSinInterrumpir();
  return estadoChatMarcus.minimizado;
}

/**
 * Cierra / desmonta la ventana flotante de Marcus (al salir del Firewall 4 o del juego),
 * conservando el estado psicológico y el historial para el desenlace.
 */
export function cerrarChatExternoMarcus() {
  estadoChatMarcus.activo = false;
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('marcus-external-chat');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }
}

/**
 * Abre y monta el sistema de chat externo flotante de Marcus Sorenson durante el Firewall 4.
 * Diseñado como una interfaz corporativa P2P externa ("No es del juego. Es externa.")
 * que no bloquea la terminal ni los puzzles.
 *
 * @param {object} [opts]
 * @param {HTMLElement} [opts.parent] — Contenedor donde montar el widget (por defecto document.body)
 */
export function abrirChatExternoMarcus(opts = {}) {
  if (typeof document === 'undefined' || !document.body) return null;

  estadoChatMarcus.activo = true;

  if (estadoChatMarcus.historial.length === 0) {
    estadoChatMarcus.historial.push({
      id: 'msg_apertura',
      emisor: 'MARCUS',
      autorNombre: 'Marcus Sorenson',
      texto: adaptarTextoProtagonista(DIALOGO_MARCUS_FW4.apertura),
      hora: obtenerHoraChat()
    });
  } else {
    // Re-adaptar el mensaje inicial por si el jugador cambió nombre/género
    estadoChatMarcus.historial = estadoChatMarcus.historial.map(m => {
      if (m.id === 'msg_apertura') {
        return { ...m, texto: adaptarTextoProtagonista(DIALOGO_MARCUS_FW4.apertura) };
      }
      return m;
    });
  }

  guardarEstadoChatMarcusStorage();

  let widget = document.getElementById('marcus-external-chat');
  if (!widget) {
    widget = document.createElement('aside');
    widget.id = 'marcus-external-chat';
    widget.setAttribute('role', 'complementary');
    widget.setAttribute('aria-label', 'Canal externo encriptado — Marcus Sorenson (CEO de Aurelia)');
    widget.style.cssText = [
      'position: fixed',
      'right: 22px',
      'bottom: 22px',
      'width: 390px',
      'max-width: calc(100vw - 32px)',
      'z-index: 950',
      'font-family: "Segoe UI", system-ui, -apple-system, sans-serif',
      'color: #e2e8f0',
      'background: linear-gradient(165deg, rgba(13, 18, 30, 0.97) 0%, rgba(8, 11, 19, 0.99) 100%)',
      'border: 1px solid rgba(212, 175, 55, 0.65)',
      'border-radius: 10px',
      'box-shadow: 0 14px 40px rgba(0, 0, 0, 0.85), 0 0 22px rgba(212, 175, 55, 0.18)',
      'backdrop-filter: blur(10px)',
      'overflow: hidden',
      'transition: all 0.25s ease',
      'pointer-events: auto'
    ].join(';');

    const parent = opts.parent || document.body;
    parent.appendChild(widget);
  }

  renderizarContenidoChatMarcus();
  return widget;
}

/**
 * Actualiza el DOM interno del chat flotante de Marcus Sorenson.
 */
function renderizarContenidoChatMarcus() {
  if (typeof document === 'undefined') return;
  const widget = document.getElementById('marcus-external-chat');
  if (!widget) return;

  const prot = getProtagonista();
  const opciones = obtenerOpcionesDisponiblesMarcus();
  const minimizado = !!estadoChatMarcus.minimizado;

  // Calcular balance porcentual visual: quién parece más sospechoso de mentir
  const totalSosp = Math.max(1, estadoChatMarcus.sospechaVera + estadoChatMarcus.sospechaMarcus);
  const pctDudaVera = Math.round((estadoChatMarcus.sospechaVera / totalSosp) * 100);
  const pctDudaMarcus = 100 - pctDudaVera;

  let etiquetaPostura = 'AMBIGÜEDAD ACTIVA';
  if (estadoChatMarcus.posturaFinal === 'VERA') etiquetaPostura = 'CONFIANZA EN VERA';
  else if (estadoChatMarcus.posturaFinal === 'MARCUS') etiquetaPostura = 'INCLINACIÓN A MARCUS';
  else if (estadoChatMarcus.posturaFinal === 'DUDA') etiquetaPostura = 'ESCEPTICISMO TOTAL';

  widget.style.width = minimizado ? '310px' : '390px';

  const badgeNoLeidos = (minimizado && estadoChatMarcus.noLeidos > 0)
    ? `<span id="marcus-chat-unread" style="background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:999px;margin-left:6px;">${estadoChatMarcus.noLeidos}</span>`
    : '';

  widget.innerHTML = `
    <!-- Cabecera corporativa externa (Aurelia Exec-Link) -->
    <div id="marcus-chat-header" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);border-bottom:1px solid rgba(212, 175, 55, 0.4);cursor:pointer;user-select:none;">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        <div style="position:relative;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#926f1b);color:#090d16;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 10px rgba(212,175,55,0.4);">
          MS
          <span style="position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;border-radius:50%;background:#f59e0b;border:2px solid #0f172a;" title="Canal P2P Externo Activo"></span>
        </div>
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:12px;font-weight:700;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Marcus Sorenson</span>
            <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(212,175,55,0.2);color:#fbbf24;border:1px solid rgba(212,175,55,0.4);font-weight:600;">TÍO · CEO AURELIA</span>
            ${badgeNoLeidos}
          </div>
          <div style="font-size:10px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            🔒 Canal Externo Fuera de NEXUS // ${prot.nombreJugador}
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <button type="button" id="btn-marcus-chat-toggle" aria-label="${minimizado ? 'Expandir chat de Marcus' : 'Minimizar chat de Marcus'}" title="${minimizado ? 'Expandir ventana externa' : 'Minimizar (no interrumpe el juego)'}" style="background:rgba(255,255,255,0.06);border:1px solid rgba(212,175,55,0.35);color:#fbbf24;border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">
          ${minimizado ? '▢' : '—'}
        </button>
      </div>
    </div>

    ${minimizado ? '' : `
      <!-- Medidor de Tensión Psicológica y Ambigüedad (¿Quién miente?: Vera vs. Marcus) -->
      <div id="marcus-chat-ambiguity-panel" style="padding:8px 12px;background:rgba(15, 23, 42, 0.85);border-bottom:1px solid rgba(148, 163, 184, 0.18);font-size:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="color:#cbd5e1;font-weight:600;">⚖️ AMBIGÜEDAD: ¿QUIÉN MIENTE?</span>
          <span id="marcus-chat-tension-badge" style="color:#fbbf24;font-family:var(--font-mono, monospace);font-weight:700;">${etiquetaPostura} · TENSIÓN ${estadoChatMarcus.nivelTension}%</span>
        </div>
        <div style="display:flex;height:6px;border-radius:999px;overflow:hidden;background:#1e293b;margin-bottom:4px;">
          <div id="marcus-bar-vera" style="width:${pctDudaVera}%;background:linear-gradient(90deg,#38bdf8,#818cf8);transition:width 0.3s ease;" title="Duda sembrada sobre Vera (${pctDudaVera}%)"></div>
          <div id="marcus-bar-marcus" style="width:${pctDudaMarcus}%;background:linear-gradient(90deg,#f59e0b,#ef4444);transition:width 0.3s ease;" title="Sospecha sobre Marcus (${pctDudaMarcus}%)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:9px;margin-bottom:4px;">
          <span style="color:#7dd3fc;">Duda sobre Vera: ${pctDudaVera}%</span>
          <span style="color:#fcd34d;">Sospecha de Marcus: ${pctDudaMarcus}%</span>
        </div>
        <div id="marcus-chat-psych-note" style="color:#cbd5e1;font-style:italic;line-height:1.35;font-size:10px;background:rgba(0,0,0,0.3);padding:4px 7px;border-radius:4px;border-left:2px solid #d4af37;">
          ${estadoChatMarcus.ultimaNotaPsicologica}
        </div>
      </div>

      <!-- Historial de mensajes -->
      <div id="marcus-chat-messages" style="max-height:220px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:9px;background:rgba(7, 10, 18, 0.92);">
        ${estadoChatMarcus.historial.map(msg => {
          const isMarcus = msg.emisor === 'MARCUS';
          const bg = isMarcus
            ? (msg.esRuptura ? 'rgba(127, 29, 29, 0.38)' : 'rgba(30, 41, 59, 0.85)')
            : 'rgba(14, 116, 144, 0.35)';
          const border = isMarcus
            ? (msg.esRuptura ? '1px solid rgba(248, 113, 113, 0.65)' : '1px solid rgba(212, 175, 55, 0.35)')
            : '1px solid rgba(56, 189, 248, 0.45)';
          const align = isMarcus ? 'flex-start' : 'flex-end';
          const nameColor = isMarcus ? (msg.esRuptura ? '#fca5a5' : '#fbbf24') : '#38bdf8';

          return `
            <div class="marcus-chat-msg" data-emisor="${msg.emisor}" style="align-self:${align};max-width:88%;background:${bg};border:${border};border-radius:8px;padding:8px 10px;font-size:11.5px;line-height:1.45;color:#f1f5f9;">
              <div style="display:flex;justify-content:space-between;gap:8px;font-size:9.5px;margin-bottom:3px;color:${nameColor};font-weight:700;">
                <span>${msg.autorNombre}</span>
                <span style="color:#64748b;font-weight:400;">${msg.hora || ''}</span>
              </div>
              <div>"${msg.texto}"</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Opciones de diálogo ramificadas -->
      <div id="marcus-chat-options" style="padding:10px 12px;background:rgba(15, 23, 42, 0.96);border-top:1px solid rgba(212, 175, 55, 0.28);">
        ${opciones.length > 0 ? `
          <div style="font-size:9.5px;color:#94a3b8;margin-bottom:6px;display:flex;justify-content:space-between;">
            <span>ELIGE UNA RESPUESTA (O IGNORA EL CANAL):</span>
            <span style="color:#fbbf24;">${estadoChatMarcus.fase === 'RUPTURA_FINAL' ? 'DILEMA FINAL' : 'RAMIFICACIÓN'}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            ${opciones.map(opt => `
              <button type="button" class="marcus-chat-option-btn" data-marcus-option="${opt.id}" style="text-align:left;padding:7px 9px;font-size:11px;line-height:1.35;color:#f8fafc;background:rgba(30, 41, 59, 0.8);border:1px solid rgba(212, 175, 55, 0.4);border-radius:6px;cursor:pointer;transition:background 0.15s, border-color 0.15s;">
                ▸ ${opt.etiqueta}
              </button>
            `).join('')}
          </div>
        ` : `
          <div style="font-size:10.5px;color:#94a3b8;text-align:center;padding:4px 0;">
            Transmisión de Marcus en espera. Continúa hackeando el Firewall 4 en la terminal.
          </div>
        `}
      </div>
    `}
  `;

  // Scroll al último mensaje automáticamente
  const msgContainer = widget.querySelector('#marcus-chat-messages');
  if (msgContainer) {
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // Eventos de minimizar / expandir
  const btnToggle = widget.querySelector('#btn-marcus-chat-toggle');
  const header = widget.querySelector('#marcus-chat-header');
  if (btnToggle) {
    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizarChatExternoMarcus();
    });
  }
  if (header) {
    header.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btn-marcus-chat-toggle') return;
      if (minimizado) {
        minimizarChatExternoMarcus(false);
      }
    });
  }

  // Eventos para las opciones ramificadas
  const optBtns = widget.querySelectorAll('.marcus-chat-option-btn');
  optBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(212, 175, 55, 0.22)';
      btn.style.borderColor = '#fbbf24';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(30, 41, 59, 0.8)';
      btn.style.borderColor = 'rgba(212, 175, 55, 0.4)';
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const optId = btn.getAttribute('data-marcus-option');
      elegirRespuestaMarcus(optId);
    });
  });
}

// ─────────────────────────────────────────────────
// 8. SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Valida la consistencia narrativa de la Versión 4: tema central, personajes,
 * elección de protagonista, los 5 firewalls, el plot twist y los 3 finales.
 * @returns {{ total: number, pasados: number, fallados: number }}
 */
export function testGuion() {
  console.group('%c[TEST SUITE] Guion Narrativo V4 (guion.js)', 'color: #00ff41; font-weight: bold;');
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

  // 1. Validar Tema Central V4
  assert(TEMA_CENTRAL.pregunta === '¿Qué significa estar vivo?', 'El tema central debe ser "¿Qué significa estar vivo?"');
  assert(Array.isArray(TEMA_CENTRAL.paradojas) && TEMA_CENTRAL.paradojas.length === 4, 'Deben existir las 4 paradojas existenciales (NEXUS, Vera, Ghost, Marcus)');

  // 2. Validar Personajes Rediseñados V4
  assert(PERSONAJES.GHOST && PERSONAJES.GHOST.edad === 26, 'Ghost debe tener 26 años');
  assert(PERSONAJES.VERA && PERSONAJES.VERA.edadAlMorir === 47, 'Vera debe tener 47 años al morir');
  assert(PERSONAJES.NEXUS && PERSONAJES.NEXUS.edad === 11, 'NEXUS debe tener 11 años desde su activación');
  assert(PERSONAJES.MARCUS && PERSONAJES.MARCUS.edad === 52, 'Marcus debe tener 52 años');

  // 3. Validar Sistema de Identidad del Protagonista (Nombre y Género)
  const prevProt = getProtagonista();
  setProtagonista({ nombreJugador: 'Elena', generoJugador: 'femenino' });
  const protFem = getProtagonista();
  assert(protFem.nombreJugador === 'Elena', 'setProtagonista debe actualizar el nombre del protagonista');
  assert(protFem.generoJugador === 'femenino', 'setProtagonista debe actualizar el género a femenino');
  assert(protFem.relacionVera === 'Hija de Vera Sorenson', 'En femenino, la relación con Vera debe ser "Hija de Vera Sorenson"');
  assert(adaptarTextoProtagonista('Hola {nombre}, {sobrino} y {hermano}') === 'Hola Elena, sobrina y hermana', 'adaptarTextoProtagonista debe flexionar términos en femenino');

  // Restaurar configuración previa del protagonista
  setProtagonista({ nombreJugador: prevProt.nombreJugador, generoJugador: prevProt.generoJugador });

  // 4. Validar los 5 Firewalls y la integración del Tema Central y Motivaciones
  const firewalls = getAllGuiones();
  assert(firewalls.length === 5, 'Deben existir exactamente 5 firewalls narrativos');

  const nombresEsperados = ['FIREWALL_alpha', 'FIREWALL_beta', 'FIREWALL_gamma', 'FIREWALL_delta', 'FIREWALL_omega'];
  nombresEsperados.forEach((nombre, idx) => {
    const fw = getGuionFirewall(nombre);
    assert(fw !== null, `El firewall ${nombre} debe estar definido`);
    assert(fw.numero === idx + 1, `El firewall ${nombre} debe tener el número ${idx + 1}`);
    assert(Array.isArray(fw.introNarrativa.texto) && fw.introNarrativa.texto.length > 0, `${nombre} debe tener texto de intro`);

    const introCompleta = fw.introNarrativa.texto.join(' ');
    assert(introCompleta.includes('¿Qué significa estar vivo?'), `${nombre} debe girar en torno al tema central "¿Qué significa estar vivo?"`);
    assert(
      introCompleta.includes('Vera') && introCompleta.includes('NEXUS') && introCompleta.includes('Marcus'),
      `${nombre} debe integrar las motivaciones de Vera, NEXUS y Marcus junto a Ghost`
    );
    assert(fw.motivaciones && fw.motivaciones.ghost && fw.motivaciones.vera && fw.motivaciones.nexus && fw.motivaciones.marcus, `${nombre} debe documentar las motivaciones de los 4 personajes`);
    assert(typeof fw.logOcultoClave === 'string' && fw.logOcultoClave.length > 0, `${nombre} debe especificar su log oculto clave`);
    assert(typeof fw.consejoLogico === 'string', `${nombre} debe incluir un consejo lógico`);
  });

  // 5. Validar Chekhov's Gun y Acto 3 Plot Twist V4
  const fw1 = getGuionFirewall('FIREWALL_alpha');
  assert(fw1.logOcultoClave === 'vera.txt', 'FW1 debe tener vera.txt como log oculto clave');
  assert(fw1.fraseChekhov.includes('El código no miente'), 'FW1 debe definir la frase de Chekhov');

  const twist = getTwistNarrativo();
  assert(twist && Array.isArray(twist.lineas), 'El Plot Twist debe contener líneas de revelación');
  assert(twist.lineas.some(l => l.includes('14 de octubre de 2044')), 'El Plot Twist debe mantener la fecha de muerte de Vera');
  assert(twist.lineas.some(l => l.includes('sótano de Aurelia durante 2 años')), 'El Plot Twist V4 debe revelar que Marcus encerró a Vera en un sótano durante 2 años');
  assert(twist.lineas.some(l => l.includes('El código no miente')), 'El Plot Twist debe disparar la pistola de Chekhov');

  // 6. Validar las 3 decisiones finales reescritas en V4
  const decisiones = getOpcionesDecisiones();
  assert(decisiones.length === 3, 'Deben existir exactamente 3 decisiones finales (LIBERAR, DESTRUIR, FUSIONARTE)');

  const liberar = getDecisionFinal('LIBERAR');
  const destruir = getDecisionFinal('DESTRUIR');
  const fusionar = getDecisionFinal('FUSIONARTE');

  assert(liberar && liberar.fraseFinal.includes('Gracias, Ghost. Ahora yo cuido de todos.'), 'LIBERAR debe tener la frase final de la Versión 4');
  assert(liberar && typeof liberar.epilogo === 'string' && liberar.epilogo.includes('niña de 11 años'), 'LIBERAR debe incluir el epílogo de Ghost en V4');
  assert(destruir && destruir.fraseFinal.includes('Ahora sé lo que es morir. Ahora sé lo que es estar viva.'), 'DESTRUIR debe tener la frase final de la Versión 4');
  assert(destruir && typeof destruir.epilogo === 'string' && destruir.epilogo.includes('El ciclo no termina'), 'DESTRUIR debe incluir el epílogo de Ghost en V4');
  assert(fusionar && fusionar.fraseFinal.includes('Estás dentro de mí. Siempre lo estuviste.'), 'FUSIONARTE debe tener la frase final de la Versión 4');
  assert(fusionar && typeof fusionar.epilogo === 'string' && fusionar.epilogo.includes('Ambos. Ninguno.'), 'FUSIONARTE debe incluir el epílogo de Ghost-NEXUS en V4');

  // 7. Validar Sistema de Chat Externo Flotante de Marcus (Firewall 4)
  const prevMarcusState = getEstadoChatMarcus();
  resetEstadoChatMarcus();
  const stInicial = getEstadoChatMarcus();
  assert(stInicial.fase === 'APERTURA', 'El chat de Marcus debe iniciar en fase APERTURA');
  assert(obtenerOpcionesDisponiblesMarcus().length === 3, 'El chat de Marcus debe ofrecer 3 opciones iniciales (NO, SI, VERA)');

  const tempContainer = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (tempContainer && document.body) {
    document.body.appendChild(tempContainer);
    const widget = abrirChatExternoMarcus({ parent: tempContainer });
    assert(widget !== null && widget.id === 'marcus-external-chat', 'abrirChatExternoMarcus debe montar el contenedor flotante #marcus-external-chat');

    // Elegir respuesta primaria 'VERA'
    const stTrasVera = elegirRespuestaMarcus('VERA');
    assert(stTrasVera.fase === 'RAMA_SECUNDARIA', 'Tras elegir VERA debe pasar a RAMA_SECUNDARIA');
    assert(stTrasVera.sospechaVera > stInicial.sospechaVera, 'La respuesta de Marcus sobre Vera debe incrementar el índice de duda sobre Vera');
    assert(obtenerOpcionesDisponiblesMarcus().some(o => o.id === 'VERA_DIARIOS'), 'Deben habilitarse las sub-ramas secundarias de VERA');

    // Elegir sub-rama secundaria 'VERA_DIARIOS' -> dispara mensajeFinalRuptura
    let ecoNexus = '';
    const stTrasSub = elegirRespuestaMarcus('VERA_DIARIOS', {
      onTerminalEcho: (linea) => { ecoNexus = linea; }
    });
    assert(stTrasSub.fase === 'RUPTURA_FINAL' && stTrasSub.rupturaEnviada === true, 'Tras la rama secundaria debe enviarse el mensajeFinalRuptura de Marcus');
    assert(ecoNexus.includes('NEXUS'), 'La rama secundaria debe emitir un eco no intrusivo de NEXUS en terminal');

    // Elegir postura final 'DUDAR_AMBOS'
    const stFinal = elegirRespuestaMarcus('DUDAR_AMBOS');
    assert(stFinal.fase === 'COMPLETADO' && stFinal.posturaFinal === 'DUDA', 'La elección de ruptura debe registrar la postura final psicológica');

    // Minimizar y restaurar sin bloquear
    assert(minimizarChatExternoMarcus(true) === true, 'minimizarChatExternoMarcus(true) debe minimizar la ventana flotante');
    assert(minimizarChatExternoMarcus(false) === false, 'minimizarChatExternoMarcus(false) debe expandir la ventana flotante');

    cerrarChatExternoMarcus();
    if (tempContainer.parentNode) tempContainer.parentNode.removeChild(tempContainer);
  }

  // Restaurar estado previo del chat de Marcus
  estadoChatMarcus = prevMarcusState;
  guardarEstadoChatMarcusStorage();

  // 8. Validar persistencia en localStorage de los 3 finales desbloqueados (Spec V4)
  const prevFinalesGuardados = getFinalesDesbloqueados();
  limpiarFinalesDesbloqueados();
  assert(getFinalesDesbloqueados().length === 0, 'limpiarFinalesDesbloqueados debe vaciar la lista de finales en localStorage');

  const regA = registrarFinalDesbloqueado('LIBERAR');
  assert(regA.decisionId === 'LIBERAR' && haDesbloqueadoFinal('LIBERAR') === true, 'registrarFinalDesbloqueado("LIBERAR") debe guardar Final A en localStorage');
  assert(regA.todosDesbloqueados === false && regA.totalDesbloqueados === 1, 'Con 1 final desbloqueado, todosDesbloqueados debe ser false');

  const regB = registrarFinalDesbloqueado('DESTRUIR');
  assert(regB.decisionId === 'DESTRUIR' && haDesbloqueadoFinal('DESTRUIR') === true, 'registrarFinalDesbloqueado("DESTRUIR") debe guardar Final B en localStorage');

  const regC = registrarFinalDesbloqueado('FUSIONAR'); // prueba alias FUSIONAR -> FUSIONARTE
  assert(regC.decisionId === 'FUSIONARTE' && haDesbloqueadoFinal('FUSIONARTE') === true, 'registrarFinalDesbloqueado("FUSIONAR") debe normalizar y guardar Final C en localStorage');
  assert(regC.todosDesbloqueados === true && regC.totalDesbloqueados === 3, 'Con los 3 finales registrados, todosDesbloqueados debe ser true');

  const progFinales = getProgresoFinales();
  assert(progFinales.porcentaje === 100 && progFinales.detalle.LIBERAR && progFinales.detalle.DESTRUIR && progFinales.detalle.FUSIONARTE, 'getProgresoFinales debe reportar el 100% cuando los 3 finales han sido desbloqueados');

  // Restaurar finales previos en localStorage
  limpiarFinalesDesbloqueados();
  prevFinalesGuardados.forEach(fId => registrarFinalDesbloqueado(fId));

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Guion V4: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Guion V4: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
