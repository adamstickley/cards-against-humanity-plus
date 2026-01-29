import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  ArrayMinSize,
} from 'class-validator';

export class SubmitCardsDto {
  @IsInt()
  @IsPositive()
  playerId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  cardIds: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  customCardIds?: number[];
}
