import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GameStateSyncService } from './game-state-sync.service';
import { PlayerPresenceService } from './player-presence.service';
import {
  CahGameSessionEntity,
  CahGameRoundEntity,
  CahPlayerHandEntity,
} from '../../../../entities';

describe('GameStateSyncService', () => {
  let service: GameStateSyncService;

  const mockSessionRepo = {
    findOne: jest.fn(),
  };

  const mockRoundRepo = {
    findOne: jest.fn(),
  };

  const mockHandRepo = {
    find: jest.fn(),
  };

  const mockPresenceService = {
    getConnectedPlayersInSession: jest.fn().mockReturnValue([1, 2]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameStateSyncService,
        {
          provide: getRepositoryToken(CahGameSessionEntity),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(CahGameRoundEntity),
          useValue: mockRoundRepo,
        },
        {
          provide: getRepositoryToken(CahPlayerHandEntity),
          useValue: mockHandRepo,
        },
        {
          provide: PlayerPresenceService,
          useValue: mockPresenceService,
        },
      ],
    }).compile();

    service = module.get<GameStateSyncService>(GameStateSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFullGameState', () => {
    it('should throw NotFoundException when session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(service.getFullGameState('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return game state for waiting session', async () => {
      const mockSession = {
        code: 'ABC123',
        session_id: 1,
        status: 'waiting',
        score_to_win: 8,
        max_players: 10,
        cards_per_hand: 7,
        round_timer_seconds: null,
        players: [
          {
            session_player_id: 1,
            nickname: 'Player1',
            score: 0,
            is_host: true,
            is_connected: true,
          },
          {
            session_player_id: 2,
            nickname: 'Player2',
            score: 0,
            is_host: false,
            is_connected: true,
          },
        ],
        card_packs: [],
      };

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1, 2]);

      const result = await service.getFullGameState('ABC123');

      expect(result).toEqual({
        sessionCode: 'ABC123',
        sessionId: 1,
        status: 'waiting',
        settings: {
          scoreToWin: 8,
          maxPlayers: 10,
          cardsPerHand: 7,
          roundTimerSeconds: null,
        },
        players: [
          {
            playerId: 1,
            nickname: 'Player1',
            score: 0,
            isHost: true,
            isConnected: true,
            isOnline: true,
          },
          {
            playerId: 2,
            nickname: 'Player2',
            score: 0,
            isHost: false,
            isConnected: true,
            isOnline: true,
          },
        ],
        currentRound: null,
        myHand: undefined,
      });
    });

    it('should return game state with player hand when playerId provided', async () => {
      const mockSession = {
        code: 'ABC123',
        session_id: 1,
        status: 'waiting',
        score_to_win: 8,
        max_players: 10,
        cards_per_hand: 7,
        round_timer_seconds: null,
        players: [
          {
            session_player_id: 1,
            nickname: 'Player1',
            score: 0,
            is_host: true,
            is_connected: true,
          },
        ],
        card_packs: [],
      };

      const mockHandEntries = [
        { card: { card_id: 1, card_text: 'Card 1' } },
        { card: { card_id: 2, card_text: 'Card 2' } },
      ];

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1]);
      mockHandRepo.find.mockResolvedValue(mockHandEntries);

      const result = await service.getFullGameState('ABC123', 1);

      expect(result.myHand).toEqual([
        { cardId: 1, text: 'Card 1' },
        { cardId: 2, text: 'Card 2' },
      ]);
    });

    it('should return game state with current round for in_progress session', async () => {
      const mockSession = {
        code: 'ABC123',
        session_id: 1,
        status: 'in_progress',
        current_round: 1,
        score_to_win: 8,
        max_players: 10,
        cards_per_hand: 7,
        round_timer_seconds: 60,
        players: [
          {
            session_player_id: 1,
            nickname: 'Player1',
            score: 0,
            is_host: true,
            is_connected: true,
          },
          {
            session_player_id: 2,
            nickname: 'Player2',
            score: 0,
            is_host: false,
            is_connected: true,
          },
        ],
        card_packs: [],
      };

      const mockRound = {
        round_id: 1,
        round_number: 1,
        judge_player_id: 1,
        status: 'submissions',
        prompt_card: {
          card_id: 10,
          card_text: 'What is your favorite thing?',
          pick: 1,
        },
        judge: { session_player_id: 1, nickname: 'Player1' },
        submissions: [],
        winner_player_id: null,
      };

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1, 2]);
      mockRoundRepo.findOne.mockResolvedValue(mockRound);

      const result = await service.getFullGameState('ABC123');

      expect(result.status).toBe('in_progress');
      expect(result.currentRound).toEqual({
        roundId: 1,
        roundNumber: 1,
        promptCard: {
          cardId: 10,
          text: 'What is your favorite thing?',
          pick: 1,
        },
        judgePlayerId: 1,
        judgeNickname: 'Player1',
        status: 'submissions',
        submissions: [],
        winnerPlayerId: undefined,
      });
    });

    it('should include submission cards during judging phase', async () => {
      const mockSession = {
        code: 'ABC123',
        session_id: 1,
        status: 'in_progress',
        current_round: 1,
        score_to_win: 8,
        max_players: 10,
        cards_per_hand: 7,
        round_timer_seconds: 60,
        players: [
          {
            session_player_id: 1,
            nickname: 'Judge',
            score: 0,
            is_host: true,
            is_connected: true,
          },
          {
            session_player_id: 2,
            nickname: 'Player2',
            score: 0,
            is_host: false,
            is_connected: true,
          },
        ],
        card_packs: [],
      };

      const mockRound = {
        round_id: 1,
        round_number: 1,
        judge_player_id: 1,
        status: 'judging',
        prompt_card: {
          card_id: 10,
          card_text: 'What?',
          pick: 1,
        },
        judge: { session_player_id: 1, nickname: 'Judge' },
        submissions: [
          {
            submission_id: 1,
            session_player_id: 2,
            player: { nickname: 'Player2' },
            submitted_at: new Date('2024-01-01'),
            cards: [
              { card_order: 0, card: { card_id: 20, card_text: 'Answer' } },
            ],
          },
        ],
        winner_player_id: null,
      };

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1, 2]);
      mockRoundRepo.findOne.mockResolvedValue(mockRound);

      const result = await service.getFullGameState('ABC123');

      expect(result.currentRound?.submissions[0].cards).toEqual([
        { cardId: 20, text: 'Answer' },
      ]);
    });

    it('should not include submission cards during submissions phase', async () => {
      const mockSession = {
        code: 'ABC123',
        session_id: 1,
        status: 'in_progress',
        current_round: 1,
        score_to_win: 8,
        max_players: 10,
        cards_per_hand: 7,
        round_timer_seconds: 60,
        players: [
          {
            session_player_id: 1,
            nickname: 'Judge',
            score: 0,
            is_host: true,
            is_connected: true,
          },
          {
            session_player_id: 2,
            nickname: 'Player2',
            score: 0,
            is_host: false,
            is_connected: true,
          },
        ],
        card_packs: [],
      };

      const mockRound = {
        round_id: 1,
        round_number: 1,
        judge_player_id: 1,
        status: 'submissions',
        prompt_card: {
          card_id: 10,
          card_text: 'What?',
          pick: 1,
        },
        judge: { session_player_id: 1, nickname: 'Judge' },
        submissions: [
          {
            submission_id: 1,
            session_player_id: 2,
            player: { nickname: 'Player2' },
            submitted_at: new Date('2024-01-01'),
            cards: [
              { card_order: 0, card: { card_id: 20, card_text: 'Answer' } },
            ],
          },
        ],
        winner_player_id: null,
      };

      mockSessionRepo.findOne.mockResolvedValue(mockSession);
      mockPresenceService.getConnectedPlayersInSession.mockReturnValue([1, 2]);
      mockRoundRepo.findOne.mockResolvedValue(mockRound);

      const result = await service.getFullGameState('ABC123');

      expect(result.currentRound?.submissions[0].cards).toBeUndefined();
    });
  });

  describe('getPlayerHandForSession', () => {
    it('should throw NotFoundException when session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getPlayerHandForSession('INVALID', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when player not in session', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        players: [{ session_player_id: 2 }],
      });

      await expect(
        service.getPlayerHandForSession('ABC123', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return player hand when valid', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        players: [{ session_player_id: 1 }],
      });

      mockHandRepo.find.mockResolvedValue([
        { card: { card_id: 1, card_text: 'Card 1' } },
        { card: { card_id: 2, card_text: 'Card 2' } },
      ]);

      const result = await service.getPlayerHandForSession('ABC123', 1);

      expect(result).toEqual([
        { cardId: 1, text: 'Card 1' },
        { cardId: 2, text: 'Card 2' },
      ]);
    });
  });
});
