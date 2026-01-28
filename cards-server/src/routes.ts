import { CahModule, CardsModule } from './resources';

export const routes = [
  {
    path: 'cards',
    module: CardsModule,
    children: [
      {
        path: 'cah',
        module: CahModule,
      },
    ],
  },
];
