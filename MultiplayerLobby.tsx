import { useState, useEffect } from 'react';
import { MultiplayerPlayer, GameSession, Difficulty, GameMode } from '../types/game';
import { motion } from 'motion/react';
import { Users, Copy, Check, Play, LogOut, Crown, Settings } from 'lucide-react';
import { multiplayerManager } from '../utils/multiplayerManager';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Chat } from './Chat';
import { ControllerCursor } from './ControllerCursor';
import { ControllerHints } from './ControllerHints';

interface MultiplayerLobbyProps {
  session: GameSession;
  currentPlayer: MultiplayerPlayer;
  isHost: boolean;
  onStartGame: (enemyMultiplier: number) => void;
  onLeaveLobby: () => void;
}

const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF'];

export function MultiplayerLobby({ session, currentPlayer, isHost, onStartGame, onLeaveLobby }: MultiplayerLobbyProps) {
  // Ensure currentPlayer has a color
  const playerWithColor = {
    ...currentPlayer,
    color: currentPlayer.color || PLAYER_COLORS[0]
  };
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([playerWithColor]);
  const [copied, setCopied] = useState(false);
  const [currentSession, setCurrentSession] = useState<GameSession>(session);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    // Poll for players and session updates
    const interval = setInterval(async () => {
      try {
        // Fetch players using multiplayerManager (handles both local and remote)
        const playersData = await multiplayerManager.getPlayers(session.id);
        // Ensure each player has a color assigned
        const playersWithColors = playersData.map((player: MultiplayerPlayer, index: number) => ({
          ...player,
          color: player.color || PLAYER_COLORS[index % PLAYER_COLORS.length]
        }));
        setPlayers(playersWithColors);

        // Fetch session updates (for settings changes and game start)
        const sessionData = await multiplayerManager.getSession(session.id);
        if (sessionData) {
          setCurrentSession(sessionData);
          
          // If game started, transition to playing
          if (sessionData.status === 'playing' && !isHost) {
            const enemyMultiplier = getEnemyMultiplierValue(sessionData.playerCount);
            onStartGame(enemyMultiplier);
          }
        }
      } catch (error) {
        // Errors are handled silently - multiplayerManager auto-falls back to local mode
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.id, isHost]);

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(session.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = session.id;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        alert(`Code: ${session.id}\n\nCould not copy automatically. Please copy manually.`);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleStartGame = async () => {
    try {
      const enemyMultiplier = await multiplayerManager.startGame(session.id, currentPlayer.id);
      onStartGame(enemyMultiplier);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const getEnemyMultiplier = (count: number) => {
    switch (count) {
      case 2: return '2x';
      case 3: return '2.5x';
      case 4: return '3x';
      default: return '1x';
    }
  };

  const getEnemyMultiplierValue = (count: number) => {
    switch (count) {
      case 2: return 2;
      case 3: return 2.5;
      case 4: return 3;
      default: return 1;
    }
  };

  const updateSessionSettings = async (difficulty: Difficulty, gameMode: GameMode) => {
    try {
      const updatedSession = await multiplayerManager.updateSessionSettings(
        session.id,
        currentPlayer.id,
        difficulty,
        gameMode
      );
      
      if (updatedSession) {
        setCurrentSession(updatedSession);
        setIsEditingSettings(false);
      }
    } catch (error) {
      // Errors are handled silently - multiplayerManager auto-falls back to local mode
    }
  };

  return (
    <>
      <ControllerCursor />
      <ControllerHints />
      <Chat 
        sessionId={session.id}
        currentPlayerId={currentPlayer.id}
        currentPlayerName={currentPlayer.name}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8"
        >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12 text-purple-500" />
            <h1 className="text-white text-stroke-2">MULTIPLAYER LOBBY</h1>
          </div>
          
          {multiplayerManager.isUsingLocalServer() && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-800">
                🏠 <strong>Local Mode:</strong> Players must open lobby in same browser
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Share this code with friends:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="px-4 py-2 bg-white rounded-lg border-2 border-purple-300">
                {session.id}
              </code>
              <button
                onClick={copySessionId}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-4 justify-center text-sm items-center flex-wrap">
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="font-bold text-blue-700">Difficulty: </span>
              <span className="text-blue-900 uppercase">{currentSession.difficulty}</span>
            </div>
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <span className="font-bold text-green-700">Mode: </span>
              <span className="text-green-900 uppercase">{currentSession.gameMode}</span>
            </div>
            <div className="bg-orange-100 px-4 py-2 rounded-lg">
              <span className="font-bold text-orange-700">Enemies: </span>
              <span className="text-orange-900">{getEnemyMultiplier(players.length)}</span>
            </div>
            {isHost && (
              <button
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                title="Edit Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingSettings && isHost && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-purple-50 rounded-lg p-4 mt-4"
            >
              <h3 className="font-bold text-purple-900 mb-3 text-center">Game Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={currentSession.difficulty}
                    onChange={(e) => updateSessionSettings(e.target.value as Difficulty, currentSession.gameMode)}
                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="milk">MILK (250%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mode</label>
                  <select
                    value={currentSession.gameMode}
                    onChange={(e) => updateSessionSettings(currentSession.difficulty, e.target.value as GameMode)}
                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="endless">Endless</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="text-center text-gray-700 mb-4">
            Players ({players.length}/{session.maxPlayers})
          </h2>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4 p-4 rounded-xl border-2 transition-colors"
              style={{
                borderColor: player.color,
                backgroundColor: `${player.color}20`
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: player.color }}
              >
                {player.cosmetic}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{player.name}</p>
                  {player.isHost && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {player.health}/{player.maxHealth} HP
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onLeaveLobby}
            className="flex-1 py-4 px-6 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Leave Lobby
          </button>
          
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={players.length < 1}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          )}
        </div>

        {!isHost && (
          <p className="text-center text-gray-600 text-sm mt-4">
            Waiting for host to start the game...
          </p>
        )}
      </motion.div>
    </div>
    </>
  );
}
