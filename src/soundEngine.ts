// Web Audio API Sound Synthesizer for Evita Rides

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMusicEnabled = false;
  private isSfxEnabled = true;
  private noteIndex = 0;

  // Cheerful romantic melody in C major / A minor
  private readonly melody = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    523.25, 659.25, 783.99, 1046.50,
    880.00, 783.99, 659.25, 587.33,
    659.25, 783.99, 880.00, 1046.50,
    987.77, 880.00, 783.99, 659.25,
    698.46, 783.99, 880.00, 698.46,
    587.33, 523.25, 587.33, 523.25
  ];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (enabled) {
      this.playMelodyStep();
      this.musicInterval = window.setInterval(() => this.playMelodyStep(), 270);
    }
  }

  public toggleMusic(): boolean {
    this.setMusicEnabled(!this.isMusicEnabled);
    return this.isMusicEnabled;
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
  }

  public getSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  private playMelodyStep() {
    if (!this.isMusicEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // warm retro chiptune sound
      osc.frequency.setValueAtTime(this.melody[this.noteIndex % this.melody.length], ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);

      this.noteIndex++;
    } catch {
      // Audio might be blocked before user gesture
    }
  }

  // Cute motorcycle horn "Tin-Tin! / Telolet"
  public playHorn() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now + offset); // E5
        osc.frequency.setValueAtTime(880.00, now + offset + 0.03); // A5

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } catch {
      // Ignore
    }
  }

  // Heart or Bonus collect sound
  public playCollect() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.12);
      });
    } catch {
      // Ignore
    }
  }

  // Soft comic crash sound
  public playCrash() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  // Victory fanfare
  public playVictory() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const victoryNotes = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.14 },
        { f: 1046.50, d: 0.35 },
        { f: 880.00, d: 0.12 },
        { f: 1046.50, d: 0.5 }
      ];

      let t = now;
      victoryNotes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + n.d + 0.02);
        t += n.d * 0.9;
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
