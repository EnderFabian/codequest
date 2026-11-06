const AudioManager = {
  enabled: true,
  musicEnabled: false,
  ctx: null,

  init() {
    const p = loadProgress();
    this.enabled = p.settings?.sound !== false;
    this.musicEnabled = p.settings?.music === true;
  },

  getContext() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {}
    }
    return this.ctx;
  },

  playTone(freq, duration = 0.15, type = 'sine', volume = 0.15) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.value = volume;
    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  snap() { this.playTone(520, 0.08); },
  success() {
    this.playTone(523, 0.12);
    setTimeout(() => this.playTone(659, 0.12), 100);
    setTimeout(() => this.playTone(784, 0.2), 200);
  },
  error() { this.playTone(200, 0.25, 'triangle', 0.12); },
  click() { this.playTone(400, 0.06); },
  step() { this.playTone(350, 0.05); },

  speak(text) {
    if (!this.enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 0.9;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  },

  toggle() {
    this.enabled = !this.enabled;
    const p = loadProgress();
    p.settings.sound = this.enabled;
    saveProgress(p);
    return this.enabled;
  }
};

AudioManager.init();
