import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahGameEventEntity } from '../../../../entities';
import {
  CahGameEventType,
  CahGameEventData,
  ISessionCreatedEventData,
  IPlayerJoinedEventData,
  IPlayerLeftEventData,
  IGameStartedEventData,
  IGameEndedEventData,
  IRoundStartedEventData,
  ICardsSubmittedEventData,
  IJudgingStartedEventData,
  IWinnerSelectedEventData,
  ICardsDealtEventData,
  ICardsPlayedEventData,
  ICardsRefilledEventData,
  IPlayerConnectionEventData,
} from '../../../../types';

@Injectable()
export class CahGameEventService {
  constructor(
    @InjectRepository(CahGameEventEntity)
    private readonly eventRepo: Repository<CahGameEventEntity>,
  ) {}

  /**
   * Log a generic game event
   */
  async logEvent(
    sessionId: number,
    eventType: CahGameEventType,
    playerId?: number | null,
    roundNumber?: number | null,
    eventData?: CahGameEventData | null,
  ): Promise<CahGameEventEntity> {
    const event = this.eventRepo.create({
      session_id: sessionId,
      event_type: eventType,
      player_id: playerId ?? null,
      round_number: roundNumber ?? null,
      event_data: eventData ?? null,
    });

    return this.eventRepo.save(event);
  }

  // Session lifecycle events

  async logSessionCreated(
    sessionId: number,
    data: ISessionCreatedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'SESSION_CREATED',
      data.hostPlayerId,
      null,
      data,
    );
  }

  async logPlayerJoined(
    sessionId: number,
    data: IPlayerJoinedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'SESSION_PLAYER_JOINED',
      data.playerId,
      null,
      data,
    );
  }

  async logPlayerLeft(
    sessionId: number,
    data: IPlayerLeftEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'SESSION_PLAYER_LEFT',
      data.playerId,
      null,
      data,
    );
  }

  async logGameStarted(
    sessionId: number,
    data: IGameStartedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(sessionId, 'SESSION_GAME_STARTED', null, null, data);
  }

  async logGameEnded(
    sessionId: number,
    data: IGameEndedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'SESSION_GAME_ENDED',
      data.winnerId,
      null,
      data,
    );
  }

  // Round lifecycle events

  async logRoundStarted(
    sessionId: number,
    data: IRoundStartedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'ROUND_STARTED',
      data.judgePlayerId,
      data.roundNumber,
      data,
    );
  }

  async logCardsSubmitted(
    sessionId: number,
    data: ICardsSubmittedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'ROUND_CARDS_SUBMITTED',
      data.playerId,
      data.roundNumber,
      data,
    );
  }

  async logJudgingStarted(
    sessionId: number,
    data: IJudgingStartedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'ROUND_JUDGING_STARTED',
      null,
      data.roundNumber,
      data,
    );
  }

  async logWinnerSelected(
    sessionId: number,
    data: IWinnerSelectedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'ROUND_WINNER_SELECTED',
      data.winnerId,
      data.roundNumber,
      data,
    );
  }

  // Card events

  async logCardsDealt(
    sessionId: number,
    data: ICardsDealtEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(sessionId, 'CARDS_DEALT', data.playerId, null, data);
  }

  async logCardsPlayed(
    sessionId: number,
    data: ICardsPlayedEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'CARDS_PLAYED',
      data.playerId,
      data.roundNumber,
      data,
    );
  }

  async logCardsRefilled(
    sessionId: number,
    data: ICardsRefilledEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'CARDS_REFILLED',
      data.playerId,
      null,
      data,
    );
  }

  // Player connection events

  async logPlayerConnected(
    sessionId: number,
    data: IPlayerConnectionEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'PLAYER_CONNECTED',
      data.playerId,
      null,
      data,
    );
  }

  async logPlayerDisconnected(
    sessionId: number,
    data: IPlayerConnectionEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'PLAYER_DISCONNECTED',
      data.playerId,
      null,
      data,
    );
  }

  async logPlayerReconnected(
    sessionId: number,
    data: IPlayerConnectionEventData,
  ): Promise<CahGameEventEntity> {
    return this.logEvent(
      sessionId,
      'PLAYER_RECONNECTED',
      data.playerId,
      null,
      data,
    );
  }

  // Query methods

  /**
   * Get all events for a session, ordered by creation time
   */
  async getSessionEvents(
    sessionId: number,
    options?: {
      eventTypes?: CahGameEventType[];
      playerId?: number;
      roundNumber?: number;
      limit?: number;
      offset?: number;
    },
  ): Promise<CahGameEventEntity[]> {
    const query = this.eventRepo
      .createQueryBuilder('event')
      .where('event.session_id = :sessionId', { sessionId })
      .orderBy('event.created_at', 'ASC');

    if (options?.eventTypes?.length) {
      query.andWhere('event.event_type IN (:...eventTypes)', {
        eventTypes: options.eventTypes,
      });
    }

    if (options?.playerId) {
      query.andWhere('event.player_id = :playerId', {
        playerId: options.playerId,
      });
    }

    if (options?.roundNumber) {
      query.andWhere('event.round_number = :roundNumber', {
        roundNumber: options.roundNumber,
      });
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return query.getMany();
  }

  /**
   * Get event count for a session
   */
  async getSessionEventCount(sessionId: number): Promise<number> {
    return this.eventRepo.count({ where: { session_id: sessionId } });
  }

  /**
   * Get the latest event for a session
   */
  async getLatestEvent(sessionId: number): Promise<CahGameEventEntity | null> {
    return this.eventRepo.findOne({
      where: { session_id: sessionId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get events for a specific round
   */
  async getRoundEvents(
    sessionId: number,
    roundNumber: number,
  ): Promise<CahGameEventEntity[]> {
    return this.getSessionEvents(sessionId, { roundNumber });
  }

  /**
   * Get events for a specific player in a session
   */
  async getPlayerEvents(
    sessionId: number,
    playerId: number,
  ): Promise<CahGameEventEntity[]> {
    return this.getSessionEvents(sessionId, { playerId });
  }
}
