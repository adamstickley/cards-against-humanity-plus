import { IApiClient } from '../../types';
import {
  ICahRound,
  ICahPlayerHand,
  ICahScoreboard,
} from '../../../features/CardsAgainstHumanity/types';

interface StartGameResponse {
  sessionId: number;
  status: string;
  currentRound: number;
  round: {
    roundId: number;
    roundNumber: number;
    promptCardId: number;
    judgePlayerId: number;
    status: string;
  };
}

interface SubmitCardsResponse {
  submissionId: number;
  roundId: number;
  playerId: number;
  submittedAt: string;
}

interface SelectWinnerResponse {
  round: {
    roundId: number;
    status: string;
    winnerPlayerId: number;
  };
  winner: {
    playerId: number;
    nickname: string;
    score: number;
  };
  gameOver: boolean;
  nextRound?: {
    roundId: number;
    roundNumber: number;
    promptCardId: number;
    judgePlayerId: number;
    status: string;
  };
}

export class CahGameApi {
  private client: IApiClient;

  constructor(client: IApiClient) {
    this.client = client;
  }

  private getBaseUrl(code: string): string {
    return `/cards/cah/session/${code}/game`;
  }

  public urlForGetCurrentRound(code: string): string {
    return `${this.getBaseUrl(code)}/round/current`;
  }

  public async getCurrentRound(
    code: string,
  ): Promise<{ round: ICahRound | null }> {
    const { data } = await this.client.request<{ round: ICahRound | null }>(
      'GET',
      this.urlForGetCurrentRound(code),
    );
    return data;
  }

  public urlForGetPlayerHand(code: string, playerId: number): string {
    return `${this.getBaseUrl(code)}/player/${playerId}/hand`;
  }

  public async getPlayerHand(
    code: string,
    playerId: number,
  ): Promise<ICahPlayerHand> {
    const { data } = await this.client.request<ICahPlayerHand>(
      'GET',
      this.urlForGetPlayerHand(code, playerId),
    );
    return data;
  }

  public async startGame(
    code: string,
    playerId: number,
  ): Promise<StartGameResponse> {
    const { data } = await this.client.request<StartGameResponse>(
      'POST',
      `${this.getBaseUrl(code)}/start`,
      { playerId },
    );
    return data;
  }

  public async submitCards(
    code: string,
    roundId: number,
    playerId: number,
    cardIds: number[],
  ): Promise<SubmitCardsResponse> {
    const { data } = await this.client.request<SubmitCardsResponse>(
      'POST',
      `${this.getBaseUrl(code)}/round/${roundId}/submit`,
      { playerId, cardIds },
    );
    return data;
  }

  public async selectWinner(
    code: string,
    roundId: number,
    judgePlayerId: number,
    winningSubmissionId: number,
  ): Promise<SelectWinnerResponse> {
    const { data } = await this.client.request<SelectWinnerResponse>(
      'POST',
      `${this.getBaseUrl(code)}/round/${roundId}/judge`,
      { judgePlayerId, winningSubmissionId },
    );
    return data;
  }
}
