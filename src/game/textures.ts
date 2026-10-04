// Procedural pixel-art textures and sprites for retro Raycasting engine

export const TEX_SIZE = 64;

export interface TextureData {
  canvas: HTMLCanvasElement;
  data: Uint32Array;
  width: number;
  height: number;
}

export interface SpriteFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

class TextureCache {
  public walls: Record<number, TextureData> = {};
  public ceilingTexture: TextureData | null = null;
  public floorTexture: TextureData | null = null;

  // Shotgun frames (high-res canvas for crisp screen display)
  public shotgunIdle: HTMLCanvasElement | null = null;
  public shotgunFire: HTMLCanvasElement | null = null;
  public shotgunRecoil: HTMLCanvasElement | null = null;
  public shotgunReload1: HTMLCanvasElement | null = null;
  public shotgunReload2: HTMLCanvasElement | null = null;

  // Chicken frames by variant ('white' | 'brown' | 'black' | 'red')
  public chickens: Record<string, {
    walk: HTMLCanvasElement[];
    attack: HTMLCanvasElement[];
    dead: HTMLCanvasElement[];
  }> = {};

  // Boss "GALLARDO" frames (Muscular Colossus - Natural Tone)
  public boss: {
    walk: HTMLCanvasElement[];
    windup: HTMLCanvasElement[];
    charge: HTMLCanvasElement[];
    attack: HTMLCanvasElement[];
    exhausted: HTMLCanvasElement[];
    slam: HTMLCanvasElement[];
    jump: HTMLCanvasElement[];
    dead: HTMLCanvasElement[];
  } = {
    walk: [],
    windup: [],
    charge: [],
    attack: [],
    exhausted: [],
    slam: [],
    jump: [],
    dead: [],
  };

  // Boss "GALLARDO" ENRAGED frames (Deep Crimson Red Fury)
  public bossRage: {
    walk: HTMLCanvasElement[];
    windup: HTMLCanvasElement[];
    charge: HTMLCanvasElement[];
    attack: HTMLCanvasElement[];
    exhausted: HTMLCanvasElement[];
    slam: HTMLCanvasElement[];
    jump: HTMLCanvasElement[];
    dead: HTMLCanvasElement[];
  } = {
    walk: [],
    windup: [],
    charge: [],
    attack: [],
    exhausted: [],
    slam: [],
    jump: [],
    dead: [],
  };

  // Pickups
  public ammoPickup: HTMLCanvasElement | null = null;
  public healthPickup: HTMLCanvasElement | null = null;
  public bombPickup: HTMLCanvasElement | null = null;

  private initialized = false;

  public init() {
    if (this.initialized) return;

    // Generate Wall Textures
    this.walls[1] = this.createBackroomsWallpaperTexture();
    this.walls[2] = this.createDamagedWallTexture();
    this.walls[3] = this.createPillarTexture();
    this.walls[4] = this.createOldMoldyWallTexture();
    this.walls[5] = this.createRottingLathTexture();
    this.walls[6] = this.createRedHallsWallpaperTexture();
    this.walls[7] = this.createRedHazardWallTexture();
    this.walls[8] = this.createFloodedTileTexture();
    this.walls[9] = this.createExitDoorTexture();
    this.walls[10] = this.createSlimeBrickTexture();
    this.walls[11] = this.createOfficeCubicleTexture();
    this.walls[12] = this.createOfficeWoodTexture();
    this.walls[13] = this.createBlueVoidWallpaperTexture();
    this.walls[14] = this.createBluePillarTexture();
    this.walls[15] = this.createIndustrialMetalTexture();
    this.walls[16] = this.createIndustrialPipeTexture();
    this.walls[17] = this.createNestFleshTexture();
    this.walls[18] = this.createNestVoidTexture();
    this.walls[19] = this.createArenaStoneTexture();
    this.walls[20] = this.createArenaPillarTexture();
    this.walls[21] = this.createArenaGateTexture();

    // Floor and Ceiling
    this.floorTexture = this.createCarpetTexture();
    this.ceilingTexture = this.createCeilingTexture();

    // Weapon sprites
    this.createShotgunSprites();

    // Enemy sprites (Diversified horror variants)
    this.createChickenSprites('white');
    this.createChickenSprites('brown');
    this.createChickenSprites('black');
    this.createChickenSprites('red');
    this.createChickenSprites('lurker');
    this.createChickenSprites('spitter');
    this.createChickenSprites('tank');

    // Boss "EL GALLO" sprites
    this.createBossSprites();

    // Pickups
    this.createPickupSprites();

    this.initialized = true;
  }

  // --- Wall Textures (64x64 uint32 array for blazing raycasting) ---

  private createBackroomsWallpaperTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Base damp mono-yellow
    ctx.fillStyle = '#d4be66';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Subtle wallpaper vertical stripes
    for (let x = 0; x < TEX_SIZE; x += 4) {
      ctx.fillStyle = x % 8 === 0 ? 'rgba(165, 140, 55, 0.4)' : 'rgba(230, 205, 110, 0.2)';
      ctx.fillRect(x, 0, 2, TEX_SIZE);
    }

    // Classic diamond/floral subtle repeated wallpaper motif
    ctx.fillStyle = 'rgba(145, 120, 45, 0.35)';
    for (let y = 6; y < TEX_SIZE; y += 12) {
      for (let x = 4; x < TEX_SIZE; x += 12) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 3, y - 1, 6, 2);
        ctx.fillRect(x - 1, y - 3, 2, 6);
      }
    }

    // Damp moisture stains and mildew spots
    ctx.fillStyle = 'rgba(100, 85, 30, 0.35)';
    ctx.beginPath();
    ctx.ellipse(20, 48, 12, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(45, 20, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Baseboard at bottom
    ctx.fillStyle = '#655025';
    ctx.fillRect(0, TEX_SIZE - 6, TEX_SIZE, 6);
    ctx.fillStyle = '#403015';
    ctx.fillRect(0, TEX_SIZE - 2, TEX_SIZE, 2);

    // Crown molding at top
    ctx.fillStyle = '#b09d50';
    ctx.fillRect(0, 0, TEX_SIZE, 3);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return {
      canvas,
      data: new Uint32Array(imgData.data.buffer),
      width: TEX_SIZE,
      height: TEX_SIZE,
    };
  }

  private createDamagedWallTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Start with base wallpaper
    ctx.fillStyle = '#c5af55';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Peeling wallpaper revealing grey mouldy drywall
    ctx.fillStyle = '#555246';
    ctx.beginPath();
    ctx.moveTo(15, 20);
    ctx.lineTo(48, 15);
    ctx.lineTo(55, 45);
    ctx.lineTo(35, 52);
    ctx.lineTo(12, 40);
    ctx.closePath();
    ctx.fill();

    // Dark mold cracks
    ctx.strokeStyle = '#222018';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 25);
    ctx.lineTo(32, 35);
    ctx.lineTo(44, 30);
    ctx.lineTo(50, 42);
    ctx.stroke();

    // Electrical outlet at base
    ctx.fillStyle = '#dcd8c0';
    ctx.fillRect(28, TEX_SIZE - 18, 10, 10);
    ctx.fillStyle = '#222';
    ctx.fillRect(31, TEX_SIZE - 16, 2, 3);
    ctx.fillRect(35, TEX_SIZE - 16, 2, 3);
    ctx.fillRect(31, TEX_SIZE - 11, 2, 3);
    ctx.fillRect(35, TEX_SIZE - 11, 2, 3);

    // Baseboard
    ctx.fillStyle = '#55401c';
    ctx.fillRect(0, TEX_SIZE - 6, TEX_SIZE, 6);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return {
      canvas,
      data: new Uint32Array(imgData.data.buffer),
      width: TEX_SIZE,
      height: TEX_SIZE,
    };
  }

  private createPillarTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Heavy concrete column with dark grunge
    ctx.fillStyle = '#9c8c4e';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Noise and vertical concrete panels
    for (let x = 0; x < TEX_SIZE; x += 16) {
      ctx.strokeStyle = '#5a5028';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, 16, TEX_SIZE);
    }

    // Heavy grime at floor and ceiling
    const grad = ctx.createLinearGradient(0, 0, 0, TEX_SIZE);
    grad.addColorStop(0, 'rgba(30, 25, 10, 0.6)');
    grad.addColorStop(0.3, 'rgba(30, 25, 10, 0)');
    grad.addColorStop(0.7, 'rgba(30, 25, 10, 0)');
    grad.addColorStop(1, 'rgba(30, 25, 10, 0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return {
      canvas,
      data: new Uint32Array(imgData.data.buffer),
      width: TEX_SIZE,
      height: TEX_SIZE,
    };
  }

  private createExitDoorTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Steel door frame
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Door panel (dark industrial grey-green)
    ctx.fillStyle = '#3c483e';
    ctx.fillRect(6, 4, TEX_SIZE - 12, TEX_SIZE - 6);

    // Glowing EXIT sign at top
    ctx.fillStyle = '#111';
    ctx.fillRect(16, 8, 32, 10);
    ctx.fillStyle = '#00ff44';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SALIDA', 32, 13);

    // Reinforced glass window with wire grid
    ctx.fillStyle = '#8ad8ff';
    ctx.fillRect(20, 22, 24, 18);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 20; x <= 44; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 22);
      ctx.lineTo(x, 40);
      ctx.stroke();
    }
    for (let y = 22; y <= 40; y += 6) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(44, y);
      ctx.stroke();
    }

    // Emergency push-bar handle
    ctx.fillStyle = '#ff2222';
    ctx.fillRect(10, 44, TEX_SIZE - 20, 5);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(8, 43, 4, 7);
    ctx.fillRect(TEX_SIZE - 12, 43, 4, 7);

    // Warning hazard stripes at bottom of door
    for (let x = 8; x < TEX_SIZE - 8; x += 8) {
      ctx.fillStyle = '#e5a50a';
      ctx.fillRect(x, TEX_SIZE - 10, 4, 6);
      ctx.fillStyle = '#111';
      ctx.fillRect(x + 4, TEX_SIZE - 10, 4, 6);
    }

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return {
      canvas,
      data: new Uint32Array(imgData.data.buffer),
      width: TEX_SIZE,
      height: TEX_SIZE,
    };
  }

  // --- LEVEL 2 (Old Rooms) Textures ---
  private createOldMoldyWallTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#736b4b';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Peeling damp mildew strips
    for (let x = 0; x < TEX_SIZE; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? '#4d4631' : '#5c543b';
      ctx.fillRect(x, 0, 4, TEX_SIZE);
    }
    // Severe green/black mold creeping from ceiling and floor
    const moldGrad = ctx.createLinearGradient(0, 0, 0, TEX_SIZE);
    moldGrad.addColorStop(0, 'rgba(20, 30, 15, 0.85)');
    moldGrad.addColorStop(0.35, 'rgba(20, 30, 15, 0)');
    moldGrad.addColorStop(0.65, 'rgba(15, 25, 10, 0)');
    moldGrad.addColorStop(1, 'rgba(15, 25, 10, 0.9)');
    ctx.fillStyle = moldGrad;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Deep water damage crack
    ctx.strokeStyle = '#1e1a12';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(24, 25);
    ctx.lineTo(18, 45);
    ctx.lineTo(35, TEX_SIZE);
    ctx.stroke();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createRottingLathTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Broken plaster revealing exposed horizontal wooden laths
    ctx.fillStyle = '#6e6347';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Plaster hole
    ctx.fillStyle = '#2b2318';
    ctx.fillRect(10, 12, 44, 40);

    // Wooden laths behind hole
    for (let y = 14; y < 50; y += 7) {
      ctx.fillStyle = '#5c4025';
      ctx.fillRect(10, y, 44, 4);
      ctx.fillStyle = '#1f150b';
      ctx.fillRect(10, y + 4, 44, 3);
    }

    // Broken jagged plaster border around hole
    ctx.strokeStyle = '#85785a';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 12, 44, 40);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- LEVEL 3 (Red Halls) Textures ---
  private createRedHallsWallpaperTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Blood-stained crimson wallpaper
    ctx.fillStyle = '#6b1717';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Dark maroon vertical stripes
    for (let x = 0; x < TEX_SIZE; x += 6) {
      ctx.fillStyle = x % 12 === 0 ? '#4a0e0e' : '#852020';
      ctx.fillRect(x, 0, 3, TEX_SIZE);
    }

    // Ominous claw scratches
    ctx.strokeStyle = '#240404';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(18 + i * 4, 15);
      ctx.lineTo(32 + i * 4, 45);
      ctx.stroke();
    }

    // Vignette shadow top and bottom
    const g = ctx.createLinearGradient(0, 0, 0, TEX_SIZE);
    g.addColorStop(0, 'rgba(20, 0, 0, 0.7)');
    g.addColorStop(0.5, 'transparent');
    g.addColorStop(1, 'rgba(20, 0, 0, 0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createRedHazardWallTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3a0c0c';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Hazard stripes across middle
    for (let x = -TEX_SIZE; x < TEX_SIZE * 2; x += 14) {
      ctx.fillStyle = '#b32222';
      ctx.beginPath();
      ctx.moveTo(x, 18);
      ctx.lineTo(x + 8, 18);
      ctx.lineTo(x - 8, 46);
      ctx.lineTo(x - 16, 46);
      ctx.closePath();
      ctx.fill();
    }
    // Heavy metal border
    ctx.strokeStyle = '#180404';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, TEX_SIZE, TEX_SIZE);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- LEVEL 4 (Flooded Backrooms) Textures ---
  private createFloodedTileTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Damp greenish-grey waterlogged subway tiles
    ctx.fillStyle = '#384842';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Tile grid
    ctx.strokeStyle = '#222e2a';
    ctx.lineWidth = 1;
    for (let y = 0; y < TEX_SIZE; y += 16) {
      ctx.strokeRect(0, y, TEX_SIZE, 16);
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = offset; x < TEX_SIZE; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 16);
        ctx.stroke();
      }
    }

    // High water line stain
    ctx.fillStyle = 'rgba(12, 40, 30, 0.7)';
    ctx.fillRect(0, 36, TEX_SIZE, TEX_SIZE - 36);
    ctx.strokeStyle = '#0a221a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(TEX_SIZE, 36);
    ctx.stroke();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createSlimeBrickTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#26332d';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Algae patches
    ctx.fillStyle = '#1c4228';
    ctx.beginPath();
    ctx.ellipse(22, 28, 14, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(44, 46, 12, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- LEVEL 5 (Office Backrooms) Textures ---
  private createOfficeCubicleTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Grey acoustic felt fabric
    ctx.fillStyle = '#4c5258';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Fabric weave pattern
    for (let x = 0; x < TEX_SIZE; x += 3) {
      ctx.fillStyle = x % 6 === 0 ? '#3e4449' : '#575e65';
      ctx.fillRect(x, 0, 1.5, TEX_SIZE);
    }

    // Metal frame edge trim
    ctx.fillStyle = '#282b2e';
    ctx.fillRect(0, 0, 3, TEX_SIZE);
    ctx.fillRect(TEX_SIZE - 3, 0, 3, TEX_SIZE);
    ctx.fillRect(0, 0, TEX_SIZE, 3);
    ctx.fillRect(0, TEX_SIZE - 4, TEX_SIZE, 4);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createOfficeWoodTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // 1990s faux wood laminate partition
    ctx.fillStyle = '#6e4526';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Vertical wood grain lines
    for (let x = 0; x < TEX_SIZE; x += 4) {
      ctx.fillStyle = x % 8 === 0 ? '#54341b' : '#825430';
      ctx.fillRect(x, 0, 2, TEX_SIZE);
    }
    // Office door knob at right
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(TEX_SIZE - 12, 34, 4, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- LEVEL 6 (Blue Rooms) Textures ---
  private createBlueVoidWallpaperTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Luminescent deep indigo-cyan wallpaper
    ctx.fillStyle = '#14253d';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Geometric cyan motif
    ctx.strokeStyle = '#1e4875';
    ctx.lineWidth = 1;
    for (let y = 8; y < TEX_SIZE; y += 16) {
      for (let x = 8; x < TEX_SIZE; x += 16) {
        ctx.strokeRect(x - 5, y - 5, 10, 10);
      }
    }

    // Glowing ghostly blue vertical seam
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(30, 0, 4, TEX_SIZE);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createBluePillarTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0f1b2b';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    ctx.strokeStyle = '#223c5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 0, TEX_SIZE - 8, TEX_SIZE);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- LEVEL 7 (Industrial) Textures ---
  private createIndustrialMetalTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Rusty riveted metal plate
    ctx.fillStyle = '#4a4744';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Heavy rust bleeding
    ctx.fillStyle = '#6b3c1b';
    ctx.beginPath();
    ctx.arc(20, 20, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(48, 44, 16, 0, Math.PI * 2);
    ctx.fill();

    // Steel rivets at corners
    ctx.fillStyle = '#1c1c1c';
    const rivets = [[6, 6], [TEX_SIZE - 6, 6], [6, TEX_SIZE - 6], [TEX_SIZE - 6, TEX_SIZE - 6]];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createIndustrialPipeTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#303030';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Thick steam pipe across middle
    const pipeGrad = ctx.createLinearGradient(0, 18, 0, 46);
    pipeGrad.addColorStop(0, '#222');
    pipeGrad.addColorStop(0.3, '#75685a');
    pipeGrad.addColorStop(0.6, '#b09d89');
    pipeGrad.addColorStop(1, '#222');
    ctx.fillStyle = pipeGrad;
    ctx.fillRect(0, 18, TEX_SIZE, 28);

    // Pressure gauge
    ctx.fillStyle = '#e8dec8';
    ctx.beginPath();
    ctx.arc(32, 32, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b53118';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(32, 32);
    ctx.lineTo(37, 27);
    ctx.stroke();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- LEVEL 8 (The Nest) Textures ---
  private createNestFleshTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Grotesque biological walls: deep visceral red with feathers and bone shards
    ctx.fillStyle = '#38090f';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Tendons and veins
    ctx.strokeStyle = '#78121f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(20, 30, 40, 10, TEX_SIZE, 35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.bezierCurveTo(25, 35, 45, 55, TEX_SIZE, 45);
    ctx.stroke();

    // Embedded feathers and claw scratch marks
    ctx.fillStyle = '#9e8c8a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(14 + i * 12, 22 + (i % 2) * 16, 3, 8, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createNestVoidTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Dark void abyss matter with glowing crimson eyes
    ctx.fillStyle = '#0a0204';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Glowing predatory eyes embedded in walls
    const eyes = [[16, 20], [44, 18], [28, 42]];
    eyes.forEach(([ex, ey]) => {
      ctx.fillStyle = '#ff0033';
      ctx.beginPath();
      ctx.ellipse(ex - 3, ey, 2, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(ex + 3, ey, 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  // --- FINAL BOSS ARENA ("LA ARENA DE GALLARDO") Textures ---
  private createArenaStoneTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Black volcanic stone blocks with blood-stained seams
    ctx.fillStyle = '#150f11';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Stone block brickwork lines
    ctx.strokeStyle = '#4a111a';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, TEX_SIZE - 4, 30);
    ctx.strokeRect(2, 32, TEX_SIZE - 4, 30);

    // Crimson blood splatters
    ctx.fillStyle = '#6b0d18';
    ctx.beginPath();
    ctx.ellipse(24, 20, 8, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(45, 45, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Subtle stone texture flecks
    ctx.fillStyle = '#2d1b20';
    for (let i = 0; i < 40; i++) {
      const rx = Math.floor(Math.random() * TEX_SIZE);
      const ry = Math.floor(Math.random() * TEX_SIZE);
      ctx.fillRect(rx, ry, 2, 2);
    }

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createArenaPillarTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Monolithic dark obsidian column with fiery molten cracks
    ctx.fillStyle = '#0d090a';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Vertical carved fluting
    for (let x = 4; x < TEX_SIZE; x += 10) {
      ctx.fillStyle = '#221517';
      ctx.fillRect(x, 0, 4, TEX_SIZE);
      ctx.fillStyle = '#0a0506';
      ctx.fillRect(x + 4, 0, 3, TEX_SIZE);
    }

    // Glowing magma / rage runic cracks
    ctx.strokeStyle = '#ff2a00';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(28, 22);
    ctx.lineTo(36, 42);
    ctx.lineTo(30, TEX_SIZE);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createArenaGateTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Heavy iron dungeon portcullis / sacrificial altar wall
    ctx.fillStyle = '#1c181a';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Thick iron bars with golden chicken crest silhouette
    ctx.fillStyle = '#3a3135';
    for (let x = 6; x < TEX_SIZE; x += 12) {
      ctx.fillRect(x, 0, 5, TEX_SIZE);
    }
    ctx.fillRect(0, 16, TEX_SIZE, 6);
    ctx.fillRect(0, 42, TEX_SIZE, 6);

    // Golden chicken crest emblem
    ctx.fillStyle = '#c99a2c';
    ctx.beginPath();
    ctx.arc(32, 29, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9e1818';
    ctx.beginPath();
    ctx.arc(32, 29, 5, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return { canvas, data: new Uint32Array(imgData.data.buffer), width: TEX_SIZE, height: TEX_SIZE };
  }

  private createCarpetTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Foul dirty beige-yellow commercial carpet
    ctx.fillStyle = '#8a7738';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Carpet pile noise
    for (let i = 0; i < 600; i++) {
      const x = Math.floor(Math.random() * TEX_SIZE);
      const y = Math.floor(Math.random() * TEX_SIZE);
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(50, 40, 15, 0.4)' : 'rgba(170, 150, 80, 0.3)';
      ctx.fillRect(x, y, 1, 1);
    }

    // Moisture damp water stain
    ctx.fillStyle = 'rgba(40, 32, 10, 0.45)';
    ctx.beginPath();
    ctx.ellipse(32, 32, 20, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return {
      canvas,
      data: new Uint32Array(imgData.data.buffer),
      width: TEX_SIZE,
      height: TEX_SIZE,
    };
  }

  private createCeilingTexture(): TextureData {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;

    // White/grey acoustic ceiling tiles
    ctx.fillStyle = '#cfcaa5';
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Metal T-bar grid lines
    ctx.strokeStyle = '#504d3d';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, TEX_SIZE, TEX_SIZE);

    // Center fluorescent light fixture
    ctx.fillStyle = '#fffec8';
    ctx.fillRect(16, 12, 32, 40);
    ctx.strokeStyle = '#807c5a';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 12, 32, 40);

    // Two fluorescent glass tubes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 14, 6, 36);
    ctx.fillRect(36, 14, 6, 36);

    const imgData = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE);
    return {
      canvas,
      data: new Uint32Array(imgData.data.buffer),
      width: TEX_SIZE,
      height: TEX_SIZE,
    };
  }

  // --- Weapon Sprites (Shotgun in DOOM perspective) ---

  private createShotgunSprites() {
    const w = 320;
    const h = 260;

    // 1. Idle Frame
    const cIdle = document.createElement('canvas');
    cIdle.width = w;
    cIdle.height = h;
    const ctxIdle = cIdle.getContext('2d')!;
    this.drawShotgunBase(ctxIdle, w, h, 0, 0);
    this.shotgunIdle = cIdle;

    // 2. Fire Frame (massive muzzle flash + smoke)
    const cFire = document.createElement('canvas');
    cFire.width = w;
    cFire.height = h;
    const ctxFire = cFire.getContext('2d')!;
    this.drawShotgunBase(ctxFire, w, h, 0, -25);
    // Draw huge muzzle flash
    ctxFire.save();
    const grad = ctxFire.createRadialGradient(w / 2, 70, 10, w / 2, 70, 95);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, '#fff066');
    grad.addColorStop(0.65, '#ff5500');
    grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
    ctxFire.fillStyle = grad;
    ctxFire.beginPath();
    ctxFire.arc(w / 2, 70, 95, 0, Math.PI * 2);
    ctxFire.fill();

    // Spiky flash flames
    ctxFire.fillStyle = '#fff5aa';
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const x1 = w / 2 + Math.cos(angle) * 30;
      const y1 = 70 + Math.sin(angle) * 30;
      const x2 = w / 2 + Math.cos(angle) * 110;
      const y2 = 70 + Math.sin(angle) * 110;
      ctxFire.beginPath();
      ctxFire.moveTo(w / 2, 70);
      ctxFire.lineTo(x1 - 8, y1);
      ctxFire.lineTo(x2, y2);
      ctxFire.lineTo(x1 + 8, y1);
      ctxFire.closePath();
      ctxFire.fill();
    }
    ctxFire.restore();
    this.shotgunFire = cFire;

    // 3. Recoil Frame (barrel kicked back, smoke rising)
    const cRecoil = document.createElement('canvas');
    cRecoil.width = w;
    cRecoil.height = h;
    const ctxRecoil = cRecoil.getContext('2d')!;
    this.drawShotgunBase(ctxRecoil, w, h, 0, -35);
    // Gun smoke
    ctxRecoil.fillStyle = 'rgba(200, 200, 200, 0.4)';
    ctxRecoil.beginPath();
    ctxRecoil.arc(w / 2 - 15, 60, 25, 0, Math.PI * 2);
    ctxRecoil.arc(w / 2 + 15, 50, 32, 0, Math.PI * 2);
    ctxRecoil.fill();
    this.shotgunRecoil = cRecoil;

    // 4. Reload Frame 1 (Pump down / shells visible)
    const cRel1 = document.createElement('canvas');
    cRel1.width = w;
    cRel1.height = h;
    const ctxRel1 = cRel1.getContext('2d')!;
    this.drawShotgunBase(ctxRel1, w, h, -20, 20);
    // Hand holding red 12-gauge shell
    ctxRel1.fillStyle = '#d43030';
    ctxRel1.fillRect(w / 2 - 35, 140, 16, 32);
    ctxRel1.fillStyle = '#e5a50a'; // brass head
    ctxRel1.fillRect(w / 2 - 35, 164, 16, 8);
    // Player hand glove
    ctxRel1.fillStyle = '#2b2b2b';
    ctxRel1.beginPath();
    ctxRel1.arc(w / 2 - 30, 175, 24, 0, Math.PI * 2);
    ctxRel1.fill();
    this.shotgunReload1 = cRel1;

    // 5. Reload Frame 2 (Pumping back up)
    const cRel2 = document.createElement('canvas');
    cRel2.width = w;
    cRel2.height = h;
    const ctxRel2 = cRel2.getContext('2d')!;
    this.drawShotgunBase(ctxRel2, w, h, 10, 10);
    this.shotgunReload2 = cRel2;
  }

  private drawShotgunBase(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    offsetX: number,
    offsetY: number
  ) {
    const cx = w / 2 + offsetX;
    const cy = h - 20 + offsetY;

    ctx.save();

    // Twin blued steel barrels
    const barrelW = 28;
    const barrelL = 170;

    // Left barrel
    const bGradL = ctx.createLinearGradient(cx - barrelW - 2, 0, cx - 2, 0);
    bGradL.addColorStop(0, '#1a1a1a');
    bGradL.addColorStop(0.3, '#5c6368');
    bGradL.addColorStop(0.7, '#8f989f');
    bGradL.addColorStop(1, '#222629');
    ctx.fillStyle = bGradL;
    ctx.fillRect(cx - barrelW - 2, cy - barrelL, barrelW, barrelL);

    // Right barrel
    const bGradR = ctx.createLinearGradient(cx + 2, 0, cx + barrelW + 2, 0);
    bGradR.addColorStop(0, '#222629');
    bGradR.addColorStop(0.3, '#8f989f');
    bGradR.addColorStop(0.7, '#5c6368');
    bGradR.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = bGradR;
    ctx.fillRect(cx + 2, cy - barrelL, barrelW, barrelL);

    // Barrel muzzle holes
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(cx - barrelW / 2 - 2, cy - barrelL, barrelW / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + barrelW / 2 + 2, cy - barrelL, barrelW / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center rib & front brass bead sight
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(cx - 2, cy - barrelL, 4, barrelL);
    ctx.fillStyle = '#f0c030';
    ctx.beginPath();
    ctx.arc(cx, cy - barrelL + 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Wooden / Polymer fore-end grip
    const gripGrad = ctx.createLinearGradient(cx - 42, 0, cx + 42, 0);
    gripGrad.addColorStop(0, '#3e2211');
    gripGrad.addColorStop(0.4, '#7a4822');
    gripGrad.addColorStop(0.6, '#7a4822');
    gripGrad.addColorStop(1, '#3e2211');
    ctx.fillStyle = gripGrad;
    ctx.beginPath();
    ctx.roundRect(cx - 40, cy - 90, 80, 80, 10);
    ctx.fill();

    // Checkering ridges on grip
    ctx.strokeStyle = '#221105';
    ctx.lineWidth = 1.5;
    for (let y = cy - 80; y < cy - 20; y += 8) {
      ctx.beginPath();
      ctx.moveTo(cx - 36, y);
      ctx.lineTo(cx + 36, y);
      ctx.stroke();
    }

    // Hands holding the weapon (tactical dark gloves)
    ctx.fillStyle = '#1c1c1c';
    // Left hand gripping pump
    ctx.beginPath();
    ctx.ellipse(cx - 36, cy - 50, 18, 26, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Right hand at receiver/stock
    ctx.beginPath();
    ctx.ellipse(cx + 38, cy + 10, 24, 30, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Killer Chicken Sprites (White, Brown, Black, Red, Lurker, Spitter, Tank) ---

  private createChickenSprites(colorType: 'white' | 'brown' | 'black' | 'red' | 'lurker' | 'spitter' | 'tank') {
    const size = 128;
    const walkFrames: HTMLCanvasElement[] = [];
    const attackFrames: HTMLCanvasElement[] = [];
    const deadFrames: HTMLCanvasElement[] = [];

    // Walk animation (3 frames)
    for (let i = 0; i < 3; i++) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      this.drawChicken(ctx, size, colorType, 'walk', i);
      walkFrames.push(c);
    }

    // Attack animation (2 frames)
    for (let i = 0; i < 2; i++) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      this.drawChicken(ctx, size, colorType, 'attack', i);
      attackFrames.push(c);
    }

    // Dead animation (2 frames)
    for (let i = 0; i < 2; i++) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      this.drawChicken(ctx, size, colorType, 'dead', i);
      deadFrames.push(c);
    }

    this.chickens[colorType] = {
      walk: walkFrames,
      attack: attackFrames,
      dead: deadFrames,
    };
  }

  private drawChicken(
    ctx: CanvasRenderingContext2D,
    s: number,
    type: 'white' | 'brown' | 'black' | 'red' | 'lurker' | 'spitter' | 'tank',
    anim: 'walk' | 'attack' | 'dead',
    frame: number
  ) {
    const cx = s / 2;
    const cy = s * 0.65;

    ctx.save();

    // Color definitions
    let mainColor = '#f0ede6';
    let shadeColor = '#b5afa3';
    let combColor = '#cc1e1e';
    let eyeGlow = '#ff0033';

    if (type === 'brown') {
      mainColor = '#8a4b26';
      shadeColor = '#502810';
      combColor = '#a81515';
      eyeGlow = '#ff2200';
    } else if (type === 'black') {
      mainColor = '#1e1c1b';
      shadeColor = '#0c0a09';
      combColor = '#6d1010';
      eyeGlow = '#ff0055';
    } else if (type === 'red') {
      mainColor = '#880808';
      shadeColor = '#420202';
      combColor = '#e60000';
      eyeGlow = '#ffea00'; // piercing yellow demonic gaze
    } else if (type === 'lurker') {
      mainColor = '#0d0d11';
      shadeColor = '#040406';
      combColor = '#3d0808';
      eyeGlow = '#ff0022'; // piercing crimson night gaze
    } else if (type === 'spitter') {
      mainColor = '#4c5e20';
      shadeColor = '#24300d';
      combColor = '#888018';
      eyeGlow = '#aaff00'; // corrosive toxic acid glow
    } else if (type === 'tank') {
      mainColor = '#4e1414';
      shadeColor = '#220808';
      combColor = '#8c0c0c';
      eyeGlow = '#ff6a00'; // enraged molten gaze
    }

    if (anim === 'dead') {
      // Bloody heap on the ground
      ctx.fillStyle = 'rgba(140, 10, 10, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx, s - 16, 45, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crumpled body
      ctx.fillStyle = shadeColor;
      ctx.beginPath();
      ctx.ellipse(cx, s - 24, 34, 18, frame === 0 ? 0.2 : -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.ellipse(cx - 6, s - 28, 26, 14, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Blood splatter on feathers
      ctx.fillStyle = '#990000';
      ctx.fillRect(cx - 15, s - 30, 8, 4);
      ctx.fillRect(cx + 8, s - 25, 12, 6);

      // Limp claw
      ctx.strokeStyle = '#c8952a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 20, s - 20);
      ctx.lineTo(cx + 38, s - 18);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Standing / Walking / Attacking Chickens
    const bob = anim === 'walk' ? Math.sin(frame * Math.PI) * 4 : 0;
    const lunge = anim === 'attack' ? (frame === 1 ? 12 : -4) : 0;

    // Sharp claws / legs
    ctx.strokeStyle = '#d49b28';
    ctx.lineWidth = 3.5;
    const legOffset = anim === 'walk' ? (frame === 1 ? 8 : -8) : 0;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 20 + bob);
    ctx.lineTo(cx - 16 - legOffset, s - 12);
    ctx.lineTo(cx - 24 - legOffset, s - 8);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy + 20 + bob);
    ctx.lineTo(cx + 16 + legOffset, s - 12);
    ctx.lineTo(cx + 24 + legOffset, s - 8);
    ctx.stroke();

    // Chicken plump body
    const bodyW = anim === 'attack' ? 42 : 36;
    const bodyH = anim === 'attack' ? 30 : 34;

    ctx.fillStyle = shadeColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bob, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + bob - 2, bodyW - 4, bodyH - 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feather texture layers
    ctx.fillStyle = shadeColor;
    for (let fy = cy - 10 + bob; fy <= cy + 18 + bob; fy += 8) {
      for (let fx = cx - 22; fx <= cx + 22; fx += 11) {
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI);
        ctx.fill();
      }
    }

    // Wings (spread if attacking)
    if (anim === 'attack') {
      // Left flared wing
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.ellipse(cx - 44, cy - 8 + bob, 22, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // Right flared wing
      ctx.beginPath();
      ctx.ellipse(cx + 44, cy - 8 + bob, 22, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Folded side wings
      ctx.fillStyle = shadeColor;
      ctx.beginPath();
      ctx.ellipse(cx - 22, cy + 4 + bob, 10, 20, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 22, cy + 4 + bob, 10, 20, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Creepy Long Sinewy Neck & Iconic Uncanny Tilted Face
    // Head bob and lunge
    const headBaseY = cy - 36 + bob - lunge;
    const isAttacking = anim === 'attack';
    const isRedAlpha = type === 'red';

    // Draw the exact uncanny face from the reference image onto all chickens!
    this.drawUncannyFace(
      ctx,
      cx,
      headBaseY,
      0.82, // scale suited for 128px chicken body
      0.48, // tilted head angle (~28-30 degrees)
      isRedAlpha,
      isAttacking,
      eyeGlow,
      true, // comb
      combColor
    );

    ctx.restore();
  }

  // --- The Iconic Uncanny Face (from reference image) ---
  // Tilted bald cranium, huge circular staring unblinking eyes, hollow skull nose,
  // impossibly wide smile with tight neat rows of rectangular human teeth, sinewy wrinkled neck.
  public drawUncannyFace(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    angleRad: number,
    isEnraged: boolean,
    isAttacking: boolean,
    eyeGlowColor: string = '#ff0033',
    hasComb: boolean = false,
    combColor: string = '#b31515',
    isRageFace: boolean = false
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    ctx.scale(scale, scale);

    // 1. Long curved sinewy neck connection (reaching down to body)
    const neckGrad = ctx.createLinearGradient(-14, 0, 14, 42);
    if (isRageFace) {
      neckGrad.addColorStop(0, '#9c1c1c');
      neckGrad.addColorStop(0.5, '#751414');
      neckGrad.addColorStop(1, '#470b0b');
    } else {
      neckGrad.addColorStop(0, '#e5dec9');
      neckGrad.addColorStop(0.5, '#cec5af');
      neckGrad.addColorStop(1, '#9b927e');
    }
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(-12, 10);
    ctx.quadraticCurveTo(-16, 26, -18, 48);
    ctx.lineTo(16, 48);
    ctx.quadraticCurveTo(12, 26, 10, 10);
    ctx.closePath();
    ctx.fill();

    // Neck horizontal wrinkles and crosshatch creases
    ctx.strokeStyle = isRageFace ? 'rgba(40, 10, 10, 0.75)' : 'rgba(45, 40, 32, 0.65)';
    ctx.lineWidth = 1.2;
    for (let ny = 16; ny <= 42; ny += 6) {
      ctx.beginPath();
      ctx.moveTo(-12 - (ny - 16) * 0.15, ny);
      ctx.quadraticCurveTo(0, ny + 2, 12, ny);
      ctx.stroke();
    }

    // Small skin mark on right side of neck (from reference drawing)
    ctx.fillStyle = isRageFace ? '#3d0808' : '#3a3025';
    ctx.beginPath();
    ctx.arc(7, 36, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Head Shape: Tilted elongated bald cranium
    const headGrad = ctx.createRadialGradient(-3, -12, 4, 0, -4, 25);
    if (isRageFace) {
      headGrad.addColorStop(0, '#bd2222');
      headGrad.addColorStop(0.65, '#8c1616');
      headGrad.addColorStop(1, '#570d0d');
    } else {
      headGrad.addColorStop(0, '#f4efe4');
      headGrad.addColorStop(0.65, '#dcd3c0');
      headGrad.addColorStop(1, '#988f7c');
    }
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -6, 21, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark contour outline
    ctx.strokeStyle = isRageFace ? '#330808' : '#251f19';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Head pores / dark speckles at crown of cranium (from reference drawing)
    ctx.fillStyle = 'rgba(40, 32, 25, 0.7)';
    const pores = [[-6, -24], [-2, -26], [2, -25], [6, -22], [-9, -20], [8, -19], [-1, -21]];
    pores.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rooster comb on head if applicable
    if (hasComb) {
      ctx.fillStyle = combColor;
      ctx.beginPath();
      ctx.moveTo(-10, -25);
      ctx.lineTo(-7, -34);
      ctx.lineTo(-2, -27);
      ctx.lineTo(3, -36);
      ctx.lineTo(8, -28);
      ctx.lineTo(13, -33);
      ctx.lineTo(12, -24);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#400';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Eyebrow indentations and ink crosshatching around eye sockets
    ctx.strokeStyle = 'rgba(30, 24, 18, 0.55)';
    ctx.lineWidth = 0.8;
    for (let a = 0; a < 7; a++) {
      ctx.beginPath();
      ctx.moveTo(-16 + a * 1.6, -18);
      ctx.lineTo(-14 + a * 1.6, -13);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5 + a * 1.6, -18);
      ctx.lineTo(7 + a * 1.6, -13);
      ctx.stroke();
    }

    // 4. HUGE circular staring hollow eyes
    const eyeR = 6.8;
    const leftEyeX = -8;
    const rightEyeX = 8;
    const eyeY = -9;

    // Outer dark socket shadow
    ctx.fillStyle = '#120f0c';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeR + 1, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeR + 1, 0, Math.PI * 2);
    ctx.fill();

    // White iris ring
    ctx.fillStyle = '#eae3d2';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Dilated black pupil (fills almost entire eye)
    ctx.fillStyle = '#060403';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeR - 1.4, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeR - 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Concentric iris ring line
    ctx.strokeStyle = '#4a3e32';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeR - 0.7, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeR - 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Piercing pinprick highlight or demonic glowing pupils
    if (isEnraged || isAttacking) {
      ctx.fillStyle = eyeGlowColor;
      ctx.shadowColor = eyeGlowColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY, 2.8, 0, Math.PI * 2);
      ctx.arc(rightEyeX, eyeY, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Unblinking specular pinprick
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(leftEyeX - 1.2, eyeY - 1.2, 1.2, 0, Math.PI * 2);
      ctx.arc(rightEyeX - 1.2, eyeY - 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Sunken Skull Nasal Cavity (Hollow triangular dark nose aperture)
    ctx.fillStyle = '#140f0c';
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(-2.8, 1.8);
    ctx.lineTo(2.8, 1.8);
    ctx.closePath();
    ctx.fill();

    // 6. Impossibly Wide Grinning Mouth with Tightly Packed Human Teeth
    ctx.fillStyle = '#0f0b08';
    ctx.beginPath();
    ctx.moveTo(-17, 3);
    ctx.quadraticCurveTo(0, 16, 17, 3);
    ctx.quadraticCurveTo(0, 6, -17, 3);
    ctx.closePath();
    ctx.fill();

    // Teeth: two dense rows of neat rectangular human teeth
    const teethW = 26;
    const teethStartX = -13;
    const numTeeth = 10;
    const toothWidth = teethW / numTeeth;

    for (let t = 0; t < numTeeth; t++) {
      const tx = teethStartX + t * toothWidth;
      const curveOffset = Math.sin((t / numTeeth) * Math.PI) * 3.6;

      // Upper tooth
      ctx.fillStyle = t % 2 === 0 ? '#f7f2e4' : '#eae1ce';
      ctx.fillRect(tx + 0.3, 3.5 + curveOffset * 0.4, toothWidth - 0.6, 4.2);

      // Lower tooth
      ctx.fillStyle = t % 2 === 0 ? '#ebe2cd' : '#ded4be';
      ctx.fillRect(tx + 0.3, 7.8 + curveOffset * 0.6, toothWidth - 0.6, 4.2);

      // Vertical dark separator slits
      ctx.strokeStyle = '#18120d';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(tx, 3 + curveOffset * 0.4);
      ctx.lineTo(tx, 12 + curveOffset * 0.6);
      ctx.stroke();
    }

    // Horizontal divider between upper and lower teeth
    ctx.strokeStyle = '#1c150f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-13, 7.8);
    ctx.quadraticCurveTo(0, 12.2, 13, 7.8);
    ctx.stroke();

    // Outer lip contour
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-18, 2.5);
    ctx.quadraticCurveTo(0, 17, 18, 2.5);
    ctx.stroke();

    ctx.restore();
  }

  // --- Boss "GALLARDO" Sprites (Muscular Titan at 256x256) ---

  private createBossSprites() {
    const size = 256;

    // Helper to generate a canvas frame
    const makeFrame = (
      state: 'walk' | 'windup' | 'charge' | 'attack' | 'exhausted' | 'slam' | 'jump' | 'dead',
      frameIndex: number,
      isRage: boolean = false
    ) => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      this.drawBoss(ctx, size, state, frameIndex, isRage);
      return c;
    };

    // 1. Natural Tone Gallardo ("Tranquilo" / Natural Skin & Feathers)
    for (let i = 0; i < 3; i++) this.boss.walk.push(makeFrame('walk', i, false));
    for (let i = 0; i < 2; i++) this.boss.windup.push(makeFrame('windup', i, false));
    for (let i = 0; i < 2; i++) this.boss.charge.push(makeFrame('charge', i, false));
    for (let i = 0; i < 2; i++) this.boss.attack.push(makeFrame('attack', i, false));
    for (let i = 0; i < 2; i++) this.boss.exhausted.push(makeFrame('exhausted', i, false));
    for (let i = 0; i < 2; i++) this.boss.slam.push(makeFrame('slam', i, false));
    for (let i = 0; i < 2; i++) this.boss.jump.push(makeFrame('jump', i, false));
    for (let i = 0; i < 2; i++) this.boss.dead.push(makeFrame('dead', i, false));

    // 2. Enraged Red Tone Gallardo ("Furia" / Crimson Red Skin & Burning Veins)
    for (let i = 0; i < 3; i++) this.bossRage.walk.push(makeFrame('walk', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.windup.push(makeFrame('windup', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.charge.push(makeFrame('charge', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.attack.push(makeFrame('attack', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.exhausted.push(makeFrame('exhausted', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.slam.push(makeFrame('slam', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.jump.push(makeFrame('jump', i, true));
    for (let i = 0; i < 2; i++) this.bossRage.dead.push(makeFrame('dead', i, true));
  }

  private drawBoss(
    ctx: CanvasRenderingContext2D,
    s: number,
    state: 'walk' | 'windup' | 'charge' | 'attack' | 'exhausted' | 'slam' | 'jump' | 'dead',
    frame: number,
    isRage: boolean = false
  ) {
    const cx = s / 2;
    const cy = s * 0.58;

    ctx.save();

    if (state === 'dead') {
      // Massive pool of dark blood
      ctx.fillStyle = 'rgba(120, 8, 8, 0.9)';
      ctx.beginPath();
      ctx.ellipse(cx, s - 30, 95, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slumped muscular giant
      ctx.fillStyle = isRage ? '#400909' : '#26221f';
      ctx.beginPath();
      ctx.ellipse(cx, s - 50, 72, 36, frame === 0 ? 0.15 : -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isRage ? '#590e0e' : '#453e37';
      ctx.beginPath();
      ctx.ellipse(cx - 15, s - 60, 50, 26, 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Defeated head resting on blood
      this.drawUncannyFace(ctx, cx + 45, s - 50, 0.95, 1.2, false, false, '#222', true, '#400', isRage);

      ctx.restore();
      return;
    }

    // Heavy breathing animation cycle (chest expansion)
    const breath = state === 'exhausted' ? Math.sin(frame * Math.PI) * 7 : state === 'slam' ? 8 : Math.sin(frame * 1.5) * 3;
    const bob = state === 'walk' ? Math.sin(frame * Math.PI) * 6 : state === 'slam' ? 18 : state === 'jump' ? -18 : 0;
    const isEnragedState = isRage || state === 'windup' || state === 'charge' || state === 'attack' || state === 'slam' || state === 'jump';

    // Aura of rage for boss during windup and charge or when enraged
    if (isEnragedState) {
      const auraGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 115);
      auraGrad.addColorStop(0, isRage ? 'rgba(230, 20, 20, 0.35)' : 'rgba(180, 20, 20, 0.25)');
      auraGrad.addColorStop(0.7, isRage ? 'rgba(160, 10, 10, 0.18)' : 'rgba(120, 10, 10, 0.12)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 115, 0, Math.PI * 2);
      ctx.fill();
    }

    // Muscular avian legs and thighs
    const legOffset = state === 'walk' ? (frame === 1 ? 16 : -16) : 0;
    const thighW = 20;

    // Muscular left leg
    ctx.fillStyle = isRage ? '#781414' : '#5c4832';
    ctx.beginPath();
    ctx.ellipse(cx - 32, cy + 50 + bob, thighW, 36, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRage ? '#c23030' : '#d49b28';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy + 70 + bob);
    ctx.lineTo(cx - 40 - legOffset, s - 18);
    ctx.lineTo(cx - 56 - legOffset, s - 10);
    ctx.stroke();

    // Left combat spur
    ctx.strokeStyle = isRage ? '#ff9999' : '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 40 - legOffset, s - 28);
    ctx.lineTo(cx - 24 - legOffset, s - 32);
    ctx.stroke();

    // Muscular right leg
    ctx.fillStyle = isRage ? '#781414' : '#5c4832';
    ctx.beginPath();
    ctx.ellipse(cx + 32, cy + 50 + bob, thighW, 36, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRage ? '#c23030' : '#d49b28';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx + 32, cy + 70 + bob);
    ctx.lineTo(cx + 40 + legOffset, s - 18);
    ctx.lineTo(cx + 56 + legOffset, s - 10);
    ctx.stroke();

    // Right combat spur
    ctx.strokeStyle = isRage ? '#ff9999' : '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 40 + legOffset, s - 28);
    ctx.lineTo(cx + 24 + legOffset, s - 32);
    ctx.stroke();

    // Massive Muscular Torso (Deep cut chest, huge lats, ripped six-pack)
    const torsoW = 60 + breath;
    const torsoH = 58;
    const torsoY = cy + bob - 10;

    // Muscular skin (Red crimson when enraged, natural feather-fringed skin when calm)
    ctx.fillStyle = isRage ? '#520e0e' : '#2f2824';
    ctx.beginPath();
    ctx.ellipse(cx, torsoY, torsoW, torsoH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Giant chiseled pectoral plates
    const pecGrad = ctx.createLinearGradient(cx - 45, torsoY - 25, cx + 45, torsoY + 15);
    if (isRage) {
      pecGrad.addColorStop(0, '#a81d1d');
      pecGrad.addColorStop(0.5, '#751212');
      pecGrad.addColorStop(1, '#450909');
    } else {
      pecGrad.addColorStop(0, '#52453b');
      pecGrad.addColorStop(0.5, '#3a3028');
      pecGrad.addColorStop(1, '#241e19');
    }
    ctx.fillStyle = pecGrad;

    // Left Pec
    ctx.beginPath();
    ctx.ellipse(cx - 24, torsoY - 14, 25 + breath * 0.5, 20 + breath * 0.4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRage ? '#3d0707' : '#181411';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Right Pec
    ctx.beginPath();
    ctx.ellipse(cx + 24, torsoY - 14, 25 + breath * 0.5, 20 + breath * 0.4, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRage ? '#3d0707' : '#181411';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Chiseled Six-Pack Abdominal Muscles
    ctx.fillStyle = isRage ? '#781414' : '#3f352c';
    const absY = torsoY + 12;
    const absRows = 3;
    for (let r = 0; r < absRows; r++) {
      const ay = absY + r * 13;
      const aw = 14 - r * 1.5;
      const ah = 6.5;

      // Left ab block
      ctx.beginPath();
      ctx.roundRect(cx - aw - 2, ay, aw, ah, 3);
      ctx.fill();
      ctx.stroke();

      // Right ab block
      ctx.beginPath();
      ctx.roundRect(cx + 2, ay, aw, ah, 3);
      ctx.fill();
      ctx.stroke();
    }

    // Glowing veins pulsing across the muscular body
    if (isEnragedState) {
      ctx.strokeStyle = isRage ? '#ff2626' : '#aa1111';
      ctx.lineWidth = isRage ? 2.2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - 40, torsoY - 18);
      ctx.lineTo(cx - 20, torsoY - 5);
      ctx.lineTo(cx - 30, torsoY + 14);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 40, torsoY - 18);
      ctx.lineTo(cx + 20, torsoY - 5);
      ctx.lineTo(cx + 30, torsoY + 14);
      ctx.stroke();
    }

    // Huge Muscular Arms / Wings ending in Lethal Black Talons
    const armAngle = state === 'windup' ? 0.6 : state === 'charge' ? 0.9 : state === 'attack' ? 1.2 : state === 'slam' ? 0.45 : state === 'jump' ? 1.35 : 0.2;

    // Left Arm (Biceps, Forearm, Talons)
    ctx.save();
    ctx.translate(cx - torsoW * 0.75, torsoY - 12);
    ctx.rotate(armAngle);
    // Bicep
    ctx.fillStyle = isRage ? '#821616' : '#4a3d33';
    ctx.beginPath();
    ctx.ellipse(0, 16, 16, 26, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRage ? '#3d0707' : '#1a1511';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Forearm
    ctx.beginPath();
    ctx.ellipse(0, 48, 14, 24, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Razor Talons
    ctx.fillStyle = isRage ? '#2e0505' : '#0f0c0a';
    for (let cIdx = -8; cIdx <= 8; cIdx += 8) {
      ctx.beginPath();
      ctx.moveTo(cIdx, 66);
      ctx.lineTo(cIdx - 4, 82);
      ctx.lineTo(cIdx + 3, 76);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Right Arm (Biceps, Forearm, Talons)
    ctx.save();
    ctx.translate(cx + torsoW * 0.75, torsoY - 12);
    ctx.rotate(-armAngle);
    // Bicep
    ctx.fillStyle = isRage ? '#821616' : '#4a3d33';
    ctx.beginPath();
    ctx.ellipse(0, 16, 16, 26, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRage ? '#3d0707' : '#1a1511';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Forearm
    ctx.beginPath();
    ctx.ellipse(0, 48, 14, 24, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Razor Talons
    ctx.fillStyle = isRage ? '#2e0505' : '#0f0c0a';
    for (let cIdx = -8; cIdx <= 8; cIdx += 8) {
      ctx.beginPath();
      ctx.moveTo(cIdx, 66);
      ctx.lineTo(cIdx + 4, 82);
      ctx.lineTo(cIdx - 3, 76);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Muscular Trapezius and Thick Sinewy Neck
    const neckBaseY = torsoY - 36;
    ctx.fillStyle = isRage ? '#6e1111' : '#45382e';
    ctx.beginPath();
    ctx.moveTo(cx - 28, torsoY - 20);
    ctx.lineTo(cx - 16, neckBaseY);
    ctx.lineTo(cx + 16, neckBaseY);
    ctx.lineTo(cx + 28, torsoY - 20);
    ctx.closePath();
    ctx.fill();

    // The Crown: That EXACT Horrifying Uncanny Tilted Smiling Head!
    const headScale = 1.32; // Colossal, menacing scale atop the muscular body
    const headAngle = state === 'windup' ? 0.25 : state === 'charge' ? 0.1 : state === 'slam' ? 0.18 : state === 'jump' ? 0.05 : 0.44; // tilted menacingly
    const headY = neckBaseY - 12;

    this.drawUncannyFace(
      ctx,
      cx,
      headY,
      headScale,
      headAngle,
      isEnragedState,
      state === 'attack' || state === 'charge',
      '#ff0022', // Intense fiery crimson glowing eyes
      true, // Majestic dark crimson rooster comb
      isRage ? '#e01616' : '#990f0f',
      isRage
    );

    ctx.restore();
  }

  // --- Pickups (Ammo & Almond Water) ---

  private createPickupSprites() {
    const s = 64;

    // 1. Ammo Box
    const cAmmo = document.createElement('canvas');
    cAmmo.width = s;
    cAmmo.height = s;
    const ctxA = cAmmo.getContext('2d')!;

    // Red Shotgun Shell Box
    ctxA.fillStyle = '#c52828';
    ctxA.fillRect(12, 22, 40, 32);
    ctxA.fillStyle = '#9b1b1b';
    ctxA.fillRect(12, 48, 40, 6);

    // Box label
    ctxA.fillStyle = '#e5a50a';
    ctxA.fillRect(16, 26, 32, 16);
    ctxA.fillStyle = '#111';
    ctxA.font = 'bold 7px monospace';
    ctxA.textAlign = 'center';
    ctxA.fillText('12 GAUGE', 32, 37);

    // Shells peeking from top
    ctxA.fillStyle = '#d43030';
    ctxA.fillRect(18, 14, 8, 10);
    ctxA.fillRect(28, 12, 8, 12);
    ctxA.fillRect(38, 15, 8, 9);
    ctxA.fillStyle = '#f0c030';
    ctxA.fillRect(18, 12, 8, 3);
    ctxA.fillRect(28, 10, 8, 3);
    ctxA.fillRect(38, 13, 8, 3);
    this.ammoPickup = cAmmo;

    // 2. Health (Almond Water Canister)
    const cHealth = document.createElement('canvas');
    cHealth.width = s;
    cHealth.height = s;
    const ctxH = cHealth.getContext('2d')!;

    // Vintage silver aluminum can with green backrooms water label
    ctxH.fillStyle = '#b0b8bc';
    ctxH.fillRect(18, 14, 28, 42);
    ctxH.fillStyle = '#788288';
    ctxH.fillRect(18, 52, 28, 4);

    // Can cap & rim
    ctxH.fillStyle = '#d8e0e5';
    ctxH.fillRect(22, 10, 20, 5);

    // Glowing green-yellow almond water label
    ctxH.fillStyle = '#a8e635';
    ctxH.fillRect(18, 22, 28, 24);
    ctxH.fillStyle = '#163806';
    ctxH.font = 'bold 6px monospace';
    ctxH.textAlign = 'center';
    ctxH.fillText('ALMOND', 32, 32);
    ctxH.fillText('WATER', 32, 40);

    // Medical cross symbol
    ctxH.fillStyle = '#ff2222';
    ctxH.fillRect(30, 16, 4, 10);
    ctxH.fillRect(27, 19, 10, 4);
    this.healthPickup = cHealth;

    // 3. High-Explosive Bomb Pickup
    this.bombPickup = this.createBombPickupSprite();
  }

  private createBombPickupSprite(): HTMLCanvasElement {
    const s = 64;
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d')!;
    const cx = s / 2;
    const cy = s / 2 + 4;

    // Glowing warm orange hazard aura
    const aura = ctx.createRadialGradient(cx, cy, 6, cx, cy, 26);
    aura.addColorStop(0, 'rgba(255, 120, 0, 0.4)');
    aura.addColorStop(1, 'rgba(255, 40, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();

    // Heavy iron sphere body
    const bodyGrad = ctx.createRadialGradient(cx - 5, cy - 5, 3, cx, cy, 18);
    bodyGrad.addColorStop(0, '#555b63');
    bodyGrad.addColorStop(0.5, '#292d33');
    bodyGrad.addColorStop(1, '#0e1013');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Yellow & Black hazard warning band
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 16, cy - 4, 32, 8);
    ctx.clip();
    for (let x = cx - 20; x < cx + 24; x += 8) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, cy - 4, 4, 8);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x + 4, cy - 4, 4, 8);
    }
    ctx.restore();

    // Brass fuse neck
    ctx.fillStyle = '#b47820';
    ctx.fillRect(cx - 4, cy - 22, 8, 8);
    ctx.fillStyle = '#d49b38';
    ctx.fillRect(cx - 3, cy - 21, 6, 2);

    // Twisted rope fuse
    ctx.strokeStyle = '#c2a675';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22);
    ctx.quadraticCurveTo(cx - 6, cy - 28, cx + 2, cy - 30);
    ctx.stroke();

    // Burning glowing spark at fuse tip
    const spark = ctx.createRadialGradient(cx + 2, cy - 30, 1, cx + 2, cy - 30, 7);
    spark.addColorStop(0, '#ffffff');
    spark.addColorStop(0.3, '#ffdd33');
    spark.addColorStop(0.7, '#ff3300');
    spark.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = spark;
    ctx.beginPath();
    ctx.arc(cx + 2, cy - 30, 7, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }
}

export const textureCache = new TextureCache();
