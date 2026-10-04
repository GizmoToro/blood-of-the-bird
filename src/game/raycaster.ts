import { Player, Chicken, Pickup, GameSettings, LevelData, LevelTheme, QualityLevel, ThrownBomb, SpittedProjectile, BossShockwave } from '../types';
import { textureCache, TEX_SIZE } from './textures';
import { soundManager } from './audio';
import { thirdPersonCamera, CameraView } from './thirdPersonCamera';
import { playerRenderer } from './playerRenderer';

export interface WorldParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'blood' | 'spark' | 'smoke' | 'dust';
}

export class RaycasterEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private zBuffer: Float64Array = new Float64Array(800);
  private particles: WorldParticle[] = [];
  public bloodDecals: { x: number; y: number; size: number; alpha: number }[] = [];
  private currentMap: number[][] | null = null;

  // Internal render dimensions (scaled for high performance)
  private renderWidth = 480;
  private renderHeight = 270;

  // Fluorescent light flicker state
  private lightIntensity = 1.0;
  private flickerTimer = 0;
  private dustTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false })!;
  }

  public resize(width: number, height: number, quality: QualityLevel) {
    this.canvas.width = width;
    this.canvas.height = height;

    if (quality === 'low') {
      this.renderWidth = 320;
      this.renderHeight = 180;
    } else if (quality === 'med') {
      this.renderWidth = 480;
      this.renderHeight = 270;
    } else if (quality === 'high') {
      this.renderWidth = 640;
      this.renderHeight = 360;
    } else {
      // Ultra quality: 800x450
      this.renderWidth = 800;
      this.renderHeight = 450;
    }

    this.offscreenCanvas.width = this.renderWidth;
    this.offscreenCanvas.height = this.renderHeight;
    this.zBuffer = new Float64Array(this.renderWidth);
  }

  public updateParticles(dt: number, maxParticles: number = 60) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      if (p.type === 'blood' || p.type === 'spark') {
        p.vz -= 8.5 * dt; // Gravity
      } else if (p.type === 'smoke') {
        p.vz += 0.4 * dt; // Smoke rises
        p.size += dt * 3.5;
      } else if (p.type === 'dust') {
        p.vx += (Math.random() - 0.5) * 0.1 * dt;
        p.vy += (Math.random() - 0.5) * 0.1 * dt;
      }

      p.life -= dt;
      if (p.life <= 0 || (p.z < 0 && p.type !== 'dust')) {
        this.particles.splice(i, 1);
      }
    }
    // Trim if exceeding quality limit
    if (this.particles.length > maxParticles) {
      this.particles.splice(0, this.particles.length - maxParticles);
    }
  }

  public spawnBlood(x: number, y: number, z: number = 0.5, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.8;
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 1.0 + Math.random() * 2.2,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        size: 2.5 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? '#880000' : '#bb0000',
        type: 'blood',
      });
    }
  }

  public addBloodDecal(x: number, y: number, size = 0.5) {
    if (this.bloodDecals.length >= 35) {
      this.bloodDecals.shift(); // keep max 35 decals for 60fps stability
    }
    this.bloodDecals.push({
      x,
      y,
      size,
      alpha: 0.75 + Math.random() * 0.2,
    });
  }

  public clearBloodDecals() {
    this.bloodDecals = [];
  }

  public spawnWallSparks(x: number, y: number, z: number = 0.5, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 3.2;
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 1.2 + Math.random() * 2.5,
        life: 0.25 + Math.random() * 0.25,
        maxLife: 0.5,
        size: 1.8 + Math.random() * 2.0,
        color: Math.random() > 0.4 ? '#ffdd44' : '#ff8800',
        type: 'spark',
      });
    }
  }

  public spawnSmoke(x: number, y: number, z: number = 0.4, count = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.5;
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 0.3 + Math.random() * 0.5,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
        size: 3.5 + Math.random() * 4.0,
        color: 'rgba(180, 180, 180, 0.45)',
        type: 'smoke',
      });
    }
  }

  public spawnAmbientDust(playerX: number, playerY: number) {
    if (this.particles.length >= 80) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = 1.5 + Math.random() * 6.5;
    this.particles.push({
      x: playerX + Math.cos(angle) * dist,
      y: playerY + Math.sin(angle) * dist,
      z: 0.1 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      vz: (Math.random() - 0.5) * 0.05,
      life: 3.0 + Math.random() * 4.0,
      maxLife: 7.0,
      size: 1.2 + Math.random() * 1.5,
      color: 'rgba(230, 220, 180, 0.35)',
      type: 'dust',
    });
  }

  public spawnExplosion(x: number, y: number, z: number) {
    // 1. Fiery incandescent core particles (yellow, orange, gold)
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 5.0;
      const vz = (Math.random() - 0.2) * 3.8;
      this.particles.push({
        x,
        y,
        z: Math.max(0.05, z + 0.1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz,
        life: 0.4 + Math.random() * 0.45,
        maxLife: 0.85,
        size: 3.5 + Math.random() * 5.5,
        color: Math.random() > 0.35 ? '#ff9900' : '#ffee33',
        type: 'spark',
      });
    }

    // 2. Thick billowing dark smoke clouds
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.4;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.3,
        y: y + (Math.random() - 0.5) * 0.3,
        z: Math.max(0.1, z + 0.2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 0.8 + Math.random() * 1.6,
        life: 0.8 + Math.random() * 0.9,
        maxLife: 1.7,
        size: 5.5 + Math.random() * 9.0,
        color: Math.random() > 0.5 ? 'rgba(30, 30, 32, 0.75)' : 'rgba(75, 68, 60, 0.65)',
        type: 'smoke',
      });
    }

    // 3. Fast sizzling shrapnel sparks
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.2 + Math.random() * 6.0;
      this.particles.push({
        x,
        y,
        z: Math.max(0.05, z + 0.1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 0.6 + Math.random() * 2.8,
        life: 0.22 + Math.random() * 0.35,
        maxLife: 0.57,
        size: 2.2,
        color: '#ffffff',
        type: 'spark',
      });
    }
  }

  public spawnFuseSparks(x: number, y: number, z: number) {
    if (Math.random() > 0.4) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 0.08,
      y: y + (Math.random() - 0.5) * 0.08,
      z: Math.max(0.05, z + 0.1),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: 0.2 + Math.random() * 0.5,
      life: 0.15 + Math.random() * 0.15,
      maxLife: 0.3,
      size: 1.5,
      color: Math.random() > 0.3 ? '#ffaa00' : '#ffff55',
      type: 'spark',
    });
  }

  public spawnBossSlamDebris(x: number, y: number) {
    // Heavy dust and rock debris blast on boss ground slam impact
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.4,
        y: y + (Math.random() - 0.5) * 0.4,
        z: 0.1 + Math.random() * 0.25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 1.0 + Math.random() * 3.0,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#442211' : (Math.random() > 0.5 ? '#883311' : '#ff4400'),
        type: 'dust',
      });
    }
  }

  public render(
    player: Player,
    chickens: Chicken[],
    pickups: Pickup[],
    level: LevelData,
    settings: GameSettings,
    dt: number,
    bombs: ThrownBomb[] = [],
    projectiles: SpittedProjectile[] = [],
    shockwaves: BossShockwave[] = []
  ) {
    const ctx = this.offscreenCtx;
    const w = this.renderWidth;
    const h = this.renderHeight;
    this.currentMap = level.map;

    // 1. Lighting flicker and shotgun muzzle flash decay
    this.flickerTimer += dt;
    if (this.flickerTimer > 0.08) {
      this.flickerTimer = 0;
      if (Math.random() < 0.12) {
        this.lightIntensity = 0.4 + Math.random() * 0.35;
      } else {
        this.lightIntensity = 0.95 + Math.sin(Date.now() * 0.005) * 0.05;
      }
    }

    // Shotgun muzzle flash light bonus
    const flashBonus = player.muzzleFlash * 0.65;
    const brightnessMultiplier = Math.min(2.0, (settings.brightness * this.lightIntensity) + flashBonus);

    // 1. Camera View Computation (Smooth First / Third Person transition and collision)
    const camView = thirdPersonCamera.update(player, level.map, settings, dt);
    const camX = camView.x;
    const camY = camView.y;
    const camDirX = camView.dirX;
    const camDirY = camView.dirY;
    const camPlaneX = camView.planeX;
    const camPlaneY = camView.planeY;

    // Camera shake calculation on horizon + head bobbing (no artificial jump pitch tilt or bounce)
    const shakeY = player.cameraShake > 0.01 ? (Math.sin(Date.now() * 0.06) * 5 * player.cameraShake) : 0;
    const bobY = (player.headBobOffset || 0) * (1 - camView.transitionT * 0.75);
    const horizon = Math.floor(h / 2 + player.pitch + shakeY + bobY - camView.horizonOffset);

    // Determine render distance thresholds based on settings
    let maxDepth = 20;
    let maxFogDist = 17;
    if (settings.renderDistance === 'low') {
      maxDepth = 12;
      maxFogDist = 11;
    } else if (settings.renderDistance === 'high') {
      maxDepth = 28;
      maxFogDist = 24;
    }

    const fogRgb = this.getThemeFogRgb(level.theme);

    // 2. Draw Floor & Ceiling
    this.renderCeilingAndFloor(ctx, w, h, horizon, brightnessMultiplier, level.theme, player);

    // 3. Raycasting Walls (DDA Algorithm from Camera Observer Perspective)
    const map = level.map;
    for (let x = 0; x < w; x++) {
      const cameraX = (2 * x) / w - 1; // camera space -1 to 1
      const rayDirX = camDirX + camPlaneX * cameraX;
      const rayDirY = camDirY + camPlaneY * cameraX;

      let mapX = Math.floor(camX);
      let mapY = Math.floor(camY);

      let sideDistX = 0;
      let sideDistY = 0;

      const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
      const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));
      let perpWallDist = 0;

      let stepX = 0;
      let stepY = 0;
      let hit = 0;
      let side = 0;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (camX - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - camX) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (camY - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - camY) * deltaDistY;
      }

      // Perform DDA step loop
      let depth = 0;
      while (hit === 0 && depth < maxDepth) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        if (map[mapY] && map[mapY][mapX] && map[mapY][mapX] > 0) {
          hit = map[mapY][mapX];
        }
        depth++;
      }

      if (hit === 0) {
        this.zBuffer[x] = 999;
        continue;
      }

      if (side === 0) {
        perpWallDist = (mapX - camX + (1 - stepX) / 2) / rayDirX;
      } else {
        perpWallDist = (mapY - camY + (1 - stepY) / 2) / rayDirY;
      }

      this.zBuffer[x] = perpWallDist;

      const lineHeight = Math.floor(h / (perpWallDist || 0.001));
      const drawStart = Math.floor(horizon - lineHeight / 2);
      const drawEnd = Math.floor(horizon + lineHeight / 2);

      let wallX = 0;
      if (side === 0) {
        wallX = camY + perpWallDist * rayDirY;
      } else {
        wallX = camX + perpWallDist * rayDirX;
      }
      wallX -= Math.floor(wallX);

      let texX = Math.floor(wallX * TEX_SIZE);
      if (side === 0 && rayDirX > 0) texX = TEX_SIZE - texX - 1;
      if (side === 1 && rayDirY < 0) texX = TEX_SIZE - texX - 1;

      // Draw textured vertical wall column (Hardware-accelerated)
      this.drawWallColumn(ctx, x, drawStart, drawEnd, lineHeight, hit, texX, side, perpWallDist, brightnessMultiplier, maxFogDist, fogRgb, player, w);
    }

    // 4. Render Billboards (Pickups, Chickens, Bombs, Projectiles, and Third-Person Player Model)
    this.renderSprites(ctx, player, chickens, pickups, w, h, horizon, brightnessMultiplier, maxFogDist, fogRgb, bombs, projectiles, camView, dt);

    // 4.1. Render Boss Shockwaves on floor
    this.renderShockwaves(ctx, shockwaves, camView, w, h, horizon);

    // 5. Spawn and Render Particles (Blood, sparks, smoke, dust)
    if (settings.effectsQuality !== 'low') {
      this.dustTimer += dt;
      if (this.dustTimer > 0.18) {
        this.dustTimer = 0;
        this.spawnAmbientDust(player.x, player.y);
      }
      this.renderParticles(ctx, player, w, h, horizon, camView);
    }

    // 6. Muzzle flash environmental light bloom on screen
    if (player.muzzleFlash > 0.05) {
      ctx.fillStyle = `rgba(255, 230, 160, ${player.muzzleFlash * 0.22})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 7. Render HUD Shotgun (in First Person) or Aiming Reticle (in Third Person)
    const firstPersonWeaponAlpha = 1.0 - camView.transitionT;
    if (firstPersonWeaponAlpha > 0.02) {
      this.renderWeapon(ctx, player, w, h, firstPersonWeaponAlpha);
    }

    if (camView.transitionT > 0.02) {
      this.renderThirdPersonReticle(ctx, w, h, camView.transitionT, player);
    }

    // 8. Render Damage Red Flash / Vignette
    if (player.damageFlash > 0.01) {
      ctx.fillStyle = `rgba(190, 0, 0, ${player.damageFlash * 0.45})`;
      ctx.fillRect(0, 0, w, h);

      if (settings.effectsQuality !== 'low') {
        const radGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.65);
        radGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
        radGrad.addColorStop(1, `rgba(180, 0, 0, ${player.damageFlash * 0.65})`);
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Blit from offscreen canvas to main canvas with crisp pixelated retro upscaling
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  private getThemeFogRgb(theme?: LevelTheme): [number, number, number] {
    switch (theme) {
      case 'old': return [16, 14, 10];
      case 'red': return [36, 4, 8];
      case 'flooded': return [8, 20, 18];
      case 'office': return [20, 22, 26];
      case 'blue': return [6, 14, 30];
      case 'industrial': return [22, 19, 16];
      case 'nest': return [22, 3, 6];
      case 'yellow':
      default:
        return [12, 10, 5];
    }
  }

  // --- Ceiling & Floor Rendering ---

  private renderCeilingAndFloor(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    horizon: number,
    brightness: number,
    theme?: LevelTheme,
    player?: Player
  ) {
    const flashlight = player?.flashlight ?? true;
    const fFlicker = player?.flashlightFlicker ?? 1.0;
    const ambientScale = flashlight ? 1.0 : 0.22;
    const ceilDim = Math.min(1.0, brightness * ambientScale);

    let cTop = `rgb(${Math.floor(100 * ceilDim)}, ${Math.floor(95 * ceilDim)}, ${Math.floor(70 * ceilDim)})`;
    let cMid = `rgb(${Math.floor(65 * ceilDim)}, ${Math.floor(60 * ceilDim)}, ${Math.floor(40 * ceilDim)})`;
    let cBot = `rgb(${Math.floor(25 * ceilDim)}, ${Math.floor(22 * ceilDim)}, ${Math.floor(15 * ceilDim)})`;

    let fTop = `rgb(${Math.floor(30 * ceilDim)}, ${Math.floor(26 * ceilDim)}, ${Math.floor(12 * ceilDim)})`;
    let fMid = `rgb(${Math.floor(75 * ceilDim)}, ${Math.floor(65 * ceilDim)}, ${Math.floor(30 * ceilDim)})`;
    let fBot = `rgb(${Math.floor(130 * ceilDim)}, ${Math.floor(115 * ceilDim)}, ${Math.floor(52 * ceilDim)})`;

    if (theme === 'old') {
      cTop = `rgb(${Math.floor(60 * ceilDim)}, ${Math.floor(55 * ceilDim)}, ${Math.floor(42 * ceilDim)})`;
      cMid = `rgb(${Math.floor(38 * ceilDim)}, ${Math.floor(34 * ceilDim)}, ${Math.floor(24 * ceilDim)})`;
      cBot = `rgb(${Math.floor(16 * ceilDim)}, ${Math.floor(14 * ceilDim)}, ${Math.floor(10 * ceilDim)})`;
      fTop = `rgb(${Math.floor(20 * ceilDim)}, ${Math.floor(16 * ceilDim)}, ${Math.floor(12 * ceilDim)})`;
      fMid = `rgb(${Math.floor(48 * ceilDim)}, ${Math.floor(40 * ceilDim)}, ${Math.floor(28 * ceilDim)})`;
      fBot = `rgb(${Math.floor(75 * ceilDim)}, ${Math.floor(64 * ceilDim)}, ${Math.floor(45 * ceilDim)})`;
    } else if (theme === 'red') {
      cTop = `rgb(${Math.floor(110 * ceilDim)}, ${Math.floor(22 * ceilDim)}, ${Math.floor(22 * ceilDim)})`;
      cMid = `rgb(${Math.floor(65 * ceilDim)}, ${Math.floor(12 * ceilDim)}, ${Math.floor(12 * ceilDim)})`;
      cBot = `rgb(${Math.floor(24 * ceilDim)}, ${Math.floor(5 * ceilDim)}, ${Math.floor(5 * ceilDim)})`;
      fTop = `rgb(${Math.floor(30 * ceilDim)}, ${Math.floor(6 * ceilDim)}, ${Math.floor(6 * ceilDim)})`;
      fMid = `rgb(${Math.floor(70 * ceilDim)}, ${Math.floor(18 * ceilDim)}, ${Math.floor(18 * ceilDim)})`;
      fBot = `rgb(${Math.floor(115 * ceilDim)}, ${Math.floor(26 * ceilDim)}, ${Math.floor(26 * ceilDim)})`;
    } else if (theme === 'flooded') {
      cTop = `rgb(${Math.floor(28 * ceilDim)}, ${Math.floor(50 * ceilDim)}, ${Math.floor(46 * ceilDim)})`;
      cMid = `rgb(${Math.floor(16 * ceilDim)}, ${Math.floor(32 * ceilDim)}, ${Math.floor(28 * ceilDim)})`;
      cBot = `rgb(${Math.floor(8 * ceilDim)}, ${Math.floor(18 * ceilDim)}, ${Math.floor(16 * ceilDim)})`;
      fTop = `rgb(${Math.floor(10 * ceilDim)}, ${Math.floor(24 * ceilDim)}, ${Math.floor(22 * ceilDim)})`;
      fMid = `rgb(${Math.floor(24 * ceilDim)}, ${Math.floor(56 * ceilDim)}, ${Math.floor(50 * ceilDim)})`;
      fBot = `rgb(${Math.floor(42 * ceilDim)}, ${Math.floor(92 * ceilDim)}, ${Math.floor(82 * ceilDim)})`;
    } else if (theme === 'office') {
      cTop = `rgb(${Math.floor(130 * ceilDim)}, ${Math.floor(135 * ceilDim)}, ${Math.floor(140 * ceilDim)})`;
      cMid = `rgb(${Math.floor(75 * ceilDim)}, ${Math.floor(80 * ceilDim)}, ${Math.floor(85 * ceilDim)})`;
      cBot = `rgb(${Math.floor(28 * ceilDim)}, ${Math.floor(30 * ceilDim)}, ${Math.floor(34 * ceilDim)})`;
      fTop = `rgb(${Math.floor(32 * ceilDim)}, ${Math.floor(35 * ceilDim)}, ${Math.floor(38 * ceilDim)})`;
      fMid = `rgb(${Math.floor(60 * ceilDim)}, ${Math.floor(64 * ceilDim)}, ${Math.floor(70 * ceilDim)})`;
      fBot = `rgb(${Math.floor(90 * ceilDim)}, ${Math.floor(96 * ceilDim)}, ${Math.floor(104 * ceilDim)})`;
    } else if (theme === 'blue') {
      cTop = `rgb(${Math.floor(24 * ceilDim)}, ${Math.floor(40 * ceilDim)}, ${Math.floor(82 * ceilDim)})`;
      cMid = `rgb(${Math.floor(12 * ceilDim)}, ${Math.floor(24 * ceilDim)}, ${Math.floor(52 * ceilDim)})`;
      cBot = `rgb(${Math.floor(6 * ceilDim)}, ${Math.floor(10 * ceilDim)}, ${Math.floor(24 * ceilDim)})`;
      fTop = `rgb(${Math.floor(8 * ceilDim)}, ${Math.floor(14 * ceilDim)}, ${Math.floor(28 * ceilDim)})`;
      fMid = `rgb(${Math.floor(18 * ceilDim)}, ${Math.floor(32 * ceilDim)}, ${Math.floor(64 * ceilDim)})`;
      fBot = `rgb(${Math.floor(32 * ceilDim)}, ${Math.floor(55 * ceilDim)}, ${Math.floor(102 * ceilDim)})`;
    } else if (theme === 'industrial') {
      cTop = `rgb(${Math.floor(56 * ceilDim)}, ${Math.floor(50 * ceilDim)}, ${Math.floor(44 * ceilDim)})`;
      cMid = `rgb(${Math.floor(34 * ceilDim)}, ${Math.floor(30 * ceilDim)}, ${Math.floor(26 * ceilDim)})`;
      cBot = `rgb(${Math.floor(16 * ceilDim)}, ${Math.floor(14 * ceilDim)}, ${Math.floor(12 * ceilDim)})`;
      fTop = `rgb(${Math.floor(22 * ceilDim)}, ${Math.floor(20 * ceilDim)}, ${Math.floor(18 * ceilDim)})`;
      fMid = `rgb(${Math.floor(45 * ceilDim)}, ${Math.floor(40 * ceilDim)}, ${Math.floor(36 * ceilDim)})`;
      fBot = `rgb(${Math.floor(72 * ceilDim)}, ${Math.floor(64 * ceilDim)}, ${Math.floor(56 * ceilDim)})`;
    } else if (theme === 'nest') {
      cTop = `rgb(${Math.floor(45 * ceilDim)}, ${Math.floor(8 * ceilDim)}, ${Math.floor(14 * ceilDim)})`;
      cMid = `rgb(${Math.floor(24 * ceilDim)}, ${Math.floor(4 * ceilDim)}, ${Math.floor(8 * ceilDim)})`;
      cBot = `rgb(${Math.floor(12 * ceilDim)}, ${Math.floor(2 * ceilDim)}, ${Math.floor(3 * ceilDim)})`;
      fTop = `rgb(${Math.floor(18 * ceilDim)}, ${Math.floor(3 * ceilDim)}, ${Math.floor(5 * ceilDim)})`;
      fMid = `rgb(${Math.floor(48 * ceilDim)}, ${Math.floor(10 * ceilDim)}, ${Math.floor(16 * ceilDim)})`;
      fBot = `rgb(${Math.floor(82 * ceilDim)}, ${Math.floor(16 * ceilDim)}, ${Math.floor(26 * ceilDim)})`;
    } else if (theme === 'arena') {
      cTop = `rgb(${Math.floor(22 * ceilDim)}, ${Math.floor(3 * ceilDim)}, ${Math.floor(5 * ceilDim)})`;
      cMid = `rgb(${Math.floor(10 * ceilDim)}, ${Math.floor(2 * ceilDim)}, ${Math.floor(3 * ceilDim)})`;
      cBot = `rgb(${Math.floor(5 * ceilDim)}, ${Math.floor(1 * ceilDim)}, ${Math.floor(2 * ceilDim)})`;
      fTop = `rgb(${Math.floor(32 * ceilDim)}, ${Math.floor(6 * ceilDim)}, ${Math.floor(8 * ceilDim)})`;
      fMid = `rgb(${Math.floor(58 * ceilDim)}, ${Math.floor(12 * ceilDim)}, ${Math.floor(14 * ceilDim)})`;
      fBot = `rgb(${Math.floor(88 * ceilDim)}, ${Math.floor(16 * ceilDim)}, ${Math.floor(20 * ceilDim)})`;
    }

    // Ceiling gradient
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    ceilGrad.addColorStop(0, cTop);
    ceilGrad.addColorStop(0.7, cMid);
    ceilGrad.addColorStop(1, cBot);
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, w, horizon);

    // Subtle ceiling tile grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 1;
    for (let py = 12; py < horizon; py += 18) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    }

    // Fluorescent fixture light strip in ceiling
    if (this.lightIntensity > 0.5 && horizon > 15) {
      const fixtureY = Math.floor(horizon * 0.35);
      const fixtureH = Math.max(2, Math.floor(horizon * 0.08));
      const fWidth = Math.floor(w * 0.28);
      const fX = Math.floor(w * 0.36);
      ctx.fillStyle = `rgba(255, 255, 230, ${0.45 * this.lightIntensity})`;
      ctx.fillRect(fX, fixtureY, fWidth, fixtureH);
    }

    // Floor gradient
    const floorGrad = ctx.createLinearGradient(0, horizon, 0, h);
    floorGrad.addColorStop(0, fTop);
    floorGrad.addColorStop(0.3, fMid);
    floorGrad.addColorStop(1, fBot);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizon, w, h - horizon);

    // Realistic flashlight ground spotlight pool
    if (flashlight) {
      const floorH = h - horizon;
      if (floorH > 10) {
        const spotY = horizon + floorH * 0.45;
        const radGrad = ctx.createRadialGradient(w / 2, spotY, 15, w / 2, spotY, w * 0.48);
        radGrad.addColorStop(0, `rgba(255, 245, 205, ${0.28 * fFlicker})`);
        radGrad.addColorStop(0.45, `rgba(225, 215, 175, ${0.12 * fFlicker})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, horizon, w, floorH);
      }
    }
  }

  // --- Draw Wall Column (Hardware-accelerated) ---

  private drawWallColumn(
    ctx: CanvasRenderingContext2D,
    x: number,
    drawStart: number,
    drawEnd: number,
    lineHeight: number,
    wallType: number,
    texX: number,
    side: number,
    dist: number,
    brightness: number,
    maxFogDist: number,
    fogRgb: [number, number, number] = [12, 10, 5],
    player?: Player,
    w: number = 480
  ) {
    const tex = textureCache.walls[wallType] || textureCache.walls[1];
    if (!tex || !tex.canvas) return;

    // Direct canvas slice draw — zero memory allocation per column!
    ctx.drawImage(
      tex.canvas,
      texX, 0, 1, TEX_SIZE,
      x, drawStart, 1, lineHeight
    );

    // Flashlight cone intensity based on ray angle from center + distance
    const cameraX = (2 * x) / w - 1;
    let flashlightFactor = 0;
    if (player?.flashlight) {
      const beamAngleFalloff = Math.max(0, 1.0 - Math.abs(cameraX) * 1.45);
      const distFalloff = Math.max(0, 1.0 - dist / 15.0);
      flashlightFactor = Math.pow(beamAngleFalloff, 1.4) * distFalloff * (player.flashlightFlicker ?? 1.0) * 1.35;
    }

    // Distance dimming / Backrooms void fog
    const ambientScale = player?.flashlight ? 1.0 : 0.22;
    let shade = Math.max(0.04, (1 - dist / maxFogDist) * ambientScale * brightness + flashlightFactor);
    if (side === 1) shade *= 0.74; // Wolfenstein 3D classic side contrast

    if (shade < 0.98) {
      const alpha = Math.min(0.96, 1 - shade);
      ctx.fillStyle = `rgba(${fogRgb[0]}, ${fogRgb[1]}, ${fogRgb[2]}, ${alpha})`;
      ctx.fillRect(x, drawStart, 1, lineHeight);
    } else if (shade > 1.0) {
      // Warm center flashlight beam glow
      const glowAlpha = Math.min(0.25, (shade - 1.0) * 0.35);
      ctx.fillStyle = `rgba(255, 245, 205, ${glowAlpha})`;
      ctx.fillRect(x, drawStart, 1, lineHeight);
    }
  }

  // --- Render Sprites (Billboarding with Depth Culling) ---

  private renderSprites(
    ctx: CanvasRenderingContext2D,
    player: Player,
    chickens: Chicken[],
    pickups: Pickup[],
    w: number,
    h: number,
    horizon: number,
    brightness: number,
    maxFogDist: number,
    fogRgb: [number, number, number] = [12, 10, 5],
    bombs: ThrownBomb[] = [],
    projectiles: SpittedProjectile[] = [],
    camView?: CameraView,
    dt: number = 0.016
  ) {
    interface SpriteItem {
      x: number;
      y: number;
      z?: number;
      dist: number;
      type: 'chicken' | 'pickup' | 'bomb' | 'projectile' | 'blood_decal' | 'player';
      chicken?: Chicken;
      pickup?: Pickup;
      bomb?: ThrownBomb;
      projectile?: SpittedProjectile;
      bloodDecal?: { x: number; y: number; size: number; alpha: number };
    }

    const spriteList: SpriteItem[] = [];
    const obsX = camView ? camView.x : player.x;
    const obsY = camView ? camView.y : player.y;
    const maxDistSq = maxFogDist * maxFogDist;

    // Add Third-Person Animated Player Model if camera is transitioning or in third person
    if (camView && camView.transitionT > 0.01) {
      const dist = (obsX - player.x) ** 2 + (obsY - player.y) ** 2;
      spriteList.push({
        x: player.x,
        y: player.y,
        dist,
        type: 'player',
      });
    }

    // Add floor blood decals
    for (let i = 0; i < this.bloodDecals.length; i++) {
      const b = this.bloodDecals[i];
      const dist = (obsX - b.x) ** 2 + (obsY - b.y) ** 2;
      if (dist > maxDistSq) continue;
      spriteList.push({
        x: b.x,
        y: b.y,
        dist,
        type: 'blood_decal',
        bloodDecal: b,
      });
    }

    // Add chickens within visibility radius
    for (let i = 0; i < chickens.length; i++) {
      const c = chickens[i];
      const dist = (obsX - c.x) ** 2 + (obsY - c.y) ** 2;
      if (dist > maxDistSq) continue; // Early distance cull
      spriteList.push({
        x: c.x,
        y: c.y,
        dist,
        type: 'chicken',
        chicken: c,
      });
    }

    // Add uncollected pickups
    for (let i = 0; i < pickups.length; i++) {
      const p = pickups[i];
      if (p.collected) continue;
      const dist = (obsX - p.x) ** 2 + (obsY - p.y) ** 2;
      if (dist > maxDistSq) continue;
      spriteList.push({
        x: p.x,
        y: p.y,
        dist,
        type: 'pickup',
        pickup: p,
      });
    }

    // Add active thrown bombs
    for (let i = 0; i < bombs.length; i++) {
      const b = bombs[i];
      const dist = (obsX - b.x) ** 2 + (obsY - b.y) ** 2;
      if (dist > maxDistSq) continue;
      spriteList.push({
        x: b.x,
        y: b.y,
        z: b.z,
        dist,
        type: 'bomb',
        bomb: b,
      });
    }

    // Add flying projectiles
    for (let i = 0; i < projectiles.length; i++) {
      const proj = projectiles[i];
      const dist = (obsX - proj.x) ** 2 + (obsY - proj.y) ** 2;
      if (dist > maxDistSq) continue;
      spriteList.push({
        x: proj.x,
        y: proj.y,
        z: proj.z,
        dist,
        type: 'projectile',
        projectile: proj,
      });
    }

    // Sort far to near (Painter's algorithm)
    spriteList.sort((a, b) => b.dist - a.dist);

    const obsDirX = camView ? camView.dirX : player.dirX;
    const obsDirY = camView ? camView.dirY : player.dirY;
    const obsPlaneX = camView ? camView.planeX : player.planeX;
    const obsPlaneY = camView ? camView.planeY : player.planeY;

    for (let i = 0; i < spriteList.length; i++) {
      const item = spriteList[i];
      const spriteX = item.x - obsX;
      const spriteY = item.y - obsY;

      const invDet = 1.0 / (obsPlaneX * obsDirY - obsDirX * obsPlaneY);
      const transformX = invDet * (obsDirY * spriteX - obsDirX * spriteY);
      const transformY = invDet * (-obsPlaneY * spriteX + obsPlaneX * spriteY);

      if (transformY <= 0.15) continue; // Behind camera plane

      const spriteScreenX = Math.floor((w / 2) * (1 + transformX / transformY));
      const isBoss = item.chicken?.isBoss || item.chicken?.type === 'boss';
      const scaleMultiplier = isBoss
        ? 2.35
        : item.chicken?.type === 'tank'
        ? 1.35
        : item.chicken?.type === 'lurker'
        ? 0.88
        : item.type === 'player'
        ? 1.05
        : item.type === 'bomb'
        ? 0.45
        : item.type === 'projectile'
        ? 0.35
        : 1.0;
      const baseH = Math.abs(Math.floor(h / transformY));
      const spriteHeight = Math.abs(Math.floor(baseH * scaleMultiplier));
      const spriteWidth = Math.abs(Math.floor(baseH * scaleMultiplier));

      let vOffset = 0;
      if (item.type === 'player') {
        vOffset = -(player.jumpHeight || 0) * (h / transformY);
      } else if (item.type === 'pickup') {
        vOffset = spriteHeight * 0.35 + Math.sin(Date.now() * 0.005 + item.x) * 4;
      } else if (item.type === 'bomb' && item.bomb) {
        // Height above ground based on physical z coordinate
        vOffset = -(item.bomb.z - 0.2) * (h / transformY) + spriteHeight * 0.2;
      } else if (item.type === 'projectile' && item.projectile) {
        vOffset = -(item.projectile.z - 0.2) * (h / transformY) + spriteHeight * 0.2;
      } else if (isBoss) {
        // Align colossal boss feet with ground plane and elevate during high jumps
        vOffset = -(spriteHeight - baseH) / 2;
        if (item.chicken?.jumpElevation) {
          vOffset -= item.chicken.jumpElevation * (h / transformY);
        }
        if (item.chicken?.state === 'dead') {
          vOffset += spriteHeight * 0.16;
        }
      } else if (item.chicken?.state === 'dead') {
        vOffset = spriteHeight * 0.25;
      }

      const drawStartY = Math.floor(horizon - spriteHeight / 2 + vOffset);
      const drawStartX = Math.floor(spriteScreenX - spriteWidth / 2);

      // Frustum culling: if outside screen entirely
      if (drawStartX + spriteWidth < 0 || drawStartX >= w) continue;

      if (item.type === 'player') {
        const wallCheckX = Math.max(0, Math.min(w - 1, spriteScreenX));
        const wallDist = this.zBuffer[wallCheckX] || 999;
        if (transformY < wallDist + 0.3) {
          const playerScreenY = drawStartY + spriteHeight * 0.5;
          playerRenderer.renderPlayer(
            ctx,
            player,
            spriteScreenX,
            playerScreenY,
            spriteHeight,
            dt,
            camView ? camView.transitionT : 1.0
          );
        }
        continue;
      }

      let spriteCanvas: HTMLCanvasElement | null = null;
      let spriteRageCanvas: HTMLCanvasElement | null = null;
      let rageAlpha = 0;

      if (item.type === 'pickup' && item.pickup) {
        spriteCanvas = item.pickup.type === 'ammo' ? textureCache.ammoPickup : item.pickup.type === 'health' ? textureCache.healthPickup : textureCache.bombPickup;
      } else if (item.type === 'bomb') {
        spriteCanvas = textureCache.bombPickup;
      } else if (item.type === 'projectile') {
        // Render bright green acid orb directly
        if (transformY < this.zBuffer[spriteScreenX]) {
          ctx.save();
          const rad = Math.max(3, spriteWidth / 2);
          const grad = ctx.createRadialGradient(spriteScreenX, drawStartY + spriteHeight / 2, 1, spriteScreenX, drawStartY + spriteHeight / 2, rad);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, '#aaff00');
          grad.addColorStop(0.8, '#44bb00');
          grad.addColorStop(1, 'rgba(30, 160, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(spriteScreenX, drawStartY + spriteHeight / 2, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        continue;
      } else if (item.type === 'blood_decal' && item.bloodDecal) {
        // Render dark visceral blood stain flat on floor
        if (transformY < this.zBuffer[spriteScreenX]) {
          const poolRadius = Math.max(3, spriteWidth * 0.45);
          const poolY = Math.floor(horizon + spriteHeight * 0.35);
          ctx.save();
          ctx.globalAlpha = item.bloodDecal.alpha;
          ctx.fillStyle = '#550000';
          ctx.beginPath();
          ctx.ellipse(spriteScreenX, poolY, poolRadius, poolRadius * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#880000';
          ctx.beginPath();
          ctx.ellipse(spriteScreenX, poolY, poolRadius * 0.65, poolRadius * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        continue;
      } else if (item.type === 'chicken' && item.chicken) {
        const c = item.chicken;
        if (isBoss) {
          const b = textureCache.boss;
          const bRage = textureCache.bossRage;
          rageAlpha = Math.min(1.0, Math.max(0, c.rageIntensity || 0));

          if (c.state === 'dead') {
            const fIdx = Math.min(b.dead.length - 1, Math.floor(c.deadTimer * 3));
            spriteCanvas = b.dead[fIdx];
            spriteRageCanvas = bRage.dead[fIdx];
          } else if (c.state === 'windup') {
            const fIdx = c.animFrame % b.windup.length;
            spriteCanvas = b.windup[fIdx];
            spriteRageCanvas = bRage.windup[fIdx];
          } else if (c.state === 'charge') {
            const fIdx = c.animFrame % b.charge.length;
            spriteCanvas = b.charge[fIdx];
            spriteRageCanvas = bRage.charge[fIdx];
          } else if (c.state === 'attack') {
            const fIdx = c.animFrame % b.attack.length;
            spriteCanvas = b.attack[fIdx];
            spriteRageCanvas = bRage.attack[fIdx];
          } else if (c.state === 'jump') {
            const fIdx = c.animFrame % b.jump.length;
            spriteCanvas = b.jump[fIdx];
            spriteRageCanvas = bRage.jump[fIdx];
          } else if (c.state === 'slam') {
            const fIdx = c.animFrame % b.slam.length;
            spriteCanvas = b.slam[fIdx];
            spriteRageCanvas = bRage.slam[fIdx];
          } else if (c.state === 'exhausted') {
            const fIdx = c.animFrame % b.exhausted.length;
            spriteCanvas = b.exhausted[fIdx];
            spriteRageCanvas = bRage.exhausted[fIdx];
          } else {
            const fIdx = c.animFrame % b.walk.length;
            spriteCanvas = b.walk[fIdx];
            spriteRageCanvas = bRage.walk[fIdx];
          }
        } else {
          const set = textureCache.chickens[c.type] || textureCache.chickens['white'];
          if (c.state === 'dead') {
            spriteCanvas = set.dead[Math.min(set.dead.length - 1, Math.max(0, Math.floor(c.deadTimer * 4)))];
          } else if (c.state === 'attack') {
            spriteCanvas = set.attack[c.animFrame % set.attack.length];
          } else {
            spriteCanvas = set.walk[c.animFrame % set.walk.length];
          }
        }
      }

      if (!spriteCanvas) continue;

      // Draw vertical stripes with z-buffer check
      const startCol = Math.max(0, drawStartX);
      const endCol = Math.min(w, drawStartX + spriteWidth);

      for (let stripe = startCol; stripe < endCol; stripe++) {
        if (transformY < this.zBuffer[stripe]) {
          const texX = Math.floor((stripe - drawStartX) * (spriteCanvas.width / spriteWidth));
          ctx.drawImage(
            spriteCanvas,
            texX, 0, 1, spriteCanvas.height,
            stripe, drawStartY, 1, spriteHeight
          );

          // Render Gallardo enraged red layer if active
          if (rageAlpha > 0 && spriteRageCanvas) {
            ctx.save();
            ctx.globalAlpha = rageAlpha;
            ctx.drawImage(
              spriteRageCanvas,
              texX, 0, 1, spriteRageCanvas.height,
              stripe, drawStartY, 1, spriteHeight
            );
            ctx.restore();
          }

          // Distance shading with flashlight spotlight boost
          const cameraX = (2 * stripe) / w - 1;
          let flashlightFactor = 0;
          if (player?.flashlight) {
            const beamAngleFalloff = Math.max(0, 1.0 - Math.abs(cameraX) * 1.4);
            const distFalloff = Math.max(0, 1.0 - transformY / 15.0);
            flashlightFactor = Math.pow(beamAngleFalloff, 1.4) * distFalloff * (player.flashlightFlicker ?? 1.0) * 1.4;
          }
          const ambientScale = player?.flashlight ? 1.0 : 0.22;
          const shade = Math.max(0.04, (1 - transformY / maxFogDist) * ambientScale * brightness + flashlightFactor);

          if (shade < 0.98) {
            ctx.fillStyle = `rgba(${fogRgb[0]}, ${fogRgb[1]}, ${fogRgb[2]}, ${Math.min(0.94, 1 - shade)})`;
            ctx.fillRect(stripe, drawStartY, 1, spriteHeight);
          } else if (shade > 1.0) {
            ctx.fillStyle = `rgba(255, 245, 205, ${Math.min(0.24, (shade - 1.0) * 0.35)})`;
            ctx.fillRect(stripe, drawStartY, 1, spriteHeight);
          }
        }
      }
    }
  }

  // --- Render Boss Shockwaves on Floor ---
  private renderShockwaves(
    ctx: CanvasRenderingContext2D,
    shockwaves: BossShockwave[],
    camView: CameraView | undefined,
    w: number,
    h: number,
    horizon: number
  ) {
    if (!shockwaves || shockwaves.length === 0 || !camView) return;

    const obsX = camView.x;
    const obsY = camView.y;
    const obsDirX = camView.dirX;
    const obsDirY = camView.dirY;
    const obsPlaneX = camView.planeX;
    const obsPlaneY = camView.planeY;
    const invDet = 1.0 / (obsPlaneX * obsDirY - obsDirX * obsPlaneY);

    ctx.save();
    for (let sIdx = 0; sIdx < shockwaves.length; sIdx++) {
      const sw = shockwaves[sIdx];
      if (sw.radius <= 0.1 || sw.life <= 0) continue;

      const numSegments = 36;
      const alpha = Math.max(0.1, Math.min(1.0, sw.life / 1.6)) * (sw.intensity || 1.0);
      const isPound = sw.type === 'pound';

      ctx.strokeStyle = isPound ? `rgba(255, 140, 30, ${alpha * 0.9})` : `rgba(255, 35, 35, ${alpha * 0.95})`;
      ctx.lineWidth = Math.max(2.5, Math.min(8, 16 / (sw.radius + 1)));
      ctx.shadowBlur = 10;
      ctx.shadowColor = isPound ? '#ff8800' : '#ff1100';

      ctx.beginPath();
      let isDrawing = false;

      for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2;
        const wx = sw.x + Math.cos(angle) * sw.radius;
        const wy = sw.y + Math.sin(angle) * sw.radius;

        const px = wx - obsX;
        const py = wy - obsY;

        const transformX = invDet * (obsDirY * px - obsDirX * py);
        const transformY = invDet * (-obsPlaneY * px + obsPlaneX * py);

        if (transformY > 0.18) {
          const screenX = Math.floor((w / 2) * (1 + transformX / transformY));
          const screenY = Math.floor(horizon + (h / transformY) * 0.5);

          const visible = screenX >= 0 && screenX < w && screenY >= 0 && screenY < h && transformY < (this.zBuffer[screenX] || 999) + 0.25;

          if (visible) {
            if (!isDrawing) {
              ctx.moveTo(screenX, screenY);
              isDrawing = true;
            } else {
              ctx.lineTo(screenX, screenY);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }

      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Render World Particles (Blood, Sparks, Smoke, Dust) ---

  private renderParticles(
    ctx: CanvasRenderingContext2D,
    player: Player,
    w: number,
    h: number,
    horizon: number,
    camView?: CameraView
  ) {
    const obsX = camView ? camView.x : player.x;
    const obsY = camView ? camView.y : player.y;
    const obsDirX = camView ? camView.dirX : player.dirX;
    const obsDirY = camView ? camView.dirY : player.dirY;
    const obsPlaneX = camView ? camView.planeX : player.planeX;
    const obsPlaneY = camView ? camView.planeY : player.planeY;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const px = p.x - obsX;
      const py = p.y - obsY;

      const invDet = 1.0 / (obsPlaneX * obsDirY - obsDirX * obsPlaneY);
      const transformX = invDet * (obsDirY * px - obsDirX * py);
      const transformY = invDet * (-obsPlaneY * px + obsPlaneX * py);

      if (transformY > 0.15) {
        const screenX = Math.floor((w / 2) * (1 + transformX / transformY));
        const screenY = Math.floor(horizon + (h / transformY) * (0.5 - p.z));

        if (screenX >= 0 && screenX < w && transformY < this.zBuffer[screenX]) {
          const alpha = Math.max(0.1, Math.min(1.0, p.life / p.maxLife));
          ctx.save();
          ctx.globalAlpha = alpha;

          if (p.type === 'spark') {
            const size = Math.max(1.5, (p.size * h) / (transformY * 45));
            ctx.fillStyle = p.color;
            ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
          } else if (p.type === 'smoke') {
            const size = Math.max(3, (p.size * h) / (transformY * 25));
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'dust') {
            const size = Math.max(1, (p.size * h) / (transformY * 65));
            ctx.fillStyle = player.flashlight ? 'rgba(255, 245, 200, 0.7)' : 'rgba(180, 180, 150, 0.3)';
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Blood
            const size = Math.max(2, (p.size * h) / (transformY * 35));
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    }
  }

  // --- Render HUD Shotgun with 5-Phase Fluid Animation ---
  // Fase 1: Posición normal (inclinada hacia arriba en la parte inferior, no apuntando al centro)
  // Fase 2: Preparación (hacia el centro)
  // Fase 3: Disparo (hacia adelante, fogonazo, sacudida, luz, perdigones)
  // Fase 4: Retroceso (hacia el jugador)
  // Fase 5: Recuperación (suave hacia arriba)

  private renderWeapon(
    ctx: CanvasRenderingContext2D,
    player: Player,
    w: number,
    h: number,
    weaponAlpha: number = 1.0
  ) {
    if (weaponAlpha <= 0.01) return;

    const scale = h / 250;
    const baseW = 320 * scale;
    const baseH = 260 * scale;

    // Normal / Relaxed Resting Position:
    // Placed in lower-right, tilted UPWARDS at ~24 degrees (-0.42 rad)
    const restX = w * 0.16;
    const restY = h * 0.12;
    const restAngle = -0.44; // tilted upward / pointing towards top-left

    // Subtle breathing and walking sway
    const swayX = player.isWalking ? Math.sin(player.walkTimer * 6) * 7 : Math.sin(Date.now() * 0.002) * 2;
    const swayY = player.isWalking ? Math.abs(Math.sin(player.walkTimer * 6)) * 8 : Math.cos(Date.now() * 0.002) * 2;

    // Shotgun position: stable during jump/landing
    let posX = restX + swayX;
    let posY = restY + swayY;
    let angle = restAngle;
    let currentFrame = textureCache.shotgunIdle;

    if (player.isShooting) {
      // 5-Phase Animation calculation
      // Total shooting duration is 0.52s
      const totalShotTime = 0.52;
      const progress = Math.max(0, Math.min(1, 1 - (player.shootTimer / totalShotTime)));

      if (progress < 0.15) {
        // FASE 2: PREPARACIÓN (Mueve rápidamente de posición de reposo inclinada hacia el centro)
        const t = progress / 0.15;
        // Ease-out quad
        const ease = 1 - (1 - t) * (1 - t);
        posX = restX * (1 - ease) + swayX * 0.3;
        posY = restY * (1 - ease);
        angle = restAngle * (1 - ease);
        currentFrame = textureCache.shotgunIdle;
      } else if (progress < 0.28) {
        // FASE 3: DISPARO (Apunta directamente hacia adelante, gran fogonazo)
        posX = 0;
        posY = -8;
        angle = 0; // Pointing dead center
        currentFrame = textureCache.shotgunFire;
      } else if (progress < 0.52) {
        // FASE 4: RETROCESO (Kicks backwards toward player, barrel kicks up slightly)
        const t = (progress - 0.28) / (0.52 - 0.28);
        posX = 0;
        posY = 36 * (1 - t);
        angle = 0.12 * (1 - t); // +7 degrees upward kick
        currentFrame = textureCache.shotgunRecoil;
      } else {
        // FASE 5: RECUPERACIÓN (Suavemente regresa a la posición normal inclinada hacia arriba)
        const t = (progress - 0.52) / (1.0 - 0.52);
        // Cubic ease-out
        const ease = 1 - Math.pow(1 - t, 3);
        posX = restX * ease + swayX * ease;
        posY = restY * ease + swayY * ease;
        angle = restAngle * ease;
        currentFrame = textureCache.shotgunIdle;
      }
    } else if (player.isReloading) {
      // Reloading animation: weapon lowers slightly, shells inserted, pumps
      const reloadProgress = 1 - (player.reloadTimer / 1.1);
      if (reloadProgress < 0.4) {
        posX = restX * 0.6;
        posY = restY + 45;
        angle = -0.2;
        currentFrame = textureCache.shotgunReload1;
      } else if (reloadProgress < 0.75) {
        posX = restX * 0.8;
        posY = restY + 25;
        angle = -0.3;
        currentFrame = textureCache.shotgunReload2;
      } else {
        const t = (reloadProgress - 0.75) / 0.25;
        posX = restX + (1 - t) * 10;
        posY = restY + (1 - t) * 20;
        angle = restAngle;
        currentFrame = textureCache.shotgunIdle;
      }
    }

    if (!currentFrame) return;

    // Draw transformed shotgun sprite with high-performance 2D matrix
    ctx.save();
    if (weaponAlpha < 1.0) {
      ctx.globalAlpha = Math.max(0, Math.min(1, weaponAlpha));
    }
    const pivotX = w / 2 + posX;
    const pivotY = h - 20 + posY;

    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);

    // Draw centered on handle/grip pivot
    ctx.drawImage(currentFrame, -baseW / 2, -baseH + 40, baseW, baseH);
    ctx.restore();
  }

  // --- Render Third-Person Tactical Aiming Reticle ---
  private renderThirdPersonReticle(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    alpha: number,
    player: Player
  ) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.95));

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    // Dynamic spread calculation (widens slightly on sprint, shooting, or airborne)
    let spread = 12;
    if (player.isWalking) spread += 5;
    if (player.isSprinting) spread += 9;
    if (player.isShooting) spread += 15;
    if (!player.isGrounded) spread += 8;

    const tickLen = 5;
    const isHit = player.damageFlash > 0.05;
    const color = isHit ? '#ef4444' : '#f59e0b';
    const glowColor = isHit ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.3)';

    // Center precision dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Subtle outer halo ring
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, spread, 0, Math.PI * 2);
    ctx.stroke();

    // 4 tactical crosshair brackets (Top, Bottom, Left, Right)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    // Top
    ctx.beginPath();
    ctx.moveTo(cx, cy - spread);
    ctx.lineTo(cx, cy - spread - tickLen);
    ctx.stroke();

    // Bottom
    ctx.beginPath();
    ctx.moveTo(cx, cy + spread);
    ctx.lineTo(cx, cy + spread + tickLen);
    ctx.stroke();

    // Left
    ctx.beginPath();
    ctx.moveTo(cx - spread, cy);
    ctx.lineTo(cx - spread - tickLen, cy);
    ctx.stroke();

    // Right
    ctx.beginPath();
    ctx.moveTo(cx + spread, cy);
    ctx.lineTo(cx + spread + tickLen, cy);
    ctx.stroke();

    ctx.restore();
  }

  // --- Firing & Hitscan Logic ---

  public shootShotgun(
    player: Player,
    chickens: Chicken[],
    levelOrMap?: any,
    onHitCallback?: (chicken: Chicken, damage: number) => void
  ): boolean {
    if (player.ammo <= 0 || player.isReloading || player.isShooting) {
      if (player.ammo <= 0) soundManager.playDryFire();
      return false;
    }

    // Resolve optional argument permutations safely
    let callback = onHitCallback;
    let map: number[][] | null = null;
    if (typeof levelOrMap === 'function') {
      callback = levelOrMap;
    } else if (Array.isArray(levelOrMap)) {
      map = levelOrMap;
    } else if (levelOrMap && Array.isArray(levelOrMap.map)) {
      map = levelOrMap.map;
    }
    const activeMap = map || this.currentMap;

    // Deduct ammo & trigger 5-phase shooting state
    player.ammo--;
    player.isShooting = true;
    player.shootTimer = 0.52;
    player.recoil = 1.0;
    player.muzzleFlash = 1.0;
    player.cameraShake = 1.0;

    // Audio blast
    soundManager.playShotgun();

    // Muzzle smoke
    this.spawnSmoke(player.x + player.dirX * 0.45, player.y + player.dirY * 0.45, 0.45, 6);

    // Ejected brass/red shotgun shell casing flying to the right
    const rightX = -player.dirY;
    const rightY = player.dirX;
    this.particles.push({
      x: player.x + player.dirX * 0.2 + rightX * 0.25,
      y: player.y + player.dirY * 0.2 + rightY * 0.25,
      z: 0.45,
      vx: rightX * (0.8 + Math.random() * 0.5) - player.dirX * 0.2,
      vy: rightY * (0.8 + Math.random() * 0.5) - player.dirY * 0.2,
      vz: 0.6 + Math.random() * 0.4,
      color: '#d97706',
      size: 2.2,
      life: 0.8,
      maxLife: 0.8,
      type: 'spark'
    });

    // Shotgun buckshot pellet hitscan (10 pellets)
    const pelletCount = 10;
    let hitAny = false;
    const chickenHits = new Map<Chicken, number>();

    for (let p = 0; p < pelletCount; p++) {
      // Natural cone spread relative to camera plane
      // Pellet 0 is dead center (crosshair exact alignment)
      const spread = p === 0 ? 0 : (Math.random() - 0.5) * 0.14;
      let shotDirX = player.dirX + player.planeX * spread;
      let shotDirY = player.dirY + player.planeY * spread;
      const dirLen = Math.hypot(shotDirX, shotDirY) || 1;
      shotDirX /= dirLen;
      shotDirY /= dirLen;

      // 1. Trace wall collision along ray using DDA (Digital Differential Analyzer)
      let hitWallDist = 24.0;
      let hitWallX = player.x + shotDirX * 24.0;
      let hitWallY = player.y + shotDirY * 24.0;

      if (activeMap) {
        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);
        const deltaDistX = Math.abs(1 / (shotDirX || 0.00001));
        const deltaDistY = Math.abs(1 / (shotDirY || 0.00001));
        let sideDistX = 0;
        let sideDistY = 0;
        let stepX = 0;
        let stepY = 0;
        let side = 0;

        if (shotDirX < 0) {
          stepX = -1;
          sideDistX = (player.x - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
        }
        if (shotDirY < 0) {
          stepY = -1;
          sideDistY = (player.y - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
        }

        let hit = false;
        let ddaSteps = 0;
        while (!hit && ddaSteps < 40) {
          ddaSteps++;
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }

          if (mapY >= 0 && mapY < activeMap.length && mapX >= 0 && mapX < (activeMap[mapY]?.length || 0)) {
            if (activeMap[mapY][mapX] > 0) {
              hit = true;
              let perpWallDist = 0;
              if (side === 0) {
                perpWallDist = (mapX - player.x + (1 - stepX) / 2) / (shotDirX || 0.00001);
              } else {
                perpWallDist = (mapY - player.y + (1 - stepY) / 2) / (shotDirY || 0.00001);
              }
              // Prevent false hits inside player collision radius
              if (perpWallDist > 0.22) {
                hitWallDist = perpWallDist;
                hitWallX = player.x + shotDirX * hitWallDist;
                hitWallY = player.y + shotDirY * hitWallDist;
              }
            }
          } else {
            break;
          }
        }
      }

      // 2. Check enemy cylinder collision along ray
      let closestHitDist = hitWallDist;
      let closestChicken: Chicken | null = null;

      for (let i = 0; i < chickens.length; i++) {
        const c = chickens[i];
        if (c.state === 'dead' || c.health <= 0) continue;

        const toEnemyX = c.x - player.x;
        const toEnemyY = c.y - player.y;

        // Projection along ray
        const proj = toEnemyX * shotDirX + toEnemyY * shotDirY;
        // Point blank allows hitting point-blank attackers
        if (proj <= 0.05 || proj >= closestHitDist) continue;

        // Distance squared from pellet line to chicken center
        const perpDistSq = Math.max(0, (toEnemyX * toEnemyX + toEnemyY * toEnemyY) - (proj * proj));
        const isBoss = c.isBoss || c.type === 'boss';
        // Generous, accurate hitboxes matching visual sprite sizes
        const hitRadius = isBoss ? 1.45 : c.type === 'tank' ? 1.0 : c.type === 'lurker' ? 0.68 : 0.78;

        if (perpDistSq <= hitRadius * hitRadius) {
          closestHitDist = proj;
          closestChicken = c;
        }
      }

      if (closestChicken) {
        hitAny = true;
        const pelletDmg = 16 + Math.floor(Math.random() * 8); // 16-24 dmg per pellet
        chickenHits.set(closestChicken, (chickenHits.get(closestChicken) || 0) + pelletDmg);
      } else if (hitWallDist < 24.0) {
        this.spawnWallSparks(hitWallX, hitWallY, 0.45, 3);
        if (p === 0) soundManager.playWallImpactSparks();
      }
    }

    // Apply accumulated damage per chicken
    chickenHits.forEach((totalDamage, chicken) => {
      this.spawnBlood(chicken.x, chicken.y, 0.45, Math.min(28, Math.floor(totalDamage / 2.5)));
      if (callback) {
        callback(chicken, totalDamage);
      }
    });

    return hitAny;
  }
}
