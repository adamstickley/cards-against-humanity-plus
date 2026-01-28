import { ICardsAgainstHumanitySetupFormValues } from './ICardsAgainstHumanitySetupFormValues';

export interface IGameModeType {
  label: string;
  labelSubtext: string;
  inputLabel: string;
  inputDescription: string;
  inputName: keyof Pick<
    ICardsAgainstHumanitySetupFormValues,
    'ruleTime' | 'ruleRounds' | 'ruleScore' | 'ruleWhiteCards'
  >;
  min: number;
  max: number;
}

export const GAME_MODES: { [key in GameMode]: IGameModeType } = {
  timed: {
    label: 'Timed',
    labelSubtext: 'Play until the timer runs out',
    inputName: 'ruleTime',
    inputLabel: 'Duration',
    inputDescription: 'Game will end on a timer',
    min: 5,
    max: 6 * 60,
  },
  score: {
    label: 'Score',
    labelSubtext: 'First to reach this score wins',
    inputName: 'ruleScore',
    inputLabel: 'Points',
    inputDescription: 'Win this many rounds',
    min: 1,
    max: 50,
  },
  cards: {
    label: 'Card Limit',
    labelSubtext: 'Play until you run out of cards',
    inputName: 'ruleWhiteCards',
    inputLabel: 'Cards',
    inputDescription: 'Number of white cards',
    min: 50,
    max: 1000,
  },
  rounds: {
    label: 'Rounds',
    labelSubtext: 'Play a set number of rounds',
    inputName: 'ruleRounds',
    inputLabel: 'Rounds',
    inputDescription: 'Rounds to be played',
    min: 1,
    max: 50,
  },
  // timed: "Timed",
  // score: "Score",
  // rounds: "Rounds",
  // cards: "Card Limit",
};

export type GameMode = 'timed' | 'score' | 'rounds' | 'cards';
