import { useState, useEffect, useRef, useCallback } from 'react';
import { GameView, GameSettings, Player, Chicken, Pickup, GameStats, ThrownBomb, SpittedProjectile, LevelData, BossShockwave } from './types';
import { RaycasterEngine } from './game/raycaster';
import { getLevelById, ALL_LEVELS } from './game/map';
import { updateChickens, updateBombs, updateProjectiles, isWalkable, resolvePlayerWallPenetration, damageChicken, notifyNoise } from './game/ai';
import { updateDynamicSpawner, resetSpawner, populateInitialEnemies, getSpawnConfigForLevel, getChickenBaseSpeed, notifyChickenKilled, MIN_SPAWN_DISTANCE } from './game/spawner';
import { soundManager } from './game/audio';
import { textureCache } from './game/textures';
import { StartMenu } from './components/StartMenu';
import { LevelSelectMenu } from './components/LevelSelectMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { ControlsMenu } from './components/ControlsMenu';
import { CreditsMenu } from './components/CreditsMenu';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { Jumpscare } from './components/Jumpscare';
import { HUD, DebugData } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { VhsDistortionFilter } from './components/VhsDistortionFilter';
import { IntroCinematic } from './components/IntroCinematic';
import { Skull, AlertTriangle, Flame } from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'backrooms_fps_settings_v2';

const DEFAULT_SETTINGS: GameSettings = {
  cameraMode: 'first_person',
  thirdPersonDistance: 1.85,
  graphicsQuality: 'high',
  renderDistance: 'med',
  effectsQuality: 'high',
  showFPS: true,
  headBob: true,
  vhsFilter: true,
  brightness: 1.0,
  fov: 66,
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  ambientVolume: 0.6,
  musicEnabled: true,
  mouseSensitivity: 1.2,
  invertY: false,
};

function loadStoredSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    // Fallback to defaults
  }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [gameView, setGameView] = useState<GameView>('menu');
  const [previousView, setPreviousView] = useState<GameView>('menu');
  const [settings, setSettings] = useState<GameSettings>(loadStoredSettings);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hitMarkerTimer, setHitMarkerTimer] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [bossIntroTimer, setBossIntroTimer] = useState<number>(0);
  const [exitWarningTimer, setExitWarningTimer] = useState<number>(0);
  const [bossDefeatedSeqState, setBossDefeatedSeqState] = useState<{
    active: boolean;
    step: 'falling' | 'silence' | 'lights_out' | 'text1' | 'text2' | 'text3';
    timer: number;
  }>({ active: false, step: 'falling', timer: 0 });

  // Sequence and timer refs for high-frequency gameLoop
  const bossIntroTimerRef = useRef<number>(0);
  const exitWarningTimerRef = useRef<number>(0);
  const bossDefeatedSequenceRef = useRef<{
    active: boolean;
    step: 'falling' | 'silence' | 'lights_out' | 'text1' | 'text2' | 'text3';
    timer: number;
  }>({ active: false, step: 'falling', timer: 0 });
  const isVictoryRef = useRef<boolean>(false);

  // FPS tracking refs
  const fpsSmoothRef = useRef<number>(60);
  const fpsTimerRef = useRef<number>(0);

  // Canvas & Engine refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<RaycasterEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Keyboard and Input states
  const keysRef = useRef<Record<string, boolean>>({});
  const mobileInputRef = useRef<{ forward: number; strafe: number }>({ forward: 0, strafe: 0 });

  const currentLevel = getLevelById(currentLevelId);
  const currentLevelRef = useRef<LevelData>(currentLevel);

  // Debug Diagnostics State
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [debugData, setDebugData] = useState<DebugData>({
    playerX: currentLevel.playerStart.x,
    playerY: currentLevel.playerStart.y,
    speed: 0,
    inputs: { w: false, a: false, s: false, d: false, shift: false },
    collision: false,
    paused: false,
    gameState: 'playing',
  });

  // Player state ref for 60fps game loop
  const playerRef = useRef<Player>({
    x: currentLevel.playerStart.x,
    y: currentLevel.playerStart.y,
    dirX: currentLevel.playerStart.dirX,
    dirY: currentLevel.playerStart.dirY,
    planeX: 0,
    planeY: 0.66,
    pitch: 0,
    health: 100,
    maxHealth: 100,
    ammo: 6,
    maxAmmo: 6,
    ammoReserve: 24,
    isReloading: false,
    reloadTimer: 0,
    isShooting: false,
    shootTimer: 0,
    muzzleFlash: 0,
    cameraShake: 0,
    recoil: 0,
    damageFlash: 0,
    walkTimer: 0,
    isWalking: false,
    isSprinting: false,
    stamina: 100,
    maxStamina: 100,
    flashlight: true,
    flashlightFlicker: 0,
    flashlightBattery: 100,
    headBobOffset: 0,
    bombs: 2,
    maxBombs: 4,
    isThrowingBomb: false,
    throwBombTimer: 0,
    isGrounded: true,
    jumpHeight: 0,
    jumpVelocity: 0,
    landingBob: 0,
  });

  // Chickens, Pickups, Bombs & Projectiles refs
  const chickensRef = useRef<Chicken[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const bombsRef = useRef<ThrownBomb[]>([]);
  const projectilesRef = useRef<SpittedProjectile[]>([]);
  const shockwavesRef = useRef<BossShockwave[]>([]);

  // Stats ref
  const statsRef = useRef<GameStats>({
    timeElapsed: 0,
    chickensKilled: 0,
    damageTaken: 0,
    shotsFired: 0,
    shotsHit: 0,
    initialChickens: currentLevel.chickenSpawns.length,
  });

  // State for HUD re-render
  const [hudPlayerState, setHudPlayerState] = useState<Player>(playerRef.current);
  const [hudStats, setHudStats] = useState<GameStats>(statsRef.current);

  // Save settings to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Track Pointer Lock state
  useEffect(() => {
    const handleLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvasRef.current);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update Camera Plane according to FOV
  const updateCameraPlane = useCallback((fov: number) => {
    const fovScale = Math.tan(((fov / 2) * Math.PI) / 180);
    const p = playerRef.current;
    p.planeX = -p.dirY * fovScale;
    p.planeY = p.dirX * fovScale;
  }, []);

  // Initialize or Restart Level
  const initLevel = useCallback((lvlId?: number) => {
    textureCache.init();
    soundManager.init();
    soundManager.updateVolumes(settings);

    const levelToLoad = getLevelById(typeof lvlId === 'number' ? lvlId : currentLevelId);
    currentLevelRef.current = levelToLoad;
    if (typeof lvlId === 'number') {
      setCurrentLevelId(lvlId);
    }

    // Connect sound manager to the exact level profile
    soundManager.setLevel(levelToLoad.id);
    if (levelToLoad.id === 18) {
      soundManager.startGallardoHellSequence();
    }

    // Reset inputs to avoid stuck keys or drifting
    keysRef.current = {};
    mobileInputRef.current = { forward: 0, strafe: 0 };

    // Reset Player
    playerRef.current = {
      x: levelToLoad.playerStart.x,
      y: levelToLoad.playerStart.y,
      dirX: levelToLoad.playerStart.dirX,
      dirY: levelToLoad.playerStart.dirY,
      planeX: 0,
      planeY: 0.66,
      pitch: 0,
      health: 100,
      maxHealth: 100,
      ammo: 6,
      maxAmmo: 6,
      ammoReserve: 24,
      isReloading: false,
      reloadTimer: 0,
      isShooting: false,
      shootTimer: 0,
      muzzleFlash: 0,
      cameraShake: 0,
      recoil: 0,
      damageFlash: 0,
      walkTimer: 0,
      isWalking: false,
      isSprinting: false,
      stamina: 100,
      maxStamina: 100,
      flashlight: true,
      flashlightFlicker: 0,
      flashlightBattery: 100,
      headBobOffset: 0,
      bombs: 2,
      maxBombs: 4,
      isThrowingBomb: false,
      throwBombTimer: 0,
      isGrounded: true,
      jumpHeight: 0,
      jumpVelocity: 0,
      landingBob: 0,
    };
    resolvePlayerWallPenetration(playerRef.current, 0.28, levelToLoad.map);
    updateCameraPlane(settings.fov);
    bombsRef.current = [];
    projectilesRef.current = [];
    shockwavesRef.current = [];

    // Reset Chickens according to level limits (3-5 normal, 5-7 hard) and safe distances
    const spawnConfig = getSpawnConfigForLevel(levelToLoad.id);
    const candidateSpawns = levelToLoad.chickenSpawns;

    // Separate Boss from minions: boss always loads, minions limited to maxEnemies
    const bossSpawns = candidateSpawns.filter((s) => s.type === 'boss');
    const minionSpawns = candidateSpawns.filter((s) => s.type !== 'boss');

    // Filter minions that have safe distance from player spawn
    const safeMinionSpawns = minionSpawns.filter((s) => {
      const dist = Math.hypot(s.x - playerRef.current.x, s.y - playerRef.current.y);
      return dist >= MIN_SPAWN_DISTANCE;
    });

    const chosenMinions = (safeMinionSpawns.length >= spawnConfig.minEnemies ? safeMinionSpawns : minionSpawns).slice(
      0,
      spawnConfig.maxEnemies
    );
    const chosenSpawns = [...bossSpawns, ...chosenMinions];

    chickensRef.current = chosenSpawns.map((s, idx) => {
      const isBoss = s.type === 'boss';
      let hp = 45;
      if (isBoss) {
        hp = 1200;
      } else if (s.type === 'tank') {
        hp = 180;
      } else if (s.type === 'red') {
        hp = 95;
      } else if (s.type === 'black') {
        hp = 75;
      } else if (s.type === 'spitter') {
        hp = 60;
      } else if (s.type === 'lurker' || s.type === 'brown') {
        hp = 50;
      }

      const spd = getChickenBaseSpeed(s.type);

      return {
        id: `chicken-lvl${levelToLoad.id}-${idx}`,
        x: s.x,
        y: s.y,
        type: s.type,
        behavior: s.behavior || (isBoss ? 'boss' : 'patrol'),
        state: isBoss ? 'chase' : 'idle',
        health: hp,
        maxHealth: hp,
        speed: isBoss ? 1.95 : spd,
        vx: 0,
        vy: 0,
        animFrame: 0,
        animTimer: Math.random() * 2,
        attackCooldown: 0.5,
        patrolTarget: null,
        patrolTimer: 1.5 + Math.random() * 2.5,
        deadTimer: 0,
        soundCooldown: 2.0 + Math.random() * 5.0,
        distToPlayer: 99,
        isBoss: isBoss,
        bossPhase: 1,
        chargeCooldown: 4.0,
        chargeTimer: 0,
        rageTimer: 0,
        rageIntensity: 0,
      };
    });

    // Reset Pickups
    pickupsRef.current = levelToLoad.pickupSpawns.map((p, idx) => ({
      id: `pickup-lvl${levelToLoad.id}-${idx}`,
      x: p.x,
      y: p.y,
      type: p.type,
      amount: p.amount,
      collected: false,
    }));

    // Reset Victory state & Sequence & Warning timers
    isVictoryRef.current = false;
    bossDefeatedSequenceRef.current = { active: false, step: 'falling', timer: 0 };
    setBossDefeatedSeqState({ active: false, step: 'falling', timer: 0 });
    exitWarningTimerRef.current = 0;
    setExitWarningTimer(0);

    const hasBoss = levelToLoad.chickenSpawns.some((s) => s.type === 'boss');
    if (hasBoss) {
      bossIntroTimerRef.current = 5.0;
      setBossIntroTimer(5.0);
    } else {
      bossIntroTimerRef.current = 0;
      setBossIntroTimer(0);
    }

    // Reset Stats
    statsRef.current = {
      timeElapsed: 0,
      chickensKilled: 0,
      damageTaken: 0,
      shotsFired: 0,
      shotsHit: 0,
      initialChickens: levelToLoad.chickenSpawns.length,
    };

    engineRef.current?.clearBloodDecals();
    resetSpawner();
    populateInitialEnemies(chickensRef.current, playerRef.current, levelToLoad);
    statsRef.current.initialChickens = chickensRef.current.length;

    setHudPlayerState({ ...playerRef.current });
    setHudStats({ ...statsRef.current });
    lastTimeRef.current = 0;

    setTimeout(() => {
      window.focus();
      canvasRef.current?.focus();
    }, 60);
  }, [currentLevelId, settings, updateCameraPlane]);

  // Cinematic Session Tracking (avoid re-playing on repeated JUGAR clicks in the same session)
  const hasSeenCinematicRef = useRef<boolean>(false);

  // Handle Start Play - Launches Real-Time Intro Cinematic on first play, direct gameplay thereafter
  const handlePlay = useCallback(() => {
    soundManager.init();
    if (hasSeenCinematicRef.current) {
      initLevel(1);
      setSettings((prev) => ({ ...prev, cameraMode: 'first_person' }));
      setGameView('playing');
    } else {
      setGameView('cinematic');
    }
  }, [initLevel]);

  // Dedicated button to re-watch intro cinematic anytime from menu
  const handleWatchCinematic = useCallback(() => {
    soundManager.init();
    setGameView('cinematic');
  }, []);

  // Cinematic Completion Handler
  const handleFinishCinematic = useCallback(() => {
    hasSeenCinematicRef.current = true;
    initLevel(1);
    setSettings((prev) => ({ ...prev, cameraMode: 'first_person' }));
    setGameView('playing');
  }, [initLevel]);

  // Cinematic Skip Handler (Button SALTAR)
  const handleSkipCinematic = useCallback(() => {
    hasSeenCinematicRef.current = true;
    initLevel(1);
    setSettings((prev) => ({ ...prev, cameraMode: 'first_person' }));
    setGameView('playing');
  }, [initLevel]);

  const prevGameViewRef = useRef<GameView>(gameView);

  // Manage Dynamic Music when GameView switches (smooth pause, resume, intro, stop)
  useEffect(() => {
    const prev = prevGameViewRef.current;
    prevGameViewRef.current = gameView;

    if (gameView === 'playing') {
      if (prev === 'paused') {
        soundManager.resumeMusic();
      } else {
        soundManager.startMusic(prev === 'menu' || prev === 'cinematic');
      }
    } else if (gameView === 'paused') {
      soundManager.pauseMusic();
    } else if (gameView === 'menu' || gameView === 'cinematic') {
      soundManager.stopMusic();
    }
  }, [gameView]);

  // Chicken Kill Handler
  const handleKillChicken = useCallback((chicken: Chicken) => {
    statsRef.current.chickensKilled++;
    notifyChickenKilled();
    engineRef.current?.addBloodDecal(chicken.x, chicken.y, (chicken.isBoss || chicken.type === 'boss') ? 0.95 : 0.6);

    if (chicken.isBoss || chicken.type === 'boss') {
      // Global Victory triggered: Immediately active & irreversible
      isVictoryRef.current = true;
      projectilesRef.current = [];
      bombsRef.current = [];
      shockwavesRef.current = [];
      chickensRef.current.forEach((c) => {
        if (c.state !== 'dead') {
          c.state = 'idle';
          c.vx = 0;
          c.vy = 0;
          c.attackCooldown = 999;
        }
      });

      soundManager.playBossRoar();
      soundManager.setVictorySequenceStage('falling');
      bossDefeatedSequenceRef.current = { active: true, step: 'falling', timer: 2.2 };
      setBossDefeatedSeqState({ active: true, step: 'falling', timer: 2.2 });
    } else {
      soundManager.playChickenDeath();
    }
  }, []);

  // Bomb Throw Trigger
  const triggerThrowBomb = useCallback(() => {
    if (gameView !== 'playing') return;
    const player = playerRef.current;
    if ((player.bombs ?? 0) <= 0 || player.isThrowingBomb) return;

    player.bombs = (player.bombs ?? 0) - 1;
    player.isThrowingBomb = true;
    player.throwBombTimer = 0.4;
    soundManager.playBombThrow();

    const throwSpeed = 9.2;
    bombsRef.current.push({
      id: `bomb-${Date.now()}-${Math.random()}`,
      x: player.x + player.dirX * 0.45,
      y: player.y + player.dirY * 0.45,
      z: 0.45,
      vx: player.dirX * throwSpeed,
      vy: player.dirY * throwSpeed,
      vz: 2.8,
      timer: 2.0,
      bounces: 0,
      maxBounces: 3,
      damage: 220,
      radius: 4.2,
      exploded: false,
    });

    setHudPlayerState({ ...player });
  }, [gameView]);

  // Weapon Shoot Trigger
  const triggerShoot = useCallback(() => {
    if (gameView !== 'playing') return;
    const player = playerRef.current;
    if (player.ammo <= 0 || player.isReloading || player.isShooting) {
      if (player.ammo <= 0 && !player.isReloading) {
        soundManager.playDryFire();
      }
      return;
    }

    statsRef.current.shotsFired++;
    const engine = engineRef.current;
    if (!engine) return;

    const currentLvl = currentLevel;
    engine.shootShotgun(player, chickensRef.current, currentLvl.map, (chicken, dmg) => {
      statsRef.current.shotsHit++;
      setHitMarkerTimer(0.25);
      soundManager.playMeatHit();

      // Damage chicken with comprehensive knockback, stagger, and kill handler
      damageChicken(chicken, dmg, player.x, player.y, currentLvl.map, () => {
        handleKillChicken(chicken);
      });
    });

    setHudPlayerState({ ...player });
    setHudStats({ ...statsRef.current });
  }, [gameView, currentLevel, handleKillChicken]);

  // Weapon Reload Trigger
  const triggerReload = useCallback(() => {
    const player = playerRef.current;
    if (player.isReloading || player.ammo >= player.maxAmmo || player.ammoReserve <= 0) return;

    player.isReloading = true;
    player.reloadTimer = 1.1;
    soundManager.playReload();
    setHudPlayerState({ ...player });
  }, []);

  // Handle Player Damage & Death Jumpscare Trigger
  const handlePlayerDamage = useCallback((damage: number) => {
    // VICTORY PROTECTION: Player CANNOT receive damage once victory is active or boss is defeated
    if (isVictoryRef.current || bossDefeatedSequenceRef.current.active || gameView === 'victory') {
      return;
    }

    const player = playerRef.current;
    if (player.health <= 0) return;

    player.health = Math.max(0, player.health - damage);
    player.damageFlash = 1.0;
    statsRef.current.damageTaken += damage;
    soundManager.playPlayerHurt();

    if (player.health <= 0) {
      if (isVictoryRef.current || bossDefeatedSequenceRef.current.active || gameView === 'victory') {
        player.health = 1;
        return;
      }
      soundManager.onPlayerDeath();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      // User directive: Trigger jumpscare with terrifying uncanny face, sound and "SÉ DÓNDE VIVES."
      setGameView('jumpscare');
    }

    setHudPlayerState({ ...player });
    setHudStats({ ...statsRef.current });
  }, [gameView]);

  // Mouse Look & Pointer Lock
  // User directive: Mouse Right -> Right, Mouse Left -> Left, Mouse Up -> Up, Mouse Down -> Down
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (gameView !== 'playing') return;
    if (document.pointerLockElement !== canvasRef.current) return;

    const sens = 0.0022 * settings.mouseSensitivity;
    // Positive rotSpeed rotates towards right (+planeX)
    const rotSpeed = e.movementX * sens;

    // Rotate player direction and camera plane
    const p = playerRef.current;
    const oldDirX = p.dirX;
    p.dirX = p.dirX * Math.cos(rotSpeed) - p.dirY * Math.sin(rotSpeed);
    p.dirY = oldDirX * Math.sin(rotSpeed) + p.dirY * Math.cos(rotSpeed);

    const oldPlaneX = p.planeX;
    p.planeX = p.planeX * Math.cos(rotSpeed) - p.planeY * Math.sin(rotSpeed);
    p.planeY = oldPlaneX * Math.sin(rotSpeed) + p.planeY * Math.cos(rotSpeed);

    // Pitch (vertical look): Mouse Up (movementY < 0) -> Increase pitch (look up)
    const pitchFactor = settings.invertY ? -1 : 1;
    const maxPitch = 90;
    p.pitch = Math.max(-maxPitch, Math.min(maxPitch, p.pitch - e.movementY * sens * 55 * pitchFactor));
  }, [gameView, settings.mouseSensitivity, settings.invertY]);

  // Mobile Touch Look
  const handleMobileLook = useCallback((dx: number, dy: number) => {
    if (gameView !== 'playing') return;
    const sens = 0.0035 * settings.mouseSensitivity;
    const rotSpeed = dx * sens;

    const p = playerRef.current;
    const oldDirX = p.dirX;
    p.dirX = p.dirX * Math.cos(rotSpeed) - p.dirY * Math.sin(rotSpeed);
    p.dirY = oldDirX * Math.sin(rotSpeed) + p.dirY * Math.cos(rotSpeed);

    const oldPlaneX = p.planeX;
    p.planeX = p.planeX * Math.cos(rotSpeed) - p.planeY * Math.sin(rotSpeed);
    p.planeY = oldPlaneX * Math.sin(rotSpeed) + p.planeY * Math.cos(rotSpeed);

    const pitchFactor = settings.invertY ? -1 : 1;
    const maxPitch = 90;
    p.pitch = Math.max(-maxPitch, Math.min(maxPitch, p.pitch - dy * sens * 25 * pitchFactor));
  }, [gameView, settings.mouseSensitivity, settings.invertY]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const code = (e.code || '').toLowerCase();
      keysRef.current[key] = true;
      if (code) keysRef.current[code] = true;

      // Pause toggle
      if (e.key === 'Escape' || key === 'p') {
        if (gameView === 'playing') {
          setGameView('paused');
          if (document.pointerLockElement) document.exitPointerLock();
        } else if (gameView === 'paused') {
          setGameView('playing');
        }
      }

      // Reload
      if (key === 'r' && gameView === 'playing') {
        triggerReload();
      }

      // Throw Bomb
      if ((key === 'g' || key === 'b') && gameView === 'playing') {
        triggerThrowBomb();
      }

      // Toggle Flashlight
      if (key === 'f' && gameView === 'playing') {
        playerRef.current.flashlight = !playerRef.current.flashlight;
        soundManager.playFlashlightClick(playerRef.current.flashlight);
        setHudPlayerState({ ...playerRef.current });
      }

      // Toggle Camera Mode (First Person <-> Third Person)
      if (key === 'v' && gameView === 'playing') {
        setSettings((prev) => {
          const nextMode = prev.cameraMode === 'third_person' ? 'first_person' : 'third_person';
          const updated = { ...prev, cameraMode: nextMode };
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {}
          soundManager.playButtonClick();
          return updated;
        });
      }

      // Jump (Space)
      if ((e.code === 'Space' || key === ' ') && gameView === 'playing') {
        e.preventDefault();
        const p = playerRef.current;
        if (p.isGrounded) {
          p.isGrounded = false;
          p.jumpVelocity = 4.8;
          p.landingBob = 0;
          soundManager.playPlayerJump();
        }
      }

      // Toggle Real-time Debug Diagnostics Overlay with F3 or ~
      if (e.key === 'F3' || e.key === '`' || e.key === '~') {
        e.preventDefault();
        setShowDebugOverlay((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = (e.code || '').toLowerCase();
      keysRef.current[key] = false;
      if (code) keysRef.current[code] = false;
    };

    const handleBlur = () => {
      // Clear held keys if window loses focus to avoid stuck controls
      keysRef.current = {};
      mobileInputRef.current = { forward: 0, strafe: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameView, triggerReload, triggerThrowBomb]);

  // Setup Canvas and Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new RaycasterEngine(canvasRef.current);
    engineRef.current = engine;

    const handleResize = () => {
      if (!canvasRef.current) return;
      const parent = canvasRef.current.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      engine.resize(w, h, settings.graphicsQuality);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [settings.graphicsQuality]);

  // Canvas Click for Pointer Lock
  const handleCanvasClick = () => {
    if (gameView === 'playing' && canvasRef.current && !isMobile) {
      if (document.pointerLockElement !== canvasRef.current) {
        canvasRef.current.requestPointerLock?.();
      }
      soundManager.init();
    }
  };

  // Mouse Move
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Main 60FPS Game Loop
  useEffect(() => {
    if (gameView !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastFootstepTimer = 0;
    let hudUpdateCounter = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Track FPS
      const instantFps = 1 / Math.max(0.001, dt);
      fpsSmoothRef.current = fpsSmoothRef.current * 0.92 + instantFps * 0.08;
      fpsTimerRef.current += dt;
      if (fpsTimerRef.current >= 0.25) {
        fpsTimerRef.current = 0;
        setFps(fpsSmoothRef.current);
      }

      const player = playerRef.current;
      const engine = engineRef.current;
      const currentLvl = currentLevelRef.current || getLevelById(currentLevelId);
      const map = currentLvl.map;

      // 1. Time accumulator
      statsRef.current.timeElapsed += dt;

      // 2. Hit marker timer
      setHitMarkerTimer((prev) => Math.max(0, prev - dt));

      // 3. Shooting timer & recoil recovery
      if (player.isShooting) {
        player.shootTimer -= dt;
        if (player.shootTimer <= 0) {
          player.isShooting = false;
        }
      }
      player.recoil = Math.max(0, player.recoil - dt * 3.5);
      player.muzzleFlash = Math.max(0, player.muzzleFlash - dt * 10);
      player.cameraShake = Math.max(0, player.cameraShake - dt * 6.5);

      // 4. Reload timer
      if (player.isReloading) {
        player.reloadTimer -= dt;
        if (player.reloadTimer <= 0) {
          player.isReloading = false;
          const needed = player.maxAmmo - player.ammo;
          const transfer = Math.min(needed, player.ammoReserve);
          player.ammo += transfer;
          player.ammoReserve -= transfer;
        }
      }

      // 5. Damage Flash Decay & Bomb Throw Timer
      if (player.damageFlash > 0) {
        player.damageFlash = Math.max(0, player.damageFlash - dt * 2.5);
      }
      if (player.isThrowingBomb) {
        player.throwBombTimer = (player.throwBombTimer || 0) - dt;
        if (player.throwBombTimer <= 0) {
          player.isThrowingBomb = false;
        }
      }

      // 6. Player Movement & Stamina
      const keys = keysRef.current;
      let forwardInput = 0;
      let strafeInput = 0;

      // Keyboard
      const isForward = !!(keys['w'] || keys['keyw'] || keys['arrowup']);
      const isBackward = !!(keys['s'] || keys['keys'] || keys['arrowdown']);
      const isLeft = !!(keys['a'] || keys['keya'] || keys['arrowleft']);
      const isRight = !!(keys['d'] || keys['keyd'] || keys['arrowright']);

      if (isForward) forwardInput += 1;
      if (isBackward) forwardInput -= 1;
      if (isLeft) strafeInput -= 1;
      if (isRight) strafeInput += 1;

      // Mobile joystick override
      if (mobileInputRef.current.forward !== 0 || mobileInputRef.current.strafe !== 0) {
        forwardInput = mobileInputRef.current.forward;
        strafeInput = mobileInputRef.current.strafe;
      }

      // Normalize diagonal
      const inputLen = Math.hypot(forwardInput, strafeInput);
      if (inputLen > 1) {
        forwardInput /= inputLen;
        strafeInput /= inputLen;
      }

      const isMoving = forwardInput !== 0 || strafeInput !== 0;
      const isShift = !!(keys['shift'] || keys['shiftleft'] || keys['shiftright']);

      // Stamina drain and regeneration
      if (isShift && isMoving && player.stamina > 5) {
        player.isSprinting = true;
        player.stamina = Math.max(0, player.stamina - dt * 28);
      } else {
        player.isSprinting = false;
        player.stamina = Math.min(player.maxStamina || 100, player.stamina + dt * 18);
      }

      const baseSpeed = player.isSprinting ? 5.5 : 3.6;
      const moveSpeed = baseSpeed * dt;
      let actualSpeed = 0;
      let hasCollision = false;

      const radius = 0.28;

      // Resolve any wall penetration immediately to prevent being trapped
      const depenetrated = resolvePlayerWallPenetration(player, radius, map);
      if (depenetrated) {
        hasCollision = true;
      }

      if (isMoving) {
        // True orthogonal strafe vector perpendicular to direction
        const strafeDirX = -player.dirY;
        const strafeDirY = player.dirX;

        let moveDirX = player.dirX * forwardInput + strafeDirX * strafeInput;
        let moveDirY = player.dirY * forwardInput + strafeDirY * strafeInput;

        const moveLen = Math.hypot(moveDirX, moveDirY);
        if (moveLen > 0.0001) {
          moveDirX /= moveLen;
          moveDirY /= moveLen;
        }

        const dx = moveDirX * moveSpeed;
        const dy = moveDirY * moveSpeed;

        const startX = player.x;
        const startY = player.y;

        // Wall collision with smooth sliding and diagonal corner protection
        let moved = false;
        if (dx !== 0 && dy !== 0 && isWalkable(player.x + dx, player.y + dy, radius, map)) {
          player.x += dx;
          player.y += dy;
          moved = true;
        } else {
          // Slide along X if open
          if (dx !== 0 && isWalkable(player.x + dx, player.y, radius, map)) {
            player.x += dx;
            moved = true;
          } else if (dx !== 0) {
            hasCollision = true;
          }

          // Slide along Y if open
          if (dy !== 0 && isWalkable(player.x, player.y + dy, radius, map)) {
            player.y += dy;
            moved = true;
          } else if (dy !== 0) {
            hasCollision = true;
          }
        }

        // If blocked by corner or acute angle, try partial steps
        if (!moved && (dx !== 0 || dy !== 0)) {
          if (dx !== 0 && isWalkable(player.x + dx * 0.5, player.y, radius, map)) {
            player.x += dx * 0.5;
            moved = true;
          }
          if (dy !== 0 && isWalkable(player.x, player.y + dy * 0.5, radius, map)) {
            player.y += dy * 0.5;
            moved = true;
          }
          if (!moved) {
            resolvePlayerWallPenetration(player, radius, map);
          }
        }

        const movedDist = Math.hypot(player.x - startX, player.y - startY);
        actualSpeed = dt > 0 ? movedDist / dt : 0;

        // Wall collision surface brush friction
        if (hasCollision && isMoving) {
          soundManager.playWallBrush();
        }

        // Head bobbing & footsteps
        player.walkTimer += dt;
        player.isWalking = true;
        if (settings.headBob) {
          player.headBobOffset = Math.sin(player.walkTimer * (player.isSprinting ? 14 : 9)) * (player.isSprinting ? 5 : 3);
        } else {
          player.headBobOffset = 0;
        }

        lastFootstepTimer += dt;
        const stepThreshold = player.isSprinting ? 0.32 : 0.44;
        if (lastFootstepTimer > stepThreshold) {
          lastFootstepTimer = 0;
          const currentSurface = soundManager.getCurrentSurface();
          soundManager.playFootstep(currentSurface, player.isSprinting);
        }
      } else {
        player.isWalking = false;
        player.headBobOffset = 0;
      }

      // 6.1. Player Vertical Jump & Landing Dynamics
      if (!player.isGrounded) {
        player.jumpVelocity = (player.jumpVelocity || 0) - 14.5 * dt; // Gravity
        player.jumpHeight = Math.max(0, (player.jumpHeight || 0) + player.jumpVelocity * dt);

        if (player.jumpHeight <= 0) {
          player.jumpHeight = 0;
          player.jumpVelocity = 0;
          player.isGrounded = true;
          player.landingBob = 0;
          if (player.anim) {
            player.anim.landTimer = 0.16;
          }
          const currentSurface = soundManager.getCurrentSurface();
          soundManager.playPlayerLand(currentSurface, (player.jumpVelocity || 0) < -8);
        }
      }

      // Keep landing camera bob strictly zero (no artificial camera bounce)
      player.landingBob = 0;

      // 7. Pickups Check (Ammo, Health, Bombs)
      for (let i = 0; i < pickupsRef.current.length; i++) {
        const pickup = pickupsRef.current[i];
        if (!pickup.collected) {
          const dist = Math.hypot(player.x - pickup.x, player.y - pickup.y);
          if (dist < 0.85) {
            pickup.collected = true;
            soundManager.playPickup(pickup.type);
            if (pickup.type === 'ammo') {
              player.ammoReserve += pickup.amount;
            } else if (pickup.type === 'health') {
              player.health = Math.min(player.maxHealth, player.health + pickup.amount);
            } else if (pickup.type === 'bomb') {
              player.bombs = Math.min(player.maxBombs || 4, (player.bombs || 0) + pickup.amount);
            }
          }
        }
      }

      // Timers & cinematic sequence updates
      if (bossIntroTimerRef.current > 0) {
        bossIntroTimerRef.current -= dt;
        if (bossIntroTimerRef.current <= 0) {
          setBossIntroTimer(0);
        }
      }
      if (exitWarningTimerRef.current > 0) {
        exitWarningTimerRef.current -= dt;
        if (exitWarningTimerRef.current <= 0) {
          setExitWarningTimer(0);
        }
      }

      // Boss Defeat Cinematic Sequence Progression
      if (bossDefeatedSequenceRef.current.active) {
        const bSeq = bossDefeatedSequenceRef.current;
        bSeq.timer -= dt;
        if (bSeq.timer <= 0) {
          if (bSeq.step === 'falling') {
            bSeq.step = 'silence';
            bSeq.timer = 1.6;
            soundManager.setVictorySequenceStage('silence');
            setBossDefeatedSeqState({ ...bSeq });
          } else if (bSeq.step === 'silence') {
            bSeq.step = 'lights_out';
            bSeq.timer = 1.2;
            soundManager.setVictorySequenceStage('lights_out');
            setBossDefeatedSeqState({ ...bSeq });
          } else if (bSeq.step === 'lights_out') {
            bSeq.step = 'text1';
            bSeq.timer = 2.4;
            soundManager.setVictorySequenceStage('text1');
            setBossDefeatedSeqState({ ...bSeq });
          } else if (bSeq.step === 'text1') {
            bSeq.step = 'text2';
            bSeq.timer = 2.4;
            soundManager.setVictorySequenceStage('text2');
            setBossDefeatedSeqState({ ...bSeq });
          } else if (bSeq.step === 'text2') {
            bSeq.step = 'text3';
            bSeq.timer = 2.6;
            soundManager.setVictorySequenceStage('text3');
            setBossDefeatedSeqState({ ...bSeq });
          } else if (bSeq.step === 'text3') {
            bSeq.active = false;
            setBossDefeatedSeqState({ ...bSeq });
            isVictoryRef.current = true;
            projectilesRef.current = [];
            bombsRef.current = [];
            shockwavesRef.current = [];
            chickensRef.current.forEach((c) => {
              if (c.state !== 'dead') {
                c.state = 'idle';
                c.vx = 0;
                c.vy = 0;
                c.attackCooldown = 999;
              }
            });
            setGameView('victory');
            if (document.pointerLockElement) document.exitPointerLock();
            return;
          }
        }
      }

      // 8. Exit Door Check
      const distToExit = Math.hypot(player.x - currentLvl.exitPosition.x, player.y - currentLvl.exitPosition.y);
      if (distToExit < 1.1) {
        const hasAliveBoss = chickensRef.current.some(
          (c) => (c.isBoss || c.type === 'boss') && c.state !== 'dead'
        );
        if (hasAliveBoss) {
          if (exitWarningTimerRef.current <= 0) {
            soundManager.playDoorLocked();
          }
          exitWarningTimerRef.current = 2.5;
          setExitWarningTimer(2.5);
        } else {
          isVictoryRef.current = true;
          projectilesRef.current = [];
          bombsRef.current = [];
          shockwavesRef.current = [];
          chickensRef.current.forEach((c) => {
            if (c.state !== 'dead') {
              c.state = 'idle';
              c.vx = 0;
              c.vy = 0;
              c.attackCooldown = 999;
            }
          });
          soundManager.playDoorUnlock();
          setGameView('victory');
          if (document.pointerLockElement) document.exitPointerLock();
          return;
        }
      }

      // 9. Update Bombs and Projectiles Physics
      if (engine) {
        updateBombs(
          bombsRef.current,
          chickensRef.current,
          player,
          currentLvl,
          dt,
          (x, y, z) => engine.spawnExplosion(x, y, z),
          (x, y, z) => engine.spawnFuseSparks(x, y, z),
          handleKillChicken,
          handlePlayerDamage,
          isVictoryRef.current
        );
      }

      updateProjectiles(projectilesRef.current, player, currentLvl, dt, handlePlayerDamage, isVictoryRef.current);

      // Dynamic enemy spawner ensures persistent danger and reinforces presence (halted during victory)
      if (!isVictoryRef.current) {
        updateDynamicSpawner(chickensRef.current, player, currentLvl, dt, fps);
      }

      // 10. Update Chickens AI & Audio Threat Evaluation
      updateChickens(
        chickensRef.current,
        player,
        currentLvl,
        dt,
        handlePlayerDamage,
        projectilesRef.current,
        (chicken) => {
          engine?.addBloodDecal(chicken.x, chicken.y, (chicken.isBoss || chicken.type === 'boss') ? 0.95 : 0.6);
        },
        shockwavesRef.current,
        (x, y) => {
          engine?.spawnBossSlamDebris(x, y);
        },
        isVictoryRef.current
      );

      // 10.1. Update Generative Analog Horror Music Engine (tape dropouts, exploration tension, music box)
      soundManager.update(dt);

      // 11. Update Particles & Render 3D Frame
      if (engine) {
        const maxParticles = settings.effectsQuality === 'low' ? 15 : (settings.effectsQuality === 'med' ? 40 : 80);
        engine.updateParticles(dt, maxParticles);
        engine.render(
          player,
          chickensRef.current,
          pickupsRef.current,
          currentLvl,
          settings,
          dt,
          bombsRef.current,
          projectilesRef.current,
          shockwavesRef.current
        );
      }

      // 11. Sync HUD State periodically (every 4 frames for minimal overhead)
      hudUpdateCounter++;
      if (hudUpdateCounter % 4 === 0) {
        setHudPlayerState({ ...player });
        setHudStats({ ...statsRef.current });
        if (showDebugOverlay) {
          setDebugData({
            playerX: player.x,
            playerY: player.y,
            speed: actualSpeed,
            inputs: {
              w: !!(keys['w'] || keys['arrowup'] || mobileInputRef.current.forward > 0.1),
              a: !!(keys['a'] || keys['arrowleft'] || mobileInputRef.current.strafe < -0.1),
              s: !!(keys['s'] || keys['arrowdown'] || mobileInputRef.current.forward < -0.1),
              d: !!(keys['d'] || keys['arrowright'] || mobileInputRef.current.strafe > 0.1),
              shift: isShift,
            },
            collision: hasCollision || !isWalkable(player.x, player.y, radius, map),
            paused: gameView === 'paused',
            gameState: `${gameView.toUpperCase()} (Lvl ${currentLvl.id})`,
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameView, currentLevelId, settings, handlePlayerDamage, showDebugOverlay]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D Raycasting Canvas */}
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onClick={handleCanvasClick}
        onMouseDown={(e) => {
          if (gameView !== 'playing') return;
          if (e.button === 0) {
            triggerShoot();
          } else if (e.button === 2) {
            triggerThrowBomb();
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={`absolute inset-0 w-full h-full object-cover cursor-crosshair focus:outline-none ${
          gameView === 'menu' ? 'filter brightness-40 blur-xs' : ''
        }`}
      />

      {/* CRT Scanline and Vignette Effects */}
      <div className="crt-overlay absolute inset-0 pointer-events-none z-10" />
      <div className="vignette absolute inset-0 pointer-events-none z-10" />

      {/* VHS Analog Horror Distortion Overlay (Líneas de seguimiento, jitter de pantalla y OSD de cinta maldita) */}
      {settings.vhsFilter !== false && (
        <VhsDistortionFilter
          damageFlash={hudPlayerState.damageFlash}
          isBossActive={chickensRef.current.some((c) => (c.isBoss || c.type === 'boss') && c.state !== 'dead')}
          timeElapsed={hudStats.timeElapsed}
          playerHealth={hudPlayerState.health}
          playerMaxHealth={hudPlayerState.maxHealth}
          quality={settings.effectsQuality}
        />
      )}

      {/* IN-GAME HUD */}
      {gameView === 'playing' && (
        <>
          <HUD
            player={hudPlayerState}
            stats={hudStats}
            totalChickens={chickensRef.current.length}
            hitMarkerTimer={hitMarkerTimer}
            levelId={currentLevel.id}
            levelName={currentLevel.name}
            isPointerLocked={isPointerLocked}
            fps={fps}
            showFPS={settings.showFPS}
            showDebugOverlay={showDebugOverlay}
            debugData={debugData}
            onToggleDebug={() => setShowDebugOverlay((prev) => !prev)}
            bossHealth={(() => {
              const b = chickensRef.current.find((c) => c.isBoss || c.type === 'boss');
              return b && b.state !== 'dead' ? b.health : undefined;
            })()}
            bossMaxHealth={(() => {
              const b = chickensRef.current.find((c) => c.isBoss || c.type === 'boss');
              return b ? b.maxHealth : 900;
            })()}
            bossPhase={(() => {
              const b = chickensRef.current.find((c) => c.isBoss || c.type === 'boss');
              return b ? (b.bossPhase || 1) : 1;
            })()}
            bossDist={(() => {
              const b = chickensRef.current.find((c) => c.isBoss || c.type === 'boss');
              return b ? b.distToPlayer : undefined;
            })()}
            bossSpawned={chickensRef.current.some((c) => c.isBoss || c.type === 'boss')}
            bossRage={(() => {
              const b = chickensRef.current.find((c) => c.isBoss || c.type === 'boss');
              return b ? (b.rageIntensity ?? 0) > 0.1 : false;
            })()}
            onPauseClick={() => {
              setGameView('paused');
              if (document.pointerLockElement) document.exitPointerLock();
            }}
            onToggleFlashlight={() => {
              playerRef.current.flashlight = !playerRef.current.flashlight;
              soundManager.playButtonClick();
              setHudPlayerState({ ...playerRef.current });
            }}
          />

          {/* Boss Intro Cinematic Banner */}
          {bossIntroTimer > 0 && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center animate-fade-in w-[90%] max-w-lg">
              <div className="bg-red-950/95 border-2 border-red-600 px-6 py-4 rounded-lg shadow-[0_0_40px_rgba(220,38,38,0.8)] backdrop-blur-md animate-pulse">
                <div className="text-red-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                  <Skull className="w-4 h-4 text-red-500 animate-bounce" />
                  <span>ALERTA MÁXIMA — JEFE FINAL</span>
                  <Skull className="w-4 h-4 text-red-500 animate-bounce" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-creep text-red-500 tracking-widest uppercase mb-1">
                  GALLARDO
                </h2>
                <div className="text-xs font-mono text-amber-300 tracking-wider mb-1">
                  EL REY MUTADO DEL CORRAL
                </div>
                <p className="text-[11px] font-mono text-stone-300">
                  Usa los monolitos de cobertura. Esquiva sus embestidas colosales y dispara cuando se agote.
                </p>
              </div>
            </div>
          )}

          {/* Sealed Exit Gate Warning */}
          {exitWarningTimer > 0 && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center animate-bounce w-[90%] max-w-md">
              <div className="bg-red-950/95 border-2 border-red-500 px-4 py-2.5 rounded shadow-[0_0_30px_rgba(239,68,68,0.8)] backdrop-blur-md flex items-center justify-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                <p className="text-xs sm:text-sm font-bold text-red-200 font-mono tracking-wider text-left">
                  ¡PORTAL SELLADO! DEBES DERROTAR A GALLARDO PARA ESCAPAR
                </p>
              </div>
            </div>
          )}

          {/* Boss Defeated Cinematic Sequence (Gallardo falls -> Silence -> Lights out -> Gallardo ha caído -> Has sobrevivido -> Blood of the bird) */}
          {bossDefeatedSeqState.active && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none select-none transition-all duration-700 font-tech">
              {/* Screen blackening / lights out */}
              <div
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  bossDefeatedSeqState.step === 'falling'
                    ? 'bg-red-950/40'
                    : bossDefeatedSeqState.step === 'silence'
                    ? 'bg-black/85'
                    : 'bg-black'
                }`}
              />

              {/* Step: TEXT 1 — GALLARDO HA CAÍDO */}
              {bossDefeatedSeqState.step === 'text1' && (
                <div className="relative z-10 text-center animate-fade-in px-4">
                  <div className="inline-flex items-center gap-2 text-red-500 text-sm font-mono tracking-widest uppercase mb-3 animate-pulse">
                    <Flame className="w-5 h-5 text-red-500" />
                    <span>EL COLOSO HA SIDO ELIMINADO</span>
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <h1 className="text-4xl sm:text-7xl font-creep text-red-600 tracking-widest drop-shadow-[0_0_35px_rgba(220,38,38,0.9)]">
                    GALLARDO HA CAÍDO
                  </h1>
                </div>
              )}

              {/* Step: TEXT 2 — HAS SOBREVIVIDO */}
              {bossDefeatedSeqState.step === 'text2' && (
                <div className="relative z-10 text-center animate-fade-in px-4">
                  <h1 className="text-4xl sm:text-7xl font-creep text-emerald-400 tracking-widest drop-shadow-[0_0_35px_rgba(16,185,129,0.9)] mb-2">
                    HAS SOBREVIVIDO
                  </h1>
                  <p className="text-xs sm:text-sm font-mono text-stone-400 tracking-widest uppercase">
                    LA PESADILLA HA TERMINADO
                  </p>
                </div>
              )}

              {/* Step: TEXT 3 — BLOOD OF THE BIRD */}
              {bossDefeatedSeqState.step === 'text3' && (
                <div className="relative z-10 text-center animate-fade-in px-4">
                  <h1 className="text-5xl sm:text-8xl font-creep text-red-500 tracking-widest drop-shadow-[0_0_50px_rgba(239,68,68,1)] mb-3">
                    BLOOD OF THE BIRD
                  </h1>
                  <p className="text-xs sm:text-base font-mono text-amber-300 tracking-widest uppercase">
                    TODOS LOS PISOS HAN SIDO PURGADOS
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mobile On-Screen Controls */}
          {isMobile && (
            <MobileControls
              onMove={(f, s) => {
                mobileInputRef.current = { forward: f, strafe: s };
              }}
              onLook={handleMobileLook}
              onShoot={triggerShoot}
              onReload={triggerReload}
              onThrowBomb={triggerThrowBomb}
              onJump={() => {
                const p = playerRef.current;
                if (p.isGrounded) {
                  p.isGrounded = false;
                  p.jumpVelocity = 4.8;
                  p.landingBob = 0;
                  soundManager.playPlayerJump();
                }
              }}
              onToggleCamera={() => {
                setSettings((prev) => {
                  const nextMode = prev.cameraMode === 'third_person' ? 'first_person' : 'third_person';
                  const updated = { ...prev, cameraMode: nextMode };
                  try {
                    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
                  } catch (e) {}
                  soundManager.playButtonClick();
                  return updated;
                });
              }}
              cameraMode={settings.cameraMode}
              onPause={() => setGameView('paused')}
            />
          )}
        </>
      )}

      {/* START MENU */}
      {gameView === 'menu' && (
        <StartMenu
          onPlay={handlePlay}
          onWatchIntro={handleWatchCinematic}
          onOpenLevelSelect={() => {
            setPreviousView('menu');
            setGameView('levelselect');
          }}
          onOpenSettings={() => {
            setPreviousView('menu');
            setGameView('settings');
          }}
          onOpenControls={() => {
            setPreviousView('menu');
            setGameView('controls');
          }}
          onOpenCredits={() => {
            setPreviousView('menu');
            setGameView('credits');
          }}
        />
      )}

      {/* INTRO CINEMATIC (Real-time cinematic sequence on JUGAR) */}
      {gameView === 'cinematic' && (
        <IntroCinematic
          onFinish={handleFinishCinematic}
          onSkip={handleSkipCinematic}
        />
      )}

      {/* LEVEL SELECT MENU (8 LEVELS) */}
      {gameView === 'levelselect' && (
        <LevelSelectMenu
          currentLevelId={currentLevelId}
          onSelectLevel={(id) => {
            initLevel(id);
            setGameView('playing');
            soundManager.startMusic();
          }}
          onBack={() => setGameView(previousView)}
        />
      )}

      {/* SETTINGS MENU */}
      {gameView === 'settings' && (
        <SettingsMenu
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            try {
              localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
            } catch (e) {}
            updateCameraPlane(newSettings.fov);
            if (engineRef.current && canvasRef.current) {
              const parent = canvasRef.current.parentElement;
              engineRef.current.resize(
                parent ? parent.clientWidth : window.innerWidth,
                parent ? parent.clientHeight : window.innerHeight,
                newSettings.graphicsQuality
              );
            }
          }}
          onBack={() => setGameView(previousView)}
        />
      )}

      {/* CONTROLS SCREEN */}
      {gameView === 'controls' && (
        <ControlsMenu onBack={() => setGameView(previousView)} />
      )}

      {/* CREDITS SCREEN */}
      {gameView === 'credits' && (
        <CreditsMenu onBack={() => setGameView(previousView)} />
      )}

      {/* PAUSE MENU */}
      {gameView === 'paused' && (
        <PauseMenu
          onResume={() => setGameView('playing')}
          onLevelSelect={() => {
            setPreviousView('paused');
            setGameView('levelselect');
          }}
          onOpenSettings={() => {
            setPreviousView('paused');
            setGameView('settings');
          }}
          onRestartLevel={() => {
            initLevel(currentLevelId);
            setGameView('playing');
          }}
          onMainMenu={() => setGameView('menu')}
        />
      )}

      {/* GAME OVER SCREEN */}
      {gameView === 'gameover' && (
        <GameOverModal
          onRetry={() => {
            initLevel(currentLevelId);
            setGameView('playing');
          }}
          onLevelSelect={() => {
            setPreviousView('gameover');
            setGameView('levelselect');
          }}
          onMainMenu={() => setGameView('menu')}
        />
      )}

      {/* VICTORY / LEVEL COMPLETE */}
      {gameView === 'victory' && (
        <VictoryModal
          currentLevelId={currentLevelId}
          stats={statsRef.current}
          player={playerRef.current}
          onNextLevel={() => {
            const nextLvl = Math.min(ALL_LEVELS.length, currentLevelId + 1);
            initLevel(nextLvl);
            setGameView('playing');
            soundManager.startMusic();
          }}
          onRestartLevel={() => {
            initLevel(currentLevelId);
            setGameView('playing');
            soundManager.startMusic();
          }}
          onLevelSelect={() => {
            setPreviousView('victory');
            setGameView('levelselect');
          }}
          onMainMenu={() => setGameView('menu')}
        />
      )}

      {/* DEATH JUMPSCARE SCREEN ("SÉ DÓNDE VIVES.") */}
      {gameView === 'jumpscare' && (
        <Jumpscare
          onComplete={() => {
            setGameView('gameover');
          }}
        />
      )}
    </div>
  );
}
