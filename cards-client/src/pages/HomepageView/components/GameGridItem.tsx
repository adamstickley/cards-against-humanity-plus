import { Card, Heading, Link, Text } from '@radix-ui/themes';
import { Link as RouterLink } from 'react-router-dom';
import { IGame } from '../../../types';
import { gameLocations } from '../../../routing';

export interface IGameGridItemProps {
  game: IGame;
}

export const GameGridItem: React.FC<IGameGridItemProps> = ({ game }) => (
  <Link asChild style={{ textDecoration: 'none' }}>
    <RouterLink
      to={gameLocations.Game.game.generateLocation({
        params: { gameName: game.slug },
      })}
    >
      <Card
        size="2"
        style={{
          height: '100%',
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <Heading size="5" mb="2">
          {game.name}
        </Heading>
        <Text as="p" my="3">
          {game.description}
        </Text>
      </Card>
    </RouterLink>
  </Link>
);
