import React, { useEffect, useRef } from 'react';
import { GameStatus, Obstacle, Particle, CBSkin, CB_SKINS } from '../types';
import { soundEngine } from '../soundEngine';

interface GameCanvasProps {
  status: GameStatus;
  score: number;
  progress: number;
  heartsCollected: number;
  skinId: string;
  avatarUrl: string;
  leftPressed: boolean;
  rightPressed: boolean;
  turboPressed: boolean;
  onScoreUpdate: (score: number, progress: number, hearts: number) => void;
  onCrash: () => void;
  onFinish: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  skinId,
  avatarUrl,
  leftPressed,
  rightPressed,
  turboPressed,
  onScoreUpdate,
  onCrash,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state in ref to avoid lag in requestAnimationFrame
  const gameStateRef = useRef({
    score: 0,
    progress: 0,
    hearts: 0,
    playerX: 200,
    roadOffset: 0,
    frame: 0,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    exhaustTimer: 0,
  });

  const skin = CB_SKINS.find((s) => s.id === skinId) || CB_SKINS[0];

  const faceImgRef = useRef<HTMLImageElement | null>(null);
  const faceLoadedRef = useRef<boolean>(false);

  // Load avatar image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = avatarUrl;
    img.onload = () => {
      faceImgRef.current = img;
      faceLoadedRef.current = true;
    };
    img.onerror = () => {
      faceLoadedRef.current = false;
    };
  }, [avatarUrl]);

  // Reset or initialize state when game starts
  useEffect(() => {
    if (status === 'playing') {
      gameStateRef.current = {
        score: 0,
        progress: 0,
        hearts: 0,
        playerX: 200,
        roadOffset: 0,
        frame: 0,
        obstacles: [],
        particles: [],
        exhaustTimer: 0,
      };
    }
  }, [status]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const lanes = [105, 200, 295];
    const playerY = 510;

    const roundedRect = (
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

    const drawRoad = (roadOffset: number) => {
      // Grass background
      ctx.fillStyle = '#9bd07f';
      ctx.fillRect(0, 0, 400, 600);

      // Roadside grass texture / pattern
      ctx.fillStyle = '#89c46d';
      for (let i = 0; i < 600; i += 40) {
        ctx.fillRect(0, (i + roadOffset * 1.5) % 640 - 20, 45, 12);
        ctx.fillRect(355, (i + roadOffset * 1.5) % 640 - 20, 45, 12);
      }

      // Daisies & flowers by roadside
      for (let i = 0; i < 9; i++) {
        const y = ((i * 75 + roadOffset * 1.8) % 680) - 30;

        for (const x of [20, 380]) {
          // Petals
          ctx.fillStyle = i % 2 === 0 ? '#ff72b8' : '#ff94c2';
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();

          // Flower center
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Asphalt
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(45, 0, 310, 600);

      // White borders / curbs
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(45, 0, 6, 600);
      ctx.fillRect(349, 0, 6, 600);

      // Red & white curb stripes for racing aesthetic
      const stripeHeight = 30;
      for (let y = -stripeHeight; y < 630; y += stripeHeight * 2) {
        const curY = (y + roadOffset * 1.5) % 660 - 30;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(45, curY, 6, stripeHeight);
        ctx.fillRect(349, curY, 6, stripeHeight);
      }

      // Dashed lane lines
      ctx.strokeStyle = '#fef08a'; // sweet soft yellow road lines
      ctx.lineWidth = 4;
      ctx.setLineDash([32, 28]);
      ctx.lineDashOffset = -roadOffset;

      ctx.beginPath();
      ctx.moveTo(148, 0);
      ctx.lineTo(148, 600);
      ctx.moveTo(252, 0);
      ctx.lineTo(252, 600);
      ctx.stroke();

      ctx.setLineDash([]);
    };

    const drawWheel = (x: number, y: number) => {
      // Outer tire
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Chrome rim
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = '#d4d4d8';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 9 * Math.cos(a), y + 9 * Math.sin(a));
        ctx.stroke();
      }
    };

    const drawBike = (x: number, y: number, currentSkin: CBSkin) => {
      // Soft Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(x, y + 8, 42, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Headlight yellow beam on the road
      const beamGrad = ctx.createLinearGradient(x, y - 70, x, y - 190);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 70);
      ctx.lineTo(x - 55, y - 190);
      ctx.lineTo(x + 55, y - 190);
      ctx.lineTo(x + 12, y - 70);
      ctx.closePath();
      ctx.fill();

      // Wheels (front & rear)
      drawWheel(x, y - 43);
      drawWheel(x, y + 30);

      // Chrome Exhaust Pipe on right side
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 12, y - 10);
      ctx.lineTo(x + 18, y + 15);
      ctx.lineTo(x + 18, y + 38);
      ctx.stroke();
      // Silencer tip
      roundedRect(x + 15, y + 34, 7, 12, 2, '#a1a1aa');

      // Metallic Chassis / Rangka Frame
      ctx.strokeStyle = '#d4d4d8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 35);
      ctx.lineTo(x + 12, y + 22);
      ctx.lineTo(x - 13, y + 22);
      ctx.lineTo(x - 8, y - 35);
      ctx.stroke();

      // Engine block with cooling fins
      roundedRect(x - 15, y - 8, 30, 29, 5, '#71717a');
      roundedRect(x - 11, y - 4, 22, 20, 4, '#3f3f46');
      ctx.fillStyle = '#a1a1aa';
      ctx.fillRect(x - 12, y + 1, 24, 2);
      ctx.fillRect(x - 12, y + 6, 24, 2);
      ctx.fillRect(x - 12, y + 11, 24, 2);

      // CB Tear-drop Fuel Tank (Custom skin color)
      ctx.fillStyle = currentSkin.tankColor;
      ctx.beginPath();
      ctx.ellipse(x, y - 29, 27, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tank chrome/highlight decal
      ctx.strokeStyle = currentSkin.tankHighlight;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y - 29, 21, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Honda classic tank wing emblem
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y - 29, 4, 0, Math.PI * 2);
      ctx.fill();

      // Classic Leather Dual-Seat (Jok CB)
      roundedRect(x - 20, y - 57, 40, 12, 6, '#27272a');
      // Seat stitch lines
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 57);
      ctx.lineTo(x - 10, y - 45);
      ctx.moveTo(x, y - 57);
      ctx.lineTo(x, y - 45);
      ctx.moveTo(x + 10, y - 57);
      ctx.lineTo(x + 10, y - 45);
      ctx.stroke();

      // Front Fender / Spakbor
      ctx.strokeStyle = currentSkin.fenderColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y - 43, 18, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Front Round Chrome Headlight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y - 64, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f4f4f5';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Handlebars (Setang retro)
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 28, y - 69);
      ctx.lineTo(x - 18, y - 76);
      ctx.lineTo(x + 18, y - 76);
      ctx.lineTo(x + 28, y - 69);
      ctx.stroke();

      // Mirrors (Spion bulat retro)
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 19, y - 76);
      ctx.lineTo(x - 27, y - 91);
      ctx.moveTo(x + 19, y - 76);
      ctx.lineTo(x + 27, y - 91);
      ctx.stroke();

      ctx.fillStyle = '#f4f4f5';
      ctx.beginPath();
      ctx.ellipse(x - 28, y - 94, 7, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 28, y - 94, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // EVITA - Rider's Face
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y - 119, 24, 0, Math.PI * 2);
      ctx.clip();

      if (faceLoadedRef.current && faceImgRef.current) {
        ctx.drawImage(faceImgRef.current, x - 24, y - 143, 48, 48);
      } else {
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(x - 24, y - 143, 48, 48);
        ctx.fillStyle = '#9d174d';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EVITA', x, y - 115);
      }
      ctx.restore();

      // Pink Helmet Ring & Visor
      ctx.strokeStyle = '#ff75b5';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y - 119, 25, 0, Math.PI * 2);
      ctx.stroke();

      // Helmet visor top cover
      ctx.fillStyle = '#ff75b5';
      ctx.beginPath();
      ctx.arc(x, y - 119, 26, Math.PI, Math.PI * 2);
      ctx.fill();

      // Cute Ribbon / Pita on Helmet
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(x + 20, y - 145, 7, 0, Math.PI * 2);
      ctx.arc(x + 31, y - 145, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(x + 25, y - 145, 4, 0, Math.PI * 2);
      ctx.fill();

      // License plate / CB Badge
      ctx.fillStyle = '#18181b';
      roundedRect(x - 22, y + 43, 44, 15, 3, '#18181b');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CB PINK', x, y + 54);
    };

    const drawObstacle = (o: Obstacle) => {
      if (o.type === 'heart') {
        // Collectible love heart bonus
        ctx.save();
        ctx.fillStyle = '#f43f5e';
        const hx = o.x;
        const hy = o.y;
        const s = 1.3;
        ctx.beginPath();
        ctx.moveTo(hx, hy + 4 * s);
        ctx.bezierCurveTo(hx - 12 * s, hy - 14 * s, hx - 20 * s, hy + 4 * s, hx, hy + 18 * s);
        ctx.bezierCurveTo(hx + 20 * s, hy + 4 * s, hx + 12 * s, hy - 14 * s, hx, hy + 4 * s);
        ctx.fill();

        // Heart shine
        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(hx - 5, hy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      if (o.type === 'car') {
        const carColor = o.color || '#3b82f6';
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(o.x, o.y + 2, 28, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        roundedRect(o.x - 24, o.y - 38, 48, 76, 10, carColor);
        // Roof
        roundedRect(o.x - 20, o.y - 20, 40, 42, 6, '#1e293b');
        // Windshield front & rear
        roundedRect(o.x - 17, o.y - 28, 34, 14, 4, '#bae6fd');
        roundedRect(o.x - 17, o.y + 14, 34, 10, 4, '#93c5fd');

        // Wheels
        ctx.fillStyle = '#09090b';
        ctx.fillRect(o.x - 28, o.y - 26, 6, 16);
        ctx.fillRect(o.x + 22, o.y - 26, 6, 16);
        ctx.fillRect(o.x - 28, o.y + 15, 6, 16);
        ctx.fillRect(o.x + 22, o.y + 15, 6, 16);

        // Headlights (facing downwards towards player)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(o.x - 18, o.y + 34, 9, 4);
        ctx.fillRect(o.x + 9, o.y + 34, 9, 4);
      } else {
        // Motorcycle / Scooter
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(o.x, o.y, 16, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tires
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(o.x, o.y - 18, 9, 0, Math.PI * 2);
        ctx.arc(o.x, o.y + 19, 9, 0, Math.PI * 2);
        ctx.fill();

        // Body
        roundedRect(o.x - 13, o.y - 18, 26, 35, 7, o.color || '#f59e0b');

        // Headlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(o.x, o.y + 17, 5, 0, Math.PI * 2);
        ctx.fill();

        // Rider helmet
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(o.x, o.y - 5, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const spawnObstacle = () => {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      // Random chance for Heart bonus (25%)
      const isHeart = Math.random() < 0.25;

      if (isHeart) {
        gameStateRef.current.obstacles.push({
          id: Math.random(),
          x: lane,
          y: -40,
          type: 'heart',
          width: 32,
          height: 32,
          speed: 4.5,
        });
        return;
      }

      const isCar = Math.random() < 0.55;
      const carColors = ['#0284c7', '#0d9488', '#ea580c', '#4f46e5', '#16a34a'];
      const bikeColors = ['#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

      gameStateRef.current.obstacles.push({
        id: Math.random(),
        x: lane,
        y: -75,
        type: isCar ? 'car' : 'bike',
        width: isCar ? 48 : 30,
        height: isCar ? 76 : 56,
        color: isCar
          ? carColors[Math.floor(Math.random() * carColors.length)]
          : bikeColors[Math.floor(Math.random() * bikeColors.length)],
        speed: isCar ? 5.2 : 5.8,
      });
    };

    const checkCollision = (o: Obstacle, px: number) => {
      const playerBox = {
        left: px - 20,
        right: px + 20,
        top: playerY - 60,
        bottom: playerY + 30,
      };

      const obsBox = {
        left: o.x - o.width / 2,
        right: o.x + o.width / 2,
        top: o.y - o.height / 2,
        bottom: o.y + o.height / 2,
      };

      return (
        playerBox.left < obsBox.right &&
        playerBox.right > obsBox.left &&
        playerBox.top < obsBox.bottom &&
        playerBox.bottom > obsBox.top
      );
    };

    // Particles system
    const updateParticles = () => {
      const state = gameStateRef.current;
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.shape === 'heart') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    // Render Idle Screen
    const drawIdleScreen = () => {
      drawRoad(0);
      drawBike(200, playerY, skin);

      // Cute Banner
      ctx.fillStyle = 'rgba(255, 241, 248, 0.96)';
      ctx.beginPath();
      ctx.roundRect(25, 175, 350, 215, 20);
      ctx.fill();

      ctx.strokeStyle = '#ff75b5';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(25, 175, 350, 215, 20);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#be185d';
      ctx.font = 'bold 26px Fredoka, sans-serif';
      ctx.fillText('🎀 EVITA RIDES 🎀', 200, 230);

      ctx.fillStyle = '#db2777';
      ctx.font = 'bold 15px Fredoka, sans-serif';
      ctx.fillText('PINK CB ADVENTURE 🏍️💗', 200, 260);

      ctx.fillStyle = '#475569';
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Hindari kendaraan & capai finish 1 kilo!', 200, 300);
      ctx.fillText('Ambil hati cinta 💖 untuk poin ekstra!', 200, 325);

      ctx.fillStyle = '#9d174d';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Tekan tombol "MULAI PETUALANGAN" ⬇️', 200, 360);
      ctx.textAlign = 'left';
    };

    // Main animation loop
    const render = () => {
      const state = gameStateRef.current;

      if (status !== 'playing') {
        if (status === 'idle') {
          drawIdleScreen();
        }
        return;
      }

      // Speed boost factor if turbo is pressed
      const speedMult = turboPressed ? 1.4 : 1.0;
      const roadSpeed = 5 * speedMult;

      state.roadOffset = (state.roadOffset + roadSpeed) % 65;
      drawRoad(state.roadOffset);

      // Player Movement
      const moveSpeed = (turboPressed ? 6.5 : 5.2);
      if (leftPressed) state.playerX -= moveSpeed;
      if (rightPressed) state.playerX += moveSpeed;

      state.playerX = Math.max(85, Math.min(315, state.playerX));

      // Exhaust smoke puffs
      state.exhaustTimer++;
      if (state.exhaustTimer % 4 === 0) {
        state.particles.push({
          x: state.playerX + 18 + (Math.random() * 4 - 2),
          y: playerY + 45,
          vx: Math.random() * 1 - 0.5,
          vy: 2.5 + Math.random() * 1.5,
          size: 3 + Math.random() * 3,
          color: turboPressed ? '#fbcfe8' : '#e4e4e7',
          alpha: 0.6,
        });
      }

      // Spawn obstacles (dynamic rate)
      state.frame++;
      const spawnRate = Math.max(45, 62 - Math.floor(state.progress / 3));
      if (state.frame % spawnRate === 0) {
        spawnObstacle();
      }

      // Move & draw obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const o = state.obstacles[i];
        o.y += o.speed * speedMult;
        drawObstacle(o);

        // Collision check
        if (checkCollision(o, state.playerX)) {
          if (o.type === 'heart') {
            // Heart pickup bonus!
            soundEngine.playCollect();
            state.score += 50;
            state.hearts += 1;

            // Heart pickup burst particles
            for (let k = 0; k < 10; k++) {
              state.particles.push({
                x: o.x,
                y: o.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: 4 + Math.random() * 3,
                color: '#f43f5e',
                alpha: 1,
                shape: 'heart',
              });
            }

            state.obstacles.splice(i, 1);
            continue;
          } else {
            // Crash!
            soundEngine.playCrash();
            // Crash particles
            for (let k = 0; k < 18; k++) {
              state.particles.push({
                x: state.playerX,
                y: playerY,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                size: 5 + Math.random() * 4,
                color: k % 2 === 0 ? '#ff72b8' : '#fef08a',
                alpha: 1,
              });
            }
            onCrash();
            return;
          }
        }
      }

      // Remove off-screen obstacles
      state.obstacles = state.obstacles.filter((o) => o.y < 680);

      // Render player motorcycle
      drawBike(state.playerX, playerY, skin);

      // Render particles
      updateParticles();

      // Progress and Score
      state.score += 1;
      // 100% target progress (approx 1500 points = 1 kilo)
      state.progress = Math.min(100, Math.floor(state.score / 15));

      onScoreUpdate(state.score, state.progress, state.hearts);

      if (state.progress >= 100) {
        soundEngine.playVictory();
        onFinish();
        return;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    status,
    skin,
    leftPressed,
    rightPressed,
    turboPressed,
    onScoreUpdate,
    onCrash,
    onFinish,
  ]);

  return (
    <div className="relative mx-auto w-full max-w-[420px] rounded-2xl overflow-hidden border-4 border-pink-400 bg-neutral-800 shadow-xl shadow-pink-300/40">
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="block w-full h-auto aspect-[2/3] touch-none select-none"
      />
    </div>
  );
};
