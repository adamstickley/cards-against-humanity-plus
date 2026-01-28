export interface PlayerInfo {
  playerId: number;
  nickname: string;
  score: number;
  isHost: boolean;
  isConnected: boolean;
}

export interface RoundInfo {
  roundId: number;
  roundNumber: number;
  promptCard: {
    cardId: number;
    text: string;
    pick: number;
  };
  judgePlayerId: number;
  status: 'pending' | 'submissions' | 'judging' | 'complete';
}

export interface SubmissionInfo {
  submissionId: number;
  playerId: number;
  cards?: Array<{
    cardId: number;
    text: string;
  }>;
}

export interface ServerToClientEvents {
  playerJoined: (data: { player: PlayerInfo; playerCount: number }) => void;
  playerLeft: (data: { playerId: number; playerCount: number }) => void;
  playerDisconnected: (data: { playerId: number }) => void;
  playerReconnected: (data: { playerId: number }) => void;
  gameStarted: (data: { round: RoundInfo; players: PlayerInfo[] }) => void;
  roundStarted: (data: { round: RoundInfo }) => void;
  cardSubmitted: (data: {
    playerId: number;
    submissionsCount: number;
    totalPlayers: number;
  }) => void;
  judgingStarted: (data: { submissions: SubmissionInfo[] }) => void;
  winnerSelected: (data: {
    winningSubmission: SubmissionInfo;
    winnerPlayerId: number;
    winnerNickname: string;
    players: PlayerInfo[];
    gameOver: boolean;
  }) => void;
  nextRound: (data: { round: RoundInfo }) => void;
  gameEnded: (data: {
    winnerId: number;
    winnerNickname: string;
    finalScores: PlayerInfo[];
  }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  joinSession: (data: { sessionCode: string; playerId: number }) => void;
  leaveSession: (data: { sessionCode: string }) => void;
}
