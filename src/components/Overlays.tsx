import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RefreshCw, Heart, Trophy, Share2, Sparkles, X, Check } from 'lucide-react';
import { CBSkin, CB_SKINS } from '../types';

interface CrashOverlayProps {
  score: number;
  progress: number;
  hearts: number;
  onRetry: () => void;
}

export const CrashOverlay: React.FC<CrashOverlayProps> = ({
  score,
  progress,
  hearts,
  onRetry,
}) => {
  const crashMessages = [
    'Semangat, Cintaa! Jangan menyerah yaa. CB Pink-nya masih menunggu! 🎀',
    'Aduh, CB Pink-nya kesenggol dikit. Ayo gass lagi sayang! 🌷',
    'Tidak apa-apa, sayang! Kamu pasti bisa sampai finish 1 kilo! 💗',
    'Hehehe hampir berhasil! Sedikit lagi sampai, ayo coba lagi Evita! 💕',
    'Tenang cintaku, CB Pink siap tancap gas lagi! Bismillah tembus 100%! 🏍️✨',
  ];

  const randomMsg =
    crashMessages[Math.floor(Math.random() * crashMessages.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-pink-50 border-4 border-pink-400 p-6 text-center shadow-2xl shadow-pink-500/30 transform transition-all animate-scale-up">
        <div className="text-5xl mb-2 animate-bounce">🥺💗</div>
        <h2 className="text-2xl font-bold font-fun text-pink-700 mb-1">
          YAHH, NABRAK 1 kilo!
        </h2>
        <p className="text-sm font-medium text-pink-900/80 mb-5 leading-relaxed">
          {randomMsg}
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-2 bg-pink-100/80 rounded-2xl p-3 border border-pink-200 mb-6 text-xs font-semibold text-pink-800">
          <div>
            <div className="text-pink-600">🏁 Jarak</div>
            <div className="text-lg font-bold text-pink-900">{progress}%</div>
          </div>
          <div>
            <div className="text-pink-600">⭐ Skor</div>
            <div className="text-lg font-bold text-pink-900">{score}</div>
          </div>
          <div>
            <div className="text-pink-600">💖 Cinta</div>
            <div className="text-lg font-bold text-pink-900">+{hearts}</div>
          </div>
        </div>

        <button
          onClick={onRetry}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-fun font-bold text-lg shadow-lg shadow-pink-500/30 active:scale-95 hover:brightness-105 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          💗 COBA LAGI
        </button>
      </div>
    </div>
  );
};

interface FinishOverlayProps {
  score: number;
  hearts: number;
  avatarUrl: string;
  onPlayAgain: () => void;
}

export const FinishOverlay: React.FC<FinishOverlayProps> = ({
  score,
  hearts,
  avatarUrl,
  onPlayAgain,
}) => {
  useEffect(() => {
    // Launch fireworks confetti
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff72b8', '#ff4f9e', '#ffd9eb', '#fde047', '#38bdf8'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff72b8', '#ff4f9e', '#ffd9eb', '#fde047', '#38bdf8'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleShare = () => {
    const text = `🎉 Aku berhasil menamatkan game "Evita Rides - Pink CB Adventure" sampai garis FINISH 1 KILO dengan skor ${score} dan ${hearts} hati cinta! 🏍️💗`;
    if (navigator.share) {
      navigator.share({
        title: 'Evita Rides 🎀 Pink CB Adventure',
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Teks keberhasilan disalin ke papan klip! 📋💗');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden bg-pink-300">
      {/* Background Evita Photo with gentle zoom */}
      <img
        src={avatarUrl}
        alt="Foto Evita"
        className="absolute inset-0 w-full h-full object-cover object-center animate-pulse scale-105 transition-transform duration-1000"
      />

      {/* Romantic Pink gradient shade */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-950 via-pink-900/75 to-transparent" />

      {/* Floating Sparkles & Hearts */}
      <div className="absolute top-10 inset-x-0 flex justify-center gap-4 text-3xl pointer-events-none">
        <span className="animate-bounce delay-100">🏆</span>
        <span className="animate-bounce delay-200">🎀</span>
        <span className="animate-bounce delay-300">💗</span>
        <span className="animate-bounce delay-400">✨</span>
      </div>

      {/* Finish Words & Controls */}
      <div className="relative z-10 w-full max-w-lg mx-auto p-6 pb-10 text-center text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/60 backdrop-blur-md text-pink-100 text-xs font-bold mb-3 border border-pink-300/40">
          <Sparkles className="w-3.5 h-3.5" /> 100% GARIS FINISH 1 KILO TERCAPAI
        </div>

        <h1 className="text-3xl sm:text-4xl font-fun font-bold text-pink-100 drop-shadow-md mb-2">
          Yee iso, EVITA! 🏆🎀
        </h1>

        <p className="text-base sm:text-lg font-medium text-pink-200 mb-6 drop-shadow leading-relaxed">
          Selamat, Cintaaa 1 kilo untukmu!<br />
          Akhirnya sampai FINISH!<br />
          <span className="font-bold text-pink-100">CB Pink selalu di hati! 🏍️💕</span>
        </p>

        {/* Results Card */}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
          <div>
            <div className="text-xs text-pink-200">Total Skor</div>
            <div className="text-2xl font-bold font-fun text-yellow-300">{score}</div>
          </div>
          <div>
            <div className="text-xs text-pink-200">Hati Cinta</div>
            <div className="text-2xl font-bold font-fun text-pink-200">+{hearts} 💖</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-fun font-bold text-base shadow-lg shadow-pink-600/50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            MAIN LAGI 💗
          </button>
          <button
            onClick={handleShare}
            className="py-3.5 px-5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 active:scale-95 text-white font-fun font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Bagikan
          </button>
        </div>
      </div>
    </div>
  );
};

interface SkinModalProps {
  currentSkinId: string;
  onSelectSkin: (id: string) => void;
  onClose: () => void;
}

export const SkinModal: React.FC<SkinModalProps> = ({
  currentSkinId,
  onSelectSkin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-pink-50 border-4 border-pink-400 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold font-fun text-pink-800 mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          Pilih Warna CB Pink Impian
        </h3>
        <p className="text-xs text-pink-600 mb-4">
          Ubah warna tangki & spakbor motor CB kesayangan Evita
        </p>

        <div className="space-y-2.5">
          {CB_SKINS.map((skin: CBSkin) => {
            const isSelected = skin.id === currentSkinId;
            return (
              <button
                key={skin.id}
                onClick={() => onSelectSkin(skin.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-pink-500 bg-pink-100/90 shadow-md shadow-pink-300/40'
                    : 'border-pink-200 bg-white hover:border-pink-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: skin.tankColor }}
                  >
                    <span className="text-xs">🏍️</span>
                  </div>
                  <div>
                    <div className="font-bold font-fun text-pink-900 text-sm">
                      {skin.name}
                    </div>
                    <div className="text-xs text-pink-600/80">Edisi {skin.badge}</div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-pink-300" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-fun font-bold text-sm shadow-md transition"
        >
          Gunakan Motor Ini 🏍️
        </button>
      </div>
    </div>
  );
};

interface PhotoModalProps {
  avatarUrl: string;
  onClose: () => void;
  onUpdateAvatar: (url: string) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  avatarUrl,
  onClose,
  onUpdateAvatar,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefault = () => {
    onUpdateAvatar('/assets/aistudio/evita.jpg_f4c2b407.png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-pink-50 border-4 border-pink-400 p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold font-fun text-pink-800 mb-1">
          Foto Pengendara Evita 🎀
        </h3>
        <p className="text-xs text-pink-600 mb-4">
          Foto ini tampil di helm motor CB dan layar FINISH
        </p>

        <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-pink-400 shadow-lg shadow-pink-300/50 mb-4 bg-pink-200">
          <img
            src={avatarUrl}
            alt="Evita"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="text-xs text-pink-700 font-medium italic mb-4">
          "Cinta 1 kilo untuk Evita tersayang! 💗"
        </div>

        <div className="flex flex-col gap-2">
          <label className="cursor-pointer py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-fun font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
            <span>📷 Ganti Foto Custom</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            onClick={resetToDefault}
            className="py-2 px-3 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-medium transition"
          >
            Kembalikan Foto Asli Evita
          </button>
        </div>
      </div>
    </div>
  );
};
