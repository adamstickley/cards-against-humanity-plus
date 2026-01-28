export interface ScoreboardPlayerDto {
  playerId: number;
  nickname: string;
  score: number;
  roundsWon: number;
  isHost: boolean;
  isConnected: boolean;
  rank: number;
}

export interface ScoreboardDto {
  sessionCode: string;
  scoreToWin: number;
  currentRound: number;
  gameStatus: string;
  players: ScoreboardPlayerDto[];
  leader: ScoreboardPlayerDto | null;
  isTied: boolean;
}

export interface RoundWinDto {
  roundId: number;
  roundNumber: number;
  promptText: string;
  winningCards: Array<{
    cardId: number;
    text: string;
  }>;
  wonAt: Date;
}

export interface PlayerScoreHistoryDto {
  playerId: number;
  nickname: string;
  totalScore: number;
  roundsWon: RoundWinDto[];
}
