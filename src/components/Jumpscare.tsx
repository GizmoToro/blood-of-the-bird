import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { textureCache } from '../game/textures';
import { soundManager } from '../game/audio';

interface JumpscareProps {
  onComplete: () => void;
}

export const Jumpscare: React.FC<JumpscareProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Play horrifying jumpscare scream
    soundManager.playJumpscareScream();

    // Render terrifying uncanny face onto canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const w = canvas.width;
        const h = canvas.height;

        let frameId: number;
        const startTime = Date.now();

        const render = () => {
          const elapsed = (Date.now() - startTime) / 1000;

          // Clear with dark blood-soaked vignette
          ctx.fillStyle = '#0a0303';
          ctx.fillRect(0, 0, w, h);

          // Violent screen shudder
          const shakeX = elapsed < 1.5 ? (Math.random() - 0.5) * 28 : (Math.random() - 0.5) * 8;
          const shakeY = elapsed < 1.5 ? (Math.random() - 0.5) * 28 : (Math.random() - 0.5) * 8;

          // Pulsing zoom of the terrifying uncanny face
          const zoom = Math.min(2.4, 1.3 + elapsed * 0.45);

          ctx.save();
          ctx.translate(w / 2 + shakeX, h * 0.46 + shakeY);
          ctx.scale(zoom, zoom);

          // Draw the exact uncanny face from reference image at massive resolution
          textureCache.drawUncannyFace(
            ctx,
            0,
            0,
            3.8, // Massive scale
            0.38 + Math.sin(elapsed * 12) * 0.04, // slight sickening head twist
            true, // enraged
            true, // attacking
            '#ff0022', // Piercing crimson glowing pupils
            true,
            '#8b0000'
          );

          ctx.restore();

          // Glitch / static lines
          ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
          for (let gy = 0; gy < h; gy += 4) {
            if (Math.random() < 0.25) {
              ctx.fillRect(0, gy, w, 2);
            }
          }

          // Flashing blood vignettes at screen corners
          const redVignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
          redVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
          redVignette.addColorStop(0.7, 'rgba(120, 0, 0, 0.45)');
          redVignette.addColorStop(1, 'rgba(40, 0, 0, 0.95)');
          ctx.fillStyle = redVignette;
          ctx.fillRect(0, 0, w, h);

          // Dark TV static noise overlay
          const imgData = ctx.getImageData(0, 0, Math.min(w, 400), Math.min(h, 300));
          // Keep loop running
          frameId = requestAnimationFrame(render);
        };

        render();

        return () => {
          cancelAnimationFrame(frameId);
        };
      }
    }
  }, []);

  // Automatically transition to GameOver after 3.2 seconds or on click/key
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3400);

    const handleSkip = () => {
      onComplete();
    };

    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [onComplete]);

  return (
    <div
      id="jumpscare-overlay"
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between select-none cursor-pointer overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Atmospheric blood drip shadow */}
      <div className="absolute inset-0 bg-radial from-transparent via-red-950/20 to-black/90 pointer-events-none" />

      {/* Top Warning */}
      <div className="relative z-10 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0.7, 1], scale: [0.8, 1.05, 1] }}
          transition={{ duration: 0.6 }}
          className="text-red-700/80 font-mono tracking-[0.5em] text-xs uppercase"
        >
          [ SEÑAL PERDIDA EN EL NIVEL FINAL ]
        </motion.div>
      </div>

      {/* Terrifying Iconic Catchphrase: SÉ DÓNDE VIVES. */}
      <div className="relative z-10 pb-16 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{
            opacity: [0, 1, 0.9, 1],
            scale: [0.7, 1.15, 1],
            y: [30, -5, 0],
          }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-red-600 tracking-widest font-mono text-center drop-shadow-[0_0_35px_rgba(255,0,0,0.9)] uppercase select-none px-4"
        >
          SÉ DÓNDE VIVES.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-stone-400 font-mono text-xs tracking-widest mt-4 uppercase"
        >
          HAZ CLIC O PRESIONA CUALQUIER TECLA PARA CONTINUAR
        </motion.p>
      </div>
    </div>
  );
};
