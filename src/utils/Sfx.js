
export default class Sfx {
  constructor() {
    this.ctx = null;
  }

  
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  _tone({ freq = 440, to = null, time = 0.12, type = 'sine', gain = 0.08, when = 0 }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + time);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + time);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + time + 0.02);
  }

  tap() {
    this._tone({ freq: 300, to: 520, time: 0.06, type: 'triangle', gain: 0.05 });
  }

  collect() {
    this._tone({ freq: 660, to: 990, time: 0.1, type: 'sine', gain: 0.07 });
    this._tone({ freq: 1320, time: 0.08, type: 'sine', gain: 0.04, when: 0.05 });
  }

  hit() {
    this._tone({ freq: 180, to: 55, time: 0.3, type: 'sawtooth', gain: 0.09 });
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this._tone({ freq: f, time: 0.16, type: 'triangle', gain: 0.07, when: i * 0.11 })
    );
  }
}

/** Shared instance so every scene reuses one AudioContext. */
export const sfx = new Sfx();
