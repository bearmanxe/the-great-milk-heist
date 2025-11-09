import { Weapon, PowerUp } from '../types/game';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { RefreshCw, Coins } from 'lucide-react';

interface UpgradeSelectionProps {
  options: (Weapon | PowerUp)[];
  onSelect: (option: Weapon | PowerUp) => void;
  onReroll: () => void;
  roomNumber: number;
  coins: number;
  canReroll: boolean;
}

export function UpgradeSelection({ options, onSelect, onReroll, roomNumber, coins, canReroll }: UpgradeSelectionProps) {
  const isWeapon = (option: Weapon | PowerUp): option is Weapon => {
    return 'damage' in option && 'attackSpeed' in option && 'range' in option;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl">🎉 Room {roomNumber} Complete! 🎉</h2>
          <p className="text-2xl text-gray-700">Choose your reward:</p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-xl font-bold">{coins}</span>
            </div>
            <Button
              onClick={onReroll}
              disabled={!canReroll || coins < 10}
              variant={canReroll && coins >= 10 ? "default" : "secondary"}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reroll (10 🪙)
            </Button>
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
              <Card className="p-6 hover:shadow-2xl transition-shadow cursor-pointer border-4 hover:border-yellow-400 bg-white h-full flex flex-col">
                <div className="text-center space-y-4 flex-1">
                  <div className="text-6xl">{option.emoji}</div>
                  <h3 className="text-2xl" style={{ color: option.color }}>
                    {option.name}
                  </h3>
                  <p className="text-gray-600">{option.description}</p>
                  
                  {isWeapon(option) ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between px-4">
                        <span>💥 Damage:</span>
                        <span>{option.damage}</span>
                      </div>
                      <div className="flex justify-between px-4">
                        <span>⚡ Speed:</span>
                        <span>{option.attackSpeed.toFixed(1)}x</span>
                      </div>
                      <div className="flex justify-between px-4">
                        <span>🎯 Range:</span>
                        <span>{option.range}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3">
                      <p className="text-sm">
                        {option.effect.type === 'health' && '❤️ Instant Health'}
                        {option.effect.type === 'maxHealth' && '💪 Max Health Up'}
                        {option.effect.type === 'speed' && '⚡ Speed Up'}
                        {option.effect.type === 'damage' && '⚔️ Damage Up'}
                        {option.effect.type === 'defense' && '🛡️ Defense Up'}
                        {option.effect.type === 'lifesteal' && '🧛 Lifesteal'}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => onSelect(option)}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Choose This!
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
