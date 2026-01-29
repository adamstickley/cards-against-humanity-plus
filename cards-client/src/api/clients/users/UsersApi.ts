import { IApiClient } from '../../types';

export interface IUser {
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ISyncUserRequest {
  clerkUserId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface IUserPreferences {
  clerkUserId: string;
  preferredNickname: string | null;
  defaultScoreToWin: number;
  defaultMaxPlayers: number;
  defaultCardsPerHand: number;
  defaultRoundTimerSeconds: number | null;
  updatedAt?: string;
}

export interface IUpdatePreferencesRequest {
  preferredNickname?: string;
  defaultScoreToWin?: number;
  defaultMaxPlayers?: number;
  defaultCardsPerHand?: number;
  defaultRoundTimerSeconds?: number;
}

export class UsersApi {
  private client: IApiClient;
  private baseUrl = '/users';

  constructor(client: IApiClient) {
    this.client = client;
  }

  public urlForSync(): string {
    return `${this.baseUrl}/sync`;
  }

  public urlForUser(clerkUserId: string): string {
    return `${this.baseUrl}/${clerkUserId}`;
  }

  public async syncUser(request: ISyncUserRequest): Promise<IUser> {
    const { data } = await this.client.request<IUser>(
      'POST',
      this.urlForSync(),
      request,
    );
    return data;
  }

  public async getUser(clerkUserId: string): Promise<IUser> {
    const { data } = await this.client.request<IUser>(
      'GET',
      this.urlForUser(clerkUserId),
    );
    return data;
  }

  public async updateDisplayName(
    clerkUserId: string,
    displayName: string,
  ): Promise<IUser> {
    const { data } = await this.client.request<IUser>(
      'PATCH',
      `${this.baseUrl}/${clerkUserId}/display-name`,
      { displayName },
    );
    return data;
  }

  public urlForPreferences(clerkUserId: string): string {
    return `${this.baseUrl}/${clerkUserId}/preferences`;
  }

  public async getPreferences(clerkUserId: string): Promise<IUserPreferences> {
    const { data } = await this.client.request<IUserPreferences>(
      'GET',
      this.urlForPreferences(clerkUserId),
    );
    return data;
  }

  public async updatePreferences(
    clerkUserId: string,
    request: IUpdatePreferencesRequest,
  ): Promise<IUserPreferences> {
    const { data } = await this.client.request<IUserPreferences>(
      'PUT',
      this.urlForPreferences(clerkUserId),
      request,
    );
    return data;
  }
}
