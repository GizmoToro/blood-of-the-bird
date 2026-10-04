import { Chicken, ChickenType, LevelData, Player } from '../types';
import { isWalkable, hasLineOfSight } from './ai';
import { ALL_LEVELS } from './map';

// =========================================================================
// PARÁMETROS CONFIGURABLES GLOBALES DEL SISTEMA DE ENEMIGOS
// Fácilmente identificables para calibrar cantidad, velocidad y aparición
// =========================================================================

/** Límite máximo de pollos activos en niveles normales (Objetivo: 3 a 5 pollos) */
export const MAX_ACTIVE_ENEMIES_NORMAL = 4;

/** Límite máximo de pollos activos en niveles de alta dificultad (Objetivo: 5 a 7 pollos) */
export const MAX_ACTIVE_ENEMIES_HARD = 6;

/** Distancia mínima entre el jugador y el punto de aparición (evita aparecer encima o cerca) */
export const MIN_SPAWN_DISTANCE = 8.5;

/** Distancia mínima entre enemigos para evitar agrupaciones apiñadas al nacer */
export const MIN_ENEMY_SEPARATION = 1.8;

/** Intervalo base entre apariciones dinámicas en segundos (frecuencia pausada y controlada) */
export const ENEMY_SPAWN_INTERVAL = 10.0;

/** Tiempo de enfriamiento tras la muerte de un enemigo antes de permitir un nuevo spawn */
export const RESPAWN_COOLDOWN_ON_DEATH = 7.5;

/** Multiplicador global de velocidad de los enemigos (~50-60% de la velocidad previa) */
export const ENEMY_SPEED_SCALE = 0.55;

/** Tasa de aceleración e inercia para suavizar el movimiento y giros de los pollos */
export const ENEMY_ACCELERATION_RATE = 3.8;

/** Velocidades base calibradas al ~50-60% de la velocidad original */
export const BASE_CHICKEN_SPEEDS: Record<ChickenType, number> = {
  white: 1.10,   // antes 2.0 (~55%)
  brown: 1.25,   // antes 2.3 (~54%)
  black: 1.50,   // antes 2.8 (~53%)
  red: 1.65,     // antes 3.1 (~53%)
  tank: 0.85,    // antes 1.55 (~54%)
  spitter: 1.15, // antes 2.1 (~55%)
  lurker: 1.35,  // antes 2.6 (~52%)
  boss: 1.30,    // antes 2.2 (~59%)
};

export function getChickenBaseSpeed(type: ChickenType): number {
  return BASE_CHICKEN_SPEEDS[type] ?? 1.10;
}

export interface LevelSpawnConfig {
  minEnemies: number;
  maxEnemies: number;
  spawnInterval: number;
  types: { type: ChickenType; weight: number }[];
}

export function isFinalBossLevel(levelId: number): boolean {
  return levelId >= ALL_LEVELS.length;
}

export function getSpawnConfigForLevel(levelId: number): LevelSpawnConfig {
  const totalLevels = ALL_LEVELS.length;
  // Dinámico: El último nivel siempre es la Arena del Jefe Final Gallardo
  if (levelId >= totalLevels) {
    // Final Boss Gallardo Arena: Boss Gallardo + máximo 2 minions de apoyo
    return {
      minEnemies: 1,
      maxEnemies: 2,
      spawnInterval: 14.0,
      types: [
        { type: 'tank', weight: 35 },
        { type: 'red', weight: 35 },
        { type: 'spitter', weight: 15 },
        { type: 'black', weight: 15 },
      ],
    };
  } else if (levelId <= 3) {
    // Niveles 1-3 (Principiante / Zonas iniciales): 2 a 3 pollos simultáneamente
    return {
      minEnemies: 2,
      maxEnemies: 3,
      spawnInterval: 12.0,
      types: [
        { type: 'white', weight: 50 },
        { type: 'brown', weight: 35 },
        { type: 'black', weight: 15 },
      ],
    };
  } else if (levelId <= 8) {
    // Niveles 4-8 (Intermedio): 3 a 4 pollos simultáneamente
    return {
      minEnemies: 3,
      maxEnemies: 4,
      spawnInterval: 10.0,
      types: [
        { type: 'white', weight: 25 },
        { type: 'brown', weight: 30 },
        { type: 'black', weight: 25 },
        { type: 'spitter', weight: 12 },
        { type: 'lurker', weight: 8 },
      ],
    };
  } else if (levelId <= 13) {
    // Niveles 9-13 (Avanzado): 3 a 5 pollos simultáneamente
    return {
      minEnemies: 3,
      maxEnemies: 5,
      spawnInterval: 9.0,
      types: [
        { type: 'black', weight: 30 },
        { type: 'spitter', weight: 20 },
        { type: 'lurker', weight: 20 },
        { type: 'tank', weight: 18 },
        { type: 'red', weight: 12 },
      ],
    };
  } else {
    // Niveles 14 hasta el penúltimo (Alta dificultad): 4 a 6 pollos como máximo
    return {
      minEnemies: 4,
      maxEnemies: 6,
      spawnInterval: 8.5,
      types: [
        { type: 'red', weight: 30 },
        { type: 'tank', weight: 25 },
        { type: 'spitter', weight: 20 },
        { type: 'lurker', weight: 15 },
        { type: 'black', weight: 10 },
      ],
    };
  }
}

function pickRandomType(types: { type: ChickenType; weight: number }[]): ChickenType {
  const totalWeight = types.reduce((acc, t) => acc + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of types) {
    if (r < t.weight) return t.type;
    r -= t.weight;
  }
  return types[0]?.type || 'brown';
}

let spawnTimer = 4.0; // Breve pausa inicial al arrancar el nivel antes del primer spawn dinámico
let spawnCounter = 0;

export function resetSpawner() {
  spawnTimer = 5.0;
  spawnCounter = 0;
}

export function resetDynamicSpawner() {
  spawnTimer = 5.0;
  spawnCounter = 0;
}

/**
 * Notifica al spawner de la muerte de un enemigo para pausar el spawn
 * y evitar que aparezcan reemplazos instantáneos de golpe.
 */
export function notifyChickenKilled() {
  spawnTimer = Math.max(spawnTimer, RESPAWN_COOLDOWN_ON_DEATH);
}

function createChickenInstance(
  spawnX: number,
  spawnY: number,
  enemyType: ChickenType,
  levelId: number,
  playerX: number,
  playerY: number
): Chicken {
  let hp = 45;
  const spd = getChickenBaseSpeed(enemyType);

  if (enemyType === 'tank') {
    hp = 180;
  } else if (enemyType === 'red') {
    hp = 95;
  } else if (enemyType === 'black') {
    hp = 75;
  } else if (enemyType === 'spitter') {
    hp = 60;
  } else if (enemyType === 'lurker') {
    hp = 50;
  } else if (enemyType === 'brown') {
    hp = 50;
  }

  spawnCounter++;
  return {
    id: `spawn-l${levelId}-${Date.now()}-${spawnCounter}-${Math.random().toString(36).substring(2, 6)}`,
    x: spawnX,
    y: spawnY,
    type: enemyType,
    behavior: enemyType === 'lurker' ? 'lurker' : enemyType === 'spitter' ? 'spitter' : enemyType === 'tank' ? 'tank' : 'normal',
    state: 'patrol',
    health: hp,
    maxHealth: hp,
    speed: spd,
    vx: 0,
    vy: 0,
    animFrame: 0,
    animTimer: Math.random() * 2,
    attackCooldown: 0.6,
    patrolTarget: { x: playerX, y: playerY },
    patrolTimer: 2.0 + Math.random() * 2.5,
    deadTimer: 0,
    soundCooldown: 1.5 + Math.random() * 3.0,
    distToPlayer: Math.hypot(spawnX - playerX, spawnY - playerY),
    isBoss: false,
    bossPhase: 1,
    chargeCooldown: 0,
    chargeTimer: 0,
    rageTimer: 0,
    rageIntensity: 0,
  };
}

/**
 * Asegura la población inicial moderada del mapa, respetando la distancia de seguridad.
 */
export function populateInitialEnemies(chickens: Chicken[], player: Player, level: LevelData) {
  const config = getSpawnConfigForLevel(level.id);
  const targetCount = config.minEnemies;
  const map = level.map;
  const height = map.length;
  const width = map[0]?.length || 0;
  if (height === 0 || width === 0) return;

  const existingCount = chickens.filter(c => c.state !== 'dead').length;
  const needed = targetCount - existingCount;
  if (needed <= 0) return;

  const validCells: [number, number][] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (map[y][x] === 0) {
        const cx = x + 0.5;
        const cy = y + 0.5;
        const dist = Math.hypot(cx - player.x, cy - player.y);
        // Distancia prudente para spawn inicial
        if (dist >= MIN_SPAWN_DISTANCE && isWalkable(cx, cy, 0.32, map)) {
          validCells.push([cx, cy]);
        }
      }
    }
  }

  if (validCells.length === 0) return;

  // Barajar celdas candidatas
  for (let i = validCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validCells[i], validCells[j]] = [validCells[j], validCells[i]];
  }

  let added = 0;
  for (const [cx, cy] of validCells) {
    if (added >= needed) break;
    // Evitar que aparezcan apiñados
    const tooClose = chickens.some(c => c.state !== 'dead' && Math.hypot(cx - c.x, cy - c.y) < MIN_ENEMY_SEPARATION);
    if (tooClose) continue;

    const enemyType = pickRandomType(config.types);
    chickens.push(createChickenInstance(cx, cy, enemyType, level.id, player.x, player.y));
    added++;
  }
}

export function updateDynamicSpawner(
  chickens: Chicken[],
  player: Player,
  level: LevelData,
  dt: number,
  fps: number = 60
) {
  spawnTimer -= dt;
  if (spawnTimer > 0) return;

  const config = getSpawnConfigForLevel(level.id);

  // Rendimiento: si los FPS caen severamente, reducir tope
  let effectiveMax = config.maxEnemies;
  if (fps < 30) {
    effectiveMax = Math.max(2, effectiveMax - 1);
  }

  // Contar pollos vivos que no sean el Boss
  const aliveMinions = chickens.filter(c => c.state !== 'dead' && !c.isBoss && c.type !== 'boss');

  // Si ya alcanzamos el límite estricto de activos, esperar el intervalo completo
  if (aliveMinions.length >= effectiveMax) {
    spawnTimer = config.spawnInterval;
    return;
  }

  const map = level.map;
  const height = map.length;
  const width = map[0]?.length || 0;
  if (height === 0 || width === 0) return;

  // Buscar celdas transitables a distancia segura
  const candidateCells: [number, number][] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (map[y][x] === 0) {
        const cx = x + 0.5;
        const cy = y + 0.5;
        const dist = Math.hypot(cx - player.x, cy - player.y);

        // Rango de distancia prudente: ni encima del jugador ni fuera de alcance
        if (dist >= MIN_SPAWN_DISTANCE && dist <= 28.0) {
          if (isWalkable(cx, cy, 0.32, map)) {
            // No aparecer en el cono de visión directo del jugador si está a media distancia
            if (dist < 15.0) {
              const toEnemyX = cx - player.x;
              const toEnemyY = cy - player.y;
              const inFront = toEnemyX * player.dirX + toEnemyY * player.dirY > 0;
              if (inFront && hasLineOfSight(player.x, player.y, cx, cy, map)) {
                continue;
              }
            }

            // Distancia con otros pollos: evitar apiñarse
            let tooCloseToOther = false;
            for (let i = 0; i < chickens.length; i++) {
              if (chickens[i].state !== 'dead') {
                if (Math.hypot(cx - chickens[i].x, cy - chickens[i].y) < MIN_ENEMY_SEPARATION) {
                  tooCloseToOther = true;
                  break;
                }
              }
            }
            if (tooCloseToOther) continue;

            candidateCells.push([cx, cy]);
          }
        }
      }
    }
  }

  if (candidateCells.length === 0) {
    spawnTimer = 2.0;
    return;
  }

  // Generar UN solo pollo
  const [spawnX, spawnY] = candidateCells[Math.floor(Math.random() * candidateCells.length)];
  const enemyType = pickRandomType(config.types);
  chickens.push(createChickenInstance(spawnX, spawnY, enemyType, level.id, player.x, player.y));

  // Intervalo pausado y regular: el jugador tiene tiempo para respirar y enfrentarse a los enemigos
  spawnTimer = config.spawnInterval * (0.9 + Math.random() * 0.3);
}
