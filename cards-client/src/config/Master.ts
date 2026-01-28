import { Environment } from './Environment';

export const Master = new Environment('master', {
  debug: false,
  apiBase: 'https://api.cardsonline.io',
  appBasePath: 'https://app.cardsonline.io',
  appDomain: 'app.cardsonline.io',
});
