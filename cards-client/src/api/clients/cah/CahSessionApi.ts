import { IApiClient } from '../../types';
import { ICahPlayer } from '../../../features/CardsAgainstHumanity/types';

export interface ICahSessionSettings {
  scoreToWin: number;
  maxPlayers: number;
  cardsPerHand: number;
  roundTimerSeconds: number;
}

export interface ICahCardPack {
  cardSetId: number;
  title: string;
}

export interface ICahSession {
  code: string;
  sessionId: number;
  status: 'waiting' | 'in_progress' | 'completed';
  currentRound: number;
  settings: ICahSessionSettings;
  players: ICahPlayer[];
  cardPacks: ICahCardPack[];
  createdAt: string;
}

export interface ICreateSessionRequest {
  nickname: string;
  cardSetIds: number[];
  scoreToWin?: number;
  maxPlayers?: number;
  cardsPerHand?: number;
  roundTimerSeconds?: number;
}

export interface ICreateSessionResponse {
  code: string;
  sessionId: number;
  playerId: number;
  settings: ICahSessionSettings;
}

export interface IJoinSessionRequest {
  nickname: string;
}

export interface IJoinSessionResponse {
  code: string;
  sessionId: number;
  playerId: number;
  settings: ICahSessionSettings;
}

export interface IStartGameResponse {
  code: string;
  sessionId: number;
  status: string;
  currentRound: number;
}

export class CahSessionApi {
  private client: IApiClient;
  private baseUrl = '/cards/cah/session';

  constructor(client: IApiClient) {
    this.client = client;
  }

  public async createSession(
    request: ICreateSessionRequest,
  ): Promise<ICreateSessionResponse> {
    const { data } = await this.client.request<ICreateSessionResponse>(
      'POST',
      this.baseUrl,
      request,
    );
    return data;
  }

  public async joinSession(
    code: string,
    request: IJoinSessionRequest,
  ): Promise<IJoinSessionResponse> {
    const { data } = await this.client.request<IJoinSessionResponse>(
      'POST',
      `${this.baseUrl}/${code}/join`,
      request,
    );
    return data;
  }

  public urlForGetSession(code: string): string {
    return `${this.baseUrl}/${code}`;
  }

  public async getSession(code: string): Promise<ICahSession> {
    const { data } = await this.client.request<ICahSession>(
      'GET',
      this.urlForGetSession(code),
    );
    return data;
  }

  public async startGame(code: string): Promise<IStartGameResponse> {
    const { data } = await this.client.request<IStartGameResponse>(
      'POST',
      `${this.baseUrl}/${code}/start`,
    );
    return data;
  }

  public async getPlayers(code: string): Promise<ICahPlayer[]> {
    const { data } = await this.client.request<ICahPlayer[]>(
      'GET',
      `${this.baseUrl}/${code}/players`,
    );
    return data;
  }
}
