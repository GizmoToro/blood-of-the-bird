import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerRenderer } from '../game/playerRenderer';
import { Player, PlayerAnimState } from '../types';
import { cinematicAudio } from '../game/cinematicAudio';
import { FastForward, Volume2, Radio } from 'lucide-react';

interface IntroCinematicProps {
  onFinish: () => void;
  onSkip: () => void;
}

interface DialogueSubtitle {
  text: string;
  sender: string;
  startTime: number;
  endTime: number;
}

const DIALOGUES: DialogueSubtitle[] = [
  {
    sender: 'SARGENTO PATO',
    text: '¿Qué fue eso...?',
    startTime: 6.8,
    endTime: 9.6,
  },
  {
    sender: 'SARGENTO PATO',
    text: '¿Dónde... estoy?',
    startTime: 17.5,
    endTime: 19.3,
  },
  {
    sender: 'SARGENTO PATO',
    text: 'Esto no estaba aquí...',
    startTime: 19.5,
    endTime: 21.8,
  },
];

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onFinish, onSkip }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const playerRendererRef = useRef<PlayerRenderer | null>(null);
  const isFinishedRef = useRef<boolean>(false);

  // Audio trigger tracking refs to ensure sounds play exactly once per scene
  const audioTriggeredRef = useRef<{
    cityStart: boolean;
    wallSound1: boolean;
    radio1: boolean;
    wallSound2: boolean;
    glitch: boolean;
    backroomsHum: boolean;
    radio2: boolean;
    radio3: boolean;
    shotgunRack: boolean;
  }>({
    cityStart: false,
    wallSound1: false,
    radio1: false,
    wallSound2: false,
    glitch: false,
    backroomsHum: false,
    radio2: false,
    radio3: false,
    shotgunRack: false,
  });

  const lastStepTimeRef = useRef<number>(0);

  // UI State for Subtitles & Visual Indicators
  const [currentSubtitle, setCurrentSubtitle] = useState<{ sender: string; text: string } | null>(null);
  const [currentLocationStamp, setCurrentLocationStamp] = useState<string | null>(null);

  // Handle Clean Skip
  const handleSkip = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    cinematicAudio.stopAll(150);
    onSkip();
  }, [onSkip]);

  // Handle Natural Completion
  const handleComplete = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    cinematicAudio.stopAll(250);
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    // 1. Initialize audio & player renderer
    cinematicAudio.init();
    playerRendererRef.current = new PlayerRenderer();

    // 2. Mock player state for cinematic rig
    const duckPlayer: Player = {
      x: 0,
      y: 0,
      dirX: 0,
      dirY: 1,
      planeX: 0.66,
      planeY: 0,
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
      isWalking: true,
      isSprinting: false,
      stamina: 100,
      maxStamina: 100,
      flashlight: false,
      flashlightFlicker: 0,
      flashlightBattery: 100,
      headBobOffset: 0,
      isGrounded: true,
      jumpHeight: 0,
      jumpVelocity: 0,
      landingBob: 0,
      bombs: 2,
      maxBombs: 4,
      isThrowingBomb: false,
      throwBombTimer: 0,
      anim: {
        state: 'walk',
        previousState: 'idle',
        stateTimer: 0,
        blendFactor: 1.0,
        walkCycle: 0,
        facingAngle: Math.PI / 2,
        squashStretch: 1.0,
        shellEjectTimer: 0,
        hitReactionTimer: 0,
      },
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Audio triggers
    cinematicAudio.startCityAtmosphere();
    audioTriggeredRef.current.cityStart = true;

    // Cinematic Animation Loop
    const renderLoop = (timestamp: number) => {
      if (isFinishedRef.current) return;

      if (!startTimeRef.current) startTimeRef.current = timestamp;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;

      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      const width = canvas.width;
      const height = canvas.height;

      // --- SEQUENCE TIMELINE & AUDIO ORCHESTRATION ---

      // Step footstep sounds during walking scenes
      if (duckPlayer.isWalking && elapsed < 5.5) {
        if (elapsed - lastStepTimeRef.current > 0.44) {
          lastStepTimeRef.current = elapsed;
          cinematicAudio.playFootstep(true);
        }
      }

      // 0.0s – 5.5s: Scene 1 — The Night City
      if (elapsed < 5.5) {
        duckPlayer.isWalking = true;
        if (duckPlayer.anim) duckPlayer.anim.state = 'walk';
        if (elapsed >= 0.8 && elapsed <= 4.2) {
          setCurrentLocationStamp('SECTOR INDUSTRIAL — 03:42 AM // CALLEJÓN OESTE');
        } else {
          setCurrentLocationStamp(null);
        }
      }
      // 5.5s – 7.5s: Scene 2 — Strange Sound in Wall
      else if (elapsed >= 5.5 && elapsed < 7.5) {
        duckPlayer.isWalking = false;
        if (duckPlayer.anim) duckPlayer.anim.state = 'idle';

        if (!audioTriggeredRef.current.wallSound1) {
          audioTriggeredRef.current.wallSound1 = true;
          cinematicAudio.triggerWallSound(0.65);
        }

        if (elapsed >= 6.8 && !audioTriggeredRef.current.radio1) {
          audioTriggeredRef.current.radio1 = true;
          cinematicAudio.playRadioSquelch();
        }
      }
      // 7.5s – 10.0s: Approaching the wall
      else if (elapsed >= 7.5 && elapsed < 10.0) {
        duckPlayer.isWalking = true;
        if (duckPlayer.anim) duckPlayer.anim.state = 'walk';
        if (elapsed - lastStepTimeRef.current > 0.52) {
          lastStepTimeRef.current = elapsed;
          cinematicAudio.playFootstep(true);
        }
      }
      // 10.0s – 14.0s: Scene 3 — Touching wall & Noclip penetration
      else if (elapsed >= 10.0 && elapsed < 14.0) {
        duckPlayer.isWalking = false;
        if (duckPlayer.anim) duckPlayer.anim.state = 'cinematic_wall_touch';

        if (!audioTriggeredRef.current.wallSound2) {
          audioTriggeredRef.current.wallSound2 = true;
          cinematicAudio.triggerWallSound(1.0);
        }
      }
      // 14.0s – 16.5s: Scene 4 — Reality Breakdown / Glitch / Fracture
      else if (elapsed >= 14.0 && elapsed < 16.5) {
        duckPlayer.isWalking = false;
        if (duckPlayer.anim) duckPlayer.anim.state = 'hit';

        if (!audioTriggeredRef.current.glitch) {
          audioTriggeredRef.current.glitch = true;
          cinematicAudio.playGlitchBreakdown();
        }
      }
      // 16.5s – 20.5s: Scene 5 — Backrooms Reveal & Dazed reaction
      else if (elapsed >= 16.5 && elapsed < 20.5) {
        duckPlayer.isWalking = false;
        if (duckPlayer.anim) duckPlayer.anim.state = 'cinematic_dazed';

        if (!audioTriggeredRef.current.backroomsHum) {
          audioTriggeredRef.current.backroomsHum = true;
          cinematicAudio.startBackroomsHum();
        }

        if (elapsed >= 17.5 && !audioTriggeredRef.current.radio2) {
          audioTriggeredRef.current.radio2 = true;
          cinematicAudio.playRadioSquelch();
        }
        if (elapsed >= 19.5 && !audioTriggeredRef.current.radio3) {
          audioTriggeredRef.current.radio3 = true;
          cinematicAudio.playRadioSquelch();
        }
      }
      // 20.5s – 22.0s: Scene 6 — Raising & Racking Shotgun
      else if (elapsed >= 20.5 && elapsed < 22.0) {
        duckPlayer.isWalking = false;
        if (duckPlayer.anim) duckPlayer.anim.state = 'cinematic_pump';

        if (!audioTriggeredRef.current.shotgunRack) {
          audioTriggeredRef.current.shotgunRack = true;
          cinematicAudio.playShotgunRack();
        }
      }
      // 22.0s – 24.2s: Scene 7 — Pull back and transition zoom to 1st person
      else if (elapsed >= 22.0 && elapsed < 24.2) {
        duckPlayer.isWalking = false;
        if (duckPlayer.anim) duckPlayer.anim.state = 'idle';
      }
      // 24.2s: Complete cinematic!
      else if (elapsed >= 24.2) {
        handleComplete();
        return;
      }

      // Check current subtitle text
      const activeSubtitle = DIALOGUES.find((d) => elapsed >= d.startTime && elapsed <= d.endTime);
      setCurrentSubtitle(activeSubtitle ? { sender: activeSubtitle.sender, text: activeSubtitle.text } : null);

      // --- RENDERING CANVAS PIPELINE ---
      ctx.clearRect(0, 0, width, height);

      if (elapsed < 16.5) {
        // === STAGE 1: NIGHT CITY STREET & WALL ANOMALY ===
        drawCityScene(ctx, width, height, elapsed, duckPlayer, dt);

        // Reality Glitch Shader overlay in Scene 4
        if (elapsed >= 13.5 && elapsed < 16.5) {
          const glitchIntensity = Math.min(1.0, (elapsed - 13.5) / 1.5);
          drawRealityGlitch(ctx, width, height, glitchIntensity, elapsed);
        }
      } else {
        // === STAGE 2: THE BACKROOMS INFINITE CORRIDORS ===
        const backroomsElapsed = elapsed - 16.5;
        drawBackroomsScene(ctx, width, height, backroomsElapsed, duckPlayer, dt, elapsed);
      }

      // CRT Scanlines & Analog Distortion
      drawAnalogCrtVignette(ctx, width, height, elapsed);

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
      cinematicAudio.stopAll(100);
    };
  }, [handleComplete]);

  // --- RENDERER HELPER: NIGHT CITY ALLEYWAY ---
  const drawCityScene = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    elapsed: number,
    duck: Player,
    dt: number
  ) => {
    // 1. Dark Rainy Sky & Smog Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGrad.addColorStop(0, '#04070a');
    skyGrad.addColorStop(0.6, '#081119');
    skyGrad.addColorStop(1, '#0c1a24');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.55);

    // Distant city silhouette buildings
    ctx.fillStyle = '#060a0f';
    const buildingWidths = [w * 0.12, w * 0.15, w * 0.09, w * 0.18, w * 0.14, w * 0.2];
    let curX = 0;
    for (let i = 0; i < buildingWidths.length; i++) {
      const bw = buildingWidths[i];
      const bh = h * (0.28 + (i % 3) * 0.08);
      ctx.fillRect(curX, h * 0.55 - bh, bw, bh);

      // Flickering yellow/cyan office windows
      ctx.fillStyle = (i + Math.floor(elapsed * 2)) % 4 === 0 ? 'rgba(234, 179, 8, 0.25)' : 'rgba(14, 165, 233, 0.15)';
      for (let wy = h * 0.55 - bh + 15; wy < h * 0.55 - 15; wy += 22) {
        for (let wx = curX + 12; wx < curX + bw - 12; wx += 20) {
          if ((wx * wy) % 5 > 1) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
      ctx.fillStyle = '#060a0f';
      curX += bw;
    }

    // 2. Wet Asphalt Street (Vanishing perspective floor)
    const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    floorGrad.addColorStop(0, '#0a0d11');
    floorGrad.addColorStop(0.3, '#10161c');
    floorGrad.addColorStop(1, '#07090c');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Wet puddles with specular light reflections
    const puddleGrad = ctx.createRadialGradient(w * 0.5, h * 0.78, 10, w * 0.5, h * 0.78, w * 0.4);
    puddleGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
    puddleGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.08)');
    puddleGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = puddleGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.82, w * 0.45, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Right-hand Brick Wall (The anomalous wall)
    const wallLeftX = w * 0.62;
    const wallGrad = ctx.createLinearGradient(wallLeftX, 0, w, 0);
    wallGrad.addColorStop(0, '#1c1917');
    wallGrad.addColorStop(0.5, '#292524');
    wallGrad.addColorStop(1, '#141210');
    ctx.fillStyle = wallGrad;

    ctx.beginPath();
    ctx.moveTo(wallLeftX, h * 0.15);
    ctx.lineTo(w, h * 0.05);
    ctx.lineTo(w, h);
    ctx.lineTo(wallLeftX, h * 0.88);
    ctx.closePath();
    ctx.fill();

    // Brick mortar lines
    ctx.strokeStyle = 'rgba(68, 64, 60, 0.6)';
    ctx.lineWidth = 1;
    for (let y = h * 0.15; y < h; y += 18) {
      ctx.beginPath();
      ctx.moveTo(wallLeftX, y);
      ctx.lineTo(w, y - 20);
      ctx.stroke();
    }

    // 4. Wall Anomaly Ripple / Dimensional Distortion (Scene 2 & 3)
    if (elapsed >= 5.5 && elapsed < 14.5) {
      const rippleTime = elapsed * 5;
      const rippleX = wallLeftX + (w - wallLeftX) * 0.22;
      const rippleY = h * 0.58;
      const rippleRadius = 45 + Math.sin(rippleTime) * 15;

      ctx.save();
      const rippleGrad = ctx.createRadialGradient(rippleX, rippleY, 5, rippleX, rippleY, rippleRadius);
      rippleGrad.addColorStop(0, 'rgba(234, 179, 8, 0.65)'); // Golden-yellow Backrooms dimensional bleed!
      rippleGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.35)');
      rippleGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rippleGrad;
      ctx.beginPath();
      ctx.arc(rippleX, rippleY, rippleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dimensional rift seam
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rippleX - 2, rippleY - 25);
      ctx.lineTo(rippleX + Math.sin(rippleTime * 2) * 4, rippleY + 25);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Streetlamp with Volumetric Cone
    const lampX = w * 0.28;
    const lampY = h * 0.32;

    // Volumetric yellow light cone
    ctx.save();
    const lightCone = ctx.createLinearGradient(lampX, lampY, lampX, h * 0.88);
    lightCone.addColorStop(0, 'rgba(251, 191, 36, 0.38)');
    lightCone.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
    lightCone.addColorStop(1, 'transparent');
    ctx.fillStyle = lightCone;
    ctx.beginPath();
    ctx.moveTo(lampX - 8, lampY);
    ctx.lineTo(lampX + 8, lampY);
    ctx.lineTo(lampX + w * 0.18, h * 0.88);
    ctx.lineTo(lampX - w * 0.18, h * 0.88);
    ctx.closePath();
    ctx.fill();

    // Lamp pole
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lampX, lampY);
    ctx.lineTo(lampX, h * 0.72);
    ctx.stroke();

    // Lamp head & bulb
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lampX, lampY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Camera Position & Duck Coordinates
    // Dynamic cinematic camera: tracking shot walking towards wall
    let duckScreenX = w * 0.42;
    let duckScreenY = h * 0.76;
    let duckScale = h * 0.46;

    if (elapsed < 5.5) {
      // Walking down the wet street
      duckScreenX = w * 0.38 + (elapsed / 5.5) * (w * 0.08);
      duckScreenY = h * 0.76;
    } else if (elapsed >= 5.5 && elapsed < 7.5) {
      // Stopping and looking at wall
      duckScreenX = w * 0.46;
      duckScreenY = h * 0.76;
    } else if (elapsed >= 7.5 && elapsed < 10.0) {
      // Cautiously approaching wall
      const approachProgress = (elapsed - 7.5) / 2.5;
      duckScreenX = w * 0.46 + approachProgress * (w * 0.14);
      duckScreenY = h * 0.76 - approachProgress * (h * 0.04);
      duckScale = h * (0.46 + approachProgress * 0.08);
    } else if (elapsed >= 10.0 && elapsed < 14.0) {
      // Standing right against the wall touching it
      duckScreenX = w * 0.60;
      duckScreenY = h * 0.72;
      duckScale = h * 0.54;
    } else if (elapsed >= 14.0) {
      // Absorbed into the dimensional fracture
      const pull = (elapsed - 14.0) / 2.5;
      duckScreenX = w * 0.60 + pull * (w * 0.08);
      duckScreenY = h * 0.72 - pull * (h * 0.1);
      duckScale = h * (0.54 * (1 - pull * 0.4));
    }

    // 7. Render White Anthro Duck Commando with Shotgun
    if (playerRendererRef.current) {
      playerRendererRef.current.renderPlayer(
        ctx,
        duck,
        duckScreenX,
        duckScreenY,
        duckScale,
        dt,
        elapsed >= 15.5 ? Math.max(0, 1.0 - (elapsed - 15.5) / 0.8) : 1.0
      );
    }

    // 8. If duck touches wall (Scene 3): Clip the left wing penetrating the wall
    if (elapsed >= 11.2 && elapsed < 14.0) {
      // Draw golden boundary ripple at exact contact point
      ctx.save();
      const contactX = duckScreenX + duckScale * 0.14;
      const contactY = duckScreenY - duckScale * 0.12;

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(contactX, contactY, 18, 38, -0.2, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent fading wing penetrating through the wall
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.beginPath();
      ctx.ellipse(contactX + 12, contactY, 14, 28, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Light rain particles
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 97 + elapsed * 700) % w;
      const ry = (i * 53 + elapsed * 900) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 12);
      ctx.stroke();
    }
  };

  // --- RENDERER HELPER: THE BACKROOMS LEVEL 1 ---
  const drawBackroomsScene = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    backroomsElapsed: number,
    duck: Player,
    dt: number,
    totalElapsed: number
  ) => {
    // 1. Perspective Repeating Mono-Yellow Walls & Corridors
    // Horizon line
    const horizonY = h * 0.48;

    // Sickly Yellow Ceiling with Fluorescent Panels
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    ceilingGrad.addColorStop(0, '#363212');
    ceilingGrad.addColorStop(0.7, '#4d4617');
    ceilingGrad.addColorStop(1, '#635b1d');
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Fluorescent Light Tubes on Ceiling (Grid perspective)
    const tubes = [w * 0.25, w * 0.5, w * 0.75];
    for (const tx of tubes) {
      const flicker = Math.sin(totalElapsed * 24 + tx) > 0.94 ? 0.2 : 0.85;

      ctx.save();
      ctx.fillStyle = `rgba(254, 252, 232, ${flicker})`;
      ctx.shadowColor = 'rgba(250, 204, 21, 0.85)';
      ctx.shadowBlur = 35;
      ctx.fillRect(tx - 25, horizonY * 0.22, 50, 6);

      // Light glow beam onto walls and floor
      const beamGrad = ctx.createLinearGradient(tx, horizonY * 0.22, tx, h);
      beamGrad.addColorStop(0, `rgba(254, 240, 138, ${0.15 * flicker})`);
      beamGrad.addColorStop(0.7, `rgba(234, 179, 8, ${0.08 * flicker})`);
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 35, horizonY * 0.22);
      ctx.lineTo(tx + 35, horizonY * 0.22);
      ctx.lineTo(tx + 140, h);
      ctx.lineTo(tx - 140, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Damp Stained Carpet (Perspective floor)
    const carpetGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    carpetGrad.addColorStop(0, '#26220b');
    carpetGrad.addColorStop(0.4, '#383212');
    carpetGrad.addColorStop(1, '#4a4216');
    ctx.fillStyle = carpetGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Carpet damp stains
    ctx.fillStyle = 'rgba(18, 15, 6, 0.45)';
    ctx.beginPath();
    ctx.ellipse(w * 0.35, h * 0.78, w * 0.22, h * 0.08, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.65, h * 0.84, w * 0.28, h * 0.09, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // 3. Repetitive Monochromatic Yellow Wallpaper Walls (Classic Backrooms Architecture)
    // Left Corridor Wall
    ctx.fillStyle = '#947f2b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.28, horizonY * 0.4);
    ctx.lineTo(w * 0.28, horizonY + (h - horizonY) * 0.45);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Wallpaper stripes texture
    ctx.strokeStyle = 'rgba(120, 102, 33, 0.7)';
    ctx.lineWidth = 2;
    for (let x = 0; x < w * 0.28; x += 16) {
      const p = x / (w * 0.28);
      const topY = p * horizonY * 0.4;
      const botY = h - p * ((h - horizonY) * 0.55);
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, botY);
      ctx.stroke();
    }

    // Right Corridor Wall
    ctx.fillStyle = '#826f25';
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.72, horizonY * 0.4);
    ctx.lineTo(w * 0.72, horizonY + (h - horizonY) * 0.45);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    for (let x = w; x > w * 0.72; x -= 16) {
      const p = (w - x) / (w * 0.28);
      const topY = p * horizonY * 0.4;
      const botY = h - p * ((h - horizonY) * 0.55);
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, botY);
      ctx.stroke();
    }

    // Back Endless Hallway Aperture (600 million square miles of identical rooms)
    ctx.fillStyle = '#6b5a1c';
    ctx.fillRect(w * 0.28, horizonY * 0.4, w * 0.44, horizonY + (h - horizonY) * 0.45 - horizonY * 0.4);

    // Deep distant doorway openings
    ctx.fillStyle = '#2d260a';
    ctx.fillRect(w * 0.44, horizonY * 0.55, w * 0.12, horizonY * 0.6);

    // Baseboard trim
    ctx.fillStyle = '#3a3212';
    ctx.fillRect(w * 0.28, horizonY + (h - horizonY) * 0.45 - 6, w * 0.44, 8);

    // 4. Camera Zoom Dynamics:
    // From backroomsElapsed 0 to 4s: steady medium shot
    // From backroomsElapsed 5.5 to 7.7s (elapsed 22.0 to 24.2): Zoom in towards 1st person!
    let cameraZoom = 1.0;
    let cameraOffsetY = 0;
    if (totalElapsed >= 22.0) {
      const zoomProgress = (totalElapsed - 22.0) / 2.2;
      // Exponential camera rush into duck's head
      cameraZoom = 1.0 + Math.pow(zoomProgress, 2.2) * 3.8;
      cameraOffsetY = zoomProgress * (h * 0.18);
    }

    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-w * 0.5, -h * 0.5 + cameraOffsetY);

    // 5. Render Duck Commando in Backrooms
    const duckCenterX = w * 0.5;
    const duckCenterY = h * 0.78;
    const duckScale = h * 0.5;

    // Slight fade-in when waking up in Backrooms
    const backroomsFade = Math.min(1.0, backroomsElapsed / 0.8);

    if (playerRendererRef.current) {
      playerRendererRef.current.renderPlayer(
        ctx,
        duck,
        duckCenterX,
        duckCenterY,
        duckScale,
        dt,
        backroomsFade
      );
    }

    ctx.restore();

    // 6. Transition to black if zoom finishes
    if (totalElapsed >= 23.8) {
      const fadeToGame = Math.min(1.0, (totalElapsed - 23.8) / 0.4);
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeToGame * 0.85})`;
      ctx.fillRect(0, 0, w, h);
    }
  };

  // --- RENDERER HELPER: REALITY BREAKDOWN & GLITCH SHADER ---
  const drawRealityGlitch = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    intensity: number,
    time: number
  ) => {
    ctx.save();
    // 1. Horizontal Scanline Slicing and Displacement
    const slices = Math.floor(12 * intensity);
    for (let i = 0; i < slices; i++) {
      const sy = Math.random() * h;
      const sh = 6 + Math.random() * 24;
      const dx = (Math.random() - 0.5) * 45 * intensity;

      try {
        const sliceData = ctx.getImageData(0, Math.max(0, sy), w, Math.min(sh, h - sy));
        ctx.putImageData(sliceData, dx, sy);
      } catch (e) {
        // Fallback for tainted canvas
      }
    }

    // 2. Chromatic Aberration RGB Bleed
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(239, 68, 68, ${0.28 * intensity})`;
    ctx.fillRect((Math.sin(time * 30) * 12) * intensity, 0, w, h);

    ctx.fillStyle = `rgba(56, 189, 248, ${0.24 * intensity})`;
    ctx.fillRect((-Math.sin(time * 30) * 12) * intensity, 0, w, h);

    // 3. Digital Frame Static Noise & Tearing
    if (Math.random() < 0.35 * intensity) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const ny = Math.random() * h;
      ctx.fillRect(0, ny, w, 4 + Math.random() * 8);
    }

    ctx.restore();
  };

  // --- RENDERER HELPER: ANALOG CRT & VIGNETTE ---
  const drawAnalogCrtVignette = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    ctx.save();

    // Subtle CRT scanlines
    ctx.fillStyle = 'rgba(10, 10, 10, 0.18)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // Dark analog horror vignette
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.38, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.55)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // VHS Tracking line drifting down
    const trackingY = ((time * 65) % (h + 120)) - 60;
    const trackingGrad = ctx.createLinearGradient(0, trackingY, 0, trackingY + 18);
    trackingGrad.addColorStop(0, 'transparent');
    trackingGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    trackingGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = trackingGrad;
    ctx.fillRect(0, trackingY, w, 18);

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden font-tech">
      {/* Real-time Cinematic 2.5D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* TOP-RIGHT CORNER: BUTTON "SALTAR" (From frame 0, fully accessible) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          id="btn-skip-cinematic"
          onClick={handleSkip}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleSkip();
          }}
          className="group flex items-center gap-2 px-4 py-2 bg-red-950/85 hover:bg-red-900 border-2 border-amber-500/70 hover:border-amber-400 active:scale-95 text-amber-300 hover:text-amber-100 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase rounded shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer backdrop-blur-md"
        >
          <FastForward className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          <span>SALTAR</span>
        </button>
      </div>

      {/* TOP-LEFT CORNER: REC & TACTICAL AUDIO BADGE */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 border border-red-500/50 text-red-500 font-mono text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-rec-blink" />
          <span>REC • 00:04:18</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-stone-800 text-stone-400 font-mono text-[11px] tracking-wider">
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>AUDIO ANALÓGICO 2.5D</span>
        </div>
      </div>

      {/* LOCATION STAMP (Scene 1) */}
      {currentLocationStamp && (
        <div className="absolute top-16 left-6 z-40 pointer-events-none font-mono text-xs sm:text-sm text-amber-400/90 tracking-widest uppercase animate-fade-in drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <span className="text-red-500 mr-2">▶</span>
          {currentLocationStamp}
        </div>
      )}

      {/* MILITARY RADIO SUBTITLES (VHS Phosphor green/amber style) */}
      {currentSubtitle && (
        <div className="absolute bottom-12 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="bg-black/85 border border-amber-500/60 rounded px-6 py-3 max-w-xl text-center shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-xs animate-fade-in">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-amber-400 uppercase mb-1">
              <Radio className="w-3 h-3 text-red-400 animate-pulse" />
              <span>COMUNICACIÓN DE RADIO // {currentSubtitle.sender}</span>
            </div>
            <p className="text-lg sm:text-2xl font-mono font-bold text-amber-100 tracking-wide drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]">
              "{currentSubtitle.text}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
