import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerPresenceService } from './player-presence.service';
import { CahSessionPlayerEntity } from '../../../../entities';

describe('PlayerPresenceService', () => {
  let service: PlayerPresenceService;
  let playerRepo: jest.Mocked<Repository<CahSessionPlayerEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerPresenceService,
        {
          provide: getRepositoryToken(CahSessionPlayerEntity),
          useValue: {
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PlayerPresenceService>(PlayerPresenceService);
    playerRepo = module.get(getRepositoryToken(CahSessionPlayerEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('playerConnected', () => {
    it('should register a new player connection', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.playerConnected('socket-1', 1, 'ABC123');

      expect(result.isReconnection).toBe(false);
      expect(result.previousSocketId).toBeUndefined();
      expect(playerRepo.update).toHaveBeenCalledWith(
        { session_player_id: 1 },
        { is_connected: true },
      );
    });

    it('should detect reconnection when player connects with new socket', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      const result = await service.playerConnected('socket-2', 1, 'ABC123');

      expect(result.isReconnection).toBe(true);
      expect(result.previousSocketId).toBe('socket-1');
    });

    it('should not be reconnection when same socket reconnects', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      const result = await service.playerConnected('socket-1', 1, 'ABC123');

      expect(result.isReconnection).toBe(false);
    });
  });

  describe('playerDisconnected', () => {
    it('should remove player connection and update database', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      const result = await service.playerDisconnected('socket-1');

      expect(result.playerId).toBe(1);
      expect(result.sessionCode).toBe('ABC123');
      expect(playerRepo.update).toHaveBeenCalledWith(
        { session_player_id: 1 },
        { is_connected: false },
      );
    });

    it('should return empty object for unknown socket', async () => {
      const result = await service.playerDisconnected('unknown-socket');

      expect(result.playerId).toBeUndefined();
      expect(result.sessionCode).toBeUndefined();
    });

    it('should return empty for old socket after player reconnected with new socket', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      await service.playerConnected('socket-2', 1, 'ABC123');

      jest.clearAllMocks();

      // Old socket was already removed during reconnection
      const result = await service.playerDisconnected('socket-1');

      expect(result.playerId).toBeUndefined();
      expect(result.sessionCode).toBeUndefined();
      expect(playerRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('updateHeartbeat', () => {
    it('should update heartbeat for connected socket', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      const result = await service.updateHeartbeat('socket-1');

      expect(result).toBe(true);
    });

    it('should return false for unknown socket', async () => {
      const result = await service.updateHeartbeat('unknown-socket');

      expect(result).toBe(false);
    });
  });

  describe('isPlayerConnected', () => {
    it('should return true for connected player', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');

      expect(service.isPlayerConnected(1)).toBe(true);
    });

    it('should return false for disconnected player', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      await service.playerDisconnected('socket-1');

      expect(service.isPlayerConnected(1)).toBe(false);
    });

    it('should return false for unknown player', () => {
      expect(service.isPlayerConnected(999)).toBe(false);
    });
  });

  describe('getConnectedPlayersInSession', () => {
    it('should return player IDs for a session', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      await service.playerConnected('socket-2', 2, 'ABC123');
      await service.playerConnected('socket-3', 3, 'XYZ789');

      const result = service.getConnectedPlayersInSession('ABC123');

      expect(result).toHaveLength(2);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).not.toContain(3);
    });

    it('should return empty array for session with no players', () => {
      const result = service.getConnectedPlayersInSession('EMPTY');

      expect(result).toHaveLength(0);
    });

    it('should be case-insensitive for session code', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'abc123');

      const result = service.getConnectedPlayersInSession('ABC123');

      expect(result).toContain(1);
    });
  });

  describe('getSocketIdForPlayer', () => {
    it('should return socket ID for connected player', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');

      expect(service.getSocketIdForPlayer(1)).toBe('socket-1');
    });

    it('should return undefined for disconnected player', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      await service.playerDisconnected('socket-1');

      expect(service.getSocketIdForPlayer(1)).toBeUndefined();
    });
  });

  describe('cleanupStaleConnections', () => {
    it('should clean up connections older than max age', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');

      const connection = service.getConnection('socket-1');
      if (connection) {
        connection.lastHeartbeat = new Date(Date.now() - 200000);
      }

      const result = await service.cleanupStaleConnections(60000);

      expect(result.cleaned).toBe(1);
      expect(result.playerIds).toContain(1);
      expect(service.isPlayerConnected(1)).toBe(false);
    });

    it('should not clean up recent connections', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');

      const result = await service.cleanupStaleConnections(60000);

      expect(result.cleaned).toBe(0);
      expect(service.isPlayerConnected(1)).toBe(true);
    });
  });

  describe('getConnectionStats', () => {
    it('should return connection statistics', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');
      await service.playerConnected('socket-2', 2, 'ABC123');
      await service.playerConnected('socket-3', 3, 'XYZ789');

      const stats = service.getConnectionStats();

      expect(stats.totalConnections).toBe(3);
      expect(stats.connectionsBySession['ABC123']).toBe(2);
      expect(stats.connectionsBySession['XYZ789']).toBe(1);
    });
  });

  describe('getConnection', () => {
    it('should return connection details', async () => {
      (playerRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.playerConnected('socket-1', 1, 'ABC123');

      const connection = service.getConnection('socket-1');

      expect(connection).toBeDefined();
      expect(connection?.playerId).toBe(1);
      expect(connection?.sessionCode).toBe('ABC123');
      expect(connection?.socketId).toBe('socket-1');
    });

    it('should return undefined for unknown socket', () => {
      const connection = service.getConnection('unknown');

      expect(connection).toBeUndefined();
    });
  });
});
