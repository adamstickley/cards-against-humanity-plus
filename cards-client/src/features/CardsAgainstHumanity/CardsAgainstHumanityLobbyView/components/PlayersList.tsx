import React from 'react';
import { Card, Flex, Text, Badge } from '@radix-ui/themes';
import {
  CheckCircledIcon,
  CrossCircledIcon,
  StarFilledIcon,
} from '@radix-ui/react-icons';
import { ICahPlayer } from '../../types';

interface PlayersListProps {
  players: ICahPlayer[];
  currentPlayerId?: number;
  maxPlayers: number;
}

export const PlayersList: React.FC<PlayersListProps> = ({
  players,
  currentPlayerId,
  maxPlayers,
}) => {
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Text size="3" weight="bold">
            Players
          </Text>
          <Badge color="gray" size="1">
            {players.length} / {maxPlayers}
          </Badge>
        </Flex>

        <Flex direction="column" gap="2">
          {players.map((player) => (
            <Flex
              key={player.playerId}
              align="center"
              justify="between"
              p="2"
              style={{
                backgroundColor:
                  player.playerId === currentPlayerId
                    ? 'var(--accent-3)'
                    : 'var(--gray-2)',
                borderRadius: 'var(--radius-2)',
              }}
            >
              <Flex align="center" gap="2">
                <Text weight="medium">{player.nickname}</Text>
                {player.isHost && (
                  <Badge color="amber" size="1">
                    <Flex align="center" gap="1">
                      <StarFilledIcon width={10} height={10} />
                      Host
                    </Flex>
                  </Badge>
                )}
                {player.playerId === currentPlayerId && (
                  <Badge color="blue" size="1">
                    You
                  </Badge>
                )}
              </Flex>
              <Flex align="center" gap="1">
                {player.isConnected ? (
                  <CheckCircledIcon color="var(--green-9)" />
                ) : (
                  <CrossCircledIcon color="var(--red-9)" />
                )}
              </Flex>
            </Flex>
          ))}

          {players.length === 0 && (
            <Text size="2" color="gray" align="center">
              No players have joined yet
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
