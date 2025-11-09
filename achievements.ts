import { Achievement } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  // Kill-based achievements
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Defeat your first enemy',
    emoji: '⚔️',
    unlocked: false,
    requirement: { type: 'kills', value: 1 }
  },
  {
    id: 'mass-murderer',
    name: 'Mass Murderer',
    description: 'Defeat 100 enemies',
    emoji: '💀',
    unlocked: false,
    requirement: { type: 'kills', value: 100 }
  },
  {
    id: 'genocide',
    name: 'Genocide',
    description: 'Defeat 500 enemies',
    emoji: '☠️',
    unlocked: false,
    requirement: { type: 'kills', value: 500 }
  },
  {
    id: 'death-incarnate',
    name: 'Death Incarnate',
    description: 'Defeat 1000 enemies',
    emoji: '💀',
    unlocked: false,
    requirement: { type: 'kills', value: 1000 }
  },
  
  // Boss achievements
  {
    id: 'boss-slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    emoji: '🏆',
    unlocked: false,
    requirement: { type: 'bosses', value: 1 }
  },
  {
    id: 'boss-master',
    name: 'Boss Master',
    description: 'Defeat 10 bosses',
    emoji: '👑',
    unlocked: false,
    requirement: { type: 'bosses', value: 10 }
  },
  {
    id: 'boss-legend',
    name: 'Boss Legend',
    description: 'Defeat 25 bosses',
    emoji: '🔱',
    unlocked: false,
    requirement: { type: 'bosses', value: 25 }
  },
  
  // Room achievements
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Clear 10 rooms',
    emoji: '🗺️',
    unlocked: false,
    requirement: { type: 'rooms', value: 10 }
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'Clear 50 rooms',
    emoji: '🧭',
    unlocked: false,
    requirement: { type: 'rooms', value: 50 }
  },
  {
    id: 'dungeon-master',
    name: 'Dungeon Master',
    description: 'Clear 100 rooms',
    emoji: '🏰',
    unlocked: false,
    requirement: { type: 'rooms', value: 100 }
  },
  {
    id: 'endless-wanderer',
    name: 'Endless Wanderer',
    description: 'Clear 250 rooms',
    emoji: '♾️',
    unlocked: false,
    requirement: { type: 'rooms', value: 250 }
  },
  
  // Difficulty achievements
  {
    id: 'easy-victory',
    name: 'Baby Steps',
    description: 'Complete the game on Easy',
    emoji: '🍼',
    unlocked: false,
    requirement: { type: 'difficulty', value: 'easy' }
  },
  {
    id: 'normal-victory',
    name: 'Getting the Hang of It',
    description: 'Complete the game on Normal',
    emoji: '🎯',
    unlocked: false,
    requirement: { type: 'difficulty', value: 'normal' }
  },
  {
    id: 'hard-victory',
    name: 'Hardcore Hero',
    description: 'Complete the game on Hard',
    emoji: '🔥',
    unlocked: false,
    requirement: { type: 'difficulty', value: 'hard' }
  },
  {
    id: 'milk-victory',
    name: 'MILK Mode Master',
    description: 'Complete the game on MILK difficulty',
    emoji: '🥛',
    unlocked: false,
    requirement: { type: 'difficulty', value: 'milk' }
  },
  
  // Coin achievements
  {
    id: 'penny-pincher',
    name: 'Penny Pincher',
    description: 'Collect 100 total coins',
    emoji: '💰',
    unlocked: false,
    requirement: { type: 'coins', value: 100 }
  },
  {
    id: 'treasure-hunter',
    name: 'Treasure Hunter',
    description: 'Collect 500 total coins',
    emoji: '💎',
    unlocked: false,
    requirement: { type: 'coins', value: 500 }
  },
  {
    id: 'rich-beyond-dreams',
    name: 'Rich Beyond Dreams',
    description: 'Collect 1000 total coins',
    emoji: '👑',
    unlocked: false,
    requirement: { type: 'coins', value: 1000 }
  },
  {
    id: 'coin-hoarder',
    name: 'Coin Hoarder',
    description: 'Collect 5000 total coins',
    emoji: '🏦',
    unlocked: false,
    requirement: { type: 'coins', value: 5000 }
  },
  
  // Cosmetic achievements
  {
    id: 'fashionista',
    name: 'Fashionista',
    description: 'Unlock 5 cosmetics',
    emoji: '👗',
    unlocked: false,
    requirement: { type: 'cosmetic', value: 5 }
  },
  {
    id: 'style-icon',
    name: 'Style Icon',
    description: 'Unlock 15 cosmetics',
    emoji: '✨',
    unlocked: false,
    requirement: { type: 'cosmetic', value: 15 }
  },
  {
    id: 'collector',
    name: 'The Collector',
    description: 'Unlock all 30 cosmetics',
    emoji: '🎨',
    unlocked: false,
    requirement: { type: 'cosmetic', value: 30 }
  },
  
  // Weapon achievements
  {
    id: 'weapon-novice',
    name: 'Weapon Novice',
    description: 'Use 5 different weapons',
    emoji: '🗡️',
    unlocked: false,
    requirement: { type: 'weapon', value: 5 }
  },
  {
    id: 'weapon-expert',
    name: 'Weapon Expert',
    description: 'Use 15 different weapons',
    emoji: '⚔️',
    unlocked: false,
    requirement: { type: 'weapon', value: 15 }
  },
  {
    id: 'arsenal-master',
    name: 'Arsenal Master',
    description: 'Use all 27 weapons',
    emoji: '🛡️',
    unlocked: false,
    requirement: { type: 'weapon', value: 27 }
  },
  
  // Special achievements
  {
    id: 'milk-retrieved',
    name: 'The Great Milk Heist',
    description: 'Complete the game for the first time',
    emoji: '🥛',
    unlocked: false,
    requirement: { type: 'special', value: 'complete-game' }
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Complete the game in under 15 minutes',
    emoji: '⏱️',
    unlocked: false,
    requirement: { type: 'special', value: 'speedrun' }
  },
  {
    id: 'tank',
    name: 'Tank',
    description: 'Survive with over 200 max health',
    emoji: '🛡️',
    unlocked: false,
    requirement: { type: 'special', value: 'tank' }
  },
  {
    id: 'glass-cannon',
    name: 'Glass Cannon',
    description: 'Deal over 50 damage per hit',
    emoji: '💥',
    unlocked: false,
    requirement: { type: 'special', value: 'glass-cannon' }
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Complete 5 rooms without taking damage',
    emoji: '👻',
    unlocked: false,
    requirement: { type: 'special', value: 'untouchable' }
  },
  {
    id: 'reroll-addict',
    name: 'Reroll Addict',
    description: 'Reroll upgrades 25 times',
    emoji: '🔄',
    unlocked: false,
    requirement: { type: 'special', value: 'reroll-25' }
  },
  {
    id: 'local-coop-master',
    name: 'Local Co-op Master',
    description: 'Complete the game in local co-op mode',
    emoji: '👥',
    unlocked: false,
    requirement: { type: 'special', value: 'local-coop-complete' }
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Play 10 games in local co-op mode',
    emoji: '🤝',
    unlocked: false,
    requirement: { type: 'special', value: 'local-coop-10' }
  },
  {
    id: 'controller-pro',
    name: 'Controller Pro',
    description: 'Complete a game using a controller',
    emoji: '🎮',
    unlocked: false,
    requirement: { type: 'special', value: 'controller' }
  },
  {
    id: 'plat',
    name: 'Platinum Trophy',
    description: 'Unlock all other achievements',
    emoji: '🏆',
    unlocked: false,
    requirement: { type: 'special', value: 'achievements-35' }
  },
{
    id: 'reverse-mode',
    name: 'Backwards Hero',
    description: 'Complete Reverse mode',
    emoji: '⏪',
    unlocked: false,
    requirement: { type: 'special', value: 'reverse-complete' }
  }
]