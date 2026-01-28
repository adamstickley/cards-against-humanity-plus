import React from 'react';
import { Grid, Box } from '@radix-ui/themes';
import { Preloader, useGames } from '../../../hooks';
import { assertDefined } from '../../../utils';
import { GameGridItem } from './GameGridItem';

export interface IGameGridProps {}

export const GameGrid: React.FC<IGameGridProps> = () => {
  const [games, meta] = useGames();

  return (
    <Preloader {...meta}>
      {() => {
        assertDefined(games, 'games');
        return (
          <Grid
            columns={{ initial: '1', xs: '1', sm: '2', md: '3', lg: '4' }}
            gap="4"
            key={1}
          >
            {games.map((game, i) => (
              <Box key={i}>
                <GameGridItem game={game} />
              </Box>
            ))}
          </Grid>
        );
      }}
    </Preloader>
  );
};
