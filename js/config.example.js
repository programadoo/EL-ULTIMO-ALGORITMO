/**
 * Plantilla de configuración de entorno para El Último Algoritmo.
 * Copia este archivo como 'js/config.js' e introduce tus credenciales de Firebase.
 */
const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);

globalScope.__NEXUS_CONFIG__ = {
  FIREBASE_API_KEY: "",
  FIREBASE_AUTH_DOMAIN: "",
  FIREBASE_DATABASE_URL: "",
  FIREBASE_PROJECT_ID: "",
  FIREBASE_STORAGE_BUCKET: "",
  FIREBASE_MESSAGING_SENDER_ID: "",
  FIREBASE_APP_ID: "",
  FIREBASE_MEASUREMENT_ID: ""
};
