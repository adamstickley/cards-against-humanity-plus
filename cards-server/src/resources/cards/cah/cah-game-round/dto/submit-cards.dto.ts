import { IsArray, IsInt, IsPositive, ArrayMinSize } from 'class-validator';

export class SubmitCardsDto {
  @IsInt()
  @IsPositive()
  playerId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  cardIds: number[];
}
