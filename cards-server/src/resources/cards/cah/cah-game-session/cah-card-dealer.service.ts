import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahPlayerHandEntity,
  CahCardEntity,
  CahSessionCardPackEntity,
} from '../../../../entities';
import { CahGameEventService } from '../cah-game-event';

@Injectable()
export class CahCardDealerService {
  constructor(
    @InjectRepository(CahGameSessionEntity)
    private readonly sessionRepo: Repository<CahGameSessionEntity>,
    @InjectRepository(CahSessionPlayerEntity)
    private readonly playerRepo: Repository<CahSessionPlayerEntity>,
    @InjectRepository(CahPlayerHandEntity)
    private readonly handRepo: Repository<CahPlayerHandEntity>,
    @InjectRepository(CahCardEntity)
    private readonly cardRepo: Repository<CahCardEntity>,
    @InjectRepository(CahSessionCardPackEntity)
    private readonly cardPackRepo: Repository<CahSessionCardPackEntity>,
    private readonly dataSource: DataSource,
    private readonly eventService: CahGameEventService,
  ) {}

  async dealInitialHands(sessionId: number): Promise<void> {
    const session = await this.sessionRepo.findOne({
      where: { session_id: sessionId },
      relations: ['players', 'card_packs'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const cardSetIds = session.card_packs.map((cp) => cp.card_set_id);
    if (cardSetIds.length === 0) {
      throw new Error('No card packs selected for this session');
    }

    const cardsPerHand = session.cards_per_hand;
    const players = session.players.filter((p) => p.is_connected);

    if (players.length === 0) {
      throw new Error('No connected players in session');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(CahPlayerHandEntity, {
        session_player_id: In(players.map((p) => p.session_player_id)),
      });

      const availableCards = await this.getAvailableResponseCards(
        cardSetIds,
        [],
      );

      const totalCardsNeeded = players.length * cardsPerHand;
      if (availableCards.length < totalCardsNeeded) {
        throw new Error(
          `Not enough response cards available. Need ${totalCardsNeeded}, have ${availableCards.length}`,
        );
      }

      const shuffledCards = this.shuffleArray([...availableCards]);
      const handEntries: CahPlayerHandEntity[] = [];

      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const startIndex = i * cardsPerHand;
        const playerCards = shuffledCards.slice(
          startIndex,
          startIndex + cardsPerHand,
        );

        for (const card of playerCards) {
          const handEntry = queryRunner.manager.create(CahPlayerHandEntity, {
            session_player_id: player.session_player_id,
            card_id: card.card_id,
          });
          handEntries.push(handEntry);
        }
      }

      await queryRunner.manager.save(handEntries);
      await queryRunner.commitTransaction();

      // Log cards dealt event for each player
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const startIndex = i * cardsPerHand;
        const playerCards = shuffledCards.slice(
          startIndex,
          startIndex + cardsPerHand,
        );
        await this.eventService.logCardsDealt(sessionId, {
          playerId: player.session_player_id,
          nickname: player.nickname,
          cardCount: playerCards.length,
          cardIds: playerCards.map((c) => c.card_id),
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async dealCardsToPlayer(
    playerId: number,
    count: number,
    sessionId: number,
  ): Promise<CahCardEntity[]> {
    const session = await this.sessionRepo.findOne({
      where: { session_id: sessionId },
      relations: ['card_packs'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const cardSetIds = session.card_packs.map((cp) => cp.card_set_id);
    const usedCardIds = await this.getUsedCardIdsInSession(sessionId);

    const availableCards = await this.getAvailableResponseCards(
      cardSetIds,
      usedCardIds,
    );

    if (availableCards.length < count) {
      throw new Error(
        `Not enough response cards available. Need ${count}, have ${availableCards.length}`,
      );
    }

    const shuffledCards = this.shuffleArray([...availableCards]);
    const cardsToDeal = shuffledCards.slice(0, count);

    const handEntries = cardsToDeal.map((card) =>
      this.handRepo.create({
        session_player_id: playerId,
        card_id: card.card_id,
      }),
    );

    await this.handRepo.save(handEntries);

    return cardsToDeal;
  }

  async refillPlayerHand(
    playerId: number,
    sessionId: number,
  ): Promise<CahCardEntity[]> {
    const session = await this.sessionRepo.findOne({
      where: { session_id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const currentHandCount = await this.handRepo.count({
      where: { session_player_id: playerId },
    });

    const cardsNeeded = session.cards_per_hand - currentHandCount;

    if (cardsNeeded <= 0) {
      return [];
    }

    const newCards = await this.dealCardsToPlayer(
      playerId,
      cardsNeeded,
      sessionId,
    );

    // Log cards refilled event
    if (newCards.length > 0) {
      const player = await this.playerRepo.findOne({
        where: { session_player_id: playerId },
      });
      if (player) {
        await this.eventService.logCardsRefilled(sessionId, {
          playerId,
          nickname: player.nickname,
          newCardCount: newCards.length,
          newCardIds: newCards.map((c) => c.card_id),
        });
      }
    }

    return newCards;
  }

  async getPlayerHand(playerId: number): Promise<CahCardEntity[]> {
    const handEntries = await this.handRepo.find({
      where: { session_player_id: playerId },
      relations: ['card'],
    });

    return handEntries.map((entry) => entry.card);
  }

  async removeCardsFromHand(
    playerId: number,
    cardIds: number[],
  ): Promise<void> {
    await this.handRepo.delete({
      session_player_id: playerId,
      card_id: In(cardIds),
    });
  }

  private async getAvailableResponseCards(
    cardSetIds: number[],
    excludeCardIds: number[],
  ): Promise<CahCardEntity[]> {
    const queryBuilder = this.cardRepo
      .createQueryBuilder('card')
      .where('card.card_set_id IN (:...cardSetIds)', { cardSetIds })
      .andWhere('card.card_type = :cardType', { cardType: 'response' });

    if (excludeCardIds.length > 0) {
      queryBuilder.andWhere('card.card_id NOT IN (:...excludeCardIds)', {
        excludeCardIds,
      });
    }

    return queryBuilder.getMany();
  }

  private async getUsedCardIdsInSession(sessionId: number): Promise<number[]> {
    const players = await this.playerRepo.find({
      where: { session_id: sessionId },
    });

    if (players.length === 0) {
      return [];
    }

    const playerIds = players.map((p) => p.session_player_id);

    const handEntries = await this.handRepo.find({
      where: { session_player_id: In(playerIds) },
    });

    return handEntries.map((entry) => entry.card_id);
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
