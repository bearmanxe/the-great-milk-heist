import { Room, Enemy, Obstacle, Difficulty, EnemyType } from '../types/game';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 600;

// Global ID counters for unique IDs
let obstacleIdCounter = 0;
let enemyIdCounter = 0;

const ROOM_COLORS = [
  'linear-gradient(to bottom right, #fef3c7, #fde68a)',
  'linear-gradient(to bottom right, #ddd6fe, #c4b5fd)',
  'linear-gradient(to bottom right, #fecaca, #fca5a5)',
  'linear-gradient(to bottom right, #bfdbfe, #93c5fd)',
  'linear-gradient(to bottom right, #bbf7d0, #86efac)',
  'linear-gradient(to bottom right, #fbcfe8, #f9a8d4)',
];

const ENEMY_COLORS = {
  normal: '#ef4444',
  brute: '#8b5cf6',
  shortie: '#06b6d4',
  ranged: '#f97316',
  ghost: '#94a3b8',
  reaper: '#1e293b',
  vampire: '#7f1d1d',
  mutant: '#14532d',
  'possessed-milk': '#f8f8f8'
};

const OBSTACLE_TYPES = [
  { type: 'crate' as const, emoji: '📦', color: '#A0826D' },
  { type: 'barrel' as const, emoji: '🛢️', color: '#8B4513' },
  { type: 'rock' as const, emoji: '🪨', color: '#808080' },
  { type: 'cheese' as const, emoji: '🧀', color: '#FFD700' },
  { type: 'milk-carton' as const, emoji: '🥛', color: '#FFFFFF' },
];

function randomPosition(size: number): { x: number; y: number } {
  return {
    x: size / 2 + Math.random() * (ARENA_WIDTH - size),
    y: size / 2 + Math.random() * (ARENA_HEIGHT - size),
  };
}

function isPositionValid(
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  existingObstacles: Obstacle[],
  minDistance: number = 80
): boolean {
  // Check if too close to center (player spawn)
  const centerX = ARENA_WIDTH / 2;
  const centerY = ARENA_HEIGHT / 2;
  const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  if (distToCenter < 150) return false;

  // Check if too close to edges
  if (x < 60 || x + width > ARENA_WIDTH - 60) return false;
  if (y < 60 || y + height > ARENA_HEIGHT - 60) return false;

  // Check if overlapping with existing obstacles
  for (const obstacle of existingObstacles) {
    const dx = Math.abs(x - obstacle.x);
    const dy = Math.abs(y - obstacle.y);
    const minDistX = (width + obstacle.width) / 2 + minDistance;
    const minDistY = (height + obstacle.height) / 2 + minDistance;
    
    if (dx < minDistX && dy < minDistY) {
      return false;
    }
  }

  return true;
}

function createObstacle(existingObstacles: Obstacle[]): Obstacle | null {
  const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  const width = 50 + Math.random() * 40; // 50-90
  const height = 50 + Math.random() * 40; // 50-90
  
  // Try to find a valid position
  for (let attempt = 0; attempt < 50; attempt++) {
    const x = Math.random() * (ARENA_WIDTH - width);
    const y = Math.random() * (ARENA_HEIGHT - height);
    
    if (isPositionValid(x, y, width, height, existingObstacles)) {
      return {
        id: `obstacle_${++obstacleIdCounter}`,
        x: x + width / 2,
        y: y + height / 2,
        width,
        height,
        type: obstacleType.type,
        color: obstacleType.color,
        emoji: obstacleType.emoji,
      };
    }
  }
  
  return null;
}

function getEnemyTypeStats(type: EnemyType, baseHealth: number, baseDamage: number, baseSpeed: number, baseSize: number) {
  switch (type) {
    case 'brute':
      return {
        health: baseHealth * 2.5,
        damage: baseDamage * 2.5,
        speed: baseSpeed * 0.4,
        size: baseSize * 1.3,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 0,
        confusionDuration: 0
      };
    case 'shortie':
      return {
        health: baseHealth * 0.5,
        damage: baseDamage * 0.6,
        speed: baseSpeed * 1.7,
        size: baseSize * 0.7,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 0,
        confusionDuration: 0
      };
    case 'ranged':
      return {
        health: baseHealth * 0.8,
        damage: baseDamage * 0.9,
        speed: baseSpeed * 1.3,
        size: baseSize * 0.9,
        canShoot: true,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 0,
        confusionDuration: 0
      };
    case 'ghost':
      return {
        health: baseHealth * 0.7,
        damage: baseDamage * 0.5,
        speed: baseSpeed * 0.6,
        size: baseSize,
        canShoot: false,
        canPassThroughObstacles: true,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 0,
        confusionDuration: 0
      };
    case 'reaper':
      return {
        health: baseHealth * 1.2,
        damage: baseDamage * 1.1,
        speed: baseSpeed * 1.0,
        size: baseSize,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 3, // Deals poison damage over time
        lifestealPercent: 0,
        confusionDuration: 0
      };
    case 'vampire':
      return {
        health: baseHealth * 1.5,
        damage: baseDamage * 1.3,
        speed: baseSpeed * 1.1,
        size: baseSize * 1.1,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 50, // Heals 50% of damage dealt
        confusionDuration: 0
      };
    case 'mutant':
      return {
        health: baseHealth * 5.0, // Most health in the game
        damage: baseDamage * 3.5, // Can 2-tap player at 100 HP (50 damage per hit)
        speed: baseSpeed * 0.7, // Speedy
        size: baseSize * 1.5,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: true, // Can throw obstacles
        poisonDamage: 5,
        lifestealPercent: 0,
        confusionDuration: 0
      };
    case 'possessed-milk':
      return {
        health: baseHealth * 1.0, // Normal health
        damage: baseDamage * 1.5, // 50% more damage
        speed: baseSpeed * 0.8, // Slower speed
        size: baseSize * 0.95,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 0,
        confusionDuration: 3000 // 3 seconds of confusion
      };
    default: // normal
      return {
        health: baseHealth,
        damage: baseDamage,
        speed: baseSpeed,
        size: baseSize,
        canShoot: false,
        canPassThroughObstacles: false,
        canThrowObstacles: false,
        poisonDamage: 0,
        lifestealPercent: 0,
        confusionDuration: 0
      };
  }
}

function createEnemy(
  roomNumber: number,
  difficulty: Difficulty,
  obstacles: Obstacle[],
  isBoss: boolean = false,
  enemyType?: EnemyType
): Enemy {
  const baseHealth = isBoss ? 250 : 40;
  const baseDamage = isBoss ? 25 : 10;
  const baseSpeed = isBoss ? 1.5 : 2;
  const baseSize = isBoss ? 80 : 40;
  
  // Progressive scaling - enemies get stronger as rooms progress
  const roomScaling = 1 + (roomNumber - 1) * 0.25; // 25% increase per room (was 20%)
  
  // Difficulty multipliers
  const difficultyMultipliers = {
    easy: { health: 0.6, damage: 0.6, speed: 0.9 },
    normal: { health: 1, damage: 1, speed: 1 },
    hard: { health: 1.7, damage: 1.7, speed: 1.3 },
    milk: { health: 2.5, damage: 2.5, speed: 1.5 } // 250% stronger than normal
  };
  
  const multiplier = difficultyMultipliers[difficulty];
  
  // Randomly select enemy type if not specified
  const type = enemyType || (isBoss ? 'normal' : 
    ['normal', 'normal', 'brute', 'shortie', 'ranged', 'ghost', 'reaper', 'vampire', 'mutant', 'possessed-milk'][Math.floor(Math.random() * 10)] as EnemyType
  );
  
  const typeStats = getEnemyTypeStats(type, baseHealth, baseDamage, baseSpeed, baseSize);
  
  // Find a valid position that doesn't overlap with obstacles
  let pos;
  let attempts = 0;
  do {
    pos = randomPosition(typeStats.size);
    attempts++;
  } while (
    attempts < 100 && 
    !isPositionValid(pos.x - typeStats.size / 2, pos.y - typeStats.size / 2, typeStats.size, typeStats.size, obstacles, 20)
  );
  
  return {
    id: `enemy_${++enemyIdCounter}`,
    ...pos,
    health: typeStats.health * roomScaling * multiplier.health,
    maxHealth: typeStats.health * roomScaling * multiplier.health,
    damage: typeStats.damage * roomScaling * multiplier.damage,
    speed: typeStats.speed * multiplier.speed,
    color: ENEMY_COLORS[type],
    size: typeStats.size,
    isBoss,
    name: isBoss ? `Boss of Room ${roomNumber}` : undefined,
    type,
    canShoot: typeStats.canShoot,
    canPassThroughObstacles: typeStats.canPassThroughObstacles,
    canThrowObstacles: typeStats.canThrowObstacles,
    poisonDamage: typeStats.poisonDamage,
    lifestealPercent: typeStats.lifestealPercent,
    confusionDuration: typeStats.confusionDuration,
    lastShotTime: 0,
    lastObstacleThrowTime: 0
  };
}

export function generateRoom(roomNumber: number, difficulty: Difficulty, isEndless: boolean = false, enemyMultiplier: number = 1): Room {
  // In endless mode, use roomNumber as-is (it's already 16+ after victory screen)
  const actualRoomNumber = roomNumber;
  const isBoss = actualRoomNumber % 5 === 0;
  
  // Generate obstacles first
  const obstacles: Obstacle[] = [];
  const baseObstacleCount = isBoss ? 2 : 3;
  const obstacleCount = baseObstacleCount + Math.floor(actualRoomNumber / 4);
  
  for (let i = 0; i < Math.min(obstacleCount, 8); i++) {
    const obstacle = createObstacle(obstacles);
    if (obstacle) {
      obstacles.push(obstacle);
    }
  }
  
  let enemies: Enemy[] = [];
  
  // More enemies on harder difficulties and in endless mode
  const difficultyEnemyCount = {
    easy: 0,
    normal: 2,
    hard: 3,
    milk: 5
  };
  
  const endlessBonus = isEndless ? Math.floor(roomNumber / 2) : 0;
  
  if (isBoss) {
    // Boss room - one big boss and minions
    enemies.push(createEnemy(actualRoomNumber, difficulty, obstacles, true));
    const minionCount = Math.floor((2 + Math.floor(actualRoomNumber / 4) + difficultyEnemyCount[difficulty] + endlessBonus) * enemyMultiplier);
    for (let i = 0; i < minionCount; i++) {
      enemies.push(createEnemy(actualRoomNumber, difficulty, obstacles, false));
    }
  } else {
    // Regular room - scaling enemy count
    const enemyCount = Math.floor((4 + Math.floor(actualRoomNumber / 2) + difficultyEnemyCount[difficulty] + endlessBonus) * enemyMultiplier);
    for (let i = 0; i < enemyCount; i++) {
      enemies.push(createEnemy(actualRoomNumber, difficulty, obstacles, false));
    }
  }
  
  return {
    number: actualRoomNumber,
    enemies,
    obstacles,
    isBoss,
    backgroundColor: ROOM_COLORS[actualRoomNumber % ROOM_COLORS.length],
  };
}