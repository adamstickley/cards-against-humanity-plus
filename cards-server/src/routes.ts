import { CahModule, CardsModule, UsersModule } from './resources';

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
  {
    path: 'users',
    module: UsersModule,
  },
];
