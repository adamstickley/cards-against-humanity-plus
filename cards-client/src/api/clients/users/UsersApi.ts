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
}
