import React from 'react';
import { Play, ArrowLeft, Skull, ShieldAlert, Zap, Compass, Crosshair } from 'lucide-react';
import { ALL_LEVELS } from '../game/map';
import { soundManager } from '../game/audio';
import { LevelTheme } from '../types';

interface LevelSelectMenuProps {
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const THEME_LABELS: Record<LevelTheme, { label: string; color: string; border: string }> = {
  yellow: { label: 'Mono-Amarillo Clásico', color: 'text-amber-400 bg-amber-950/60', border: 'border-amber-700/50' },
  old: { label: 'Muros Agrietados', color: 'text-stone-300 bg-stone-900/80', border: 'border-stone-600/50' },
  red: { label: 'Niebla de Emergencia', color: 'text-rose-400 bg-rose-950/60', border: 'border-rose-700/50' },
  flooded: { label: 'Pisos Inundados', color: 'text-teal-400 bg-teal-950/60', border: 'border-teal-700/50' },
  office: { label: 'Complejo de Oficinas', color: 'text-slate-300 bg-slate-900/80', border: 'border-slate-600/50' },
  blue: { label: 'Sala Azul Profundo', color: 'text-cyan-400 bg-cyan-950/60', border: 'border-cyan-700/50' },
  industrial: { label: 'Fábrica Industrial', color: 'text-amber-500 bg-stone-900/90', border: 'border-amber-600/50' },
  nest: { label: 'Nido Sangriento', color: 'text-red-500 bg-red-950/80', border: 'border-red-600/70' },
  arena: { label: 'Arena de Gallardo', color: 'text-red-400 bg-red-950/90 font-bold animate-pulse', border: 'border-red-600/80' },
};

const DIFFICULTY_MAP: Record<number, { text: string; color: string }> = {
  1: { text: 'Iniciación', color: 'text-emerald-400' },
  2: { text: 'Moderado', color: 'text-amber-400' },
  3: { text: 'Difícil', color: 'text-orange-400' },
  4: { text: 'Avanzado', color: 'text-orange-500' },
  5: { text: 'Peligro Alto', color: 'text-rose-400' },
  6: { text: 'Intenso', color: 'text-rose-500' },
  7: { text: 'Pesadilla', color: 'text-red-400' },
  8: { text: 'Nido Brutal', color: 'text-red-400' },
  9: { text: 'Búnker Blindado', color: 'text-orange-500' },
  10: { text: 'Miasma Tóxico', color: 'text-emerald-500' },
  11: { text: 'Terror Clínico', color: 'text-rose-400' },
  12: { text: 'Ceguera Total', color: 'text-purple-400' },
  13: { text: 'Purgatorio Ígneo', color: 'text-orange-600' },
  14: { text: 'Abismo Helado', color: 'text-cyan-400' },
  15: { text: 'Profanación', color: 'text-red-400' },
  16: { text: 'Horda Biológica', color: 'text-emerald-400' },
  17: { text: 'Umbral Final', color: 'text-rose-600 font-bold' },
  18: { text: '¡JEFE FINAL: GALLARDO!', color: 'text-red-500 font-extrabold animate-pulse' },
};

export const LevelSelectMenu: React.FC<LevelSelectMenuProps> = ({
  currentLevelId,
  onSelectLevel,
  onBack,
}) => {
  const handleSelect = (id: number) => {
    soundManager.init();
    soundManager.playButtonClick();
    soundManager.setLevel(id);
    onSelectLevel(id);
  };

  const handleBack = () => {
    soundManager.init();
    soundManager.playButtonClick();
    onBack();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 bg-black select-none overflow-hidden font-tech">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[#1a1708] opacity-90" />
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #bfa64f 0, #bfa64f 30px, #a88f3a 30px, #a88f3a 60px)`,
        }}
      />
      <div className="crt-overlay absolute inset-0 pointer-events-none z-10" />
      <div className="vignette absolute inset-0 pointer-events-none z-10" />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-5xl mb-3">
        <button
          id="btn-levelselect-back"
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-stone-900 text-amber-400 border border-amber-500/40 rounded transition-all cursor-pointer text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-amber-500 text-xs tracking-widest uppercase">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>EXPEDICIONES DISPONIBLES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-creep text-amber-300 tracking-wider">
            SELECCIÓN DE NIVEL ({ALL_LEVELS.length} PISOS)
          </h2>
        </div>

        <div className="w-20 hidden sm:block" />
      </div>

      {/* Levels Grid / Scrollable List */}
      <div className="relative z-20 w-full max-w-5xl flex-1 overflow-y-auto pr-1 py-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-4">
          {ALL_LEVELS.map((lvl) => {
            const isSelected = lvl.id === currentLevelId;
            const themeConfig = THEME_LABELS[lvl.theme] || THEME_LABELS.yellow;
            const diff = DIFFICULTY_MAP[lvl.id] || { text: 'Normal', color: 'text-amber-400' };

            const chickenCount = lvl.chickenSpawns.length;
            const hasBoss = lvl.chickenSpawns.some(c => c.type === 'boss');
            const redChickens = lvl.chickenSpawns.filter(c => c.type === 'red').length;
            const blackChickens = lvl.chickenSpawns.filter(c => c.type === 'black' || c.type === 'tank').length;

            return (
              <div
                key={lvl.id}
                id={`level-card-${lvl.id}`}
                className={`relative flex flex-col justify-between p-4 rounded border transition-all duration-200 ${
                  hasBoss
                    ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_18px_rgba(239,68,68,0.25)]'
                    : isSelected
                    ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                    : 'bg-black/75 hover:bg-stone-900/80 border-stone-700/60 hover:border-amber-600/60'
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${hasBoss ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-black'}`}>
                      {hasBoss ? 'NIVEL FINAL' : `NIVEL ${lvl.id}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${themeConfig.border} ${themeConfig.color}`}>
                      {themeConfig.label}
                    </span>
                  </div>

                  <span className={`text-xs font-semibold ${diff.color}`}>
                    {diff.text}
                  </span>
                </div>

                {/* Level Title & Subtitle */}
                <div className="mb-2">
                  <h3 className={`text-lg sm:text-xl font-bold tracking-wide ${hasBoss ? 'text-red-400 font-creep tracking-widest' : 'text-amber-200'}`}>
                    {lvl.name}
                  </h3>
                  <p className="text-xs text-stone-400 italic">
                    "{lvl.subtitle}"
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-300 mb-3 line-clamp-2">
                  {lvl.description}
                </p>

                {/* Stats & Chicken preview */}
                <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800 pt-2 mb-3">
                  <div className="flex items-center gap-3">
                    {hasBoss ? (
                      <span className="flex items-center gap-1.5 text-red-400 font-bold tracking-wider animate-pulse">
                        <Skull className="w-4 h-4 text-red-500" />
                        <span>¡GALLARDO (JEFE FINAL)!</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Skull className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-stone-200 font-mono">{chickenCount}</span> enemigos
                      </span>
                    )}
                    {redChickens > 0 && !hasBoss && (
                      <span className="flex items-center gap-1 text-red-400">
                        <Zap className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-mono">{redChickens}</span> cazadores
                      </span>
                    )}
                    {blackChickens > 0 && !hasBoss && (
                      <span className="flex items-center gap-1 text-purple-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-mono">{blackChickens}</span> pesados
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-stone-400">
                    Dimensiones {lvl.map[0].length}x{lvl.map.length}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  id={`btn-start-level-${lvl.id}`}
                  onClick={() => handleSelect(lvl.id)}
                  onMouseEnter={() => soundManager.playButtonHover()}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded font-bold text-sm tracking-wider uppercase transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'bg-stone-800 hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-600/30'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ENTRAR AL NIVEL {lvl.id}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-20 text-center text-xs text-amber-400/60 pt-2 border-t border-amber-900/30 w-full max-w-5xl">
        <span>Cada piso cuenta con arquitectura única, enemigos agresivos y paletas de niebla diferenciadas.</span>
      </div>
    </div>
  );
};
