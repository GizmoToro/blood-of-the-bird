import { GameSettings } from '../types';

export type MusicState = 'ambient' | 'tension' | 'chase' | 'boss' | 'boss_enraged';

// Warm soft analog tape saturation curve
function createTapeSaturationCurve(): Float32Array {
  const n = 512;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    // Sigmoidal soft saturation with smooth analog compression curve
    curve[i] = Math.tanh(x * 1.35) * 0.95;
  }
  return curve;
}

export interface LevelAudioProfile {
  id: number;
  name: string;
  theme: string;
  surface: string;
  reverbDuration: number;
  reverbDecay: number;
  reverbWet: number;
  droneFreqs: [number, number, number];
  filterFreq: number;
  ambientType: string;
  musicScale: number[];
}

export const LEVEL_AUDIO_PROFILES: Record<number, LevelAudioProfile> = {
  1: {
    id: 1,
    name: 'THE YELLOW ROOMS',
    theme: 'yellow',
    surface: 'damp_carpet',
    reverbDuration: 1.4,
    reverbDecay: 3.2,
    reverbWet: 0.22,
    droneFreqs: [36.0, 51.5, 73.4],
    filterFreq: 3800,
    ambientType: 'fluorescent_ac',
    musicScale: [523.25, 493.88, 415.30, 440.00, 392.00],
  },
  2: {
    id: 2,
    name: 'THE ROTTING CORRIDORS',
    theme: 'rotting',
    surface: 'rotting_wood',
    reverbDuration: 1.8,
    reverbDecay: 2.8,
    reverbWet: 0.28,
    droneFreqs: [43.6, 61.7, 87.3],
    filterFreq: 2600,
    ambientType: 'water_drip',
    musicScale: [440.00, 415.30, 370.00, 311.13],
  },
  3: {
    id: 3,
    name: 'THE RED ZONE',
    theme: 'red',
    surface: 'hazard_concrete',
    reverbDuration: 2.2,
    reverbDecay: 2.5,
    reverbWet: 0.32,
    droneFreqs: [55.0, 77.8, 110.0],
    filterFreq: 4200,
    ambientType: 'warning_siren',
    musicScale: [587.33, 554.37, 440.00, 415.30],
  },
  4: {
    id: 4,
    name: 'THE FLOODED VAULT',
    theme: 'flooded',
    surface: 'flooded_tile',
    reverbDuration: 3.2,
    reverbDecay: 1.8,
    reverbWet: 0.42,
    droneFreqs: [38.9, 58.3, 77.8],
    filterFreq: 1900,
    ambientType: 'cavernous_drips',
    musicScale: [622.25, 466.16, 415.30, 311.13],
  },
  5: {
    id: 5,
    name: 'THE ABANDONED OFFICE',
    theme: 'office',
    surface: 'office_carpet',
    reverbDuration: 0.7,
    reverbDecay: 4.8,
    reverbWet: 0.14,
    droneFreqs: [44.0, 66.0, 132.0],
    filterFreq: 4800,
    ambientType: 'crt_flyback_hvac',
    musicScale: [523.25, 440.00, 392.00, 330.00],
  },
  6: {
    id: 6,
    name: 'THE LIGHTS OUT VOID',
    theme: 'void',
    surface: 'void_stone',
    reverbDuration: 4.2,
    reverbDecay: 1.4,
    reverbWet: 0.45,
    droneFreqs: [24.5, 36.7, 49.0],
    filterFreq: 1400,
    ambientType: 'abyssal_wind',
    musicScale: [392.00, 370.00, 293.66, 277.18],
  },
  7: {
    id: 7,
    name: 'THE INDUSTRIAL PIPES',
    theme: 'industrial',
    surface: 'metal_grate',
    reverbDuration: 2.6,
    reverbDecay: 2.2,
    reverbWet: 0.35,
    droneFreqs: [51.9, 77.8, 103.8],
    filterFreq: 5200,
    ambientType: 'steam_hiss',
    musicScale: [659.25, 622.25, 493.88, 415.30],
  },
  8: {
    id: 8,
    name: 'THE CAVE OF CRAWLERS',
    theme: 'organic',
    surface: 'fleshy_nest',
    reverbDuration: 1.6,
    reverbDecay: 3.5,
    reverbWet: 0.25,
    droneFreqs: [32.7, 46.2, 65.4],
    filterFreq: 2200,
    ambientType: 'chitinous_skitter',
    musicScale: [349.23, 311.13, 261.63, 233.08],
  },
  9: {
    id: 9,
    name: 'BÚNKER DE CONTENCIÓN',
    theme: 'bunker',
    surface: 'steel_plate',
    reverbDuration: 2.4,
    reverbDecay: 2.4,
    reverbWet: 0.30,
    droneFreqs: [48.0, 72.0, 96.0],
    filterFreq: 3400,
    ambientType: 'hydraulic_hum',
    musicScale: [440.00, 392.00, 349.23, 293.66],
  },
  10: {
    id: 10,
    name: 'LABERINTO METÁLICO',
    theme: 'metal',
    surface: 'sheet_metal',
    reverbDuration: 2.9,
    reverbDecay: 2.0,
    reverbWet: 0.36,
    droneFreqs: [65.4, 92.5, 130.8],
    filterFreq: 5400,
    ambientType: 'metal_groan',
    musicScale: [523.25, 466.16, 392.00, 349.23],
  },
  11: {
    id: 11,
    name: 'ZONA DE ARCHIVO',
    theme: 'archive',
    surface: 'creaky_wood',
    reverbDuration: 1.2,
    reverbDecay: 3.8,
    reverbWet: 0.20,
    droneFreqs: [37.0, 55.5, 74.0],
    filterFreq: 3100,
    ambientType: 'paper_draft',
    musicScale: [587.33, 523.25, 440.00, 349.23],
  },
  12: {
    id: 12,
    name: 'TÚNELES DE CALDERAS',
    theme: 'boiler',
    surface: 'scorched_brick',
    reverbDuration: 1.9,
    reverbDecay: 2.6,
    reverbWet: 0.28,
    droneFreqs: [58.3, 87.3, 116.5],
    filterFreq: 2800,
    ambientType: 'boiler_rumble',
    musicScale: [466.16, 440.00, 370.00, 293.66],
  },
  13: {
    id: 13,
    name: 'EL HOSPITAL ABANDONADO',
    theme: 'hospital',
    surface: 'linoleum_squeak',
    reverbDuration: 2.5,
    reverbDecay: 2.2,
    reverbWet: 0.32,
    droneFreqs: [41.2, 65.4, 82.4],
    filterFreq: 4400,
    ambientType: 'ekg_sterile',
    musicScale: [659.25, 523.25, 493.88, 392.00],
  },
  14: {
    id: 14,
    name: 'EL DÉDALO DE CRISTAL',
    theme: 'crystal',
    surface: 'glass_floor',
    reverbDuration: 3.4,
    reverbDecay: 1.6,
    reverbWet: 0.38,
    droneFreqs: [60.0, 90.0, 150.0],
    filterFreq: 6200,
    ambientType: 'singing_glass',
    musicScale: [783.99, 698.46, 587.33, 523.25],
  },
  15: {
    id: 15,
    name: 'CÁMARA CRIOGÉNICA',
    theme: 'cryo',
    surface: 'frosty_steel',
    reverbDuration: 2.8,
    reverbDecay: 2.1,
    reverbWet: 0.34,
    droneFreqs: [30.9, 46.2, 92.5],
    filterFreq: 2400,
    ambientType: 'subzero_blizzard',
    musicScale: [493.88, 440.00, 370.00, 311.13],
  },
  16: {
    id: 16,
    name: 'EL ABISMO RADIACTIVO',
    theme: 'radioactive',
    surface: 'wet_concrete',
    reverbDuration: 3.2,
    reverbDecay: 1.9,
    reverbWet: 0.40,
    droneFreqs: [46.2, 69.3, 92.5],
    filterFreq: 3600,
    ambientType: 'geiger_plasma',
    musicScale: [554.37, 493.88, 415.30, 370.00],
  },
  17: {
    id: 17,
    name: 'LA CATEDRAL NEGRA',
    theme: 'cathedral',
    surface: 'stone_flagstones',
    reverbDuration: 4.8,
    reverbDecay: 1.1,
    reverbWet: 0.48,
    droneFreqs: [22.0, 33.0, 66.0],
    filterFreq: 2900,
    ambientType: 'gothic_choir',
    musicScale: [440.00, 349.23, 329.63, 293.66, 261.63],
  },
  18: {
    id: 18,
    name: 'EL COLAPSO FINAL: GALLARDO',
    theme: 'arena',
    surface: 'shattered_rock',
    reverbDuration: 4.2,
    reverbDecay: 1.3,
    reverbWet: 0.44,
    droneFreqs: [27.5, 41.2, 82.4],
    filterFreq: 4600,
    ambientType: 'apocalyptic_thunder',
    musicScale: [440.00, 415.30, 349.23, 277.18],
  },
};

// Procedural Algorithmic Impulse Response Generator for Room Acoustics
function createProceduralImpulseResponse(ctx: AudioContext, duration: number, decay: number, wetGain: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(128, Math.floor(sampleRate * Math.max(0.2, duration)));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  // Early reflections taps
  const earlyReflections = [
    { time: 0.012, amp: 0.75 },
    { time: 0.024, amp: 0.55 },
    { time: 0.038, amp: 0.40 },
    { time: 0.058, amp: 0.28 },
  ];

  for (let i = 0; i < length; i++) {
    const t = i / length;
    const env = Math.exp(-decay * t);
    let sampleL = (Math.random() * 2 - 1) * env;
    let sampleR = (Math.random() * 2 - 1) * env;

    for (const er of earlyReflections) {
      const erIdx = Math.floor(er.time * sampleRate);
      if (Math.abs(i - erIdx) < 4) {
        sampleL += (Math.random() * 2 - 1) * er.amp;
        sampleR += (Math.random() * 2 - 1) * er.amp;
      }
    }

    left[i] = sampleL * wetGain;
    right[i] = sampleR * wetGain;
  }
  return impulse;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private ambientGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // --- Footstep Alternator & Interaction States ---
  private footstepAlternator: boolean = false;
  private lastWallBrushTime: number = 0;

  // --- Acoustic Space & Reverb Engine ---
  private reverbConvolver: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private reverbSendGain: GainNode | null = null;
  private currentLevelId: number = 1;

  // --- Dynamic Level-Specific Ambience Nodes ---
  private levelAmbientGain: GainNode | null = null;
  private levelAmbientOsc1: OscillatorNode | null = null;
  private levelAmbientOsc2: OscillatorNode | null = null;
  private levelAmbientSource: AudioBufferSourceNode | null = null;
  private levelAmbientInterval: number | null = null;

  // --- Analog Horror Audio Pipeline ---
  private musicMasterLowpass: BiquadFilterNode | null = null;
  private tapeSaturator: WaveShaperNode | null = null;
  private tapeFlutterLfo: OscillatorNode | null = null;
  private tapeFlutterGain: GainNode | null = null;

  // Dynamic 4-Layer Architecture
  private layer1Gain: GainNode | null = null; // Capa 1: Ambiente (Sub-drone + VHS hiss + 60Hz hum)
  private layer2Gain: GainNode | null = null; // Capa 2: Tensión (Sub-basses adicionales + interferencias + wow)
  private layer3Gain: GainNode | null = null; // Capa 3: Inquietud (Pulsos graves + distorsión + radio wobble)
  private layer4Gain: GainNode | null = null; // Capa 4: Terror / Gallardo (Drone profundo + notas deformadas + impactos lejanos)

  // Analog Texture Generators
  private vhsHissGain: GainNode | null = null;
  private vhsNoiseSource: AudioBufferSourceNode | null = null;
  private electricHumGain: GainNode | null = null;
  private electricHumOsc1: OscillatorNode | null = null;
  private electricHumOsc2: OscillatorNode | null = null;
  private crtFlybackGain: GainNode | null = null;
  private musicBoxGain: GainNode | null = null;

  // Layer Oscillators
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private terrorDroneOsc: OscillatorNode | null = null;
  private terrorSawOsc: OscillatorNode | null = null;

  // State Management
  private currentMusicState: MusicState = 'ambient';
  private explorationTimer: number = 0;
  private nextMusicBoxTimer: number = 42;
  private nextGlitchTimer: number = 18;
  private isPaused: boolean = false;
  private isIntroActive: boolean = false;
  private isVictoryMode: boolean = false;
  private isGameOverMode: boolean = false;
  private introTimeouts: number[] = [];
  private chaseHeartbeatInterval: number | null = null;
  private ambientEventTimeout: number | null = null;

  // Atmospheric Silence Cycle (Terror through absence of music)
  private silenceCycleTimer: number = 32;
  private isSilenceActive: boolean = false;
  private silenceDurationTimer: number = 0;

  // Level 18 / Gallardo Hell Sequence State
  private isGallardoHellSequenceActive: boolean = false;
  private gallardoHellTimeouts: number[] = [];

  // Custom AI Generated Lyria Track
  private customMusicSource: AudioBufferSourceNode | null = null;
  private customMusicGain: GainNode | null = null;
  private isCustomTrackActive: boolean = false;

  // Fluorescent hum (Environmental)
  private humGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;

  private initialized = false;
  private currentSettings: GameSettings | null = null;

  public init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Brickwall Limiter to prevent clipping under explosive polyphony
      this.masterLimiter = this.ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(4.0, this.ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(18.0, this.ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.12, this.ctx.currentTime);

      // Master output fader
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.masterGain.connect(this.masterLimiter);
      this.masterLimiter.connect(this.ctx.destination);

      // Sub-buses routed through master bus
      this.ambientGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.ambientGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);

      // Reverb Engine setup
      this.reverbConvolver = this.ctx.createConvolver();
      this.reverbWetGain = this.ctx.createGain();
      this.reverbSendGain = this.ctx.createGain();

      this.reverbSendGain.connect(this.reverbConvolver);
      this.reverbConvolver.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.masterGain);

      // Level-specific ambient sub-bus
      this.levelAmbientGain = this.ctx.createGain();
      this.levelAmbientGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.levelAmbientGain.connect(this.ambientGain);

      // Default balance: SFX prominent, ambient & analog music atmospheric
      this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.startBackroomsAmbience();
      this.buildAnalogHorrorMusicPipeline();
      this.scheduleRandomHorrorEvents();

      // Apply initial Level 1 acoustic profile
      this.setLevel(1);

      this.initialized = true;
    } catch {
      // Audio context might require explicit user click/tap
    }
  }

  public updateVolumes(settings: GameSettings) {
    this.currentSettings = settings;
    if (!this.ctx || !this.ambientGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const master = Math.max(0, Math.min(1, settings.masterVolume));

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    }

    this.ambientGain.gain.setTargetAtTime(settings.ambientVolume * 0.38, now, 0.05);

    // Music: 0-100% and can be toggled on/off in Settings
    const targetMusic = settings.musicEnabled ? settings.musicVolume * 0.44 : 0;
    if (!this.isPaused && !this.isGameOverMode) {
      this.musicGain.gain.setTargetAtTime(targetMusic, now, 0.08);
    }

    this.sfxGain.gain.setTargetAtTime(settings.sfxVolume * 0.88, now, 0.05);

    // Update reverb wet balance with SFX volume
    if (this.reverbWetGain) {
      const profile = LEVEL_AUDIO_PROFILES[this.currentLevelId] || LEVEL_AUDIO_PROFILES[1];
      const targetWet = profile.reverbWet * settings.sfxVolume;
      this.reverbWetGain.gain.setTargetAtTime(targetWet, now, 0.08);
    }
  }

  // --- Analog Horror Master Pipeline ---

  private buildAnalogHorrorMusicPipeline() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // 1. Master Music Tone Shaper (Warm Analog Lowpass Filter with gentle resonance)
    this.musicMasterLowpass = this.ctx.createBiquadFilter();
    this.musicMasterLowpass.type = 'lowpass';
    this.musicMasterLowpass.frequency.setValueAtTime(4600, now);
    this.musicMasterLowpass.Q.setValueAtTime(0.8, now);

    // 2. Warm Tape Saturation Stage
    this.tapeSaturator = this.ctx.createWaveShaper();
    this.tapeSaturator.curve = createTapeSaturationCurve() as unknown as Float32Array<ArrayBuffer>;
    this.tapeSaturator.oversample = '2x';

    // 3. Tape Wow & Flutter LFO (Slow pitch & speed warble of an old VHS playback)
    this.tapeFlutterLfo = this.ctx.createOscillator();
    this.tapeFlutterLfo.type = 'sine';
    this.tapeFlutterLfo.frequency.setValueAtTime(0.32, now); // ~0.3 Hz slow warble

    this.tapeFlutterGain = this.ctx.createGain();
    this.tapeFlutterGain.gain.setValueAtTime(0.85, now); // subtle pitch offset in Hz
    this.tapeFlutterLfo.connect(this.tapeFlutterGain);
    this.tapeFlutterLfo.start();

    // Connect mastering chain: Master Lowpass -> Tape Saturator -> Master Music Gain
    this.musicMasterLowpass.connect(this.tapeSaturator);
    this.tapeSaturator.connect(this.musicGain);

    // 4. Build Layers
    this.setupAnalogTextures();
    this.setupDynamicLayers();
  }

  // --- Analog Textures: Tape Hiss, 60Hz Transformer Hum, CRT Flyback ---

  private setupAnalogTextures() {
    if (!this.ctx || !this.musicMasterLowpass) return;
    const now = this.ctx.currentTime;

    // A. VHS Tape Hiss (Looping textured noise buffer, bandpassed to magnetic oxide range)
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds loop
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    // Pink / magnetic oxide noise generation with slight irregularities
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.14722;
      b2 = 0.57000 * b2 + white * 0.26420;
      let val = (b0 + b1 + b2 + white * 0.05) * 0.18;
      // Gentle micro-dropouts simulating uneven magnetic coating
      if (Math.sin(i * 0.001) > 0.985) val *= 0.65;
      data[i] = val;
    }

    this.vhsNoiseSource = this.ctx.createBufferSource();
    this.vhsNoiseSource.buffer = noiseBuffer;
    this.vhsNoiseSource.loop = true;

    const vhsFilter = this.ctx.createBiquadFilter();
    vhsFilter.type = 'bandpass';
    vhsFilter.frequency.setValueAtTime(2200, now);
    vhsFilter.Q.setValueAtTime(0.7, now);

    this.vhsHissGain = this.ctx.createGain();
    this.vhsHissGain.gain.setValueAtTime(0.09, now); // Subtle continuous hiss

    this.vhsNoiseSource.connect(vhsFilter);
    vhsFilter.connect(this.vhsHissGain);
    this.vhsHissGain.connect(this.musicMasterLowpass);
    this.vhsNoiseSource.start();

    // B. Electrical AC 60Hz Transformer Hum & CRT Flyback Resonance
    this.electricHumGain = this.ctx.createGain();
    this.electricHumGain.gain.setValueAtTime(0.08, now);

    this.electricHumOsc1 = this.ctx.createOscillator();
    this.electricHumOsc1.type = 'sawtooth';
    this.electricHumOsc1.frequency.setValueAtTime(59.94, now); // 59.94Hz NTSC power frequency

    this.electricHumOsc2 = this.ctx.createOscillator();
    this.electricHumOsc2.type = 'triangle';
    this.electricHumOsc2.frequency.setValueAtTime(119.88, now); // Harmonic

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(260, now);

    this.electricHumOsc1.connect(humFilter);
    this.electricHumOsc2.connect(humFilter);
    humFilter.connect(this.electricHumGain);
    this.electricHumGain.connect(this.musicMasterLowpass);

    this.electricHumOsc1.start();
    this.electricHumOsc2.start();

    // CRT Flyback resonance (extremely subtle high frequency tone common in CRT TV broadcasts)
    const crtOsc = this.ctx.createOscillator();
    crtOsc.type = 'sine';
    crtOsc.frequency.setValueAtTime(11250, now); // Psychoacoustic CRT presence, safe from harshness
    this.crtFlybackGain = this.ctx.createGain();
    this.crtFlybackGain.gain.setValueAtTime(0.0035, now); // Very quiet presence
    crtOsc.connect(this.crtFlybackGain);
    this.crtFlybackGain.connect(this.musicMasterLowpass);
    crtOsc.start();

    // C. Antique Music Box Sub-Bus
    this.musicBoxGain = this.ctx.createGain();
    this.musicBoxGain.gain.setValueAtTime(0.38, now);
    this.musicBoxGain.connect(this.musicMasterLowpass);
  }

  // --- Dynamic 4-Layer System ---

  private setupDynamicLayers() {
    if (!this.ctx || !this.musicMasterLowpass) return;
    const now = this.ctx.currentTime;

    // CAPA 1 — AMBIENTE (Exploration base: Sub-bass visceral drone + subtle discord)
    this.layer1Gain = this.ctx.createGain();
    this.layer1Gain.gain.setValueAtTime(0.55, now);
    this.layer1Gain.connect(this.musicMasterLowpass);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(36, now); // 36Hz chest resonance

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(51.5, now); // Minor second tension interval

    this.droneOsc3 = this.ctx.createOscillator();
    this.droneOsc3.type = 'sine';
    this.droneOsc3.frequency.setValueAtTime(73.4, now); // Low atmospheric fifth

    // Connect tape wow modulation to drone frequencies for analog drift
    if (this.tapeFlutterGain) {
      this.tapeFlutterGain.connect(this.droneOsc2.frequency);
    }

    const layer1Filter = this.ctx.createBiquadFilter();
    layer1Filter.type = 'lowpass';
    layer1Filter.frequency.setValueAtTime(160, now);

    this.droneOsc1.connect(layer1Filter);
    this.droneOsc2.connect(layer1Filter);
    this.droneOsc3.connect(layer1Filter);
    layer1Filter.connect(this.layer1Gain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.droneOsc3.start();

    // CAPA 2 — TENSIÓN (Prolonged exploration: Tritone clusters + dark air pulse + wandering tones)
    this.layer2Gain = this.ctx.createGain();
    this.layer2Gain.gain.setValueAtTime(0.0, now); // Starts muted, rises with exploration
    this.layer2Gain.connect(this.musicMasterLowpass);

    const tensionFreqs = [87.3, 123.5, 164.8]; // F#2, B2, E3 cluster
    tensionFreqs.forEach((f) => {
      if (!this.ctx || !this.layer2Gain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(f * 1.6, now);
      filt.Q.setValueAtTime(4.5, now);

      // Slow 6-second breathing LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.16, now);
      lfoGain.gain.setValueAtTime(0.035, now);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.055, now);

      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(filt);
      filt.connect(g);
      g.connect(this.layer2Gain);

      osc.start();
      lfo.start();
    });

    // CAPA 3 — INQUIETUD (Nearby enemies: Low rhythmic dread pulse + radio static bursts)
    this.layer3Gain = this.ctx.createGain();
    this.layer3Gain.gain.setValueAtTime(0.0, now);
    this.layer3Gain.connect(this.musicMasterLowpass);

    const screechOsc = this.ctx.createOscillator();
    screechOsc.type = 'sawtooth';
    screechOsc.frequency.setValueAtTime(392, now); // Distant metallic hollow pitch
    const screechFilter = this.ctx.createBiquadFilter();
    screechFilter.type = 'bandpass';
    screechFilter.frequency.setValueAtTime(620, now);
    screechFilter.Q.setValueAtTime(3.8, now);
    const screechGain = this.ctx.createGain();
    screechGain.gain.setValueAtTime(0.04, now);

    screechOsc.connect(screechFilter);
    screechFilter.connect(screechGain);
    screechGain.connect(this.layer3Gain);
    screechOsc.start();

    // CAPA 4 — TERROR (Gallardo Boss / Enraged Terror: Sub-earth rumble + distorted sawtooths)
    this.layer4Gain = this.ctx.createGain();
    this.layer4Gain.gain.setValueAtTime(0.0, now);
    this.layer4Gain.connect(this.musicMasterLowpass);

    this.terrorDroneOsc = this.ctx.createOscillator();
    this.terrorDroneOsc.type = 'sine';
    this.terrorDroneOsc.frequency.setValueAtTime(27.5, now); // Sub-bass 27.5Hz (A0)

    this.terrorSawOsc = this.ctx.createOscillator();
    this.terrorSawOsc.type = 'sawtooth';
    this.terrorSawOsc.frequency.setValueAtTime(41.2, now); // Low E1 dissonant growl

    const terrorFilter = this.ctx.createBiquadFilter();
    terrorFilter.type = 'lowpass';
    terrorFilter.frequency.setValueAtTime(110, now);

    this.terrorDroneOsc.connect(terrorFilter);
    this.terrorSawOsc.connect(terrorFilter);
    terrorFilter.connect(this.layer4Gain);

    this.terrorDroneOsc.start();
    this.terrorSawOsc.start();
  }

  // --- Antique Detuned Music Box Synthesis ---

  /**
   * Synthesizes an antique metal comb tooth with microtonal detune,
   * metallic overtones (2.76x, 5.4x) and mechanical pin release click.
   */
  public playMusicBoxNote(freq: number, delaySec: number = 0, duration: number = 1.6, detuneCents: number = -18, velocity: number = 0.24) {
    if (!this.ctx || !this.musicBoxGain || !this.currentSettings?.musicEnabled) return;
    const t = this.ctx.currentTime + delaySec;

    // 1. Fundamental tine vibration
    const oscFund = this.ctx.createOscillator();
    const gainFund = this.ctx.createGain();
    oscFund.type = 'sine';
    oscFund.frequency.setValueAtTime(freq, t);
    oscFund.detune.setValueAtTime(detuneCents, t);

    // Fast percussive pluck attack + natural metallic exponential decay
    gainFund.gain.setValueAtTime(0.001, t);
    gainFund.gain.linearRampToValueAtTime(velocity, t + 0.006);
    gainFund.gain.exponentialRampToValueAtTime(0.0008, t + duration);

    // 2. Inharmonic metal comb overtone 1 (~2.76x fundamental)
    const oscOver1 = this.ctx.createOscillator();
    const gainOver1 = this.ctx.createGain();
    oscOver1.type = 'sine';
    oscOver1.frequency.setValueAtTime(freq * 2.756, t);
    oscOver1.detune.setValueAtTime(detuneCents + 12, t);

    gainOver1.gain.setValueAtTime(0.001, t);
    gainOver1.gain.linearRampToValueAtTime(velocity * 0.42, t + 0.004);
    gainOver1.gain.exponentialRampToValueAtTime(0.0005, t + duration * 0.45);

    // 3. Inharmonic metal comb overtone 2 (~5.4x fundamental)
    const oscOver2 = this.ctx.createOscillator();
    const gainOver2 = this.ctx.createGain();
    oscOver2.type = 'triangle';
    oscOver2.frequency.setValueAtTime(freq * 5.404, t);

    gainOver2.gain.setValueAtTime(0.001, t);
    gainOver2.gain.linearRampToValueAtTime(velocity * 0.18, t + 0.003);
    gainOver2.gain.exponentialRampToValueAtTime(0.0005, t + duration * 0.2);

    // 4. Mechanical release click
    const clickBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.008), this.ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickData.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickData.length * 0.25));
    }
    const clickSource = this.ctx.createBufferSource();
    clickSource.buffer = clickBuffer;
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(velocity * 0.14, t);

    clickSource.connect(clickGain);
    clickGain.connect(this.musicBoxGain);
    clickSource.start(t);

    // Connect oscillators
    oscFund.connect(gainFund);
    gainFund.connect(this.musicBoxGain);

    oscOver1.connect(gainOver1);
    gainOver1.connect(this.musicBoxGain);

    oscOver2.connect(gainOver2);
    gainOver2.connect(this.musicBoxGain);

    oscFund.start(t);
    oscFund.stop(t + duration + 0.1);
    oscOver1.start(t);
    oscOver1.stop(t + duration * 0.5);
    oscOver2.start(t);
    oscOver2.stop(t + duration * 0.3);
  }

  /**
   * Plays generative eerie melodic phrases using the active level's unique musical scale.
   * Generates sparse, slow, haunting notes with analog microtonality, mechanical tine clicks,
   * and acoustic decay tailored to the level's horror mood.
   */
  public playLevelMusicPhrase(isWarped: boolean = false) {
    if (!this.ctx || !this.musicBoxGain || !this.currentSettings?.musicEnabled) return;
    const profile = LEVEL_AUDIO_PROFILES[this.currentLevelId] || LEVEL_AUDIO_PROFILES[1];
    const scale = profile.musicScale && profile.musicScale.length > 0
      ? profile.musicScale
      : [523.25, 493.88, 415.30, 440.00, 392.00];

    const baseFreqs = isWarped
      ? scale.map((f) => f * 0.5) // Drop an octave for deep psychological dread
      : scale;

    const noteCount = isWarped ? 2 : 2 + Math.floor(Math.random() * 3);
    let offset = 0;

    for (let i = 0; i < noteCount; i++) {
      const note = baseFreqs[Math.floor(Math.random() * baseFreqs.length)];
      const detune = -26 + Math.random() * 52; // Analog pitch drift
      const duration = isWarped ? 2.6 : 1.7 + Math.random() * 0.7;
      const velocity = isWarped ? 0.32 : 0.22;

      this.playMusicBoxNote(note, offset, duration, detune, velocity);

      // Long erratic intervals between notes
      if (i === 1 && Math.random() > 0.4) {
        offset += isWarped ? 2.7 : 2.0; // Pregnant pause
      } else {
        offset += isWarped ? 1.6 : 1.1 + Math.random() * 0.9;
      }
    }
  }

  /**
   * Backward-compatible alias for existing calls
   */
  public playBrokenMusicBoxPhrase(isWarped: boolean = false) {
    this.playLevelMusicPhrase(isWarped);
  }

  // --- Radio Glitches & Analog Artifacts ---

  public triggerRadioInterference(intensity: number = 0.5) {
    if (!this.ctx || !this.musicMasterLowpass) return;
    const now = this.ctx.currentTime;
    const duration = 0.2 + Math.random() * 0.25;

    // Burst of modulated bandpass filtered noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.08);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + Math.random() * 1200, now);
    filter.Q.setValueAtTime(5.0, now);

    const gain = this.ctx.createGain();
    const maxGain = 0.08 * intensity;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(maxGain, now + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterLowpass);
    noise.start(now);
  }

  public triggerTapeClick() {
    if (!this.ctx || !this.musicMasterLowpass) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 + Math.random() * 800, now);
    g.gain.setValueAtTime(0.035, now);
    g.gain.exponentialRampToValueAtTime(0.0005, now + 0.012);
    osc.connect(g);
    g.connect(this.musicMasterLowpass);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  // --- Intro Sequence (Inquietante y atmosférica) ---

  public startIntroSequence() {
    if (!this.ctx || !this.musicGain) return;
    this.clearIntroTimeouts();
    this.isIntroActive = true;
    const now = this.ctx.currentTime;

    // Start in near silence
    this.musicGain.gain.setValueAtTime(0.001, now);
    if (this.layer1Gain) this.layer1Gain.gain.setValueAtTime(0.0, now);
    if (this.vhsHissGain) this.vhsHissGain.gain.setValueAtTime(0.001, now);
    if (this.electricHumGain) this.electricHumGain.gain.setValueAtTime(0.001, now);

    // 1. 0.8s: Leve hiss de cinta VHS aparece
    this.scheduleIntroStep(800, () => {
      if (!this.ctx || !this.vhsHissGain) return;
      this.vhsHissGain.gain.setTargetAtTime(0.09, this.ctx.currentTime, 0.8);
      const targetVol = this.currentSettings?.musicEnabled ? this.currentSettings.musicVolume * 0.42 : 0.35;
      this.musicGain?.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 1.2);
    });

    // 2. 2.4s: Zumbido eléctrico muy bajo
    this.scheduleIntroStep(2400, () => {
      if (!this.ctx || !this.electricHumGain) return;
      this.electricHumGain.gain.setTargetAtTime(0.07, this.ctx.currentTime, 1.0);
    });

    // 3. 3.8s: Una interferencia analógica sutil
    this.scheduleIntroStep(3800, () => {
      this.triggerRadioInterference(0.6);
      this.triggerTapeClick();
    });

    // 4. 4.8s: Drone grave que aparece lentamente
    this.scheduleIntroStep(4800, () => {
      if (!this.ctx || !this.layer1Gain) return;
      this.layer1Gain.gain.setTargetAtTime(0.48, this.ctx.currentTime, 1.8);
    });

    // 5. 7.2s: Pequeña secuencia de caja musical desafinada (notas lentas, incompletas)
    this.scheduleIntroStep(7200, () => {
      this.playBrokenMusicBoxPhrase(false);
    });

    // 6. 10.8s: Silencio breve / suspensión
    this.scheduleIntroStep(10800, () => {
      if (!this.ctx || !this.layer1Gain) return;
      this.layer1Gain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.6); // Deep drop in tone
    });

    // 7. 12.4s: Regreso del drone
    this.scheduleIntroStep(12400, () => {
      if (!this.ctx || !this.layer1Gain) return;
      this.layer1Gain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 1.4);
      this.triggerRadioInterference(0.35);
    });

    // 8. 14.5s: Comenzar suavemente la música ambiental principal
    this.scheduleIntroStep(14500, () => {
      this.isIntroActive = false;
      this.setMusicState('ambient');
    });
  }

  private scheduleIntroStep(delayMs: number, fn: () => void) {
    const tid = window.setTimeout(fn, delayMs);
    this.introTimeouts.push(tid);
  }

  private clearIntroTimeouts() {
    this.introTimeouts.forEach((id) => clearTimeout(id));
    this.introTimeouts = [];
  }

  // --- Dynamic Music Control & Updates ---

  public startMusic(withIntro: boolean = false) {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.musicGain) {
      this.isPaused = false;
      this.isGameOverMode = false;
      this.isVictoryMode = false;

      if (withIntro) {
        this.startIntroSequence();
      } else {
        const now = this.ctx.currentTime;
        const targetVol = this.currentSettings && this.currentSettings.musicEnabled
          ? this.currentSettings.musicVolume * this.currentSettings.masterVolume * 0.44
          : 0.38;
        this.musicGain.gain.setTargetAtTime(targetVol, now, 0.4);
        this.setMusicState('ambient');
      }
    }
  }

  public pauseMusic() {
    if (this.ctx && this.musicGain) {
      this.isPaused = true;
      this.musicGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.25);
    }
    this.stopChaseHeartbeat();
  }

  public resumeMusic() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.musicGain) {
      this.isPaused = false;
      const now = this.ctx.currentTime;
      const targetVol = this.currentSettings && this.currentSettings.musicEnabled
        ? this.currentSettings.musicVolume * this.currentSettings.masterVolume * 0.44
        : 0.38;
      this.musicGain.gain.setTargetAtTime(targetVol, now, 0.7);
      if (this.currentMusicState === 'chase' || this.currentMusicState === 'boss') {
        this.startChaseHeartbeat(580);
      }
    }
  }

  public stopMusic() {
    this.clearIntroTimeouts();
    this.isIntroActive = false;
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }
    this.stopChaseHeartbeat();
  }

  // --- Frame Step Update for Generative Analog Elements ---

  public update(dt: number) {
    if (this.isPaused || !this.initialized || !this.ctx || this.isIntroActive || this.isGameOverMode || this.isVictoryMode || this.isGallardoHellSequenceActive) return;

    // 1. Atmospheric Silence Cycle (Terror through absence of music - psychological tension)
    if (this.currentMusicState === 'ambient' && !this.isCustomTrackActive) {
      if (!this.isSilenceActive) {
        this.silenceCycleTimer -= dt;
        if (this.silenceCycleTimer <= 0) {
          // Enter silence window: drones slowly vanish
          this.isSilenceActive = true;
          this.silenceDurationTimer = 11 + Math.random() * 8;
          const now = this.ctx.currentTime;
          this.layer1Gain?.gain.setTargetAtTime(0.04, now, 1.8);
          this.layer2Gain?.gain.setTargetAtTime(0.0, now, 1.2);
          // Slightly elevate VHS hiss to emphasize the analog dead silence
          this.vhsHissGain?.gain.setTargetAtTime(0.12, now, 1.4);
        }
      } else {
        this.silenceDurationTimer -= dt;
        if (this.silenceDurationTimer <= 0) {
          // Exit silence window: slow creeping drone or a lonely detuned music box note
          this.isSilenceActive = false;
          this.silenceCycleTimer = 34 + Math.random() * 26;
          const now = this.ctx.currentTime;
          this.layer1Gain?.gain.setTargetAtTime(0.55, now, 2.5);
          this.vhsHissGain?.gain.setTargetAtTime(0.08, now, 2.0);
          if (Math.random() > 0.45) {
            this.playMusicBoxNote(220, 0.4, 1.8, -25, 0.18);
          }
        }
      }
    } else if (this.isSilenceActive) {
      this.isSilenceActive = false;
      this.silenceCycleTimer = 30;
    }

    // 2. Exploration timer: When in 'ambient', deepens tension gradually after long quiet corridors
    if (this.currentMusicState === 'ambient') {
      this.explorationTimer += dt;
      if (this.explorationTimer > 28 && this.layer2Gain && !this.isSilenceActive) {
        // Creeping subtle tension (Cap 2) without jumping to full alert
        const now = this.ctx.currentTime;
        this.layer2Gain.gain.setTargetAtTime(0.18, now, 2.0);
      }
    } else {
      this.explorationTimer = 0;
    }

    // 3. Rare, unpredictable broken music box chime
    this.nextMusicBoxTimer -= dt;
    if (this.nextMusicBoxTimer <= 0) {
      this.nextMusicBoxTimer = 45 + Math.random() * 40;
      // Only play during ambient or tension states to preserve atmosphere
      if (this.currentMusicState === 'ambient' || this.currentMusicState === 'tension') {
        this.playBrokenMusicBoxPhrase(false);
      }
    }

    // 4. Occasional analog glitch / tape crackle
    this.nextGlitchTimer -= dt;
    if (this.nextGlitchTimer <= 0) {
      this.nextGlitchTimer = 16 + Math.random() * 22;
      this.triggerTapeClick();
      if (Math.random() > 0.6) {
        this.triggerRadioInterference(0.35);
      }
    }
  }

  // --- 18-Level Identity Management, Reverb & Smooth Musical Transitions ---

  public setLevel(levelId: number) {
    if (!this.initialized) this.init();
    if (!this.ctx) return;

    const clampedId = Math.max(1, Math.min(18, Math.floor(levelId)));
    this.currentLevelId = clampedId;
    const profile = LEVEL_AUDIO_PROFILES[clampedId] || LEVEL_AUDIO_PROFILES[1];
    const now = this.ctx.currentTime;

    // 1. Smoothly glide drone frequencies (1.2s musical cross-slide)
    if (this.droneOsc1 && this.droneOsc2 && this.droneOsc3) {
      this.droneOsc1.frequency.setTargetAtTime(profile.droneFreqs[0], now, 0.45);
      this.droneOsc2.frequency.setTargetAtTime(profile.droneFreqs[1], now, 0.45);
      this.droneOsc3.frequency.setTargetAtTime(profile.droneFreqs[2], now, 0.45);
    }

    // 2. Adjust master tone shaper lowpass to level's acoustic brightness
    if (this.musicMasterLowpass) {
      this.musicMasterLowpass.frequency.setTargetAtTime(profile.filterFreq, now, 0.6);
    }

    // 3. Update procedural reverb convolver
    this.applyReverbProfile(profile);

    // 4. Update level-specific ambient atmospheric layers
    this.startLevelAmbientAtmosphere(profile);
  }

  public getCurrentLevelId(): number {
    return this.currentLevelId;
  }

  public getCurrentSurface(): string {
    const profile = LEVEL_AUDIO_PROFILES[this.currentLevelId] || LEVEL_AUDIO_PROFILES[1];
    return profile.surface;
  }

  private applyReverbProfile(profile: LevelAudioProfile) {
    if (!this.ctx || !this.reverbConvolver || !this.reverbWetGain) return;
    try {
      const impulse = createProceduralImpulseResponse(
        this.ctx,
        profile.reverbDuration,
        profile.reverbDecay,
        profile.reverbWet
      );
      this.reverbConvolver.buffer = impulse;
      const master = this.currentSettings ? Math.max(0, Math.min(1, this.currentSettings.masterVolume)) : 1.0;
      const sfx = this.currentSettings ? Math.max(0, Math.min(1, this.currentSettings.sfxVolume)) : 0.85;
      const targetWet = profile.reverbWet * sfx * master;
      this.reverbWetGain.gain.setTargetAtTime(targetWet, this.ctx.currentTime, 0.3);
    } catch (e) {
      console.warn('Failed to update procedural reverb:', e);
    }
  }

  private startLevelAmbientAtmosphere(profile: LevelAudioProfile) {
    if (!this.ctx || !this.levelAmbientGain) return;
    const now = this.ctx.currentTime;

    // Clear previous loops and oscillators safely
    if (this.levelAmbientInterval) {
      clearInterval(this.levelAmbientInterval);
      this.levelAmbientInterval = null;
    }
    if (this.levelAmbientOsc1) {
      try { this.levelAmbientOsc1.stop(); this.levelAmbientOsc1.disconnect(); } catch (e) {}
      this.levelAmbientOsc1 = null;
    }
    if (this.levelAmbientOsc2) {
      try { this.levelAmbientOsc2.stop(); this.levelAmbientOsc2.disconnect(); } catch (e) {}
      this.levelAmbientOsc2 = null;
    }
    try {
      this.levelAmbientSource?.stop();
    } catch (e) {}

    // Adjust level ambient gain
    this.levelAmbientGain.gain.cancelScheduledValues(now);
    this.levelAmbientGain.gain.setValueAtTime(this.levelAmbientGain.gain.value, now);
    this.levelAmbientGain.gain.linearRampToValueAtTime(0.24, now + 1.2);

    switch (profile.ambientType) {
      case 'fluorescent_ac': {
        // Level 1: Backrooms Classic - 60Hz hum + starter tube flickers + ventilation
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(59.94, now);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(220, now);
        g.gain.setValueAtTime(0.08, now);
        osc.connect(filt);
        filt.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;

        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const snapOsc = this.ctx.createOscillator();
          const snapGain = this.ctx.createGain();
          snapOsc.type = 'square';
          snapOsc.frequency.setValueAtTime(120, t);
          snapGain.gain.setValueAtTime(0.12, t);
          snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          snapOsc.connect(snapGain);
          snapGain.connect(this.levelAmbientGain);
          snapOsc.start(t);
          snapOsc.stop(t + 0.09);
        }, 4500);
        break;
      }

      case 'water_drip': {
        // Level 2: Rotting wood + sporadic damp drops into rotten puddles
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          const dropP = 720 + Math.random() * 380;
          osc.frequency.setValueAtTime(dropP, t);
          osc.frequency.exponentialRampToValueAtTime(dropP * 1.3, t + 0.02);
          osc.frequency.exponentialRampToValueAtTime(dropP * 0.4, t + 0.07);
          g.gain.setValueAtTime(0.16 + Math.random() * 0.1, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(g);
          g.connect(this.levelAmbientGain);
          osc.start(t);
          osc.stop(t + 0.09);
        }, 3200);
        break;
      }

      case 'warning_siren': {
        // Level 3: Distant hazard siren claxon + pulse
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const filt = this.ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(380, t);
          osc.frequency.linearRampToValueAtTime(460, t + 1.2);
          osc.frequency.linearRampToValueAtTime(360, t + 2.4);
          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(420, t);
          filt.Q.setValueAtTime(4.0, t);
          g.gain.setValueAtTime(0.001, t);
          g.gain.linearRampToValueAtTime(0.12, t + 0.6);
          g.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
          osc.connect(filt);
          filt.connect(g);
          g.connect(this.levelAmbientGain);
          osc.start(t);
          osc.stop(t + 2.6);
        }, 7000);
        break;
      }

      case 'cavernous_drips': {
        // Level 4: Rhythmic water drips into deep pool with long reverb tail
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          const dropPitch = 880 + Math.random() * 440;
          osc.frequency.setValueAtTime(dropPitch, t);
          osc.frequency.exponentialRampToValueAtTime(dropPitch * 1.5, t + 0.02);
          osc.frequency.exponentialRampToValueAtTime(dropPitch * 0.4, t + 0.08);

          g.gain.setValueAtTime(0.18 + Math.random() * 0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          osc.connect(g);
          g.connect(this.levelAmbientGain);
          if (this.reverbSendGain) {
            const rSend = this.ctx.createGain();
            rSend.gain.setValueAtTime(0.5, t);
            g.connect(rSend);
            rSend.connect(this.reverbSendGain);
          }
          osc.start(t);
          osc.stop(t + 0.1);
        }, 2200);
        break;
      }

      case 'crt_flyback_hvac': {
        // Level 5: Office CRT flyback whine + HVAC cycling air draft
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(11250, now);
        g.gain.setValueAtTime(0.005, now);
        osc.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;
        break;
      }

      case 'abyssal_wind': {
        // Level 6: Deep void wind howling through pitch-black infinite space
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(42, now);
        g.gain.setValueAtTime(0.15, now);
        osc.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;

        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const dur = 2.4;
          const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const filt = this.ctx.createBiquadFilter();
          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(160, t);
          filt.Q.setValueAtTime(2.0, t);
          const wGain = this.ctx.createGain();
          wGain.gain.setValueAtTime(0.18, t);
          src.connect(filt);
          filt.connect(wGain);
          wGain.connect(this.levelAmbientGain);
          src.start(t);
        }, 5500);
        break;
      }

      case 'steam_hiss': {
        // Level 7: Steam pressure release hisses
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const dur = 0.8 + Math.random() * 0.6;
          const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.5));
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const filt = this.ctx.createBiquadFilter();
          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(2800, t);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.14, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          src.connect(filt);
          filt.connect(g);
          g.connect(this.levelAmbientGain);
          src.start(t);
        }, 6500);
        break;
      }

      case 'chitinous_skitter': {
        // Level 8: Cave of Crawlers organic skitter clicks
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const count = 3 + Math.floor(Math.random() * 5);
          for (let k = 0; k < count; k++) {
            const kt = t + k * 0.05;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400 + Math.random() * 800, kt);
            g.gain.setValueAtTime(0.12, kt);
            g.gain.exponentialRampToValueAtTime(0.001, kt + 0.015);
            osc.connect(g);
            g.connect(this.levelAmbientGain);
            osc.start(kt);
            osc.stop(kt + 0.02);
          }
        }, 3600);
        break;
      }

      case 'hydraulic_hum': {
        // Level 9: Búnker de Contención hydraulic machinery hum
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(48, now);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(140, now);
        g.gain.setValueAtTime(0.18, now);
        osc.connect(filt);
        filt.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;
        break;
      }

      case 'metal_groan': {
        // Level 10: Laberinto Metálico structural steel stress groan
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const filt = this.ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(95, t);
          osc.frequency.linearRampToValueAtTime(140, t + 0.8);
          osc.frequency.linearRampToValueAtTime(80, t + 1.8);
          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(260, t);
          filt.Q.setValueAtTime(5.0, t);
          g.gain.setValueAtTime(0.001, t);
          g.gain.linearRampToValueAtTime(0.14, t + 0.4);
          g.gain.exponentialRampToValueAtTime(0.001, t + 1.9);
          osc.connect(filt);
          filt.connect(g);
          g.connect(this.levelAmbientGain);
          osc.start(t);
          osc.stop(t + 2.0);
        }, 7500);
        break;
      }

      case 'paper_draft': {
        // Level 11: Zona de Archivo - eerie archive wind draft
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const dur = 1.4;
          const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const filt = this.ctx.createBiquadFilter();
          filt.type = 'bandpass';
          filt.frequency.setValueAtTime(900, t);
          filt.Q.setValueAtTime(2.2, t);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.10, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          src.connect(filt);
          filt.connect(g);
          g.connect(this.levelAmbientGain);
          src.start(t);
        }, 5800);
        break;
      }

      case 'boiler_rumble': {
        // Level 12: Túneles de Calderas - low boiler fire combustion
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(52, now);
        g.gain.setValueAtTime(0.16, now);
        osc.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;
        break;
      }

      case 'ekg_sterile': {
        // Level 13: El Hospital Abandonado - distant clinical cardiac beep & sterile hum
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(82, now);
        g.gain.setValueAtTime(0.10, now);
        osc.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;

        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(980, t);
          bGain.gain.setValueAtTime(0.06, t);
          bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          bOsc.connect(bGain);
          bGain.connect(this.levelAmbientGain);
          bOsc.start(t);
          bOsc.stop(t + 0.09);
        }, 4200);
        break;
      }

      case 'singing_glass': {
        // Level 14: Shimmering crystal resonant drone
        const osc = this.ctx.createOscillator();
        const filt = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1320, now);
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(1320, now);
        filt.Q.setValueAtTime(8.0, now);
        g.gain.setValueAtTime(0.06, now);
        osc.connect(filt);
        filt.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;
        break;
      }

      case 'subzero_blizzard': {
        // Level 15: Cámara Criogénica - cryogenic chill hiss
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const dur = 1.6;
          const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const filt = this.ctx.createBiquadFilter();
          filt.type = 'highpass';
          filt.frequency.setValueAtTime(1600, t);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          src.connect(filt);
          filt.connect(g);
          g.connect(this.levelAmbientGain);
          src.start(t);
        }, 4800);
        break;
      }

      case 'geiger_plasma': {
        // Level 16: Radioactive Geiger clicks
        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const count = 1 + Math.floor(Math.random() * 4);
          for (let c = 0; c < count; c++) {
            const ct = t + c * (0.04 + Math.random() * 0.08);
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(3200, ct);
            g.gain.setValueAtTime(0.15, ct);
            g.gain.exponentialRampToValueAtTime(0.001, ct + 0.012);
            osc.connect(g);
            g.connect(this.levelAmbientGain);
            osc.start(ct);
            osc.stop(ct + 0.015);
          }
        }, 1800);
        break;
      }

      case 'gothic_choir': {
        // Level 17: Deep pipe organ drone
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(32.7, now); // C1 pedal
        g.gain.setValueAtTime(0.18, now);
        osc.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;
        break;
      }

      case 'apocalyptic_thunder': {
        // Level 18: El Colapso Final: Gallardo - subterranean seismic rumble
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(27.5, now);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(80, now);
        g.gain.setValueAtTime(0.22, now);
        osc.connect(filt);
        filt.connect(g);
        g.connect(this.levelAmbientGain);
        osc.start(now);
        this.levelAmbientOsc1 = osc;

        this.levelAmbientInterval = window.setInterval(() => {
          if (!this.ctx || !this.levelAmbientGain || this.isPaused) return;
          const t = this.ctx.currentTime;
          const tOsc = this.ctx.createOscillator();
          const tGain = this.ctx.createGain();
          tOsc.type = 'sine';
          tOsc.frequency.setValueAtTime(65, t);
          tOsc.frequency.exponentialRampToValueAtTime(22, t + 1.2);
          tGain.gain.setValueAtTime(0.26, t);
          tGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
          tOsc.connect(tGain);
          tGain.connect(this.levelAmbientGain);
          tOsc.start(t);
          tOsc.stop(t + 1.5);
        }, 8000);
        break;
      }
    }
  }

  // --- Dynamic Sidechain Ducking ---
  public duckMusic(amount: number = 0.5, durationSec: number = 0.8) {
    if (!this.ctx || !this.musicGain || !this.currentSettings?.musicEnabled) return;
    const now = this.ctx.currentTime;
    const master = Math.max(0, Math.min(1, this.currentSettings.masterVolume));
    const currentBase = this.currentSettings.musicVolume * master * 0.44;
    const ducked = currentBase * Math.max(0, 1 - amount);
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(ducked, now + 0.03);
    this.musicGain.gain.setTargetAtTime(currentBase, now + durationSec * 0.35, durationSec * 0.65);
  }

  // --- Threat State Transitions ---

  public setMusicState(state: MusicState) {
    if (this.isIntroActive || this.isVictoryMode || this.isGameOverMode || this.isGallardoHellSequenceActive) return;
    if (this.currentMusicState === state) return;
    this.currentMusicState = state;

    if (state !== 'ambient') {
      this.isSilenceActive = false;
    }

    if (!this.ctx || !this.layer1Gain || !this.layer2Gain || !this.layer3Gain || !this.layer4Gain) return;
    const now = this.ctx.currentTime;
    const fade = 1.4;

    if (state === 'ambient') {
      this.layer1Gain.gain.setTargetAtTime(0.55, now, fade);
      this.layer2Gain.gain.setTargetAtTime(0.0, now, fade);
      this.layer3Gain.gain.setTargetAtTime(0.0, now, fade);
      this.layer4Gain.gain.setTargetAtTime(0.0, now, fade);
      this.stopChaseHeartbeat();
    } else if (state === 'tension') {
      this.layer1Gain.gain.setTargetAtTime(0.60, now, fade);
      this.layer2Gain.gain.setTargetAtTime(0.35, now, fade);
      this.layer3Gain.gain.setTargetAtTime(0.06, now, fade);
      this.layer4Gain.gain.setTargetAtTime(0.0, now, fade);
      this.stopChaseHeartbeat();
      if (Math.random() > 0.5) this.triggerRadioInterference(0.4);
    } else if (state === 'chase') {
      this.layer1Gain.gain.setTargetAtTime(0.68, now, 0.4);
      this.layer2Gain.gain.setTargetAtTime(0.42, now, 0.4);
      this.layer3Gain.gain.setTargetAtTime(0.50, now, 0.4);
      this.layer4Gain.gain.setTargetAtTime(0.18, now, 0.4);
      this.startChaseHeartbeat(560);
    } else if (state === 'boss') {
      this.layer1Gain.gain.setTargetAtTime(0.75, now, 0.3);
      this.layer2Gain.gain.setTargetAtTime(0.48, now, 0.3);
      this.layer3Gain.gain.setTargetAtTime(0.35, now, 0.3);
      this.layer4Gain.gain.setTargetAtTime(0.70, now, 0.3);
      this.startChaseHeartbeat(470);
      // Warped, slowed down music box fragment during boss presence
      this.playBrokenMusicBoxPhrase(true);
    } else if (state === 'boss_enraged') {
      this.layer1Gain.gain.setTargetAtTime(0.85, now, 0.15);
      this.layer2Gain.gain.setTargetAtTime(0.55, now, 0.15);
      this.layer3Gain.gain.setTargetAtTime(0.45, now, 0.15);
      this.layer4Gain.gain.setTargetAtTime(0.92, now, 0.15);
      this.startChaseHeartbeat(350);
    }
  }

  // --- Death & Game Over Transition ---

  public onPlayerDeath() {
    this.isGameOverMode = true;
    this.stopChaseHeartbeat();
    this.clearIntroTimeouts();

    if (!this.ctx || !this.musicGain || !this.musicMasterLowpass) return;
    const now = this.ctx.currentTime;

    // Smoothly duck ambient music down and close filter to make room for jumpscare & death
    this.musicGain.gain.setTargetAtTime(0.03, now, 0.6);
    this.musicMasterLowpass.frequency.setTargetAtTime(95, now, 0.5);

    // Mute violent layers immediately
    if (this.layer3Gain) this.layer3Gain.gain.setValueAtTime(0, now);
    if (this.layer4Gain) this.layer4Gain.gain.setValueAtTime(0, now);
  }

  // --- Victory Sequence Cinematic Stages ---

  public setVictorySequenceStage(stage: 'falling' | 'silence' | 'lights_out' | 'text1' | 'text2' | 'text3') {
    this.isVictoryMode = true;
    this.stopChaseHeartbeat();
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    if (stage === 'falling') {
      // 1. Drone grave profundo + distorsión analógica
      if (this.layer1Gain) this.layer1Gain.gain.setTargetAtTime(0.75, now, 0.4);
      if (this.layer4Gain) this.layer4Gain.gain.setTargetAtTime(0.5, now, 0.4);
      if (this.layer3Gain) this.layer3Gain.gain.setTargetAtTime(0.0, now, 0.4);
      this.triggerRadioInterference(0.6);
    } else if (stage === 'silence' || stage === 'lights_out') {
      // 2. Tensión comienza a reducirse lentamente
      if (this.layer1Gain) this.layer1Gain.gain.setTargetAtTime(0.25, now, 0.8);
      if (this.layer4Gain) this.layer4Gain.gain.setTargetAtTime(0.05, now, 0.8);
    } else if (stage === 'text1') {
      // 3. "GALLARDO HA CAÍDO": Ambiente queda casi en silencio (faint tape hiss only)
      if (this.layer1Gain) this.layer1Gain.gain.setTargetAtTime(0.05, now, 1.2);
      if (this.layer2Gain) this.layer2Gain.gain.setTargetAtTime(0.0, now, 1.2);
      if (this.layer4Gain) this.layer4Gain.gain.setTargetAtTime(0.0, now, 1.2);
      if (this.vhsHissGain) this.vhsHissGain.gain.setTargetAtTime(0.06, now, 1.0);
    } else if (stage === 'text2') {
      // 4. "HAS SOBREVIVIDO": Versión extremadamente tenue y perturbadora de la caja musical
      this.playBrokenMusicBoxPhrase(false);
      if (this.layer1Gain) this.layer1Gain.gain.setTargetAtTime(0.08, now, 1.0);
    } else if (stage === 'text3') {
      // 5. "BLOOD OF THE BIRD": Drone largo y oscuro que se desvanece lentamente
      if (this.layer1Gain) {
        this.layer1Gain.gain.setValueAtTime(0.42, now);
        this.layer1Gain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);
      }
      this.musicGain.gain.setTargetAtTime(0.0, now + 2.5, 2.5);
    }
  }

  // --- Heartbeat Pulse Generator ---

  private startChaseHeartbeat(intervalMs: number = 560) {
    if (this.chaseHeartbeatInterval) {
      clearInterval(this.chaseHeartbeatInterval);
      this.chaseHeartbeatInterval = null;
    }
    this.playHeartbeat();
    this.chaseHeartbeatInterval = window.setInterval(() => {
      this.playHeartbeat();
    }, intervalMs);
  }

  private stopChaseHeartbeat() {
    if (this.chaseHeartbeatInterval) {
      clearInterval(this.chaseHeartbeatInterval);
      this.chaseHeartbeatInterval = null;
    }
  }

  private playHeartbeat() {
    if (!this.ctx || !this.sfxGain || (this.currentMusicState !== 'chase' && this.currentMusicState !== 'boss' && this.currentMusicState !== 'boss_enraged')) return;
    const now = this.ctx.currentTime;

    // Double thump (lub-dub)
    const playThump = (timeOffset: number, freq: number, gainVal: number) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + timeOffset;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.12);

      g.gain.setValueAtTime(gainVal, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    };

    playThump(0, 92, 0.32);
    playThump(0.14, 72, 0.20);
  }

  // --- Fluorescent Hum Ambience ---

  private startBackroomsAmbience() {
    if (!this.ctx || !this.ambientGain) return;

    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc2 = this.ctx.createOscillator();
    const humFilter = this.ctx.createBiquadFilter();
    this.humGain = this.ctx.createGain();

    this.humOsc1.type = 'sawtooth';
    this.humOsc1.frequency.setValueAtTime(60, this.ctx.currentTime); // 60 Hz standard AC hum

    this.humOsc2.type = 'triangle';
    this.humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime); // 120 Hz harmonic

    humFilter.type = 'bandpass';
    humFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    humFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    this.humGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.humOsc1.connect(this.humGain);
    this.humOsc2.connect(this.humGain);
    this.humGain.connect(humFilter);
    humFilter.connect(this.ambientGain);

    this.humOsc1.start();
    this.humOsc2.start();
  }

  // --- Occasional Horror Environmental Sounds ---

  private scheduleRandomHorrorEvents() {
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 16000;
      this.ambientEventTimeout = window.setTimeout(() => {
        this.triggerRandomHorrorEvent();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }

  private triggerRandomHorrorEvent() {
    if (!this.ctx || !this.ambientGain) return;
    const choice = Math.random();

    if (choice < 0.35) {
      // 1. Distant wall thump / impact
      this.playDistantThud();
    } else if (choice < 0.65) {
      // 2. Fluorescent spark arc / crackle
      this.triggerFlickerPop();
    } else if (choice < 0.85) {
      // 3. Metallic pipe moan
      this.playPipeMoan();
    } else {
      // 4. Distant eerie echo
      this.playDistantEchoSquawk();
    }
  }

  private triggerFlickerPop() {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900 + Math.random() * 600, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    noise.start(now);
  }

  private playDistantThud() {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(120, now);

    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(f);
    f.connect(g);
    g.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  private playPipeMoan() {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.linearRampToValueAtTime(170, now + 0.8);
    osc.frequency.linearRampToValueAtTime(120, now + 1.8);

    f.type = 'bandpass';
    f.frequency.setValueAtTime(320, now);
    f.Q.setValueAtTime(4, now);

    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    osc.connect(f);
    f.connect(g);
    g.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 2.0);
  }

  private playDistantEchoSquawk() {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.35);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(600, now);

    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(f);
    f.connect(g);
    g.connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  // --- Helper: Positional 3D Panner, Occlusion & Distance Gain ---

  public create3DNode(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    isOccluded: boolean = false
  ): { input: AudioNode; output: AudioNode } | null {
    if (!this.ctx || !this.sfxGain) return null;

    const dx = enemyX - playerX;
    const dy = enemyY - playerY;
    const dist = Math.hypot(dx, dy);

    // Distance attenuation: natural inverse falloff with physical air dampening
    const maxDist = 26;
    let distFactor = Math.max(0.02, Math.min(1.0, 1 - Math.pow(dist / maxDist, 0.85)));
    if (isOccluded) {
      distFactor *= 0.45; // Wall dampening
    }

    // Player right vector: (-playerDirY, playerDirX)
    const rightX = -playerDirY;
    const rightY = playerDirX;
    const pan = dist > 0.001 ? Math.max(-0.88, Math.min(0.88, (dx * rightX + dy * rightY) / dist)) : 0;

    // Forward dot product for rear HRTF ear pinna shadowing
    const forwardDot = dist > 0.001 ? (dx * playerDirX + dy * playerDirY) / dist : 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(distFactor, this.ctx.currentTime);

    let nextNode: AudioNode = gain;

    // 1. Physical Wall Occlusion filter (cuts high frequencies and muffles clarity through walls)
    if (isOccluded) {
      const occFilter = this.ctx.createBiquadFilter();
      occFilter.type = 'lowpass';
      occFilter.frequency.setValueAtTime(390, this.ctx.currentTime);
      occFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);
      gain.connect(occFilter);
      nextNode = occFilter;
    }

    // 2. Rear HRTF (Head-Related Transfer Function): Ear pinna cuts highs when sound is behind listener
    if (forwardDot < -0.1) {
      const rearFilter = this.ctx.createBiquadFilter();
      rearFilter.type = 'lowpass';
      const cutoff = 2400 + Math.max(0, forwardDot + 1) * 2200;
      rearFilter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
      nextNode.connect(rearFilter);
      nextNode = rearFilter;
    }

    // 3. Send a distance-dependent proportion to the procedural room reverb
    if (this.reverbSendGain) {
      const wetRatio = Math.min(0.65, (dist / maxDist) * 0.75);
      const sendGain = this.ctx.createGain();
      sendGain.gain.setValueAtTime(wetRatio, this.ctx.currentTime);
      nextNode.connect(sendGain);
      sendGain.connect(this.reverbSendGain);
    }

    // 4. Stereo Panning
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, this.ctx.currentTime);
      nextNode.connect(panner);
      panner.connect(this.sfxGain);
      return { input: gain, output: panner };
    } else {
      nextNode.connect(this.sfxGain);
      return { input: gain, output: nextNode };
    }
  }

  // Proximity cues for lurking unseen threats nearby (distance 3.5 to 8 units)
  public playEntityProximityCue(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    type: string = 'white',
    isOccluded: boolean = true
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(enemyX, enemyY, playerX, playerY, playerDirX, playerDirY, isOccluded);
    if (!spatial) return;

    const now = this.ctx.currentTime;
    const choice = Math.random();

    if (choice < 0.5) {
      // 1. Chilling raspy throat breathing / rattle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(type === 'tank' ? 65 : 120, now);
      osc.frequency.linearRampToValueAtTime(type === 'tank' ? 45 : 85, now + 0.6);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(380, now);
      filter.Q.setValueAtTime(4.0, now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(spatial.input);
      osc.start(now);
      osc.stop(now + 0.7);
    } else {
      // 2. Subtle floor claw skitter / friction
      const bufSize = Math.floor(this.ctx.sampleRate * 0.18);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.3) * (1 - i / bufSize);
      }
      const sSrc = this.ctx.createBufferSource();
      sSrc.buffer = buf;
      const sFilt = this.ctx.createBiquadFilter();
      sFilt.type = 'bandpass';
      sFilt.frequency.setValueAtTime(1400, now);
      const sGain = this.ctx.createGain();
      sGain.gain.setValueAtTime(0.18, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      sSrc.connect(sFilt);
      sFilt.connect(sGain);
      sGain.connect(spatial.input);
      sSrc.start(now);
    }
  }

  // --- Sound Effects with Simulated 3D Positional Audio & Variety ---

  public playChickenCluck(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    type: string = 'white',
    isOccluded: boolean = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(enemyX, enemyY, playerX, playerY, playerDirX, playerDirY, isOccluded);
    if (!spatial) return;

    const now = this.ctx.currentTime;

    if (type === 'tank') {
      // Tank: Deep guttural beast rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(spatial.input);
      osc.start(now);
      osc.stop(now + 0.4);
      return;
    }

    if (type === 'red') {
      // Red: Piercing high whistle-shriek
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.22);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(spatial.input);
      osc.start(now);
      osc.stop(now + 0.25);
      return;
    }

    if (type === 'black') {
      // Black / Shadow: Low void resonance
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain);
      gain.connect(spatial.input);
      osc.start(now);
      osc.stop(now + 0.34);
      return;
    }

    if (type === 'lurker' || type === 'spitter') {
      // Wet raspy gurgle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.18);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, now);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(spatial.input);
      osc.start(now);
      osc.stop(now + 0.22);
      return;
    }

    // Standard poultry cluck with analog grit
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    const baseFreq = 220 + Math.random() * 40;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(spatial.input);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playChickenShriek(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    type: string = 'white',
    isOccluded: boolean = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(enemyX, enemyY, playerX, playerY, playerDirX, playerDirY, isOccluded);
    if (!spatial) return;

    const now = this.ctx.currentTime;

    if (type === 'tank') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.55);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.58);
      osc.connect(gain);
      gain.connect(spatial.input);
      osc.start(now);
      osc.stop(now + 0.6);
      return;
    }

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(450, now + 0.35);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(610, now);
    osc2.frequency.exponentialRampToValueAtTime(1450, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(420, now + 0.35);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(spatial.input);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  public playChickenAttack(type: string = 'white') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const startF = type === 'tank' ? 380 : 800;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playChickenDeath(
    enemyX?: number,
    enemyY?: number,
    playerX?: number,
    playerY?: number,
    playerDirX?: number,
    playerDirY?: number,
    type: string = 'white',
    isOccluded: boolean = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const startF = type === 'tank' ? 240 : 550;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.32);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.34);

    osc.connect(gain);

    if (enemyX !== undefined && enemyY !== undefined && playerX !== undefined && playerY !== undefined && playerDirX !== undefined && playerDirY !== undefined) {
      const spatial = this.create3DNode(enemyX, enemyY, playerX, playerY, playerDirX, playerDirY, isOccluded);
      if (spatial) {
        gain.connect(spatial.input);
      } else {
        gain.connect(this.sfxGain);
      }
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // --- Distant Terrifying Screams & Analog Warped Voices ---

  /**
   * Generates a bone-chilling distant echo scream panned in 3D across the arena/corridor.
   */
  public playDistantScream(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    isOccluded: boolean = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(enemyX, enemyY, playerX, playerY, playerDirX, playerDirY, isOccluded);
    if (!spatial) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(740, now);
    osc1.frequency.exponentialRampToValueAtTime(1380, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 1.6);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(755, now);
    osc2.frequency.exponentialRampToValueAtTime(1360, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(310, now + 1.6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(450, now + 1.5);
    filter.Q.setValueAtTime(4.5, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(spatial.input);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.8);
    osc2.stop(now + 1.8);
  }

  /**
   * Procedural formant voice synthesizer generating distorted analog whispers/phrases
   */
  public playAnalogVoice(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    phrase: 'donde' | 'detras' | 'mira' | 'whisper' = 'donde'
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(enemyX, enemyY, playerX, playerY, playerDirX, playerDirY, false);
    if (!spatial) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter1 = this.ctx.createBiquadFilter();
    const filter2 = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const pitch = phrase === 'detras' ? 95 : phrase === 'mira' ? 140 : 110;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.linearRampToValueAtTime(pitch * 0.85, now + 0.9);

    // Formant vocal filtering (vowel approximation [o] / [a])
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(phrase === 'detras' ? 450 : 500, now);
    filter1.Q.setValueAtTime(6.0, now);

    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(phrase === 'detras' ? 1100 : 1250, now);
    filter2.Q.setValueAtTime(5.0, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    osc.connect(filter1);
    osc.connect(filter2);
    filter1.connect(gain);
    filter2.connect(gain);
    gain.connect(spatial.input);

    osc.start(now);
    osc.stop(now + 1.15);
  }

  // --- Environmental & Psychological Horror Audio ---

  public playDrippingWater(
    x: number,
    y: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    isOccluded: boolean = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(x, y, playerX, playerY, playerDirX, playerDirY, isOccluded);
    if (!spatial) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseF = 1200 + Math.random() * 600;
    osc.frequency.setValueAtTime(baseF, now);
    osc.frequency.exponentialRampToValueAtTime(baseF * 1.4, now + 0.035);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(spatial.input);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playFluorescentFlicker() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Electrical snap + buzz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.setValueAtTime(60, now + 0.04);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playWallKnock(
    x: number,
    y: number,
    playerX: number,
    playerY: number,
    playerDirX: number,
    playerDirY: number,
    isOccluded: boolean = false
  ) {
    if (!this.ctx || !this.sfxGain) return;
    const spatial = this.create3DNode(x, y, playerX, playerY, playerDirX, playerDirY, isOccluded);
    if (!spatial) return;

    const now = this.ctx.currentTime;
    // 3 distinct muffled knuckle taps
    [0, 0.18, 0.38].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now + offset);
      osc.frequency.exponentialRampToValueAtTime(45, now + offset + 0.07);
      gain.gain.setValueAtTime(0.42, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
      osc.connect(gain);
      gain.connect(spatial.input);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  public playPhantomBreathing(side: 'left' | 'right' = 'left') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(side === 'left' ? -0.85 : 0.85, now);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(1.8, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 1.25);
  }

  public playGhostFootsteps(playerX: number, playerY: number, playerDirX: number, playerDirY: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Position 1.8m directly behind player
    const gx = playerX - playerDirX * 1.8;
    const gy = playerY - playerDirY * 1.8;
    const spatial = this.create3DNode(gx, gy, playerX, playerY, playerDirX, playerDirY, false);
    if (!spatial) return;

    const now = this.ctx.currentTime;
    [0, 0.45, 0.95].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now + offset);
      osc.frequency.exponentialRampToValueAtTime(45, now + offset + 0.08);
      gain.gain.setValueAtTime(0.24, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
      osc.connect(gain);
      gain.connect(spatial.input);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
  }

  // --- Exclusive Gallardo Hell Sequence (Level 18 Nightmare Entrance) ---

  public startGallardoHellSequence() {
    if (!this.ctx || !this.musicGain) return;
    this.clearGallardoHellTimeouts();
    this.isGallardoHellSequenceActive = true;
    const now = this.ctx.currentTime;

    // Cut everything to dead silence
    this.musicGain.gain.setValueAtTime(0.0001, now);
    if (this.layer1Gain) this.layer1Gain.gain.setValueAtTime(0.0, now);
    if (this.layer2Gain) this.layer2Gain.gain.setValueAtTime(0.0, now);
    if (this.layer3Gain) this.layer3Gain.gain.setValueAtTime(0.0, now);
    if (this.layer4Gain) this.layer4Gain.gain.setValueAtTime(0.0, now);
    if (this.vhsHissGain) this.vhsHissGain.gain.setValueAtTime(0.0001, now);

    // 1. 1.4s: Faint tape hiss starts: HISSSSS...
    this.scheduleGallardoStep(1400, () => {
      if (!this.ctx || !this.vhsHissGain || !this.musicGain) return;
      this.vhsHissGain.gain.setTargetAtTime(0.14, this.ctx.currentTime, 1.0);
      const targetVol = this.currentSettings?.musicEnabled ? this.currentSettings.musicVolume * 0.5 : 0.4;
      this.musicGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 1.2);
    });

    // 2. 3.6s: Low transformer 60Hz rumble emerges
    this.scheduleGallardoStep(3600, () => {
      if (!this.ctx || !this.electricHumGain) return;
      this.electricHumGain.gain.setTargetAtTime(0.12, this.ctx.currentTime, 1.2);
    });

    // 3. 5.8s: Distant heavy metallic impact echoing in coliseum
    this.scheduleGallardoStep(5800, () => {
      this.triggerTapeClick();
      this.playWallImpactSparks();
    });

    // 4. 8.2s: Terrifying distant scream in 3D
    this.scheduleGallardoStep(8200, () => {
      this.playDistantScream(14.5, 14.5, 14.5, 3.5, 0, 1);
    });

    // 5. 10.8s: Brief silence before music box
    this.scheduleGallardoStep(10800, () => {
      if (!this.ctx || !this.vhsHissGain) return;
      this.vhsHissGain.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.4);
    });

    // 6. 12.2s: Single out-of-tune music box note echoing
    this.scheduleGallardoStep(12200, () => {
      this.playMusicBoxNote(196, 0, 2.5, -35, 0.32);
    });

    // 7. 14.8s: Ominous hell drone begins slow swelling rise
    this.scheduleGallardoStep(14800, () => {
      if (!this.ctx || !this.layer4Gain || !this.layer1Gain) return;
      this.layer4Gain.gain.setTargetAtTime(0.68, this.ctx.currentTime, 3.0);
      this.layer1Gain.gain.setTargetAtTime(0.60, this.ctx.currentTime, 3.0);
      this.triggerRadioInterference(0.5);
    });

    // 8. 17.5s: Gallardo heavy dragging breath
    this.scheduleGallardoStep(17500, () => {
      this.playBossBreathing(true);
      this.isGallardoHellSequenceActive = false;
      this.currentMusicState = 'boss';
    });
  }

  private scheduleGallardoStep(delayMs: number, fn: () => void) {
    const tid = window.setTimeout(fn, delayMs);
    this.gallardoHellTimeouts.push(tid);
  }

  private clearGallardoHellTimeouts() {
    this.gallardoHellTimeouts.forEach((id) => clearTimeout(id));
    this.gallardoHellTimeouts = [];
    this.isGallardoHellSequenceActive = false;
  }

  // --- Custom AI Generated Lyria Music Player ---

  public async playCustomMusicTrack(audioBase64: string, _mimeType: string = 'audio/mp3') {
    if (!this.ctx) return;
    try {
      this.stopCustomMusicTrack();

      // Convert base64 to arrayBuffer
      const binaryString = window.atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer);
      this.customMusicSource = this.ctx.createBufferSource();
      this.customMusicSource.buffer = audioBuffer;
      this.customMusicSource.loop = true;

      this.customMusicGain = this.ctx.createGain();
      const vol = this.currentSettings?.musicEnabled ? this.currentSettings.musicVolume * 0.75 : 0.6;
      this.customMusicGain.gain.setValueAtTime(vol, this.ctx.currentTime);

      this.customMusicSource.connect(this.customMusicGain);
      if (this.musicMasterLowpass) {
        this.customMusicGain.connect(this.musicMasterLowpass);
      } else if (this.musicGain) {
        this.customMusicGain.connect(this.musicGain);
      }

      this.customMusicSource.start();
      this.isCustomTrackActive = true;

      // Lower procedural drone layers so custom AI track takes precedence
      if (this.layer1Gain) this.layer1Gain.gain.setTargetAtTime(0.1, this.ctx.currentTime, 1.0);
      if (this.layer2Gain) this.layer2Gain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 1.0);
      if (this.layer3Gain) this.layer3Gain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 1.0);
    } catch (err) {
      console.error('Failed to decode and play custom Lyria track:', err);
    }
  }

  public stopCustomMusicTrack() {
    if (this.customMusicSource) {
      try {
        this.customMusicSource.stop();
        this.customMusicSource.disconnect();
      } catch {
        // Ignored
      }
      this.customMusicSource = null;
    }
    this.isCustomTrackActive = false;
    // Restore procedural layers if appropriate
    if (this.ctx && this.layer1Gain) {
      this.layer1Gain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 1.0);
    }
  }

  // --- Player SFX ---

  public playFootstep(surface?: string, isSprinting: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const currentSurf = surface || this.getCurrentSurface();

    // Alternate left/right foot stereo micro-pan
    this.footstepAlternator = !this.footstepAlternator;
    const footPan = this.footstepAlternator ? -0.06 : 0.06;
    const pitchMod = 0.96 + Math.random() * 0.08;
    const sprintVolMultiplier = isSprinting ? 1.25 : 1.0;

    let panner: StereoPannerNode | null = null;
    try {
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(footPan, now);
        panner.connect(this.sfxGain);
      }
    } catch {}
    const outputNode: AudioNode = panner || this.sfxGain;

    switch (currentSurf) {
      case 'damp_carpet':
      case 'office_carpet': {
        // Damped, squelchy soft carpet compression
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(85 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.08);
        g.gain.setValueAtTime(0.24 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.1);

        const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.07), this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(450 * pitchMod, now);
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.18 * sprintVolMultiplier, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        noise.connect(filt);
        filt.connect(ng);
        ng.connect(outputNode);
        noise.start(now);
        break;
      }

      case 'rotting_wood':
      case 'creaky_wood': {
        // Hollow wood plank impact + fibrous wood creak
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        g.gain.setValueAtTime(0.32 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.12);

        if (Math.random() > 0.3) {
          const cOsc = this.ctx.createOscillator();
          const cg = this.ctx.createGain();
          cOsc.type = 'sawtooth';
          cOsc.frequency.setValueAtTime(260 * pitchMod, now);
          cOsc.frequency.linearRampToValueAtTime(190, now + 0.09);
          cg.gain.setValueAtTime(0.08 * sprintVolMultiplier, now);
          cg.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          cOsc.connect(cg);
          cg.connect(outputNode);
          cOsc.start(now);
          cOsc.stop(now + 0.1);
        }
        break;
      }

      case 'hazard_concrete':
      case 'wet_concrete': {
        // Heavy solid heel tap with gritty scuff
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
        g.gain.setValueAtTime(0.30 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.11);

        const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.06), this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(1100, now);
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.20 * sprintVolMultiplier, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        noise.connect(filt);
        filt.connect(ng);
        ng.connect(outputNode);
        noise.start(now);
        break;
      }

      case 'flooded_tile': {
        // Sharp tile click + watery puddle splash and droplet ripple
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);
        g.gain.setValueAtTime(0.28 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.08);

        const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.12), this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / d.length) * Math.PI);
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.setValueAtTime(1400, now);
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.26 * sprintVolMultiplier, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        noise.connect(filt);
        filt.connect(ng);
        ng.connect(outputNode);
        noise.start(now);
        break;
      }

      case 'void_stone':
      case 'stone_flagstones': {
        // Deep stone slab impact with early cavernous reflection
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
        g.gain.setValueAtTime(0.35 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(g);
        g.connect(outputNode);
        if (this.reverbSendGain) {
          const rSend = this.ctx.createGain();
          rSend.gain.setValueAtTime(0.32, now);
          g.connect(rSend);
          rSend.connect(this.reverbSendGain);
        }
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      case 'metal_grate':
      case 'steel_plate':
      case 'sheet_metal': {
        // Resonant metal clang and hollow iron vibration
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
        g.gain.setValueAtTime(0.35 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.16);

        const ringOsc = this.ctx.createOscillator();
        const ringG = this.ctx.createGain();
        ringOsc.type = 'sine';
        ringOsc.frequency.setValueAtTime(680 * pitchMod, now);
        ringG.gain.setValueAtTime(0.14 * sprintVolMultiplier, now);
        ringG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        ringOsc.connect(ringG);
        ringG.connect(outputNode);
        ringOsc.start(now);
        ringOsc.stop(now + 0.13);
        break;
      }

      case 'fleshy_nest': {
        // Organic squish, wet membrane suction release
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.11);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(420, now);
        g.gain.setValueAtTime(0.32 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(filt);
        filt.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }

      case 'scorched_brick':
      case 'shattered_rock': {
        // Rough gravel / ceramic rubble crunch
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        g.gain.setValueAtTime(0.28 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.1);

        const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(1600, now);
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.24 * sprintVolMultiplier, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        noise.connect(filt);
        filt.connect(ng);
        ng.connect(outputNode);
        noise.start(now);
        break;
      }

      case 'linoleum_squeak': {
        // Hospital linoleum rubber sole friction squeak
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1450 * pitchMod, now);
        osc.frequency.linearRampToValueAtTime(1800, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.09);
        g.gain.setValueAtTime(0.18 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }

      case 'glass_floor': {
        // Crystalline tap with delicate glass resonance
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        g.gain.setValueAtTime(0.20 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'frosty_steel': {
        // Icy crust crunch + subzero metal ring
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
        g.gain.setValueAtTime(0.30 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      default: {
        // Neutral solid backrooms footfall
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        g.gain.setValueAtTime(0.26 * sprintVolMultiplier, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(g);
        g.connect(outputNode);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    }
  }

  public playPlayerJump() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Physical effort exertion grunt + floor shoe thrust
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Subtle shoe floor friction swoosh
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.22, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playPlayerLand(surfaceOrHard: string | boolean = false, hard: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const isHard = typeof surfaceOrHard === 'boolean' ? surfaceOrHard : hard;
    const surf = typeof surfaceOrHard === 'string' ? surfaceOrHard : this.getCurrentSurface();

    // Solid landing foot impact with knees compressing
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(105, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    const volume = isHard ? 0.72 : 0.42;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    if (this.reverbSendGain) {
      const rSend = this.ctx.createGain();
      rSend.gain.setValueAtTime(0.4, now);
      gain.connect(rSend);
      rSend.connect(this.reverbSendGain);
    }
    osc.start(now);
    osc.stop(now + 0.22);

    // Floor dust scuff or puddle splash
    if (surf === 'flooded_tile') {
      const bufSize = Math.floor(this.ctx.sampleRate * 0.2);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
      const splash = this.ctx.createBufferSource();
      splash.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.setValueAtTime(1200, now);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.45, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.19);
      splash.connect(filt);
      filt.connect(nGain);
      nGain.connect(this.sfxGain);
      splash.start(now);
    } else {
      const bufSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(360, now);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.28, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      noise.connect(filt);
      filt.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(now);
    }
  }

  public playShotgun() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Automatic sidechain ducking of background music and ambient during gunshot blast
    this.duckMusic(0.55, 0.65);

    // 1. Explosive white/brown noise blast
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 0.45);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    // Send blast to room reverb
    if (this.reverbSendGain) {
      const rSend = this.ctx.createGain();
      rSend.gain.setValueAtTime(0.45, now);
      noiseGain.connect(rSend);
      rSend.connect(this.reverbSendGain);
    }
    noise.start(now);

    // 2. Heavy sub-thump bass kick punch
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(190, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.32);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.95, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.36);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.38);

    // 3. Spent brass shell casing ejection & floor bounce
    window.setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const shellOsc = this.ctx.createOscillator();
      const shellG = this.ctx.createGain();
      shellOsc.type = 'triangle';
      shellOsc.frequency.setValueAtTime(1800 + Math.random() * 400, t);
      shellOsc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
      shellG.gain.setValueAtTime(0.25, t);
      shellG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      shellOsc.connect(shellG);
      shellG.connect(this.sfxGain);
      shellOsc.start(t);
      shellOsc.stop(t + 0.06);

      // Light secondary bounce
      window.setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const t2 = this.ctx.currentTime;
        const bOsc = this.ctx.createOscillator();
        const bG = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(1950, t2);
        bOsc.frequency.exponentialRampToValueAtTime(1100, t2 + 0.04);
        bG.gain.setValueAtTime(0.14, t2);
        bG.gain.exponentialRampToValueAtTime(0.001, t2 + 0.04);
        bOsc.connect(bG);
        bG.connect(this.sfxGain);
        bOsc.start(t2);
        bOsc.stop(t2 + 0.05);
      }, 90);
    }, 380);
  }

  public playReload() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Metal pump open slide backward
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(850, now);
    osc1.frequency.exponentialRampToValueAtTime(280, now + 0.09);
    g1.gain.setValueAtTime(0.42, now);
    g1.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // 2. Shell click inserted into magazine tube
    window.setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1350, t);
      osc2.frequency.exponentialRampToValueAtTime(680, t + 0.06);
      g2.gain.setValueAtTime(0.35, t);
      g2.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      osc2.connect(g2);
      g2.connect(this.sfxGain);
      osc2.start(t);
      osc2.stop(t + 0.07);
    }, 280);

    // 3. Pump slam forward into battery
    window.setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc3 = this.ctx.createOscillator();
      const g3 = this.ctx.createGain();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(490, t);
      osc3.frequency.exponentialRampToValueAtTime(160, t + 0.11);
      g3.gain.setValueAtTime(0.48, t);
      g3.gain.exponentialRampToValueAtTime(0.01, t + 0.11);
      osc3.connect(g3);
      g3.connect(this.sfxGain);
      osc3.start(t);
      osc3.stop(t + 0.12);
    }, 580);
  }

  public playDryFire() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPlayerHurt() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playPickup(type: string = 'generic') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    if (type === 'ammo') {
      // Brass shotgun shells rattling into pouch
      [0, 0.05, 0.12].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100 + idx * 240, now + offset);
        osc.frequency.exponentialRampToValueAtTime(500, now + offset + 0.05);
        g.gain.setValueAtTime(0.28, now + offset);
        g.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.06);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
      return;
    }

    if (type === 'health') {
      // Sterile medkit zip + antiseptic injector hiss
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
      g.gain.setValueAtTime(0.32, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.22);
      return;
    }

    if (type === 'bomb') {
      this.playPickupBomb();
      return;
    }

    // Generic pickup chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.06);
    osc.frequency.setValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playDoorUnlock() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Heavy mechanical latch snap
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    g1.gain.setValueAtTime(0.45, now);
    g1.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // 2. Pneumatic slide release & reverberant lock opening
    window.setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(140, t);
      osc2.frequency.exponentialRampToValueAtTime(45, t + 0.6);
      g2.gain.setValueAtTime(0.4, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc2.connect(g2);
      g2.connect(this.sfxGain);
      if (this.reverbSendGain) {
        const rSend = this.ctx.createGain();
        rSend.gain.setValueAtTime(0.55, t);
        g2.connect(rSend);
        rSend.connect(this.reverbSendGain);
      }
      osc2.start(t);
      osc2.stop(t + 0.7);
    }, 180);
  }

  public playDoorLocked() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Heavy handle rattle on locked metal door (rattle-rattle-thud)
    [0, 0.08, 0.18].forEach((offset, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = idx === 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(idx === 2 ? 80 : 380, now + offset);
      osc.frequency.exponentialRampToValueAtTime(idx === 2 ? 35 : 120, now + offset + 0.08);
      g.gain.setValueAtTime(idx === 2 ? 0.45 : 0.30, now + offset);
      g.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.09);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  public playDoorSlideOpen() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(320, now);
    filt.Q.setValueAtTime(2.5, now);
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 1.25);
    osc.connect(filt);
    filt.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.3);
  }

  public playWallBrush() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    if (now - this.lastWallBrushTime < 0.38) return;
    this.lastWallBrushTime = now;

    // Subtle fabric and leather grazing friction against wall
    const bufSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(580, now);
    filt.Q.setValueAtTime(1.8, now);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(filt);
    filt.connect(g);
    g.connect(this.sfxGain);
    noise.start(now);
  }

  public playButtonHover() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.02);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playButtonClick() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.03);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- Jumpscare Screamer SFX ---
  // A terrifying, sudden, high-intensity sound with dynamic compression to prevent clipping
  public playJumpscareScream() {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Safety compressor node to protect player hearing while maximizing perceived loudness and punch
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-6, now);
    compressor.knee.setValueAtTime(3, now);
    compressor.ratio.setValueAtTime(16, now);
    compressor.attack.setValueAtTime(0.001, now);
    compressor.release.setValueAtTime(0.2, now);
    compressor.connect(this.sfxGain);

    // 1. Violent Sub-bass Thud (chest impact)
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(160, now);
    boomOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45);
    boomGain.gain.setValueAtTime(0.9, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    boomOsc.connect(boomGain);
    boomGain.connect(compressor);
    boomOsc.start(now);
    boomOsc.stop(now + 0.52);

    // 2. Screaming Pitch-Modulated Monster Shriek
    const screamOsc1 = this.ctx.createOscillator();
    const screamOsc2 = this.ctx.createOscillator();
    const screamGain = this.ctx.createGain();

    screamOsc1.type = 'sawtooth';
    screamOsc1.frequency.setValueAtTime(1400, now);
    screamOsc1.frequency.exponentialRampToValueAtTime(320, now + 0.85);

    screamOsc2.type = 'sawtooth';
    screamOsc2.frequency.setValueAtTime(1360, now); // dissonant detune
    screamOsc2.frequency.exponentialRampToValueAtTime(310, now + 0.85);

    // Filter to shape the demonic throat resonance
    const screamFilter = this.ctx.createBiquadFilter();
    screamFilter.type = 'bandpass';
    screamFilter.frequency.setValueAtTime(1800, now);
    screamFilter.frequency.exponentialRampToValueAtTime(700, now + 0.9);
    screamFilter.Q.setValueAtTime(3.5, now);

    screamGain.gain.setValueAtTime(0.85, now);
    screamGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    screamOsc1.connect(screamFilter);
    screamOsc2.connect(screamFilter);
    screamFilter.connect(screamGain);
    screamGain.connect(compressor);

    screamOsc1.start(now);
    screamOsc2.start(now);
    screamOsc1.stop(now + 1.25);
    screamOsc2.stop(now + 1.25);

    // 3. Harsh Glitch / White Noise Distortion Burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1200, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(compressor);
    noiseNode.start(now);
  }

  // --- Boss "EL GALLO" Audio ---

  public playBossRoar() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(55, now + 0.8);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(165, now);
    osc2.frequency.exponentialRampToValueAtTime(70, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.15);
    osc2.stop(now + 1.15);
  }

  public playBossChargeWindup() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.7);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, now);
    filter.Q.setValueAtTime(2, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.82);
  }

  public playBossChargeImpact() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playBossStep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- GALLARDO DYNAMIC BOSS AUDIO SUITE ---

  // GRITO DE RABIA: Terrifying, visceral, multi-layered roar when entering rage or new phase
  public playBossRageCry() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Layer 1: Guttural Detuned Sawtooth Roar
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    subOsc.type = 'triangle';

    osc1.frequency.setValueAtTime(160, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.25);
    osc1.frequency.exponentialRampToValueAtTime(85, now + 1.6);

    osc2.frequency.setValueAtTime(168, now);
    osc2.frequency.exponentialRampToValueAtTime(336, now + 0.25);
    osc2.frequency.exponentialRampToValueAtTime(90, now + 1.6);

    subOsc.frequency.setValueAtTime(65, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 1.5);

    // Layer 2: Shrieking Resonant Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(1900, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.6);
    filter.Q.setValueAtTime(4.2, now);

    // Distortion/Overdrive via WaveShaper
    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 12) * x) / (Math.PI + 12 * Math.abs(x));
    }
    distortion.curve = curve;

    // Master envelope for the roar
    const roarGain = this.ctx.createGain();
    roarGain.gain.setValueAtTime(0.3, now);
    roarGain.gain.linearRampToValueAtTime(1.0, now + 0.2);
    roarGain.gain.exponentialRampToValueAtTime(0.01, now + 1.7);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(distortion);
    distortion.connect(roarGain);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    roarGain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);
    osc1.stop(now + 1.75);
    osc2.stop(now + 1.75);
    subOsc.stop(now + 1.75);
  }

  // PREPARACIÓN DE SALTO (Windup growl + tendon tension)
  public playBossJumpWindup() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.75);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.linearRampToValueAtTime(650, now + 0.75);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.75);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.82);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  // DESPEGUE DE SALTO (Massive ascending air WHOOSH)
  public playBossJumpWhoosh() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(950, now + 0.55);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.62);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // IMPACTO CONTRA EL SUELO (Earth-shattering BOOM)
  public playBossSlamBoom() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub-bass crater punch (35Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.9);

    // Detonation noise blast
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.6);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.55);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.9, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // EXPANSIÓN DE LA ONDA EXPANSIVA (Tearing radial low-frequency whoosh)
  public playBossShockwaveExpansion() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.85);
  }

  // ONDA ESQUIVADA (Adrenaline whoosh underneath the jumping player)
  public playShockwaveEvaded() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // RESPIRACIÓN AGITADA / PESADA DE GALLARDO
  public playBossBreathing(heavy: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(heavy ? 65 : 45, now);
    osc.frequency.linearRampToValueAtTime(heavy ? 85 : 55, now + 0.3);
    osc.frequency.linearRampToValueAtTime(heavy ? 60 : 42, now + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(1.8, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(heavy ? 0.35 : 0.22, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  // PASO RÁPIDO / CARRERA PESADA DE GALLARDO
  public playBossRunStep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // ALARIDO DE DAÑO DE GALLARDO
  public playBossHurt() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // GOLPE DE TIERRA A CORTA DISTANCIA (GROUND POUND)
  public playBossGroundPound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.45);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.45);

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.58);
  }

  // PASOS DINÁMICOS CON VARIACIÓN IZQ/DER PARA EVITAR MONOTONÍA
  public playBossStepVaried(isRight: boolean = false, isRun: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = isRun ? (isRight ? 115 : 105) : (isRight ? 86 : 76);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + (isRun ? 0.12 : 0.16));

    const vol = isRun ? 0.6 : 0.45;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isRun ? 0.15 : 0.19));

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + (isRun ? 0.17 : 0.21));
  }

  // GEMIDO DE MUERTE CINEMATOGRÁFICO DE GALLARDO
  public playBossDeathGroan() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub rumble sweep
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 2.2);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 2.4);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 2.5);

    // Guttural choke
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(75, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(35, now + 2.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 2.2);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  public playFlashlightClick(turnOn: boolean = true) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startF = turnOn ? 1450 : 920;
    const endF = turnOn ? 380 : 240;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + 0.035);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playWallImpactSparks() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playStaminaExhausted() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // --- Bomb & Explosion SFX ---

  public playPickupBomb() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    
    // Metallic clink & arming charge tone
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    g1.gain.setValueAtTime(0.35, now);
    g1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.2);

    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(540, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1080, now + 0.24);
    g2.gain.setValueAtTime(0.3, now + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }

  public playBombThrow() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Fast filtered whoosh
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(950, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.25);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playBombBounce(surface?: string) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const surf = surface || this.getCurrentSurface();

    // Metallic canister casing ping
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = surf === 'metal_grate' || surf === 'steel_plate' ? 520 : (surf === 'flooded_tile' ? 280 : 380);
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 60, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    if (this.reverbSendGain) {
      const rSend = this.ctx.createGain();
      rSend.gain.setValueAtTime(0.25, now);
      gain.connect(rSend);
      rSend.connect(this.reverbSendGain);
    }
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playExplosion(distToPlayer = 0, pan = 0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Distance attenuation & spatial panning
    const distClamped = Math.max(0, distToPlayer);
    const vol = Math.max(0.12, Math.min(1.2, 1.4 / (1 + distClamped * 0.18)));

    let panner: StereoPannerNode | null = null;
    try {
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        panner.connect(this.sfxGain);
      }
    } catch {
      // fallback if StereoPannerNode not supported
    }

    const outputNode = panner || this.sfxGain;

    // 1. Heavy sub-bass concussion (thump that shakes the room)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(24, now + 0.65);
    subGain.gain.setValueAtTime(vol * 1.1, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
    subOsc.connect(subGain);
    subGain.connect(outputNode);
    subOsc.start(now);
    subOsc.stop(now + 0.75);

    // 2. High-energy explosive shockwave noise burst
    const noiseLen = Math.floor(this.ctx.sampleRate * 0.9);
    const noiseBuffer = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseLen, 1.5);
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(180, now + 0.85);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.95, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(outputNode);
    noiseSource.start(now);

    // 3. Crumbling debris & low resonance tail
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(75, now);
    rumbleOsc.frequency.exponentialRampToValueAtTime(32, now + 1.1);

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(180, now);

    rumbleGain.gain.setValueAtTime(vol * 0.5, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.005, now + 1.15);

    rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(outputNode);
    rumbleOsc.start(now);
    rumbleOsc.stop(now + 1.2);
  }

  // --- Spitter & Tank SFX ---

  public playSpitLaunch() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playSpitImpact() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playHeavyStep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.15);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playMeatHit() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }
}

export const soundManager = new SoundManager();
