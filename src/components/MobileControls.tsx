import React, { useRef } from 'react';
import { Crosshair, RotateCcw, Pause, Flame, ArrowUp, User, Eye } from 'lucide-react';

interface MobileControlsProps {
  onMove: (forward: number, strafe: number) => void;
  onLook: (dx: number, dy: number) => void;
  onShoot: () => void;
  onReload: () => void;
  onThrowBomb?: () => void;
  onJump?: () => void;
  onPause: () => void;
  onToggleCamera?: () => void;
  cameraMode?: 'first_person' | 'third_person';
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onLook,
  onShoot,
  onReload,
  onThrowBomb,
  onJump,
  onPause,
  onToggleCamera,
  cameraMode = 'first_person',
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchId.current !== null) return;

    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const dx = touch.clientX - joystickCenter.current.x;
        const dy = touch.clientY - joystickCenter.current.y;
        const maxDist = 45;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;

        if (joystickKnobRef.current) {
          joystickKnobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
        }

        // Forward: -dy (up is forward), Strafe: dx (right is strafe right)
        const forward = -dy / maxDist;
        const strafe = dx / maxDist;
        onMove(Math.max(-1, Math.min(1, forward)), Math.max(-1, Math.min(1, strafe)));
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        if (joystickKnobRef.current) {
          joystickKnobRef.current.style.transform = `translate(0px, 0px)`;
        }
        onMove(0, 0);
        break;
      }
    }
  };

  // Right touch look zone handlers
  const handleLookTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (lookTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        onLook(dx, dy);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none touch-none">
      {/* Top right mobile Pause & Camera buttons */}
      <div className="absolute top-4 right-4 pointer-events-auto sm:hidden flex items-center gap-2">
        {onToggleCamera && (
          <button
            id="btn-mobile-toggle-camera"
            onClick={onToggleCamera}
            className={`w-11 h-11 border rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90 transition-colors ${
              cameraMode === 'third_person'
                ? 'bg-amber-500 text-black border-amber-300'
                : 'bg-black/75 border-amber-500/60 text-amber-300'
            }`}
            title="Alternar 1ra / 3ra Persona"
          >
            {cameraMode === 'third_person' ? <User className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-[7px] font-mono font-bold leading-tight">
              {cameraMode === 'third_person' ? '3P' : '1P'}
            </span>
          </button>
        )}
        <button
          onClick={onPause}
          className="w-11 h-11 bg-black/75 border border-amber-500/60 text-amber-300 rounded-full flex items-center justify-center shadow-lg active:scale-90"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Left Joystick Area */}
      <div
        id="mobile-joystick-area"
        ref={joystickRef}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
        className="absolute bottom-6 left-6 w-36 h-36 rounded-full bg-black/40 border-2 border-amber-500/40 pointer-events-auto flex items-center justify-center backdrop-blur-xs shadow-xl"
      >
        <div
          ref={joystickKnobRef}
          className="w-14 h-14 rounded-full bg-amber-500/80 border border-amber-300 shadow-md flex items-center justify-center pointer-events-none transition-transform duration-75"
        >
          <div className="w-4 h-4 rounded-full bg-black/40" />
        </div>
      </div>

      {/* Right Touch Look Area (entire right half of screen) */}
      <div
        id="mobile-look-area"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
        className="absolute top-16 right-0 bottom-24 w-1/2 pointer-events-auto opacity-0"
      />

      {/* Right Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 pointer-events-auto items-end">
        <div className="flex items-center gap-2">
          {/* Jump Button */}
          {onJump && (
            <button
              id="btn-mobile-jump"
              onClick={onJump}
              className="w-13 h-13 rounded-full bg-cyan-950/80 border-2 border-cyan-500 active:bg-cyan-600 text-cyan-200 flex flex-col items-center justify-center shadow-lg active:scale-95"
              title="Saltar"
            >
              <ArrowUp className="w-5 h-5 text-cyan-400" />
              <span className="text-[8px] font-mono font-bold">SALTO</span>
            </button>
          )}

          {/* Bomb Throw Button */}
          {onThrowBomb && (
            <button
              id="btn-mobile-bomb"
              onClick={onThrowBomb}
              className="w-13 h-13 rounded-full bg-orange-950/80 border-2 border-orange-500 active:bg-orange-600 text-orange-200 flex flex-col items-center justify-center shadow-lg active:scale-95"
              title="Lanzar Bomba"
            >
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-[8px] font-mono font-bold">BOMBA</span>
            </button>
          )}

          {/* Reload Button */}
          <button
            id="btn-mobile-reload"
            onClick={onReload}
            className="w-13 h-13 rounded-full bg-stone-900/80 border-2 border-stone-600 active:bg-amber-600 text-amber-300 flex flex-col items-center justify-center shadow-lg active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] font-mono font-bold">R</span>
          </button>
        </div>

        {/* Shoot Button */}
        <button
          id="btn-mobile-shoot"
          onClick={onShoot}
          className="w-20 h-20 rounded-full bg-red-600/85 active:bg-red-500 border-2 border-red-400 text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] active:scale-90"
        >
          <Crosshair className="w-8 h-8" />
          <span className="text-[10px] font-mono font-bold">FUEGO</span>
        </button>
      </div>
    </div>
  );
};
