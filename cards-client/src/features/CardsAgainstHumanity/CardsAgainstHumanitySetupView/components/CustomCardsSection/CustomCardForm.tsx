import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  RadioGroup,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { CustomCardType, ICustomCard } from '../../../types';

const MAX_CARD_LENGTH = 500;

interface CustomCardFormProps {
  onSubmit: (card: Omit<ICustomCard, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const CustomCardForm: React.FC<CustomCardFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const [cardType, setCardType] = useState<CustomCardType>('response');
  const [pick, setPick] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }
    onSubmit({
      text: text.trim(),
      cardType,
      pick: cardType === 'prompt' ? pick : undefined,
    });
    setText('');
    setCardType('response');
    setPick(1);
  };

  const isValid = text.trim().length > 0 && text.length <= MAX_CARD_LENGTH;

  return (
    <Card size="2">
      <form onSubmit={handleSubmit}>
        <Heading size="4" mb="3">
          Create Custom Card
        </Heading>

        <Box mb="4">
          <Text as="label" size="2" weight="medium" mb="1">
            Card Type
          </Text>
          <RadioGroup.Root
            value={cardType}
            onValueChange={(value) => setCardType(value as CustomCardType)}
          >
            <Flex gap="4" mt="2">
              <Flex align="center" gap="2">
                <RadioGroup.Item value="response" id="type-response" />
                <Text as="label" htmlFor="type-response" size="2">
                  Response (White)
                </Text>
              </Flex>
              <Flex align="center" gap="2">
                <RadioGroup.Item value="prompt" id="type-prompt" />
                <Text as="label" htmlFor="type-prompt" size="2">
                  Prompt (Black)
                </Text>
              </Flex>
            </Flex>
          </RadioGroup.Root>
        </Box>

        <Box mb="4">
          <Text as="label" size="2" weight="medium" mb="1">
            Card Text
          </Text>
          <Text as="p" size="1" color="gray" mb="1">
            {cardType === 'prompt'
              ? 'Use underscores (___) to indicate blanks for players to fill in'
              : 'Write the response that players will play'}
          </Text>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              cardType === 'prompt'
                ? 'What is the most embarrassing thing about ___?'
                : 'A really disappointing birthday party.'
            }
            maxLength={MAX_CARD_LENGTH}
            rows={3}
          />
          <Text size="1" color={text.length > MAX_CARD_LENGTH ? 'red' : 'gray'}>
            {text.length}/{MAX_CARD_LENGTH} characters
          </Text>
        </Box>

        {cardType === 'prompt' && (
          <Box mb="4">
            <Text as="label" size="2" weight="medium" mb="1">
              Cards to Pick
            </Text>
            <Text as="p" size="1" color="gray" mb="1">
              How many response cards must players submit?
            </Text>
            <TextField.Root
              type="number"
              value={pick.toString()}
              onChange={(e) =>
                setPick(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={3}
              style={{ width: '80px' }}
            />
          </Box>
        )}

        <Box mb="4">
          <Text as="label" size="2" weight="medium" mb="2">
            Preview
          </Text>
          <CardPreview text={text || '...'} cardType={cardType} pick={pick} />
        </Box>

        <Flex gap="3" justify="end">
          <Button type="button" variant="soft" color="gray" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid}>
            Add Card
          </Button>
        </Flex>
      </form>
    </Card>
  );
};

const CardPreview: React.FC<{
  text: string;
  cardType: CustomCardType;
  pick: number;
}> = ({ text, cardType, pick }) => {
  const isPrompt = cardType === 'prompt';

  return (
    <Box
      p="3"
      style={{
        backgroundColor: isPrompt ? 'var(--gray-12)' : 'white',
        color: isPrompt ? 'white' : 'var(--gray-12)',
        border: isPrompt ? 'none' : '1px solid var(--gray-6)',
        borderRadius: 'var(--radius-2)',
        minHeight: '80px',
      }}
    >
      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </Text>
      {isPrompt && pick > 1 && (
        <Text size="1" color="gray" mt="2" style={{ opacity: 0.7 }}>
          Pick {pick}
        </Text>
      )}
    </Box>
  );
};
