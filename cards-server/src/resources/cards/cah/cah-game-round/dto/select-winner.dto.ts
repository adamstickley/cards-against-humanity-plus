import { IsInt, IsPositive } from 'class-validator';

export class SelectWinnerDto {
  @IsInt()
  @IsPositive()
  judgePlayerId: number;

  @IsInt()
  @IsPositive()
  winningSubmissionId: number;
}
