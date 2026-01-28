import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Link as RadixLink } from '@radix-ui/themes';
import { Preloader, useGame } from '../../hooks';
import { assertDefined } from '../../utils';
import { cahLocations } from '../../routing';
import { Page } from '../../components';

export const GameListView: React.FC = () => {
  const { gameName } = useParams<{ gameName: string }>();
  const [game, meta] = useGame(gameName);
  return (
    <Preloader {...meta}>
      {() => {
        assertDefined(game, 'game');
        return (
          <Page title={game.name}>
            <RadixLink asChild style={{ textDecoration: 'none' }}>
              <Link to={cahLocations.Cah.setup.generateLocation({})}>
                <Button>Start</Button>
              </Link>
            </RadixLink>
          </Page>
        );
      }}
    </Preloader>
  );
};
