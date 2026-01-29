'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
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
import { useApiContext } from '@/api';
import { Page } from '@/components';
import { IUpdatePreferencesRequest } from '@/api/clients/users/UsersApi';

export default function SettingsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const api = useApiContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [preferredNickname, setPreferredNickname] = useState('');
  const [defaultScoreToWin, setDefaultScoreToWin] = useState(8);
  const [defaultMaxPlayers, setDefaultMaxPlayers] = useState(10);
  const [defaultCardsPerHand, setDefaultCardsPerHand] = useState(10);
  const [defaultRoundTimerSeconds, setDefaultRoundTimerSeconds] = useState<
    number | ''
  >('');

  useEffect(() => {
    if (!isUserLoaded || !user) {
      return;
    }

    const loadPreferences = async () => {
      try {
        const preferences = await api.Users.getPreferences(user.id);
        setPreferredNickname(preferences.preferredNickname || '');
        setDefaultScoreToWin(preferences.defaultScoreToWin);
        setDefaultMaxPlayers(preferences.defaultMaxPlayers);
        setDefaultCardsPerHand(preferences.defaultCardsPerHand);
        setDefaultRoundTimerSeconds(preferences.defaultRoundTimerSeconds || '');
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [isUserLoaded, user, api]);

  const handleSave = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const request: IUpdatePreferencesRequest = {
        preferredNickname: preferredNickname || undefined,
        defaultScoreToWin,
        defaultMaxPlayers,
        defaultCardsPerHand,
        defaultRoundTimerSeconds:
          defaultRoundTimerSeconds === ''
            ? undefined
            : defaultRoundTimerSeconds,
      };

      await api.Users.updatePreferences(user.id, request);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [
    user,
    api,
    preferredNickname,
    defaultScoreToWin,
    defaultMaxPlayers,
    defaultCardsPerHand,
    defaultRoundTimerSeconds,
  ]);

  if (!isUserLoaded || isLoading) {
    return (
      <Page title="Settings">
        <Text>Loading...</Text>
      </Page>
    );
  }

  if (!user) {
    return (
      <Page title="Settings">
        <Text>Please sign in to access settings.</Text>
      </Page>
    );
  }

  return (
    <Page title="Settings">
      <Card size="3" style={{ maxWidth: '600px' }}>
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="4" mb="3">
              Profile
            </Heading>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">
                  Preferred Nickname
                </Text>
                <Text as="p" size="1" color="gray" mb="1">
                  This name will be used when you join games
                </Text>
                <TextField.Root
                  placeholder="Enter your preferred nickname"
                  value={preferredNickname}
                  onChange={(e) => setPreferredNickname(e.target.value)}
                  maxLength={50}
                />
              </Box>
            </Flex>
          </Box>

          <Separator size="4" />

          <Box>
            <Heading size="4" mb="3">
              Default Game Settings
            </Heading>
            <Text as="p" size="2" color="gray" mb="4">
              These settings will be pre-filled when you create a new game
            </Text>

            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium">
                  Score to Win
                </Text>
                <TextField.Root
                  type="number"
                  min={1}
                  max={20}
                  value={defaultScoreToWin}
                  onChange={(e) =>
                    setDefaultScoreToWin(parseInt(e.target.value) || 8)
                  }
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">
                  Max Players
                </Text>
                <TextField.Root
                  type="number"
                  min={3}
                  max={20}
                  value={defaultMaxPlayers}
                  onChange={(e) =>
                    setDefaultMaxPlayers(parseInt(e.target.value) || 10)
                  }
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">
                  Cards Per Hand
                </Text>
                <TextField.Root
                  type="number"
                  min={5}
                  max={15}
                  value={defaultCardsPerHand}
                  onChange={(e) =>
                    setDefaultCardsPerHand(parseInt(e.target.value) || 10)
                  }
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">
                  Round Timer (seconds)
                </Text>
                <Text as="p" size="1" color="gray" mb="1">
                  Leave empty for no timer
                </Text>
                <TextField.Root
                  type="number"
                  min={30}
                  max={300}
                  placeholder="No timer"
                  value={defaultRoundTimerSeconds}
                  onChange={(e) =>
                    setDefaultRoundTimerSeconds(
                      e.target.value === '' ? '' : parseInt(e.target.value),
                    )
                  }
                />
              </Box>
            </Flex>
          </Box>

          <Separator size="4" />

          <Flex justify="between" align="center">
            {saveMessage && (
              <Text
                size="2"
                color={saveMessage.includes('success') ? 'green' : 'red'}
              >
                {saveMessage}
              </Text>
            )}
            <Box style={{ marginLeft: 'auto' }}>
              <Button size="3" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Flex>
        </Flex>
      </Card>
    </Page>
  );
}
