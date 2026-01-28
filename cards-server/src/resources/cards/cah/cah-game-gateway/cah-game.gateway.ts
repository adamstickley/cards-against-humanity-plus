import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
} from './game-events.types';

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
})
export class CahGameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(CahGameGateway.name);
  private playerSockets = new Map<number, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const socketData = client.data as SocketData;
    if (socketData.playerId && socketData.sessionCode) {
      this.playerSockets.delete(socketData.playerId);

      this.server.to(socketData.sessionCode).emit('playerDisconnected', {
        playerId: socketData.playerId,
      });
    }
  }

  @SubscribeMessage('joinSession')
  handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string; playerId: number },
  ) {
    const { sessionCode, playerId } = data;
    const roomName = this.getRoomName(sessionCode);

    client.join(roomName);
    client.data = { playerId, sessionCode: roomName } as SocketData;

    const existingSocketId = this.playerSockets.get(playerId);
    if (existingSocketId && existingSocketId !== client.id) {
      this.server.to(roomName).emit('playerReconnected', { playerId });
    }

    this.playerSockets.set(playerId, client.id);

    this.logger.log(
      `Player ${playerId} joined session ${sessionCode} (room: ${roomName})`,
    );

    return { success: true, room: roomName };
  }

  @SubscribeMessage('leaveSession')
  handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string },
  ) {
    const roomName = this.getRoomName(data.sessionCode);
    client.leave(roomName);

    const socketData = client.data as SocketData;
    if (socketData.playerId) {
      this.playerSockets.delete(socketData.playerId);
    }

    client.data = {};

    this.logger.log(`Client ${client.id} left session ${data.sessionCode}`);

    return { success: true };
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

  private getRoomName(sessionCode: string): string {
    return `session:${sessionCode.toUpperCase()}`;
  }
}
