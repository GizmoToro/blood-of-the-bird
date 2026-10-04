import { Chicken, Player, LevelData, ThrownBomb, SpittedProjectile, BossShockwave } from '../types';
import { soundManager } from './audio';
import { ENEMY_ACCELERATION_RATE, ENEMY_SPEED_SCALE } from './spawner';

// Helper: check if line of sight between two points is blocked by walls
export function hasLineOfSight(x0: number, y0: number, x1: number, y1: number, map: number[][]): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.05) return true;

  const steps = Math.ceil(dist * 3);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const mx = Math.floor(x0 + dx * t);
    const my = Math.floor(y0 + dy * t);
    if (map[my] && map[my][mx] && map[my][mx] > 0) {
      return false;
    }
  }
  return true;
}

// Check if a line of sight between two positions intersects a solid wall (for 3D audio occlusion)
export function checkWallOcclusion(x0: number, y0: number, x1: number, y1: number, map: number[][]): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.6) return false;
  const steps = Math.min(25, Math.ceil(dist * 2.0));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const sx = Math.floor(x0 + dx * t);
    const sy = Math.floor(y0 + dy * t);
    if (map[sy] && map[sy][sx] > 0 && map[sy][sx] !== 9) {
      return true;
    }
  }
  return false;
}

// Check if a circular body collides with map walls
export function isWalkable(x: number, y: number, radius: number, map: number[][]): boolean {
  const minX = Math.floor(x - radius);
  const maxX = Math.floor(x + radius);
  const minY = Math.floor(y - radius);
  const maxY = Math.floor(y + radius);

  for (let my = minY; my <= maxY; my++) {
    for (let mx = minX; mx <= maxX; mx++) {
      if (!map[my] || map[my][mx] === undefined || map[my][mx] > 0) {
        // Wall exists at mx, my. Check circle-AABB distance
        const closestX = Math.max(mx, Math.min(x, mx + 1));
        const closestY = Math.max(my, Math.min(y, my + 1));
        const distSq = (x - closestX) ** 2 + (y - closestY) ** 2;
        if (distSq < radius * radius) {
          return false;
        }
      }
    }
  }
  return true;
}

// Ensure player is never paralyzed or trapped inside a wall block
export function resolvePlayerWallPenetration(
  player: { x: number; y: number },
  radius: number,
  map: number[][]
): boolean {
  if (isWalkable(player.x, player.y, radius, map)) {
    return false;
  }

  let adjusted = false;
  const currentCellX = Math.floor(player.x);
  const currentCellY = Math.floor(player.y);

  // If player's center is literally inside a solid tile, teleport to the nearest empty neighbor
  if (map[currentCellY] && map[currentCellY][currentCellX] > 0) {
    let bestDist = Infinity;
    let bestTargetX = player.x;
    let bestTargetY = player.y;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const tx = currentCellX + dx;
        const ty = currentCellY + dy;
        if (map[ty] && map[ty][tx] === 0) {
          const targetCenterX = tx + 0.5;
          const targetCenterY = ty + 0.5;
          const d = Math.hypot(player.x - targetCenterX, player.y - targetCenterY);
          if (d < bestDist) {
            bestDist = d;
            bestTargetX = targetCenterX;
            bestTargetY = targetCenterY;
          }
        }
      }
    }

    if (bestDist < Infinity) {
      player.x = bestTargetX;
      player.y = bestTargetY;
      adjusted = true;
    }
  }

  // Smooth depenetration push from overlapping wall edges
  const minX = Math.floor(player.x - radius);
  const maxX = Math.floor(player.x + radius);
  const minY = Math.floor(player.y - radius);
  const maxY = Math.floor(player.y + radius);

  let pushX = 0;
  let pushY = 0;

  for (let my = minY; my <= maxY; my++) {
    for (let mx = minX; mx <= maxX; mx++) {
      if (!map[my] || map[my][mx] === undefined || map[my][mx] > 0) {
        const closestX = Math.max(mx, Math.min(player.x, mx + 1));
        const closestY = Math.max(my, Math.min(player.y, my + 1));
        const diffX = player.x - closestX;
        const diffY = player.y - closestY;
        const dist = Math.hypot(diffX, diffY);
        if (dist < radius && dist > 0.0001) {
          const overlap = radius - dist + 0.005;
          pushX += (diffX / dist) * overlap;
          pushY += (diffY / dist) * overlap;
        } else if (dist <= 0.0001) {
          pushX += (player.x - (mx + 0.5)) * 0.1;
          pushY += (player.y - (my + 0.5)) * 0.1;
        }
      }
    }
  }

  if (Math.hypot(pushX, pushY) > 0.0001) {
    const testX = player.x + pushX;
    const testY = player.y + pushY;
    if (isWalkable(testX, testY, radius, map)) {
      player.x = testX;
      player.y = testY;
      adjusted = true;
    } else {
      if (isWalkable(testX, player.y, radius, map)) {
        player.x = testX;
        adjusted = true;
      }
      if (isWalkable(player.x, testY, radius, map)) {
        player.y = testY;
        adjusted = true;
      }
    }
  }

  // Guaranteed anti-stuck fallback: if player is still intersecting any geometry,
  // search concentric rings at 16 angles to snap immediately to the closest safe walkable position
  if (!isWalkable(player.x, player.y, radius, map)) {
    const angles = 16;
    let found = false;
    for (let dist = 0.04; dist <= 0.8; dist += 0.04) {
      for (let a = 0; a < angles; a++) {
        const rad = (a / angles) * Math.PI * 2;
        const candX = player.x + Math.cos(rad) * dist;
        const candY = player.y + Math.sin(rad) * dist;
        if (isWalkable(candX, candY, radius, map)) {
          player.x = candX;
          player.y = candY;
          adjusted = true;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  return adjusted;
}

// Ensure chickens never penetrate walls or get stuck inside solid obstacles
export function resolveChickenWallPenetration(
  chicken: { x: number; y: number },
  radius: number,
  map: number[][]
): boolean {
  if (isWalkable(chicken.x, chicken.y, radius, map)) {
    return false;
  }

  const currentCellX = Math.floor(chicken.x);
  const currentCellY = Math.floor(chicken.y);

  // If chicken center is inside a solid wall tile, move to closest empty adjacent tile
  if (map[currentCellY] && map[currentCellY][currentCellX] > 0) {
    let bestDist = Infinity;
    let bestTargetX = chicken.x;
    let bestTargetY = chicken.y;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const tx = currentCellX + dx;
        const ty = currentCellY + dy;
        if (map[ty] && map[ty][tx] === 0) {
          const targetCenterX = tx + 0.5;
          const targetCenterY = ty + 0.5;
          const d = Math.hypot(chicken.x - targetCenterX, chicken.y - targetCenterY);
          if (d < bestDist) {
            bestDist = d;
            bestTargetX = targetCenterX;
            bestTargetY = targetCenterY;
          }
        }
      }
    }

    if (bestDist < Infinity) {
      chicken.x = bestTargetX;
      chicken.y = bestTargetY;
      return true;
    }
  }

  // Smooth depenetration push away from overlapping wall edges
  const minX = Math.floor(chicken.x - radius);
  const maxX = Math.floor(chicken.x + radius);
  const minY = Math.floor(chicken.y - radius);
  const maxY = Math.floor(chicken.y + radius);

  let pushX = 0;
  let pushY = 0;

  for (let my = minY; my <= maxY; my++) {
    for (let mx = minX; mx <= maxX; mx++) {
      if (!map[my] || map[my][mx] === undefined || map[my][mx] > 0) {
        const closestX = Math.max(mx, Math.min(chicken.x, mx + 1));
        const closestY = Math.max(my, Math.min(chicken.y, my + 1));
        const diffX = chicken.x - closestX;
        const diffY = chicken.y - closestY;
        const dist = Math.hypot(diffX, diffY);
        if (dist < radius && dist > 0.0001) {
          const overlap = radius - dist + 0.005;
          pushX += (diffX / dist) * overlap;
          pushY += (diffY / dist) * overlap;
        } else if (dist <= 0.0001) {
          pushX += (chicken.x - (mx + 0.5)) * 0.1;
          pushY += (chicken.y - (my + 0.5)) * 0.1;
        }
      }
    }
  }

  if (Math.hypot(pushX, pushY) > 0.0001) {
    const testX = chicken.x + pushX;
    const testY = chicken.y + pushY;
    if (isWalkable(testX, testY, radius, map)) {
      chicken.x = testX;
      chicken.y = testY;
      return true;
    } else {
      if (isWalkable(testX, chicken.y, radius, map)) {
        chicken.x = testX;
        return true;
      }
      if (isWalkable(chicken.x, testY, radius, map)) {
        chicken.y = testY;
        return true;
      }
    }
  }

  return false;
}

// Move entity with strict axial wall sliding collision
export function moveChickenWithSlide(
  chicken: Chicken,
  vx: number,
  vy: number,
  radius: number,
  map: number[][]
) {
  const nextX = chicken.x + vx;
  const nextY = chicken.y + vy;

  // 1. Try full diagonal move
  if (isWalkable(nextX, nextY, radius, map)) {
    chicken.x = nextX;
    chicken.y = nextY;
    return;
  }

  // 2. Try sliding along X axis
  if (isWalkable(nextX, chicken.y, radius, map)) {
    chicken.x = nextX;
  }

  // 3. Try sliding along Y axis
  if (isWalkable(chicken.x, nextY, radius, map)) {
    chicken.y = nextY;
  }
}

// --- BFS Flowfield Navigation Engine for Smooth Cornering ---
let cachedPlayerGridX = -1;
let cachedPlayerGridY = -1;
let cachedMapRef: number[][] | null = null;
let cachedFlowDirs: { dx: number; dy: number }[][] = [];
let lastFlowfieldComputeTime = 0;

export function updateFlowfield(playerX: number, playerY: number, map: number[][]) {
  const pGridX = Math.floor(playerX);
  const pGridY = Math.floor(playerY);
  const now = performance.now();

  if (
    cachedMapRef === map &&
    cachedPlayerGridX === pGridX &&
    cachedPlayerGridY === pGridY &&
    now - lastFlowfieldComputeTime < 350
  ) {
    return;
  }

  const height = map.length;
  const width = map[0]?.length || 0;
  if (width === 0 || height === 0) return;

  const distGrid: number[][] = Array.from({ length: height }, () => new Array(width).fill(-1));
  const dirGrid: { dx: number; dy: number }[][] = Array.from({ length: height }, () =>
    new Array(width).fill({ dx: 0, dy: 0 })
  );

  const queue: [number, number][] = [];

  if (pGridY >= 0 && pGridY < height && pGridX >= 0 && pGridX < width) {
    distGrid[pGridY][pGridX] = 0;
    queue.push([pGridX, pGridY]);
  }

  const neighbors = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    const curDist = distGrid[cy][cx];

    for (let i = 0; i < 4; i++) {
      const nx = cx + neighbors[i].dx;
      const ny = cy + neighbors[i].dy;

      if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
        if (map[ny][nx] === 0 && distGrid[ny][nx] === -1) {
          distGrid[ny][nx] = curDist + 1;
          dirGrid[ny][nx] = { dx: cx - nx, dy: cy - ny };
          queue.push([nx, ny]);
        }
      }
    }
  }

  cachedPlayerGridX = pGridX;
  cachedPlayerGridY = pGridY;
  cachedMapRef = map;
  cachedFlowDirs = dirGrid;
  lastFlowfieldComputeTime = now;
}

// Noise alert propagation (gunshots, sprint footsteps)
export function notifyNoise(x: number, y: number, radius: number, chickens: Chicken[], player: Player) {
  for (let i = 0; i < chickens.length; i++) {
    const c = chickens[i];
    if (c.state === 'dead') continue;
    const dist = Math.hypot(x - c.x, y - c.y);
    if (dist <= radius) {
      if (c.isBoss || c.type === 'boss') {
        if (c.state === 'idle' || c.state === 'patrol') {
          c.state = 'chase';
          c.investigateTarget = { x, y };
          soundManager.playBossRoar();
        }
      } else if (c.state === 'idle' || c.state === 'patrol') {
        c.state = 'alert';
        c.alertTimer = 1.8;
        c.investigateTarget = { x, y };
        soundManager.playChickenCluck(c.x, c.y, player.x, player.y, player.dirX, player.dirY);
      } else if (c.state === 'search') {
        c.investigateTarget = { x, y };
        c.searchTimer = 3.5;
      }
    }
  }
}

// Apply bullet damage, flinch, and knockback
export function damageChicken(
  chicken: Chicken,
  damage: number,
  playerX: number,
  playerY: number,
  map: number[][],
  onKill: () => void
) {
  if (chicken.state === 'dead') return;

  const isBoss = chicken.isBoss || chicken.type === 'boss';
  let actualDamage = damage;

  // Gallardo Boss Vulnerability Window:
  // When exhausted after a missed charge or ground slam, he takes 1.5x extra damage!
  if (isBoss) {
    if (chicken.state === 'exhausted') {
      actualDamage = Math.round(damage * 1.5);
    } else if (chicken.isTransitioning) {
      actualDamage = Math.round(damage * 0.5); // Reduced damage during cinematic rage transition
    }
  }

  chicken.health -= actualDamage;

  if (chicken.health <= 0) {
    chicken.health = 0;
    chicken.state = 'dead';
    chicken.deadTimer = 0;
    if (isBoss) {
      soundManager.playBossDeathGroan();
    } else {
      const isOcc = checkWallOcclusion(chicken.x, chicken.y, playerX, playerY, map);
      soundManager.playChickenDeath(chicken.x, chicken.y, playerX, playerY, 0, 0, chicken.type || 'white', isOcc);
    }
    onKill();
    return;
  }

  // Knockback away from shot - strictly respect wall collisions
  const dx = chicken.x - playerX;
  const dy = chicken.y - playerY;
  const dist = Math.hypot(dx, dy) || 1;
  const bossRadius = 0.48;
  const regularRadius = 0.32;
  const wallRadius = isBoss ? bossRadius : regularRadius;
  const knockbackDist = isBoss ? 0.04 : 0.28;
  const kx = (dx / dist) * knockbackDist;
  const ky = (dy / dist) * knockbackDist;

  if (isWalkable(chicken.x + kx, chicken.y, wallRadius, map)) chicken.x += kx;
  if (isWalkable(chicken.x, chicken.y + ky, wallRadius, map)) chicken.y += ky;

  // Gallardo Boss rage reaction: damage ignites burning red rage
  if (isBoss) {
    soundManager.playBossHurt();
    chicken.rageTimer = 4.0 + Math.random() * 2.0;
    chicken.rageIntensity = 1.0;
    if (chicken.state === 'idle' || chicken.state === 'patrol' || chicken.state === 'search' || chicken.state === 'alert') {
      chicken.state = 'chase';
      soundManager.playBossRoar();
    }
    // Brief stagger timer without breaking charge or jump animations
    chicken.damagedTimer = 0.10;
    if (
      chicken.state !== 'charge' &&
      chicken.state !== 'windup' &&
      chicken.state !== 'exhausted' &&
      chicken.state !== 'jump' &&
      chicken.state !== 'slam' &&
      !chicken.isTransitioning
    ) {
      chicken.state = 'damaged';
    }
  } else {
    // Regular chicken alerts and charges at player on taking damage
    if (chicken.state !== 'chase' && chicken.state !== 'attack') {
      chicken.state = 'chase';
      const isOcc = checkWallOcclusion(chicken.x, chicken.y, playerX, playerY, map);
      soundManager.playChickenShriek(chicken.x, chicken.y, playerX, playerY, 0, 0, chicken.type || 'white', isOcc);
    }
    chicken.state = 'damaged';
    chicken.damagedTimer = 0.22;
  }
}

let frameCounter = 0;

export function updateChickens(
  chickens: Chicken[],
  player: Player,
  level: LevelData,
  dt: number,
  onPlayerDamage: (amount: number) => void,
  projectiles: SpittedProjectile[] = [],
  onEliminateChicken?: (chicken: Chicken) => void,
  shockwaves?: BossShockwave[],
  onBossSlamImpact?: (x: number, y: number) => void,
  isVictory: boolean = false
) {
  // Global Victory State: Pacify all remaining enemies immediately, stop all movement and attacks
  if (isVictory) {
    for (let i = 0; i < chickens.length; i++) {
      const c = chickens[i];
      if (c.state !== 'dead') {
        c.state = 'idle';
        c.vx = 0;
        c.vy = 0;
        c.attackCooldown = 999;
      }
    }
    if (shockwaves) shockwaves.length = 0;
    return;
  }

  frameCounter++;
  const map = level.map;
  updateFlowfield(player.x, player.y, map);
  let highestThreat: 'ambient' | 'tension' | 'chase' | 'boss' | 'boss_enraged' = 'ambient';

  for (let i = 0; i < chickens.length; i++) {
    const chicken = chickens[i];
    const isBoss = chicken.isBoss || chicken.type === 'boss';

    // Initialize Boss "GALLARDO" state if needed
    if (isBoss) {
      if (!chicken.isBoss) chicken.isBoss = true;
      if (!chicken.maxHealth || chicken.maxHealth < 2000) {
        chicken.maxHealth = 3500;
        chicken.health = 3500;
      }
      if (!chicken.bossPhase) chicken.bossPhase = 1;
      if (chicken.chargeCooldown === undefined) chicken.chargeCooldown = 3.5;
      if (chicken.slamCooldown === undefined) chicken.slamCooldown = 6.0;
      if (chicken.groundPoundCooldown === undefined) chicken.groundPoundCooldown = 5.0;
      if (!chicken.speed || chicken.speed < 1.8) chicken.speed = 2.1;
    }

    if (chicken.state === 'dead') {
      chicken.deadTimer += dt;
      if (chicken.deadTimer >= 2.0) {
        if (onEliminateChicken) {
          onEliminateChicken(chicken);
        }
        chickens.splice(i, 1);
        i--;
      }
      continue;
    }

    const distToPlayer = Math.hypot(player.x - chicken.x, player.y - chicken.y);
    chicken.distToPlayer = distToPlayer;

    // Boss "GALLARDO" 4-Phase Evolution & Enrage State Engine
    if (isBoss) {
      // 1. Tick Rage Timer
      if ((chicken.rageTimer ?? 0) > 0) {
        chicken.rageTimer = (chicken.rageTimer ?? 0) - dt;
        chicken.rageIntensity = Math.min(1.0, (chicken.rageTimer ?? 0) / 1.5);
      } else if (chicken.bossPhase === 4) {
        // In Phase 4, Gallardo remains perpetually furious
        chicken.rageIntensity = 0.9 + Math.sin(Date.now() * 0.006) * 0.1;
      } else {
        chicken.rageIntensity = Math.max(0, (chicken.rageIntensity ?? 0) - dt * 1.5);
      }

      // 2. Evaluate 4-Phase Progression (100% -> 70% -> 40% -> 20%)
      const hp = chicken.health;
      const maxHp = chicken.maxHealth || 3500;
      const hpRatio = hp / maxHp;

      if (hpRatio <= 0.20 && (chicken.bossPhase ?? 1) < 4) {
        chicken.bossPhase = 4;
        chicken.isTransitioning = true;
        chicken.transitionTimer = 1.1;
        chicken.speed = 3.35;
        chicken.chargeCooldown = 2.0;
        chicken.slamCooldown = 4.5;
        chicken.groundPoundCooldown = 3.0;
        chicken.rageTimer = 999.0;
        chicken.rageIntensity = 1.0;
        soundManager.playBossRageCry();
        player.cameraShake = Math.max(player.cameraShake, 28);
      } else if (hpRatio <= 0.40 && (chicken.bossPhase ?? 1) < 3) {
        chicken.bossPhase = 3;
        chicken.isTransitioning = true;
        chicken.transitionTimer = 1.3;
        chicken.speed = 2.95;
        chicken.chargeCooldown = 2.8;
        chicken.slamCooldown = 5.5;
        chicken.groundPoundCooldown = 2.0;
        chicken.rageTimer = 12.0;
        chicken.rageIntensity = 1.0;
        soundManager.playBossRageCry();
        player.cameraShake = Math.max(player.cameraShake, 24);

        // Frenzy minions on the map with controlled speed
        for (let m = 0; m < chickens.length; m++) {
          if (chickens[m] !== chicken && chickens[m].state !== 'dead') {
            chickens[m].state = 'chase';
            chickens[m].speed = Math.max(chickens[m].speed, 1.4);
          }
        }
      } else if (hpRatio <= 0.70 && (chicken.bossPhase ?? 1) < 2) {
        chicken.bossPhase = 2;
        chicken.isTransitioning = true;
        chicken.transitionTimer = 1.2;
        chicken.speed = 2.55;
        chicken.chargeCooldown = 3.2;
        chicken.slamCooldown = 3.0;
        chicken.rageTimer = 6.0;
        chicken.rageIntensity = 0.8;
        soundManager.playBossRageCry();
        player.cameraShake = Math.max(player.cameraShake, 20);
      }

      // Dynamic Music Threat
      if ((chicken.bossPhase ?? 1) >= 3 || (chicken.rageIntensity ?? 0) > 0.4) {
        highestThreat = 'boss_enraged';
      } else {
        highestThreat = 'boss';
      }
    } else {
      // Evaluate threat for normal chickens
      if (chicken.state === 'chase' || chicken.state === 'attack') {
        if (highestThreat !== 'boss' && highestThreat !== 'boss_enraged') {
          highestThreat = 'chase';
        }
      } else if (distToPlayer < 9 && highestThreat === 'ambient') {
        highestThreat = 'tension';
      }
    }

    // Tick cooldowns
    if (chicken.attackCooldown > 0) chicken.attackCooldown -= dt;
    if (chicken.soundCooldown > 0) chicken.soundCooldown -= dt;
    if (chicken.patrolTimer > 0) chicken.patrolTimer -= dt;
    if (chicken.chargeCooldown && chicken.chargeCooldown > 0) chicken.chargeCooldown -= dt;

    // Random idle/patrol sounds
    if (chicken.soundCooldown <= 0 && distToPlayer < 16) {
      if (isBoss) {
        if (Math.random() < 0.25) {
          soundManager.playBossRoar();
          chicken.soundCooldown = 5.0 + Math.random() * 5.0;
        }
      } else if (Math.random() < 0.22) {
        const isOcc = checkWallOcclusion(chicken.x, chicken.y, player.x, player.y, map);
        soundManager.playChickenCluck(chicken.x, chicken.y, player.x, player.y, player.dirX, player.dirY, chicken.type || 'white', isOcc);
        chicken.soundCooldown = 4.5 + Math.random() * 6.5;
      }
    }

    // Check player gunshot and movement noise alert (corridor acoustics)
    if (!isBoss && (chicken.state === 'idle' || chicken.state === 'patrol' || chicken.state === 'search' || chicken.state === 'alert')) {
      if (player.shootTimer > 0.32 && distToPlayer < 55.0) {
        chicken.state = 'chase';
        const isOcc = checkWallOcclusion(chicken.x, chicken.y, player.x, player.y, map);
        soundManager.playChickenShriek(chicken.x, chicken.y, player.x, player.y, player.dirX, player.dirY, chicken.type || 'white', isOcc);
        chicken.soundCooldown = 1.8;
      } else if (player.isSprinting && player.isWalking && distToPlayer < 22.0) {
        chicken.state = 'chase';
      } else if (player.isWalking && distToPlayer < 9.0) {
        chicken.state = 'chase';
      } else if (distToPlayer < 18.0 && Math.random() < 0.08) {
        // Subtle vibration/scent detection in enclosed horror bunker
        chicken.state = 'search';
        chicken.investigateTarget = { x: player.x, y: player.y };
        chicken.searchTimer = 5.0;
      }
    }

    // Extended-range vision check with line of sight
    const visionRange = isBoss ? 50 : (chicken.type === 'red' ? 45 : (chicken.type === 'tank' ? 38 : (chicken.type === 'spitter' || chicken.type === 'lurker' ? 36 : 32)));
    let canSee = false;
    if (distToPlayer < visionRange) {
      if (chicken.behavior === 'ambush' && distToPlayer > 8.0) {
        canSee = false;
      } else {
        canSee = hasLineOfSight(chicken.x, chicken.y, player.x, player.y, map);
      }
      if (canSee && (chicken.state === 'idle' || chicken.state === 'patrol' || chicken.state === 'search' || chicken.state === 'alert')) {
        chicken.state = 'chase';
        if (isBoss) {
          soundManager.playBossRoar();
        } else if (Math.random() < 0.4) {
          const isOcc = checkWallOcclusion(chicken.x, chicken.y, player.x, player.y, map);
          soundManager.playChickenShriek(chicken.x, chicken.y, player.x, player.y, player.dirX, player.dirY, chicken.type || 'white', isOcc);
        }
      }
    }

    // --- BOSS SPECIAL BEHAVIOR ENGINE ---
    if (isBoss) {
      // 0. Ensure Boss speed is calibrated for current phase
      const basePhaseSpeed = (chicken.bossPhase ?? 1) >= 4 ? 3.35 : (chicken.bossPhase ?? 1) === 3 ? 2.95 : (chicken.bossPhase ?? 1) === 2 ? 2.55 : 2.1;
      if (!chicken.speed || chicken.speed < 1.8) {
        chicken.speed = basePhaseSpeed;
      }

      // 0.1 Phase transition roar freeze
      if (chicken.isTransitioning) {
        chicken.transitionTimer = (chicken.transitionTimer || 0) - dt;
        chicken.animFrame = 1;
        player.cameraShake = Math.max(player.cameraShake, 12);
        if ((chicken.transitionTimer || 0) <= 0) {
          chicken.isTransitioning = false;
          chicken.state = 'chase';
        }
        continue;
      }

      // 1. Handle Boss Damaged / Flinch
      if (chicken.state === 'damaged') {
        chicken.damagedTimer = (chicken.damagedTimer || 0) - dt;
        chicken.animFrame = 1;
        if ((chicken.damagedTimer || 0) <= 0) {
          chicken.state = 'chase';
        }
        continue;
      }

      // 2. Idle / Patrol / Unknown States -> Immediately awaken and Chase
      if (chicken.state === 'idle' || chicken.state === 'patrol' || chicken.state === 'search' || chicken.state === 'alert') {
        chicken.state = 'chase';
        soundManager.playBossRoar();
        chicken.soundCooldown = 2.5;
      }

      // Decrement special ability cooldowns
      if ((chicken.chargeCooldown || 0) > 0) chicken.chargeCooldown = (chicken.chargeCooldown || 0) - dt;
      if ((chicken.slamCooldown || 0) > 0) chicken.slamCooldown = (chicken.slamCooldown || 0) - dt;
      if ((chicken.groundPoundCooldown || 0) > 0) chicken.groundPoundCooldown = (chicken.groundPoundCooldown || 0) - dt;
      if ((chicken.soundCooldown || 0) > 0) chicken.soundCooldown = (chicken.soundCooldown || 0) - dt;

      if (chicken.state === 'chase') {
        // Heavy footsteps cadence with varied footfalls (left/right alternating audio)
        if (Math.floor(chicken.animTimer) % 2 === 0 && (chicken.soundCooldown || 0) <= 0) {
          chicken.stepAlternate = !chicken.stepAlternate;
          soundManager.playBossStepVaried(chicken.stepAlternate, chicken.speed >= 2.6);
          chicken.soundCooldown = chicken.speed >= 2.8 ? 0.32 : 0.46;
        }

        // Periodic visceral breathing
        chicken.breatheTimer = (chicken.breatheTimer || 0) - dt;
        if (chicken.breatheTimer <= 0) {
          soundManager.playBossBreathing((chicken.bossPhase ?? 1) >= 3 || (chicken.rageIntensity ?? 0) > 0.4);
          chicken.breatheTimer = 2.0 + Math.random() * 1.8;
        }

        const hasLos = hasLineOfSight(chicken.x, chicken.y, player.x, player.y, map);

        // Priority 1: Ground Slam (Phase 3+) at close range
        if (
          (chicken.bossPhase ?? 1) >= 3 &&
          (chicken.groundPoundCooldown || 0) <= 0 &&
          distToPlayer <= 3.2 &&
          hasLos
        ) {
          chicken.state = 'slam';
          chicken.slamTimer = 0.5;
          soundManager.playBossChargeWindup();
          player.cameraShake = Math.max(player.cameraShake, 6);
          continue;
        }

        // Priority 2: Jump + Shockwave (Phase 2+) at mid/long range
        if (
          (chicken.bossPhase ?? 1) >= 2 &&
          (chicken.slamCooldown || 0) <= 0 &&
          distToPlayer >= 3.5 &&
          distToPlayer <= 14 &&
          hasLos
        ) {
          chicken.state = 'jump';
          chicken.jumpTimer = 0;
          chicken.jumpDuration = (chicken.bossPhase ?? 1) >= 4 ? 0.85 : 1.05;
          chicken.jumpElevation = 0;
          const jdx = player.x - chicken.x;
          const jdy = player.y - chicken.y;
          const jDist = Math.hypot(jdx, jdy) || 1;
          chicken.patrolTarget = { x: jdx / jDist, y: jdy / jDist };
          soundManager.playBossJumpWhoosh();
          player.cameraShake = Math.max(player.cameraShake, 10);
          continue;
        }

        // Priority 3: Close melee attack
        if (distToPlayer <= 1.45) {
          chicken.state = 'attack';
          chicken.animFrame = 0;
          chicken.animTimer = 0;
        } else if (
          (chicken.chargeCooldown || 0) <= 0 &&
          distToPlayer >= 2.5 &&
          distToPlayer <= 15 &&
          hasLos
        ) {
          // Priority 4: Charge Telegraph
          chicken.state = 'windup';
          chicken.chargeTimer = (chicken.bossPhase ?? 1) >= 4 ? 0.55 : (chicken.bossPhase ?? 1) === 3 ? 0.7 : (chicken.bossPhase ?? 1) === 2 ? 0.85 : 1.1;
          chicken.chargeTarget = { x: player.x, y: player.y };
          soundManager.playBossChargeWindup();
          player.cameraShake = Math.max(player.cameraShake, 6);
          continue;
        } else {
          // Stalk towards player: use direct path when visible, flowfield when rounding corners
          let targetX = player.x;
          let targetY = player.y;

          if (!hasLos) {
            const cGridX = Math.floor(chicken.x);
            const cGridY = Math.floor(chicken.y);
            if (cachedFlowDirs[cGridY] && cachedFlowDirs[cGridY][cGridX]) {
              const flow = cachedFlowDirs[cGridY][cGridX];
              if (flow.dx !== 0 || flow.dy !== 0) {
                targetX = cGridX + flow.dx + 0.5;
                targetY = cGridY + flow.dy + 0.5;
              }
            }
          }

          const dx = targetX - chicken.x;
          const dy = targetY - chicken.y;
          const pDist = Math.hypot(dx, dy);
          if (pDist > 0.01) {
            const desiredVx = (dx / pDist) * chicken.speed;
            const desiredVy = (dy / pDist) * chicken.speed;
            const steer = Math.min(1.0, dt * (ENEMY_ACCELERATION_RATE * 0.95));
            chicken.vx = (chicken.vx || 0) + (desiredVx - (chicken.vx || 0)) * steer;
            chicken.vy = (chicken.vy || 0) + (desiredVy - (chicken.vy || 0)) * steer;

            moveChickenWithSlide(chicken, chicken.vx * dt, chicken.vy * dt, 0.42, map);
            resolveChickenWallPenetration(chicken, 0.42, map);

            chicken.animTimer += dt * ((chicken.bossPhase ?? 1) >= 3 ? 6.5 : (chicken.bossPhase ?? 1) === 2 ? 5.0 : 3.8);
            chicken.animFrame = Math.floor(chicken.animTimer) % 3;
          }
        }
      } else if (chicken.state === 'windup') {
        // Telegraphing charge: face player with tensed muscles
        chicken.chargeTimer = (chicken.chargeTimer || 0) - dt;
        chicken.animFrame = Math.floor(Date.now() * 0.008) % 2;
        player.cameraShake = Math.max(player.cameraShake, 3);

        if ((chicken.chargeTimer || 0) <= 0) {
          // Launch charge towards locked player position
          chicken.state = 'charge';
          chicken.chargeTimer = 1.35;
          const dx = player.x - chicken.x;
          const dy = player.y - chicken.y;
          const cDist = Math.hypot(dx, dy) || 1;
          chicken.patrolTarget = { x: dx / cDist, y: dy / cDist };
        }
      } else if (chicken.state === 'charge') {
        // Full speed rushing charge with fair, readable velocity
        chicken.chargeTimer = (chicken.chargeTimer || 0) - dt;
        chicken.animFrame = Math.floor(Date.now() * 0.012) % 2;
        player.cameraShake = Math.max(player.cameraShake, 5);

        const chargeSpeed = (chicken.bossPhase ?? 1) >= 4 ? 5.2 : (chicken.bossPhase ?? 1) === 3 ? 4.8 : (chicken.bossPhase ?? 1) === 2 ? 4.2 : 3.6;
        const dirX = chicken.patrolTarget ? chicken.patrolTarget.x : 0;
        const dirY = chicken.patrolTarget ? chicken.patrolTarget.y : 0;
        const stepX = dirX * chargeSpeed * dt;
        const stepY = dirY * chargeSpeed * dt;

        let hitObstacle = false;
        if (isWalkable(chicken.x + stepX, chicken.y + stepY, 0.42, map)) {
          chicken.x += stepX;
          chicken.y += stepY;
        } else {
          hitObstacle = true;
        }

        // Check if charge hits player
        if (distToPlayer < 1.35) {
          soundManager.playBossChargeImpact();
          const impactDamage = (chicken.bossPhase ?? 1) >= 4 ? 55 : (chicken.bossPhase ?? 1) === 3 ? 48 : (chicken.bossPhase ?? 1) === 2 ? 40 : 30;
          onPlayerDamage(impactDamage);
          player.cameraShake = 24;
          hitObstacle = true;
        }

        // If slammed into a wall: transition to Exhausted/Vulnerable!
        if (hitObstacle) {
          soundManager.playBossChargeImpact();
          player.cameraShake = Math.max(player.cameraShake, 14);
          chicken.state = 'exhausted';
          chicken.chargeTimer = (chicken.bossPhase ?? 1) >= 4 ? 1.0 : (chicken.bossPhase ?? 1) === 3 ? 1.2 : 1.5;
        } else if ((chicken.chargeTimer || 0) <= 0) {
          // Charge finished without wall crash:
          // In Phase 3+, combo into melee if close!
          if ((chicken.bossPhase ?? 1) >= 3 && distToPlayer <= 2.2) {
            chicken.state = 'attack';
            chicken.animFrame = 0;
            chicken.animTimer = 0;
          } else {
            chicken.state = 'chase';
            chicken.chargeCooldown = (chicken.bossPhase ?? 1) >= 4 ? 2.5 : 3.5;
          }
        }
      } else if (chicken.state === 'jump') {
        // High leaping seismic jump attack
        chicken.jumpTimer = (chicken.jumpTimer || 0) + dt;
        const dur = chicken.jumpDuration || 1.0;
        const t = Math.min(1.0, (chicken.jumpTimer || 0) / dur);

        // Parabolic height curve
        chicken.jumpElevation = Math.sin(t * Math.PI) * 1.5;
        chicken.animFrame = Math.floor(Date.now() * 0.008) % 2;

        // Propel forward through air
        const jumpSpeed = (chicken.bossPhase ?? 1) >= 4 ? 4.8 : 4.0;
        const jDirX = chicken.patrolTarget ? chicken.patrolTarget.x : 0;
        const jDirY = chicken.patrolTarget ? chicken.patrolTarget.y : 0;
        moveChickenWithSlide(chicken, jDirX * jumpSpeed * dt, jDirY * jumpSpeed * dt, 0.42, map);
        resolveChickenWallPenetration(chicken, 0.42, map);

        if (t >= 1.0) {
          // Land impact!
          chicken.jumpElevation = 0;
          soundManager.playBossSlamBoom();
          player.cameraShake = Math.max(player.cameraShake, 26);
          if (onBossSlamImpact) onBossSlamImpact(chicken.x, chicken.y);

          // Spawn ground slam shockwave (requires jump to dodge)
          if (shockwaves) {
            shockwaves.push({
              x: chicken.x,
              y: chicken.y,
              radius: 0.5,
              maxRadius: (chicken.bossPhase ?? 1) >= 4 ? 24.0 : 18.0,
              speed: 7.2,
              damage: (chicken.bossPhase ?? 1) >= 4 ? 38 : 30,
              life: 2.2,
              hasHitPlayer: false,
              type: 'slam',
              intensity: 1.0,
            });
          }

          // Recovery window after slam
          chicken.state = 'exhausted';
          chicken.chargeTimer = (chicken.bossPhase ?? 1) >= 4 ? 0.45 : 0.65;
          chicken.slamCooldown = (chicken.bossPhase ?? 1) >= 4 ? 4.5 : 6.0;
        }
      } else if (chicken.state === 'slam') {
        // Concentrated ground pound
        chicken.slamTimer = (chicken.slamTimer || 0) - dt;
        chicken.animFrame = Math.floor(Date.now() * 0.01) % 2;
        player.cameraShake = Math.max(player.cameraShake, 4);

        if ((chicken.slamTimer || 0) <= 0) {
          soundManager.playBossGroundPound();
          player.cameraShake = Math.max(player.cameraShake, 20);
          if (onBossSlamImpact) onBossSlamImpact(chicken.x, chicken.y);

          // Fast close-range shockwave ring
          if (shockwaves) {
            shockwaves.push({
              x: chicken.x,
              y: chicken.y,
              radius: 0.4,
              maxRadius: 9.0,
              speed: 6.5,
              damage: (chicken.bossPhase ?? 1) >= 4 ? 32 : 24,
              life: 1.3,
              hasHitPlayer: false,
              type: 'pound',
              intensity: 0.9,
            });
          }

          chicken.state = 'chase';
          chicken.groundPoundCooldown = (chicken.bossPhase ?? 1) >= 4 ? 3.0 : 4.5;
        }
      } else if (chicken.state === 'exhausted') {
        // Vulnerable state: Boss is panting and takes 1.5x damage!
        chicken.chargeTimer = (chicken.chargeTimer || 0) - dt;
        chicken.animFrame = Math.floor(Date.now() * 0.004) % 2;

        if ((chicken.chargeTimer || 0) <= 0) {
          // Recovery complete: resume chase
          chicken.state = 'chase';
          chicken.chargeCooldown = (chicken.bossPhase ?? 1) >= 4 ? 2.0 + Math.random() : (chicken.bossPhase ?? 1) === 3 ? 2.8 + Math.random() : 4.0 + Math.random() * 1.5;
        }
      } else if (chicken.state === 'attack') {
        chicken.animTimer += dt * 5;
        chicken.animFrame = Math.floor(chicken.animTimer) % 2;

        // Still drift smoothly towards player so he doesn't stall if player takes one step back
        const dx = player.x - chicken.x;
        const dy = player.y - chicken.y;
        const pDist = Math.hypot(dx, dy) || 1;
        if (pDist > 0.8) {
          const stepSpeed = chicken.speed * 0.45;
          moveChickenWithSlide(chicken, (dx / pDist) * stepSpeed * dt, (dy / pDist) * stepSpeed * dt, 0.42, map);
        }

        if (chicken.attackCooldown <= 0) {
          soundManager.playChickenAttack(chicken.type || 'boss');
          const swipeDamage = (chicken.bossPhase ?? 1) >= 4 ? 42 : (chicken.bossPhase ?? 1) === 3 ? 35 : (chicken.bossPhase ?? 1) === 2 ? 28 : 20;
          onPlayerDamage(swipeDamage);
          chicken.attackCooldown = (chicken.bossPhase ?? 1) >= 4 ? 0.65 : 0.85;
        }

        // Return to chase if player backed away
        if (distToPlayer > 1.6 || (chicken.attackCooldown > 0 && distToPlayer > 1.35)) {
          chicken.state = 'chase';
        }
      }
      continue;
    }

    // --- NORMAL CHICKEN BEHAVIOR ---
    if (chicken.state === 'damaged') {
      // Staggered / flinching backwards
      chicken.damagedTimer = (chicken.damagedTimer || 0) - dt;
      chicken.animFrame = 1; // Shocked/flinching frame
      if ((chicken.damagedTimer || 0) <= 0) {
        chicken.state = 'chase';
      }
      continue;
    }

    if (chicken.state === 'alert') {
      // Raised posture, turning toward noise target
      chicken.alertTimer = (chicken.alertTimer || 0) - dt;
      chicken.animFrame = 0;
      if (canSee) {
        chicken.state = 'chase';
        const isOcc = checkWallOcclusion(chicken.x, chicken.y, player.x, player.y, map);
        soundManager.playChickenShriek(chicken.x, chicken.y, player.x, player.y, player.dirX, player.dirY, chicken.type || 'white', isOcc);
        chicken.soundCooldown = 2.0;
      } else if ((chicken.alertTimer || 0) <= 0) {
        chicken.state = 'search';
        chicken.searchTimer = 3.5;
      }
      continue;
    }

    if (chicken.state === 'search') {
      // Moving to investigate target or looking around
      if (canSee) {
        chicken.state = 'chase';
        const isOcc = checkWallOcclusion(chicken.x, chicken.y, player.x, player.y, map);
        soundManager.playChickenShriek(chicken.x, chicken.y, player.x, player.y, player.dirX, player.dirY, chicken.type || 'white', isOcc);
        chicken.soundCooldown = 2.0;
      } else {
        chicken.searchTimer = (chicken.searchTimer || 0) - dt;
        const target = chicken.investigateTarget || { x: player.x, y: player.y };
        const dx = target.x - chicken.x;
        const dy = target.y - chicken.y;
        const pDist = Math.hypot(dx, dy);

        if (pDist > 0.6 && (chicken.searchTimer || 0) > 1.0) {
          const searchSpeed = chicken.speed * 0.7;
          const desiredVx = (dx / pDist) * searchSpeed;
          const desiredVy = (dy / pDist) * searchSpeed;
          const steer = Math.min(1.0, dt * (ENEMY_ACCELERATION_RATE * 0.7));
          chicken.vx = (chicken.vx || 0) + (desiredVx - (chicken.vx || 0)) * steer;
          chicken.vy = (chicken.vy || 0) + (desiredVy - (chicken.vy || 0)) * steer;

          if (isWalkable(chicken.x + chicken.vx * dt, chicken.y, 0.3, map)) chicken.x += chicken.vx * dt;
          if (isWalkable(chicken.x, chicken.y + chicken.vy * dt, 0.3, map)) chicken.y += chicken.vy * dt;
          chicken.animTimer += dt * 4;
          chicken.animFrame = Math.floor(chicken.animTimer) % 3;
        } else {
          // Pause and look around
          chicken.vx = 0;
          chicken.vy = 0;
          chicken.animTimer += dt * 2.5;
          chicken.animFrame = Math.floor(chicken.animTimer) % 2;
        }

        if ((chicken.searchTimer || 0) <= 0) {
          chicken.state = 'patrol';
          chicken.patrolTimer = 2.0;
        }
      }
      continue;
    }

    if (chicken.state === 'idle' || chicken.state === 'patrol') {
      if (canSee) {
        chicken.state = 'chase';
        soundManager.playChickenShriek(chicken.x, chicken.y, player.x, player.y, player.dirX, player.dirY);
        chicken.soundCooldown = 2.5;

        // Red/Alpha chickens alert other chickens nearby
        if (chicken.type === 'red') {
          for (let j = 0; j < chickens.length; j++) {
            if (i !== j && chickens[j].state !== 'dead') {
              const packDist = Math.hypot(chicken.x - chickens[j].x, chicken.y - chickens[j].y);
              if (packDist < 10) {
                chickens[j].state = 'chase';
              }
            }
          }
        }
      } else if (chicken.behavior === 'ambush' || chicken.behavior === 'lurker') {
        chicken.state = 'idle';
      } else if (chicken.state === 'idle') {
        chicken.vx = 0;
        chicken.vy = 0;
        if (chicken.patrolTimer <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const targetDist = 2 + Math.random() * 3;
          chicken.patrolTarget = {
            x: chicken.x + Math.cos(angle) * targetDist,
            y: chicken.y + Math.sin(angle) * targetDist,
          };
          chicken.state = 'patrol';
          chicken.patrolTimer = 3.0 + Math.random() * 4.0;
        }
      } else if (chicken.state === 'patrol') {
        if (chicken.patrolTarget && chicken.patrolTimer > 0) {
          const dx = chicken.patrolTarget.x - chicken.x;
          const dy = chicken.patrolTarget.y - chicken.y;
          const pDist = Math.hypot(dx, dy);

          if (pDist > 0.3) {
            const patrolSpeed = chicken.speed * 0.55;
            const desiredVx = (dx / pDist) * patrolSpeed;
            const desiredVy = (dy / pDist) * patrolSpeed;
            const steer = Math.min(1.0, dt * (ENEMY_ACCELERATION_RATE * 0.6));
            chicken.vx = (chicken.vx || 0) + (desiredVx - (chicken.vx || 0)) * steer;
            chicken.vy = (chicken.vy || 0) + (desiredVy - (chicken.vy || 0)) * steer;

            let moved = false;
            if (isWalkable(chicken.x + chicken.vx * dt, chicken.y, 0.3, map)) {
              chicken.x += chicken.vx * dt;
              moved = true;
            }
            if (isWalkable(chicken.x, chicken.y + chicken.vy * dt, 0.3, map)) {
              chicken.y += chicken.vy * dt;
              moved = true;
            }
            if (!moved) {
              chicken.state = 'idle';
              chicken.vx = 0;
              chicken.vy = 0;
              chicken.patrolTimer = 1.5 + Math.random() * 2.0;
            }

            chicken.animTimer += dt * 4;
            chicken.animFrame = Math.floor(chicken.animTimer) % 3;
          } else {
            chicken.state = 'idle';
            chicken.vx = 0;
            chicken.vy = 0;
            chicken.patrolTimer = 2.0 + Math.random() * 3.0;
          }
        } else {
          chicken.state = 'idle';
          chicken.vx = 0;
          chicken.vy = 0;
          chicken.patrolTimer = 2.0 + Math.random() * 3.0;
        }
      }
    } else if (chicken.state === 'chase') {
      // Tank footsteps sound
      if (chicken.type === 'tank' && Math.floor(chicken.animTimer) % 2 === 0 && (chicken.soundCooldown || 0) <= 0.2) {
        soundManager.playHeavyStep();
        chicken.soundCooldown = 1.2;
      }

      // Spitter ranged acid attack: balanced projectile speed to allow player evasion
      if (
        chicken.type === 'spitter' &&
        distToPlayer >= 3.0 &&
        distToPlayer <= 11.0 &&
        chicken.attackCooldown <= 0 &&
        hasLineOfSight(chicken.x, chicken.y, player.x, player.y, map)
      ) {
        soundManager.playSpitLaunch();
        const dx = player.x - chicken.x;
        const dy = player.y - chicken.y;
        const pDist = Math.hypot(dx, dy) || 1;
        const projSpeed = 4.8; // antes 7.5: permite esquivar con salto o paso lateral
        projectiles.push({
          id: `spit-${Date.now()}-${Math.random()}`,
          x: chicken.x,
          y: chicken.y,
          z: 0.35,
          vx: (dx / pDist) * projSpeed,
          vy: (dy / pDist) * projSpeed,
          vz: 0.08,
          life: 2.8,
          damage: 16,
        });
        chicken.attackCooldown = 2.8 + Math.random() * 1.4;
      }

      // Lurker sneaky burst: calibrated speeds
      if (chicken.type === 'lurker') {
        // Look away detection: is player looking directly at lurker?
        const toChickenX = chicken.x - player.x;
        const toChickenY = chicken.y - player.y;
        const tcDist = Math.hypot(toChickenX, toChickenY) || 1;
        const dot = (toChickenX * player.dirX + toChickenY * player.dirY) / tcDist;
        if (dot < 0.2) {
          // Player looking away -> Lurker creeps in faster
          chicken.speed = 1.70; // antes 3.2
        } else {
          chicken.speed = 1.05; // antes 1.8
        }
      }

      if (distToPlayer > 38) {
        chicken.state = 'search';
        chicken.investigateTarget = { x: player.x, y: player.y };
        chicken.searchTimer = 4.0;
      } else if (distToPlayer < 1.1) {
        chicken.state = 'attack';
        chicken.vx = 0;
        chicken.vy = 0;
        chicken.animFrame = 0;
        chicken.animTimer = 0;
      } else {
        const hasLos = hasLineOfSight(chicken.x, chicken.y, player.x, player.y, map);
        let targetX = player.x;
        let targetY = player.y;

        if (!hasLos) {
          // Navigate corridors and turn corners smoothly using BFS flowfield
          const cGridX = Math.floor(chicken.x);
          const cGridY = Math.floor(chicken.y);
          if (cachedFlowDirs[cGridY] && cachedFlowDirs[cGridY][cGridX]) {
            const flow = cachedFlowDirs[cGridY][cGridX];
            if (flow.dx !== 0 || flow.dy !== 0) {
              targetX = cGridX + flow.dx + 0.5;
              targetY = cGridY + flow.dy + 0.5;
            }
          }
        }

        const dx = targetX - chicken.x;
        const dy = targetY - chicken.y;
        const pDist = Math.hypot(dx, dy);

        if (pDist > 0.01) {
          const desiredVx = (dx / pDist) * chicken.speed;
          const desiredVy = (dy / pDist) * chicken.speed;

          // Aceleración y giro progresivo: elimina giros instantáneos y movimientos bruscos
          const steer = Math.min(1.0, dt * ENEMY_ACCELERATION_RATE);
          chicken.vx = (chicken.vx || 0) + (desiredVx - (chicken.vx || 0)) * steer;
          chicken.vy = (chicken.vy || 0) + (desiredVy - (chicken.vy || 0)) * steer;

          moveChickenWithSlide(chicken, chicken.vx * dt, chicken.vy * dt, 0.32, map);
          resolveChickenWallPenetration(chicken, 0.32, map);

          chicken.animTimer += dt * 5.5;
          chicken.animFrame = Math.floor(chicken.animTimer) % 3;
        }
      }
    } else if (chicken.state === 'attack') {
      chicken.animTimer += dt * 6;
      chicken.animFrame = Math.floor(chicken.animTimer) % 2;

      if (chicken.attackCooldown <= 0) {
        soundManager.playChickenAttack(chicken.type || 'white');
        const baseDamage = chicken.type === 'tank' ? 24 : (chicken.type === 'black' ? 18 : (chicken.type === 'red' ? 16 : (chicken.type === 'brown' ? 14 : 10)));
        onPlayerDamage(baseDamage);
        chicken.attackCooldown = chicken.type === 'tank' ? 1.2 : 0.85;
      }

      if (distToPlayer > 1.4) {
        chicken.state = 'chase';
      }
    }
  }

  // Update Boss Shockwaves physics and player jump evasion
  if (shockwaves && shockwaves.length > 0) {
    updateShockwaves(shockwaves, player, dt, onPlayerDamage);
  }

  // Update dynamic music state
  soundManager.setMusicState(highestThreat);
}

// --- Bombs Physics & Area Detonation Engine ---

export function updateBombs(
  bombs: ThrownBomb[],
  chickens: Chicken[],
  player: Player,
  level: LevelData,
  dt: number,
  spawnExplosion: (x: number, y: number, z: number) => void,
  spawnFuseSparks: (x: number, y: number, z: number) => void,
  onKillChicken: (chicken: Chicken) => void,
  onPlayerDamage: (damage: number) => void,
  isVictory: boolean = false
) {
  if (isVictory) {
    bombs.length = 0;
    return;
  }
  const map = level.map;
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    if (b.exploded) {
      bombs.splice(i, 1);
      continue;
    }

    b.timer -= dt;
    spawnFuseSparks(b.x, b.y, b.z);

    // Gravity
    b.vz -= 9.8 * dt;

    // Movement step
    const nextX = b.x + b.vx * dt;
    const nextY = b.y + b.vy * dt;
    const nextZ = b.z + b.vz * dt;

    // Wall collision
    let bounced = false;
    if (isWalkable(nextX, b.y, 0.25, map)) {
      b.x = nextX;
    } else {
      b.vx = -b.vx * 0.55;
      bounced = true;
    }

    if (isWalkable(b.x, nextY, 0.25, map)) {
      b.y = nextY;
    } else {
      b.vy = -b.vy * 0.55;
      bounced = true;
    }

    // Floor collision
    if (nextZ <= 0.08) {
      b.z = 0.08;
      if (Math.abs(b.vz) > 0.8 && b.bounces < b.maxBounces) {
        b.vz = -b.vz * 0.45;
        b.vx *= 0.65;
        b.vy *= 0.65;
        b.bounces++;
        bounced = true;
      } else {
        b.vz = 0;
        b.vx *= 0.85;
        b.vy *= 0.85;
      }
    } else {
      b.z = nextZ;
    }

    if (bounced) {
      soundManager.playBombBounce();
    }

    // Detonation
    if (b.timer <= 0) {
      b.exploded = true;
      spawnExplosion(b.x, b.y, b.z);
      soundManager.playExplosion();

      // Damage chickens with radial falloff
      for (let j = 0; j < chickens.length; j++) {
        const c = chickens[j];
        if (c.state === 'dead') continue;
        const dist = Math.hypot(c.x - b.x, c.y - b.y);
        if (dist <= b.radius) {
          const falloff = 1.0 - (dist / b.radius);
          const isBoss = c.isBoss || c.type === 'boss';
          let dmg = Math.floor(b.damage * falloff);
          if (isBoss) {
            dmg = Math.floor(dmg * 0.5); // Boss armor dampening
            c.rageTimer = 4.5;
            c.rageIntensity = 1.0;
            soundManager.playBossRoar();
          }

          c.health -= dmg;
          if (c.health <= 0) {
            c.health = 0;
            c.state = 'dead';
            c.deadTimer = 0;
            onKillChicken(c);
          } else if (!isBoss || c.state === 'exhausted') {
            c.state = 'damaged';
            c.damagedTimer = 0.35;
          }
        }
      }

      // Damage player if caught in blast radius
      const distToPlayer = Math.hypot(player.x - b.x, player.y - b.y);
      if (distToPlayer <= b.radius) {
        const pFalloff = 1.0 - (distToPlayer / b.radius);
        const pDmg = Math.floor(55 * pFalloff);
        if (pDmg > 0) {
          onPlayerDamage(pDmg);
          player.cameraShake = Math.max(player.cameraShake, 22);
        }
      }

      bombs.splice(i, 1);
    }
  }
}

// --- Toxic Spit Projectiles Update ---

export function updateProjectiles(
  projectiles: SpittedProjectile[],
  player: Player,
  level: LevelData,
  dt: number,
  onPlayerDamage: (damage: number) => void,
  isVictory: boolean = false
) {
  if (isVictory) {
    projectiles.length = 0;
    return;
  }
  const map = level.map;
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    if (p.life <= 0) {
      projectiles.splice(i, 1);
      continue;
    }

    const nextX = p.x + p.vx * dt;
    const nextY = p.y + p.vy * dt;
    const nextZ = p.z + p.vz * dt;

    // Check hit wall or ground
    const mx = Math.floor(nextX);
    const my = Math.floor(nextY);
    if (!map[my] || !map[my][mx] || map[my][mx] > 0 || nextZ <= 0.05) {
      soundManager.playSpitImpact();
      projectiles.splice(i, 1);
      continue;
    }

    p.x = nextX;
    p.y = nextY;
    p.z = nextZ;

    // Check hit player
    const distToPlayer = Math.hypot(player.x - p.x, player.y - p.y);
    if (distToPlayer < 0.6 && Math.abs(p.z - 0.4) < 0.6) {
      soundManager.playSpitImpact();
      onPlayerDamage(p.damage);
      player.damageFlash = 0.8;
      projectiles.splice(i, 1);
    }
  }
}

// --- Boss Shockwaves Physics & Player Jump Evasion ---

export function updateShockwaves(
  shockwaves: BossShockwave[] = [],
  player?: Player,
  dt?: number,
  onPlayerDamage?: (damage: number) => void,
  onEvadedShockwave?: () => void
) {
  if (!shockwaves || shockwaves.length === 0 || !player || dt === undefined) return;

  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += sw.speed * dt;
    sw.life -= dt;
    sw.intensity = Math.max(0, sw.life / 2.0);

    const distToPlayer = Math.hypot(player.x - sw.x, player.y - sw.y);
    const ringThickness = 0.85;

    // Check if player is currently in the expanding shockwave ring
    if (!sw.hasHitPlayer && Math.abs(distToPlayer - sw.radius) < ringThickness) {
      // Check if player evaded with a jump
      const isPlayerJumping = !player.isGrounded && (player.jumpHeight || 0) >= 0.16;
      if (isPlayerJumping) {
        sw.hasHitPlayer = true;
        soundManager.playShockwaveEvaded();
        if (onEvadedShockwave) onEvadedShockwave();
      } else {
        sw.hasHitPlayer = true;
        if (onPlayerDamage) onPlayerDamage(sw.damage);
        player.cameraShake = Math.max(player.cameraShake, sw.type === 'pound' ? 18 : 26);
      }
    }

    if (sw.radius >= sw.maxRadius || sw.life <= 0) {
      shockwaves.splice(i, 1);
    }
  }
}

