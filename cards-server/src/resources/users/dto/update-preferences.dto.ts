import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredNickname?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  defaultScoreToWin?: number;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(20)
  defaultMaxPlayers?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(15)
  defaultCardsPerHand?: number;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(300)
  defaultRoundTimerSeconds?: number;
}
