import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CAHCardType } from '../../../../../types';

export class CreateCustomCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @IsString()
  @IsIn(['prompt', 'response'])
  cardType: CAHCardType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  pick?: number;
}

export class CustomCardResponseDto {
  customCardId: number;
  text: string;
  cardType: CAHCardType;
  pick: number | null;
  createdAt: Date;
}
