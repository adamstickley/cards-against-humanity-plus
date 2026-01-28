import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  nickname: string;

  @IsArray()
  @IsInt({ each: true })
  cardSetIds: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  scoreToWin?: number;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(20)
  maxPlayers?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(15)
  cardsPerHand?: number;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(300)
  roundTimerSeconds?: number;
}
