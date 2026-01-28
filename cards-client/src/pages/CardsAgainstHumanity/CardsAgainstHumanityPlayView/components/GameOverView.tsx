import React from 'react';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { ICahPlayer } from '../../types';

interface GameOverViewProps {
  winner: ICahPlayer;
  players: ICahPlayer[];
  onPlayAgain?: () => void;
  onBackToLobby?: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({
  winner,
  players,
  onPlayAgain,
  onBackToLobby,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Box p="6">
      <Flex direction="column" align="center" gap="6">
        <Heading size="8" align="center">
          Game Over!
        </Heading>

        <Card
          size="4"
          style={{
            backgroundColor: 'var(--amber-2)',
            border: '2px solid var(--amber-9)',
            textAlign: 'center',
          }}
        >
          <StarFilledIcon
            width="48"
            height="48"
            color="gold"
            style={{ marginBottom: '16px' }}
          />
          <Heading size="6" mb="2">
            {winner.nickname} Wins!
          </Heading>
          <Text size="4" color="gray">
            with {winner.score} points
          </Text>
        </Card>

        <Card size="3" style={{ width: '100%', maxWidth: '400px' }}>
          <Heading size="4" mb="4" align="center">
            Final Scores
          </Heading>
          <Flex direction="column" gap="2">
            {sortedPlayers.map((player, index) => (
              <Flex
                key={player.playerId}
                justify="between"
                align="center"
                p="3"
                style={{
                  backgroundColor:
                    index === 0 ? 'var(--amber-3)' : 'var(--gray-2)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <Flex align="center" gap="2">
                  <Text size="3" weight="bold" style={{ width: '30px' }}>
                    #{index + 1}
                  </Text>
                  <Text size="3" weight={index === 0 ? 'bold' : 'regular'}>
                    {player.nickname}
                  </Text>
                </Flex>
                <Flex align="center" gap="1">
                  <StarFilledIcon color={index === 0 ? 'gold' : 'gray'} />
                  <Text size="3" weight="bold">
                    {player.score}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Card>

        <Flex gap="3">
          {onPlayAgain && (
            <Button size="3" onClick={onPlayAgain}>
              Play Again
            </Button>
          )}
          {onBackToLobby && (
            <Button size="3" variant="outline" onClick={onBackToLobby}>
              Back to Lobby
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
