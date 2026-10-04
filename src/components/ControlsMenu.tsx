import React from 'react';
import { ArrowLeft, Keyboard, Smartphone, MousePointer } from 'lucide-react';
import { soundManager } from '../game/audio';

interface ControlsMenuProps {
  onBack: () => void;
}

export const ControlsMenu: React.FC<ControlsMenuProps> = ({ onBack }) => {
  const handleBack = () => {
    soundManager.playButtonClick();
    onBack();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-black/95 text-stone-200 select-none overflow-y-auto z-30 font-tech">
      <div className="crt-overlay absolute inset-0 pointer-events-none" />
      <div className="vignette absolute inset-0 pointer-events-none" />

      <div className="relative z-20 w-full max-w-2xl bg-stone-950/90 border border-amber-600/40 rounded-lg p-6 shadow-2xl backdrop-blur-md my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-bold font-creep tracking-wider text-amber-400">
              CONTROLES DEL JUEGO
            </h2>
          </div>
          <button
            id="btn-controls-back"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-amber-950/60 border border-stone-700 hover:border-amber-500 rounded text-amber-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER</span>
          </button>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PC Keyboard & Mouse */}
          <div className="bg-black/60 border border-stone-800 rounded p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider mb-4 pb-2 border-b border-stone-800">
              <MousePointer className="w-4 h-4" />
              <span>TECLADO Y MOUSE (PC)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Moverse</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 font-bold rounded">W / A / S / D</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Correr / Sprint</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-cyan-300 font-bold rounded">Shift Izquierdo</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Saltar (Esquivar ondas)</span>
                <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold rounded">Espacio</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Mirar / Apuntar</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 font-bold rounded">Mouse (Pointer Lock)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Disparar escopeta</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-red-300 font-bold rounded">Click Izquierdo</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Lanzar Bomba</span>
                <span className="px-2 py-0.5 bg-orange-950 border border-orange-600 text-orange-300 font-bold rounded">Click Derecho / Tecla G</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Recargar escopeta</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 font-bold rounded">Tecla R</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Alternar linterna</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 font-bold rounded">Tecla F</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-900">
                <span className="text-stone-400">Cambiar perspectiva (1ª / 3ª persona)</span>
                <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-bold rounded">Tecla V</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-400">Pausa / Menú</span>
                <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 font-bold rounded">Tecla ESC / P</span>
              </div>
            </div>
          </div>

          {/* Smartphone / Tablet Mobile */}
          <div className="bg-black/60 border border-stone-800 rounded p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider mb-4 pb-2 border-b border-stone-800">
              <Smartphone className="w-4 h-4" />
              <span>DISPOSITIVOS TÁCTILES (MÓVIL)</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800">
                <span className="block font-bold text-amber-300 mb-1">Joystick Virtual Izquierdo</span>
                <span className="text-stone-400">Arrastra en la mitad izquierda de la pantalla para caminar en 4 direcciones.</span>
              </div>
              <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800">
                <span className="block font-bold text-amber-300 mb-1">Zona Táctil Derecha</span>
                <span className="text-stone-400">Desliza en la mitad derecha para girar la cámara y mirar verticalmente.</span>
              </div>
              <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800">
                <span className="block font-bold text-amber-300 mb-1">Botón de Disparo [FUEGO]</span>
                <span className="text-stone-400">Presiona el botón de gatillo para disparar la escopeta con perdigones.</span>
              </div>
              <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800">
                <span className="block font-bold text-cyan-300 mb-1">Botón de Salto [SALTO]</span>
                <span className="text-stone-400">Salta verticalmente para esquivar los ataques sísmicos de Gallardo.</span>
              </div>
              <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800">
                <span className="block font-bold text-orange-400 mb-1">Botón de Bomba [BOMBA]</span>
                <span className="text-stone-400">Lanza una bomba de fragmentación que rebota y detona en área.</span>
              </div>
              <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800">
                <span className="block font-bold text-amber-300 mb-1">Botón de Recarga [🔄]</span>
                <span className="text-stone-400">Recarga el cargador de la escopeta cuando tengas munición de reserva.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 p-3 bg-amber-950/30 border border-amber-900/40 rounded text-xs text-amber-200/80">
          💡 <strong>CONSEJO:</strong> Haz click en la pantalla del juego en PC para activar el puntero del mouse (Pointer Lock) y obtener la mejor precisión al apuntar.
        </div>

        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded shadow transition-all cursor-pointer"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};
