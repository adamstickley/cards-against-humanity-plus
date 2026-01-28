// import { AxiosPromise } from "axios";
// import { mutate } from "swr";

import { IApiClient } from './types';
import {
  CahApi,
  CahGameApi,
  CahSessionApi,
  DefaultApiClient,
  GameApi,
} from './clients';

export class Api {
  // public readonly User: UserApi;
  public readonly Game: GameApi;
  public readonly Cah: CahApi;
  public readonly CahGame: CahGameApi;
  public readonly CahSession: CahSessionApi;

  private readonly client: IApiClient;

  constructor(baseUrl: string, clientFactory = DefaultApiClient) {
    this.client = new clientFactory(baseUrl);
    // this.User = new UserApi(this.client);
    this.Game = new GameApi(this.client);
    this.Cah = new CahApi(this.client);
    this.CahGame = new CahGameApi(this.client);
    this.CahSession = new CahSessionApi(this.client);
  }
}
