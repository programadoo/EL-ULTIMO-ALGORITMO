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

    // Capas dinámicas y tensión reactiva (Prompt 11 / Spec 1.1)
    this.currentFirewall = 0;
    this.streak = 0;
    this.ambientFilter = null;
    this.isHeartbeatActive = false;
    this.heartbeatTimer = null;

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
   * Capas dinámicas según racha (Prompt 11 / Spec 1.1 y 1.3):
   * Base: Kick + Snare + Pad
   * Capa 1 (+ hi-hats rítmicos): streak >= 3 o Firewall 5
   * Capa 2 (+ bajo sintetizado 16th): streak >= 5 o Firewall 5
   * Capa 3 (+ arpegio neón flotante): streak >= 10 o Firewall 5
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

    // Capa 1: Hi-Hats de 16th notes (Racha >= 3 o Firewall 5)
    const layer1Active = (this.streak >= 3 || this.currentFirewall >= 4);
    if (layer1Active) {
      const isAccent = (stepInBar % 4 === 2);
      this.synthHihat(time, isAccent);
    }

    // Capa 2: Bassline de sintetizador 16th notes (Racha >= 5 o Firewall 5)
    const layer2Active = (this.streak >= 5 || this.currentFirewall >= 4);
    if (layer2Active) {
      const baseFreqs = [41.2, 32.7, 55.0, 36.7];
      const root = baseFreqs[bar];

      let bassFreq = root;
      if (stepInBar === 6 || stepInBar === 14) bassFreq = root * 1.5; // Quinta
      if (stepInBar === 10) bassFreq = root * 1.2; // Tercera menor
      if (stepInBar === 15) bassFreq = root * 1.33;

      if (stepInBar % 2 === 0 || stepInBar === 7 || stepInBar === 15) {
        this.synthBass(bassFreq, time, 0.12);
      }
    }

    // Capa 3: Arpegio Melódico Neón (Racha >= 10 o Firewall 5)
    const layer3Active = (this.streak >= 10 || this.currentFirewall >= 4);
    if (layer3Active) {
      const arpMap = [
        329.63, 392.00, 493.88, 659.25, 587.33, 493.88, 392.00, 440.00,
        493.88, 587.33, 493.88, 392.00, 329.63, 293.66, 329.63, 392.00
      ];
      if (stepInBar % 2 === 1) {
        const noteFreq = arpMap[(stepInBar + bar * 4) % arpMap.length];
        this.synthArp(noteFreq, time, 0.16);
      }
    }

    // Base Pad: Pad de fondo al inicio de cada compás
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

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(180, now);
      this.ambientFilter.Q.setValueAtTime(2, now);

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);

      this.ambientOsc1.start(now);
      this.ambientOsc2.start(now);
      this.isAmbientPlaying = true;

      if (this.currentFirewall > 0) {
        this.setFirewallDrone(this.currentFirewall);
      }
    } catch (_) {}
  }

  stopAmbient() {
    if (!this.isAmbientPlaying) return;
    this.stopHeartbeat();
    try {
      if (this.ambientGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          if (this.ambientOsc1) { try { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); } catch (_) {} }
          if (this.ambientOsc2) { try { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); } catch (_) {} }
          this.ambientOsc1 = null;
          this.ambientOsc2 = null;
          this.ambientFilter = null;
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

  /**
   * Cambia la tonalidad del drone ambiental según el firewall actual.
   * Spec 1.1 / Prompt 11:
   * FW1 (alpha): neutro, curioso (55Hz & 82.4Hz, filter 180Hz)
   * FW2 (beta): tenso (55Hz & 77.78Hz tritono F#, filter 220Hz)
   * FW3 (gamma): misterioso (55Hz & 73.42Hz sus4 D, filter 270Hz)
   * FW4 (delta): melancólico (49.0Hz B0 & 58.27Hz Bb, filter 200Hz)
   * FW5 (omega): épico (41.2Hz E0 & 82.41Hz E1 con detune rico, filter 380Hz)
   * @param {number} fwIndex (0..4)
   */
  setFirewallDrone(fwIndex = 0) {
    this.currentFirewall = Math.max(0, Math.min(4, fwIndex));
    if (!this.ctx || !this.isAmbientPlaying) return;

    const droneProfiles = [
      { f1: 55.0,  f2: 82.41, cutoff: 180, q: 2.0, detune: 4 },  // FW1: Curioso / Neutro
      { f1: 55.0,  f2: 77.78, cutoff: 220, q: 3.0, detune: 9 },  // FW2: Tenso (Tritono)
      { f1: 55.0,  f2: 73.42, cutoff: 270, q: 3.8, detune: 6 },  // FW3: Misterioso (Sus4)
      { f1: 49.0,  f2: 58.27, cutoff: 200, q: 2.5, detune: 8 },  // FW4: Melancólico (Menor)
      { f1: 41.2,  f2: 82.41, cutoff: 380, q: 4.5, detune: 16 }  // FW5: Épico (Rico / Completo)
    ];

    const p = droneProfiles[this.currentFirewall] || droneProfiles[0];
    const now = this.ctx.currentTime;
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.frequency.cancelScheduledValues(now);
        this.ambientOsc1.frequency.linearRampToValueAtTime(p.f1, now + 1.5);
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.frequency.cancelScheduledValues(now);
        this.ambientOsc2.frequency.linearRampToValueAtTime(p.f2, now + 1.5);
        this.ambientOsc2.detune.linearRampToValueAtTime(p.detune, now + 1.5);
      }
      if (this.ambientFilter) {
        this.ambientFilter.frequency.cancelScheduledValues(now);
        this.ambientFilter.frequency.linearRampToValueAtTime(p.cutoff, now + 1.5);
        this.ambientFilter.Q.linearRampToValueAtTime(p.q, now + 1.5);
      }
    } catch (_) {}
  }

  /**
   * Actualiza los parámetros de tensión acústica según el estado de juego.
   * Dispara latido si el timer <= 30s o la integridad <= 30%.
   * @param {object} param0
   */
  updateTension({ timer = null, integrity = null, streak = null, firewall = null } = {}) {
    if (streak !== null && streak !== undefined) {
      this.streak = streak;
    }
    if (firewall !== null && firewall !== undefined && firewall !== this.currentFirewall) {
      this.setFirewallDrone(firewall);
    }

    const isTimerCritical = (timer !== null && timer !== undefined && timer > 0 && timer <= 30);
    const isIntegrityCritical = (integrity !== null && integrity !== undefined && integrity > 0 && integrity <= 30);

    if (isTimerCritical || isIntegrityCritical) {
      this.startHeartbeat();
    } else {
      this.stopHeartbeat();
    }
  }

  startHeartbeat() {
    if (this.isHeartbeatActive) return;
    this.isHeartbeatActive = true;
    this.initContext();

    if (this.ambientGain && this.ctx && !this.muted) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.075, now + 0.8);
      } catch (_) {}
    }

    const beat = () => {
      if (!this.isHeartbeatActive) return;
      this.triggerHeartbeatPulse();
      this.heartbeatTimer = setTimeout(beat, 860);
    };
    beat();
  }

  stopHeartbeat() {
    if (!this.isHeartbeatActive) return;
    this.isHeartbeatActive = false;
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ambientGain && this.ctx && !this.muted) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
      } catch (_) {}
    }
  }

  triggerHeartbeatPulse() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Primer pulso "lub"
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(62, now);
      osc1.frequency.exponentialRampToValueAtTime(36, now + 0.11);
      gain1.gain.setValueAtTime(0.32, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Segundo pulso "dub" (140ms después)
      const t2 = now + 0.14;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(50, t2);
      osc2.frequency.exponentialRampToValueAtTime(32, t2 + 0.13);
      gain2.gain.setValueAtTime(0.24, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.14);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(t2);
      osc2.stop(t2 + 0.15);
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────
  // EFECTOS DE SONIDO ADICIONALES (PROMPT 11 / SPEC 1.2)
  // ─────────────────────────────────────────────────

  /** "Thunk" pesado al presionar Enter en terminal */
  playEnter() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.07);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  /** Sonido de módem/procesando al procesar comandos de terminal */
  playCommandProcessing() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [1400, 1950, 1600, 2200];
      freqs.forEach((freq, idx) => {
        const t = now + idx * 0.022;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.022);
      });
    } catch (_) {}
  }

  /** Sonido de unlock con eco largo para descifrar logs */
  playUnlock() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [440, 880, 1320, 1760];
      freqs.forEach((freq, idx) => {
        const t = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.6);
      });
    } catch (_) {}
  }

  /** Coro electrónico + whoosh ascendente al completar firewall */
  playFirewallComplete() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const t = now + idx * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * 0.8, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 1.25);
      });

      // Whoosh de ruido filtrado ascendente
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(4500, now + 0.55);
      filter.Q.setValueAtTime(3.0, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
    } catch (_) {}
  }

  /** Nota única y profunda para el plot twist */
  playTwistNote() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.musicGain) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      }
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(110.0, now); // A2
      osc2.frequency.setValueAtTime(110.5, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.1);
      osc2.stop(now + 3.1);
    } catch (_) {}
  }

  /** Beep de sintonización de radio para transmisiones de Vera */
  playRadioBeep() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.setValueAtTime(1250, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.095);
    } catch (_) {}
  }

  /** Estática de cierre de transmisión de radio */
  playRadioStaticEnd() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    } catch (_) {}
  }
}

// ─────────────────────────────────────────────────
// MOTOR DE VOZ SINTETIZADA (PROMPT 12 / SPEC 1.4)
// ─────────────────────────────────────────────────

export class CyberpunkSpeechEngine {
  constructor() {
    this.enabled = false; // Voz sintetizada desactivada permanentemente por solicitud del usuario
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nexus_voice_enabled', 'false');
      }
    } catch (_) {}
  }

  isVoiceEnabled() {
    return this.enabled;
  }

  setVoiceEnabled(val) {
    this.enabled = !!val;
    try {
      localStorage.setItem('nexus_voice_enabled', String(this.enabled));
    } catch (_) {}
    return this.enabled;
  }

  toggleVoice() {
    return this.setVoiceEnabled(!this.enabled);
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
  }

  getVoiceForLang() {
    return null;
  }

  /**
   * Voz de NEXUS: Desactivada. Voz sintetizada eliminada.
   */
  speakNexus() {
    // Voz sintetizada eliminada por solicitud (sonaba robótica e inadecuada)
    this.stop();
  }

  /**
   * Voz de Vera: Solo emite el sutil efecto de radio-transmisión (beep / static) sin habla sintetizada.
   */
  speakVera() {
    this.stop();
    try {
      if (audio && typeof audio.playRadioBeep === 'function') {
        audio.playRadioBeep();
      }
      setTimeout(() => {
        if (audio && typeof audio.playRadioStaticEnd === 'function') {
          audio.playRadioStaticEnd();
        }
      }, 350);
    } catch (_) {}
  }
}

// Instancias singleton exportadas
export const audio = new CyberpunkAudioEngine();
export const speechEngine = new CyberpunkSpeechEngine();

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

  // Prompts 11 & 12 assertions
  assert(typeof audio.setFirewallDrone === 'function', 'audio.setFirewallDrone debe existir');
  assert(typeof audio.updateTension === 'function', 'audio.updateTension debe existir');
  assert(typeof audio.startHeartbeat === 'function', 'audio.startHeartbeat debe existir');
  assert(typeof audio.stopHeartbeat === 'function', 'audio.stopHeartbeat debe existir');
  assert(typeof audio.playEnter === 'function', 'audio.playEnter debe existir');
  assert(typeof audio.playCommandProcessing === 'function', 'audio.playCommandProcessing debe existir');
  assert(typeof audio.playUnlock === 'function', 'audio.playUnlock debe existir');
  assert(typeof audio.playFirewallComplete === 'function', 'audio.playFirewallComplete debe existir');
  assert(typeof audio.playTwistNote === 'function', 'audio.playTwistNote debe existir');
  assert(typeof speechEngine.speakNexus === 'function', 'speechEngine.speakNexus debe existir');
  assert(typeof speechEngine.speakVera === 'function', 'speechEngine.speakVera debe existir');
  assert(typeof speechEngine.toggleVoice === 'function', 'speechEngine.toggleVoice debe existir');
  assert(typeof speechEngine.isVoiceEnabled === 'function', 'speechEngine.isVoiceEnabled debe existir');

  const prevMuted = audio.isMuted();
  audio.setMuted(true);
  assert(audio.isMuted() === true, 'audio.setMuted(true) debe cambiar estado a silenciado');
  audio.setMuted(false);
  assert(audio.isMuted() === false, 'audio.setMuted(false) debe cambiar estado a activo');
  audio.setMuted(prevMuted);

  const prevVoice = speechEngine.isVoiceEnabled();
  speechEngine.setVoiceEnabled(true);
  assert(speechEngine.isVoiceEnabled() === true, 'speechEngine.setVoiceEnabled(true) debe activar voz');
  speechEngine.setVoiceEnabled(false);
  assert(speechEngine.isVoiceEnabled() === false, 'speechEngine.setVoiceEnabled(false) debe desactivar voz');
  speechEngine.setVoiceEnabled(prevVoice);

  const fallados = total - pasados;
  if (fallados === 0) {
    console.log(`%c[OK] Tests de Audio: ${pasados}/${total} pasados.`, 'color: #00ff41;');
  } else {
    console.warn(`%c[ERROR] Tests de Audio: ${fallados} fallaron de ${total}.`, 'color: #ff3333; font-weight: bold;');
  }
  console.groupEnd();
  return { total, pasados, fallados };
}
