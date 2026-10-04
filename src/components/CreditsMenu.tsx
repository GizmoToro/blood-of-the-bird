import React from 'react';
import { ArrowLeft, Sparkles, Terminal } from 'lucide-react';
import { soundManager } from '../game/audio';

interface CreditsMenuProps {
  onBack: () => void;
}

export const CreditsMenu: React.FC<CreditsMenuProps> = ({ onBack }) => {
  const handleBack = () => {
    soundManager.playButtonClick();
    onBack();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-black/95 text-stone-200 select-none overflow-y-auto z-30 font-tech">
      <div className="crt-overlay absolute inset-0 pointer-events-none" />
      <div className="vignette absolute inset-0 pointer-events-none" />

      <div className="relative z-20 w-full max-w-xl bg-stone-950/90 border border-amber-600/40 rounded-lg p-6 shadow-2xl backdrop-blur-md my-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <h2 className="text-3xl font-bold font-creep tracking-wider text-amber-400">
            CRÉDITOS
          </h2>
        </div>
        <p className="text-sm text-stone-400 mb-6 font-mono">
          BLOOD OF THE BIRD • THE BACKROOMS HORROR SURVIVAL
        </p>

        <div className="space-y-4 text-xs font-mono text-stone-300 border-t border-b border-stone-800 py-6 text-left">
          <div className="flex justify-between border-b border-stone-900 pb-2">
            <span className="text-stone-500">TÍTULO OFICIAL:</span>
            <span className="text-red-400 font-bold">BLOOD OF THE BIRD</span>
          </div>
          <div className="flex justify-between border-b border-stone-900 pb-2">
            <span className="text-stone-500">TAGLINE:</span>
            <span className="text-amber-300 italic">"The Backrooms were never empty."</span>
          </div>
          <div className="flex justify-between border-b border-stone-900 pb-2">
            <span className="text-stone-500">MOTOR GRÁFICO:</span>
            <span className="text-amber-300">Raycasting DDA 2.5D Vanilla (DOOM / Wolfenstein style)</span>
          </div>
          <div className="flex justify-between border-b border-stone-900 pb-2">
            <span className="text-stone-500">SÍNTESIS DE AUDIO:</span>
            <span className="text-amber-300">Web Audio API Progresivo con Sonido Posicional 3D</span>
          </div>
          <div className="flex justify-between border-b border-stone-900 pb-2">
            <span className="text-stone-500">ANIMACIÓN & ARSENAL:</span>
            <span className="text-amber-300">Escopeta Calibre 12, Bombas de Fragmentación & Enemigos</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-stone-500">TECNOLOGÍA:</span>
            <span className="text-amber-300">HTML5 Canvas 2D + TypeScript + React</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-stone-400 italic">
          "Las paredes amarillas zumban a 60 hercios... y en algún lugar en la oscuridad, las plumas se acercan."
        </p>

        <div className="mt-6 flex justify-center">
          <button
            id="btn-credits-back"
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded shadow transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
