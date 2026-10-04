// Dedicated Procedural Web Audio Engine for "The Blood Of The Bird" Intro Cinematic

export class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  // City Night Atmosphere
  private cityWindGain: GainNode | null = null;
  private cityWindSource: AudioBufferSourceNode | null = null;
  private cityRumbleGain: GainNode | null = null;
  private cityRumbleOsc: OscillatorNode | null = null;

  // Wall Anomaly Resonance
  private wallResonanceGain: GainNode | null = null;
  private wallResonanceOsc1: OscillatorNode | null = null;
  private wallResonanceOsc2: OscillatorNode | null = null;
  private wallFilter: BiquadFilterNode | null = null;

  // Backrooms Fluorescent Hum
  private fluorescentGain: GainNode | null = null;
  private fluorescentOsc1: OscillatorNode | null = null;
  private fluorescentOsc2: OscillatorNode | null = null;
  private fluorescentOsc3: OscillatorNode | null = null;

  private isInitialized = false;

  constructor() {
    // Lazy initialized on user gesture
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('CinematicAudio Web Audio Context failed to initialize', e);
    }
  }

  // Start Scene 1: Night City Environment
  public startCityAtmosphere() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1. Filtered Pink Noise for Wet City Night Wind
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    this.cityWindSource = this.ctx.createBufferSource();
    this.cityWindSource.buffer = noiseBuffer;
    this.cityWindSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, t);

    this.cityWindGain = this.ctx.createGain();
    this.cityWindGain.gain.setValueAtTime(0.001, t);
    this.cityWindGain.gain.exponentialRampToValueAtTime(0.28, t + 1.2);

    this.cityWindSource.connect(windFilter);
    windFilter.connect(this.cityWindGain);
    this.cityWindGain.connect(this.masterGain);
    this.cityWindSource.start(t);

    // 2. Deep Sub-urban Rumble (distant highways / power substation)
    this.cityRumbleOsc = this.ctx.createOscillator();
    this.cityRumbleOsc.type = 'sine';
    this.cityRumbleOsc.frequency.setValueAtTime(46, t);

    this.cityRumbleGain = this.ctx.createGain();
    this.cityRumbleGain.gain.setValueAtTime(0.001, t);
    this.cityRumbleGain.gain.exponentialRampToValueAtTime(0.22, t + 1.5);

    this.cityRumbleOsc.connect(this.cityRumbleGain);
    this.cityRumbleGain.connect(this.masterGain);
    this.cityRumbleOsc.start(t);
  }

  // Play realistic wet duck footstep
  public playFootstep(isWetAsphalt: boolean = true) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isWetAsphalt ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(110 + Math.random() * 25, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isWetAsphalt ? 850 : 420, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);

    // Light wet splash noise on asphalt
    if (isWetAsphalt) {
      const splashBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.06), this.ctx.sampleRate);
      const sdata = splashBuf.getChannelData(0);
      for (let i = 0; i < sdata.length; i++) sdata[i] = (Math.random() * 2 - 1) * 0.08;
      const sSource = this.ctx.createBufferSource();
      sSource.buffer = splashBuf;
      const sFilter = this.ctx.createBiquadFilter();
      sFilter.type = 'highpass';
      sFilter.frequency.setValueAtTime(1200, t);
      const sGain = this.ctx.createGain();
      sGain.gain.setValueAtTime(0.12, t);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      sSource.connect(sFilter);
      sFilter.connect(sGain);
      sGain.connect(this.masterGain);
      sSource.start(t);
    }
  }

  // Scene 2: Strange Unnatural Wall Anomaly Sound (throbbing dimensional leak)
  public triggerWallSound(intensity: number = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    if (!this.wallResonanceGain) {
      this.wallResonanceGain = this.ctx.createGain();
      this.wallFilter = this.ctx.createBiquadFilter();
      this.wallFilter.type = 'bandpass';
      this.wallFilter.frequency.setValueAtTime(260, t);
      this.wallFilter.Q.setValueAtTime(4.5, t);

      this.wallResonanceOsc1 = this.ctx.createOscillator();
      this.wallResonanceOsc1.type = 'sawtooth';
      this.wallResonanceOsc1.frequency.setValueAtTime(84, t);

      this.wallResonanceOsc2 = this.ctx.createOscillator();
      this.wallResonanceOsc2.type = 'sine';
      this.wallResonanceOsc2.frequency.setValueAtTime(127, t);

      this.wallResonanceOsc1.connect(this.wallFilter);
      this.wallResonanceOsc2.connect(this.wallFilter);
      this.wallFilter.connect(this.wallResonanceGain);
      this.wallResonanceGain.connect(this.masterGain);

      this.wallResonanceOsc1.start(t);
      this.wallResonanceOsc2.start(t);
    }

    // Duck the city rumble when approaching wall
    if (this.cityRumbleGain) {
      this.cityRumbleGain.gain.setTargetAtTime(0.06, t, 0.5);
    }

    const targetGain = Math.min(0.55, intensity * 0.6);
    this.wallResonanceGain.gain.setTargetAtTime(targetGain, t, 0.4);

    // Eerie frequency shift
    if (this.wallFilter) {
      this.wallFilter.frequency.setTargetAtTime(180 + intensity * 240, t, 0.3);
    }
  }

  // Military Radio Subtitle chirp/squelch
  public playRadioSquelch(isEnd: boolean = false) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Tactical radio tone burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isEnd ? 680 : 1240, t);
    osc.frequency.setValueAtTime(isEnd ? 420 : 1680, t + 0.03);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);

    // Subtle radio white noise hiss
    const hissBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.12), this.ctx.sampleRate);
    const hdata = hissBuf.getChannelData(0);
    for (let i = 0; i < hdata.length; i++) hdata[i] = (Math.random() * 2 - 1) * 0.05;
    const hSrc = this.ctx.createBufferSource();
    hSrc.buffer = hissBuf;
    const hFilter = this.ctx.createBiquadFilter();
    hFilter.type = 'bandpass';
    hFilter.frequency.setValueAtTime(2200, t);
    const hGain = this.ctx.createGain();
    hGain.gain.setValueAtTime(0.08, t);
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    hSrc.connect(hFilter);
    hFilter.connect(hGain);
    hGain.connect(this.masterGain);
    hSrc.start(t);
  }

  // Scene 3 & 4: Reality Glitch / Noclip Dimensional Fracture Audio
  public playGlitchBreakdown() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Cut city & wall resonance instantly with digital tear
    if (this.cityWindGain) this.cityWindGain.gain.setTargetAtTime(0.001, t, 0.05);
    if (this.cityRumbleGain) this.cityRumbleGain.gain.setTargetAtTime(0.001, t, 0.05);
    if (this.wallResonanceGain) this.wallResonanceGain.gain.setTargetAtTime(0.001, t, 0.05);

    // Harsh glitch buffer distortion
    const glitchLen = Math.floor(this.ctx.sampleRate * 0.85);
    const glitchBuf = this.ctx.createBuffer(1, glitchLen, this.ctx.sampleRate);
    const gdata = glitchBuf.getChannelData(0);
    let sample = 0;
    for (let i = 0; i < glitchLen; i++) {
      if (i % 64 === 0) sample = Math.random() * 2 - 1;
      // Stuttering packet loss artifact
      const ringMod = Math.sin((i / 44100) * 880 * Math.PI * 2);
      gdata[i] = (sample * 0.6 + ringMod * 0.3) * (1 - i / glitchLen);
    }

    const gSource = this.ctx.createBufferSource();
    gSource.buffer = glitchBuf;

    const gFilter = this.ctx.createBiquadFilter();
    gFilter.type = 'lowpass';
    gFilter.frequency.setValueAtTime(3800, t);
    gFilter.frequency.exponentialRampToValueAtTime(140, t + 0.8);

    const gGain = this.ctx.createGain();
    gGain.gain.setValueAtTime(0.48, t);
    gGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    gSource.connect(gFilter);
    gFilter.connect(gGain);
    gGain.connect(this.masterGain);
    gSource.start(t);

    // Sub-bass dimensional drop thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, t);
    subOsc.frequency.exponentialRampToValueAtTime(26, t + 0.6);

    subGain.gain.setValueAtTime(0.65, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.75);
  }

  // Scene 5: Backrooms Fluorescent Hum (Iconic 60Hz Electrical Hum)
  public startBackroomsHum() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Stop city loops completely
    try {
      this.cityWindSource?.stop();
      this.cityRumbleOsc?.stop();
      this.wallResonanceOsc1?.stop();
      this.wallResonanceOsc2?.stop();
    } catch (e) {}

    // Master fluorescent buzzing nodes
    this.fluorescentGain = this.ctx.createGain();
    this.fluorescentGain.gain.setValueAtTime(0.001, t);
    this.fluorescentGain.gain.exponentialRampToValueAtTime(0.42, t + 2.0);

    // 60 Hz base sawtooth
    this.fluorescentOsc1 = this.ctx.createOscillator();
    this.fluorescentOsc1.type = 'sawtooth';
    this.fluorescentOsc1.frequency.setValueAtTime(60, t);

    // 120 Hz 2nd harmonic
    this.fluorescentOsc2 = this.ctx.createOscillator();
    this.fluorescentOsc2.type = 'sawtooth';
    this.fluorescentOsc2.frequency.setValueAtTime(120, t);

    // 180 Hz 3rd harmonic
    this.fluorescentOsc3 = this.ctx.createOscillator();
    this.fluorescentOsc3.type = 'sine';
    this.fluorescentOsc3.frequency.setValueAtTime(180, t);

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(620, t);

    this.fluorescentOsc1.connect(humFilter);
    this.fluorescentOsc2.connect(humFilter);
    this.fluorescentOsc3.connect(humFilter);
    humFilter.connect(this.fluorescentGain);
    this.fluorescentGain.connect(this.masterGain);

    this.fluorescentOsc1.start(t);
    this.fluorescentOsc2.start(t);
    this.fluorescentOsc3.start(t);

    // Random electrical fluorescent micro-pop
    this.scheduleFluorescentFlicker();
  }

  private scheduleFluorescentFlicker() {
    if (!this.ctx || !this.fluorescentGain) return;
    const delay = 3 + Math.random() * 5;
    setTimeout(() => {
      if (!this.ctx || !this.fluorescentGain) return;
      const t = this.ctx.currentTime;
      // Quick dip & recovery
      this.fluorescentGain.gain.setValueAtTime(0.15, t);
      this.fluorescentGain.gain.exponentialRampToValueAtTime(0.42, t + 0.12);
      this.scheduleFluorescentFlicker();
    }, delay * 1000);
  }

  // Scene 6: Realistic Shotgun Chamber Check & Heavy Slide Rack (Pump action)
  public playShotgunRack() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // 1. Metal slide pull-back click
    const pullOsc = this.ctx.createOscillator();
    const pullGain = this.ctx.createGain();
    const pullFilter = this.ctx.createBiquadFilter();

    pullOsc.type = 'triangle';
    pullOsc.frequency.setValueAtTime(450, t);
    pullOsc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    pullFilter.type = 'bandpass';
    pullFilter.frequency.setValueAtTime(1600, t);
    pullFilter.Q.setValueAtTime(3.5, t);

    pullGain.gain.setValueAtTime(0.35, t);
    pullGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    pullOsc.connect(pullFilter);
    pullFilter.connect(pullGain);
    pullGain.connect(this.masterGain);

    pullOsc.start(t);
    pullOsc.stop(t + 0.15);

    // 2. Heavy forward rack & lock chamber slam (at +0.18s)
    setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      const t2 = this.ctx.currentTime;

      // Heavy metallic slam
      const slamOsc = this.ctx.createOscillator();
      const slamGain = this.ctx.createGain();
      slamOsc.type = 'sawtooth';
      slamOsc.frequency.setValueAtTime(190, t2);
      slamOsc.frequency.exponentialRampToValueAtTime(55, t2 + 0.15);

      slamGain.gain.setValueAtTime(0.55, t2);
      slamGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.22);

      slamOsc.connect(slamGain);
      slamGain.connect(this.masterGain);
      slamOsc.start(t2);
      slamOsc.stop(t2 + 0.25);

      // Brass mechanical latch click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1850, t2);
      clickOsc.frequency.exponentialRampToValueAtTime(900, t2 + 0.08);

      clickGain.gain.setValueAtTime(0.42, t2);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(t2);
      clickOsc.stop(t2 + 0.1);
    }, 180);
  }

  // Clean fade-out and stop all audio nodes on transition or skip
  public stopAll(fadeTimeMs: number = 200) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const fadeSec = fadeTimeMs / 1000;

    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, t + fadeSec);
    } catch (e) {}

    setTimeout(() => {
      try {
        this.cityWindSource?.stop();
        this.cityRumbleOsc?.stop();
        this.wallResonanceOsc1?.stop();
        this.wallResonanceOsc2?.stop();
        this.fluorescentOsc1?.stop();
        this.fluorescentOsc2?.stop();
        this.fluorescentOsc3?.stop();
      } catch (e) {}
    }, fadeTimeMs + 50);
  }
}

export const cinematicAudio = new CinematicAudioEngine();
