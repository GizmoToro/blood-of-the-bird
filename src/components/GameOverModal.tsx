import React from 'react';
import { Skull, RotateCcw, Home, Layers } from 'lucide-react';
import { soundManager } from '../game/audio';

interface GameOverModalProps {
  onRetry: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onLevelSelect, onMainMenu }) => {
  const handleClick = (fn: () => void) => {
    soundManager.playButtonClick();
    fn();
  };

  return (
    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none font-tech animate-fade-in">
      <div className="crt-overlay absolute inset-0 pointer-events-none" />
      <div className="vignette absolute inset-0 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md bg-black/95 border-2 border-red-700/80 rounded-lg p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(220,38,38,0.4)]">
        <div className="w-16 h-16 bg-red-950 border border-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Skull className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-4xl sm:text-5xl font-creep tracking-widest text-red-600 mb-2">
          HAS MUERTO
        </h2>
        <p className="text-base sm:text-lg font-tech text-amber-200/90 tracking-wider mb-6 italic">
          "LAS GALLINAS TE ENCONTRARON"
        </p>

        <div className="flex flex-col gap-3 font-tech">
          <button
            id="btn-gameover-retry"
            onClick={() => handleClick(onRetry)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-red-700 hover:bg-red-600 text-white font-bold text-base rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>REINTENTAR NIVEL</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-gameover-levelselect"
              onClick={() => handleClick(onLevelSelect)}
              onMouseEnter={() => soundManager.playButtonHover()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 border border-amber-700/60 text-amber-300 font-semibold text-xs rounded transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>NIVELES</span>
            </button>

            <button
              id="btn-gameover-mainmenu"
              onClick={() => handleClick(onMainMenu)}
              onMouseEnter={() => soundManager.playButtonHover()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-semibold text-xs rounded transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>MENÚ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
