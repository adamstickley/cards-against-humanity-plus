import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahSessionPlayerEntity } from '../../../../entities';

interface PlayerConnection {
  socketId: string;
  playerId: number;
  sessionCode: string;
  connectedAt: Date;
  lastHeartbeat: Date;
}

@Injectable()
export class PlayerPresenceService {
  private readonly logger = new Logger(PlayerPresenceService.name);
  private connections = new Map<string, PlayerConnection>();
  private playerToSocket = new Map<number, string>();

  constructor(
    @InjectRepository(CahSessionPlayerEntity)
    private readonly playerRepo: Repository<CahSessionPlayerEntity>,
  ) {}

  async playerConnected(
    socketId: string,
    playerId: number,
    sessionCode: string,
  ): Promise<{ isReconnection: boolean; previousSocketId?: string }> {
    const now = new Date();
    const existingSocketId = this.playerToSocket.get(playerId);
    const isReconnection = !!existingSocketId && existingSocketId !== socketId;

    if (isReconnection && existingSocketId) {
      this.connections.delete(existingSocketId);
      this.logger.log(
        `Player ${playerId} reconnected (old socket: ${existingSocketId}, new: ${socketId})`,
      );
    }

    const connection: PlayerConnection = {
      socketId,
      playerId,
      sessionCode: sessionCode.toUpperCase(),
      connectedAt: now,
      lastHeartbeat: now,
    };

    this.connections.set(socketId, connection);
    this.playerToSocket.set(playerId, socketId);

    await this.updatePlayerConnectionStatus(playerId, true);

    this.logger.log(
      `Player ${playerId} connected to session ${sessionCode} (socket: ${socketId})`,
    );

    return {
      isReconnection,
      previousSocketId: isReconnection ? existingSocketId : undefined,
    };
  }

  async playerDisconnected(socketId: string): Promise<{
    playerId?: number;
    sessionCode?: string;
  }> {
    const connection = this.connections.get(socketId);

    if (!connection) {
      return {};
    }

    const { playerId, sessionCode } = connection;

    const currentSocketId = this.playerToSocket.get(playerId);
    if (currentSocketId === socketId) {
      this.playerToSocket.delete(playerId);
      await this.updatePlayerConnectionStatus(playerId, false);
    }

    this.connections.delete(socketId);

    this.logger.log(
      `Player ${playerId} disconnected from session ${sessionCode} (socket: ${socketId})`,
    );

    return { playerId, sessionCode };
  }

  async updateHeartbeat(socketId: string): Promise<boolean> {
    const connection = this.connections.get(socketId);

    if (!connection) {
      return false;
    }

    connection.lastHeartbeat = new Date();
    return true;
  }

  getConnection(socketId: string): PlayerConnection | undefined {
    return this.connections.get(socketId);
  }

  getSocketIdForPlayer(playerId: number): string | undefined {
    return this.playerToSocket.get(playerId);
  }

  isPlayerConnected(playerId: number): boolean {
    return this.playerToSocket.has(playerId);
  }

  getConnectedPlayersInSession(sessionCode: string): number[] {
    const normalizedCode = sessionCode.toUpperCase();
    const playerIds: number[] = [];

    for (const connection of this.connections.values()) {
      if (connection.sessionCode === normalizedCode) {
        playerIds.push(connection.playerId);
      }
    }

    return playerIds;
  }

  async getOnlinePlayersForSession(
    sessionCode: string,
  ): Promise<CahSessionPlayerEntity[]> {
    const connectedPlayerIds = this.getConnectedPlayersInSession(sessionCode);

    if (connectedPlayerIds.length === 0) {
      return [];
    }

    return this.playerRepo
      .createQueryBuilder('player')
      .innerJoin('player.session', 'session')
      .where('session.code = :code', { code: sessionCode.toUpperCase() })
      .andWhere('player.session_player_id IN (:...ids)', {
        ids: connectedPlayerIds,
      })
      .getMany();
  }

  async cleanupStaleConnections(
    maxAgeMs: number = 60000,
  ): Promise<{ cleaned: number; playerIds: number[] }> {
    const now = Date.now();
    const staleSocketIds: string[] = [];
    const stalePlayerIds: number[] = [];

    for (const [socketId, connection] of this.connections.entries()) {
      const age = now - connection.lastHeartbeat.getTime();
      if (age > maxAgeMs) {
        staleSocketIds.push(socketId);
        stalePlayerIds.push(connection.playerId);
      }
    }

    for (const socketId of staleSocketIds) {
      await this.playerDisconnected(socketId);
    }

    if (staleSocketIds.length > 0) {
      this.logger.warn(
        `Cleaned up ${staleSocketIds.length} stale connections: ${stalePlayerIds.join(', ')}`,
      );
    }

    return { cleaned: staleSocketIds.length, playerIds: stalePlayerIds };
  }

  private async updatePlayerConnectionStatus(
    playerId: number,
    isConnected: boolean,
  ): Promise<void> {
    try {
      await this.playerRepo.update(
        { session_player_id: playerId },
        { is_connected: isConnected },
      );
    } catch (error) {
      this.logger.error(
        `Failed to update connection status for player ${playerId}: ${error}`,
      );
    }
  }

  getConnectionStats(): {
    totalConnections: number;
    connectionsBySession: Record<string, number>;
  } {
    const connectionsBySession: Record<string, number> = {};

    for (const connection of this.connections.values()) {
      const code = connection.sessionCode;
      connectionsBySession[code] = (connectionsBySession[code] || 0) + 1;
    }

    return {
      totalConnections: this.connections.size,
      connectionsBySession,
    };
  }
}
