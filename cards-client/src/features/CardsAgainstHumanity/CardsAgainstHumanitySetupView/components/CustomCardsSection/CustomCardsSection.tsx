import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
} from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { ICustomCard } from '../../../types';
import { CustomCardForm } from './CustomCardForm';

interface CustomCardsSectionProps {
  cards: ICustomCard[];
  onAddCard: (card: Omit<ICustomCard, 'id' | 'createdAt'>) => void;
  onRemoveCard: (cardId: string) => void;
}

export const CustomCardsSection: React.FC<CustomCardsSectionProps> = ({
  cards,
  onAddCard,
  onRemoveCard,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const promptCards = cards.filter((c) => c.cardType === 'prompt');
  const responseCards = cards.filter((c) => c.cardType === 'response');

  const handleAddCard = (card: Omit<ICustomCard, 'id' | 'createdAt'>) => {
    onAddCard(card);
    setIsFormOpen(false);
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="3">
        <Heading size="6">Custom Cards</Heading>
        <Button
          variant="soft"
          onClick={() => setIsFormOpen(true)}
          disabled={isFormOpen}
        >
          <PlusIcon />
          Add Card
        </Button>
      </Flex>

      <Text size="2" color="gray" mb="4" as="p">
        Create your own cards to use in this game. Custom cards are saved in
        your browser and will be available for future games.
      </Text>

      {isFormOpen && (
        <Box mb="4">
          <CustomCardForm
            onSubmit={handleAddCard}
            onCancel={() => setIsFormOpen(false)}
          />
        </Box>
      )}

      {cards.length === 0 && !isFormOpen && <EmptyState />}

      {cards.length > 0 && (
        <Flex direction="column" gap="4">
          {promptCards.length > 0 && (
            <CardList
              title="Prompt Cards (Black)"
              cards={promptCards}
              onRemove={onRemoveCard}
              variant="prompt"
            />
          )}
          {responseCards.length > 0 && (
            <CardList
              title="Response Cards (White)"
              cards={responseCards}
              onRemove={onRemoveCard}
              variant="response"
            />
          )}
        </Flex>
      )}

      {cards.length > 0 && (
        <Flex gap="2" mt="3">
          <Badge color="gray" size="1">
            {promptCards.length} prompt{promptCards.length !== 1 ? 's' : ''}
          </Badge>
          <Badge color="gray" size="1">
            {responseCards.length} response
            {responseCards.length !== 1 ? 's' : ''}
          </Badge>
        </Flex>
      )}
    </Box>
  );
};

const EmptyState: React.FC = () => (
  <Card>
    <Flex direction="column" align="center" py="6">
      <Text size="2" color="gray" mb="2">
        No custom cards yet
      </Text>
      <Text size="1" color="gray">
        Click "Add Card" to create your first custom card
      </Text>
    </Flex>
  </Card>
);

const CardList: React.FC<{
  title: string;
  cards: ICustomCard[];
  onRemove: (id: string) => void;
  variant: 'prompt' | 'response';
}> = ({ title, cards, onRemove, variant }) => {
  const isPrompt = variant === 'prompt';

  return (
    <Box>
      <Text size="2" weight="medium" mb="2">
        {title}
      </Text>
      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="2">
        {cards.map((card) => (
          <Box
            key={card.id}
            p="3"
            style={{
              backgroundColor: isPrompt ? 'var(--gray-12)' : 'white',
              color: isPrompt ? 'white' : 'var(--gray-12)',
              border: isPrompt ? 'none' : '1px solid var(--gray-6)',
              borderRadius: 'var(--radius-2)',
              position: 'relative',
            }}
          >
            <IconButton
              size="1"
              variant="ghost"
              color={isPrompt ? 'gray' : 'gray'}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
              }}
              onClick={() => onRemove(card.id)}
            >
              <Cross2Icon />
            </IconButton>
            <Text
              size="2"
              style={{
                whiteSpace: 'pre-wrap',
                paddingRight: '20px',
              }}
            >
              {card.text}
            </Text>
            {isPrompt && card.pick && card.pick > 1 && (
              <Text size="1" mt="2" style={{ opacity: 0.7, display: 'block' }}>
                Pick {card.pick}
              </Text>
            )}
          </Box>
        ))}
      </Grid>
    </Box>
  );
};
