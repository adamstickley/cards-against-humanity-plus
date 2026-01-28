import React from 'react';
import { Badge, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { CahRoundStatus } from '../../types';

interface RoundStatusProps {
  roundNumber: number;
  status: CahRoundStatus;
  judgeName: string;
  submissionsCount: number;
  totalPlayers: number;
}

const getStatusBadge = (status: CahRoundStatus) => {
  switch (status) {
    case 'pending':
      return <Badge color="gray">Starting</Badge>;
    case 'submissions':
      return <Badge color="blue">Submitting</Badge>;
    case 'judging':
      return <Badge color="amber">Judging</Badge>;
    case 'complete':
      return <Badge color="green">Complete</Badge>;
    default:
      return null;
  }
};

const getStatusText = (
  status: CahRoundStatus,
  submissionsCount: number,
  totalPlayers: number,
) => {
  switch (status) {
    case 'pending':
      return 'Round is starting...';
    case 'submissions':
      return `${submissionsCount}/${totalPlayers - 1} players have submitted`;
    case 'judging':
      return 'Card Czar is choosing a winner';
    case 'complete':
      return 'Round complete!';
    default:
      return '';
  }
};

export const RoundStatus: React.FC<RoundStatusProps> = ({
  roundNumber,
  status,
  judgeName,
  submissionsCount,
  totalPlayers,
}) => {
  return (
    <Card size="2">
      <Flex justify="between" align="center" mb="2">
        <Heading size="3">Round {roundNumber}</Heading>
        {getStatusBadge(status)}
      </Flex>
      <Text size="2" color="gray" mb="2">
        Card Czar: <Text weight="medium">{judgeName}</Text>
      </Text>
      <Text size="2" color="gray">
        {getStatusText(status, submissionsCount, totalPlayers)}
      </Text>
    </Card>
  );
};
