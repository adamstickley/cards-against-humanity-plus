import { Environment } from './Environment';

export const Local = new Environment('local', {
  debug: true,
  apiBase: 'http://localhost:3001',
  appBasePath: 'http://localhost:3000',
  appDomain: 'localhost:3000',
});
