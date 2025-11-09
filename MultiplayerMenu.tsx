import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Users, Plus, LogIn, ArrowLeft } from 'lucide-react';
import { Difficulty } from '../types/game';
import { ControllerCursor } from './ControllerCursor';
import { ControllerHints } from './ControllerHints';
import { EdgeFunctionCheck } from './EdgeFunctionCheck';

interface MultiplayerMenuProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (sessionId: string, playerName: string) => void;
  onBack: () => void;
}

export function MultiplayerMenu({ onCreateGame, onJoinGame, onBack }: MultiplayerMenuProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  const handleCreate = () => {
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && sessionId.trim()) {
      onJoinGame(sessionId.trim(), playerName.trim());
    }
  };

  if (mode === 'menu') {
    return (
      <>
        <ControllerCursor />
        <ControllerHints />
        <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <Users className="w-20 h-20 mx-auto mb-4 text-purple-500" />
          <h1 className="text-white text-stroke-2 mb-2">CO-OP MODE</h1>
          <p className="text-gray-600 mb-4">
            Team up with up to 3 friends! More players = more enemies!
          </p>

          <div className="mb-6">
            <EdgeFunctionCheck onStatusChange={setIsServerAvailable} />
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              disabled={!isServerAvailable}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Plus className="w-6 h-6" />
              <span>Create Game</span>
            </button>

            <button
              onClick={() => setMode('join')}
              disabled={!isServerAvailable}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <LogIn className="w-6 h-6" />
              <span>Join Game</span>
            </button>

            <button
              onClick={onBack}
              className="w-full py-4 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl text-left text-sm">
            <p className="font-bold text-blue-900 mb-2">Enemy Scaling:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 2 Players: 2x enemies</li>
              <li>• 3 Players: 2.5x enemies</li>
              <li>• 4 Players: 3x enemies</li>
            </ul>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  if (mode === 'create') {
    return (
      <>
        <ControllerCursor />
        <ControllerHints />
        <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
        >
          <h1 className="text-white text-stroke-2 text-center mb-6">CREATE GAME</h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!playerName.trim()}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  if (mode === 'join') {
    return (
      <>
        <ControllerCursor />
        <ControllerHints />
        <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
        >
          <h1 className="text-white text-stroke-2 text-center mb-6">JOIN GAME</h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Game Code
              </label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter game code..."
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleJoin}
              disabled={!playerName.trim() || !sessionId.trim()}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  return null;
}
