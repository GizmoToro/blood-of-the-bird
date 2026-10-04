import React from 'react';
import { Play, Settings, RotateCcw, Home, Layers } from 'lucide-react';
import { soundManager } from '../game/audio';

interface PauseMenuProps {
  onResume: () => void;
  onOpenSettings: () => void;
  onRestartLevel: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onOpenSettings,
  onRestartLevel,
  onLevelSelect,
  onMainMenu,
}) => {
  const handleClick = (fn: () => void) => {
    soundManager.playButtonClick();
    fn();
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 select-none font-tech">
      <div className="crt-overlay absolute inset-0 pointer-events-none" />
      <div className="vignette absolute inset-0 pointer-events-none" />

      <div className="relative z-20 w-full max-w-sm bg-stone-950 border border-amber-600/50 rounded-lg p-6 text-center shadow-2xl">
        <h2 className="text-4xl font-creep tracking-widest text-amber-400 mb-1">
          PAUSA
        </h2>
        <p className="text-xs font-mono text-stone-400 mb-6">
          JUEGO EN SUSPENSO
        </p>

        <div className="flex flex-col gap-3 font-tech">
          {/* CONTINUAR */}
          <button
            id="btn-pause-resume"
            onClick={() => handleClick(onResume)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded shadow transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>CONTINUAR</span>
          </button>

          {/* SELECCIONAR NIVEL */}
          <button
            id="btn-pause-levelselect"
            onClick={() => handleClick(onLevelSelect)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-2.5 py-3 px-4 bg-stone-900 hover:bg-stone-800 border border-amber-700/60 text-amber-300 font-semibold text-sm rounded transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>CAMBIAR DE NIVEL</span>
          </button>

          {/* CONFIGURACIÓN */}
          <button
            id="btn-pause-settings"
            onClick={() => handleClick(onOpenSettings)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-2.5 py-3 px-4 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 font-semibold text-sm rounded transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>CONFIGURACIÓN</span>
          </button>

          {/* REINICIAR NIVEL */}
          <button
            id="btn-pause-restart"
            onClick={() => handleClick(onRestartLevel)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-2.5 py-3 px-4 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 font-semibold text-sm rounded transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR NIVEL</span>
          </button>

          {/* MENÚ PRINCIPAL */}
          <button
            id="btn-pause-mainmenu"
            onClick={() => handleClick(onMainMenu)}
            onMouseEnter={() => soundManager.playButtonHover()}
            className="flex items-center justify-center gap-2.5 py-3 px-4 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 text-red-300 font-semibold text-sm rounded transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
