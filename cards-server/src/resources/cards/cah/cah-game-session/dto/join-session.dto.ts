import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  nickname: string;
}
