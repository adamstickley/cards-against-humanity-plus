import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cah_deck_preferences';

export interface IDeckPreferences {
  packMode: 'suggested' | 'custom';
  basePack: number | null;
  selectedPacks: number[];
  gameSettings: {
    maxPlayers: number;
    scoreToWin: number;
    roundTimer: number;
  };
}

const DEFAULT_PREFERENCES: IDeckPreferences = {
  packMode: 'suggested',
  basePack: null,
  selectedPacks: [],
  gameSettings: {
    maxPlayers: 10,
    scoreToWin: 8,
    roundTimer: 0,
  },
};

const loadPreferences = (): IDeckPreferences => {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(stored) as IDeckPreferences;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      gameSettings: {
        ...DEFAULT_PREFERENCES.gameSettings,
        ...parsed.gameSettings,
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const savePreferencesToStorage = (preferences: IDeckPreferences): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
};

export const usePackPreferences = () => {
  const [preferences, setPreferences] =
    useState<IDeckPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    setIsLoaded(true);
  }, []);

  const savePreferences = useCallback((newPreferences: IDeckPreferences) => {
    setPreferences(newPreferences);
    savePreferencesToStorage(newPreferences);
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<IDeckPreferences>) => {
      const updated = {
        ...preferences,
        ...updates,
        gameSettings: {
          ...preferences.gameSettings,
          ...updates.gameSettings,
        },
      };
      savePreferences(updated);
    },
    [preferences, savePreferences],
  );

  const clearPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    preferences,
    isLoaded,
    savePreferences,
    updatePreferences,
    clearPreferences,
  };
};
