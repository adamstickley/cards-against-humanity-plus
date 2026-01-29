import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CahGameEventType, CahGameEventData } from '../../../../../types';

export class GetEventsQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: CahGameEventType[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  playerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roundNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class GameEventResponseDto {
  eventId: number;
  eventType: CahGameEventType;
  playerId: number | null;
  roundNumber: number | null;
  eventData: CahGameEventData | null;
  createdAt: Date;
}

export class EventHistoryResponseDto {
  sessionCode: string;
  totalEvents: number;
  events: GameEventResponseDto[];
}

export class EventSummaryResponseDto {
  sessionCode: string;
  totalEvents: number;
  eventCounts: Record<string, number>;
  firstEvent: Date | null;
  lastEvent: Date | null;
}
