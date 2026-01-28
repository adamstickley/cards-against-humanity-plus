export type CahRoundStatus = 'pending' | 'submissions' | 'judging' | 'complete';

export interface ICahCard {
  cardId: number;
  text: string;
}

export interface ICahPromptCard extends ICahCard {
  pick: number;
  draw?: number;
}

export interface ICahJudge {
  playerId: number;
  nickname: string;
}

export interface ICahSubmission {
  submissionId: number;
  playerId: number;
  playerNickname: string;
  cards?: ICahCard[];
  submittedAt: string;
}

export interface ICahRound {
  roundId: number;
  roundNumber: number;
  promptCard: ICahPromptCard;
  judge: ICahJudge;
  status: CahRoundStatus;
  submissions: ICahSubmission[];
  winnerPlayerId: number | null;
}

export interface ICahPlayerHand {
  playerId: number;
  cards: ICahCard[];
}

export interface ICahPlayer {
  playerId: number;
  nickname: string;
  score: number;
  isHost: boolean;
  isConnected: boolean;
}

export interface ICahGameState {
  sessionId: number;
  code: string;
  status: 'waiting' | 'in_progress' | 'complete';
  currentRound: number;
  players: ICahPlayer[];
}
