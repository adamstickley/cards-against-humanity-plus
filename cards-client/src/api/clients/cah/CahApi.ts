import { IApiClient } from '../../types';

export class CahApi {
  private client: IApiClient;

  private baseUrl = '/cards/cah';
  private baseSetUrl = this.baseUrl + '/set';

  constructor(client: IApiClient) {
    this.client = client;
  }

  public urlForGetSet(cardSetId: number): string {
    return this.baseSetUrl + '/' + cardSetId;
  }

  public async getSet(cardSetId: number) {
    // TODO: type
    const { data } = await this.client.request<any>(
      'GET',
      this.urlForGetSet(cardSetId),
    );
    return data;
  }

  public urlForGetAllSets() {
    return this.baseSetUrl;
  }

  public async getAllSets() {
    // TODO: type
    const { data } = await this.client.request<any>(
      'GET',
      this.urlForGetAllSets(),
    );
    return data;
  }
}
