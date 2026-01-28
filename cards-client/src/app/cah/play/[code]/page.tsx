'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { useApiContext } from '@/api';
import {
  useCahCurrentRound,
  useCahPlayerHand,
  useCahScoreboard,
} from '@/features/CardsAgainstHumanity/hooks';
import {
  PromptCard,
  PlayerHand,
  SubmissionsList,
  Scoreboard,
  RoundStatus,
  RoundWinner,
} from '@/features/CardsAgainstHumanity/CardsAgainstHumanityPlayView/components';

const PLAYER_ID_STORAGE_KEY = 'cah_player_id';
const SESSION_CODE_STORAGE_KEY = 'cah_session_code';

const getStoredPlayerId = (code: string): number | null => {
  const storedCode = sessionStorage.getItem(SESSION_CODE_STORAGE_KEY);
  if (storedCode !== code) {
    return null;
  }
  const playerId = sessionStorage.getItem(PLAYER_ID_STORAGE_KEY);
  return playerId ? parseInt(playerId, 10) : null;
};

export default function CahPlayPage() {
  const params = useParams();
  const code = params.code as string;
  const api = useApiContext();

  const currentPlayerId = code ? getStoredPlayerId(code) : null;

  const [roundData, roundMeta] = useCahCurrentRound(code);
  const [handData, handMeta] = useCahPlayerHand(
    code,
    currentPlayerId ?? undefined,
  );
  const [scoreboardData, scoreboardMeta] = useCahScoreboard(code);

  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);

  const round = roundData?.round;
  const hand = handData?.cards || [];

  const isJudge = round?.judge.playerId === currentPlayerId;
  const hasSubmitted = useMemo(() => {
    if (!round || !currentPlayerId) {
      return false;
    }
    return round.submissions.some((s) => s.playerId === currentPlayerId);
  }, [round, currentPlayerId]);

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
    if (
      !code ||
      !round ||
      !currentPlayerId ||
      selectedCardIds.length !== requiredCards
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.CahGame.submitCards(
        code,
        round.roundId,
        currentPlayerId,
        selectedCardIds,
      );
      setSelectedCardIds([]);
    } catch (error) {
      console.error('Failed to submit cards:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, round, selectedCardIds, requiredCards, api, currentPlayerId]);

  const handleSelectSubmission = useCallback((submissionId: number) => {
    setSelectedSubmissionId(submissionId);
  }, []);

  const handleConfirmWinner = useCallback(async () => {
    if (!code || !round || !currentPlayerId || selectedSubmissionId === null) {
      return;
    }

    setIsSelectingWinner(true);
    try {
      await api.CahGame.selectWinner(
        code,
        round.roundId,
        currentPlayerId,
        selectedSubmissionId,
      );
      setSelectedSubmissionId(null);
    } catch (error) {
      console.error('Failed to select winner:', error);
    } finally {
      setIsSelectingWinner(false);
    }
  }, [code, round, selectedSubmissionId, api, currentPlayerId]);

  if (roundMeta.loading || handMeta.loading || scoreboardMeta.loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '50vh' }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  if (roundMeta.error || handMeta.error || scoreboardMeta.error) {
    return (
      <Container size="2" p="6">
        <Heading size="5" color="red" mb="2">
          Error Loading Game
        </Heading>
        <Text color="gray">
          {roundMeta.error?.message ||
            handMeta.error?.message ||
            scoreboardMeta.error?.message}
        </Text>
      </Container>
    );
  }

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

  const players = scoreboardData?.players || [];
  const scoreToWin = scoreboardData?.scoreToWin || 7;

  const winnerSubmission =
    round.status === 'complete' && round.winnerPlayerId
      ? round.submissions.find((s) => s.playerId === round.winnerPlayerId)
      : null;
  const winnerPlayer = winnerSubmission
    ? players.find((p) => p.playerId === winnerSubmission.playerId)
    : null;

  return (
    <Container size="4" p="4">
      <Grid columns={{ initial: '1', md: '3' }} gap="4">
        <Box>
          <Flex direction="column" gap="4">
            <RoundStatus
              roundNumber={round.roundNumber}
              status={round.status}
              judgeName={round.judge.nickname}
              submissionsCount={round.submissions.length}
              totalPlayers={players.length}
            />
            <Scoreboard
              players={players}
              currentPlayerId={currentPlayerId ?? undefined}
              judgePlayerId={round.judge.playerId}
              scoreToWin={scoreToWin}
            />
          </Flex>
        </Box>

        <Box style={{ gridColumn: 'span 2' }}>
          <Flex direction="column" gap="4">
            <PromptCard card={round.promptCard} />

            {round.status === 'complete' &&
              winnerSubmission &&
              winnerPlayer && (
                <RoundWinner
                  winnerNickname={winnerPlayer.nickname}
                  winningSubmission={winnerSubmission}
                  promptCard={round.promptCard}
                />
              )}

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
}
