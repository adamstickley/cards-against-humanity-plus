import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useApiContext } from '../../../api';
import { useCahCurrentRound, useCahPlayerHand } from '../hooks';
import { ICahPlayer } from '../types';
import {
  PromptCard,
  PlayerHand,
  SubmissionsList,
  Scoreboard,
  RoundStatus,
  RoundWinner,
} from './components';

// TODO: This should come from session storage or context after joining
const MOCK_CURRENT_PLAYER_ID = 1;
const MOCK_PLAYERS: ICahPlayer[] = [
  { playerId: 1, nickname: 'You', score: 0, isHost: true, isConnected: true },
  {
    playerId: 2,
    nickname: 'Player 2',
    score: 0,
    isHost: false,
    isConnected: true,
  },
  {
    playerId: 3,
    nickname: 'Player 3',
    score: 0,
    isHost: false,
    isConnected: true,
  },
];
const MOCK_SCORE_TO_WIN = 7;

export const CardsAgainstHumanityPlayView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const api = useApiContext();

  const [roundData, roundMeta] = useCahCurrentRound(code);
  const [handData, handMeta] = useCahPlayerHand(code, MOCK_CURRENT_PLAYER_ID);

  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);

  const round = roundData?.round;
  const hand = handData?.cards || [];

  const isJudge = round?.judge.playerId === MOCK_CURRENT_PLAYER_ID;
  const hasSubmitted = useMemo(() => {
    if (!round) {
      return false;
    }
    return round.submissions.some((s) => s.playerId === MOCK_CURRENT_PLAYER_ID);
  }, [round]);

  const requiredCards = round?.promptCard.pick || 1;

  const handleCardSelect = useCallback(
    (cardId: number) => {
      setSelectedCardIds((prev) => {
        const index = prev.indexOf(cardId);
        if (index !== -1) {
          return prev.filter((id) => id !== cardId);
        }
        if (prev.length >= requiredCards) {
          return [...prev.slice(1), cardId];
        }
        return [...prev, cardId];
      });
    },
    [requiredCards],
  );

  const handleSubmitCards = useCallback(async () => {
    if (!code || !round || selectedCardIds.length !== requiredCards) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.CahGame.submitCards(
        code,
        round.roundId,
        MOCK_CURRENT_PLAYER_ID,
        selectedCardIds,
      );
      setSelectedCardIds([]);
    } catch (error) {
      console.error('Failed to submit cards:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, round, selectedCardIds, requiredCards, api]);

  const handleSelectSubmission = useCallback((submissionId: number) => {
    setSelectedSubmissionId(submissionId);
  }, []);

  const handleConfirmWinner = useCallback(async () => {
    if (!code || !round || selectedSubmissionId === null) {
      return;
    }

    setIsSelectingWinner(true);
    try {
      await api.CahGame.selectWinner(
        code,
        round.roundId,
        MOCK_CURRENT_PLAYER_ID,
        selectedSubmissionId,
      );
      setSelectedSubmissionId(null);
    } catch (error) {
      console.error('Failed to select winner:', error);
    } finally {
      setIsSelectingWinner(false);
    }
  }, [code, round, selectedSubmissionId, api]);

  // Loading state
  if (roundMeta.loading || handMeta.loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '50vh' }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  // Error state
  if (roundMeta.error || handMeta.error) {
    return (
      <Container size="2" p="6">
        <Heading size="5" color="red" mb="2">
          Error Loading Game
        </Heading>
        <Text color="gray">
          {roundMeta.error?.message || handMeta.error?.message}
        </Text>
      </Container>
    );
  }

  // No active round
  if (!round) {
    return (
      <Container size="2" p="6">
        <Heading size="5" mb="2">
          No Active Round
        </Heading>
        <Text color="gray">Waiting for the game to start...</Text>
      </Container>
    );
  }

  // Find winner info for completed rounds
  const winnerSubmission =
    round.status === 'complete' && round.winnerPlayerId
      ? round.submissions.find((s) => s.playerId === round.winnerPlayerId)
      : null;
  const winnerPlayer = winnerSubmission
    ? MOCK_PLAYERS.find((p) => p.playerId === winnerSubmission.playerId)
    : null;

  return (
    <Container size="4" p="4">
      <Grid columns={{ initial: '1', md: '3' }} gap="4">
        {/* Left sidebar - Round info and scoreboard */}
        <Box>
          <Flex direction="column" gap="4">
            <RoundStatus
              roundNumber={round.roundNumber}
              status={round.status}
              judgeName={round.judge.nickname}
              submissionsCount={round.submissions.length}
              totalPlayers={MOCK_PLAYERS.length}
            />
            <Scoreboard
              players={MOCK_PLAYERS}
              currentPlayerId={MOCK_CURRENT_PLAYER_ID}
              judgePlayerId={round.judge.playerId}
              scoreToWin={MOCK_SCORE_TO_WIN}
            />
          </Flex>
        </Box>

        {/* Main content area */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Flex direction="column" gap="4">
            {/* Prompt card */}
            <PromptCard card={round.promptCard} />

            {/* Round winner display */}
            {round.status === 'complete' &&
              winnerSubmission &&
              winnerPlayer && (
                <RoundWinner
                  winnerNickname={winnerPlayer.nickname}
                  winningSubmission={winnerSubmission}
                  promptCard={round.promptCard}
                />
              )}

            {/* Submissions list (during judging) */}
            {(round.status === 'judging' || round.status === 'complete') && (
              <SubmissionsList
                submissions={round.submissions}
                isJudge={isJudge}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={handleSelectSubmission}
                onConfirmWinner={handleConfirmWinner}
                isSelecting={isSelectingWinner}
                revealCards={
                  round.status === 'judging' || round.status === 'complete'
                }
              />
            )}

            {/* Player's hand (during submissions) */}
            {round.status === 'submissions' && (
              <PlayerHand
                cards={hand}
                selectedCardIds={selectedCardIds}
                requiredCards={requiredCards}
                onCardSelect={handleCardSelect}
                onSubmit={handleSubmitCards}
                isSubmitting={isSubmitting}
                hasSubmitted={hasSubmitted}
                isJudge={isJudge}
              />
            )}
          </Flex>
        </Box>
      </Grid>
    </Container>
  );
};
