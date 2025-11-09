import { supabase } from './supabaseClient';
import { projectId, publicAnonKey } from './supabase/info';
import { GameSession, MultiplayerPlayer, Enemy, Projectile } from '../types/game';
import { localMultiplayerServer } from './localMultiplayerServer';

export class MultiplayerManager {
  private sessionId: string | null = null;
  private playerId: string | null = null;
  private channel: any = null;
  private onPlayersUpdate?: (players: MultiplayerPlayer[]) => void;
  private onEnemiesUpdate?: (enemies: Enemy[]) => void;
  private onProjectilesUpdate?: (projectiles: Projectile[]) => void;
  private onRoomChange?: (roomNumber: number) => void;
  private onChatMessage?: (message: { playerId: string, playerName: string, message: string, timestamp: number }) => void;
  private heartbeatInterval: any = null;
  private useLocalServer: boolean = false;
  private static edgeFunctionTested: boolean = false;
  private static edgeFunctionAvailable: boolean = false;

  async createSession(hostPlayer: MultiplayerPlayer, difficulty: string, gameMode: string): Promise<string> {
    const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: GameSession = {
      id: sessionId,
      hostId: hostPlayer.id,
      difficulty: difficulty as any,
      gameMode: gameMode as any,
      currentRoomNumber: 1,
      maxPlayers: 4,
      playerCount: 1,
      status: 'waiting',
      createdAt: Date.now()
    };

    // Try Edge Function first, fall back to local server
    const url = `https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/create-session`;
    console.log('Creating session at:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session, hostPlayer })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to create session: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Session created successfully on remote server:', result);

      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = true;
      this.sessionId = sessionId;
      this.playerId = hostPlayer.id;
      this.useLocalServer = false;
      
      // Join the channel
      await this.joinChannel(sessionId, hostPlayer);
      
      return sessionId;
    } catch (error) {
      console.log('🏠 Using local multiplayer mode (Edge Function not deployed)');
      
      // Fall back to local server
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = false;
      this.useLocalServer = true;
      await localMultiplayerServer.createSession(session, hostPlayer);
      
      this.sessionId = sessionId;
      this.playerId = hostPlayer.id;
      
      // Join the channel for local mode too
      await this.joinChannel(sessionId, hostPlayer);
      
      console.log('Session created successfully on local server');
      return sessionId;
    }
  }

  async joinSession(sessionId: string, player: MultiplayerPlayer): Promise<GameSession> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/join-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId, player })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to join session');
      }

      const session = await response.json();
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = true;
      this.sessionId = sessionId;
      this.playerId = player.id;
      this.useLocalServer = false;
      
      // Join the channel
      await this.joinChannel(sessionId, player);
      
      return session;
    } catch (error) {
      console.log('🏠 Using local multiplayer mode (Edge Function not deployed)');
      
      // Fall back to local server
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = false;
      this.useLocalServer = true;
      const session = await localMultiplayerServer.joinSession(sessionId, player);
      
      this.sessionId = sessionId;
      this.playerId = player.id;
      
      // Join the channel
      await this.joinChannel(sessionId, player);
      
      return session;
    }
  }

  private async joinChannel(sessionId: string, player: MultiplayerPlayer) {
    // Create a realtime channel for this game session
    this.channel = supabase.channel(`game:${sessionId}`, {
      config: {
        broadcast: { self: true }
      }
    });

    // Listen for player updates
    this.channel.on('broadcast', { event: 'player-update' }, (payload: any) => {
      if (this.onPlayersUpdate && payload.payload.players) {
        this.onPlayersUpdate(payload.payload.players);
      }
    });

    // Listen for enemy updates (only host sends these)
    this.channel.on('broadcast', { event: 'enemies-update' }, (payload: any) => {
      if (this.onEnemiesUpdate && payload.payload.enemies) {
        this.onEnemiesUpdate(payload.payload.enemies);
      }
    });

    // Listen for projectile updates
    this.channel.on('broadcast', { event: 'projectiles-update' }, (payload: any) => {
      if (this.onProjectilesUpdate && payload.payload.projectiles) {
        this.onProjectilesUpdate(payload.payload.projectiles);
      }
    });

    // Listen for room changes
    this.channel.on('broadcast', { event: 'room-change' }, (payload: any) => {
      if (this.onRoomChange && payload.payload.roomNumber !== undefined) {
        this.onRoomChange(payload.payload.roomNumber);
      }
    });

    // Listen for chat messages
    this.channel.on('broadcast', { event: 'chat-message' }, (payload: any) => {
      if (this.onChatMessage && payload.payload) {
        this.onChatMessage(payload.payload);
      }
    });

    await this.channel.subscribe();

    // Start heartbeat to keep player active
    this.startHeartbeat(player);
  }

  private startHeartbeat(player: MultiplayerPlayer) {
    // Send player heartbeat every 2 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (this.sessionId && this.playerId) {
        if (this.useLocalServer) {
          // Use local server
          await localMultiplayerServer.updateHeartbeat(this.sessionId, this.playerId, player).catch(console.error);
        } else {
          // Use Edge Function
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/heartbeat`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              sessionId: this.sessionId, 
              playerId: this.playerId,
              player
            })
          }).catch(console.error);
        }
      }
    }, 2000);
  }

  broadcastPlayerUpdate(players: MultiplayerPlayer[]) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'player-update',
        payload: { players }
      });
    }
  }

  broadcastEnemiesUpdate(enemies: Enemy[]) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'enemies-update',
        payload: { enemies }
      });
    }
  }

  broadcastProjectilesUpdate(projectiles: Projectile[]) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'projectiles-update',
        payload: { projectiles }
      });
    }
  }

  broadcastRoomChange(roomNumber: number) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'room-change',
        payload: { roomNumber }
      });
    }
  }

  broadcastChatMessage(playerId: string, playerName: string, message: string) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: { 
          playerId, 
          playerName, 
          message, 
          timestamp: Date.now() 
        }
      });
    }
  }

  setOnPlayersUpdate(callback: (players: MultiplayerPlayer[]) => void) {
    this.onPlayersUpdate = callback;
  }

  setOnEnemiesUpdate(callback: (enemies: Enemy[]) => void) {
    this.onEnemiesUpdate = callback;
  }

  setOnProjectilesUpdate(callback: (projectiles: Projectile[]) => void) {
    this.onProjectilesUpdate = callback;
  }

  setOnRoomChange(callback: (roomNumber: number) => void) {
    this.onRoomChange = callback;
  }

  setOnChatMessage(callback: (message: { playerId: string, playerName: string, message: string, timestamp: number }) => void) {
    this.onChatMessage = callback;
  }

  async leaveSession() {
    if (this.sessionId && this.playerId) {
      // Notify server
      if (this.useLocalServer) {
        await localMultiplayerServer.leaveSession(this.sessionId, this.playerId).catch(console.error);
      } else {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/leave-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            sessionId: this.sessionId, 
            playerId: this.playerId 
          })
        }).catch(console.error);
      }
    }

    // Clean up
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.channel) {
      await this.channel.unsubscribe();
    }
    this.sessionId = null;
    this.playerId = null;
    this.channel = null;
    this.useLocalServer = false;
  }

  getSessionId() {
    return this.sessionId;
  }

  getPlayerId() {
    return this.playerId;
  }

  isHost() {
    return this.playerId !== null;
  }

  isUsingLocalServer() {
    return this.useLocalServer;
  }

  async getPlayers(sessionId: string): Promise<MultiplayerPlayer[]> {
    // Use local server if already determined or if Edge Function was tested and unavailable
    if (this.useLocalServer || (MultiplayerManager.edgeFunctionTested && !MultiplayerManager.edgeFunctionAvailable)) {
      return localMultiplayerServer.getPlayers(sessionId);
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/session/${sessionId}/players`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get players');
      }
      
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = true;
      return response.json();
    } catch (error) {
      // Fall back to local server
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = false;
      this.useLocalServer = true;
      return localMultiplayerServer.getPlayers(sessionId);
    }
  }

  async getSession(sessionId: string): Promise<GameSession | null> {
    // Use local server if already determined or if Edge Function was tested and unavailable
    if (this.useLocalServer || (MultiplayerManager.edgeFunctionTested && !MultiplayerManager.edgeFunctionAvailable)) {
      return localMultiplayerServer.getSession(sessionId);
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/session/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get session');
      }
      
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = true;
      return response.json();
    } catch (error) {
      // Fall back to local server
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = false;
      this.useLocalServer = true;
      return localMultiplayerServer.getSession(sessionId);
    }
  }

  async startGame(sessionId: string, hostId: string): Promise<number> {
    if (this.useLocalServer || (MultiplayerManager.edgeFunctionTested && !MultiplayerManager.edgeFunctionAvailable)) {
      const result = await localMultiplayerServer.startGame(sessionId, hostId);
      return result.enemyMultiplier;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/start-game`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId, hostId })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = true;
      const result = await response.json();
      return result.enemyMultiplier;
    } catch (error) {
      // Fall back to local server
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = false;
      this.useLocalServer = true;
      const result = await localMultiplayerServer.startGame(sessionId, hostId);
      return result.enemyMultiplier;
    }
  }

  async updateSessionSettings(sessionId: string, hostId: string, difficulty: any, gameMode: any): Promise<GameSession | null> {
    if (this.useLocalServer || (MultiplayerManager.edgeFunctionTested && !MultiplayerManager.edgeFunctionAvailable)) {
      return localMultiplayerServer.updateSettings(sessionId, hostId, difficulty, gameMode);
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server/multiplayer/update-settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId, hostId, difficulty, gameMode })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = true;
      return response.json();
    } catch (error) {
      // Fall back to local server
      MultiplayerManager.edgeFunctionTested = true;
      MultiplayerManager.edgeFunctionAvailable = false;
      this.useLocalServer = true;
      return localMultiplayerServer.updateSettings(sessionId, hostId, difficulty, gameMode);
    }
  }
}

export const multiplayerManager = new MultiplayerManager();