export type CustomCardType = 'prompt' | 'response';

export interface ICustomCard {
  id: string;
  text: string;
  cardType: CustomCardType;
  pick?: number;
  createdAt: string;
}
