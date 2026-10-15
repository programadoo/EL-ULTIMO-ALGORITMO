/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Firebase Realtime Database — Cliente de Conexión y Sync
 * ══════════════════════════════════════════════════
 *
 * Implementa comunicación en tiempo real con Firebase Realtime Database
 * utilizando la REST API y EventSource (Server-Sent Events), con
 * fallback transparente a BroadcastChannel / bus en memoria para
 * entornos offline, pruebas unitarias y tabs locales en desarrollo.
 */

// Carga dinámica de credenciales desde entorno runtime (window.__NEXUS_CONFIG__, window.__ENV__, o process.env)
function obtenerConfigEntorno() {
  if (typeof window !== 'undefined') {
    if (window.__NEXUS_CONFIG__) return window.__NEXUS_CONFIG__;
    if (window.__ENV__) return window.__ENV__;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  return {};
}

const env = obtenerConfigEntorno();

// Configuración de Firebase resuelta dinámicamente sin credenciales fijas en código
export const FIREBASE_CONFIG = {
  apiKey: env.FIREBASE_API_KEY || "",
  authDomain: env.FIREBASE_AUTH_DOMAIN || "",
  databaseURL: (env.FIREBASE_DATABASE_URL || "").replace(/\/+$/, ''),
  projectId: env.FIREBASE_PROJECT_ID || "",
  storageBucket: env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.FIREBASE_APP_ID || "",
  measurementId: env.FIREBASE_MEASUREMENT_ID || ""
};

// Cargar overrides desde localStorage si existen
try {
  if (typeof localStorage !== 'undefined') {
    const customUrl = localStorage.getItem('nexus_firebase_url');
    if (customUrl) FIREBASE_CONFIG.databaseURL = customUrl.replace(/\/+$/, '');
    const customKey = localStorage.getItem('nexus_firebase_apiKey');
    if (customKey) FIREBASE_CONFIG.apiKey = customKey;
  }
} catch (_) {}

/**
 * Permite actualizar la configuración de Firebase dinámicamente.
 * @param {object} cfg
 */
export function configurarFirebase(cfg = {}) {
  if (cfg.databaseURL) {
    FIREBASE_CONFIG.databaseURL = cfg.databaseURL.replace(/\/+$/, '');
    try { localStorage.setItem('nexus_firebase_url', FIREBASE_CONFIG.databaseURL); } catch (_) {}
  }
  if (cfg.apiKey) {
    FIREBASE_CONFIG.apiKey = cfg.apiKey;
    try { localStorage.setItem('nexus_firebase_apiKey', FIREBASE_CONFIG.apiKey); } catch (_) {}
  }
  if (cfg.projectId) FIREBASE_CONFIG.projectId = cfg.projectId;
}

// ─────────────────────────────────────────────────
// BUS EN MEMORIA Y BROADCASTCHANNEL (FALLBACK RESILIENTE)
// ─────────────────────────────────────────────────

const mockStorage = new Map();
const activeSubscriptions = new Map();

// Canal de comunicación entre pestañas para juego local y fallback offline
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && typeof window.BroadcastChannel === 'function') {
    broadcastChannel = new BroadcastChannel('nexus_firebase_sync');
    broadcastChannel.onmessage = (event) => {
      const { type, partidaId, data } = event.data || {};
      if (type === 'PARTIDA_UPDATE' && partidaId) {
        mockStorage.set(partidaId, data);
        notifySubscribers(partidaId, data);
      }
    };
  }
} catch (_) {}

function notifySubscribers(partidaId, data) {
  const sub = activeSubscriptions.get(partidaId);
  if (sub && typeof sub.callback === 'function') {
    try {
      sub.callback(data);
    } catch (e) {
      console.warn(`[Firebase] Error en callback de suscripción (${partidaId}):`, e);
    }
  }
}

// ─────────────────────────────────────────────────
// OPERACIONES CRUD EN FIREBASE REALTIME DATABASE
// ─────────────────────────────────────────────────

/**
 * Retorna la URL del endpoint REST de Firebase para un nodo.
 * @param {string} path — ej: 'partidas/NX4821'
 */
function getEndpoint(path) {
  if (!FIREBASE_CONFIG.databaseURL) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = FIREBASE_CONFIG.databaseURL.replace(/\/+$/, '');
  const authParam = FIREBASE_CONFIG.apiKey ? `?auth=${FIREBASE_CONFIG.apiKey}` : '';
  return `${baseUrl}/${cleanPath}.json${authParam}`;
}

/**
 * Crea o reemplaza los datos de una partida.
 * @param {string} partidaId
 * @param {object} partidaData
 * @returns {Promise<boolean>}
 */
export async function crearPartida(partidaId, partidaData) {
  const cleanId = String(partidaId).toUpperCase().trim();
  mockStorage.set(cleanId, JSON.parse(JSON.stringify(partidaData)));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'PARTIDA_UPDATE', partidaId: cleanId, data: partidaData });
  }

  try {
    const res = await fetch(getEndpoint(`partidas/${cleanId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partidaData)
    });
    if (res.ok) {
      console.log(`[Firebase] Partida creada en la nube: ${cleanId}`);
      return true;
    }
  } catch (err) {
    console.warn(`[Firebase] Conexión remota no disponible (${err.message}). Usando bus local.`);
  }

  return true;
}

/**
 * Obtiene los datos actuales de una partida.
 * @param {string} partidaId
 * @returns {Promise<object|null>}
 */
export async function obtenerPartida(partidaId) {
  const cleanId = String(partidaId).toUpperCase().trim();

  try {
    const res = await fetch(getEndpoint(`partidas/${cleanId}`), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const remoteData = await res.json();
      if (remoteData) {
        mockStorage.set(cleanId, remoteData);
        return remoteData;
      }
    }
  } catch (_) {}

  // Fallback a almacenamiento local / en memoria
  return mockStorage.get(cleanId) || null;
}

/**
 * Actualiza campos específicos de una partida con PATCH.
 * @param {string} partidaId
 * @param {object} patchData
 * @returns {Promise<boolean>}
 */
export async function actualizarPartida(partidaId, patchData) {
  const cleanId = String(partidaId).toUpperCase().trim();

  // Actualizar cache local
  const current = mockStorage.get(cleanId) || {};
  const merged = { ...current, ...patchData };
  mockStorage.set(cleanId, merged);

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'PARTIDA_UPDATE', partidaId: cleanId, data: merged });
  }
  notifySubscribers(cleanId, merged);

  try {
    const res = await fetch(getEndpoint(`partidas/${cleanId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchData)
    });
    return res.ok;
  } catch (_) {
    return true; // Éxito en transporte local
  }
}

/**
 * Envía un mensaje al chat de la partida.
 * @param {string} partidaId
 * @param {{ autor: string, texto: string, timestamp?: number }} mensaje
 * @returns {Promise<boolean>}
 */
export async function enviarMensajeChat(partidaId, mensaje) {
  const cleanId = String(partidaId).toUpperCase().trim();
  const msgCompleto = {
    ...mensaje,
    timestamp: mensaje.timestamp || Date.now()
  };

  const partida = (await obtenerPartida(cleanId)) || { chat: [] };
  const chatActual = Array.isArray(partida.chat) ? partida.chat : [];
  chatActual.push(msgCompleto);

  return actualizarPartida(cleanId, { chat: chatActual });
}

/**
 * Suscribe a los cambios de una partida en tiempo real.
 * Si EventSource falla o está offline, usa polling inteligente y BroadcastChannel.
 * @param {string} partidaId
 * @param {Function} callback
 * @returns {Function} función para cancelar la suscripción
 */
export function suscribirPartida(partidaId, callback) {
  const cleanId = String(partidaId).toUpperCase().trim();

  desuscribirPartida(cleanId);

  let eventSource = null;
  let pollingInterval = null;

  // 1. Intentar Server-Sent Events (SSE) de Firebase
  try {
    if (typeof window !== 'undefined' && typeof window.EventSource === 'function') {
      const sseUrl = getEndpoint(`partidas/${cleanId}`);
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('put', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.data) {
            mockStorage.set(cleanId, payload.data);
            callback(payload.data);
          }
        } catch (_) {}
      });

      eventSource.addEventListener('patch', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.data) {
            const cur = mockStorage.get(cleanId) || {};
            const merged = { ...cur, ...payload.data };
            mockStorage.set(cleanId, merged);
            callback(merged);
          }
        } catch (_) {}
      });

      eventSource.onerror = () => {
        // Si SSE falla, cerramos y confiamos en el polling
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    }
  } catch (_) {}

  // 2. Polling periódico como respaldo continuo
  pollingInterval = setInterval(async () => {
    try {
      const data = await obtenerPartida(cleanId);
      if (data) {
        callback(data);
      }
    } catch (_) {}
  }, 1400);

  // Registro de suscripción activa
  activeSubscriptions.set(cleanId, {
    callback,
    eventSource,
    pollingInterval
  });

  return () => desuscribirPartida(cleanId);
}

/**
 * Cancela la suscripción en tiempo real de una partida y libera recursos.
 * @param {string} partidaId
 */
export function desuscribirPartida(partidaId) {
  const cleanId = String(partidaId).toUpperCase().trim();
  const sub = activeSubscriptions.get(cleanId);
  if (sub) {
    if (sub.eventSource) {
      try { sub.eventSource.close(); } catch (_) {}
    }
    if (sub.pollingInterval) {
      clearInterval(sub.pollingInterval);
    }
    activeSubscriptions.delete(cleanId);
  }
}

/**
 * Elimina una partida de la base de datos al finalizar.
 * @param {string} partidaId
 * @returns {Promise<boolean>}
 */
export async function eliminarPartida(partidaId) {
  const cleanId = String(partidaId).toUpperCase().trim();
  mockStorage.delete(cleanId);
  desuscribirPartida(cleanId);

  try {
    await fetch(getEndpoint(`partidas/${cleanId}`), { method: 'DELETE' });
  } catch (_) {}

  return true;
}

// ─────────────────────────────────────────────────
// SUITE DE TESTS CON CONSOLE.ASSERT
// ─────────────────────────────────────────────────

/**
 * Valida el funcionamiento del cliente de Firebase y el modelo de datos.
 * @returns {Promise<{ total: number, pasados: number, fallados: number }>}
 */
export async function testFirebase() {
  console.group('%c[TEST SUITE] Firebase Client & Data Sync (firebase.js)', 'color: #00ff41; font-weight: bold;');
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

  assert(typeof FIREBASE_CONFIG.databaseURL === 'string', 'databaseURL debe ser un string válido');
  assert(FIREBASE_CONFIG.databaseURL === '' || FIREBASE_CONFIG.databaseURL.includes('firebaseio.com'), 'databaseURL debe ser válida o estar vacía');
  assert(typeof crearPartida === 'function', 'crearPartida debe ser una función');
  assert(typeof obtenerPartida === 'function', 'obtenerPartida debe ser una función');
  assert(typeof actualizarPartida === 'function', 'actualizarPartida debe ser una función');
  assert(typeof enviarMensajeChat === 'function', 'enviarMensajeChat debe ser una función');
  assert(typeof suscribirPartida === 'function', 'suscribirPartida debe ser una función');

  // Test de creación y lectura de partida según el modelo del spec (3.4)
  const testId = 'TEST99';
  const testData = {
    jugadores: { uid1: 'Ghost_Test', uid2: 'Cipher_Test' },
    firewallActual: 1,
    turno: 'uid1',
    puntajes: { uid1: 100, uid2: 0 },
    integridad: { uid1: 100, uid2: 100 },
    chat: []
  };

  await crearPartida(testId, testData);
  const leida = await obtenerPartida(testId);
  assert(leida !== null && leida.firewallActual === 1, 'Partida guardada y leída correctamente');
  assert(leida.jugadores.uid1 === 'Ghost_Test', 'Modelo de datos almacena jugadores correctamente');

  // Test de chat
  await enviarMensajeChat(testId, { autor: 'Ghost_Test', texto: 'Enlace cuántico OK' });
  const conChat = await obtenerPartida(testId);
  assert(Array.isArray(conChat.chat) && conChat.chat.length === 1, 'Chat en tiempo real agrega mensajes');
  assert(conChat.chat[0].texto === 'Enlace cuántico OK', 'Mensaje de chat se preserva íntegro');

  // Test de actualización
  await actualizarPartida(testId, { turno: 'uid2', firewallActual: 2 });
  const actualizada = await obtenerPartida(testId);
  assert(actualizada.turno === 'uid2' && actualizada.firewallActual === 2, 'actualizarPartida modifica campos');

  // Limpieza
  await eliminarPartida(testId);
  const borrada = await obtenerPartida(testId);
  assert(borrada === null, 'eliminarPartida limpia la sala de pruebas');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Firebase: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Firebase: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
