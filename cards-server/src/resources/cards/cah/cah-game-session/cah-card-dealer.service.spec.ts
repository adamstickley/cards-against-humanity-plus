import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CahCardDealerService } from './cah-card-dealer.service';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahPlayerHandEntity,
  CahCardEntity,
  CahSessionCardPackEntity,
} from '../../../../entities';

describe('CahCardDealerService', () => {
  let service: CahCardDealerService;
  let sessionRepo: jest.Mocked<Repository<CahGameSessionEntity>>;
  let handRepo: jest.Mocked<Repository<CahPlayerHandEntity>>;
  let cardRepo: jest.Mocked<Repository<CahCardEntity>>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CahCardDealerService,
        {
          provide: getRepositoryToken(CahGameSessionEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahSessionPlayerEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahPlayerHandEntity),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CahCardEntity),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(CahSessionCardPackEntity),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CahCardDealerService>(CahCardDealerService);
    sessionRepo = module.get(getRepositoryToken(CahGameSessionEntity));
    handRepo = module.get(getRepositoryToken(CahPlayerHandEntity));
    cardRepo = module.get(getRepositoryToken(CahCardEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dealInitialHands', () => {
    it('should throw NotFoundException if session not found', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.dealInitialHands(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if no card packs selected', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        session_id: 1,
        cards_per_hand: 10,
        players: [{ session_player_id: 1, is_connected: true }],
        card_packs: [],
      });

      await expect(service.dealInitialHands(1)).rejects.toThrow(
        'No card packs selected',
      );
    });

    it('should throw error if no connected players', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        session_id: 1,
        cards_per_hand: 10,
        players: [{ session_player_id: 1, is_connected: false }],
        card_packs: [{ card_set_id: 1 }],
      });

      await expect(service.dealInitialHands(1)).rejects.toThrow(
        'No connected players',
      );
    });

    it('should throw error if not enough cards available', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        session_id: 1,
        cards_per_hand: 10,
        players: [
          { session_player_id: 1, is_connected: true },
          { session_player_id: 2, is_connected: true },
        ],
        card_packs: [{ card_set_id: 1 }],
      });

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { card_id: 1, card_type: 'response' },
          { card_id: 2, card_type: 'response' },
        ]),
      };
      (cardRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      await expect(service.dealInitialHands(1)).rejects.toThrow(
        'Not enough response cards available',
      );
    });

    it('should successfully deal initial hands to all players', async () => {
      const mockCards = Array.from({ length: 30 }, (_, i) => ({
        card_id: i + 1,
        card_type: 'response',
        card_text: `Card ${i + 1}`,
      }));

      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        session_id: 1,
        cards_per_hand: 10,
        players: [
          { session_player_id: 1, is_connected: true },
          { session_player_id: 2, is_connected: true },
        ],
        card_packs: [{ card_set_id: 1 }],
      });

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCards),
      };
      (cardRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      mockQueryRunner.manager.create.mockImplementation((_, data) => data);
      mockQueryRunner.manager.save.mockResolvedValue([]);

      await service.dealInitialHands(1);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });
  });

  describe('getPlayerHand', () => {
    it('should return cards from player hand', async () => {
      const mockHandEntries = [
        { card_id: 1, card: { card_id: 1, card_text: 'Card 1' } },
        { card_id: 2, card: { card_id: 2, card_text: 'Card 2' } },
      ];

      (handRepo.find as jest.Mock).mockResolvedValue(mockHandEntries);

      const result = await service.getPlayerHand(1);

      expect(result).toHaveLength(2);
      expect(result[0].card_id).toBe(1);
      expect(result[1].card_id).toBe(2);
    });

    it('should return empty array if player has no cards', async () => {
      (handRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getPlayerHand(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('refillPlayerHand', () => {
    it('should throw NotFoundException if session not found', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.refillPlayerHand(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if hand is already full', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        session_id: 1,
        cards_per_hand: 10,
      });
      (handRepo.count as jest.Mock).mockResolvedValue(10);

      const result = await service.refillPlayerHand(1, 1);

      expect(result).toHaveLength(0);
    });
  });

  describe('removeCardsFromHand', () => {
    it('should delete cards from player hand', async () => {
      (handRepo.delete as jest.Mock).mockResolvedValue({ affected: 2 });

      await service.removeCardsFromHand(1, [1, 2]);

      expect(handRepo.delete).toHaveBeenCalledWith({
        session_player_id: 1,
        card_id: expect.anything(),
      });
    });
  });
});
