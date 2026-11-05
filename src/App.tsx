import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { EVITA_IMAGE } from './evitaBase64';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showCrash, setShowCrash] = useState<boolean>(false);
  const [showFinish, setShowFinish] = useState<boolean>(false);
  const [crashMessage, setCrashMessage] = useState<string>('');
  const [musicOn, setMusicOn] = useState<boolean>(false);

  // References for game loop state
  const stateRef = useRef({
    playing: false,
    score: 0,
    progress: 0,
    playerX: 200,
    roadOffset: 0,
    frame: 0,
    obstacles: [] as Array<{
      x: number;
      y: number;
      type: 'car' | 'bike';
      width: number;
      height: number;
    }>,
    left: false,
    right: false,
    animId: null as number | null,
    musicOn: false,
    noteIndex: 0,
    audioCtx: null as AudioContext | null,
    musicInterval: null as number | null,
  });

  const faceImgRef = useRef<HTMLImageElement | null>(null);
  const hasFaceRef = useRef<boolean>(false);

  const melody = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880, 698.46,
    523.25, 659.25, 783.99, 1046.5,
    880, 783.99, 659.25, 587.33
  ];

  const playNote = () => {
    const s = stateRef.current;
    if (!s.musicOn) return;

    if (!s.audioCtx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      s.audioCtx = new AC();
    }

    if (s.audioCtx.state === 'suspended') {
      s.audioCtx.resume().catch(() => {});
    }

    try {
      const osc = s.audioCtx.createOscillator();
      const gain = s.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = melody[s.noteIndex % melody.length];

      gain.gain.setValueAtTime(0.0001, s.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, s.audioCtx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, s.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(s.audioCtx.destination);

      osc.start();
      osc.stop(s.audioCtx.currentTime + 0.27);

      s.noteIndex++;
    } catch {
      // Audio context might need user gesture
    }
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    stateRef.current.musicOn = next;

    if (stateRef.current.musicInterval) {
      clearInterval(stateRef.current.musicInterval);
      stateRef.current.musicInterval = null;
    }

    if (next) {
      playNote();
      stateRef.current.musicInterval = window.setInterval(playNote, 280);
    }
  };

  useEffect(() => {
    // Load Evita face immediately using embedded high-res image
    const face = new Image();
    face.onload = () => {
      faceImgRef.current = face;
      hasFaceRef.current = true;
      drawIdle();
    };
    face.src = EVITA_IMAGE;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        stateRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        stateRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        stateRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        stateRef.current.right = false;
      }
    };

    const handleBlur = () => {
      stateRef.current.left = false;
      stateRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointerup', handleBlur);

    drawIdle();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerup', handleBlur);
      if (stateRef.current.animId) {
        cancelAnimationFrame(stateRef.current.animId);
      }
      if (stateRef.current.musicInterval) {
        clearInterval(stateRef.current.musicInterval);
      }
    };
  }, []);

  // Launch confetti upon reaching finish
  useEffect(() => {
    if (showFinish) {
      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [showFinish]);

  const roundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  };

  const drawRoad = (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    ctx.fillStyle = '#a8d98c';
    ctx.fillRect(0, 0, 400, 600);

    // Bunga pinggir jalan
    for (let i = 0; i < 9; i++) {
      const y = ((i * 85 + s.roadOffset * 1.5) % 680) - 30;

      for (const x of [18, 382]) {
        ctx.fillStyle = '#ff7ab9';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffe57a';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Aspal
    ctx.fillStyle = '#494949';
    ctx.fillRect(45, 0, 310, 600);

    ctx.fillStyle = '#fff';
    ctx.fillRect(45, 0, 5, 600);
    ctx.fillRect(350, 0, 5, 600);

    // Garis jalan
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.setLineDash([35, 30]);
    ctx.lineDashOffset = -s.roadOffset;

    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(150, 600);
    ctx.moveTo(250, 0);
    ctx.lineTo(250, 600);
    ctx.stroke();

    ctx.setLineDash([]);
    s.roadOffset = (s.roadOffset + 5) % 65;
  };

  const drawWheel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d9d9d9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 9 * Math.cos(a), y + 9 * Math.sin(a));
      ctx.stroke();
    }
  };

  const drawBike = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Bayangan motor
    ctx.fillStyle = 'rgba(20, 20, 20, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 42, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Roda depan & belakang
    drawWheel(ctx, x, y - 43);
    drawWheel(ctx, x, y + 30);

    // Rangka motor CB
    ctx.strokeStyle = '#cfcfcf';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 35);
    ctx.lineTo(x + 12, y + 22);
    ctx.lineTo(x - 13, y + 22);
    ctx.lineTo(x - 8, y - 35);
    ctx.stroke();

    // Mesin CB
    roundedRect(ctx, x - 15, y - 8, 30, 29, 5, '#888');
    roundedRect(ctx, x - 11, y - 4, 22, 20, 4, '#555');

    // Tangki CB Pink
    ctx.fillStyle = '#f42c91';
    ctx.beginPath();
    ctx.ellipse(x, y - 29, 27, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffd9eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y - 29, 21, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Jok motor retro
    roundedRect(ctx, x - 20, y - 57, 40, 12, 6, '#292929');

    // Spakbor
    ctx.strokeStyle = '#ff9ac8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y - 43, 18, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Lampu depan
    ctx.fillStyle = '#fff2a6';
    ctx.beginPath();
    ctx.arc(x, y - 64, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Setang
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 27, y - 69);
    ctx.lineTo(x - 18, y - 76);
    ctx.lineTo(x + 18, y - 76);
    ctx.lineTo(x + 27, y - 69);
    ctx.stroke();

    // Spion bulat
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 19, y - 76);
    ctx.lineTo(x - 27, y - 91);
    ctx.moveTo(x + 19, y - 76);
    ctx.lineTo(x + 27, y - 91);
    ctx.stroke();

    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.ellipse(x - 28, y - 94, 7, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 28, y - 94, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helm Pink Base di belakang kepala
    ctx.fillStyle = '#ff72b8';
    ctx.beginPath();
    ctx.arc(x, y - 118, 30, 0, Math.PI * 2);
    ctx.fill();

    // Wajah Karakter - FOTO ASLI EVITA
    const faceRadius = 26;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y - 118, faceRadius, 0, Math.PI * 2);
    ctx.clip();

    if (hasFaceRef.current && faceImgRef.current) {
      // Draw Evita's face clearly with proper framing
      ctx.drawImage(
        faceImgRef.current,
        x - faceRadius,
        y - 118 - faceRadius,
        faceRadius * 2,
        faceRadius * 2
      );
    } else {
      ctx.fillStyle = '#ffddc9';
      ctx.fillRect(x - faceRadius, y - 118 - faceRadius, faceRadius * 2, faceRadius * 2);
      ctx.fillStyle = '#bd3479';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EVITA', x, y - 114);
    }
    ctx.restore();

    // Lingkaran frame pink manis di sekeliling foto Evita
    ctx.strokeStyle = '#ff3388';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - 118, faceRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Pita lucu di atas helm Evita
    ctx.fillStyle = '#ffb6d9';
    ctx.beginPath();
    ctx.arc(x + 18, y - 144, 7, 0, Math.PI * 2);
    ctx.arc(x + 28, y - 144, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.arc(x + 23, y - 144, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Plat motor CB PINK
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CB PINK', x, y + 51);
    ctx.textAlign = 'left';
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, o: {
    x: number;
    y: number;
    type: 'car' | 'bike';
    width: number;
    height: number;
  }) => {
    if (o.type === 'car') {
      roundedRect(ctx, o.x - 24, o.y - 38, 48, 76, 9, '#39a7e8');
      roundedRect(ctx, o.x - 17, o.y - 28, 34, 20, 5, '#c9f1ff');

      ctx.fillStyle = '#222';
      ctx.fillRect(o.x - 28, o.y - 26, 6, 16);
      ctx.fillRect(o.x + 22, o.y - 26, 6, 16);
      ctx.fillRect(o.x - 28, o.y + 15, 6, 16);
      ctx.fillRect(o.x + 22, o.y + 15, 6, 16);

      ctx.fillStyle = '#fff2a5';
      ctx.fillRect(o.x - 16, o.y + 29, 9, 5);
      ctx.fillRect(o.x + 7, o.y + 29, 9, 5);
    } else {
      ctx.fillStyle = '#171717';
      ctx.beginPath();
      ctx.arc(o.x, o.y - 18, 9, 0, Math.PI * 2);
      ctx.arc(o.x, o.y + 19, 9, 0, Math.PI * 2);
      ctx.fill();

      roundedRect(ctx, o.x - 13, o.y - 18, 26, 35, 7, '#ffbf43');

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(o.x, o.y - 25, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const checkCollision = (
    px: number,
    o: { x: number; y: number; width: number; height: number }
  ) => {
    const playerY = 510;
    const player = {
      left: px - 23,
      right: px + 23,
      top: playerY - 63,
      bottom: playerY + 35,
    };

    const obstacle = {
      left: o.x - o.width / 2,
      right: o.x + o.width / 2,
      top: o.y - o.height / 2,
      bottom: o.y + o.height / 2,
    };

    return (
      player.left < obstacle.right &&
      player.right > obstacle.left &&
      player.top < obstacle.bottom &&
      player.bottom > obstacle.top
    );
  };

  const spawnObstacle = () => {
    const lanes = [100, 200, 300];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const isCar = Math.random() < 0.6;

    stateRef.current.obstacles.push({
      x: lane,
      y: -65,
      type: isCar ? 'car' : 'bike',
      width: isCar ? 52 : 34,
      height: isCar ? 76 : 66,
    });
  };

  const drawIdle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawRoad(ctx);
    drawBike(ctx, 200, 510);

    ctx.fillStyle = 'rgba(255,190,220,.96)';
    ctx.fillRect(28, 205, 344, 185);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 207, 340, 181);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#bd3479';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('🎀 EVITA RIDES 🎀', 200, 260);

    ctx.font = 'bold 17px Arial';
    ctx.fillText('Siap naik CB Pink?', 200, 310);

    ctx.font = 'bold 17px Arial';
    ctx.fillText('Ayo sampai FINISH! 💗', 200, 350);

    ctx.textAlign = 'left';
  };

  const handleCrash = () => {
    const s = stateRef.current;
    s.playing = false;
    s.left = false;
    s.right = false;

    if (s.animId !== null) {
      cancelAnimationFrame(s.animId);
      s.animId = null;
    }

    if (s.musicOn) playNote();

    const messages = [
      'Semangat, Cintaa! Jangan menyerah yaa. 💗',
      'Aduh, CB Pink-nya kena sedikit. Ayo coba lagi! 🎀',
      'Tidak apa-apa, sayang! Kamu pasti bisa sampai finish! 🌷',
      'Hehehe, hampir berhasil! Semangat terus, Evita! 💕',
    ];

    setCrashMessage(messages[Math.floor(Math.random() * messages.length)]);
    setIsPlaying(false);
    setShowCrash(true);
  };

  const handleFinish = () => {
    const s = stateRef.current;
    s.playing = false;
    s.left = false;
    s.right = false;

    if (s.animId !== null) {
      cancelAnimationFrame(s.animId);
      s.animId = null;
    }

    if (s.musicOn) playNote();

    setIsPlaying(false);
    setShowFinish(true);
  };

  const loop = () => {
    const s = stateRef.current;
    if (!s.playing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawRoad(ctx);

    if (s.left) s.playerX -= 5;
    if (s.right) s.playerX += 5;

    s.playerX = Math.max(85, Math.min(315, s.playerX));

    s.frame++;
    if (s.frame % 62 === 0) spawnObstacle();

    for (const o of s.obstacles) {
      o.y += 5;
      drawObstacle(ctx, o);

      if (checkCollision(s.playerX, o)) {
        handleCrash();
        return;
      }
    }

    s.obstacles = s.obstacles.filter((o) => o.y < 680);

    drawBike(ctx, s.playerX, 510);

    s.score++;
    s.progress = Math.min(100, Math.floor(s.score / 15));

    setScore(s.score);
    setDistance(s.progress);

    if (s.progress >= 100) {
      handleFinish();
      return;
    }

    s.animId = requestAnimationFrame(loop);
  };

  const startGame = () => {
    const s = stateRef.current;
    if (s.animId !== null) {
      cancelAnimationFrame(s.animId);
      s.animId = null;
    }

    setShowCrash(false);
    setShowFinish(false);

    s.score = 0;
    s.progress = 0;
    s.playerX = 200;
    s.obstacles = [];
    s.frame = 0;
    s.roadOffset = 0;
    s.left = false;
    s.right = false;
    s.playing = true;

    setScore(0);
    setDistance(0);
    setIsPlaying(true);

    loop();
  };

  return (
    <div className="min-h-screen text-center overflow-x-hidden font-['Trebuchet_MS',Arial,sans-serif] text-[#bd3479] bg-gradient-to-br from-[#ffd9eb] via-[#fff4fa] to-[#ffb5d8] pb-4">
      {/* Header */}
      <header className="pt-2.5 px-1 pb-1">
        <h1 className="text-[clamp(24px,6vw,34px)] m-[3px] font-bold">
          🎀 EVITA RIDES 🎀
        </h1>
        <div className="font-bold text-[14px]">
          PINK CB ADVENTURE 🏍️💗
        </div>
      </header>

      {/* Stats Panel */}
      <div className="w-[min(95vw,430px)] mx-auto my-2 flex gap-2 justify-center">
        <div className="flex-1 bg-white border-2 border-[#ffacd1] rounded-[14px] p-2 font-bold shadow-sm">
          ⭐ Skor: <span>{score}</span>
        </div>
        <div className="flex-1 bg-white border-2 border-[#ffacd1] rounded-[14px] p-2 font-bold shadow-sm">
          🏁 Jarak: <span>{distance}</span>%
        </div>
      </div>

      {/* Game Canvas Box */}
      <div className="w-[min(95vw,430px)] mx-auto my-2 border-[5px] border-[#ff72b8] rounded-[20px] overflow-hidden bg-[#444] shadow-[0_6px_18px_#d77da8]">
        <canvas
          ref={canvasRef}
          id="game"
          width={400}
          height={600}
          className="block w-full h-auto touch-none"
        />
      </div>

      {/* Steering Controls */}
      <div className="flex justify-center gap-[22px] my-[9px]">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            stateRef.current.left = true;
          }}
          onPointerUp={() => {
            stateRef.current.left = false;
          }}
          onPointerCancel={() => {
            stateRef.current.left = false;
          }}
          className="border-[3px] border-white rounded-[25px] bg-[#ff69b4] text-white py-3 px-[21px] text-[17px] font-bold shadow-[0_4px_9px_#d77da8] cursor-pointer touch-none active:scale-[0.94] transition-transform select-none"
        >
          ⬅️ KIRI
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            stateRef.current.right = true;
          }}
          onPointerUp={() => {
            stateRef.current.right = false;
          }}
          onPointerCancel={() => {
            stateRef.current.right = false;
          }}
          className="border-[3px] border-white rounded-[25px] bg-[#ff69b4] text-white py-3 px-[21px] text-[17px] font-bold shadow-[0_4px_9px_#d77da8] cursor-pointer touch-none active:scale-[0.94] transition-transform select-none"
        >
          KANAN ➡️
        </button>
      </div>

      {/* Start / Restart Button */}
      {!isPlaying && (
        <button
          type="button"
          onClick={startGame}
          className="border-[3px] border-white rounded-[25px] bg-[#ff69b4] text-white py-3 px-[21px] text-[17px] font-bold shadow-[0_4px_9px_#d77da8] cursor-pointer touch-none active:scale-[0.94] transition-transform my-1"
        >
          {score > 0 ? '🔄 COBA LAGI' : '💗 MULAI PETUALANGAN 💗'}
        </button>
      )}

      <div>
        <button
          type="button"
          onClick={toggleMusic}
          className="border-[3px] border-white rounded-[25px] bg-[#d94c94] text-white py-2 px-[14px] text-[13px] font-bold shadow-[0_4px_9px_#d77da8] cursor-pointer touch-none active:scale-[0.94] transition-transform my-1"
        >
          {musicOn ? '🎵 Musik: NYALA' : '🎵 Musik: MATI'}
        </button>
      </div>

      {/* Notes */}
      <div className="text-[12px] leading-[1.5] p-1 text-[#bd3479] max-w-[400px] mx-auto mt-1">
        Hindari semua kendaraan dan capai garis FINISH! 🏁<br />
        Tekan tombol kiri/kanan atau gunakan tombol panah keyboard.
      </div>

      {/* Layar Tabrakan (Crash Overlay) */}
      {showCrash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[18px] bg-[rgba(255,178,215,0.94)]">
          <div className="w-[min(92vw,390px)] p-[22px_17px] bg-[#fff5fa] border-4 border-[#ff75b6] rounded-[25px] shadow-[0_8px_30px_#d77da8] animate-[pop_0.5s_ease]">
            <div className="text-[48px]">🥺💗</div>
            <h2 className="text-[27px] my-[5px] font-bold">YAHH, NABRAK 1 kilo!</h2>
            <p className="text-[16px] leading-[1.5] my-3">
              {crashMessage || 'Semangat, Cintaa! Jangan menyerah yaa. CB Pink-nya masih menunggu! 🎀'}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="border-[3px] border-white rounded-[25px] bg-[#ff69b4] text-white py-3 px-[21px] text-[17px] font-bold shadow-[0_4px_9px_#d77da8] cursor-pointer touch-none active:scale-[0.94] transition-transform"
            >
              💗 COBA LAGI
            </button>
          </div>
        </div>
      )}

      {/* Layar Finish (Finish Overlay) - Foto Evita Dizoom saat Menang */}
      {showFinish && (
        <div className="fixed inset-0 z-50 p-0 bg-[#ffb5d8] flex flex-col overflow-hidden items-center justify-end">
          {/* Foto Evita Fullscreen dengan Animasi Zoom Halus Berkelanjutan */}
          <img
            className="absolute inset-0 w-full h-full object-cover animate-[zoomPhoto_10s_ease-in-out_forwards]"
            src={EVITA_IMAGE}
            alt="Foto Evita Menang"
          />

          {/* Efek Gradien Pink Romantis */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(115,20,69,0.92)] via-[rgba(115,20,69,0.45)] to-transparent" />

          {/* Kartu Foto Evita Tengah Berkilau yang Dizoom */}
          <div className="relative z-10 mb-2 flex flex-col items-center animate-[zoomPhoto_8s_ease-out_forwards]">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white shadow-[0_0_25px_#ff69b4] ring-4 ring-[#ff72b8] animate-pulse">
              <img
                src={EVITA_IMAGE}
                alt="Evita Juara"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="mt-2 text-2xl animate-bounce">
              👑✨💖
            </div>
          </div>

          {/* Teks Ucapan Kemenangan */}
          <div className="relative z-10 w-full p-[15px_15px_30px] text-white [text-shadow:0_2px_8px_#8d245a] text-center">
            <div className="text-[36px]">🏆🎀💗</div>
            <h2 className="text-[clamp(32px,9vw,48px)] my-[5px] font-bold">
              Yee iso, EVITA!
            </h2>
            <p className="text-[17px] sm:text-[19px] font-bold my-2.5 leading-relaxed">
              Selamat, Cintaaa 1 kilo untukmu!<br />
              Akhirnya sampai FINISH!<br />
              CB Pink selalu di hati! 🏍️💕
            </p>
            <button
              type="button"
              onClick={startGame}
              className="border-[3px] border-white rounded-[25px] bg-[#ff4f9e] text-white py-3 px-[24px] text-[18px] font-bold shadow-[0_4px_12px_#d77da8] cursor-pointer touch-none active:scale-[0.94] transition-transform mt-2 hover:brightness-110"
            >
              MAIN LAGI 💗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
