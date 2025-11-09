import { GameSession, MultiplayerPlayer } from '../types/game';

/**
 * Local in-memory multiplayer server fallback
 * This is used when the Edge Function is not deployed
 * Note: This only works within a single browser session and won't support real multiplayer
 */
class LocalMultiplayerServer {
  private sessions: Map<string, GameSession> = new Map();
  private players: Map<string, Map<string, MultiplayerPlayer>> = new Map();
  private playerLists: Map<string, string[]> = new Map();

  async createSession(session: GameSession, hostPlayer: MultiplayerPlayer): Promise<{ success: boolean; session: GameSession }> {
    this.sessions.set(session.id, session);
    
    const playerMap = new Map<string, MultiplayerPlayer>();
    playerMap.set(hostPlayer.id, hostPlayer);
    this.players.set(session.id, playerMap);
    
    this.playerLists.set(session.id, [hostPlayer.id]);
    
    return { success: true, session };
  }

  async joinSession(sessionId: string, player: MultiplayerPlayer): Promise<GameSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.playerCount >= session.maxPlayers) {
      throw new Error('Session is full');
    }

    if (session.status === 'playing') {
      throw new Error('Game already started');
    }

    const playerMap = this.players.get(sessionId);
    const playerList = this.playerLists.get(sessionId);

    if (!playerMap || !playerList) {
      throw new Error('Session data corrupted');
    }

    if (playerList.includes(player.id)) {
      throw new Error('Already in session');
    }

    playerMap.set(player.id, player);
    playerList.push(player.id);

    session.playerCount = playerList.length;
    this.sessions.set(sessionId, session);

    return session;
  }

  async getSession(sessionId: string): Promise<GameSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getPlayers(sessionId: string): Promise<MultiplayerPlayer[]> {
    const playerMap = this.players.get(sessionId);
    if (!playerMap) {
      return [];
    }
    return Array.from(playerMap.values());
  }

  async leaveSession(sessionId: string, playerId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const playerMap = this.players.get(sessionId);
    const playerList = this.playerLists.get(sessionId);

    if (playerMap && playerList) {
      playerMap.delete(playerId);
      const updatedList = playerList.filter(id => id !== playerId);

      if (updatedList.length === 0) {
        // No players left, delete session
        this.sessions.delete(sessionId);
        this.players.delete(sessionId);
        this.playerLists.delete(sessionId);
      } else {
        this.playerLists.set(sessionId, updatedList);
        session.playerCount = updatedList.length;

        // If host left, assign new host
        if (session.hostId === playerId) {
          session.hostId = updatedList[0];
        }

        this.sessions.set(sessionId, session);
      }
    }
  }

  async updateHeartbeat(sessionId: string, playerId: string, player: MultiplayerPlayer): Promise<void> {
    const playerMap = this.players.get(sessionId);
    if (playerMap) {
      playerMap.set(playerId, { ...player, lastUpdate: Date.now() } as any);
    }
  }

  async startGame(sessionId: string, hostId: string): Promise<{ success: boolean; enemyMultiplier: number }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.hostId !== hostId) {
      throw new Error('Only host can start game');
    }

    session.status = 'playing';
    this.sessions.set(sessionId, session);

    const multiplier = this.getEnemyMultiplier(session.playerCount);
    return { success: true, enemyMultiplier: multiplier };
  }

  async updateSettings(sessionId: string, hostId: string, difficulty: any, gameMode: any): Promise<GameSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.hostId !== hostId) {
      throw new Error('Only host can update settings');
    }

    session.difficulty = difficulty;
    session.gameMode = gameMode;
    this.sessions.set(sessionId, session);

    return session;
  }

  private getEnemyMultiplier(playerCount: number): number {
    switch (playerCount) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 2.5;
      case 4: return 3;
      default: return 1;
    }
  }
}

export const localMultiplayerServer = new LocalMultiplayerServer();
