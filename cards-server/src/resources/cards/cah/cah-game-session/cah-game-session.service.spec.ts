import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CahGameSessionService } from './cah-game-session.service';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahSessionCardPackEntity,
  CahCardSetEntity,
  CahGameRoundEntity,
  CahSessionCustomCardEntity,
} from '../../../../entities';

describe('CahGameSessionService', () => {
  let service: CahGameSessionService;
  let sessionRepo: jest.Mocked<Repository<CahGameSessionEntity>>;
  let playerRepo: jest.Mocked<Repository<CahSessionPlayerEntity>>;
  let cardSetRepo: jest.Mocked<Repository<CahCardSetEntity>>;
  let roundRepo: jest.Mocked<Repository<CahGameRoundEntity>>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CahGameSessionService,
        {
          provide: getRepositoryToken(CahGameSessionEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahSessionPlayerEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahSessionCardPackEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahCardSetEntity),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(CahGameRoundEntity),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            }),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahSessionCustomCardEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CahGameSessionService>(CahGameSessionService);
    sessionRepo = module.get(getRepositoryToken(CahGameSessionEntity));
    playerRepo = module.get(getRepositoryToken(CahSessionPlayerEntity));
    cardSetRepo = module.get(getRepositoryToken(CahCardSetEntity));
    roundRepo = module.get(getRepositoryToken(CahGameRoundEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should throw BadRequestException if no card sets provided', async () => {
      await expect(
        service.createSession({
          nickname: 'TestPlayer',
          cardSetIds: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if card sets not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      (cardSetRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      await expect(
        service.createSession({
          nickname: 'TestPlayer',
          cardSetIds: [1, 2],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create session with default settings', async () => {
      const mockCardSets = [
        { card_set_id: 1, title: 'Base Set' },
        { card_set_id: 2, title: 'Expansion 1' },
      ];

      const mockSession = {
        session_id: 1,
        code: 'ABC123',
        status: 'waiting',
        score_to_win: 8,
        max_players: 10,
        cards_per_hand: 10,
      };

      const mockPlayer = {
        session_player_id: 1,
        nickname: 'TestPlayer',
        is_host: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCardSets),
      };
      (cardSetRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      mockQueryRunner.manager.create
        .mockReturnValueOnce(mockSession)
        .mockReturnValueOnce(mockPlayer)
        .mockReturnValue({});
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(mockSession)
        .mockResolvedValueOnce(mockPlayer)
        .mockResolvedValue([]);

      const result = await service.createSession({
        nickname: 'TestPlayer',
        cardSetIds: [1, 2],
      });

      expect(result.session.code).toBe('ABC123');
      expect(result.player.is_host).toBe(true);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('joinSession', () => {
    it('should throw NotFoundException if session not found', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.joinSession('INVALID', { nickname: 'Player2' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if session not in waiting state', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        code: 'ABC123',
        status: 'in_progress',
        players: [],
      });

      await expect(
        service.joinSession('ABC123', { nickname: 'Player2' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if session is full', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
        max_players: 2,
        players: [
          { nickname: 'Player1', is_connected: true },
          { nickname: 'Player2', is_connected: true },
        ],
      });

      await expect(
        service.joinSession('ABC123', { nickname: 'Player3' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if nickname is taken', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
        max_players: 10,
        players: [{ nickname: 'Player1', is_connected: true }],
      });

      await expect(
        service.joinSession('ABC123', { nickname: 'player1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully join session', async () => {
      const mockSession = {
        session_id: 1,
        code: 'ABC123',
        status: 'waiting',
        max_players: 10,
        players: [{ nickname: 'Player1', is_connected: true }],
      };

      const mockNewPlayer = {
        session_player_id: 2,
        nickname: 'Player2',
        is_host: false,
        is_connected: true,
      };

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (playerRepo.create as jest.Mock).mockReturnValue(mockNewPlayer);
      (playerRepo.save as jest.Mock).mockResolvedValue(mockNewPlayer);

      const result = await service.joinSession('ABC123', {
        nickname: 'Player2',
      });

      expect(result.session.code).toBe('ABC123');
      expect(result.player.nickname).toBe('Player2');
      expect(result.player.is_host).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should throw NotFoundException if session not found', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getSession('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return session with relations', async () => {
      const mockSession = {
        code: 'ABC123',
        status: 'waiting',
        players: [{ nickname: 'Player1' }],
        card_packs: [{ card_set_id: 1 }],
      };

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSession('ABC123');

      expect(result.code).toBe('ABC123');
      expect(result.players).toHaveLength(1);
    });
  });

  describe('getScoreboard', () => {
    it('should throw NotFoundException if session not found', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getScoreboard('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return scoreboard with players sorted by score', async () => {
      const mockSession = {
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        score_to_win: 8,
        current_round: 5,
        players: [
          {
            session_player_id: 1,
            nickname: 'Player1',
            score: 2,
            is_host: true,
            is_connected: true,
          },
          {
            session_player_id: 2,
            nickname: 'Player2',
            score: 4,
            is_host: false,
            is_connected: true,
          },
          {
            session_player_id: 3,
            nickname: 'Player3',
            score: 1,
            is_host: false,
            is_connected: true,
          },
        ],
      };

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { winnerId: 2, roundsWon: '4' },
          { winnerId: 1, roundsWon: '2' },
          { winnerId: 3, roundsWon: '1' },
        ]),
      };
      (roundRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getScoreboard('ABC123');

      expect(result.sessionCode).toBe('ABC123');
      expect(result.scoreToWin).toBe(8);
      expect(result.players).toHaveLength(3);
      expect(result.players[0].nickname).toBe('Player2');
      expect(result.players[0].score).toBe(4);
      expect(result.players[0].rank).toBe(1);
      expect(result.leader?.playerId).toBe(2);
      expect(result.isTied).toBe(false);
    });

    it('should detect tied scores', async () => {
      const mockSession = {
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        score_to_win: 8,
        current_round: 4,
        players: [
          {
            session_player_id: 1,
            nickname: 'Player1',
            score: 3,
            is_host: true,
            is_connected: true,
          },
          {
            session_player_id: 2,
            nickname: 'Player2',
            score: 3,
            is_host: false,
            is_connected: true,
          },
        ],
      };

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { winnerId: 1, roundsWon: '3' },
          { winnerId: 2, roundsWon: '3' },
        ]),
      };
      (roundRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getScoreboard('ABC123');

      expect(result.isTied).toBe(true);
    });
  });

  describe('getPlayerScoreHistory', () => {
    it('should throw NotFoundException if session not found', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getPlayerScoreHistory('INVALID', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if player not in session', async () => {
      const mockSession = {
        session_id: 1,
        code: 'ABC123',
        players: [{ session_player_id: 1, nickname: 'Player1' }],
      };

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      await expect(
        service.getPlayerScoreHistory('ABC123', 999),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return player score history with rounds won', async () => {
      const mockSession = {
        session_id: 1,
        code: 'ABC123',
        players: [
          {
            session_player_id: 1,
            nickname: 'Player1',
            score: 2,
          },
        ],
      };

      const mockWonRounds = [
        {
          round_id: 1,
          round_number: 2,
          prompt_card: { card_text: 'What is _?' },
          winner_player_id: 1,
          created_at: new Date('2024-01-01'),
          submissions: [
            {
              session_player_id: 1,
              cards: [
                {
                  card_order: 0,
                  card: { card_id: 10, card_text: 'Awesome answer' },
                },
              ],
            },
          ],
        },
        {
          round_id: 3,
          round_number: 5,
          prompt_card: { card_text: 'Why did _?' },
          winner_player_id: 1,
          created_at: new Date('2024-01-02'),
          submissions: [
            {
              session_player_id: 1,
              cards: [
                {
                  card_order: 0,
                  card: { card_id: 20, card_text: 'Great response' },
                },
              ],
            },
          ],
        },
      ];

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (roundRepo.find as jest.Mock).mockResolvedValue(mockWonRounds);

      const result = await service.getPlayerScoreHistory('ABC123', 1);

      expect(result.playerId).toBe(1);
      expect(result.nickname).toBe('Player1');
      expect(result.totalScore).toBe(2);
      expect(result.roundsWon).toHaveLength(2);
      expect(result.roundsWon[0].roundNumber).toBe(2);
      expect(result.roundsWon[0].promptText).toBe('What is _?');
      expect(result.roundsWon[0].winningCards[0].text).toBe('Awesome answer');
    });
  });
});
