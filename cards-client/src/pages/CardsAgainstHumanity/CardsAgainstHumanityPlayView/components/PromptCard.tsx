import React from 'react';
import { Box, Card, Text } from '@radix-ui/themes';
import { ICahPromptCard } from '../../types';

interface PromptCardProps {
  card: ICahPromptCard;
}

export const PromptCard: React.FC<PromptCardProps> = ({ card }) => {
  return (
    <Card
      size="3"
      style={{
        backgroundColor: 'var(--gray-12)',
        color: 'white',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Text size="5" weight="bold" style={{ lineHeight: 1.4 }}>
        {card.text}
      </Text>
      {card.pick > 1 && (
        <Box mt="3">
          <Text size="2" color="gray">
            Pick {card.pick}
          </Text>
        </Box>
      )}
    </Card>
  );
};
