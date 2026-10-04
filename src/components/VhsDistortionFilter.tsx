import React, { useEffect, useRef, useState } from 'react';

interface VhsDistortionFilterProps {
  damageFlash?: number;
  isBossActive?: boolean;
  timeElapsed?: number;
  playerHealth?: number;
  playerMaxHealth?: number;
  quality?: 'low' | 'med' | 'high' | 'ultra';
}

export const VhsDistortionFilter: React.FC<VhsDistortionFilterProps> = ({
  damageFlash = 0,
  isBossActive = false,
  timeElapsed = 0,
  playerHealth = 100,
  playerMaxHealth = 100,
  quality = 'high',
}) => {
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [trackingGlitch, setTrackingGlitch] = useState(false);
  const [trackingOffset, setTrackingOffset] = useState(0);

  // VCR OSD Timestamp: HH:MM:SS:FF
  const totalSeconds = Math.max(0, Math.floor(timeElapsed));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const frames = Math.floor((timeElapsed % 1) * 30);
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames
    .toString()
    .padStart(2, '0')}`;

  // Chromatic Aberration calculation: subtle at full health, intense & disorienting at low health
  const healthFrac = Math.max(0, Math.min(1, playerHealth / (playerMaxHealth || 100)));
  const injuryFactor = 1.0 - healthFrac; // 0.0 at full health, 1.0 at 0 HP
  const aberrationOffset = (1.2 + injuryFactor * 5.8 + damageFlash * 4.5).toFixed(2);
  const aberrationOpacity = Math.min(0.95, 0.22 + injuryFactor * 0.68 + damageFlash * 0.35);
  const pulseIntensity = injuryFactor > 0.5 ? Math.sin(Date.now() * 0.005) * 1.5 : 0;

  // Random intermittent tracking glitch burst
  useEffect(() => {
    let timeoutId: number;
    const triggerGlitch = () => {
      setTrackingGlitch(true);
      setTrackingOffset(Math.random() * 80 + 10);
      const glitchDuration = 250 + Math.random() * 600;

      timeoutId = window.setTimeout(() => {
        setTrackingGlitch(false);
        const nextDelay = 4000 + Math.random() * 8000;
        timeoutId = window.setTimeout(triggerGlitch, nextDelay);
      }, glitchDuration);
    };

    timeoutId = window.setTimeout(triggerGlitch, 3500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Fast procedural noise canvas for authentic magnetic tape grain
  useEffect(() => {
    if (quality === 'low') return;

    const canvas = noiseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = 160;
    const height = 90;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const renderNoise = () => {
      const isSevere = damageFlash > 0.1 || isBossActive || trackingGlitch;
      const staticDensity = isSevere ? 0.35 : 0.14;

      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < staticDensity) {
          const val = Math.floor(Math.random() * 255);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = isSevere ? Math.floor(Math.random() * 55 + 20) : Math.floor(Math.random() * 22 + 6);
        } else {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(renderNoise);
    };

    animId = requestAnimationFrame(renderNoise);
    return () => cancelAnimationFrame(animId);
  }, [damageFlash, isBossActive, trackingGlitch, quality]);

  return (
    <div
      id="vhs-distortion-container"
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none animate-vhs-glitch"
    >
      {/* 1. Fine interlace scanlines & subtle curvature */}
      <div className="crt-overlay absolute inset-0 opacity-80" />

      {/* 2. Procedural magnetic noise layer */}
      {quality !== 'low' && (
        <canvas
          ref={noiseCanvasRef}
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen pointer-events-none opacity-40"
          style={{ imageRendering: 'pixelated' }}
        />
      )}

      {/* 3. Primary scrolling tracking line */}
      <div className="vhs-tracking-line" />

      {/* 4. Bottom tape static & tracking jitter band */}
      <div
        className="absolute left-0 right-0 bottom-0 h-9 bg-gradient-to-t from-white/10 via-white/5 to-transparent pointer-events-none mix-blend-overlay"
        style={{
          transform: `translateY(${(Math.sin(Date.now() * 0.01) * 3).toFixed(1)}px)`,
        }}
      />

      {/* 5. Intermittent tracking error bar (spikes during boss roars or glitch triggers) */}
      {(trackingGlitch || damageFlash > 0.3) && (
        <div
          className="absolute left-0 right-0 h-14 pointer-events-none mix-blend-screen bg-white/15 backdrop-blur-[0.5px]"
          style={{
            top: `${trackingOffset}%`,
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
            transform: `skewX(${Math.random() > 0.5 ? 1.5 : -1.5}deg)`,
          }}
        >
          <div className="w-full h-1 bg-white/40 my-1 animate-pulse" />
          <div className="w-full h-0.5 bg-red-400/30 my-0.5" />
        </div>
      )}

      {/* 6. On-Screen Display (OSD): Cursed Analog Broadcast HUD */}
      <div className="absolute top-4 left-5 flex flex-col gap-1 font-mono text-xs text-emerald-400/80 drop-shadow-[0_0_4px_rgba(16,185,129,0.7)] tracking-wider pointer-events-none uppercase">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-300">PLAY</span>
          <span className="text-emerald-400">▶</span>
          <span className="text-[10px] text-emerald-500/70 border border-emerald-500/40 px-1 py-0.2 rounded">
            SP
          </span>
        </div>
        <div className="text-[11px] text-emerald-400/90 font-mono tracking-widest">{timeFormatted}</div>
      </div>

      <div className="absolute top-4 right-5 flex items-center gap-2 font-mono text-xs drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-rec-blink inline-block shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
        <span className="font-bold text-red-500 tracking-widest text-[11px]">REC</span>
        <span className="text-stone-400 text-[10px] hidden sm:inline-block">CH-03</span>
      </div>

      {/* 7. Subtle-to-Intense Edge Chromatic Aberration Filter (Periphery Color Shift & Disorientation) */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen overflow-hidden"
        style={{
          opacity: aberrationOpacity,
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 65%, black 100%)',
          maskImage: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 65%, black 100%)',
        }}
      >
        {/* Red/Magenta Channel Offset Layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(-${aberrationOffset}px, -${(Number(aberrationOffset) * 0.6).toFixed(1)}px) scale(${1 + Number(aberrationOffset) * 0.003})`,
            boxShadow: `inset 0 0 ${25 + injuryFactor * 40}px rgba(255, 0, 80, ${0.25 + injuryFactor * 0.55})`,
          }}
        />

        {/* Cyan/Blue Channel Offset Layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${aberrationOffset}px, ${(Number(aberrationOffset) * 0.6).toFixed(1)}px) scale(${1 - Number(aberrationOffset) * 0.002})`,
            boxShadow: `inset 0 0 ${20 + injuryFactor * 35}px rgba(0, 220, 255, ${0.22 + injuryFactor * 0.5})`,
          }}
        />

        {/* Eerie border optical prism fringe at critical health */}
        {injuryFactor > 0.4 && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge"
            style={{
              boxShadow: `inset 0 0 ${40 + injuryFactor * 60 + pulseIntensity}px rgba(180, 20, 30, ${0.35 + injuryFactor * 0.45})`,
            }}
          />
        )}
      </div>

      {/* 8. Low health / damage violent analog glitch flare */}
      {damageFlash > 0.1 && (
        <div
          className="absolute inset-0 bg-red-950/25 mix-blend-color-dodge pointer-events-none animate-vhs-jitter"
          style={{ opacity: Math.min(1, damageFlash * 1.2) }}
        >
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,0,0,0.15)_3px,transparent_4px)]" />
        </div>
      )}

      {/* 9. Vignette edge darkness */}
      <div className="vignette absolute inset-0 pointer-events-none" />
    </div>
  );
};
