import React from 'react';
import { Box, Button, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { ICahCard } from '../../types';
import { ResponseCard } from './ResponseCard';

interface PlayerHandProps {
  cards: ICahCard[];
  selectedCardIds: number[];
  requiredCards: number;
  onCardSelect: (cardId: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  isJudge: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCardIds,
  requiredCards,
  onCardSelect,
  onSubmit,
  isSubmitting,
  hasSubmitted,
  isJudge,
}) => {
  const canSubmit = selectedCardIds.length === requiredCards && !hasSubmitted;

  if (isJudge) {
    return (
      <Box p="4">
        <Heading size="4" mb="3" align="center">
          You are the Card Czar
        </Heading>
        <Text size="3" color="gray" align="center">
          Wait for other players to submit their cards, then pick your favorite.
        </Text>
      </Box>
    );
  }

  if (hasSubmitted) {
    return (
      <Box p="4">
        <Heading size="4" mb="3" align="center">
          Cards Submitted!
        </Heading>
        <Text size="3" color="gray" align="center">
          Waiting for other players to submit their cards...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="between" align="center" mb="3">
        <Heading size="4">Your Hand</Heading>
        <Text size="2" color="gray">
          Select {requiredCards} card{requiredCards > 1 ? 's' : ''} (
          {selectedCardIds.length}/{requiredCards})
        </Text>
      </Flex>

      <Grid
        columns={{ initial: '2', sm: '3', md: '4', lg: '5' }}
        gap="3"
        mb="4"
      >
        {cards.map((card) => {
          const selectionIndex = selectedCardIds.indexOf(card.cardId);
          const isSelected = selectionIndex !== -1;

          return (
            <ResponseCard
              key={card.cardId}
              card={card}
              selected={isSelected}
              selectionOrder={isSelected ? selectionIndex + 1 : undefined}
              onClick={() => onCardSelect(card.cardId)}
              disabled={isSubmitting}
            />
          );
        })}
      </Grid>

      <Flex justify="center">
        <Button
          size="3"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
          style={{ minWidth: '150px' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Cards'}
        </Button>
      </Flex>
    </Box>
  );
};
