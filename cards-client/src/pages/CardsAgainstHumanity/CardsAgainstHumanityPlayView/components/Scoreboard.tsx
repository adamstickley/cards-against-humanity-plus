import React from 'react';
import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { PersonIcon, StarFilledIcon } from '@radix-ui/react-icons';

interface ScoreboardPlayer {
  playerId: number;
  nickname: string;
  score: number;
  isHost: boolean;
  isConnected: boolean;
}

interface ScoreboardProps {
  players: ScoreboardPlayer[];
  currentPlayerId?: number;
  judgePlayerId?: number;
  scoreToWin: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPlayerId,
  judgePlayerId,
  scoreToWin,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card size="2">
      <Heading size="3" mb="3">
        Scoreboard
      </Heading>
      <Text size="1" color="gray" mb="3">
        First to {scoreToWin} wins
      </Text>
      <Flex direction="column" gap="2">
        {sortedPlayers.map((player, index) => {
          const isCurrentPlayer = player.playerId === currentPlayerId;
          const isJudge = player.playerId === judgePlayerId;

          return (
            <Flex
              key={player.playerId}
              justify="between"
              align="center"
              p="2"
              style={{
                backgroundColor: isCurrentPlayer
                  ? 'var(--accent-3)'
                  : 'var(--gray-2)',
                borderRadius: 'var(--radius-2)',
              }}
            >
              <Flex align="center" gap="2">
                <Text size="2" weight="medium" style={{ width: '20px' }}>
                  {index + 1}.
                </Text>
                <PersonIcon />
                <Text size="2" weight={isCurrentPlayer ? 'bold' : 'regular'}>
                  {player.nickname}
                  {isCurrentPlayer && ' (You)'}
                </Text>
                {isJudge && (
                  <Box
                    px="2"
                    py="1"
                    style={{
                      backgroundColor: 'var(--amber-9)',
                      borderRadius: 'var(--radius-2)',
                      fontSize: '10px',
                      color: 'white',
                    }}
                  >
                    Czar
                  </Box>
                )}
              </Flex>
              <Flex align="center" gap="1">
                <StarFilledIcon color="gold" />
                <Text size="2" weight="bold">
                  {player.score}
                </Text>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Card>
  );
};
