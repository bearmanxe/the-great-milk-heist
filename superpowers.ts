import { Superpower } from '../types/game';

export const SUPERPOWERS: Superpower[] = [
  {
    id: 'fire-breath',
    name: 'Fire Breath',
    emoji: '🔥',
    description: 'Breathe fire in a cone, burning enemies',
    color: '#FF4500',
    type: 'active',
    effect: { type: 'fire-breath', damage: 30, duration: 2000, cooldown: 5000, radius: 150 }
  },
  {
    id: 'freeze-aura',
    name: 'Freeze Aura',
    emoji: '❄️',
    description: 'Slow all nearby enemies by 70%',
    color: '#00CED1',
    type: 'active',
    effect: { type: 'freeze-aura', duration: 3000, cooldown: 8000, radius: 200, value: 70 }
  },
  {
    id: 'lightning-strike',
    name: 'Lightning Strike',
    emoji: '⚡',
    description: 'Call down lightning on enemies',
    color: '#FFD700',
    type: 'active',
    effect: { type: 'lightning-strike', damage: 50, cooldown: 6000, radius: 100 }
  },
  {
    id: 'healing-wave',
    name: 'Healing Wave',
    emoji: '💚',
    description: 'Restore 40 HP instantly',
    color: '#32CD32',
    type: 'active',
    effect: { type: 'healing-wave', value: 40, cooldown: 10000 }
  },
  {
    id: 'shield',
    name: 'Energy Shield',
    emoji: '🛡️',
    description: 'Absorb all damage for 3 seconds',
    color: '#4169E1',
    type: 'active',
    effect: { type: 'shield', duration: 3000, cooldown: 12000 }
  },
  {
    id: 'dash',
    name: 'Sonic Dash',
    emoji: '💨',
    description: 'Dash forward at high speed',
    color: '#00BFFF',
    type: 'active',
    effect: { type: 'dash', duration: 500, cooldown: 4000 }
  },
  {
    id: 'time-slow',
    name: 'Time Slow',
    emoji: '⏰',
    description: 'Slow all enemies to 20% speed',
    color: '#9370DB',
    type: 'active',
    effect: { type: 'time-slow', duration: 4000, cooldown: 15000, value: 80 }
  },
  {
    id: 'explosion',
    name: 'Nova Blast',
    emoji: '💥',
    description: 'Explode outward, damaging all nearby',
    color: '#FF6347',
    type: 'active',
    effect: { type: 'explosion', damage: 40, cooldown: 7000, radius: 150 }
  },
  {
    id: 'meteor',
    name: 'Meteor Shower',
    emoji: '☄️',
    description: 'Rain meteors on the arena',
    color: '#FF4500',
    type: 'active',
    effect: { type: 'meteor', damage: 25, duration: 3000, cooldown: 10000, radius: 50 }
  },
  {
    id: 'tornado',
    name: 'Tornado',
    emoji: '🌪️',
    description: 'Summon a tornado pulling enemies in',
    color: '#87CEEB',
    type: 'active',
    effect: { type: 'tornado', damage: 15, duration: 4000, cooldown: 9000, radius: 120 }
  },
  {
    id: 'poison-cloud',
    name: 'Poison Cloud',
    emoji: '☠️',
    description: 'Create toxic cloud damaging over time',
    color: '#9ACD32',
    type: 'active',
    effect: { type: 'poison-cloud', damage: 5, duration: 5000, cooldown: 8000, radius: 140 }
  },
  {
    id: 'life-drain',
    name: 'Life Drain',
    emoji: '🩸',
    description: 'Drain HP from all enemies',
    color: '#DC143C',
    type: 'active',
    effect: { type: 'life-drain', damage: 20, cooldown: 8000, radius: 200, value: 50 }
  },
  {
    id: 'invincibility',
    name: 'Invincibility',
    emoji: '✨',
    description: 'Become invulnerable for 2 seconds',
    color: '#FFD700',
    type: 'active',
    effect: { type: 'invincibility', duration: 2000, cooldown: 20000 }
  },
  {
    id: 'clone',
    name: 'Shadow Clone',
    emoji: '👥',
    description: 'Create decoys that distract enemies',
    color: '#696969',
    type: 'active',
    effect: { type: 'clone', duration: 6000, cooldown: 12000, value: 2 }
  },
  {
    id: 'teleport',
    name: 'Teleport',
    emoji: '🌀',
    description: 'Instantly teleport to cursor',
    color: '#BA55D3',
    type: 'active',
    effect: { type: 'teleport', cooldown: 5000 }
  },
  {
    id: 'rage',
    name: 'Berserker Rage',
    emoji: '😡',
    description: '+100% damage for 5 seconds',
    color: '#8B0000',
    type: 'active',
    effect: { type: 'rage', duration: 5000, cooldown: 10000, value: 100 }
  },
  {
    id: 'ice-wall',
    name: 'Ice Wall',
    emoji: '🧊',
    description: 'Create ice walls blocking enemies',
    color: '#B0E0E6',
    type: 'active',
    effect: { type: 'ice-wall', duration: 6000, cooldown: 8000 }
  },
  {
    id: 'black-hole',
    name: 'Black Hole',
    emoji: '🌑',
    description: 'Suck in and damage all enemies',
    color: '#000000',
    type: 'active',
    effect: { type: 'black-hole', damage: 35, duration: 3000, cooldown: 15000, radius: 180 }
  },
  {
    id: 'chain-lightning',
    name: 'Chain Lightning',
    emoji: '⚡',
    description: 'Lightning chains between enemies',
    color: '#FFFF00',
    type: 'active',
    effect: { type: 'chain-lightning', damage: 30, cooldown: 7000, value: 5 }
  },
  {
    id: 'divine-light',
    name: 'Divine Light',
    emoji: '✝️',
    description: 'Heal and damage enemies',
    color: '#FFFACD',
    type: 'active',
    effect: { type: 'divine-light', damage: 25, cooldown: 10000, radius: 150, value: 30 }
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    emoji: '🌍',
    description: 'Shake the ground, stunning enemies',
    color: '#8B4513',
    type: 'active',
    effect: { type: 'earthquake', damage: 20, duration: 2000, cooldown: 9000, radius: 250 }
  },
  {
    id: 'vampire',
    name: 'Vampire Form',
    emoji: '🦇',
    description: 'Passive: +20% lifesteal',
    color: '#800020',
    type: 'passive',
    effect: { type: 'vampire', value: 20 }
  },
  {
    id: 'berserker',
    name: 'Berserker',
    emoji: '⚔️',
    description: 'Passive: +15 damage',
    color: '#B22222',
    type: 'passive',
    effect: { type: 'berserker', value: 15 }
  },
  {
    id: 'guardian-angel',
    name: 'Guardian Angel',
    emoji: '👼',
    description: 'Passive: Revive once at 50% HP',
    color: '#F0E68C',
    type: 'passive',
    effect: { type: 'guardian-angel', value: 50 }
  },
  {
    id: 'necromancy',
    name: 'Necromancy',
    emoji: '💀',
    description: 'Passive: Enemies spawn minions for you',
    color: '#2F4F4F',
    type: 'passive',
    effect: { type: 'necromancy', value: 25 }
  }
];
