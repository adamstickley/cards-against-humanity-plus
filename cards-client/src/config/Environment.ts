import { EnvironmentName } from './types';

interface Config {
  debug: boolean;
  apiBase: string;
  appBasePath: string;
  appDomain: string;
}

export class Environment {
  public readonly appDomain: string;
  protected readonly apiBase: string;
  protected readonly appBasePath: string;

  private readonly name: EnvironmentName;
  private readonly debug: boolean;

  constructor(name: EnvironmentName, config: Config) {
    this.name = name;
    this.debug = config.debug;
    this.apiBase = config.apiBase;
    this.appBasePath = config.appBasePath;
    this.appDomain = config.appDomain;
  }

  /***
   * returns the environment name: local, develop or master
   */
  public getName(): EnvironmentName {
    return this.name;
  }

  public get isProduction() {
    return this.name === 'master';
  }

  public isDebug() {
    return this.debug;
  }

  public generateApiRoute(pathname: string = '/') {
    this.validatePath(pathname);
    return this.apiBase + pathname;
  }

  public generateAppRoute(pathname: string = '/') {
    this.validatePath(pathname);
    return this.appBasePath + pathname;
  }

  private validatePath(pathname: string): never | void {
    if (!pathname.startsWith('/')) {
      throw new Error(
        `Attempt to generate path failed, make sure it starts with a '/'`,
      );
    }
  }
}
