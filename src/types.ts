// Game data types and skins for Evita Rides

export type GameStatus = 'idle' | 'playing' | 'crashed' | 'finished';

export type ObstacleType = 'car' | 'bike' | 'truck' | 'heart';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: ObstacleType;
  width: number;
  height: number;
  color?: string;
  speed: number;
  collected?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  shape?: 'heart' | 'sparkle' | 'circle';
}

export interface CBSkin {
  id: string;
  name: string;
  tankColor: string;
  tankHighlight: string;
  fenderColor: string;
  accent: string;
  badge: string;
}

export const CB_SKINS: CBSkin[] = [
  {
    id: 'pink-classic',
    name: 'CB Pink Klasik 🎀',
    tankColor: '#f42c91',
    tankHighlight: '#ffd9eb',
    fenderColor: '#ff9ac8',
    accent: '#ff4f9e',
    badge: 'Original'
  },
  {
    id: 'sweet-magenta',
    name: 'CB Magenta Manis 💖',
    tankColor: '#db2777',
    tankHighlight: '#fbcfe8',
    fenderColor: '#f472b6',
    accent: '#be185d',
    badge: 'Glamour'
  },
  {
    id: 'lilac-dream',
    name: 'CB Lilac Dream 💜',
    tankColor: '#9333ea',
    tankHighlight: '#f3e8ff',
    fenderColor: '#c084fc',
    accent: '#7e22ce',
    badge: 'Aesthetic'
  },
  {
    id: 'cherry-red',
    name: 'CB Ruby Cherry 🍒',
    tankColor: '#e11d48',
    tankHighlight: '#ffe4e6',
    fenderColor: '#fb7185',
    accent: '#9f1239',
    badge: 'Gaspol'
  }
];

export interface GameSettings {
  difficulty: 'santai' | 'standar' | 'gaspol';
  skinId: string;
}
