import { EnvironmentName } from './types';
import { Develop } from './Develop';
import { Environment } from './Environment';
import { Local } from './Local';
import { Master } from './Master';

export const Environments: Map<EnvironmentName, Environment> = new Map([
  [Master.getName(), Master],
  [Develop.getName(), Develop],
  [Local.getName(), Local],
]);
