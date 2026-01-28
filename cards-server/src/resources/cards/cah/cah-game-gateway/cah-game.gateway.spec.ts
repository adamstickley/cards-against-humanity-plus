import { Test, TestingModule } from '@nestjs/testing';
import { CahGameGateway } from './cah-game.gateway';
import { PlayerPresenceService } from './player-presence.service';

describe('CahGameGateway', () => {
  let gateway: CahGameGateway;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockPresenceService = {
    playerConnected: jest.fn().mockResolvedValue({ isReconnection: false }),
    playerDisconnected: jest.fn().mockResolvedValue({}),
    updateHeartbeat: jest.fn().mockResolvedValue(true),
    getConnectedPlayersInSession: jest.fn().mockReturnValue([]),
    cleanupStaleConnections: jest
      .fn()
      .mockResolvedValue({ cleaned: 0, playerIds: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CahGameGateway,
        {
          provide: PlayerPresenceService,
          useValue: mockPresenceService,
        },
      ],
    }).compile();

    gateway = module.get<CahGameGateway>(CahGameGateway);
    (gateway as unknown as { server: typeof mockServer }).server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const mockClient = { id: 'test-socket-id' };
      expect(() => gateway.handleConnection(mockClient as never)).not.toThrow();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnection without player data', async () => {
      mockPresenceService.playerDisconnected.mockResolvedValue({});
      const mockClient = { id: 'test-socket-id', data: {} };
      await expect(
        gateway.handleDisconnect(mockClient as never),
      ).resolves.not.toThrow();
    });

    it('should emit playerDisconnected when player data exists', async () => {
      mockPresenceService.playerDisconnected.mockResolvedValue({
        playerId: 1,
        sessionCode: 'ABC123',
      });
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([2, 3]);

      const mockClient = { id: 'test-socket-id', data: {} };

      await gateway.handleDisconnect(mockClient as never);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('playerDisconnected', {
        playerId: 1,
      });
      expect(mockServer.emit).toHaveBeenCalledWith('presenceUpdate', {
        connectedPlayerIds: [2, 3],
      });
    });
  });

  describe('handleJoinSession', () => {
    it('should join room and store player data', async () => {
      mockPresenceService.playerConnected.mockResolvedValue({
        isReconnection: false,
      });
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1]);

      const mockClient = {
        id: 'test-socket-id',
        data: {},
        join: jest.fn(),
      };

      const result = await gateway.handleJoinSession(mockClient as never, {
        sessionCode: 'ABC123',
        playerId: 1,
      });

      expect(mockClient.join).toHaveBeenCalledWith('session:ABC123');
      expect(mockClient.data).toEqual({
        playerId: 1,
        sessionCode: 'session:ABC123',
      });
      expect(result).toEqual({
        success: true,
        room: 'session:ABC123',
        isReconnection: false,
      });
    });

    it('should emit playerReconnected on reconnection', async () => {
      mockPresenceService.playerConnected.mockResolvedValue({
        isReconnection: true,
      });
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1]);

      const mockClient = {
        id: 'test-socket-id',
        data: {},
        join: jest.fn(),
      };

      await gateway.handleJoinSession(mockClient as never, {
        sessionCode: 'ABC123',
        playerId: 1,
      });

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('playerReconnected', {
        playerId: 1,
      });
    });
  });

  describe('handleLeaveSession', () => {
    it('should leave room and clear player data', async () => {
      mockPresenceService.playerDisconnected.mockResolvedValue({
        playerId: 1,
        sessionCode: 'ABC123',
      });
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([]);

      const mockClient = {
        id: 'test-socket-id',
        data: { playerId: 1 },
        leave: jest.fn(),
      };

      const result = await gateway.handleLeaveSession(mockClient as never, {
        sessionCode: 'ABC123',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('session:ABC123');
      expect(mockClient.data).toEqual({});
      expect(result).toEqual({ success: true });
    });
  });

  describe('handleHeartbeat', () => {
    it('should update heartbeat via presence service', async () => {
      mockPresenceService.updateHeartbeat.mockResolvedValue(true);
      const mockClient = { id: 'test-socket-id' };

      const result = await gateway.handleHeartbeat(mockClient as never);

      expect(result.success).toBe(true);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('handleGetPresence', () => {
    it('should return connected player IDs', () => {
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([
        1, 2, 3,
      ]);
      const mockClient = { id: 'test-socket-id' };

      const result = gateway.handleGetPresence(mockClient as never, {
        sessionCode: 'ABC123',
      });

      expect(result).toEqual({ connectedPlayerIds: [1, 2, 3] });
    });
  });

  describe('emitPlayerJoined', () => {
    it('should emit playerJoined event to room', () => {
      const player = {
        playerId: 1,
        nickname: 'TestPlayer',
        score: 0,
        isHost: false,
        isConnected: true,
      };

      gateway.emitPlayerJoined('ABC123', player, 2);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('playerJoined', {
        player,
        playerCount: 2,
      });
    });
  });

  describe('emitPlayerLeft', () => {
    it('should emit playerLeft event to room', () => {
      gateway.emitPlayerLeft('ABC123', 1, 1);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('playerLeft', {
        playerId: 1,
        playerCount: 1,
      });
    });
  });

  describe('emitPresenceUpdate', () => {
    it('should emit presenceUpdate event to room', () => {
      gateway.emitPresenceUpdate('ABC123', [1, 2, 3]);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('presenceUpdate', {
        connectedPlayerIds: [1, 2, 3],
      });
    });
  });

  describe('emitGameStarted', () => {
    it('should emit gameStarted event to room', () => {
      const round = {
        roundId: 1,
        roundNumber: 1,
        promptCard: { cardId: 1, text: 'Test prompt', pick: 1 },
        judgePlayerId: 1,
        status: 'submissions' as const,
      };

      const players = [
        {
          playerId: 1,
          nickname: 'Player1',
          score: 0,
          isHost: true,
          isConnected: true,
        },
      ];

      gateway.emitGameStarted('ABC123', round, players);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('gameStarted', {
        round,
        players,
      });
    });
  });

  describe('emitCardSubmitted', () => {
    it('should emit cardSubmitted event to room', () => {
      gateway.emitCardSubmitted('ABC123', 1, 2, 3);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('cardSubmitted', {
        playerId: 1,
        submissionsCount: 2,
        totalPlayers: 3,
      });
    });
  });

  describe('emitJudgingStarted', () => {
    it('should emit judgingStarted event to room', () => {
      const submissions = [
        {
          submissionId: 1,
          playerId: 1,
          cards: [{ cardId: 1, text: 'Test card' }],
        },
      ];

      gateway.emitJudgingStarted('ABC123', submissions);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('judgingStarted', {
        submissions,
      });
    });
  });

  describe('emitWinnerSelected', () => {
    it('should emit winnerSelected event to room', () => {
      const winningSubmission = {
        submissionId: 1,
        playerId: 1,
        cards: [{ cardId: 1, text: 'Winning card' }],
      };

      const players = [
        {
          playerId: 1,
          nickname: 'Winner',
          score: 1,
          isHost: false,
          isConnected: true,
        },
      ];

      gateway.emitWinnerSelected(
        'ABC123',
        winningSubmission,
        1,
        'Winner',
        players,
        false,
      );

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('winnerSelected', {
        winningSubmission,
        winnerPlayerId: 1,
        winnerNickname: 'Winner',
        players,
        gameOver: false,
      });
    });
  });

  describe('emitGameEnded', () => {
    it('should emit gameEnded event to room', () => {
      const finalScores = [
        {
          playerId: 1,
          nickname: 'Winner',
          score: 8,
          isHost: true,
          isConnected: true,
        },
      ];

      gateway.emitGameEnded('ABC123', 1, 'Winner', finalScores);

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('gameEnded', {
        winnerId: 1,
        winnerNickname: 'Winner',
        finalScores,
      });
    });
  });

  describe('emitError', () => {
    it('should emit error event to room', () => {
      gateway.emitError('ABC123', 'Something went wrong');

      expect(mockServer.to).toHaveBeenCalledWith('session:ABC123');
      expect(mockServer.emit).toHaveBeenCalledWith('error', {
        message: 'Something went wrong',
      });
    });
  });
});
