/**
 * ══════════════════════════════════════════════════
 * EL ÚLTIMO ALGORITMO
 * Audio — Motor de Audio Cyberpunk y Música Procedural (Web Audio API)
 * Especificación: Sección 4.3 & 7 de PROJECT_SPEC.md
 * ══════════════════════════════════════════════════
 *
 * Características:
 * 1. Banda sonora procedural synthwave / hacker electrónica generada en tiempo real.
 * 2. Cero dependencias externas (sin MP3 externos que puedan fallar en carga).
 * 3. Batería electrónica (808 sub kick, snare, hi-hats de 16th notes).
 * 4. Línea de bajo arpegiada estilo Perturbator / Carpenter Brut en escala E menor.
 * 5. Arpegios neón flotantes y pads de sintetizador retro-futuristas.
 * 6. Efectos sonoros integrados: tecleo, éxito, fallo, glitch, alarmas y CRT hum.
 * 7. Control de volumen, mute y listeners de estado para visualizadores del HUD.
 */

class CyberpunkAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.isAmbientPlaying = false;
    this.isMusicPlaying = false;
    this.muted = false;
    this.volume = 0.5;
    this.musicVolume = 0.35;

    // Planificador de música (lookahead scheduler)
    this.schedulerTimer = null;
    this.currentStep = 0;
    this.nextStepTime = 0;
    this.bpm = 124;
    this.musicListeners = new Set();

    // Cargar preferencia de mute y música desde localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        this.muted = localStorage.getItem('nexus_audio_muted') === 'true';
        const savedMusic = localStorage.getItem('nexus_music_enabled');
        this.shouldAutoStartMusic = (savedMusic !== 'false');
      }
    } catch (_) {
      this.shouldAutoStartMusic = true;
    }
  }

  /**
   * Inicializa el AudioContext bajo interacción de usuario (click/keydown).
   */
  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Music Gain dedicado
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = !!muted;
    try {
      localStorage.setItem('nexus_audio_muted', String(this.muted));
    } catch (_) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.notifyState();
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  onMusicStateChange(callback) {
    this.musicListeners.add(callback);
    return () => this.musicListeners.delete(callback);
  }

  notifyState() {
    for (const fn of this.musicListeners) {
      try { fn(this.isMusicPlaying, this.muted); } catch (_) {}
    }
  }

  // ─────────────────────────────────────────────────
  // SINTETIZADOR DE MÚSICA PROCEDURAL (CYBERPUNK HACKER THEME)
  // ─────────────────────────────────────────────────

  isMusicActive() {
    return this.isMusicPlaying;
  }

  startMusic() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    try { localStorage.setItem('nexus_music_enabled', 'true'); } catch (_) {}

    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } else {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 1.2);
    }

    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.1;

    // Scheduler de alta precisión (25ms lookahead)
    if (this.schedulerTimer) clearInterval(this.schedulerTimer);
    this.schedulerTimer = setInterval(() => this.runMusicScheduler(), 25);
    this.notifyState();
  }

  stopMusic() {
    if (!this.isMusicPlaying) return;
    this.isMusicPlaying = false;
    try { localStorage.setItem('nexus_music_enabled', 'false'); } catch (_) {}

    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
    }
    this.notifyState();
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  runMusicScheduler() {
    if (!this.ctx || !this.isMusicPlaying) return;

    const secondsPerStep = (60 / this.bpm) / 4; // 16th note
    const scheduleAheadTime = 0.18;

    while (this.nextStepTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleMusicStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += secondsPerStep;
      this.currentStep = (this.currentStep + 1) % 64; // 4 compases de 16 pasos
    }
  }

  /**
   * Dispara los instrumentos en el step correspondiente.
   * @param {number} step (0..63)
   * @param {number} time
   */
  scheduleMusicStep(step, time) {
    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // 1. Cyber Kick (en los 4 tiempos principales)
    if (stepInBar === 0 || stepInBar === 4 || stepInBar === 8 || stepInBar === 12) {
      this.synthKick(time);
    }

    // 2. Cyber Snare / Clap (en tiempos 2 y 4: pasos 4 y 12)
    if (stepInBar === 4 || stepInBar === 12) {
      this.synthSnare(time);
    }

    // 3. Hi-Hats de 16th notes con acentos
    const isAccent = (stepInBar % 4 === 2);
    this.synthHihat(time, isAccent);

    // 4. Bassline de sintetizador (E minor / Cyberpunk bass)
    // Escala de bajos por compás:
    // Bar 0: E1 (41.2 Hz)
    // Bar 1: C1 (32.7 Hz)
    // Bar 2: A0 (27.5 Hz) / G1 (49.0 Hz)
    // Bar 3: B0 (30.8 Hz) / D1 (36.7 Hz)
    const baseFreqs = [41.2, 32.7, 55.0, 36.7];
    const root = baseFreqs[bar];

    let bassFreq = root;
    if (stepInBar === 6 || stepInBar === 14) bassFreq = root * 1.5; // Quinta
    if (stepInBar === 10) bassFreq = root * 1.2; // Tercera menor
    if (stepInBar === 15) bassFreq = root * 1.33;

    // Bajo en cada semicorchea para ritmo pulsante estilo synthwave
    if (stepInBar % 2 === 0 || stepInBar === 7 || stepInBar === 15) {
      this.synthBass(bassFreq, time, 0.12);
    }

    // 5. Arpegio Melódico Neón (notas flotantes en compases 1-4)
    // Escala menor cyberpunk: E4, G4, A4, B4, D5, E5
    const arpMap = [
      329.63, 392.00, 493.88, 659.25, 587.33, 493.88, 392.00, 440.00,
      493.88, 587.33, 493.88, 392.00, 329.63, 293.66, 329.63, 392.00
    ];
    if (stepInBar % 2 === 1) {
      const noteFreq = arpMap[(stepInBar + bar * 4) % arpMap.length];
      this.synthArp(noteFreq, time, 0.16);
    }

    // 6. Pad de fondo al inicio de cada compás
    if (stepInBar === 0) {
      const padChords = [
        [164.81, 196.00, 246.94], // Em
        [130.81, 164.81, 196.00], // C
        [110.00, 146.83, 174.61], // Am
        [123.47, 146.83, 185.00]  // Bm
      ];
      this.synthPad(padChords[bar], time, 3.8);
    }
  }

  // ── Instrumentos procedurales sintetizados ──

  synthKick(time) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.24);
    } catch (_) {}
  }

  synthSnare(time) {
    try {
      // Tono del cuerpo
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
      oscGain.gain.setValueAtTime(0.2, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.14);

      // Ruido blanco filtrado (snare snap)
      const bufferSize = this.ctx.sampleRate * 0.14;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.16);
    } catch (_) {}
  }

  synthHihat(time, isAccent = false) {
    try {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(7500, time);
      filter.Q.setValueAtTime(2.5, time);

      const gain = this.ctx.createGain();
      const vol = isAccent ? 0.14 : 0.06;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.045);
    } catch (_) {}
  }

  synthBass(freq, time, duration = 0.12) {
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 0.5, time); // Sub-octava

      // Filtro con envolvente snappy
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.exponentialRampToValueAtTime(110, time + duration);
      filter.Q.setValueAtTime(4.0, time);

      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration + 0.02);
      osc2.stop(time + duration + 0.02);
    } catch (_) {}
  }

  synthArp(freq, time, duration = 0.16) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.frequency.exponentialRampToValueAtTime(400, time + duration);
      filter.Q.setValueAtTime(6.0, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    } catch (_) {}
  }

  synthPad(chordFreqs, time, duration = 3.5) {
    try {
      chordFreqs.forEach((freq, idx) => {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, time);
        osc2.frequency.setValueAtTime(freq * 1.008, time); // Detune analógico

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, time);
        filter.frequency.linearRampToValueAtTime(750, time + duration * 0.5);
        filter.frequency.linearRampToValueAtTime(280, time + duration);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.035, time + 0.8);
        gain.gain.linearRampToValueAtTime(0.001, time + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
      });
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────
  // EFECTOS DE SONIDO (SFX)
  // ─────────────────────────────────────────────────

  playKeyClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.028);
    } catch (_) {}
  }

  playSuccess() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50];

      freqs.forEach((freq, idx) => {
        const noteTime = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    } catch (_) {}
  }

  playError() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(65, now + 0.28);

      osc2.frequency.setValueAtTime(145, now);
      osc2.frequency.exponentialRampToValueAtTime(68, now + 0.28);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.32);
      osc2.stop(now + 0.32);
    } catch (_) {}
  }

  playGlitch() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (i % 8 < 4 ? 0.8 : -0.8);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch (_) {}
  }

  playAlarm() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.3);
      osc.frequency.setValueAtTime(660, now + 0.45);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.62);
    } catch (_) {}
  }

  playBoot() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(15734, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.015, now + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch (_) {}
  }

  toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  startAmbient() {
    if (this.isAmbientPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.04, now + 2);
      this.ambientGain.connect(this.masterGain);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, now);

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, now);
      this.ambientOsc2.detune.setValueAtTime(6, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);
      filter.Q.setValueAtTime(2, now);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);

      this.ambientOsc1.start(now);
      this.ambientOsc2.start(now);
      this.isAmbientPlaying = true;
    } catch (_) {}
  }

  stopAmbient() {
    if (!this.isAmbientPlaying) return;
    try {
      if (this.ambientGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          if (this.ambientOsc1) { try { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); } catch (_) {} }
          if (this.ambientOsc2) { try { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); } catch (_) {} }
          this.ambientOsc1 = null;
          this.ambientOsc2 = null;
          this.ambientGain = null;
          this.isAmbientPlaying = false;
        }, 1100);
      } else {
        this.isAmbientPlaying = false;
      }
    } catch (_) {
      this.isAmbientPlaying = false;
    }
  }
}

// Instancia singleton exportada
export const audio = new CyberpunkAudioEngine();

/**
 * Suite de tests unitarios de audio.
 */
export function testAudio() {
  console.group('%c[TEST SUITE] Audio Cyberpunk (audio.js)', 'color: #00ff41; font-weight: bold;');
  let total = 0, pasados = 0;

  function assert(cond, msg) {
    total++;
    console.assert(cond, `[FALLO] ${msg}`);
    if (cond) pasados++;
    else console.error(`❌ FAILED: ${msg}`);
  }

  assert(typeof audio.playKeyClick === 'function', 'audio.playKeyClick debe existir');
  assert(typeof audio.playSuccess === 'function', 'audio.playSuccess debe existir');
  assert(typeof audio.playError === 'function', 'audio.playError debe existir');
  assert(typeof audio.playGlitch === 'function', 'audio.playGlitch debe existir');
  assert(typeof audio.playAlarm === 'function', 'audio.playAlarm debe existir');
  assert(typeof audio.playBoot === 'function', 'audio.playBoot debe existir');
  assert(typeof audio.startMusic === 'function', 'audio.startMusic debe existir');
  assert(typeof audio.stopMusic === 'function', 'audio.stopMusic debe existir');
  assert(typeof audio.toggleMusic === 'function', 'audio.toggleMusic debe existir');
  assert(typeof audio.toggleAmbient === 'function', 'audio.toggleAmbient debe existir');
  assert(typeof audio.setMuted === 'function', 'audio.setMuted debe existir');

  const prevMuted = audio.isMuted();
  audio.setMuted(true);
  assert(audio.isMuted() === true, 'audio.setMuted(true) debe cambiar estado a silenciado');
  audio.setMuted(false);
  assert(audio.isMuted() === false, 'audio.setMuted(false) debe cambiar estado a activo');
  audio.setMuted(prevMuted);

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Audio: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Audio: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
