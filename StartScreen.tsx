import { useState } from 'react';
import { Button } from './ui/button';
import { Milk, Zap, Target, Skull, ShoppingBag, Coins, Trophy, UserPlus, LogOut, RotateCcw } from 'lucide-react';
import { Difficulty } from '../types/game';

interface StartScreenProps {
  onStart: (difficulty: Difficulty, reverse?: boolean, localCoop?: boolean) => void;
  totalCoins: number;
  onOpenShop: () => void;
  onOpenAchievements: () => void;
  onOpenFriends: () => void;
  onLogout: () => void;
  username: string;
}

export function StartScreen({ onStart, totalCoins, onOpenShop, onOpenAchievements, onOpenFriends, onLogout, username }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  const difficulties = [
    {
      value: 'easy' as Difficulty,
      label: 'Easy',
      icon: Zap,
      color: 'from-green-400 to-blue-400',
      description: 'More health, less enemy damage'
    },
    {
      value: 'normal' as Difficulty,
      label: 'Normal',
      icon: Target,
      color: 'from-yellow-400 to-orange-400',
      description: 'Balanced difficulty'
    },
    {
      value: 'hard' as Difficulty,
      label: 'Hard',
      icon: Skull,
      color: 'from-red-500 to-purple-600',
      description: 'More enemies, more damage!'
    },
    {
      value: 'milk' as Difficulty,
      label: 'MILK 🥛',
      icon: Skull,
      color: 'from-purple-600 via-pink-600 to-red-600',
      description: 'Enemies are 250% STRONGER!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 bg-yellow-100 px-4 py-2 rounded-full">
            <Coins className="w-6 h-6 text-yellow-600" />
            <span className="text-xl">{totalCoins}</span>
          </div>
          
          <Button
            onClick={onOpenShop}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop
          </Button>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-6 rounded-full">
            <Milk className="w-20 h-20 text-white" />
          </div>
        </div>
        
        <h1 className="text-6xl">🥛 The Great Milk Heist 🥛</h1>
        
        <div className="space-y-4 text-lg text-gray-700">
          <p>
            <span className="text-2xl">😱</span> Oh no! Someone has stolen your precious milk!
          </p>
          <p>
            <span className="text-2xl">🦹</span> You must fight through 15 dangerous rooms to get it back!
          </p>
          <p>
            <span className="text-2xl">👹</span> Watch out for the bosses on rooms 5, 10, and 15!
          </p>
          <p>
            <span className="text-2xl">⚔️</span> Choose weapons and power-ups after each room!
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-2xl">Select Difficulty:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {difficulties.map((diff) => {
              const Icon = diff.icon;
              return (
                <button
                  key={diff.value}
                  onClick={() => setSelectedDifficulty(diff.value)}
                  className={`p-4 rounded-2xl border-4 transition-all transform hover:scale-105 ${
                    selectedDifficulty === diff.value
                      ? 'border-purple-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`bg-gradient-to-br ${diff.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xl">{diff.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{diff.description}</div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="pt-4 space-y-3">
          <Button
            onClick={() => onStart(selectedDifficulty, false, false)}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-2xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
          >
            🚀 Start Solo Quest!
          </Button>
          
          <Button
            onClick={() => onStart(selectedDifficulty, false, true)}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-12 py-6 text-2xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            👥 Local Co-op (2 Players)
          </Button>
          
          <div className="space-y-2">
            <Button
              onClick={() => onStart(selectedDifficulty, true, false)}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-2xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Reverse Mode (Room 15 → 1)
            </Button>
            <p className="text-xs text-center text-orange-600">
              ⚠️ Start with 15 random upgrades, lose one after each room!
            </p>
          </div>
        </div>
        
        <div className="pt-4 text-sm text-gray-600 space-y-2">
          <p>🎮 Controls: Arrow Keys or WASD to move (solo)</p>
          <p>🎮 Co-op Controls: WASD for P1, Arrow Keys for P2</p>
          <p>🎯 Auto-attacks closest enemy!</p>
          <p>🪙 Earn coins to buy cosmetics in the shop!</p>
          <p>🔄 Reverse Mode: Starts powerful but gets harder as upgrades are lost!</p>
          <p>🎮 Controller support for PS3/PS4/PS5/Xbox One/Series X|S</p>
        </div>
        
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={onOpenAchievements}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </Button>
          
          <Button
            onClick={onOpenFriends}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Friends
          </Button>
          
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        
        <div className="pt-2 text-sm text-gray-600">
          <p>Logged in as: <strong>{username}</strong></p>
        </div>
      </div>
    </div>
  );
}