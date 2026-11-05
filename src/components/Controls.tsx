import React from 'react';
import { Volume2, VolumeX, ArrowLeft, ArrowRight, Zap, BellRing } from 'lucide-react';
import { soundEngine } from '../soundEngine';

interface ControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onTurboStart: () => void;
  onTurboEnd: () => void;
  isTurboActive: boolean;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onTurboStart,
  onTurboEnd,
  isTurboActive,
  musicEnabled,
  onToggleMusic,
  sfxEnabled,
  onToggleSfx,
}) => {
  const handleHorn = () => {
    soundEngine.playHorn();
  };

  return (
    <div className="w-full max-w-[420px] mx-auto mt-3 px-2 select-none">
      {/* Primary Left / Right Driving Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-2.5">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onLeftStart();
          }}
          onPointerUp={onLeftEnd}
          onPointerCancel={onLeftEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="h-16 rounded-2xl bg-gradient-to-b from-pink-400 to-pink-500 border-2 border-pink-200 text-white font-fun font-bold text-xl shadow-lg shadow-pink-400/40 active:translate-y-1 active:shadow-sm active:from-pink-500 active:to-pink-600 transition flex items-center justify-center gap-2 touch-none cursor-pointer"
        >
          <ArrowLeft className="w-7 h-7 stroke-[3]" />
          <span>KIRI</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onRightStart();
          }}
          onPointerUp={onRightEnd}
          onPointerCancel={onRightEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="h-16 rounded-2xl bg-gradient-to-b from-pink-400 to-pink-500 border-2 border-pink-200 text-white font-fun font-bold text-xl shadow-lg shadow-pink-400/40 active:translate-y-1 active:shadow-sm active:from-pink-500 active:to-pink-600 transition flex items-center justify-center gap-2 touch-none cursor-pointer"
        >
          <span>KANAN</span>
          <ArrowRight className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Auxiliary Horn & Turbo Buttons */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button
          type="button"
          onClick={handleHorn}
          className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-fun font-bold text-sm border border-amber-200 shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <BellRing className="w-4 h-4 text-amber-900" />
          <span>TIN-TIN! 📢</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onTurboStart();
          }}
          onPointerUp={onTurboEnd}
          onPointerCancel={onTurboEnd}
          onContextMenu={(e) => e.preventDefault()}
          className={`py-2.5 px-3 rounded-xl font-fun font-bold text-sm border shadow-md active:scale-95 transition flex items-center justify-center gap-2 touch-none cursor-pointer ${
            isTurboActive
              ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-400'
              : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
          }`}
        >
          <Zap className={`w-4 h-4 ${isTurboActive ? 'text-yellow-200 animate-spin' : 'text-rose-600'}`} />
          <span>{isTurboActive ? 'TURBO ON! ⚡' : 'GASPOL! ⚡'}</span>
        </button>
      </div>

      {/* Audio controls row */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <button
          onClick={onToggleMusic}
          className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 cursor-pointer ${
            musicEnabled
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300'
          }`}
        >
          {musicEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>Musik: {musicEnabled ? 'NYALA 🎵' : 'MATI 🔇'}</span>
        </button>

        <button
          onClick={onToggleSfx}
          className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 cursor-pointer ${
            sfxEnabled
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300'
          }`}
        >
          {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>Efek: {sfxEnabled ? 'NYALA' : 'MATI'}</span>
        </button>
      </div>
    </div>
  );
};
