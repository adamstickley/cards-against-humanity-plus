import { AppRouteLocation, RouteParams } from "../locations";

class BaseLocation<
  TParams extends RouteParams = any,
  TSearch extends RouteParams = any,
  TState = {} | null | undefined
> extends AppRouteLocation<TParams, TSearch, TState> {
  constructor(path: string, title?: string) {
    super("", path, title);
  }
}

class BaseRouteLocations {
  /**
   * Game Routes
   */
  public Root = {
    root: new BaseLocation("", "Cards"),
  };
}

export const baseLocations = new BaseRouteLocations();
