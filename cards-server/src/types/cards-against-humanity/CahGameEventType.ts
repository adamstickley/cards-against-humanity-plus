/**
 * Event type prefixes for game event logging.
 * Format: CATEGORY_ACTION
 */
export type CahGameEventType =
  // Session lifecycle events
  | 'SESSION_CREATED'
  | 'SESSION_PLAYER_JOINED'
  | 'SESSION_PLAYER_LEFT'
  | 'SESSION_GAME_STARTED'
  | 'SESSION_GAME_ENDED'

  // Round lifecycle events
  | 'ROUND_STARTED'
  | 'ROUND_CARDS_SUBMITTED'
  | 'ROUND_JUDGING_STARTED'
  | 'ROUND_WINNER_SELECTED'

  // Card events
  | 'CARDS_DEALT'
  | 'CARDS_PLAYED'
  | 'CARDS_REFILLED'

  // Player connection events
  | 'PLAYER_CONNECTED'
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_RECONNECTED';

/**
 * Event data interfaces for type-safe event payloads
 */
export interface ICahEventDataBase {
  timestamp?: string;
}

export interface ISessionCreatedEventData extends ICahEventDataBase {
  hostPlayerId: number;
  hostNickname: string;
  scoreToWin: number;
  maxPlayers: number;
  cardsPerHand: number;
  cardPackIds: number[];
}

export interface IPlayerJoinedEventData extends ICahEventDataBase {
  playerId: number;
  nickname: string;
  playerCount: number;
}

export interface IPlayerLeftEventData extends ICahEventDataBase {
  playerId: number;
  nickname: string;
  playerCount: number;
  reason?: 'left' | 'kicked' | 'disconnected';
}

export interface IGameStartedEventData extends ICahEventDataBase {
  playerCount: number;
  playerIds: number[];
}

export interface IGameEndedEventData extends ICahEventDataBase {
  winnerId: number;
  winnerNickname: string;
  winnerScore: number;
  finalScores: Array<{
    playerId: number;
    nickname: string;
    score: number;
  }>;
}

export interface IRoundStartedEventData extends ICahEventDataBase {
  roundNumber: number;
  judgePlayerId: number;
  judgeNickname: string;
  promptCardId: number;
  promptText: string;
  pickCount: number;
}

export interface ICardsSubmittedEventData extends ICahEventDataBase {
  roundNumber: number;
  playerId: number;
  nickname: string;
  cardIds: number[];
  cardTexts: string[];
  submissionOrder: number;
}

export interface IJudgingStartedEventData extends ICahEventDataBase {
  roundNumber: number;
  submissionCount: number;
}

export interface IWinnerSelectedEventData extends ICahEventDataBase {
  roundNumber: number;
  winnerId: number;
  winnerNickname: string;
  winningCardIds: number[];
  winningCardTexts: string[];
  newScore: number;
}

export interface ICardsDealtEventData extends ICahEventDataBase {
  playerId: number;
  nickname: string;
  cardCount: number;
  cardIds: number[];
}

export interface ICardsPlayedEventData extends ICahEventDataBase {
  playerId: number;
  nickname: string;
  roundNumber: number;
  cardIds: number[];
  cardTexts: string[];
}

export interface ICardsRefilledEventData extends ICahEventDataBase {
  playerId: number;
  nickname: string;
  newCardCount: number;
  newCardIds: number[];
}

export interface IPlayerConnectionEventData extends ICahEventDataBase {
  playerId: number;
  nickname: string;
  socketId?: string;
}

/**
 * Union type for all event data
 */
export type CahGameEventData =
  | ISessionCreatedEventData
  | IPlayerJoinedEventData
  | IPlayerLeftEventData
  | IGameStartedEventData
  | IGameEndedEventData
  | IRoundStartedEventData
  | ICardsSubmittedEventData
  | IJudgingStartedEventData
  | IWinnerSelectedEventData
  | ICardsDealtEventData
  | ICardsPlayedEventData
  | ICardsRefilledEventData
  | IPlayerConnectionEventData;
