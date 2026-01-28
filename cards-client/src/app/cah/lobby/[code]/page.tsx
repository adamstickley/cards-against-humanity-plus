'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Flex, Grid, Heading, Spinner } from '@radix-ui/themes';
import { useApiContext } from '@/api';
import { Page } from '@/components';
import { useCahSession } from '@/features/CardsAgainstHumanity/hooks';
import {
  PlayersList,
  SessionInfo,
  GameControls,
} from '@/features/CardsAgainstHumanity/CardsAgainstHumanityLobbyView/components';

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

export default function CahLobbyPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const api = useApiContext();

  const [session, sessionMeta] = useCahSession(code);
  const [isStarting, setIsStarting] = useState(false);

  const playerId = code ? getStoredPlayerId(code) : null;

  const currentPlayer = session?.players.find((p) => p.playerId === playerId);
  const isHost = currentPlayer?.isHost ?? false;

  useEffect(() => {
    if (session?.status === 'in_progress' && code) {
      router.replace(`/cah/play/${code}`);
    }
  }, [session?.status, code, router]);

  const handleStartGame = useCallback(async () => {
    if (!code) {
      return;
    }

    setIsStarting(true);
    try {
      await api.CahSession.startGame(code);
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsStarting(false);
    }
  }, [code, api]);

  if (sessionMeta.loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '50vh' }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  if (sessionMeta.error || !session) {
    return (
      <Page title="Game Lobby">
        <Container size="2" p="6">
          <Heading size="5" color="red" mb="2">
            Error Loading Lobby
          </Heading>
        </Container>
      </Page>
    );
  }

  return (
    <Page title={`Game Lobby - ${code}`}>
      <Container size="3" p="4">
        <Heading size="6" mb="4">
          Game Lobby
        </Heading>

        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          <Flex direction="column" gap="4">
            <SessionInfo
              code={session.code}
              settings={session.settings}
              cardPacks={session.cardPacks}
            />
            <GameControls
              isHost={isHost}
              playerCount={session.players.length}
              minPlayers={3}
              isStarting={isStarting}
              onStartGame={handleStartGame}
            />
          </Flex>

          <Box>
            <PlayersList
              players={session.players}
              currentPlayerId={playerId ?? undefined}
              maxPlayers={session.settings.maxPlayers}
            />
          </Box>
        </Grid>
      </Container>
    </Page>
  );
}
