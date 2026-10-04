import { Player, PlayerAnimState, PlayerAnimation } from '../types';

export interface FeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface ShellParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  life: number;
  groundY: number;
}

export class PlayerRenderer {
  private baseImage: HTMLImageElement | null = null;
  private imageLoaded = false;
  private feathers: FeatherParticle[] = [];
  private shells: ShellParticle[] = [];

  constructor() {
    this.loadImage();
  }

  private loadImage() {
    const img = new Image();
    img.src = '/assets/player-third-person.jpg';
    img.onload = () => {
      this.baseImage = img;
      this.imageLoaded = true;
    };
    img.onerror = () => {
      // Fallback cleanly to procedural rendering
      this.imageLoaded = false;
    };
  }

  /**
   * Spawns loose white downy feathers bursting from player when damaged.
   */
  public spawnDamageFeathers(screenX: number, screenY: number, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = 40 + Math.random() * 80;
      this.feathers.push({
        x: screenX + (Math.random() - 0.5) * 40,
        y: screenY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 30, // Initial pop upwards
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 6,
        life: 1.0,
        maxLife: 1.2 + Math.random() * 0.8,
        size: 7 + Math.random() * 6,
      });
    }
  }

  /**
   * Spawns an ejected 12-gauge red shotgun shell with brass head.
   */
  public spawnEjectedShell(gunScreenX: number, gunScreenY: number, groundY: number) {
    this.shells.push({
      x: gunScreenX + 15,
      y: gunScreenY - 10,
      vx: 60 + Math.random() * 40, // Eject to right
      vy: -90 - Math.random() * 40, // Upward arc
      rot: Math.random() * Math.PI,
      vRot: 12 + Math.random() * 8,
      life: 1.8,
      groundY,
    });
  }

  /**
   * Update particle dynamics (feathers drifting, shells falling and bouncing).
   */
  public updateParticles(dt: number) {
    // 1. Feathers (fluttering down slowly like real bird feathers)
    for (let i = this.feathers.length - 1; i >= 0; i--) {
      const f = this.feathers[i];
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot += f.vRot * dt;
      f.vy += 65 * dt; // Soft gravity
      f.vx += Math.sin(f.rot * 3) * 20 * dt; // Swaying flutter
      f.vx *= 0.96;
      f.life -= dt;
      if (f.life <= 0) {
        this.feathers.splice(i, 1);
      }
    }

    // 2. Shotgun Shells (bouncing physics)
    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 380 * dt; // Heavy shell gravity
      s.rot += s.vRot * dt;

      if (s.y >= s.groundY) {
        s.y = s.groundY;
        s.vy = -s.vy * 0.45; // Bounce
        s.vx *= 0.6;
        s.vRot *= 0.5;
        if (Math.abs(s.vy) < 15) {
          s.vy = 0;
        }
      }

      s.life -= dt;
      if (s.life <= 0) {
        this.shells.splice(i, 1);
      }
    }
  }

  /**
   * Determine and update the current animation state of the player.
   */
  public updateAnimationState(player: Player, dt: number): PlayerAnimation {
    if (!player.anim) {
      player.anim = {
        state: 'idle',
        previousState: 'idle',
        stateTimer: 0,
        blendFactor: 1.0,
        walkCycle: 0,
        facingAngle: Math.atan2(player.dirY, player.dirX),
        squashStretch: 1.0,
        shellEjectTimer: 0,
        hitReactionTimer: 0,
      };
    }

    const anim = player.anim;
    const isDead = player.health <= 0;
    const isShooting = player.isShooting || player.shootTimer > 0;
    const isReloading = player.isReloading;
    const isAirborne = !player.isGrounded;
    const isJumping = isAirborne && (player.jumpVelocity || 0) > 0.5;
    const isFalling = isAirborne && (player.jumpVelocity || 0) <= 0.5;
    const isLanding = !isAirborne && ((anim.landTimer || 0) > 0.01);
    const isMoving = player.isWalking;
    const isRunning = player.isSprinting && isMoving;
    const isHit = player.damageFlash > 0.25;

    let targetState: PlayerAnimState = 'idle';

    if (isDead) {
      targetState = 'dead';
    } else if (anim.state === 'cinematic_wall_touch' || anim.state === 'cinematic_dazed' || anim.state === 'cinematic_pump') {
      targetState = anim.state;
    } else if (isHit && anim.hitReactionTimer <= 0) {
      targetState = 'hit';
      anim.hitReactionTimer = 0.22;
    } else if (anim.hitReactionTimer > 0) {
      targetState = 'hit';
      anim.hitReactionTimer -= dt;
    } else if (isShooting) {
      targetState = 'shoot';
    } else if (isReloading) {
      targetState = 'reload';
    } else if (isJumping) {
      targetState = 'jump';
    } else if (isFalling) {
      targetState = 'fall';
    } else if (isLanding) {
      targetState = 'land';
    } else if (isRunning) {
      targetState = 'run';
    } else if (isMoving) {
      targetState = 'walk';
    } else {
      targetState = 'idle';
    }

    // Smooth state blending
    if (targetState !== anim.state) {
      anim.previousState = anim.state;
      anim.state = targetState;
      anim.stateTimer = 0;
      anim.blendFactor = 0.0;
    } else {
      anim.stateTimer += dt;
      anim.blendFactor = Math.min(1.0, anim.blendFactor + dt * 6.0); // Smooth transition
    }

    // Walk cycle increment
    if (anim.state === 'walk') {
      anim.walkCycle += dt * 6.5;
    } else if (anim.state === 'run') {
      anim.walkCycle += dt * 10.5;
    } else {
      // Return smoothly to rest
      anim.walkCycle += dt * 1.5;
    }

    // Landing squash & stretch recovery for character model only
    if (anim.landTimer && anim.landTimer > 0) {
      anim.landTimer = Math.max(0, anim.landTimer - dt);
      anim.squashStretch = 1.0 - (anim.landTimer / 0.16) * 0.16;
    } else {
      anim.squashStretch += (1.0 - anim.squashStretch) * Math.min(1.0, dt * 10.0);
    }

    // Smooth facing angle
    const targetAngle = Math.atan2(player.dirY, player.dirX);
    anim.facingAngle = targetAngle;

    return anim;
  }

  /**
   * Render the animated player character in Third Person mode.
   */
  public renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    screenX: number,
    screenY: number,
    baseHeight: number,
    dt: number,
    opacity: number = 1.0
  ) {
    if (opacity <= 0.01) return;

    this.updateParticles(dt);
    const anim = this.updateAnimationState(player, dt);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    // Dynamic sizing based on distance
    const charHeight = baseHeight * 1.25;
    const charWidth = charHeight * 0.62; // Proportions matching reference

    // Pivot at base of feet
    const feetY = screenY + charHeight * 0.48;
    const centerX = screenX;

    // 1. Draw dynamic contact shadow on floor
    const shadowScale = anim.state === 'jump' ? Math.max(0.3, 1.0 - (player.jumpHeight || 0) * 1.2) : 1.0;
    const shadowAlpha = 0.45 * shadowScale * opacity;
    ctx.fillStyle = `rgba(15, 12, 8, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(centerX, feetY + 2, charWidth * 0.45 * shadowScale, charHeight * 0.08 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Ejected Shell Particles below or alongside
    for (const shell of this.shells) {
      ctx.save();
      ctx.translate(shell.x, shell.y);
      ctx.rotate(shell.rot);
      // Red casing
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-4, -2, 6, 4);
      // Brass rim
      ctx.fillStyle = '#d97706';
      ctx.fillRect(2, -2, 2.5, 4);
      ctx.restore();
    }

    // 3. Compute Body Rig Transforms for Animation States
    const t = anim.walkCycle;
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    let torsoBobY = 0;
    let torsoLeanX = 0;
    let breathScale = 1.0 + Math.sin(anim.stateTimer * 2.8) * 0.018;
    let tailWag = 0;
    let gunRecoilOffset = 0;
    let gunAimAngle = 0;
    let muzzleFlashVisible = false;
    let reloadHandOffset = 0;
    let isDead = anim.state === 'dead';

    switch (anim.state) {
      case 'idle':
        torsoBobY = Math.sin(anim.stateTimer * 3.0) * 1.8;
        tailWag = Math.sin(anim.stateTimer * 2.0) * 0.04;
        break;

      case 'walk':
        leftLegAngle = Math.sin(t) * 0.42;
        rightLegAngle = -Math.sin(t) * 0.42;
        torsoBobY = Math.abs(Math.sin(t)) * 3.2;
        torsoLeanX = Math.sin(t * 0.5) * 1.5;
        tailWag = Math.cos(t * 0.5) * 0.08;
        break;

      case 'run':
        leftLegAngle = Math.sin(t) * 0.72;
        rightLegAngle = -Math.sin(t) * 0.72;
        torsoBobY = Math.abs(Math.sin(t)) * 5.2;
        torsoLeanX = Math.sin(t * 0.5) * 2.5;
        tailWag = Math.cos(t * 0.5) * 0.14;
        breathScale = 1.03;
        break;

      case 'jump':
        // Legs tucked up, wings slightly out
        leftLegAngle = -0.45;
        rightLegAngle = -0.45;
        torsoBobY = -6;
        break;

      case 'fall':
        // Legs hanging down searching for ground
        leftLegAngle = 0.15;
        rightLegAngle = 0.15;
        torsoBobY = 2;
        tailWag = Math.sin(anim.stateTimer * 6.0) * 0.06;
        break;

      case 'land':
        // Deep knee squash
        torsoBobY = (1.0 - anim.squashStretch) * charHeight * 0.25;
        leftLegAngle = 0.25;
        rightLegAngle = -0.25;
        break;

      case 'shoot':
        gunRecoilOffset = Math.sin(Math.min(Math.PI, anim.stateTimer * 18)) * 8;
        gunAimAngle = -0.15;
        torsoBobY = -gunRecoilOffset * 0.4;
        muzzleFlashVisible = anim.stateTimer < 0.12 || (player.muzzleFlash && player.muzzleFlash > 0.4);
        break;

      case 'reload':
        gunAimAngle = 0.35; // Lower gun to load
        reloadHandOffset = Math.sin(anim.stateTimer * 12) * 6;
        break;

      case 'cinematic_wall_touch':
        torsoLeanX = 3.5;
        gunAimAngle = 0.45; // Lower gun to right side while reaching left wing out
        torsoBobY = Math.sin(anim.stateTimer * 2.5) * 1.5;
        break;

      case 'cinematic_dazed':
        torsoBobY = Math.sin(anim.stateTimer * 4.0) * 2.2;
        torsoLeanX = Math.sin(anim.stateTimer * 2.5) * 3.8;
        tailWag = Math.sin(anim.stateTimer * 3.5) * 0.08;
        break;

      case 'cinematic_pump':
        gunAimAngle = -0.08; // High ready position
        reloadHandOffset = Math.sin(Math.min(Math.PI, anim.stateTimer * 8.0)) * 9;
        torsoBobY = -Math.abs(Math.sin(anim.stateTimer * 8.0)) * 3;
        break;

      case 'hit':
        torsoLeanX = (Math.random() - 0.5) * 5;
        torsoBobY = -4;
        break;

      case 'dead':
        torsoBobY = charHeight * 0.38;
        break;
    }

    // Death collapse transform
    if (isDead) {
      ctx.translate(centerX, feetY - charHeight * 0.2);
      ctx.rotate(0.35); // Slumped to side
      ctx.scale(1.15, 0.55); // Flat on floor
      ctx.translate(-centerX, -(feetY - charHeight * 0.2));
    }

    const currentCenterY = feetY - charHeight * 0.5 + torsoBobY;

    // 4. Render Scaled Orange-Brown Bird Legs & Large Webbed 3-Toed Feet
    this.drawLegsAndFeet(
      ctx,
      centerX,
      feetY,
      charWidth,
      charHeight,
      leftLegAngle,
      rightLegAngle,
      anim.squashStretch,
      isDead
    );

    // 5. Render Layered White Tail/Rump Plumage (Cascading down over thighs)
    this.drawTailPlumage(
      ctx,
      centerX + torsoLeanX,
      currentCenterY + charHeight * 0.14,
      charWidth,
      charHeight,
      tailWag,
      breathScale
    );

    // 6. Render Torso & Military Tactical Vest (With Molle Webbing & Shoulder Straps)
    this.drawTacticalVestAndTorso(
      ctx,
      centerX + torsoLeanX,
      currentCenterY,
      charWidth,
      charHeight,
      breathScale,
      anim.state === 'hit'
    );

    // 7. Render Tactical Belt & Modular Pouches on Flanks
    this.drawTacticalBeltAndPouches(
      ctx,
      centerX + torsoLeanX,
      currentCenterY + charHeight * 0.07,
      charWidth,
      charHeight,
      tailWag
    );

    // 8. Render Feathered Head with Spiky Mohawk Feather Crest
    this.drawHeadAndCrest(
      ctx,
      centerX + torsoLeanX * 0.8,
      currentCenterY - charHeight * 0.26,
      charWidth,
      charHeight,
      breathScale
    );

    // 9. Render Left Arm (Feathered Commando Wing/Arm)
    this.drawLeftArm(
      ctx,
      centerX - charWidth * 0.3 + torsoLeanX,
      currentCenterY - charHeight * 0.12,
      charWidth,
      charHeight,
      reloadHandOffset,
      anim.state
    );

    // 10. Render Right Arm & Heavy Matte-Black Combat Shotgun
    this.drawRightArmAndShotgun(
      ctx,
      centerX + charWidth * 0.25 + torsoLeanX,
      currentCenterY - charHeight * 0.12,
      charWidth,
      charHeight,
      gunRecoilOffset,
      gunAimAngle,
      muzzleFlashVisible,
      isDead
    );

    // 11. Render Damage Red Flash Filter
    if (player.damageFlash > 0.05) {
      ctx.fillStyle = `rgba(220, 38, 38, ${Math.min(0.55, player.damageFlash * 0.7)})`;
      ctx.fillRect(centerX - charWidth * 0.6, currentCenterY - charHeight * 0.5, charWidth * 1.2, charHeight);
    }

    // 12. Render Drifting White Feathers (from hit damage)
    for (const f of this.feathers) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size * 0.45, f.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-0.5, -f.size * 0.8, 1, f.size * 1.6);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draws the muscular scaly orange-brown bird legs and 3-toed wide feet.
   */
  private drawLegsAndFeet(
    ctx: CanvasRenderingContext2D,
    cx: number,
    groundY: number,
    w: number,
    h: number,
    leftAngle: number,
    rightAngle: number,
    squash: number,
    isDead: boolean
  ) {
    const legWidth = w * 0.11;
    const legLength = h * 0.22 * squash;
    const hipY = groundY - legLength;
    const hipLeftX = cx - w * 0.18;
    const hipRightX = cx + w * 0.18;

    // Scaled orange-brown skin tones (matching reference)
    const skinDark = '#854d0e';
    const skinMid = '#b45309';
    const skinLight = '#d97706';
    const clawColor = '#1c1917';

    // Helper to draw single leg and foot
    const drawLeg = (hx: number, angle: number, isRight: boolean) => {
      ctx.save();
      ctx.translate(hx, hipY);
      ctx.rotate(angle);

      // Thigh knobby joint
      ctx.fillStyle = skinDark;
      ctx.beginPath();
      ctx.arc(0, 0, legWidth * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Lower leg bone/shin with reptile scale texturing
      ctx.fillStyle = skinMid;
      ctx.fillRect(-legWidth * 0.5, 0, legWidth, legLength * 0.85);

      // Scale ridges
      ctx.fillStyle = skinLight;
      for (let y = 3; y < legLength * 0.8; y += 4.5) {
        ctx.fillRect(-legWidth * 0.4, y, legWidth * 0.8, 2);
      }

      // Ankle joint
      ctx.fillStyle = skinDark;
      ctx.beginPath();
      ctx.arc(0, legLength * 0.85, legWidth * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Wide duck/chicken foot with 3 splayed toes (as in reference)
      const footY = legLength * 0.85;
      const footSpread = w * 0.16;

      ctx.fillStyle = skinMid;
      // Center toe
      ctx.beginPath();
      ctx.moveTo(-legWidth * 0.35, footY);
      ctx.lineTo(0, footY + h * 0.07);
      ctx.lineTo(legWidth * 0.35, footY);
      ctx.fill();

      // Outer toes (splayed)
      ctx.beginPath();
      ctx.moveTo(-legWidth * 0.4, footY);
      ctx.lineTo(-footSpread, footY + h * 0.05);
      ctx.lineTo(-legWidth * 0.1, footY + h * 0.02);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(legWidth * 0.4, footY);
      ctx.lineTo(footSpread, footY + h * 0.05);
      ctx.lineTo(legWidth * 0.1, footY + h * 0.02);
      ctx.fill();

      // Claws
      ctx.fillStyle = clawColor;
      ctx.fillRect(-1.5, footY + h * 0.07, 3, 3.5);
      ctx.fillRect(-footSpread - 1.5, footY + h * 0.05, 3, 3);
      ctx.fillRect(footSpread - 1.5, footY + h * 0.05, 3, 3);

      ctx.restore();
    };

    if (!isDead) {
      drawLeg(hipLeftX, leftAngle, false);
      drawLeg(hipRightX, rightAngle, true);
    }
  }

  /**
   * Draws layered white plumage tail feathers cascading over thighs.
   */
  private drawTailPlumage(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    tailWag: number,
    breath: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tailWag);
    ctx.scale(breath, breath);

    const rumpW = w * 0.62;
    const rumpH = h * 0.32;

    // Rump shadow base
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(0, 0, rumpW * 0.52, rumpH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cascading feather layers (triangular downy feathers, exactly as in reference)
    const featherRows = [
      { y: -rumpH * 0.2, count: 7, size: rumpW * 0.18, color: '#e2e8f0' },
      { y: 0, count: 6, size: rumpW * 0.22, color: '#f1f5f9' },
      { y: rumpH * 0.25, count: 5, size: rumpW * 0.24, color: '#ffffff' },
      { y: rumpH * 0.45, count: 4, size: rumpW * 0.26, color: '#f8fafc' },
    ];

    for (const row of featherRows) {
      const step = rumpW / (row.count + 1);
      for (let i = 1; i <= row.count; i++) {
        const fx = -rumpW * 0.5 + i * step;
        ctx.fillStyle = row.color;
        ctx.beginPath();
        ctx.moveTo(fx - row.size * 0.45, row.y);
        ctx.lineTo(fx, row.y + row.size * 0.95);
        ctx.lineTo(fx + row.size * 0.45, row.y);
        ctx.closePath();
        ctx.fill();

        // Feather quill / center line
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx, row.y);
        ctx.lineTo(fx, row.y + row.size * 0.85);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Draws the weathered military tactical vest with horizontal molle webbing bands.
   */
  private drawTacticalVestAndTorso(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    breath: number,
    isHit: boolean
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(breath, breath);

    const vestW = w * 0.58;
    const vestH = h * 0.38;

    // Under-layer white plumage showing around edges
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(0, 0, vestW * 0.56, vestH * 0.54, 0, 0, Math.PI * 2);
    ctx.fill();

    // Weathered dark tactical vest plate (dark charcoal/olive-drab canvas)
    const vestColor = isHit ? '#571c1c' : '#272422';
    const vestTrim = isHit ? '#7f1d1d' : '#1c1917';
    const molleColor = '#3f3a36';

    ctx.fillStyle = vestColor;
    ctx.strokeStyle = vestTrim;
    ctx.lineWidth = 2;

    // Body armor backplate with contoured cut
    ctx.beginPath();
    ctx.roundRect(-vestW * 0.48, -vestH * 0.5, vestW * 0.96, vestH, [8, 8, 12, 12]);
    ctx.fill();
    ctx.stroke();

    // Heavy padded shoulder harness straps (reaching over shoulders)
    ctx.fillStyle = '#1c1917';
    // Left strap
    ctx.fillRect(-vestW * 0.44, -vestH * 0.62, vestW * 0.22, vestH * 0.42);
    // Right strap
    ctx.fillRect(vestW * 0.22, -vestH * 0.62, vestW * 0.22, vestH * 0.42);

    // Buckles & adjusters on shoulder straps
    ctx.fillStyle = '#57534e';
    ctx.fillRect(-vestW * 0.42, -vestH * 0.48, vestW * 0.18, 4);
    ctx.fillRect(vestW * 0.24, -vestH * 0.48, vestW * 0.18, 4);

    // Horizontal MOLLE Webbing Loops (Stitched military rows, as in reference)
    ctx.strokeStyle = molleColor;
    ctx.lineWidth = 2.5;

    for (let rowY = -vestH * 0.28; rowY <= vestH * 0.28; rowY += vestH * 0.18) {
      // Main molle band
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(-vestW * 0.42, rowY - 3, vestW * 0.84, 6);

      // Stitched vertical bar-tacks
      ctx.fillStyle = '#78716c';
      for (let bx = -vestW * 0.36; bx <= vestW * 0.36; bx += vestW * 0.18) {
        ctx.fillRect(bx, rowY - 3, 2, 6);
      }
    }

    ctx.restore();
  }

  /**
   * Draws the heavy combat utility belt with flap ammo pouches on left and right.
   */
  private drawTacticalBeltAndPouches(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    tailWag: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tailWag * 0.5);

    const beltW = w * 0.64;
    const beltH = h * 0.08;

    // Heavy webbing belt
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-beltW * 0.5, -beltH * 0.5, beltW, beltH);

    // Center buckle
    ctx.fillStyle = '#44403c';
    ctx.fillRect(-w * 0.06, -beltH * 0.6, w * 0.12, beltH * 1.2);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-w * 0.04, -beltH * 0.4, w * 0.08, beltH * 0.8);

    // Side Ammo / Magazine Pouches (Boxy flap pouches with snaps)
    const pouchW = w * 0.15;
    const pouchH = h * 0.12;

    const drawPouch = (px: number) => {
      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px - pouchW * 0.5, -beltH * 0.2, pouchW, pouchH, 3);
      ctx.fill();
      ctx.stroke();

      // Flap
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(px - pouchW * 0.5, -beltH * 0.2, pouchW, pouchH * 0.4);

      // Metal snap button
      ctx.fillStyle = '#a8a29e';
      ctx.beginPath();
      ctx.arc(px, pouchH * 0.15, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    // Left pouches
    drawPouch(-beltW * 0.38);
    drawPouch(-beltW * 0.22);

    // Right pouches
    drawPouch(beltW * 0.22);
    drawPouch(beltW * 0.38);

    ctx.restore();
  }

  /**
   * Draws the feathered head viewed from behind with spiky white mohawk crest.
   */
  private drawHeadAndCrest(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    breath: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(breath, breath);

    const headR = w * 0.24;

    // Neck fluff
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, headR * 0.75, headR * 0.85, headR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head base sphere (white downy plumage)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.fill();

    // Subtle edge shading for 3D roundness
    const grad = ctx.createRadialGradient(-headR * 0.2, -headR * 0.2, headR * 0.2, 0, 0, headR);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.8, 'rgba(203, 213, 225, 0.2)');
    grad.addColorStop(1, 'rgba(148, 163, 184, 0.6)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.fill();

    // Ears / Beak side profiles visible slightly
    ctx.fillStyle = '#d97706';
    // Left beak edge
    ctx.beginPath();
    ctx.ellipse(-headR * 0.95, headR * 0.2, headR * 0.18, headR * 0.12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Right beak edge
    ctx.beginPath();
    ctx.ellipse(headR * 0.95, headR * 0.2, headR * 0.18, headR * 0.12, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Spiky white Mohawk Feather Crest on top of crown (as in reference)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;

    const spikes = [
      { x: -headR * 0.4, h: headR * 0.55, tilt: -0.25 },
      { x: -headR * 0.2, h: headR * 0.75, tilt: -0.1 },
      { x: 0, h: headR * 0.85, tilt: 0 },
      { x: headR * 0.2, h: headR * 0.75, tilt: 0.1 },
      { x: headR * 0.4, h: headR * 0.55, tilt: 0.25 },
    ];

    for (const spike of spikes) {
      ctx.save();
      ctx.translate(spike.x, -headR * 0.75);
      ctx.rotate(spike.tilt);
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(0, -spike.h);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draws the left arm/wing with downy white feathers.
   */
  private drawLeftArm(
    ctx: CanvasRenderingContext2D,
    shoulderX: number,
    shoulderY: number,
    w: number,
    h: number,
    reloadOffset: number,
    state: PlayerAnimState
  ) {
    ctx.save();
    ctx.translate(shoulderX, shoulderY);

    const armW = w * 0.16;
    const armH = h * 0.38;

    if (state === 'reload') {
      // Reaching across to reload shotgun under receiver
      ctx.rotate(0.65 + Math.sin(reloadOffset) * 0.15);
    } else if (state === 'cinematic_wall_touch') {
      // Reaching left wing outward to palpate and penetrate the anomalous wall
      ctx.rotate(-1.18);
    } else {
      // Resting naturally at side
      ctx.rotate(-0.08);
    }

    // Arm plumage
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(0, armH * 0.45, armW * 0.55, armH * 0.48, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Wing feather tips at bottom
    ctx.fillStyle = '#e2e8f0';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 4 - 3, armH * 0.8);
      ctx.lineTo(i * 4, armH * 0.98);
      ctx.lineTo(i * 4 + 3, armH * 0.8);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draws the right arm gripping the tactical combat shotgun.
   * Handles low-ready, aiming, muzzle flash burst, recoil kickback.
   */
  private drawRightArmAndShotgun(
    ctx: CanvasRenderingContext2D,
    shoulderX: number,
    shoulderY: number,
    w: number,
    h: number,
    recoilOffset: number,
    aimAngle: number,
    muzzleFlash: boolean,
    isDead: boolean
  ) {
    ctx.save();
    ctx.translate(shoulderX, shoulderY);

    if (isDead) {
      // Shotgun dropped onto floor
      ctx.translate(w * 0.3, h * 0.45);
      ctx.rotate(0.85);
      this.drawShotgunModel(ctx, w, h);
      ctx.restore();
      return;
    }

    // Recoil and aim angle
    ctx.rotate(aimAngle);
    ctx.translate(-recoilOffset * 0.8, -recoilOffset * 0.3);

    // Right arm plumage
    const armW = w * 0.16;
    const armH = h * 0.35;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, armH * 0.4, armW * 0.55, armH * 0.45, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Hand gripping shotgun
    const handX = w * 0.08;
    const handY = armH * 0.75;
    ctx.fillStyle = '#d97706'; // Scaled bird hand
    ctx.beginPath();
    ctx.arc(handX, handY, armW * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Draw Matte Black Tactical Pump-Action Shotgun
    ctx.save();
    ctx.translate(handX, handY);
    // Pointing forward-down at ~55 deg in low ready, or level in aim
    ctx.rotate(0.95 + aimAngle * 1.5);
    this.drawShotgunModel(ctx, w, h);

    // Muzzle Flash Effect (Bursts from shotgun barrel)
    if (muzzleFlash) {
      const barrelLen = h * 0.42;
      ctx.save();
      ctx.translate(0, barrelLen);

      // Bright yellow-orange starburst
      const flashSize = w * 0.45;
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, flashSize);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#fef08a');
      grad.addColorStop(0.7, '#f97316');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, flashSize, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle smoke puff
      ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
      ctx.beginPath();
      ctx.arc((Math.random() - 0.5) * 8, 8, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  /**
   * Precision vector model of the heavy black pump-action combat shotgun.
   */
  private drawShotgunModel(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const gunLen = h * 0.42;
    const gunW = w * 0.08;

    // Receiver (dark matte black metal)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-gunW * 0.5, 0, gunW, gunLen * 0.38);

    // Ejection port on side
    ctx.fillStyle = '#292524';
    ctx.fillRect(gunW * 0.2, gunLen * 0.12, gunW * 0.25, gunLen * 0.14);

    // Barrel & Magazine Tube (twin parallel dark steel tubes)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-gunW * 0.35, gunLen * 0.38, gunW * 0.7, gunLen * 0.58);

    // Ribbed pump-action slide forend
    ctx.fillStyle = '#262626';
    ctx.fillRect(-gunW * 0.48, gunLen * 0.42, gunW * 0.96, gunLen * 0.22);
    // Forend grip grooves
    ctx.fillStyle = '#0a0a0a';
    for (let gy = gunLen * 0.45; gy <= gunLen * 0.6; gy += 4) {
      ctx.fillRect(-gunW * 0.48, gy, gunW * 0.96, 1.5);
    }

    // Muzzle cap & front sight bead
    ctx.fillStyle = '#52525b';
    ctx.fillRect(-gunW * 0.3, gunLen * 0.94, gunW * 0.6, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, gunLen * 0.95, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pistol grip and buttstock
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-gunW * 0.4, -gunLen * 0.24, gunW * 0.8, gunLen * 0.26);
  }
}

export const playerRenderer = new PlayerRenderer();
