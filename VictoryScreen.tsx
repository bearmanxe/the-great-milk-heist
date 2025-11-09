import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Milk, Trophy, Sparkles, Coins, ShoppingBag } from 'lucide-react';

interface VictoryScreenProps {
  onRestart: () => void;
  onContinueEndless: () => void;
  onOpenShop: () => void;
  totalCoins: number;
}

export function VictoryScreen({ onRestart, onContinueEndless, onOpenShop, totalCoins }: VictoryScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex justify-center"
        >
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-full">
            <Trophy className="w-24 h-24 text-white" />
          </div>
        </motion.div>
        
        <h1 className="text-6xl">🎉 VICTORY! 🎉</h1>
        
        <div className="space-y-4 text-xl text-gray-700">
          <p className="flex items-center justify-center gap-2">
            <Milk className="w-8 h-8 text-blue-500" />
            You've recovered your precious milk!
          </p>
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            All 15 rooms cleared!
          </p>
          <p className="flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-purple-500" />
            All 3 bosses defeated!
          </p>
        </div>
        
        <div className="text-4xl py-4">
          🥛 THE MILK IS SAFE! 🥛
        </div>
        
        <div className="flex items-center justify-center gap-3 bg-yellow-100 px-6 py-3 rounded-full inline-flex mx-auto">
          <Coins className="w-8 h-8 text-yellow-600" />
          <span className="text-3xl">{totalCoins}</span>
          <span className="text-lg text-gray-600">Total Coins</span>
        </div>
        
        <div className="flex flex-col gap-4 pt-4">
          <Button
            onClick={onContinueEndless}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-2xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
          >
            🔥 Continue - ENDLESS MODE 🔥
          </Button>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onRestart}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-12 py-6 text-2xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
            >
              🔄 Play Again
            </Button>
            
            <Button
              onClick={onOpenShop}
              size="lg"
              variant="outline"
              className="px-8 py-6 text-xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-6 h-6 mr-2" />
              Shop
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
