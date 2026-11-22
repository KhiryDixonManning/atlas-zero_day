// A small synthesized soundscape. Nothing is loaded from disk: the night air, a few bells, paper, wax.
// Everything stays silent until she turns sound on; that tap is the gesture iOS needs.
const PENTA = [293.66, 369.99, 440, 493.88, 587.33, 739.99]; // D major pentatonic
class Audio {
  constructor() { this.ctx = null; this.on = false; this.hidden = false; this.master = null; this.bellTimer = 0; this.ambient = null; }
  async toggle() {
    if (!this.ctx) this.init();
    this.on = !this.on;
    if (this.on) { await this.ctx.resume(); this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.6); this.startAmbient(); }
    else { this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25); this.stopAmbient(); setTimeout(() => { if (!this.on && this.ctx) this.ctx.suspend(); }, 900); }
    return this.on;
  }
  setHidden(h) { this.hidden = h; if (!this.ctx || !this.on) return; if (h) this.ctx.suspend(); else this.ctx.resume(); }
  init() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0;
    const comp = this.ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    this.master.connect(comp); comp.connect(this.ctx.destination);
  }
  // ---- the ambient bed: a low, slow chord and a breath of filtered noise ----
  startAmbient() {
    if (this.ambient || !this.ctx) return;
    const c = this.ctx, now = c.currentTime, g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(1, now, 2.5); g.connect(this.master);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.4; lp.connect(g);
    const oscs = [];
    [[73.42, 0.05], [110, 0.045], [146.83, 0.03], [185, 0.02], [220.5, 0.012]].forEach(([f, v], i) => {
      const o = c.createOscillator(); o.type = i < 2 ? 'sine' : 'triangle'; o.frequency.value = f;
      const og = c.createGain(); og.gain.value = v;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.05 + i * 0.023; const lg = c.createGain(); lg.gain.value = f * 0.004;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start();
      o.connect(og); og.connect(lp); o.start(); oscs.push(o, lfo);
    });
    // night air
    const nb = c.createBuffer(1, c.sampleRate * 4, c.sampleRate); const d = nb.getChannelData(0); let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const ns = c.createBufferSource(); ns.buffer = nb; ns.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.5;
    const ng = c.createGain(); ng.gain.value = 0.035;
    const nl = c.createOscillator(); nl.frequency.value = 0.07; const nlg = c.createGain(); nlg.gain.value = 0.02; nl.connect(nlg); nlg.connect(ng.gain); nl.start();
    ns.connect(bp); bp.connect(ng); ng.connect(g); ns.start();
    this.ambient = { g, stop: () => { oscs.forEach(o => { try { o.stop(); } catch {} }); try { ns.stop(); nl.stop(); } catch {} } };
    const bell = () => { if (!this.ambient) return; this.bell(PENTA[(Math.random() * PENTA.length) | 0], 0.05 + Math.random() * 0.04); this.bellTimer = setTimeout(bell, 7000 + Math.random() * 9000); };
    this.bellTimer = setTimeout(bell, 4000);
  }
  stopAmbient() {
    if (!this.ambient) return; const a = this.ambient; this.ambient = null; clearTimeout(this.bellTimer);
    a.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4); setTimeout(a.stop, 1600);
  }
  // ---- one-shots ----
  bell(freq, vol = 0.07, t0 = 0) {
    const c = this.ctx, t = c.currentTime + t0;
    [[1, 1], [2.76, 0.28], [5.4, 0.08]].forEach(([m, v]) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0004, t + 2.8 / m);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 3);
    });
  }
  noise(dur, { type = 'bandpass', f = 2500, q = 0.8, vol = 0.2, attack = 0.004, t0 = 0, sweep } = {}) {
    const c = this.ctx, t = c.currentTime + t0, n = Math.max(1, (c.sampleRate * dur) | 0);
    const b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.setValueAtTime(f, t); if (sweep) flt.frequency.exponentialRampToValueAtTime(sweep, t + dur); flt.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    s.connect(flt); flt.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.05);
  }
  tone(freq, dur, { type = 'sine', vol = 0.1, t0 = 0, slide } = {}) {
    const c = this.ctx, t = c.currentTime + t0, o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  sfx(name) {
    if (!this.on || !this.ctx || this.hidden) return;
    switch (name) {
      case 'tick': this.noise(0.03, { f: 3200, q: 2, vol: 0.06 }); break;
      case 'paper': this.noise(0.22, { f: 3800, q: 0.6, vol: 0.12, attack: 0.02, sweep: 1800 }); this.noise(0.12, { f: 6000, q: 1, vol: 0.05, t0: 0.09 }); break;
      case 'page': this.noise(0.3, { f: 2600, q: 0.5, vol: 0.1, attack: 0.05, sweep: 900 }); break;
      case 'unfold': this.noise(0.4, { f: 1800, q: 0.5, vol: 0.09, attack: 0.08, sweep: 4200 }); this.noise(0.25, { f: 3000, q: 0.7, vol: 0.07, t0: 0.5, sweep: 1200 }); break;
      case 'seal': this.noise(0.05, { type: 'lowpass', f: 2600, q: 1, vol: 0.35 }); this.noise(0.12, { type: 'lowpass', f: 1400, q: 1, vol: 0.2, t0: 0.05 }); this.tone(160, 0.12, { vol: 0.08, slide: 70 }); break;
      case 'creak': this.tone(210, 0.55, { type: 'sawtooth', vol: 0.012, slide: 150 }); this.noise(0.5, { f: 900, q: 3, vol: 0.05, attack: 0.1, sweep: 500 }); this.tone(95, 0.18, { vol: 0.12, t0: 0.55, slide: 60 }); break;
      case 'chime': this.bell(PENTA[2], 0.08); this.bell(PENTA[4], 0.06, 0.18); break;
      case 'bloom': [0, 2, 3, 5].forEach((i, k) => this.bell(PENTA[i], 0.07, k * 0.35)); break;
      case 'purr': { const c = this.ctx, t = c.currentTime, n = (c.sampleRate * 1.6) | 0, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) { const tt = i / c.sampleRate; const env = Math.sin(Math.PI * tt / 1.6); d[i] = (Math.random() * 2 - 1) * env * (0.55 + 0.45 * Math.sin(tt * 2 * Math.PI * 26)); }
        const s = c.createBufferSource(); s.buffer = b; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 1.2;
        const g = c.createGain(); g.gain.value = 0.5; s.connect(lp); lp.connect(g); g.connect(this.master); s.start(t); break; }
      case 'sticker': this.noise(0.08, { f: 1500, q: 1, vol: 0.1, sweep: 4000 }); this.tone(880, 0.1, { vol: 0.03, t0: 0.03, slide: 1320 }); break;
      case 'crunch': this.noise(0.06, { type: 'lowpass', f: 3000, q: 1, vol: 0.25 }); this.noise(0.05, { type: 'lowpass', f: 2200, q: 1, vol: 0.18, t0: 0.07 }); break;
      case 'note': this.bell(PENTA[(Math.random() * PENTA.length) | 0], 0.05); break;
      case 'flutter': this.noise(0.35, { f: 2200, q: 0.4, vol: 0.06, attack: 0.05, sweep: 600 }); break;
      case 'firefly': this.tone(1760, 0.3, { vol: 0.015, slide: 2200 }); break;
    }
  }
}
export const audio = new Audio();
