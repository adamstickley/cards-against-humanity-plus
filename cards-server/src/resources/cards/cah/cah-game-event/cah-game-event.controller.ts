import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahGameSessionEntity } from '../../../../entities';
import { CahGameEventService } from './cah-game-event.service';
import {
  GetEventsQueryDto,
  GameEventResponseDto,
  EventHistoryResponseDto,
  EventSummaryResponseDto,
} from './dto';

@Controller('session')
export class CahGameEventController {
  constructor(
    private readonly eventService: CahGameEventService,
    @InjectRepository(CahGameSessionEntity)
    private readonly sessionRepo: Repository<CahGameSessionEntity>,
  ) {}

  private async getSessionByCode(code: string): Promise<CahGameSessionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  private mapEventToDto(event: {
    event_id: number;
    event_type: string;
    player_id: number | null;
    round_number: number | null;
    event_data: unknown;
    created_at: Date;
  }): GameEventResponseDto {
    return {
      eventId: event.event_id,
      eventType: event.event_type as GameEventResponseDto['eventType'],
      playerId: event.player_id,
      roundNumber: event.round_number,
      eventData: event.event_data as GameEventResponseDto['eventData'],
      createdAt: event.created_at,
    };
  }

  @Get(':code/events')
  async getSessionEvents(
    @Param('code') code: string,
    @Query() query: GetEventsQueryDto,
  ): Promise<EventHistoryResponseDto> {
    const session = await this.getSessionByCode(code);

    const events = await this.eventService.getSessionEvents(
      session.session_id,
      {
        eventTypes: query.eventTypes,
        playerId: query.playerId,
        roundNumber: query.roundNumber,
        limit: query.limit,
        offset: query.offset,
      },
    );

    const totalEvents = await this.eventService.getSessionEventCount(
      session.session_id,
    );

    return {
      sessionCode: session.code,
      totalEvents,
      events: events.map((e) => this.mapEventToDto(e)),
    };
  }

  @Get(':code/events/summary')
  async getEventSummary(
    @Param('code') code: string,
  ): Promise<EventSummaryResponseDto> {
    const session = await this.getSessionByCode(code);

    const events = await this.eventService.getSessionEvents(session.session_id);

    const eventCounts: Record<string, number> = {};
    for (const event of events) {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    }

    return {
      sessionCode: session.code,
      totalEvents: events.length,
      eventCounts,
      firstEvent: events.length > 0 ? events[0].created_at : null,
      lastEvent:
        events.length > 0 ? events[events.length - 1].created_at : null,
    };
  }

  @Get(':code/events/round/:roundNumber')
  async getRoundEvents(
    @Param('code') code: string,
    @Param('roundNumber', ParseIntPipe) roundNumber: number,
  ): Promise<EventHistoryResponseDto> {
    const session = await this.getSessionByCode(code);

    const events = await this.eventService.getRoundEvents(
      session.session_id,
      roundNumber,
    );

    return {
      sessionCode: session.code,
      totalEvents: events.length,
      events: events.map((e) => this.mapEventToDto(e)),
    };
  }

  @Get(':code/events/player/:playerId')
  async getPlayerEvents(
    @Param('code') code: string,
    @Param('playerId', ParseIntPipe) playerId: number,
  ): Promise<EventHistoryResponseDto> {
    const session = await this.getSessionByCode(code);

    const events = await this.eventService.getPlayerEvents(
      session.session_id,
      playerId,
    );

    return {
      sessionCode: session.code,
      totalEvents: events.length,
      events: events.map((e) => this.mapEventToDto(e)),
    };
  }

  @Get(':code/events/latest')
  async getLatestEvent(
    @Param('code') code: string,
  ): Promise<GameEventResponseDto | null> {
    const session = await this.getSessionByCode(code);

    const event = await this.eventService.getLatestEvent(session.session_id);

    return event ? this.mapEventToDto(event) : null;
  }
}
