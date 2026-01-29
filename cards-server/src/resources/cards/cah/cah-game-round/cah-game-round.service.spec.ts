import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CahGameRoundService } from './cah-game-round.service';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahGameRoundEntity,
  CahRoundSubmissionEntity,
  CahSubmissionCardEntity,
  CahPlayerHandEntity,
  CahCardEntity,
  CahSessionCustomCardEntity,
} from '../../../../entities';

describe('CahGameRoundService', () => {
  let service: CahGameRoundService;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  const mockSessionRepo = {
    findOne: jest.fn(),
  };

  const mockPlayerRepo = {
    findOne: jest.fn(),
  };

  const mockRoundRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSubmissionRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSubmissionCardRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHandRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCardRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCustomCardRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CahGameRoundService,
        {
          provide: getRepositoryToken(CahGameSessionEntity),
          useValue: mockSessionRepo,
        },
        {
          provide: getRepositoryToken(CahSessionPlayerEntity),
          useValue: mockPlayerRepo,
        },
        {
          provide: getRepositoryToken(CahGameRoundEntity),
          useValue: mockRoundRepo,
        },
        {
          provide: getRepositoryToken(CahRoundSubmissionEntity),
          useValue: mockSubmissionRepo,
        },
        {
          provide: getRepositoryToken(CahSubmissionCardEntity),
          useValue: mockSubmissionCardRepo,
        },
        {
          provide: getRepositoryToken(CahPlayerHandEntity),
          useValue: mockHandRepo,
        },
        {
          provide: getRepositoryToken(CahCardEntity),
          useValue: mockCardRepo,
        },
        {
          provide: getRepositoryToken(CahSessionCustomCardEntity),
          useValue: mockCustomCardRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CahGameRoundService>(CahGameRoundService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startGame', () => {
    it('should throw NotFoundException if session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.startGame('INVALID', { playerId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if game already started', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        status: 'in_progress',
        players: [],
      });

      await expect(
        service.startGame('ABC123', { playerId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if non-host tries to start', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
        players: [
          { session_player_id: 1, is_host: true, is_connected: true },
          { session_player_id: 2, is_host: false, is_connected: true },
        ],
      });

      await expect(
        service.startGame('ABC123', { playerId: 2 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if less than 3 players', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
        players: [
          { session_player_id: 1, is_host: true, is_connected: true },
          { session_player_id: 2, is_host: false, is_connected: true },
        ],
      });

      await expect(
        service.startGame('ABC123', { playerId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitCards', () => {
    it('should throw NotFoundException if session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.submitCards('INVALID', 1, { playerId: 1, cardIds: [1] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if game not in progress', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
        players: [],
      });

      await expect(
        service.submitCards('ABC123', 1, { playerId: 1, cardIds: [1] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if round not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        players: [{ session_player_id: 1 }],
      });
      mockRoundRepo.findOne.mockResolvedValue(null);

      await expect(
        service.submitCards('ABC123', 1, { playerId: 1, cardIds: [1] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if judge tries to submit', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        players: [{ session_player_id: 1 }],
      });
      mockRoundRepo.findOne.mockResolvedValue({
        round_id: 1,
        session_id: 1,
        status: 'submissions',
        judge_player_id: 1,
        prompt_card: { pick: 1 },
        submissions: [],
      });

      await expect(
        service.submitCards('ABC123', 1, { playerId: 1, cardIds: [1] }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already submitted', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        players: [{ session_player_id: 2 }],
      });
      mockRoundRepo.findOne.mockResolvedValue({
        round_id: 1,
        session_id: 1,
        status: 'submissions',
        judge_player_id: 1,
        prompt_card: { pick: 1 },
        submissions: [{ session_player_id: 2 }],
      });

      await expect(
        service.submitCards('ABC123', 1, { playerId: 2, cardIds: [1] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if wrong number of cards', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        players: [{ session_player_id: 2 }],
      });
      mockRoundRepo.findOne.mockResolvedValue({
        round_id: 1,
        session_id: 1,
        status: 'submissions',
        judge_player_id: 1,
        prompt_card: { pick: 2 },
        submissions: [],
      });

      await expect(
        service.submitCards('ABC123', 1, { playerId: 2, cardIds: [1] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('selectWinner', () => {
    it('should throw NotFoundException if session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.selectWinner('INVALID', 1, {
          judgePlayerId: 1,
          winningSubmissionId: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if game not in progress', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
        players: [],
      });

      await expect(
        service.selectWinner('ABC123', 1, {
          judgePlayerId: 1,
          winningSubmissionId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if round not in judging phase', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        players: [],
      });
      mockRoundRepo.findOne.mockResolvedValue({
        round_id: 1,
        session_id: 1,
        status: 'submissions',
        submissions: [],
      });

      await expect(
        service.selectWinner('ABC123', 1, {
          judgePlayerId: 1,
          winningSubmissionId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if non-judge tries to select', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        session_id: 1,
        code: 'ABC123',
        status: 'in_progress',
        players: [],
      });
      mockRoundRepo.findOne.mockResolvedValue({
        round_id: 1,
        session_id: 1,
        status: 'judging',
        judge_player_id: 1,
        submissions: [],
      });

      await expect(
        service.selectWinner('ABC123', 1, {
          judgePlayerId: 2,
          winningSubmissionId: 1,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCurrentRound', () => {
    it('should throw NotFoundException if session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(service.getCurrentRound('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return null if game not in progress', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        status: 'waiting',
      });

      const result = await service.getCurrentRound('ABC123');
      expect(result).toBeNull();
    });
  });

  describe('getPlayerHand', () => {
    it('should throw NotFoundException if session not found', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);

      await expect(service.getPlayerHand('INVALID', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if player not in session', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        players: [{ session_player_id: 2 }],
      });

      await expect(service.getPlayerHand('ABC123', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return player hand', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        code: 'ABC123',
        players: [{ session_player_id: 1 }],
      });
      mockHandRepo.find.mockResolvedValue([
        { card_id: 1, card: { card_id: 1, card_text: 'Card 1' } },
        { card_id: 2, card: { card_id: 2, card_text: 'Card 2' } },
      ]);

      const result = await service.getPlayerHand('ABC123', 1);
      expect(result).toHaveLength(2);
    });
  });
});
