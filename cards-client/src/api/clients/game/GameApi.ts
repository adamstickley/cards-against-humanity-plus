import { IApiClient } from '../../types';

export class GameApi {
  private client: IApiClient;

  private baseUrl = '/game';

  constructor(client: IApiClient) {
    this.client = client;
  }

  public urlForGet(gameName: string): string {
    return `${this.baseUrl}/${gameName}`;
  }

  public async get(gameName: string) {
    // TODO: type
    const { data } = await this.client.request<any>(
      'GET',
      this.urlForGet(gameName),
    );
    return data;
  }

  public urlForGetAll() {
    return this.baseUrl;
  }

  public async getAll() {
    // TODO: type
    const { data } = await this.client.request<any>('GET', this.urlForGetAll());
    return data;
  }
}
