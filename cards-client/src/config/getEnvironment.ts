import { EnvironmentConfigurator } from './EnvironmentConfigurator';
import { Environment } from './Environment';

export const getEnvironment = (): Environment => {
  return EnvironmentConfigurator.getEnvironment();
};
