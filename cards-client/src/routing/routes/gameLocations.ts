import { AppRouteLocation, RouteParams } from "../locations";

class GameLocation<
  TParams extends RouteParams = any,
  TSearch extends RouteParams = any,
  TState = {} | null | undefined
> extends AppRouteLocation<TParams, TSearch, TState> {
  constructor(path: string, title?: string) {
    super("game", path, title);
  }
}

class GameRouteLocations {
  /**
   * Game Routes
   */
  public Game = {
    root: new GameLocation("", "Game"),
    game: new GameLocation<{ gameName: string }>(":gameName", "Game"),
  };
}

export const gameLocations = new GameRouteLocations();
