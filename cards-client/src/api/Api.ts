import { IApiClient } from './types';
import {
  CahApi,
  CahGameApi,
  CahSessionApi,
  DefaultApiClient,
  GameApi,
  UsersApi,
} from './clients';

export class Api {
  public readonly Game: GameApi;
  public readonly Cah: CahApi;
  public readonly CahGame: CahGameApi;
  public readonly CahSession: CahSessionApi;
  public readonly Users: UsersApi;

  private readonly client: IApiClient;

  constructor(baseUrl: string, clientFactory = DefaultApiClient) {
    this.client = new clientFactory(baseUrl);
    this.Game = new GameApi(this.client);
    this.Cah = new CahApi(this.client);
    this.CahGame = new CahGameApi(this.client);
    this.CahSession = new CahSessionApi(this.client);
    this.Users = new UsersApi(this.client);
  }
}
