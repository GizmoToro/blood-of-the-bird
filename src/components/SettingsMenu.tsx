import React from 'react';
import { GameSettings, QualityLevel, CameraMode } from '../types';
import { ArrowLeft, Monitor, Volume2, Gamepad2, Sliders, Music, Activity, Eye, User, Tv } from 'lucide-react';
import { soundManager } from '../game/audio';

interface SettingsMenuProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    soundManager.updateVolumes(updated);
  };

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
            <Sliders className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-bold font-creep tracking-wider text-amber-400">
              CONFIGURACIÓN
            </h2>
          </div>
          <button
            id="btn-settings-back"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-amber-950/60 border border-stone-700 hover:border-amber-500 rounded text-amber-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER</span>
          </button>
        </div>

        <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* VIDEO & GRÁFICOS SECTION */}
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider mb-3">
              <Monitor className="w-4 h-4" />
              <span>GRÁFICOS Y RENDIMIENTO</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/50 p-4 rounded border border-stone-800">
              {/* Calidad gráfica */}
              <div>
                <label className="block text-xs text-stone-400 mb-2">CALIDAD DE GRÁFICOS</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'med', 'high', 'ultra'] as QualityLevel[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChange('graphicsQuality', q)}
                      className={`py-1.5 px-1.5 rounded text-[11px] font-bold uppercase border transition-all cursor-pointer ${
                        settings.graphicsQuality === q
                          ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {q === 'low' ? 'Baja' : q === 'med' ? 'Media' : q === 'high' ? 'Alta' : 'Ultra'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distancia de renderizado */}
              <div>
                <label className="block text-xs text-stone-400 mb-2">DISTANCIA DE RENDERIZADO</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'med', 'high'] as QualityLevel[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChange('renderDistance', q)}
                      className={`py-1.5 px-2 rounded text-xs font-bold uppercase border transition-all cursor-pointer ${
                        settings.renderDistance === q
                          ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {q === 'low' ? 'Corta' : q === 'med' ? 'Media' : 'Larga'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efectos visuales */}
              <div>
                <label className="block text-xs text-stone-400 mb-2">EFECTOS VISUALES</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'med', 'high'] as QualityLevel[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChange('effectsQuality', q)}
                      className={`py-1.5 px-2 rounded text-xs font-bold uppercase border transition-all cursor-pointer ${
                        settings.effectsQuality === q
                          ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {q === 'low' ? 'Bajo' : q === 'med' ? 'Medio' : 'Alto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mostrar FPS */}
              <div className="flex items-center justify-between p-2 bg-stone-900/60 rounded border border-stone-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block text-xs font-semibold text-stone-300">MOSTRAR FPS</span>
                    <span className="text-[10px] text-stone-500">Contador en esquina</span>
                  </div>
                </div>
                <button
                  id="btn-settings-fps"
                  onClick={() => handleChange('showFPS', !settings.showFPS)}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer border transition-all ${
                    settings.showFPS
                      ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      : 'bg-stone-900 text-stone-400 border-stone-700'
                  }`}
                >
                  {settings.showFPS ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Filtro VHS de Horror Analógico */}
              <div className="flex items-center justify-between p-2 bg-stone-900/60 rounded border border-stone-800">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs font-semibold text-stone-300">FILTRO VHS ANALÓGICO</span>
                    <span className="text-[10px] text-stone-500">Líneas de seguimiento y distorsión de cinta</span>
                  </div>
                </div>
                <button
                  id="btn-settings-vhs"
                  onClick={() => handleChange('vhsFilter', settings.vhsFilter !== false ? false : true)}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer border transition-all ${
                    settings.vhsFilter !== false
                      ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      : 'bg-stone-900 text-stone-400 border-stone-700'
                  }`}
                >
                  {settings.vhsFilter !== false ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Brillo */}
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>BRILLO</span>
                  <span className="text-amber-300">{Math.round(settings.brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={settings.brightness}
                  onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* FOV */}
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>CAMPO DE VISIÓN (FOV)</span>
                  <span className="text-amber-300">{settings.fov}°</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="85"
                  step="1"
                  value={settings.fov}
                  onChange={(e) => handleChange('fov', parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* AUDIO SECTION */}
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider mb-3">
              <Volume2 className="w-4 h-4" />
              <span>AUDIO</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/50 p-4 rounded border border-stone-800">
              {/* Volumen General */}
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>VOLUMEN GENERAL</span>
                  <span className="text-amber-300">{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Música Activa (ON / OFF) */}
              <div className="flex items-center justify-between p-2 bg-stone-900/60 rounded border border-stone-800">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block text-xs font-semibold text-stone-300">MÚSICA HORROR ANALÓGICO</span>
                    <span className="text-[10px] text-stone-500">Cintas VHS, drones y tensión psicológica</span>
                  </div>
                </div>
                <button
                  onClick={() => handleChange('musicEnabled', !settings.musicEnabled)}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer border transition-all ${
                    settings.musicEnabled
                      ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                      : 'bg-stone-900 text-stone-400 border-stone-700'
                  }`}
                >
                  {settings.musicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Volumen Música */}
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>VOLUMEN MÚSICA</span>
                  <span className="text-amber-300">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  disabled={!settings.musicEnabled}
                  onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                  className={`w-full accent-amber-500 cursor-pointer ${!settings.musicEnabled ? 'opacity-40' : ''}`}
                />
              </div>

              {/* Efectos SFX */}
              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>EFECTOS (DISPAROS / GALLINAS)</span>
                  <span className="text-amber-300">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Ambiente */}
              <div className="sm:col-span-2">
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>AMBIENTE (LUCES / TUBERÍAS / ECOS)</span>
                  <span className="text-amber-300">{Math.round(settings.ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => handleChange('ambientVolume', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* JUGABILIDAD SECTION */}
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider mb-3">
              <Gamepad2 className="w-4 h-4" />
              <span>JUGABILIDAD Y CÁMARA</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/50 p-4 rounded border border-stone-800">
              {/* Perspectiva: Primera vs Tercera Persona */}
              <div className="sm:col-span-2 bg-stone-900/60 p-3 rounded border border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="block text-xs font-semibold text-stone-200">MODO DE PERSPECTIVA</span>
                      <span className="text-[10px] text-stone-500">Alterna entre vista en 1ª y 3ª persona (Tecla V en partida)</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-camera-first-person"
                    onClick={() => handleChange('cameraMode', 'first_person')}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      settings.cameraMode !== 'third_person'
                        ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>1ª PERSONA (CLÁSICA)</span>
                  </button>
                  <button
                    id="btn-camera-third-person"
                    onClick={() => handleChange('cameraMode', 'third_person')}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      settings.cameraMode === 'third_person'
                        ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>3ª PERSONA (PERSONAJE ANIMADO)</span>
                  </button>
                </div>
              </div>

              {/* Distancia de cámara en tercera persona */}
              {settings.cameraMode === 'third_person' && (
                <div className="sm:col-span-2 bg-amber-950/20 p-3 rounded border border-amber-900/40">
                  <div className="flex justify-between text-xs text-stone-300 mb-1">
                    <span className="font-semibold text-amber-400">DISTANCIA DE CÁMARA (3ª PERSONA)</span>
                    <span className="text-amber-300 font-mono">{(settings.thirdPersonDistance ?? 1.85).toFixed(2)}m</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.8"
                    step="0.05"
                    value={settings.thirdPersonDistance ?? 1.85}
                    onChange={(e) => handleChange('thirdPersonDistance', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                    <span>Cerca (1.2m - Combate cerrado)</span>
                    <span>Óptimo (1.85m)</span>
                    <span>Lejos (2.8m - Visión amplia)</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>SENSIBILIDAD MOUSE</span>
                  <span className="text-amber-300">{settings.mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) => handleChange('mouseSensitivity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-stone-900/60 rounded border border-stone-800">
                <div>
                  <span className="block text-xs font-semibold text-stone-300">INVERTIR EJE Y</span>
                  <span className="text-[10px] text-stone-500">Invertir mirada vertical</span>
                </div>
                <button
                  onClick={() => handleChange('invertY', !settings.invertY)}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer border transition-all ${
                    settings.invertY
                      ? 'bg-amber-500 text-black border-amber-300'
                      : 'bg-stone-900 text-stone-400 border-stone-700'
                  }`}
                >
                  {settings.invertY ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Volver button */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            id="btn-settings-save"
            onClick={handleBack}
            className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded shadow transition-all cursor-pointer"
          >
            GUARDAR Y VOLVER
          </button>
        </div>
      </div>
    </div>
  );
};
