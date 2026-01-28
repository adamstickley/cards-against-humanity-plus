import { BaseRouteLocation, RouteParams } from "./BaseRouteLocation";
import { HOST } from "./Environment";

export class AppRouteLocation<
  TParams extends RouteParams = any,
  TSearch extends RouteParams = any,
  TState = {} | null | undefined
> extends BaseRouteLocation<TParams, TSearch, TState> {
  private readonly baseTitle = "Games";

  public exact: boolean;

  public title: string;

  public readonly canonical: string;

  constructor(
    base: string,
    subPath: string,
    title?: string,
    exact: boolean = true
  ) {
    super(base, subPath);
    this.exact = exact;
    this.title = title ? `${title} | ${this.baseTitle}` : this.baseTitle;

    // Not worth the effort to be environment specific
    this.canonical = HOST + this.path;
  }

  public pathWithHash(hash: string) {
    return { pathname: this.path, hash };
  }
}
