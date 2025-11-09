import { Cosmetic } from '../types/game';
import { COSMETICS } from '../data/cosmetics';
import { motion } from 'motion/react';
import { ShoppingBag, Check, Lock, Coins } from 'lucide-react';
import { Button } from './ui/button';

interface CosmeticsShopProps {
  coins: number;
  unlockedCosmetics: string[];
  currentCosmetic: string;
  onPurchase: (cosmetic: Cosmetic) => void;
  onEquip: (cosmeticId: string) => void;
  onClose: () => void;
  hasAllAchievements: boolean;
}

export function CosmeticsShop({
  coins,
  unlockedCosmetics,
  currentCosmetic,
  onPurchase,
  onEquip,
  onClose,
  hasAllAchievements
}: CosmeticsShopProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl mb-2">🛍️ Cosmetics Shop</h1>
            <p className="text-gray-600">Customize your milk hero!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-xl">{coins}</span>
            </div>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {COSMETICS.map((cosmetic) => {
            const isUnlocked = unlockedCosmetics.includes(cosmetic.id);
            const isEquipped = currentCosmetic === cosmetic.id;
            const canAfford = coins >= cosmetic.price;
            const requiresAchievements = cosmetic.requiresAllAchievements && !hasAllAchievements;

            return (
              <motion.div
                key={cosmetic.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative bg-gradient-to-br p-4 rounded-xl border-4 cursor-pointer
                  ${cosmetic.requiresAllAchievements && hasAllAchievements ? 'from-yellow-100 to-yellow-200 border-yellow-500 shadow-lg shadow-yellow-500/50' : ''}
                  ${isEquipped ? 'from-green-100 to-green-200 border-green-500' : !cosmetic.requiresAllAchievements ? 'from-gray-50 to-gray-100 border-gray-300' : ''}
                  ${!isUnlocked && (!canAfford || requiresAchievements) ? 'opacity-50' : ''}
                `}
              >
                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="text-center space-y-2">
                  <div className="text-6xl mb-2">{cosmetic.emoji}</div>
                  <div className="text-sm">{cosmetic.name}</div>
                  <p className="text-xs text-gray-600 min-h-[2.5rem]">{cosmetic.description}</p>

                  {isUnlocked ? (
                    isEquipped ? (
                      <div className="bg-green-500 text-white text-xs py-2 rounded-lg">
                        ✓ Equipped
                      </div>
                    ) : (
                      <Button
                        onClick={() => onEquip(cosmetic.id)}
                        size="sm"
                        className="w-full"
                      >
                        Equip
                      </Button>
                    )
                  ) : requiresAchievements ? (
                    <div className="bg-purple-500 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      All Achievements
                    </div>
                  ) : cosmetic.price === 0 ? (
                    <div className="bg-blue-500 text-white text-xs py-2 rounded-lg">
                      Free
                    </div>
                  ) : (
                    <Button
                      onClick={() => onPurchase(cosmetic)}
                      disabled={!canAfford}
                      size="sm"
                      className="w-full"
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
        </div>
      </motion.div>
    </div>
  );
}
