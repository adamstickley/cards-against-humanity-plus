import React from 'react';
import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { TrophyIcon } from '@radix-ui/react-icons';
import { ICahSubmission, ICahPromptCard } from '../../types';

interface RoundWinnerProps {
  winnerNickname: string;
  winningSubmission: ICahSubmission;
  promptCard: ICahPromptCard;
}

export const RoundWinner: React.FC<RoundWinnerProps> = ({
  winnerNickname,
  winningSubmission,
  promptCard,
}) => {
  return (
    <Card
      size="3"
      style={{
        backgroundColor: 'var(--amber-2)',
        border: '2px solid var(--amber-9)',
      }}
    >
      <Flex direction="column" align="center" gap="3">
        <TrophyIcon width="32" height="32" color="gold" />
        <Heading size="4" align="center">
          {winnerNickname} wins this round!
        </Heading>

        <Box
          p="3"
          style={{
            backgroundColor: 'var(--gray-12)',
            color: 'white',
            borderRadius: 'var(--radius-3)',
            width: '100%',
          }}
        >
          <Text size="3" weight="medium">
            {promptCard.text}
          </Text>
        </Box>

        <Flex direction="column" gap="2" style={{ width: '100%' }}>
          {winningSubmission.cards?.map((card) => (
            <Box
              key={card.cardId}
              p="3"
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-3)',
                border: '1px solid var(--gray-6)',
              }}
            >
              <Text size="3">{card.text}</Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};
