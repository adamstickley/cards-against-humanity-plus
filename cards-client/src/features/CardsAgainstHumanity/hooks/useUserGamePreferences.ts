'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiContext } from '@/api';

export interface IUserGamePreferences {
  preferredNickname: string | null;
  defaultScoreToWin: number;
  defaultMaxPlayers: number;
  defaultCardsPerHand: number;
  defaultRoundTimerSeconds: number | null;
}

const DEFAULT_GAME_PREFERENCES: IUserGamePreferences = {
  preferredNickname: null,
  defaultScoreToWin: 8,
  defaultMaxPlayers: 10,
  defaultCardsPerHand: 10,
  defaultRoundTimerSeconds: null,
};

export const useUserGamePreferences = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const api = useApiContext();

  const [preferences, setPreferences] = useState<IUserGamePreferences>(
    DEFAULT_GAME_PREFERENCES,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isUserLoaded) {
      return;
    }

    if (!user) {
      setIsLoaded(true);
      return;
    }

    const loadUserPreferences = async () => {
      try {
        const serverPrefs = await api.Users.getPreferences(user.id);
        setPreferences({
          preferredNickname: serverPrefs.preferredNickname,
          defaultScoreToWin: serverPrefs.defaultScoreToWin,
          defaultMaxPlayers: serverPrefs.defaultMaxPlayers,
          defaultCardsPerHand: serverPrefs.defaultCardsPerHand,
          defaultRoundTimerSeconds: serverPrefs.defaultRoundTimerSeconds,
        });
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadUserPreferences();
  }, [isUserLoaded, user, api]);

  return {
    preferences,
    isLoaded,
    isLoggedIn: !!user,
  };
};
