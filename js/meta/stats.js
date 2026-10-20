/**
 * @fileoverview Sistema de Estadísticas del Jugador y Perfil Persistente (Prompt 17 / Spec 6.1 & 6.2).
 * Calcula tiempo total, precisión, racha máxima, comandos escritos, logs encontrados,
 * finales vistos y determina el "Estilo de Juego" (Analítico, Impulsivo, Perfeccionista, Explorador).
 * Todo persistente en localStorage.
 */

const STORAGE_KEY_PROFILE = 'nexus_player_profile';

export function calcularEstiloDeJuego(stats = {}) {
  const precision = stats.precision ?? 100;
  const fallados = stats.puzzlesFallados ?? 0;
  const resueltos = stats.puzzlesResueltos ?? 0;
  const comandos = stats.comandosEscritos ?? 0;
  const logs = stats.logsEncontrados ?? 0;
  const tiempoTotal = stats.tiempoTotal ?? 60;
  const tiempoPromedio = resueltos > 0 ? (tiempoTotal / resueltos) : 30;

  // 1. Perfeccionista: precisión alta, casi sin fallas y buena cantidad de puzzles
  if (precision >= 85 && fallados <= 1 && resueltos >= 3) {
    return {
      nombre: 'Perfeccionista',
      icono: '🎯',
      lema: 'Sin margen de error. Cada deducción es infalible.',
      descripcion: 'Examinas cada premisa con meticulosidad quirúrgica. Raras veces cometes un fallo ante las defensas lógicas de NEXUS.'
    };
  }

  // 2. Explorador: explora directorios, cat de archivos, encuentra logs
  if (comandos >= 10 || logs >= 2) {
    return {
      nombre: 'Explorador',
      icono: '🧭',
      lema: 'La verdad yace oculta en los rincones del sistema.',
      descripcion: 'Inspeccionas directorios ocultos, buscas archivos prohibidos y extraes cada fragmento de la memoria profunda de la Dra. Sorenson.'
    };
  }

  // 3. Impulsivo: resuelve a gran velocidad (< 12s por puzzle)
  if (tiempoPromedio > 0 && tiempoPromedio < 14) {
    return {
      nombre: 'Impulsivo',
      icono: '⚡',
      lema: 'Velocidad sobre precaución. Reacción instintiva pura.',
      descripcion: 'Tu intuición opera más rápido que los centinelas. Atacas las respuestas por instinto relámpago antes de dudar.'
    };
  }

  // 4. Analítico: por defecto y formalismo lógico
  return {
    nombre: 'Analítico',
    icono: '🔬',
    lema: 'Lógica rigurosa y cálculo metódico.',
    descripcion: 'Descompones tablas de verdad, evalúas equivalencias formales y aplicas el método deductivo para avanzar con seguridad.'
  };
}

class StatsManager {
  constructor() {
    this.perfil = this.cargarPerfil();
    this.sesionActual = this.crearSesionNueva();
  }

  cargarPerfil() {
    const defaultProfile = {
      partidasJugadas: 0,
      partidasGanadas: 0,
      mejorPuntaje: 0,
      totalComandos: 0,
      totalPuzzlesResueltos: 0,
      totalPuzzlesFallados: 0,
      rachaRecord: 0,
      finalesVistos: [], // ['LIBERAR', 'DESTRUIR', 'FUSIONARTE']
      logsDesbloqueadosHistorico: [],
      estilosFrecuentes: {}
    };

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
      }
    } catch (_) {}
    return defaultProfile;
  }

  guardarPerfil() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(this.perfil));
      }
    } catch (_) {}
  }

  crearSesionNueva() {
    return {
      tiempoInicio: Date.now(),
      tiempoFin: null,
      tiempoTotal: 0, // segundos
      score: 0,
      puzzlesResueltos: 0,
      puzzlesFallados: 0,
      puzzlesTotales: 0,
      precision: 100,
      rachaMaxima: 0,
      comandosEscritos: 0,
      logsEncontrados: 0,
      palabrasDescifradas: 0,
      finalAlcanzado: null
    };
  }

  iniciarNuevaSesion() {
    this.sesionActual = this.crearSesionNueva();
  }

  registrarComando() {
    this.sesionActual.comandosEscritos++;
    this.perfil.totalComandos++;
    this.guardarPerfil();
  }

  registrarFinal(finalId) {
    if (!finalId) return;
    this.sesionActual.finalAlcanzado = finalId;
    if (!this.perfil.finalesVistos.includes(finalId)) {
      this.perfil.finalesVistos.push(finalId);
      this.guardarPerfil();
    }
  }

  finalizarSesion(state = {}) {
    const fin = Date.now();
    this.sesionActual.tiempoFin = fin;
    const segundos = Math.max(1, Math.round((fin - this.sesionActual.tiempoInicio) / 1000));
    this.sesionActual.tiempoTotal = segundos;

    const resueltos = state.puzzlesCorrect ?? this.sesionActual.puzzlesResueltos;
    const fallados = state.puzzlesFailed ?? this.sesionActual.puzzlesFallados;
    const totales = resueltos + fallados;

    this.sesionActual.score = state.score ?? 0;
    this.sesionActual.puzzlesResueltos = resueltos;
    this.sesionActual.puzzlesFallados = fallados;
    this.sesionActual.puzzlesTotales = totales;
    this.sesionActual.precision = totales > 0 ? Math.round((resueltos / totales) * 100) : 100;
    this.sesionActual.rachaMaxima = state.maxStreak ?? state.streak ?? 0;
    this.sesionActual.logsEncontrados = (state.logsFound || []).length;
    this.sesionActual.palabrasDescifradas = this.sesionActual.logsEncontrados + resueltos;

    const estilo = calcularEstiloDeJuego(this.sesionActual);
    this.sesionActual.estilo = estilo;

    // Actualizar perfil histórico
    this.perfil.partidasJugadas++;
    if (state.currentFirewall >= 4 || state.finalChoice) {
      this.perfil.partidasGanadas++;
    }
    this.perfil.mejorPuntaje = Math.max(this.perfil.mejorPuntaje, this.sesionActual.score);
    this.perfil.totalPuzzlesResueltos += resueltos;
    this.perfil.totalPuzzlesFallados += fallados;
    this.perfil.rachaRecord = Math.max(this.perfil.rachaRecord, this.sesionActual.rachaMaxima);

    if (state.finalChoice) {
      this.registrarFinal(state.finalChoice);
    }

    const estiloNom = estilo.nombre;
    this.perfil.estilosFrecuentes[estiloNom] = (this.perfil.estilosFrecuentes[estiloNom] || 0) + 1;

    this.guardarPerfil();
    return this.sesionActual;
  }

  getSesionActual() {
    return { ...this.sesionActual };
  }

  getPerfil() {
    return { ...this.perfil };
  }

  formatearTiempo(segundos) {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }

  renderPantalla(containerId) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const sesion = this.sesionActual;
    const estilo = sesion.estilo || calcularEstiloDeJuego(sesion);
    const perfil = this.perfil;

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 24px; font-family: var(--font-mono, monospace);">
        <!-- Encabezado -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 class="glow-text glitch" style="color: var(--green-bright, #00ff41); font-family: var(--font-display, sans-serif); font-size: 26px; margin-bottom: 6px;">
            📊 REGISTRO DE RENDIMIENTO // ESTADÍSTICAS DEL OPERADOR
          </h2>
          <p style="color: var(--text-dim, #888); font-size: 13px;">
            // Análisis heurístico del comportamiento deductivo de Ghost
          </p>
        </div>

        <!-- Tarjeta destacada de Estilo de Juego -->
        <div style="background: rgba(0, 255, 65, 0.05); border: 2px solid var(--green-bright, #00ff41); box-shadow: 0 0 25px rgba(0, 255, 65, 0.15); border-radius: 6px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 10px; color: var(--yellow-warn, #ffb800); font-weight: bold; letter-spacing: 0.15em;">
            ◈ ESTILO DE JUEGO DETECTADO
          </span>
          <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin: 10px 0;">
            <span style="font-size: 42px;">${estilo.icono}</span>
            <div style="text-align: left;">
              <h3 style="color: var(--green-bright, #00ff41); font-family: var(--font-display, sans-serif); font-size: 24px; margin: 0;">
                ${estilo.nombre.toUpperCase()}
              </h3>
              <p style="color: var(--cyan, #00e5ff); font-size: 12px; font-style: italic; margin: 2px 0 0 0;">
                "${estilo.lema}"
              </p>
            </div>
          </div>
          <p style="font-family: var(--font-narrative, sans-serif); color: var(--text-primary, #ddd); font-size: 14px; line-height: 1.6; max-width: 680px; margin: 0 auto;">
            ${estilo.descripcion}
          </p>
        </div>

        <!-- Métricas de la partida actual -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px;">
          <div class="hud__section" style="padding: 14px; text-align: left;">
            <span style="font-size: 11px; color: var(--text-dim, #888);">TIEMPO TOTAL</span>
            <div style="font-size: 20px; font-weight: bold; color: var(--green-bright, #00ff41); margin-top: 4px;">
              ⏱️ ${this.formatearTiempo(sesion.tiempoTotal || 0)}
            </div>
            <span style="font-size: 10px; color: var(--text-dim, #666);">en la sesión</span>
          </div>

          <div class="hud__section" style="padding: 14px; text-align: left;">
            <span style="font-size: 11px; color: var(--text-dim, #888);">PRECISIÓN DEDUCTIVA</span>
            <div style="font-size: 20px; font-weight: bold; color: var(--cyan, #00e5ff); margin-top: 4px;">
              🎯 ${sesion.precision}%
            </div>
            <span style="font-size: 10px; color: var(--text-dim, #666);">${sesion.puzzlesResueltos} de ${sesion.puzzlesTotales} acertados</span>
          </div>

          <div class="hud__section" style="padding: 14px; text-align: left;">
            <span style="font-size: 11px; color: var(--text-dim, #888);">RACHA MÁXIMA</span>
            <div style="font-size: 20px; font-weight: bold; color: var(--yellow-warn, #ffb800); margin-top: 4px;">
              🔥 ${sesion.rachaMaxima}
            </div>
            <span style="font-size: 10px; color: var(--text-dim, #666);">aciertos consecutivos</span>
          </div>

          <div class="hud__section" style="padding: 14px; text-align: left;">
            <span style="font-size: 11px; color: var(--text-dim, #888);">LOGS ENCONTRADOS</span>
            <div style="font-size: 20px; font-weight: bold; color: var(--green-bright, #00ff41); margin-top: 4px;">
              📜 ${sesion.logsEncontrados} / 5
            </div>
            <span style="font-size: 10px; color: var(--text-dim, #666);">archivos clasificados</span>
          </div>

          <div class="hud__section" style="padding: 14px; text-align: left;">
            <span style="font-size: 11px; color: var(--text-dim, #888);">COMANDOS EN TERMINAL</span>
            <div style="font-size: 20px; font-weight: bold; color: #fff; margin-top: 4px;">
              💻 ${sesion.comandosEscritos}
            </div>
            <span style="font-size: 10px; color: var(--text-dim, #666);">instrucciones de shell</span>
          </div>

          <div class="hud__section" style="padding: 14px; text-align: left;">
            <span style="font-size: 11px; color: var(--text-dim, #888);">PALABRAS / REGISTROS</span>
            <div style="font-size: 20px; font-weight: bold; color: var(--cyan, #00e5ff); margin-top: 4px;">
              🔓 ${sesion.palabrasDescifradas}
            </div>
            <span style="font-size: 10px; color: var(--text-dim, #666);">datos decodificados</span>
          </div>
        </div>

        <!-- Perfil histórico acumulado -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-primary, #333); border-radius: 6px; padding: 18px 24px; margin-bottom: 26px;">
          <div style="font-size: 11px; color: var(--yellow-warn, #ffb800); font-weight: bold; margin-bottom: 12px; letter-spacing: 0.1em;">
            ◈ EXPEDIENTE HISTÓRICO PERSISTENTE
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; font-size: 12px;">
            <div>
              <span style="color: var(--text-dim, #888);">Partidas iniciadas:</span>
              <strong style="color: #fff; margin-left: 6px;">${perfil.partidasJugadas}</strong>
            </div>
            <div>
              <span style="color: var(--text-dim, #888);">Récord de puntuación:</span>
              <strong style="color: var(--green-bright, #00ff41); margin-left: 6px;">${perfil.mejorPuntaje.toLocaleString()} PTS</strong>
            </div>
            <div>
              <span style="color: var(--text-dim, #888);">Récord de racha:</span>
              <strong style="color: var(--yellow-warn, #ffb800); margin-left: 6px;">${perfil.rachaRecord}</strong>
            </div>
            <div>
              <span style="color: var(--text-dim, #888);">Finales experimentados:</span>
              <strong style="color: var(--cyan, #00e5ff); margin-left: 6px;">${(perfil.finalesVistos || []).length} / 3</strong>
            </div>
          </div>
        </div>

        <!-- Botones de navegación -->
        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          <button id="btn-stats-volver-menu" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 12px;">
            ◂ VOLVER AL MENÚ
          </button>
          <button id="btn-stats-ver-logros" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 12px; border-color: var(--yellow-warn, #ffb800); color: var(--yellow-warn, #ffb800);">
            🏆 VER LOGROS
          </button>
          <button id="btn-stats-nueva-partida" class="menu-btn" style="width: auto; padding: 12px 28px; font-size: 12px; border-color: var(--green-bright, #00ff41); color: var(--green-bright, #00ff41);">
            ▸ NUEVA PARTIDA
          </button>
        </div>
      </div>
    `;

    // Handlers
    const btnMenu = document.getElementById('btn-stats-volver-menu');
    if (btnMenu) {
      btnMenu.onclick = () => {
        if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
          window.navigateTo('screen-menu');
        } else {
          import('../router.js').then(r => r.navigateTo('screen-menu'));
        }
      };
    }

    const btnLogros = document.getElementById('btn-stats-ver-logros');
    if (btnLogros) {
      btnLogros.onclick = () => {
        if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
          window.navigateTo('screen-logros');
        } else {
          import('../router.js').then(r => r.navigateTo('screen-logros'));
        }
      };
    }

    const btnNew = document.getElementById('btn-stats-nueva-partida');
    if (btnNew) {
      btnNew.onclick = () => {
        if (typeof window !== 'undefined' && typeof window.startNewGame === 'function') {
          window.startNewGame();
        } else if (typeof window !== 'undefined' && typeof window.navigateTo === 'function') {
          window.navigateTo('screen-game');
        } else {
          import('../router.js').then(r => r.navigateTo('screen-game'));
        }
      };
    }
  }
}

export const statsManager = new StatsManager();

/**
 * Suite de tests unitarios de estadísticas
 */
export function testStats() {
  console.group('%c[TEST SUITE] Estadísticas del Jugador (stats.js)', 'color: #00e5ff; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  // 1. Cálculo de estilo Perfeccionista
  const estiloPerf = calcularEstiloDeJuego({ precision: 95, puzzlesFallados: 0, puzzlesResueltos: 5 });
  assert(estiloPerf.nombre === 'Perfeccionista', 'Alta precisión y 0 fallos debe dar Perfeccionista');

  // 2. Cálculo de estilo Explorador
  const estiloExp = calcularEstiloDeJuego({ comandosEscritos: 15, logsEncontrados: 3 });
  assert(estiloExp.nombre === 'Explorador', 'Muchos comandos y logs debe dar Explorador');

  // 3. Cálculo de estilo Impulsivo
  const estiloImp = calcularEstiloDeJuego({ puzzlesResueltos: 5, tiempoTotal: 25, precision: 60 });
  assert(estiloImp.nombre === 'Impulsivo', 'Poco tiempo por puzzle (<14s) debe dar Impulsivo');

  // 4. Registro de sesión y comandos
  const prevCmds = statsManager.getPerfil().totalComandos;
  statsManager.registrarComando();
  assert(statsManager.getPerfil().totalComandos === prevCmds + 1, 'registrarComando debe incrementar perfil');

  // 5. Finalizar sesión
  const finRes = statsManager.finalizarSesion({ score: 1200, puzzlesCorrect: 3, puzzlesFailed: 1, currentFirewall: 1 });
  assert(finRes.score === 1200, 'Puntaje de sesión debe reflejarse en finalizarSesion');
  assert(finRes.precision === 75, '3 resueltos de 4 debe dar 75% precisión');

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Estadísticas: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Estadísticas: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
