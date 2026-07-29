// Web Audio Synthesizer for Zen Ambient Soundscapes & Audio Cues
// 100% Offline, Browser-Native Audio Generator

export type SoundscapeType = 'off' | 'binaural' | 'lofi' | 'rain' | 'synth';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = 'off';
  private masterGain: GainNode | null = null;
  private soundNodes: (AudioNode | number)[] = [];
  private volume: number = 0.4;
  private isDipped: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isDipped) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setSoundscape(type: SoundscapeType) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.stopSoundscape();
    this.currentType = type;

    if (type === 'off') return;

    if (type === 'binaural') {
      // 432 Hz + 442 Hz (10Hz Alpha Waves for relaxation & focus)
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      const merger = this.ctx.createChannelMerger(2);

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(432, this.ctx.currentTime);

      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(442, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(this.masterGain);

      oscL.start();
      oscR.start();

      this.soundNodes.push(oscL, oscR, gain, merger);
    } else if (type === 'rain') {
      // Pink/Brown noise generator for gentle rain
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.05;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.masterGain);
      whiteNoise.start();

      this.soundNodes.push(whiteNoise, filter);
    } else if (type === 'synth') {
      // Soft Ambient Chord Drone (C Major 7th / F Major 7th pads)
      const freqs = [130.81, 164.81, 196.00, 246.94]; // C, E, G, B
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      freqs.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        osc.start();
        this.soundNodes.push(osc, filter);
      });

      gain.connect(this.masterGain);
      this.soundNodes.push(gain);
    } else if (type === 'lofi') {
      // Warm chillhop vinyl-style chord generator
      const freqs = [146.83, 174.61, 220.00, 261.63]; // Dm7 chord
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      freqs.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(2, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(gain);
        osc.start();
        lfo.start();
        this.soundNodes.push(osc, lfo, lfoGain);
      });

      gain.connect(this.masterGain);
      this.soundNodes.push(gain);
    }
  }

  public stopSoundscape() {
    this.soundNodes.forEach((node) => {
      if (typeof node === 'object' && 'stop' in node && typeof (node as any).stop === 'function') {
        try {
          (node as any).stop();
        } catch (_) {}
      }
      if (typeof node === 'object' && 'disconnect' in node && typeof (node as any).disconnect === 'function') {
        try {
          (node as any).disconnect();
        } catch (_) {}
      }
    });
    this.soundNodes = [];
  }

  // Play crisp synthesized UI Beep for timers / countdowns
  public playBeep(freq: number = 880, duration: number = 0.15, type: OscillatorType = 'sine') {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Dip background music during speech coach cues
  public dipVolume(durationSec: number = 3) {
    if (!this.masterGain || !this.ctx) return;
    this.isDipped = true;
    this.masterGain.gain.setTargetAtTime(this.volume * 0.2, this.ctx.currentTime, 0.1);

    setTimeout(() => {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.5);
      }
      this.isDipped = false;
    }, durationSec * 1000);
  }
}

export const soundscapeEngine = new SoundscapeEngine();

// Speech Synthesis Helper for Voice Coach Cues
export function speakCoachCue(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech
    soundscapeEngine.dipVolume(3);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
