import { PowerUp } from '../types/game';

export const POWERUPS: PowerUp[] = [
  {
    id: 'vitaminD',
    name: 'Vitamin D Boost',
    description: '+20 Max Health',
    color: '#FFD700',
    emoji: '💊',
    effect: { type: 'maxHealth', value: 20 }
  },
  {
    id: 'calcium',
    name: 'Calcium Shield',
    description: '+5 Defense',
    color: '#FFFFFF',
    emoji: '🛡️',
    effect: { type: 'defense', value: 5 }
  },
  {
    id: 'protein',
    name: 'Protein Power',
    description: '+10 Damage',
    color: '#FF6347',
    emoji: '💪',
    effect: { type: 'damage', value: 10 }
  },
  {
    id: 'lactose',
    name: 'Lactose Rush',
    description: '+2 Speed',
    color: '#00CED1',
    emoji: '⚡',
    effect: { type: 'speed', value: 2 }
  },
  {
    id: 'healing',
    name: 'Fresh Milk',
    description: '+30 Health',
    color: '#F0FFF0',
    emoji: '🥛',
    effect: { type: 'health', value: 30 }
  },
  {
    id: 'steroids',
    name: 'Dairy Steroids',
    description: '+15 Damage',
    color: '#FF4500',
    emoji: '🔥',
    effect: { type: 'damage', value: 15 }
  },
  {
    id: 'ironBones',
    name: 'Iron Bones',
    description: '+8 Defense',
    color: '#A9A9A9',
    emoji: '🦴',
    effect: { type: 'defense', value: 8 }
  },
  {
    id: 'superHealth',
    name: 'Super Health',
    description: '+40 Max Health',
    color: '#32CD32',
    emoji: '❤️',
    effect: { type: 'maxHealth', value: 40 }
  },
  {
    id: 'turbo',
    name: 'Turbo Boost',
    description: '+3 Speed',
    color: '#FF69B4',
    emoji: '🚀',
    effect: { type: 'speed', value: 3 }
  },
  {
    id: 'lifesteal',
    name: 'Vampire Milk',
    description: '+5% Lifesteal (% of max HP per hit)',
    color: '#8B0000',
    emoji: '🧛',
    effect: { type: 'lifesteal', value: 5 }
  },
  {
    id: 'megaHealth',
    name: 'Mega Health Pack',
    description: '+50 Health',
    color: '#00FF00',
    emoji: '💚',
    effect: { type: 'health', value: 50 }
  },
  {
    id: 'armorPlate',
    name: 'Armor Plate',
    description: '+12 Defense',
    color: '#4682B4',
    emoji: '🛡️',
    effect: { type: 'defense', value: 12 }
  },
  {
    id: 'rage',
    name: 'Milk Rage',
    description: '+20 Damage',
    color: '#DC143C',
    emoji: '😡',
    effect: { type: 'damage', value: 20 }
  },
  {
    id: 'flash',
    name: 'Flash Step',
    description: '+4 Speed',
    color: '#FFD700',
    emoji: '💨',
    effect: { type: 'speed', value: 4 }
  },
  {
    id: 'godMilk',
    name: 'God Milk',
    description: '+60 Max Health',
    color: '#9370DB',
    emoji: '👑',
    effect: { type: 'maxHealth', value: 60 }
  },
  {
    id: 'bloodDrain',
    name: 'Blood Drain',
    description: '+10% Lifesteal (% of max HP per hit)',
    color: '#DC143C',
    emoji: '🩸',
    effect: { type: 'lifesteal', value: 10 }
  },
  {
    id: 'fortitude',
    name: 'Fortitude',
    description: '+15 Defense',
    color: '#708090',
    emoji: '🏰',
    effect: { type: 'defense', value: 15 }
  },
  {
    id: 'berserk',
    name: 'Berserk Mode',
    description: '+25 Damage',
    color: '#8B0000',
    emoji: '⚔️',
    effect: { type: 'damage', value: 25 }
  },
  {
    id: 'sonic',
    name: 'Sonic Speed',
    description: '+5 Speed',
    color: '#1E90FF',
    emoji: '🏃',
    effect: { type: 'speed', value: 5 }
  },
  {
    id: 'rejuvenation',
    name: 'Rejuvenation',
    description: 'Full Health Restore',
    color: '#00FA9A',
    emoji: '✨',
    effect: { type: 'health', value: 999 }
  },
  {
    id: 'piercingShot',
    name: 'Piercing Shot',
    description: '+1 Piercing',
    color: '#4169E1',
    emoji: '➡️',
    effect: { type: 'piercing', value: 1 }
  },
  {
    id: 'megaPiercing',
    name: 'Mega Piercing',
    description: '+2 Piercing',
    color: '#0000FF',
    emoji: '⚡',
    effect: { type: 'piercing', value: 2 }
  },
  {
    id: 'infinitePiercing',
    name: 'Infinite Pierce',
    description: '+5 Piercing',
    color: '#8A2BE2',
    emoji: '🔱',
    effect: { type: 'piercing', value: 5 }
  }
];