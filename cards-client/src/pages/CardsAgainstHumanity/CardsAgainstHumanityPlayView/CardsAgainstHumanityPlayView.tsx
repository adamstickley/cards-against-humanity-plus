import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import {
  useCahCurrentRound,
  useCahPlayerHand,
  useCahScoreboard,
} from '../hooks';
import {
  PromptCard,
  PlayerHand,
  SubmissionsList,
  Scoreboard,
  RoundStatus,
  RoundWinner,
  GameOverView,
} from './components';

// TODO: This should come from session storage or context after joining
const MOCK_CURRENT_PLAYER_ID = 1;

export const CardsAgainstHumanityPlayView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const api = useApiContext();

  const [roundData, roundMeta] = useCahCurrentRound(code);
  const [handData, handMeta] = useCahPlayerHand(code, MOCK_CURRENT_PLAYER_ID);
  const [scoreboardData, scoreboardMeta, scoreboardMutate] =
    useCahScoreboard(code);

  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const round = roundData?.round;
  const hand = handData?.cards || [];
  const players = useMemo(
    () => scoreboardData?.players || [],
    [scoreboardData?.players],
  );
  const scoreToWin = scoreboardData?.scoreToWin || 7;
  const gameStatus = scoreboardData?.gameStatus;

  const isJudge = round?.judge.playerId === MOCK_CURRENT_PLAYER_ID;
  const hasSubmitted = useMemo(() => {
    if (!round) {
      return false;
    }
    return round.submissions.some((s) => s.playerId === MOCK_CURRENT_PLAYER_ID);
  }, [round]);

  const gameWinner = useMemo(() => {
    if (!isGameOver && gameStatus !== 'completed') {
      return null;
    }
    return players.find((p) => p.score >= scoreToWin) || players[0];
  }, [isGameOver, gameStatus, players, scoreToWin]);

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
      const result = await api.CahGame.selectWinner(
        code,
        round.roundId,
        MOCK_CURRENT_PLAYER_ID,
        selectedSubmissionId,
      );
      setSelectedSubmissionId(null);

      if (result.gameOver) {
        await scoreboardMutate();
        setIsGameOver(true);
      }
    } catch (error) {
      console.error('Failed to select winner:', error);
    } finally {
      setIsSelectingWinner(false);
    }
  }, [code, round, selectedSubmissionId, api, scoreboardMutate]);

  const handlePlayAgain = useCallback(async () => {
    if (!code) {
      return;
    }

    setIsGameOver(false);
    try {
      await api.CahGame.startGame(code, MOCK_CURRENT_PLAYER_ID);
      await scoreboardMutate();
    } catch (error) {
      console.error('Failed to start new game:', error);
    }
  }, [code, api, scoreboardMutate]);

  const handleBackToLobby = useCallback(() => {
    if (!code) {
      return;
    }
    navigate(`/cah/session/${code}`);
  }, [code, navigate]);

  // Loading state
  if (roundMeta.loading || handMeta.loading || scoreboardMeta.loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '50vh' }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  // Error state
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

  // Game over state - show winner screen
  if (gameWinner) {
    return (
      <Container size="2" p="4">
        <GameOverView
          winner={gameWinner}
          players={players}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
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
    ? players.find((p) => p.playerId === winnerSubmission.playerId)
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
              totalPlayers={players.length}
            />
            <Scoreboard
              players={players}
              currentPlayerId={MOCK_CURRENT_PLAYER_ID}
              judgePlayerId={round.judge.playerId}
              scoreToWin={scoreToWin}
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
