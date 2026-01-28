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
} from '../../../../entities';

describe('CahGameSessionService', () => {
  let service: CahGameSessionService;
  let sessionRepo: jest.Mocked<Repository<CahGameSessionEntity>>;
  let playerRepo: jest.Mocked<Repository<CahSessionPlayerEntity>>;
  let cardSetRepo: jest.Mocked<Repository<CahCardSetEntity>>;

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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CahGameSessionService>(CahGameSessionService);
    sessionRepo = module.get(getRepositoryToken(CahGameSessionEntity));
    playerRepo = module.get(getRepositoryToken(CahSessionPlayerEntity));
    cardSetRepo = module.get(getRepositoryToken(CahCardSetEntity));
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
});
