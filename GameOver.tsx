import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Skull, RotateCcw, Coins, ShoppingBag } from 'lucide-react';

interface GameOverProps {
  onRestart: () => void;
  onOpenShop: () => void;
  roomNumber: number;
  totalCoins: number;
}

export function GameOver({ onRestart, onOpenShop, roomNumber, totalCoins }: GameOverProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-300 via-orange-300 to-yellow-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex justify-center"
        >
          <div className="bg-gradient-to-br from-red-500 to-purple-600 p-8 rounded-full">
            <Skull className="w-24 h-24 text-white" />
          </div>
        </motion.div>
        
        <h1 className="text-6xl">💀 GAME OVER 💀</h1>
        
        <div className="space-y-4 text-xl text-gray-700">
          <p>Your quest for milk has ended...</p>
          <p className="text-3xl">😢</p>
          <p>You made it to <span className="text-3xl">Room {roomNumber}</span></p>
          <p className="text-sm text-gray-500">({15 - roomNumber} rooms remaining)</p>
        </div>
        
        <div className="flex items-center justify-center gap-3 bg-yellow-100 px-6 py-3 rounded-full inline-flex mx-auto">
          <Coins className="w-8 h-8 text-yellow-600" />
          <span className="text-3xl">{totalCoins}</span>
          <span className="text-lg text-gray-600">Total Coins</span>
        </div>
        
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={onRestart}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-2xl rounded-2xl shadow-lg transform hover:scale-105 transition-transform gap-2"
          >
            <RotateCcw className="w-6 h-6" />
            Try Again!
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
        
        <p className="text-sm text-gray-500 italic">
          "The milk thief wins this time..."
        </p>
      </motion.div>
    </div>
  );
}
