import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerInfo,
  RoundInfo,
  SubmissionInfo,
  GameStateInfo,
} from './game-events.types';
import { PlayerPresenceService } from './player-presence.service';
import { GameStateSyncService } from './game-state-sync.service';

interface SocketData {
  playerId?: number;
  sessionCode?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game',
  pingInterval: 25000,
  pingTimeout: 60000,
})
export class CahGameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(CahGameGateway.name);
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly presenceService: PlayerPresenceService,
    private readonly gameStateSyncService: GameStateSyncService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');

    this.cleanupInterval = setInterval(async () => {
      const { cleaned, playerIds } =
        await this.presenceService.cleanupStaleConnections(120000);
      if (cleaned > 0) {
        this.logger.log(
          `Cleaned up ${cleaned} stale connections: ${playerIds.join(', ')}`,
        );
      }
    }, 60000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const { playerId, sessionCode } =
      await this.presenceService.playerDisconnected(client.id);

    if (playerId && sessionCode) {
      const roomName = this.getRoomName(sessionCode);
      this.server.to(roomName).emit('playerDisconnected', { playerId });

      const connectedPlayers =
        this.presenceService.getConnectedPlayersInSession(sessionCode);
      this.emitPresenceUpdate(sessionCode, connectedPlayers);
    }
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string; playerId: number },
  ) {
    const { sessionCode, playerId } = data;
    const roomName = this.getRoomName(sessionCode);

    client.join(roomName);
    client.data = { playerId, sessionCode: roomName } as SocketData;

    const { isReconnection } = await this.presenceService.playerConnected(
      client.id,
      playerId,
      sessionCode,
    );

    if (isReconnection) {
      this.server.to(roomName).emit('playerReconnected', { playerId });
      // Send full game state to reconnecting player
      await this.emitGameStateToClient(client.id, sessionCode, playerId);
    }

    const connectedPlayers =
      this.presenceService.getConnectedPlayersInSession(sessionCode);
    this.emitPresenceUpdate(sessionCode, connectedPlayers);

    this.logger.log(
      `Player ${playerId} joined session ${sessionCode} (room: ${roomName}, reconnection: ${isReconnection})`,
    );

    return { success: true, room: roomName, isReconnection };
  }

  @SubscribeMessage('leaveSession')
  async handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string },
  ) {
    const roomName = this.getRoomName(data.sessionCode);
    client.leave(roomName);

    const { playerId, sessionCode } =
      await this.presenceService.playerDisconnected(client.id);

    client.data = {};

    if (playerId && sessionCode) {
      const connectedPlayers =
        this.presenceService.getConnectedPlayersInSession(sessionCode);
      this.emitPresenceUpdate(sessionCode, connectedPlayers);
    }

    this.logger.log(`Client ${client.id} left session ${data.sessionCode}`);

    return { success: true };
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const success = await this.presenceService.updateHeartbeat(client.id);
    return { success, timestamp: Date.now() };
  }

  @SubscribeMessage('getPresence')
  handleGetPresence(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string },
  ) {
    const connectedPlayers = this.presenceService.getConnectedPlayersInSession(
      data.sessionCode,
    );
    return { connectedPlayerIds: connectedPlayers };
  }

  @SubscribeMessage('requestGameState')
  async handleRequestGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string; playerId: number },
  ) {
    try {
      const gameState = await this.gameStateSyncService.getFullGameState(
        data.sessionCode,
        data.playerId,
      );
      client.emit('gameState', gameState as GameStateInfo);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to get game state for session ${data.sessionCode}: ${error}`,
      );
      client.emit('error', { message: 'Failed to retrieve game state' });
      return { success: false, error: 'Failed to retrieve game state' };
    }
  }

  emitPresenceUpdate(sessionCode: string, connectedPlayerIds: number[]) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('presenceUpdate', { connectedPlayerIds });
  }

  emitPlayerJoined(
    sessionCode: string,
    player: PlayerInfo,
    playerCount: number,
  ) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('playerJoined', { player, playerCount });
    this.logger.log(
      `Emitted playerJoined for ${player.nickname} to room ${roomName}`,
    );
  }

  emitPlayerLeft(sessionCode: string, playerId: number, playerCount: number) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('playerLeft', { playerId, playerCount });
    this.logger.log(`Emitted playerLeft for ${playerId} to room ${roomName}`);
  }

  emitGameStarted(
    sessionCode: string,
    round: RoundInfo,
    players: PlayerInfo[],
  ) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('gameStarted', { round, players });
    this.logger.log(`Emitted gameStarted to room ${roomName}`);
  }

  emitRoundStarted(sessionCode: string, round: RoundInfo) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('roundStarted', { round });
    this.logger.log(
      `Emitted roundStarted (round ${round.roundNumber}) to room ${roomName}`,
    );
  }

  emitCardSubmitted(
    sessionCode: string,
    playerId: number,
    submissionsCount: number,
    totalPlayers: number,
  ) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('cardSubmitted', {
      playerId,
      submissionsCount,
      totalPlayers,
    });
    this.logger.log(
      `Emitted cardSubmitted (${submissionsCount}/${totalPlayers}) to room ${roomName}`,
    );
  }

  emitJudgingStarted(sessionCode: string, submissions: SubmissionInfo[]) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('judgingStarted', { submissions });
    this.logger.log(`Emitted judgingStarted to room ${roomName}`);
  }

  emitWinnerSelected(
    sessionCode: string,
    winningSubmission: SubmissionInfo,
    winnerPlayerId: number,
    winnerNickname: string,
    players: PlayerInfo[],
    gameOver: boolean,
  ) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('winnerSelected', {
      winningSubmission,
      winnerPlayerId,
      winnerNickname,
      players,
      gameOver,
    });
    this.logger.log(
      `Emitted winnerSelected (winner: ${winnerNickname}) to room ${roomName}`,
    );
  }

  emitNextRound(sessionCode: string, round: RoundInfo) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('nextRound', { round });
    this.logger.log(
      `Emitted nextRound (round ${round.roundNumber}) to room ${roomName}`,
    );
  }

  emitGameEnded(
    sessionCode: string,
    winnerId: number,
    winnerNickname: string,
    finalScores: PlayerInfo[],
  ) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('gameEnded', {
      winnerId,
      winnerNickname,
      finalScores,
    });
    this.logger.log(
      `Emitted gameEnded (winner: ${winnerNickname}) to room ${roomName}`,
    );
  }

  emitError(sessionCode: string, message: string) {
    const roomName = this.getRoomName(sessionCode);
    this.server.to(roomName).emit('error', { message });
    this.logger.error(`Emitted error to room ${roomName}: ${message}`);
  }

  async emitGameState(sessionCode: string, playerId?: number): Promise<void> {
    try {
      const gameState = await this.gameStateSyncService.getFullGameState(
        sessionCode,
        playerId,
      );
      const roomName = this.getRoomName(sessionCode);
      this.server.to(roomName).emit('gameState', gameState as GameStateInfo);
      this.logger.log(`Emitted gameState to room ${roomName}`);
    } catch (error) {
      this.logger.error(
        `Failed to emit game state for session ${sessionCode}: ${error}`,
      );
    }
  }

  async emitGameStateToClient(
    clientId: string,
    sessionCode: string,
    playerId: number,
  ): Promise<void> {
    try {
      const gameState = await this.gameStateSyncService.getFullGameState(
        sessionCode,
        playerId,
      );
      const socket = this.server.sockets.sockets.get(clientId);
      if (socket) {
        socket.emit('gameState', gameState as GameStateInfo);
        this.logger.log(`Emitted gameState to client ${clientId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to emit game state to client ${clientId}: ${error}`,
      );
    }
  }

  private getRoomName(sessionCode: string): string {
    return `session:${sessionCode.toUpperCase()}`;
  }
}
