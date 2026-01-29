'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import { Preloader, useGame } from '@/hooks';
import { assertDefined } from '@/utils';
import { combinedServiceHookMeta, useApiContext } from '@/api';
import { CARD_AGAINST_HUMANITY } from '@/consts';
import { Page } from '@/components';
import {
  useCahCardSets,
  usePackPreferences,
  useCustomCards,
} from '@/features/CardsAgainstHumanity/hooks';
import { CardsAgainstHumanitySetupForm } from '@/features/CardsAgainstHumanity/CardsAgainstHumanitySetupView/components/CardsAgainstHumanitySetupForm/CardsAgainstHumanitySetupForm';
import { ICardsAgainstHumanitySetupFormValues } from '@/features/CardsAgainstHumanity/CardsAgainstHumanitySetupView/components';

const PLAYER_ID_STORAGE_KEY = 'cah_player_id';
const SESSION_CODE_STORAGE_KEY = 'cah_session_code';

const storePlayerSession = (code: string, playerId: number) => {
  sessionStorage.setItem(SESSION_CODE_STORAGE_KEY, code);
  sessionStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId.toString());
};

export default function CahSetupPage() {
  const router = useRouter();
  const api = useApiContext();

  const [game, gameMeta] = useGame(CARD_AGAINST_HUMANITY);
  const [cardSets, cardSetMeta] = useCahCardSets();
  const meta = combinedServiceHookMeta([gameMeta, cardSetMeta]);
  const { preferences, isLoaded, savePreferences } = usePackPreferences();
  const {
    cards: customCards,
    isLoaded: customCardsLoaded,
    addCard: addCustomCard,
    removeCard: removeCustomCard,
  } = useCustomCards();

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const submitHandler = useCallback(
    async (values: ICardsAgainstHumanitySetupFormValues) => {
      setIsCreating(true);
      try {
        const cardSetIds = [
          values['packSettings.basePack'],
          ...values['packSettings.selectedPacks'],
        ].filter(Boolean);

        const customCardsPayload =
          customCards.length > 0
            ? customCards.map((card) => ({
                text: card.text,
                cardType: card.cardType,
                pick: card.cardType === 'prompt' ? card.pick : undefined,
              }))
            : undefined;

        const response = await api.CahSession.createSession({
          nickname: values.nickname,
          cardSetIds,
          scoreToWin: values.ruleScore,
          maxPlayers: values.maxPlayers,
          cardsPerHand: 10,
          roundTimerSeconds:
            values.roundTimer > 0 ? values.roundTimer : undefined,
          customCards: customCardsPayload,
        });

        storePlayerSession(response.code, response.playerId);
        router.push(`/cah/lobby/${response.code}`);
      } catch (error) {
        console.error('Failed to create session:', error);
      } finally {
        setIsCreating(false);
      }
    },
    [api, router, customCards],
  );

  const handleJoinGame = useCallback(async () => {
    if (!joinCode.trim() || !joinNickname.trim()) {
      setJoinError('Please enter both a game code and nickname');
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const response = await api.CahSession.joinSession(
        joinCode.toUpperCase(),
        { nickname: joinNickname },
      );

      storePlayerSession(response.code, response.playerId);
      router.push(`/cah/lobby/${response.code}`);
    } catch (error) {
      console.error('Failed to join session:', error);
      setJoinError('Failed to join game. Please check the code and try again.');
    } finally {
      setIsJoining(false);
    }
  }, [api, router, joinCode, joinNickname]);

  return (
    <Preloader {...meta}>
      {() => {
        assertDefined(game, 'game');
        assertDefined(cardSets, 'cardSets');
        return (
          <Page title={game.name + ' - Setup'}>
            <Card size="3" mb="6">
              <Flex direction="column" gap="4">
                <Heading size="5">Join an Existing Game</Heading>
                <Text size="2" color="gray">
                  Enter the game code shared by the host to join their game
                </Text>

                <Flex direction="column" gap="3">
                  <Box>
                    <Text as="label" size="2" weight="medium">
                      Game Code
                    </Text>
                    <TextField.Root
                      placeholder="Enter game code (e.g., ABC123)"
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                      maxLength={8}
                      style={{
                        fontFamily: 'monospace',
                        letterSpacing: '0.1em',
                      }}
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" weight="medium">
                      Your Nickname
                    </Text>
                    <TextField.Root
                      placeholder="Enter your nickname"
                      value={joinNickname}
                      onChange={(e) => setJoinNickname(e.target.value)}
                      maxLength={50}
                    />
                  </Box>

                  {joinError && (
                    <Text size="2" color="red">
                      {joinError}
                    </Text>
                  )}

                  <Button
                    size="3"
                    onClick={handleJoinGame}
                    disabled={
                      !joinCode.trim() || !joinNickname.trim() || isJoining
                    }
                  >
                    {isJoining ? 'Joining...' : 'Join Game'}
                  </Button>
                </Flex>
              </Flex>
            </Card>

            <Flex align="center" gap="4" my="6">
              <Separator size="4" />
              <Text size="2" color="gray" style={{ flexShrink: 0 }}>
                or create a new game
              </Text>
              <Separator size="4" />
            </Flex>

            <Heading size="5" mb="4">
              Create a New Game
            </Heading>
            {isLoaded && customCardsLoaded && (
              <CardsAgainstHumanitySetupForm
                onSubmit={submitHandler}
                cardSets={cardSets}
                isSubmitting={isCreating}
                savedPreferences={preferences}
                onSavePreferences={savePreferences}
                customCards={customCards}
                onAddCustomCard={addCustomCard}
                onRemoveCustomCard={removeCustomCard}
              />
            )}
          </Page>
        );
      }}
    </Preloader>
  );
}
