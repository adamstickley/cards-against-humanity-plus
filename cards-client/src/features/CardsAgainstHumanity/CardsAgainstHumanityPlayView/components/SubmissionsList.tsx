import React from 'react';
import { Box, Button, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { ICahSubmission } from '../../types';

interface SubmissionsListProps {
  submissions: ICahSubmission[];
  isJudge: boolean;
  selectedSubmissionId: number | null;
  onSelectSubmission: (submissionId: number) => void;
  onConfirmWinner: () => void;
  isSelecting: boolean;
  revealCards: boolean;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  isJudge,
  selectedSubmissionId,
  onSelectSubmission,
  onConfirmWinner,
  isSelecting,
  revealCards,
}) => {
  if (!revealCards) {
    return (
      <Box p="4">
        <Heading size="4" mb="3" align="center">
          Submissions
        </Heading>
        <Grid columns={{ initial: '2', sm: '3', md: '4' }} gap="3">
          {submissions.map((submission) => (
            <Card
              key={submission.submissionId}
              size="2"
              style={{
                minHeight: '100px',
                backgroundColor: 'var(--gray-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="2" color="gray">
                {submission.playerNickname} submitted
              </Text>
            </Card>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="4" mb="3" align="center">
        {isJudge ? 'Pick Your Favorite' : 'Waiting for Card Czar to decide...'}
      </Heading>

      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4" mb="4">
        {submissions.map((submission) => {
          const isSelected = selectedSubmissionId === submission.submissionId;

          return (
            <Card
              key={submission.submissionId}
              size="3"
              onClick={
                isJudge && !isSelecting
                  ? () => onSelectSubmission(submission.submissionId)
                  : undefined
              }
              style={{
                cursor: isJudge && !isSelecting ? 'pointer' : 'default',
                border: isSelected
                  ? '2px solid var(--accent-9)'
                  : '1px solid var(--gray-6)',
                backgroundColor: isSelected ? 'var(--accent-2)' : 'white',
                transition: 'all 0.15s ease',
              }}
            >
              <Flex direction="column" gap="2">
                {submission.cards?.map((card, index) => (
                  <Box
                    key={card.cardId}
                    p="2"
                    style={{
                      backgroundColor: 'var(--gray-2)',
                      borderRadius: 'var(--radius-2)',
                    }}
                  >
                    <Text size="3">{card.text}</Text>
                  </Box>
                ))}
              </Flex>
            </Card>
          );
        })}
      </Grid>

      {isJudge && (
        <Flex justify="center">
          <Button
            size="3"
            disabled={selectedSubmissionId === null || isSelecting}
            onClick={onConfirmWinner}
            style={{ minWidth: '150px' }}
          >
            {isSelecting ? 'Selecting...' : 'Select Winner'}
          </Button>
        </Flex>
      )}
    </Box>
  );
};
