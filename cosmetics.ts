import { Cosmetic } from '../types/game';

export const COSMETICS: Cosmetic[] = [
  {
    id: 'default',
    name: 'Classic Hero',
    emoji: '🧑',
    price: 0,
    description: 'The original milk defender',
    ability: { type: 'speed', value: 0 }
  },
  {
    id: 'cowboy',
    name: 'Milk Cowboy',
    emoji: '🤠',
    price: 50,
    description: '+2 Defense - Tough as leather',
    ability: { type: 'defense', value: 2 }
  },
  {
    id: 'ninja',
    name: 'Dairy Ninja',
    emoji: '🥷',
    price: 75,
    description: '+1 Speed - Swift and silent',
    ability: { type: 'speed', value: 1 }
  },
  {
    id: 'robot',
    name: 'Mecha Milker',
    emoji: '🤖',
    price: 100,
    description: '+20 Max Health - Reinforced chassis',
    ability: { type: 'health', value: 20 }
  },
  {
    id: 'alien',
    name: 'Space Invader',
    emoji: '👽',
    price: 100,
    description: '+3 Damage - Alien technology',
    ability: { type: 'damage', value: 3 }
  },
  {
    id: 'detective',
    name: 'Milk Detective',
    emoji: '🕵️',
    price: 125,
    description: '+5% Lifesteal - Investigates health',
    ability: { type: 'lifesteal', value: 5 }
  },
  {
    id: 'superhero',
    name: 'Captain Calcium',
    emoji: '🦸',
    price: 150,
    description: '+5 Damage - Super strength',
    ability: { type: 'damage', value: 5 }
  },
  {
    id: 'wizard',
    name: 'Dairy Wizard',
    emoji: '🧙',
    price: 150,
    description: 'Multishot - Fire 2 projectiles',
    ability: { type: 'multishot', value: 2 }
  },
  {
    id: 'vampire',
    name: 'Count Lactose',
    emoji: '🧛',
    price: 175,
    description: '+10% Lifesteal - Vampiric drain',
    ability: { type: 'lifesteal', value: 10 }
  },
  {
    id: 'zombie',
    name: 'Zombie Milkman',
    emoji: '🧟',
    price: 175,
    description: 'Regeneration - +1 HP per second',
    ability: { type: 'regen', value: 1 }
  },
  {
    id: 'pirate',
    name: 'Dairy Pirate',
    emoji: '🏴‍☠️',
    price: 200,
    description: '+3 Defense - Sea-hardened',
    ability: { type: 'defense', value: 3 }
  },
  {
    id: 'king',
    name: 'Milk Monarch',
    emoji: '🤴',
    price: 250,
    description: '+30 Max Health - Royal constitution',
    ability: { type: 'health', value: 30 }
  },
  {
    id: 'angel',
    name: 'Holy Milker',
    emoji: '😇',
    price: 300,
    description: 'Regeneration - +2 HP per second',
    ability: { type: 'regen', value: 2 }
  },
  {
    id: 'devil',
    name: 'Milk Demon',
    emoji: '😈',
    price: 300,
    description: 'Thorns - Reflect 50% damage',
    ability: { type: 'thorns', value: 50 }
  },
  {
    id: 'unicorn',
    name: 'Unicorn Milker',
    emoji: '🦄',
    price: 500,
    description: 'Multishot - Fire 3 projectiles',
    ability: { type: 'multishot', value: 3 }
  },
  {
    id: 'dragon',
    name: 'Dragon Slayer',
    emoji: '🐉',
    price: 350,
    description: '+8 Damage - Dragon fire',
    ability: { type: 'damage', value: 8 }
  },
  {
    id: 'clown',
    name: 'Circus Milker',
    emoji: '🤡',
    price: 150,
    description: '+2 Speed - Chaotic movement',
    ability: { type: 'speed', value: 2 }
  },
  {
    id: 'fairy',
    name: 'Fairy Guardian',
    emoji: '🧚',
    price: 400,
    description: 'Regeneration - +3 HP per second',
    ability: { type: 'regen', value: 3 }
  },
  {
    id: 'mermaid',
    name: 'Ocean Defender',
    emoji: '🧜',
    price: 225,
    description: '+15% Lifesteal - Ocean\'s blessing',
    ability: { type: 'lifesteal', value: 15 }
  },
  {
    id: 'ghost',
    name: 'Phantom Milker',
    emoji: '👻',
    price: 275,
    description: '+4 Defense - Ethereal form',
    ability: { type: 'defense', value: 4 }
  },
  {
    id: 'santa',
    name: 'Milk Santa',
    emoji: '🎅',
    price: 325,
    description: '+40 Max Health - Ho ho healthy!',
    ability: { type: 'health', value: 40 }
  },
  {
    id: 'skeleton',
    name: 'Bone Warrior',
    emoji: '💀',
    price: 200,
    description: 'Thorns - Reflect 75% damage',
    ability: { type: 'thorns', value: 75 }
  },
  {
    id: 'astronaut',
    name: 'Space Milker',
    emoji: '👨‍🚀',
    price: 450,
    description: '+3 Speed - Zero gravity training',
    ability: { type: 'speed', value: 3 }
  },
  {
    id: 'scientist',
    name: 'Lab Researcher',
    emoji: '🧑‍🔬',
    price: 275,
    description: '+6 Damage - Scientific precision',
    ability: { type: 'damage', value: 6 }
  },
  {
    id: 'chef',
    name: 'Master Chef',
    emoji: '👨‍🍳',
    price: 350,
    description: 'Regeneration - +4 HP per second',
    ability: { type: 'regen', value: 4 }
  },
  {
    id: 'artist',
    name: 'Creative Milker',
    emoji: '🧑‍🎨',
    price: 400,
    description: 'Multishot - Fire 4 projectiles',
    ability: { type: 'multishot', value: 4 }
  },
  {
    id: 'firefighter',
    name: 'Milk Firefighter',
    emoji: '🧑‍🚒',
    price: 300,
    description: '+50 Max Health - Fireproof armor',
    ability: { type: 'health', value: 50 }
  },
  {
    id: 'elf',
    name: 'Forest Elf',
    emoji: '🧝',
    price: 425,
    description: '+20% Lifesteal - Nature\'s vitality',
    ability: { type: 'lifesteal', value: 20 }
  },
  {
    id: 'genie',
    name: 'Wish Granter',
    emoji: '🧞',
    price: 475,
    description: '+5 Defense - Magic shield',
    ability: { type: 'defense', value: 5 }
  },
  {
    id: 'tiger',
    name: 'Tiger Warrior',
    emoji: '🐯',
    price: 550,
    description: '+10 Damage - Fierce predator',
    ability: { type: 'damage', value: 10 }
  },
  {
    id: 'supreme-monarch',
    name: 'King of Milk',
    emoji: '🫅',
    price: 1000,
    description: '+20 Damage - I have an army',
    ability: { type: 'damage', value: 20 }
  },
  {
    id: 'platinum-champion',
    name: 'Platinum Champion',
    emoji: '💎',
    price: 0,
    description: 'ULTIMATE POWER: +50 Damage, +100 HP, +5 Defense, +5 Speed, 5-shot, +25% Lifesteal, +5 HP/s Regen, Reflect 100% Damage - Unlocks after getting all achievements!',
    ability: { type: 'ultimate', value: 1 },
    requiresAllAchievements: true
  }
]
