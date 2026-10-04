import { Player, GameSettings } from '../types';

export interface CameraView {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  planeX: number;
  planeY: number;
  pitch: number;
  horizonOffset: number;
  transitionT: number;
  isThirdPerson: boolean;
  actualDistance: number;
}

export class ThirdPersonCamera {
  private camX = 0;
  private camY = 0;
  private currentDist = 1.85;
  private targetDist = 1.85;
  private transitionT = 0; // 0 = first person, 1 = third person
  private initialized = false;

  // Configuration
  private readonly defaultBaseDist = 1.85;
  private readonly minWallDist = 0.42;
  private readonly wallSafetyMargin = 0.22;
  private readonly shoulderOffset = 0.18; // Subtle right-shoulder bias for optimal crosshair framing

  public reset(player: Player) {
    this.camX = player.x - player.dirX * this.defaultBaseDist;
    this.camY = player.y - player.dirY * this.defaultBaseDist;
    this.currentDist = this.defaultBaseDist;
    this.targetDist = this.defaultBaseDist;
    this.initialized = true;
  }

  /**
   * Raycast obstacle detection to prevent the camera from clipping into walls.
   * Steps from player backwards to the desired camera spot.
   */
  private checkWallCollision(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    map: number[][]
  ): number {
    const dx = targetX - startX;
    const dy = targetY - startY;
    const totalDist = Math.hypot(dx, dy);
    if (totalDist <= 0.001) return totalDist;

    const steps = Math.ceil(totalDist * 28); // High-precision march
    const stepX = dx / steps;
    const stepY = dy / steps;

    let curX = startX;
    let curY = startY;

    for (let i = 1; i <= steps; i++) {
      curX += stepX;
      curY += stepY;

      const gridX = Math.floor(curX);
      const gridY = Math.floor(curY);

      if (gridY < 0 || gridY >= map.length || gridX < 0 || gridX >= (map[gridY]?.length || 0)) {
        return Math.max(this.minWallDist, (i / steps) * totalDist - this.wallSafetyMargin);
      }

      if (map[gridY] && map[gridY][gridX] > 0) {
        // Wall encountered! Return safe distance before wall
        const hitDist = (i / steps) * totalDist;
        return Math.max(this.minWallDist, hitDist - this.wallSafetyMargin);
      }
    }

    return totalDist;
  }

  /**
   * Update camera position, wall collision, smoothing, and first/third person transition.
   */
  public update(player: Player, map: number[][], settings: GameSettings, dt: number): CameraView {
    const isThirdPersonRequested = settings.cameraMode === 'third_person';

    if (!this.initialized) {
      this.reset(player);
    }

    // 1. Smooth Transition Interpolation between First and Third Person
    const transitionSpeed = 3.6; // ~0.28s smooth slide
    if (isThirdPersonRequested) {
      this.transitionT = Math.min(1, this.transitionT + dt * transitionSpeed);
    } else {
      this.transitionT = Math.max(0, this.transitionT - dt * transitionSpeed);
    }

    const baseDistance = settings.thirdPersonDistance || this.defaultBaseDist;

    // 2. Compute Ideal Camera Target with subtle right shoulder bias
    // Camera looks in direction of player.dirX, player.dirY
    // Perpendicular vector for shoulder: (-player.dirY, player.dirX)
    const perpX = -player.dirY;
    const perpY = player.dirX;
    const shoulderX = perpX * this.shoulderOffset;
    const shoulderY = perpY * this.shoulderOffset;

    const idealTargetX = player.x - player.dirX * baseDistance + shoulderX;
    const idealTargetY = player.y - player.dirY * baseDistance + shoulderY;

    // 3. Wall Collision Detection (Anti-Clipping Protection)
    const allowedDist = this.checkWallCollision(player.x, player.y, idealTargetX, idealTargetY, map);
    this.targetDist = allowedDist;

    // Pull in rapidly if blocked, ease back out smoothly if clear
    if (this.targetDist < this.currentDist) {
      this.currentDist = Math.max(this.targetDist, this.currentDist - dt * 14.0);
    } else {
      this.currentDist = Math.min(this.targetDist, this.currentDist + dt * 6.5);
    }

    // 4. Position Camera at current safe distance
    const distRatio = baseDistance > 0.001 ? this.currentDist / baseDistance : 1.0;
    const actualTargetX = player.x - player.dirX * this.currentDist + shoulderX * distRatio;
    const actualTargetY = player.y - player.dirY * this.currentDist + shoulderY * distRatio;

    // 5. Smooth Damped Camera Follow (Interpolation)
    const followRate = Math.min(1, dt * 18.0);
    this.camX += (actualTargetX - this.camX) * followRate;
    this.camY += (actualTargetY - this.camY) * followRate;

    // 6. Blend between Player Eye and Third-Person Camera
    const finalCamX = player.x + (this.camX - player.x) * this.transitionT;
    const finalCamY = player.y + (this.camY - player.y) * this.transitionT;

    // In third person, elevate camera slightly so the character is framed below horizon
    const horizonOffset = this.transitionT * 18; // Looking slightly down towards player

    return {
      x: finalCamX,
      y: finalCamY,
      dirX: player.dirX,
      dirY: player.dirY,
      planeX: player.planeX,
      planeY: player.planeY,
      pitch: player.pitch,
      horizonOffset,
      transitionT: this.transitionT,
      isThirdPerson: this.transitionT > 0.001,
      actualDistance: this.currentDist,
    };
  }
}

export const thirdPersonCamera = new ThirdPersonCamera();
