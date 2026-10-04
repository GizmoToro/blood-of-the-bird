import React from 'react';
import { Player, GameStats } from '../types';
import { Crosshair, Shield, Disc, Skull, Pause, Zap, Flashlight, Flame, Terminal } from 'lucide-react';

export interface DebugData {
  playerX: number;
  playerY: number;
  speed: number;
  inputs: {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    shift: boolean;
  };
  collision: boolean;
  paused: boolean;
  gameState: string;
}

interface HUDProps {
  player: Player;
  stats: GameStats;
  totalChickens: number;
  hitMarkerTimer: number;
  levelId?: number;
  levelName?: string;
  isPointerLocked?: boolean;
  fps?: number;
  showFPS?: boolean;
  showDebugOverlay?: boolean;
  debugData?: DebugData;
  onToggleDebug?: () => void;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossPhase?: 1 | 2 | 3 | 4;
  bossDist?: number;
  bossSpawned?: boolean;
  bossRage?: boolean;
  onPauseClick: () => void;
  onToggleFlashlight?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  stats,
  totalChickens,
  hitMarkerTimer,
  levelId = 1,
  levelName = 'El Lobby Amarillo',
  isPointerLocked = true,
  fps = 60,
  showFPS = false,
  showDebugOverlay = false,
  debugData,
  onToggleDebug,
  bossHealth,
  bossMaxHealth = 900,
  bossPhase = 1,
  bossDist,
  bossSpawned = false,
  bossRage = false,
  onPauseClick,
  onToggleFlashlight,
}) => {
  const hpPercent = Math.max(0, Math.min(100, player.health));
  const staminaPercent = Math.max(0, Math.min(100, (player.stamina / (player.maxStamina || 100)) * 100));
  const isLowHp = player.health <= 25;
  const isLowStamina = player.stamina <= 20;
  const isBossActive = bossHealth !== undefined && bossHealth > 0;
  const bossHpPercent = isBossActive ? Math.max(0, Math.min(100, (bossHealth / bossMaxHealth) * 100)) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level & Objective */}
          <div className="bg-black/65 border border-amber-900/50 px-3 py-1.5 rounded text-xs tracking-wider text-amber-200/90 font-mono backdrop-blur-xs flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-bold text-amber-400">NIVEL {levelId}</span>
            </div>
            <span className="text-stone-400">|</span>
            <span className="text-stone-300 font-semibold uppercase">{levelName}</span>
          </div>

          {/* Flashlight Indicator */}
          <button
            onClick={onToggleFlashlight}
            className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono backdrop-blur-xs transition-colors cursor-pointer ${
              player.flashlight
                ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-black/60 border-stone-800 text-stone-500 hover:text-stone-300'
            }`}
            title="Alternar linterna [F]"
          >
            <Flashlight className={`w-3.5 h-3.5 ${player.flashlight ? 'text-amber-400' : 'text-stone-600'}`} />
            <span>LINTERNA [F]: {player.flashlight ? 'ON' : 'OFF'}</span>
          </button>

          {/* Debug Overlay Toggle Button */}
          <button
            id="btn-hud-debug"
            onClick={onToggleDebug}
            className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono backdrop-blur-xs transition-colors cursor-pointer ${
              showDebugOverlay
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-black/60 border-stone-800 text-stone-500 hover:text-stone-300'
            }`}
            title="Alternar panel de depuración [F3 o ~]"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>DEBUG [{showDebugOverlay ? 'ON' : 'OFF'}]</span>
          </button>

          {/* FPS Counter (ON / OFF) */}
          {showFPS && (
            <div
              id="hud-fps"
              className="bg-black/75 border border-stone-800 px-2.5 py-1.5 rounded text-xs font-mono tracking-wider backdrop-blur-xs flex items-center gap-1.5 shadow-md"
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  fps >= 50 ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : fps >= 30 ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                }`}
              />
              <span className="text-stone-400">FPS:</span>
              <span className={`font-bold ${fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-300' : 'text-red-400'}`}>
                {Math.round(fps)}
              </span>
            </div>
          )}
        </div>

        {/* Boss Health Bar (Centered Top when boss is active) */}
        {isBossActive && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[85%] max-w-[520px] pointer-events-none flex flex-col items-center">
            <div className="w-full bg-black/95 border-2 border-red-700 rounded p-2.5 shadow-[0_0_30px_rgba(220,38,38,0.6)] backdrop-blur-md">
              <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Skull className={`w-4 h-4 ${bossPhase >= 3 ? 'text-red-500 animate-bounce' : 'text-red-400'}`} />
                  <span className="font-black tracking-widest text-red-400 text-sm font-creep">GALLARDO</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    bossPhase === 4
                      ? 'bg-red-600 text-white font-extrabold animate-pulse border border-red-300 shadow-[0_0_10px_#dc2626]'
                      : bossPhase === 3
                      ? 'bg-red-900/90 text-red-200 border border-red-500 animate-pulse'
                      : bossPhase === 2
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'bg-stone-800 text-stone-300'
                  }`}>
                    {bossPhase === 4
                      ? 'FASE 4: AGONÍA FRENÉTICA'
                      : bossPhase === 3
                      ? 'FASE 3: GOLPE DE TIERRA & COMBOS'
                      : bossPhase === 2
                      ? 'FASE 2: SALTO SÍSMICO'
                      : 'FASE 1: ACECHO & EMBESTIDA'}
                  </span>
                  {bossRage && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold animate-ping">
                      ¡FURIA!
                    </span>
                  )}
                </div>
                <span className="text-red-300/90 font-bold tracking-wider">
                  {Math.max(0, Math.ceil(bossHealth))} / {bossMaxHealth}
                </span>
              </div>
              {/* Boss Bar Track */}
              <div className="w-full h-3.5 bg-stone-950 rounded-xs overflow-hidden border border-red-950">
                <div
                  className={`h-full transition-all duration-150 ${
                    bossPhase >= 3
                      ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_14px_#ef4444]'
                      : 'bg-gradient-to-r from-red-800 via-red-600 to-amber-600'
                  }`}
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Debug / Telemetry Overlay if showFPS is enabled */}
        {showFPS && bossSpawned && (
          <div className="absolute left-4 top-16 bg-black/85 border border-stone-800 px-2.5 py-1.5 rounded text-[11px] font-mono text-stone-300 space-y-0.5 pointer-events-none">
            <div className="text-amber-400 font-bold">TELEMETRÍA GALLARDO</div>
            <div>Boss Spawn: <span className="text-emerald-400">ACTIVO</span></div>
            <div>HP: <span className="text-red-400">{bossHealth !== undefined ? Math.ceil(bossHealth) : 'N/A'}</span></div>
            <div>Fase: <span className="text-amber-300">{bossPhase} / 4</span></div>
            <div>Dist: <span className="text-cyan-300">{bossDist !== undefined ? bossDist.toFixed(1) + 'm' : 'N/A'}</span></div>
            <div>Rage: <span className={bossRage ? 'text-red-400 font-bold' : 'text-stone-500'}>{bossRage ? 'ON' : 'OFF'}</span></div>
          </div>
        )}

        {/* Pause Button (Interactive) */}
        <button
          id="btn-hud-pause"
          onClick={onPauseClick}
          className="pointer-events-auto bg-black/70 hover:bg-amber-950/80 active:scale-95 border border-amber-700/60 text-amber-300 px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-mono transition-colors shadow-lg cursor-pointer"
          title="Pausa (ESC)"
        >
          <Pause className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PAUSA [ESC]</span>
        </button>
      </div>

      {/* Real-time Diagnostics Debug Overlay */}
      {showDebugOverlay && debugData && (
        <div
          id="debug-overlay"
          className="absolute left-4 top-16 z-30 bg-black/90 border-2 border-emerald-500/80 rounded p-3 text-xs font-mono text-emerald-400 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.35)] w-72 space-y-1.5 pointer-events-none select-none"
        >
          <div className="flex justify-between items-center border-b border-emerald-800/80 pb-1 font-bold text-emerald-300">
            <span>// DIAGNÓSTICO [F3]</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-600">EN VIVO</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[11px]">
            <div>
              <span className="text-stone-400">PLAYER X:</span>{' '}
              <span className="text-white font-bold">{debugData.playerX.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-stone-400">PLAYER Y:</span>{' '}
              <span className="text-white font-bold">{debugData.playerY.toFixed(3)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-400">GRID CELL:</span>{' '}
              <span className="text-amber-300 font-bold">
                [{Math.floor(debugData.playerX)}, {Math.floor(debugData.playerY)}]
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-400">SPEED:</span>{' '}
              <span className="text-cyan-300 font-bold">{debugData.speed.toFixed(2)} m/s</span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-400">INPUT:</span>{' '}
              <span className="inline-flex gap-1 font-bold">
                <span className={debugData.inputs.w ? 'text-amber-400 bg-amber-950/80 px-1 rounded' : 'text-stone-600'}>W</span>
                <span className={debugData.inputs.a ? 'text-amber-400 bg-amber-950/80 px-1 rounded' : 'text-stone-600'}>A</span>
                <span className={debugData.inputs.s ? 'text-amber-400 bg-amber-950/80 px-1 rounded' : 'text-stone-600'}>S</span>
                <span className={debugData.inputs.d ? 'text-amber-400 bg-amber-950/80 px-1 rounded' : 'text-stone-600'}>D</span>
                <span className={debugData.inputs.shift ? 'text-rose-400 bg-rose-950/80 px-1 rounded text-[10px]' : 'text-stone-600 text-[10px]'}>SHIFT</span>
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-400">COLLISION:</span>{' '}
              <span className={debugData.collision ? 'text-red-400 font-bold bg-red-950/80 px-1.5 py-0.5 rounded border border-red-700' : 'text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700'}>
                {debugData.collision ? 'CONTACT / BLOCKED' : 'FREE / WALKABLE'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-400">PAUSED:</span>{' '}
              <span className={debugData.paused ? 'text-amber-400 font-bold' : 'text-stone-400'}>
                {debugData.paused ? 'YES (PAUSED)' : 'NO (ACTIVE)'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-400">GAME STATE:</span>{' '}
              <span className="text-stone-200 font-bold">{debugData.gameState}</span>
            </div>
          </div>
        </div>
      )}

      {/* Click to lock mouse hint on desktop if not locked */}
      {!isPointerLocked && (
        <div className="self-center bg-black/80 border border-amber-500/80 text-amber-300 px-4 py-1.5 rounded text-xs font-mono tracking-wider animate-bounce shadow-[0_0_15px_rgba(245,158,11,0.4)] pointer-events-none">
          HAZ CLIC PARA FIJAR EL RATÓN Y APUNTAR
        </div>
      )}

      {/* Center Crosshair with Hit Marker */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          {/* Subtle retro dot & brackets */}
          <div className="w-1.5 h-1.5 bg-amber-400/80 rounded-full shadow-[0_0_4px_#f59e0b]" />
          <div className="absolute w-6 h-6 border-t border-b border-amber-400/40 rounded-full" />
          
          {/* Hit marker flash when shot connects */}
          {hitMarkerTimer > 0 && (
            <div className="absolute w-8 h-8 pointer-events-none animate-pulse">
              <div className="absolute inset-0 border-2 border-red-500 rotate-45 scale-90" />
            </div>
          )}
        </div>
      </div>

      {/* Reloading Banner */}
      {player.isReloading && (
        <div className="self-center mb-6 bg-black/80 border border-amber-500/70 text-amber-400 px-4 py-1 rounded text-sm font-mono tracking-widest animate-pulse">
          RECARGANDO ESCOPETA...
        </div>
      )}

      {/* Bottom Bar HUD */}
      <div className="flex justify-between items-end gap-3 flex-wrap sm:flex-nowrap">
        {/* Health & Stamina Cluster */}
        <div className="flex flex-col gap-1.5 min-w-[150px] sm:min-w-[180px]">
          {/* Health */}
          <div
            id="hud-health"
            className={`bg-black/75 border ${
              isLowHp ? 'border-red-600 bg-red-950/40 animate-pulse' : 'border-stone-800'
            } p-2.5 rounded backdrop-blur-xs`}
          >
            <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
              <span className="flex items-center gap-1">
                <Shield className={`w-3.5 h-3.5 ${isLowHp ? 'text-red-400' : 'text-emerald-400'}`} />
                VIDA
              </span>
              <span className={`text-base font-bold font-mono ${isLowHp ? 'text-red-400' : 'text-stone-100'}`}>
                {Math.ceil(player.health)}
              </span>
            </div>
            {/* Health Bar */}
            <div className="w-full h-2 bg-stone-900 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  isLowHp ? 'bg-red-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div
            id="hud-stamina"
            className="bg-black/75 border border-stone-800 px-2.5 py-1.5 rounded backdrop-blur-xs font-mono"
          >
            <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className={`w-3 h-3 ${player.isSprinting ? 'text-cyan-300 animate-pulse' : isLowStamina ? 'text-amber-500' : 'text-cyan-400'}`} />
                ESTAMINA (SHIFT)
              </span>
              <span className={`font-bold ${isLowStamina ? 'text-amber-400' : 'text-cyan-300'}`}>
                {Math.round(player.stamina)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-900 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  isLowStamina ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${staminaPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chickens Killed Stat & Controls hint */}
        <div className="hidden md:flex flex-col gap-1 items-center font-mono text-xs">
          <div
            id="hud-chickens"
            className="bg-black/75 border border-stone-800 px-3 py-1.5 rounded flex items-center gap-3 backdrop-blur-xs text-stone-300"
          >
            <Skull className="w-4 h-4 text-red-400" />
            <div>
              <span className="text-stone-500">GALLINAS: </span>
              <span className="text-amber-300 font-bold">{stats.chickensKilled}</span>
              <span className="text-stone-600"> / {totalChickens}</span>
            </div>
          </div>
          <div className="text-[10px] text-stone-400/80 bg-black/60 px-2 py-0.5 rounded border border-stone-900">
            WASD: Mover | Shift: Correr | Click Izq: Disparar | Click Der / G: Bomba | R: Recargar | F: Linterna
          </div>
        </div>

        {/* Weapons & Explosives */}
        <div className="flex items-center gap-2">
          {/* Bombs */}
          <div
            id="hud-bombs"
            className="bg-black/75 border border-orange-900/60 p-2 sm:p-2.5 rounded min-w-[95px] backdrop-blur-xs font-mono"
          >
            <div className="flex items-center justify-between text-[11px] text-orange-400/90 mb-0.5">
              <span className="flex items-center gap-1 font-bold">
                <Flame className="w-3 h-3 text-orange-500" />
                BOMBAS
              </span>
              <span className="text-[9px] text-stone-500">[CLK-DER/G]</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-black ${
                  (player.bombs ?? 0) === 0 ? 'text-stone-600' : 'text-orange-400'
                }`}
              >
                {player.bombs ?? 0}
              </span>
              <span className="text-stone-500 text-xs">/ {player.maxBombs ?? 4}</span>
            </div>
          </div>

          {/* Ammo */}
          <div
            id="hud-ammo"
            className="bg-black/75 border border-stone-800 p-2.5 sm:p-3 rounded min-w-[130px] sm:min-w-[150px] backdrop-blur-xs font-mono"
          >
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span className="flex items-center gap-1">
                <Disc className="w-3.5 h-3.5 text-amber-500" />
                MUNICIÓN
              </span>
              <span className="text-xs text-stone-500">12 GAUGE</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold ${
                  player.ammo === 0 ? 'text-red-500 animate-pulse' : 'text-amber-300'
                }`}
              >
                {player.ammo}
              </span>
              <span className="text-stone-500 text-sm">/ {player.ammoReserve}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
