import { AppRouteLocation, RouteParams } from "../locations";

class CahLocation<
  TParams extends RouteParams = any,
  TSearch extends RouteParams = any,
  TState = {} | null | undefined
> extends AppRouteLocation<TParams, TSearch, TState> {
  constructor(path: string, title?: string) {
    super("cah", path, title);
  }
}

class CahRouteLocations {
  /**
   * Cah Routes
   */
  public Cah = {
    root: new CahLocation("", "Cards Against Humanity"),
    setup: new CahLocation("setup", "Cards Against Humanity"),
    play: new CahLocation("play", "Cards Against Humanity"),
  };
}

export const cahLocations = new CahRouteLocations();
