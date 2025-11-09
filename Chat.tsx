import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, MessageSquare, X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { multiplayerManager } from '../utils/multiplayerManager';

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'text' | 'system';
}

interface ChatProps {
  sessionId: string;
  currentPlayerId: string;
  currentPlayerName: string;
  onSendMessage?: (message: string) => void;
}

export function Chat({ sessionId, currentPlayerId, currentPlayerName, onSendMessage }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add system message on mount
  useEffect(() => {
    addSystemMessage('Chat connected. Press Tab to open/close chat.');
    
    // Set up listener for incoming chat messages
    multiplayerManager.setOnChatMessage((msg) => {
      // Don't add our own messages (they're already added when sent)
      if (msg.playerId !== currentPlayerId) {
        const chatMessage: ChatMessage = {
          id: `${msg.playerId}-${msg.timestamp}`,
          playerId: msg.playerId,
          playerName: msg.playerName,
          message: msg.message,
          timestamp: msg.timestamp,
          type: 'text'
        };
        setMessages(prev => [...prev, chatMessage]);
      }
    });
  }, [currentPlayerId]);

  // Keyboard shortcut to toggle chat
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const addSystemMessage = (text: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      playerId: 'system',
      playerName: 'System',
      message: text,
      timestamp: Date.now(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const timestamp = Date.now();
    const newMessage: ChatMessage = {
      id: `${currentPlayerId}-${timestamp}`,
      playerId: currentPlayerId,
      playerName: currentPlayerName,
      message: inputMessage.trim(),
      timestamp,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Broadcast message to other players via multiplayer manager
    multiplayerManager.broadcastChatMessage(
      currentPlayerId, 
      currentPlayerName, 
      inputMessage.trim()
    );
    
    // Also call callback if provided
    if (onSendMessage) {
      onSendMessage(inputMessage.trim());
    }

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceChat = async () => {
    if (!isVoiceActive) {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          addSystemMessage('Voice chat is not supported in this browser.');
          return;
        }

        // Stop any existing stream first
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        // Check if we actually got audio tracks
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          addSystemMessage('No microphone found. Please check your audio devices.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        setIsVoiceActive(true);
        setIsMuted(false);
        addSystemMessage('Voice chat activated');
        
        // In a real implementation, you would set up WebRTC peer connections here
        // For now, we just show the UI
      } catch (error: any) {
        console.error('Error accessing microphone:', error);
        
        let errorMessage = 'Failed to access microphone. ';
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += 'Permission denied. Please allow microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage += 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage += 'Microphone is already in use by another application.';
        } else {
          errorMessage += 'Please check your audio settings and permissions.';
        }
        
        addSystemMessage(errorMessage);
      }
    } else {
      // Stop voice chat
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setIsVoiceActive(false);
      setIsMuted(false);
      addSystemMessage('Voice chat deactivated');
    }
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      addSystemMessage(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Chat notification badge when minimized
  const unreadCount = isMinimized ? messages.filter(m => m.timestamp > Date.now() - 5000).length : 0;

  return (
    <>
      {/* Chat toggle button (always visible) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-bold">Game Chat</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 max-h-80">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${
                        msg.type === 'system'
                          ? 'text-center text-xs text-gray-500 italic'
                          : msg.playerId === currentPlayerId
                          ? 'flex flex-col items-end'
                          : 'flex flex-col items-start'
                      }`}
                    >
                      {msg.type === 'text' && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-700">
                              {msg.playerName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <div
                            className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                              msg.playerId === currentPlayerId
                                ? 'bg-purple-500 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </>
                      )}
                      {msg.type === 'system' && <p>{msg.message}</p>}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Voice controls */}
                <div className="flex gap-2 p-3 bg-gray-100 border-t border-gray-200">
                  <button
                    onClick={toggleVoiceChat}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      isVoiceActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isVoiceActive ? 'Voice Active' : 'Enable Voice'}
                  </button>
                  {isVoiceActive && (
                    <button
                      onClick={toggleMute}
                      className={`py-2 px-4 rounded-lg transition-colors ${
                        isMuted
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={200}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Tab to toggle chat • Enter to send
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
