import { Weapon, PowerUp } from '../types/game';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface DowngradeSelectionProps {
  activeUpgrades: (Weapon | PowerUp)[];
  onSelect: (option: Weapon | PowerUp) => void;
  roomNumber: number;
}

export function DowngradeSelection({ activeUpgrades, onSelect, roomNumber }: DowngradeSelectionProps) {
  const isWeapon = (option: Weapon | PowerUp): option is Weapon => {
    return 'damage' in option && 'attackSpeed' in option && 'range' in option;
  };

  // Show 3 random upgrades to choose from to lose
  const shuffled = [...activeUpgrades].sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, Math.min(3, activeUpgrades.length));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-12 h-12 text-red-600" />
            <h2 className="text-5xl">⚠️ Room {roomNumber} Complete! ⚠️</h2>
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <p className="text-2xl text-gray-700">Choose an upgrade to LOSE:</p>
          <p className="text-lg text-gray-600">
            In Reverse Mode, you get weaker as you progress!
          </p>
          <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-sm">
              💡 Active Upgrades Remaining: <strong>{activeUpgrades.length}</strong>
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-2xl transition-shadow cursor-pointer border-4 hover:border-red-400 bg-white h-full flex flex-col">
                <div className="text-center space-y-4 flex-1">
                  <div className="text-6xl opacity-50">{option.emoji}</div>
                  <h3 className="text-2xl line-through" style={{ color: option.color }}>
                    {option.name}
                  </h3>
                  <p className="text-gray-600">{option.description}</p>
                  
                  {isWeapon(option) ? (
                    <div className="space-y-2 text-sm bg-red-50 rounded-lg p-3">
                      <div className="flex justify-between px-4">
                        <span>💥 Damage:</span>
                        <span className="line-through">{option.damage}</span>
                      </div>
                      <div className="flex justify-between px-4">
                        <span>⚡ Speed:</span>
                        <span className="line-through">{option.attackSpeed.toFixed(1)}x</span>
                      </div>
                      <div className="flex justify-between px-4">
                        <span>🎯 Range:</span>
                        <span className="line-through">{option.range}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-3">
                      <p className="text-sm">
                        {option.effect.type === 'health' && '❤️ Health Boost'}
                        {option.effect.type === 'maxHealth' && '💪 Max Health'}
                        {option.effect.type === 'speed' && '⚡ Speed'}
                        {option.effect.type === 'damage' && '⚔️ Damage'}
                        {option.effect.type === 'defense' && '🛡️ Defense'}
                        {option.effect.type === 'lifesteal' && '🧛 Lifesteal'}
                        {option.effect.type === 'piercing' && '➡️ Piercing'}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => onSelect(option)}
                  className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  😢 Lose This Upgrade
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
