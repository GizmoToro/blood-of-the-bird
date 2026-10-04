export type QualityLevel = 'low' | 'med' | 'high' | 'ultra';
export type CameraMode = 'first_person' | 'third_person';

export interface GameSettings {
  cameraMode: CameraMode;
  thirdPersonDistance: number; // 1.2 to 3.0 (default 1.85)
  graphicsQuality: QualityLevel;
  renderDistance: QualityLevel;
  effectsQuality: QualityLevel;
  showFPS: boolean;
  headBob: boolean;
  vhsFilter: boolean; // VHS Analog Horror distortion filter
  brightness: number; // 0.6 to 1.4
  fov: number; // 55 to 85 (default 66)
  masterVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  ambientVolume: number; // 0 to 1
  musicEnabled: boolean;
  mouseSensitivity: number; // 0.5 to 2.5
  invertY: boolean;
}

export type GameView = 
  | 'menu' 
  | 'cinematic'
  | 'levelselect'
  | 'playing' 
  | 'paused' 
  | 'settings' 
  | 'controls' 
  | 'credits' 
  | 'jumpscare'
  | 'gameover' 
  | 'victory';

export interface Player {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  planeX: number;
  planeY: number;
  pitch: number; // vertical mouse look offset (-120 to +120)
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  ammoReserve: number;
  isReloading: boolean;
  reloadTimer: number;
  isShooting: boolean;
  shootTimer: number;
  muzzleFlash: number;
  cameraShake: number;
  recoil: number;
  damageFlash: number;
  walkTimer: number;
  isWalking: boolean;
  isSprinting: boolean;
  stamina: number; // 0 to 100
  maxStamina: number;
  flashlight: boolean; // toggleable with F
  flashlightFlicker: number; // random voltage dip
  flashlightBattery: number; // 0 to 100
  headBobOffset: number;
  // Jump mechanics (SPACE to jump)
  isGrounded: boolean;
  jumpHeight: number; // vertical eye elevation (0 = floor, up to ~0.55m)
  jumpVelocity: number;
  landingBob: number;
  bombs: number; // 0 to 5
  maxBombs: number;
  isThrowingBomb: boolean;
  throwBombTimer: number;
  anim?: PlayerAnimation;
}

export type PlayerAnimState = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'jump' 
  | 'fall' 
  | 'land' 
  | 'shoot' 
  | 'reload' 
  | 'hit' 
  | 'dead'
  | 'cinematic_wall_touch'
  | 'cinematic_dazed'
  | 'cinematic_pump';

export interface PlayerAnimation {
  state: PlayerAnimState;
  previousState: PlayerAnimState;
  stateTimer: number;
  blendFactor: number;
  walkCycle: number;
  facingAngle: number;
  squashStretch: number;
  shellEjectTimer: number;
  hitReactionTimer: number;
  landTimer?: number;
}

export type ChickenType = 'white' | 'brown' | 'black' | 'red' | 'lurker' | 'spitter' | 'tank' | 'boss';

export type ChickenBehavior = 'normal' | 'lurker' | 'ambush' | 'spitter' | 'tank' | 'boss';

export type ChickenState = 
  | 'idle' 
  | 'patrol' 
  | 'alert' 
  | 'search' 
  | 'chase' 
  | 'attack' 
  | 'damaged' 
  | 'windup' 
  | 'charge' 
  | 'exhausted' 
  | 'jump'
  | 'slam'
  | 'dead';

export interface ThrownBomb {
  id: string;
  x: number;
  y: number;
  z: number; // 0 = floor, 0.5 = chest
  vx: number;
  vy: number;
  vz: number;
  fuse?: number; // seconds remaining
  timer: number;
  bounces: number;
  maxBounces: number;
  damage: number;
  radius: number;
  exploded?: boolean;
}

export interface SpittedProjectile {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  damage: number;
}

export interface Chicken {
  id: string;
  x: number;
  y: number;
  type: ChickenType;
  behavior?: ChickenBehavior;
  state: ChickenState;
  health: number;
  maxHealth: number;
  speed: number;
  vx?: number;
  vy?: number;
  animFrame: number;
  animTimer: number;
  attackCooldown: number;
  patrolTarget: { x: number; y: number } | null;
  patrolTimer: number;
  alertTimer?: number;
  searchTimer?: number;
  investigateTarget?: { x: number; y: number };
  damagedTimer?: number;
  deadTimer: number;
  soundCooldown: number;
  distToPlayer?: number;
  spitCooldown?: number;
  // Boss specific properties (Gallardo)
  isBoss?: boolean;
  bossPhase?: 1 | 2 | 3 | 4;
  chargeState?: 'idle' | 'windup' | 'charging' | 'exhausted';
  chargeTimer?: number;
  chargeTarget?: { x: number; y: number };
  chargeCooldown?: number;
  jumpElevation?: number; // Height in 3D (0 = ground, up to 1.5m)
  jumpVelocity?: number;
  jumpTimer?: number;
  jumpDuration?: number;
  jumpTarget?: { x: number; y: number };
  slamTimer?: number;
  slamCooldown?: number;
  groundPoundCooldown?: number;
  comboStep?: number;
  transitionTimer?: number;
  isTransitioning?: boolean;
  breatheTimer?: number;
  rageTimer?: number; // 0 to 5 seconds countdown
  rageIntensity?: number; // 0.0 (natural poultry skin) to 1.0 (crimson rage)
  stepAlternate?: boolean;
}

export interface BossShockwave {
  id?: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  damage: number;
  hasHitPlayer: boolean;
  intensity: number;
  life: number;
  type?: 'slam' | 'pound';
}

export type PickupType = 'ammo' | 'health' | 'bomb';

export interface Pickup {
  id: string;
  x: number;
  y: number;
  type: PickupType;
  amount: number;
  collected: boolean;
  distToPlayer?: number;
}

export interface GameStats {
  timeElapsed: number; // in seconds
  chickensKilled: number;
  damageTaken: number;
  shotsFired: number;
  shotsHit: number;
  initialChickens: number;
}

export type LevelTheme = 'yellow' | 'old' | 'red' | 'flooded' | 'office' | 'blue' | 'industrial' | 'nest' | 'arena';

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  theme: LevelTheme;
  fogColor: string;
  fogDensity?: number;
  ambientType: string;
  width: number;
  height: number;
  map: number[][]; // tile codes: 0 is floor, 9 is exit, others are textured walls
  playerStart: { x: number; y: number; dirX: number; dirY: number };
  exitPosition: { x: number; y: number };
  chickenSpawns: Array<{ x: number; y: number; type: ChickenType; behavior?: ChickenBehavior }>;
  pickupSpawns: Array<{ x: number; y: number; type: PickupType; amount: number }>;
}
