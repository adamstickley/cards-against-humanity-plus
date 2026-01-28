import React from 'react';
import { Card, Flex, Text, Button, Callout } from '@radix-ui/themes';
import { InfoCircledIcon, PlayIcon } from '@radix-ui/react-icons';

interface GameControlsProps {
  isHost: boolean;
  playerCount: number;
  minPlayers: number;
  isStarting: boolean;
  onStartGame: () => void;
}

const MIN_PLAYERS_TO_START = 3;

export const GameControls: React.FC<GameControlsProps> = ({
  isHost,
  playerCount,
  minPlayers = MIN_PLAYERS_TO_START,
  isStarting,
  onStartGame,
}) => {
  const canStart = playerCount >= minPlayers;

  if (!isHost) {
    return (
      <Card size="2">
        <Flex direction="column" gap="3">
          <Text size="3" weight="bold">
            Waiting for Host
          </Text>
          <Callout.Root color="blue" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              The host will start the game when everyone is ready.
            </Callout.Text>
          </Callout.Root>
        </Flex>
      </Card>
    );
  }

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Text size="3" weight="bold">
          Start Game
        </Text>

        {!canStart && (
          <Callout.Root color="amber" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              You need at least {minPlayers} players to start the game.
              Currently {playerCount} player{playerCount !== 1 ? 's' : ''} in
              the lobby.
            </Callout.Text>
          </Callout.Root>
        )}

        {canStart && (
          <Callout.Root color="green" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Ready to start with {playerCount} players!
            </Callout.Text>
          </Callout.Root>
        )}

        <Button
          size="3"
          disabled={!canStart || isStarting}
          onClick={onStartGame}
        >
          <PlayIcon />
          {isStarting ? 'Starting...' : 'Start Game'}
        </Button>
      </Flex>
    </Card>
  );
};
