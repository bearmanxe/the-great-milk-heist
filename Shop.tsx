import { useState } from 'react';
import { Cosmetic } from '../types/game';
import { COSMETICS } from '../data/cosmetics';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Check, Lock, Coins, Package, Sword, Sparkles, Zap, Target, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface ShopProps {
  coins: number;
  unlockedCosmetics: string[];
  currentCosmetic: string;
  weaponUpgrades: {
    damage: number;
    attackSpeed: number;
    range: number;
    knockback: number;
  };
  onPurchaseCosmetic: (cosmetic: Cosmetic) => void;
  onUpgradeWeapon: (stat: 'damage' | 'attackSpeed' | 'range' | 'knockback') => void;
  onPurchaseLootBox: (boxType: 'basic' | 'premium' | 'legendary') => void;
  onEquip: (cosmeticId: string) => void;
  onClose: () => void;
  hasAllAchievements: boolean;
}

type TabType = 'cosmetics' | 'weapons' | 'lootboxes';

const LOOT_BOXES = [
  {
    id: 'basic',
    name: 'Basic Box',
    emoji: '📦',
    price: 50,
    description: 'Contains 1 random cosmetic',
    gradient: 'from-gray-100 to-gray-200'
  },
  {
    id: 'premium',
    name: 'Premium Box',
    emoji: '🎁',
    price: 150,
    description: 'Contains 1 rare cosmetic',
    gradient: 'from-purple-100 to-pink-200'
  },
  {
    id: 'legendary',
    name: 'Legendary Box',
    emoji: '💎',
    price: 300,
    description: 'Contains 1 legendary cosmetic',
    gradient: 'from-yellow-100 to-orange-200'
  }
];

const WEAPON_UPGRADE_COSTS = {
  damage: 50,
  attackSpeed: 75,
  range: 40,
  knockback: 60
};

export function Shop({
  coins,
  unlockedCosmetics,
  currentCosmetic,
  weaponUpgrades,
  onPurchaseCosmetic,
  onUpgradeWeapon,
  onPurchaseLootBox,
  onEquip,
  onClose,
  hasAllAchievements
}: ShopProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cosmetics');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-1">🛍️ Milk Shop</h1>
            <p className="text-gray-600 text-sm">Upgrade your arsenal!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-xl font-bold">{coins}</span>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('cosmetics')}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
              activeTab === 'cosmetics'
                ? 'border-b-2 border-purple-500 text-purple-600 font-bold'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Cosmetics
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
              activeTab === 'weapons'
                ? 'border-b-2 border-purple-500 text-purple-600 font-bold'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Sword className="w-4 h-4" />
            Weapons
          </button>
          <button
            onClick={() => setActiveTab('lootboxes')}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
              activeTab === 'lootboxes'
                ? 'border-b-2 border-purple-500 text-purple-600 font-bold'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Loot Boxes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'cosmetics' && (
              <motion.div
                key="cosmetics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
              >
                {COSMETICS.map((cosmetic) => {
                  const isUnlocked = unlockedCosmetics.includes(cosmetic.id);
                  const isEquipped = currentCosmetic === cosmetic.emoji;
                  const canAfford = coins >= cosmetic.price;
                  const requiresAchievements = cosmetic.requiresAllAchievements && !hasAllAchievements;

                  return (
                    <motion.div
                      key={cosmetic.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative bg-gradient-to-br p-3 rounded-xl border-2 cursor-pointer
                        ${cosmetic.requiresAllAchievements && hasAllAchievements ? 'from-yellow-100 to-yellow-200 border-yellow-500 shadow-lg shadow-yellow-500/50' : ''}
                        ${isEquipped ? 'from-green-100 to-green-200 border-green-500 shadow-lg' : !cosmetic.requiresAllAchievements ? 'from-gray-50 to-gray-100 border-gray-300' : ''}
                        ${!isUnlocked && (!canAfford || requiresAchievements) ? 'opacity-50' : ''}
                      `}
                    >
                      {isEquipped && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div className="text-center space-y-1">
                        <div className="text-4xl mb-1">{cosmetic.emoji}</div>
                        <div className="text-xs font-bold">{cosmetic.name}</div>
                        <p className="text-xs text-gray-600 line-clamp-2">{cosmetic.description}</p>

                        {isUnlocked ? (
                          isEquipped ? (
                            <div className="bg-green-500 text-white text-xs py-1 rounded-lg">
                              ✓ Equipped
                            </div>
                          ) : (
                            <Button
                              onClick={() => onEquip(cosmetic.id)}
                              size="sm"
                              className="w-full h-7 text-xs"
                            >
                              Equip
                            </Button>
                          )
                        ) : requiresAchievements ? (
                          <div className="bg-purple-500 text-white text-xs py-1 rounded-lg flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />
                            All Achievements
                          </div>
                        ) : cosmetic.price === 0 ? (
                          <div className="bg-blue-500 text-white text-xs py-1 rounded-lg">
                            Free
                          </div>
                        ) : (
                          <Button
                            onClick={() => onPurchaseCosmetic(cosmetic)}
                            disabled={!canAfford}
                            size="sm"
                            className="w-full h-7 text-xs"
                            variant={canAfford ? "default" : "secondary"}
                          >
                            {canAfford ? (
                              <span className="flex items-center gap-1 justify-center">
                                <Coins className="w-3 h-3" />
                                {cosmetic.price}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 justify-center">
                                <Lock className="w-3 h-3" />
                                {cosmetic.price}
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'weapons' && (
              <motion.div
                key="weapons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 mb-6">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Sword className="w-5 h-5 text-orange-600" />
                    Weapon Upgrades
                  </h3>
                  <p className="text-sm text-gray-700">
                    Permanently upgrade your weapon stats. These upgrades apply to all weapons!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Damage Upgrade */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-red-100 to-pink-200 p-6 rounded-2xl border-4 border-red-300 shadow-xl"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-2">⚔️</div>
                      <div className="text-2xl font-bold">Damage Boost</div>
                      <div className="text-4xl font-bold text-red-600">+{weaponUpgrades.damage}</div>
                      <p className="text-sm text-gray-700">Increase weapon damage by 5</p>

                      <Button
                        onClick={() => onUpgradeWeapon('damage')}
                        disabled={coins < WEAPON_UPGRADE_COSTS.damage}
                        size="lg"
                        className="w-full text-lg"
                        variant={coins >= WEAPON_UPGRADE_COSTS.damage ? "default" : "secondary"}
                      >
                        {coins >= WEAPON_UPGRADE_COSTS.damage ? (
                          <span className="flex items-center gap-2 justify-center">
                            <Coins className="w-5 h-5" />
                            {WEAPON_UPGRADE_COSTS.damage}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <Lock className="w-5 h-5" />
                            {WEAPON_UPGRADE_COSTS.damage}
                          </span>
                        )}
                      </Button>
                    </div>
                  </motion.div>

                  {/* Attack Speed Upgrade */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-yellow-100 to-orange-200 p-6 rounded-2xl border-4 border-yellow-300 shadow-xl"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-2">⚡</div>
                      <div className="text-2xl font-bold">Speed Boost</div>
                      <div className="text-4xl font-bold text-yellow-600">+{weaponUpgrades.attackSpeed.toFixed(1)}</div>
                      <p className="text-sm text-gray-700">Increase attack speed by 0.2</p>

                      <Button
                        onClick={() => onUpgradeWeapon('attackSpeed')}
                        disabled={coins < WEAPON_UPGRADE_COSTS.attackSpeed}
                        size="lg"
                        className="w-full text-lg"
                        variant={coins >= WEAPON_UPGRADE_COSTS.attackSpeed ? "default" : "secondary"}
                      >
                        {coins >= WEAPON_UPGRADE_COSTS.attackSpeed ? (
                          <span className="flex items-center gap-2 justify-center">
                            <Coins className="w-5 h-5" />
                            {WEAPON_UPGRADE_COSTS.attackSpeed}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <Lock className="w-5 h-5" />
                            {WEAPON_UPGRADE_COSTS.attackSpeed}
                          </span>
                        )}
                      </Button>
                    </div>
                  </motion.div>

                  {/* Range Upgrade */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-purple-100 to-blue-200 p-6 rounded-2xl border-4 border-purple-300 shadow-xl"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-2">🎯</div>
                      <div className="text-2xl font-bold">Range Boost</div>
                      <div className="text-4xl font-bold text-purple-600">+{weaponUpgrades.range}</div>
                      <p className="text-sm text-gray-700">Increase weapon range by 10</p>

                      <Button
                        onClick={() => onUpgradeWeapon('range')}
                        disabled={coins < WEAPON_UPGRADE_COSTS.range}
                        size="lg"
                        className="w-full text-lg"
                        variant={coins >= WEAPON_UPGRADE_COSTS.range ? "default" : "secondary"}
                      >
                        {coins >= WEAPON_UPGRADE_COSTS.range ? (
                          <span className="flex items-center gap-2 justify-center">
                            <Coins className="w-5 h-5" />
                            {WEAPON_UPGRADE_COSTS.range}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <Lock className="w-5 h-5" />
                            {WEAPON_UPGRADE_COSTS.range}
                          </span>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'lootboxes' && (
              <motion.div
                key="lootboxes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Loot Boxes
                  </h3>
                  <p className="text-sm text-gray-700">
                    Open loot boxes to get random cosmetics! Higher tier boxes have better chances of rare cosmetics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {LOOT_BOXES.map((box) => {
                    const canAfford = coins >= box.price;

                    return (
                      <motion.div
                        key={box.id}
                        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative bg-gradient-to-br ${box.gradient} p-6 rounded-2xl border-4 border-gray-300 cursor-pointer
                          ${!canAfford ? 'opacity-50' : 'shadow-xl'}
                        `}
                      >
                        <div className="text-center space-y-4">
                          <div className="text-8xl mb-2">{box.emoji}</div>
                          <div className="text-2xl font-bold">{box.name}</div>
                          <p className="text-sm text-gray-600">{box.description}</p>

                          <Button
                            onClick={() => onPurchaseLootBox(box.id as 'basic' | 'premium' | 'legendary')}
                            disabled={!canAfford}
                            size="lg"
                            className="w-full text-lg"
                            variant={canAfford ? "default" : "secondary"}
                          >
                            {canAfford ? (
                              <span className="flex items-center gap-2 justify-center">
                                <Coins className="w-5 h-5" />
                                {box.price}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 justify-center">
                                <Lock className="w-5 h-5" />
                                {box.price}
                              </span>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
