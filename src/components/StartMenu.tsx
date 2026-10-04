import React from 'react';
import { Play, Settings, Keyboard, Info, Flame, Layers, Clapperboard } from 'lucide-react';
import { soundManager } from '../game/audio';

interface StartMenuProps {
  onPlay: () => void;
  onWatchIntro?: () => void;
  onOpenLevelSelect: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onOpenCredits: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  onPlay,
  onWatchIntro,
  onOpenLevelSelect,
  onOpenSettings,
  onOpenControls,
  onOpenCredits,
}) => {
  const handleButtonClick = (action: () => void) => {
    soundManager.init();
    soundManager.playButtonClick();
    action();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-black select-none">
      {/* Backrooms flickering atmospheric background */}
      <div className="absolute inset-0 bg-[#3a3214] opacity-80">
        {/* Repeating yellow wallpaper pattern effect */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #bfa64f 0, #bfa64f 30px, #a88f3a 30px, #a88f3a 60px)`,
          }}
        />

        {/* Ambient perspective floor & ceiling shadow */}
        <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-black via-black/80 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black via-black/90 to-transparent" />

        {/* Flickering fluorescent tube light at ceiling */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-3 bg-amber-100/90 rounded-full shadow-[0_0_80px_25px_rgba(251,191,36,0.45)] animate-flicker" />

        {/* Spooky silhouette of chicken at end of corridor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-35 filter blur-[1px] pointer-events-none scale-125">
          <div className="relative w-28 h-32 flex items-center justify-center">
            {/* Glowing demonic red eyes */}
            <div className="absolute top-8 left-10 w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_12px_#ff0000] animate-ping" />
            <div className="absolute top-8 right-10 w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_12px_#ff0000] animate-ping" />
            <Flame className="w-24 h-24 text-stone-900" />
          </div>
        </div>
      </div>

      {/* CRT Scanline & Dark Vignette */}
      <div className="crt-overlay absolute inset-0 z-10" />
      <div className="vignette absolute inset-0 z-10" />

      {/* Title Header */}
      <div className="relative z-20 text-center mt-6 sm:mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded border border-amber-500/40 bg-black/60 text-amber-400 text-xs font-mono tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          FPS DE TERROR RETRO 2.5D
        </div>
        <h1
          id="title-main"
          className="text-4xl sm:text-6xl md:text-7xl font-creep tracking-wider text-red-500 drop-shadow-[0_4px_24px_rgba(180,0,0,0.85)] text-balance"
        >
          BLOOD OF THE BIRD
        </h1>
        <p className="mt-3 text-lg sm:text-xl font-tech text-amber-200/90 italic tracking-widest animate-pulse">
          "The Backrooms were never empty."
        </p>
      </div>

      {/* Main Menu Buttons */}
      <div className="relative z-20 flex flex-col gap-3 w-full max-w-xs sm:max-w-sm mb-6 sm:mb-8 font-tech">
        {/* JUGAR */}
        <button
          id="btn-play"
          onClick={() => handleButtonClick(onPlay)}
          onMouseEnter={() => soundManager.playButtonHover()}
          className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 active:scale-98 text-black font-bold text-xl tracking-widest uppercase rounded shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer border-2 border-amber-300"
        >
          <Play className="w-6 h-6 fill-current transition-transform group-hover:scale-110" />
          <span>JUGAR</span>
        </button>

        {/* SELECCIONAR NIVEL */}
        <button
          id="btn-level-select"
          onClick={() => handleButtonClick(onOpenLevelSelect)}
          onMouseEnter={() => soundManager.playButtonHover()}
          className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-stone-900/90 hover:bg-stone-800 active:scale-98 text-amber-300 hover:text-amber-100 font-semibold text-base tracking-wider uppercase rounded border border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-xs"
        >
          <Layers className="w-5 h-5 text-amber-400" />
          <span>SELECCIONAR NIVEL (18)</span>
        </button>

        {/* VER INTRO CINEMÁTICA */}
        {onWatchIntro && (
          <button
            id="btn-watch-intro"
            onClick={() => handleButtonClick(onWatchIntro)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-3 w-full py-2.5 px-6 bg-stone-950/80 hover:bg-stone-900 active:scale-98 text-red-400 hover:text-red-300 font-semibold text-sm tracking-wider uppercase rounded border border-red-900/60 hover:border-red-500 transition-all cursor-pointer backdrop-blur-xs"
          >
            <Clapperboard className="w-4 h-4 text-red-400" />
            <span>CINEMÁTICA INTRODUCCIÓN</span>
          </button>
        )}

        {/* CONFIGURACIÓN */}
        <button
          id="btn-settings"
          onClick={() => handleButtonClick(onOpenSettings)}
          onMouseEnter={() => soundManager.playButtonHover()}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-6 bg-black/80 hover:bg-stone-900 active:scale-98 text-stone-300 hover:text-amber-100 font-semibold text-base tracking-wider uppercase rounded border border-stone-700/60 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-xs"
        >
          <Settings className="w-5 h-5" />
          <span>CONFIGURACIÓN</span>
        </button>

        {/* CONTROLES */}
        <button
          id="btn-controls"
          onClick={() => handleButtonClick(onOpenControls)}
          onMouseEnter={() => soundManager.playButtonHover()}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-6 bg-black/80 hover:bg-stone-900 active:scale-98 text-stone-300 hover:text-amber-100 font-semibold text-base tracking-wider uppercase rounded border border-stone-700/60 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-xs"
        >
          <Keyboard className="w-5 h-5" />
          <span>CONTROLES</span>
        </button>

        {/* CRÉDITOS */}
        <button
          id="btn-credits"
          onClick={() => handleButtonClick(onOpenCredits)}
          onMouseEnter={() => soundManager.playButtonHover()}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-6 bg-black/80 hover:bg-stone-900 active:scale-98 text-stone-300 hover:text-amber-100 font-semibold text-base tracking-wider uppercase rounded border border-stone-700/60 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-xs"
        >
          <Info className="w-5 h-5" />
          <span>CRÉDITOS</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="relative z-20 text-center text-xs text-stone-500 font-tech">
        <span>MOTOR DE RAYCASTING 2.5D • PERSPECTIVA EN PRIMERA PERSONA</span>
      </div>
    </div>
  );
};
