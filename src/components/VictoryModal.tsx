import React from 'react';
import { GameStats, Player } from '../types';
import { Trophy, Clock, Skull, ShieldAlert, Disc, ArrowRight, RotateCcw, Layers, Crown, Flame } from 'lucide-react';
import { soundManager } from '../game/audio';
import { ALL_LEVELS } from '../game/map';

interface VictoryModalProps {
  currentLevelId: number;
  stats: GameStats;
  player: Player;
  onNextLevel: () => void;
  onRestartLevel: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  currentLevelId,
  stats,
  player,
  onNextLevel,
  onRestartLevel,
  onLevelSelect,
  onMainMenu,
}) => {
  const handleClick = (action: () => void) => {
    soundManager.playButtonClick();
    action();
  };

  const minutes = Math.floor(stats.timeElapsed / 60);
  const seconds = Math.floor(stats.timeElapsed % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const totalLevels = ALL_LEVELS.length;
  const hasNextLevel = currentLevelId < totalLevels;
  const isFinalBossLevel = currentLevelId === totalLevels;

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none font-tech animate-fade-in">
      <div className="crt-overlay absolute inset-0 pointer-events-none" />
      <div className="vignette absolute inset-0 pointer-events-none" />

      <div
        className={`relative z-20 w-full max-w-lg bg-stone-950 border-2 rounded-lg p-6 sm:p-8 text-center ${
          isFinalBossLevel
            ? 'border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.4)]'
            : 'border-emerald-600/80 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
        }`}
      >
        {isFinalBossLevel ? (
          <div className="w-20 h-20 bg-red-950 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.6)]">
            <Crown className="w-10 h-10 text-red-400" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
        )}

        {isFinalBossLevel ? (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/90 border border-red-500/70 text-red-400 font-bold text-xs uppercase tracking-widest mb-2 animate-pulse">
              <Flame className="w-4 h-4 text-red-500" />
              <span>GALLARDO HA CAÍDO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-creep tracking-widest text-red-500 mb-1">
              HAS SOBREVIVIDO
            </h2>
            <h3 className="text-xl sm:text-2xl font-creep tracking-wider text-amber-300 mb-2">
              BLOOD OF THE BIRD
            </h3>
            <p className="text-xs font-mono text-stone-300">
              Has destruido al titán emplumado en su propio coliseo. Los {totalLevels} pisos de The Backrooms han sido purgados. ¡Eres libre!
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-creep tracking-widest text-emerald-400 mb-1">
              ¡NIVEL {currentLevelId} COMPLETADO!
            </h2>
            <p className="text-xs font-mono text-stone-400">
              HAS ENCONTRADO LA SALIDA Y ESCAPADO HACIA EL PISO {currentLevelId + 1} DE {totalLevels}...
            </p>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="bg-black/60 border border-stone-800 rounded p-4 mb-6 space-y-3 font-mono text-xs text-left">
          <div className="flex justify-between items-center pb-2 border-b border-stone-900">
            <span className="flex items-center gap-2 text-stone-400">
              <Clock className="w-4 h-4 text-amber-400" />
              TIEMPO DE ESCAPE:
            </span>
            <span className="text-amber-300 font-bold text-sm">{timeFormatted}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-900">
            <span className="flex items-center gap-2 text-stone-400">
              <Skull className="w-4 h-4 text-red-400" />
              POLLOS ELIMINADOS:
            </span>
            <span className="text-amber-300 font-bold text-sm">{stats.chickensKilled}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-900">
            <span className="flex items-center gap-2 text-stone-400">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              DAÑO RECIBIDO:
            </span>
            <span className="text-red-400 font-bold text-sm">{Math.round(stats.damageTaken)} HP</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-stone-400">
              <Disc className="w-4 h-4 text-amber-400" />
              MUNICIÓN RESTANTE:
            </span>
            <span className="text-amber-300 font-bold text-sm">
              {player.ammo} / {player.ammoReserve}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              id="btn-victory-next"
              onClick={() => handleClick(onNextLevel)}
              onMouseEnter={() => soundManager.playButtonHover()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all cursor-pointer uppercase tracking-wider"
            >
              <span>PASAR AL NIVEL {currentLevelId + 1}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="btn-victory-finish"
              onClick={() => handleClick(onMainMenu)}
              onMouseEnter={() => soundManager.playButtonHover()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-base rounded shadow-[0_0_20px_rgba(220,38,38,0.7)] transition-all cursor-pointer uppercase tracking-wider"
            >
              <span>MENÚ PRINCIPAL — CRÉDITOS</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-victory-restart"
              onClick={() => handleClick(onRestartLevel)}
              onMouseEnter={() => soundManager.playButtonHover()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded border border-stone-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REINTENTAR</span>
            </button>

            <button
              id="btn-victory-levelselect"
              onClick={() => handleClick(onLevelSelect)}
              onMouseEnter={() => soundManager.playButtonHover()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold rounded border border-amber-700/60 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>NIVELES ({totalLevels})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
