import _ from 'lodash';
import stringify from 'qs-stringify';
import { generatePath } from 'react-router-dom';

export interface LocationDescriptorObject<S> {
  pathname?: string;
  search?: string;
  state?: S;
  hash?: string;
  key?: string;
}

const SPLIT_REGEX = new RegExp('[/?&]');

export interface RouteParams {
  [paramName: string]: string | number | undefined;
}
interface RouteParamsStrict {
  [paramName: string]: string | undefined;
}

const wildcard = '/*';

export class BaseRouteLocation<
  TParams extends RouteParams,
  TSearch extends RouteParams,
  TState = any,
> {
  public readonly base: string;

  public readonly baseWildcard: string;

  public readonly path: string;

  public readonly pathWildcard: string;

  public readonly fullPath: string;

  public readonly defaultSearch?: RouteParams;

  constructor(base: string, path: string, search?: RouteParams) {
    this.base = base.startsWith('/') ? base : `/${base}`;
    this.path = path;
    this.fullPath = `${this.base}${path ? `/${path}` : ''}`;
    this.baseWildcard = this.base + wildcard;
    this.pathWildcard = path + wildcard;
    // console.log("PROPS:");
    // console.log("WINDOW.location.pathname:", window.location.pathname);
    // console.log("this.base", this.base);
    // console.log("this.path", this.path);
    // console.log("this.fullPath", this.fullPath);
    // console.log("this.baseWildcard", this.baseWildcard);
    // console.log("this.pathWildcard", this.pathWildcard);

    this.defaultSearch = search;
  }

  public get absolutePath(): string {
    const { origin } = window.location;
    return origin + this.fullPath;
  }

  public absolutePathWithParams(
    args: { params: TParams; search?: TSearch } | TParams,
  ) {
    const path = this.generatePath(args);
    const { origin } = window.location;
    return origin + path;
  }

  public generatePath(
    args: { params: TParams; search?: TSearch } | TParams,
  ): string {
    const { search, params } = args.params
      ? (args as { params: TParams; search?: TSearch })
      : { params: args as TParams, search: {} };
    try {
      const queryString = stringify({ ...search, ...this.defaultSearch });
      const parsedParams = Object.keys(params).reduce<RouteParamsStrict>(
        (agg, paramKey) => {
          const param = params[paramKey];
          agg[paramKey] = _.isNumber(param) ? param.toString() : param;
          return agg;
        },
        {},
      );
      return (
        generatePath(this.fullPath, parsedParams) +
        (queryString ? `?${queryString}` : '')
      );
    } catch (e) {
      if (e instanceof TypeError) {
        console.error(
          `Missing parameters when generating path for ${this.fullPath}`,
          params,
        );
        // a required parameter was not passed
        return '';
      }
      throw e;
    }
  }

  public generateLocation(args: {
    params?: TParams;
    search?: TSearch;
    state?: TState;
  }): LocationDescriptorObject<TState> {
    const { params, search, state } = args;
    const queryString = stringify({ ...search, ...this.defaultSearch });
    return {
      pathname: params ? this.generatePath({ params }) : this.fullPath,
      search: queryString,
      state,
    };
  }

  // Given a path, return true if this path matches either exactly or it matches based on parameter components
  public matchesPath(testPath: string) {
    // If the paths are the same then it is a match
    const matchesPath = _.isEqual(testPath, this.fullPath);

    if (matchesPath) {
      return true;
    }

    // If they are not the same, we need to check a parametrised path
    const pathComponents = _.split(this.fullPath, SPLIT_REGEX);
    const testPathComponents = _.split(testPath, SPLIT_REGEX);

    if (pathComponents.length !== testPathComponents.length) {
      return false;
    }

    return pathComponents.every((c, index) => {
      const testPathComponent = testPathComponents[index];

      const componentsAreEqual = _.isEqual(c, testPathComponent);
      const isParamValue = _.includes(c, ':');

      return componentsAreEqual || isParamValue;
    });
  }
}
