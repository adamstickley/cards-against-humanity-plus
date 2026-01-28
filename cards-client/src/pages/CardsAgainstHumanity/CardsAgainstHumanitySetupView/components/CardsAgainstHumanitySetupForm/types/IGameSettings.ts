import { DuplicatePolicy } from './DuplicatePolicy';
import { SwappingPolicy } from './SwappingPolicy';

export interface IGameSettings {
  ruleRounds?: number; // validate: min 1, max 50
  ruleTime?: number; // validate: min 5 minutes, max 6 hours
  ruleScore?: number; // validate: min 1, max 50
  ruleWhiteCards?: number; // validate: min 50, max 1000

  maxPlayers: number; // validate: max 20 ?

  duplicatePolicy: DuplicatePolicy; // some packs can have duplicates
  allowSwappingCards: SwappingPolicy; // can choose to swap X white cards
  swapCardLimit: number; // this is the above "X" ^

  // set strict numbers a player should have at the start of a round
  whiteCardsPerRound?: number; // validate: min 1

  roundTimer: number; // validate: min 10 seconds, max 5 minutes, allow unlimited (0)
}
