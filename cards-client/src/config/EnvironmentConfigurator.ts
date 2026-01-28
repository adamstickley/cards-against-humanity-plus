import { Develop } from './Develop';
import { Environment } from './Environment';
import { Local } from './Local';
import { Master } from './Master';
import { EnvironmentName } from './types';

export class EnvironmentConfigurator {
  private static environment: Environment;

  private static setEnvironment = (environment: Environment): void => {
    EnvironmentConfigurator.environment = environment;
  };

  public static getEnvironment = (): Environment => {
    if (!EnvironmentConfigurator.environment) {
      const stage = process.env.REACT_APP_STAGE || process.env.STAGE;
      const message =
        'There is no process.env.STAGE or process.env.REACT_APP_STAGE set.';
      if (!stage) {
        if (
          typeof window !== 'undefined' &&
          window.location.hostname.includes('localhost')
        ) {
          throw new Error(message);
        } else {
          console.error(message + 'Returning master configuration.');
          EnvironmentConfigurator.configureByStage('master');
        }
      } else {
        EnvironmentConfigurator.configureByStage(
          (stage as EnvironmentName) || 'master',
        );
      }
    }

    return EnvironmentConfigurator.environment;
  };

  public static configureByStage = (stage: EnvironmentName): void => {
    if (
      EnvironmentConfigurator.environment &&
      EnvironmentConfigurator.environment.getName() !== stage
    ) {
      console.warn(
        `Environment was configured as ${EnvironmentConfigurator.environment.getName()} and is being re-configured as ${stage}`,
      );
    }
    switch (stage) {
      case 'local':
        EnvironmentConfigurator.setEnvironment(Local);
        return;

      case 'develop':
        EnvironmentConfigurator.setEnvironment(Develop);
        return;

      default:
        EnvironmentConfigurator.setEnvironment(Master);
        return;
    }
  };
}
