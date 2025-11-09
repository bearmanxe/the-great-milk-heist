export interface Weapon {
  id: string;
  name: string;
  damage: number;
  attackSpeed: number;
  range: number;
  knockback: number;
  description: string;
  color: string;
  emoji: string;
  price?: number; // Optional price for unlocking in shop
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  effect: {
    type: 'health' | 'maxHealth' | 'speed' | 'damage' | 'defense' | 'lifesteal' | 'piercing';
    value: number;
  };
}

export type EnemyType = 'normal' | 'brute' | 'shortie' | 'ranged' | 'ghost' | 'reaper' | 'vampire' | 'mutant' | 'possessed-milk';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  color: string;
  size: number;
  isBoss?: boolean;
  name?: string;
  type: EnemyType;
  canShoot?: boolean;
  canPassThroughObstacles?: boolean;
  lastShotTime?: number;
  canThrowObstacles?: boolean;
  lastObstacleThrowTime?: number;
  poisonDamage?: number;
  lifestealPercent?: number;
  lastHitTime?: number; // For invincibility frames
  lastSummonTime?: number; // For boss enemy summoning
  lastHitByPlayer?: number; // For local co-op: tracks which player (1 or 2) last hit this enemy for kill credit
  confusionDuration?: number; // Duration in ms for confusion effect when this enemy hits
}

export interface Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  defense: number;
  lifesteal: number;
  piercing: number;
  coins: number;
  cosmetic: string; // emoji for player appearance
  cosmeticAbility?: CosmeticAbility;
  poisonStacks?: number;
  lastPoisonDamageTime?: number;
  lastHitTime?: number; // For invincibility frames
  accumulatedDamage?: number; // Track damage taken for lifesteal healing
  confusedUntil?: number; // Timestamp when confusion effect ends
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'crate' | 'barrel' | 'rock' | 'cheese' | 'milk-carton';
  color: string;
  emoji: string;
}

export interface Room {
  number: number;
  enemies: Enemy[];
  obstacles: Obstacle[];
  isBoss: boolean;
  backgroundColor: string;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  size: number;
  color: string;
  emoji: string;
  isEnemyProjectile?: boolean;
  specialEffect?: 'freeze' | 'burn' | 'poison' | 'lightning';
  piercedEnemies?: number; // Track how many enemies this projectile has pierced
  knockback?: number; // Knockback force to apply to enemies
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'milk';

export type CosmeticAbility = {
  type: 'speed' | 'health' | 'damage' | 'defense' | 'lifesteal' | 'multishot' | 'thorns' | 'regen' | 'ultimate';
  value: number;
};

export interface Cosmetic {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  ability: CosmeticAbility;
  requiresAllAchievements?: boolean;
}

export interface Superpower {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  type: 'active' | 'passive';
  effect: SuperpowerEffect;
}

export type SuperpowerEffect = {
  type: 'fire-breath' | 'freeze-aura' | 'lightning-strike' | 'healing-wave' | 'shield' | 
        'dash' | 'time-slow' | 'explosion' | 'meteor' | 'tornado' | 'poison-cloud' |
        'life-drain' | 'invincibility' | 'clone' | 'teleport' | 'rage' | 'ice-wall' |
        'black-hole' | 'chain-lightning' | 'divine-light' | 'earthquake' | 'vampire' |
        'berserker' | 'guardian-angel' | 'necromancy';
  damage?: number;
  duration?: number;
  cooldown?: number;
  radius?: number;
  value?: number;
};

export interface GameStats {
  roomsCleared: number;
  enemiesKilled: number;
  bossesDefeated: number;
  coinsEarned: number;
  hasWonOnce: boolean;
}

export type GameMode = 'normal' | 'endless' | 'reverse';

export interface MultiplayerPlayer extends Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  lastUpdate?: number;
}

export interface GameSession {
  id: string;
  hostId: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  currentRoomNumber: number;
  maxPlayers: number;
  playerCount: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  hidden?: boolean;
  requirement: {
    type: 'kills' | 'rooms' | 'bosses' | 'coins' | 'difficulty' | 'weapon' | 'cosmetic' | 'special';
    value: number | string;
  };
}

export interface UserData {
  id: string;
  username: string;
  unlockedCosmetics: string[];
  weaponUpgrades: {
    damage: number;
    attackSpeed: number;
    range: number;
    knockback: number;
  };
  achievements: string[];
  totalCoins: number;
  selectedCosmetic: string;
  stats: GameStats;
  friends: string[];
}

export interface Friend {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'in-game';
  lastSeen?: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}