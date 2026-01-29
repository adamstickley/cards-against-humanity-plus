import { useCallback, useEffect, useState } from 'react';
import { ICustomCard } from '../types';

const STORAGE_KEY = 'cah_custom_cards';

const generateId = (): string => {
  return `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const loadCards = (): ICustomCard[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as ICustomCard[];
  } catch {
    return [];
  }
};

const saveCardsToStorage = (cards: ICustomCard[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
};

export const useCustomCards = () => {
  const [cards, setCards] = useState<ICustomCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadCards();
    setCards(loaded);
    setIsLoaded(true);
  }, []);

  const addCard = useCallback(
    (card: Omit<ICustomCard, 'id' | 'createdAt'>) => {
      const newCard: ICustomCard = {
        ...card,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...cards, newCard];
      setCards(updated);
      saveCardsToStorage(updated);
      return newCard;
    },
    [cards],
  );

  const removeCard = useCallback(
    (cardId: string) => {
      const updated = cards.filter((c) => c.id !== cardId);
      setCards(updated);
      saveCardsToStorage(updated);
    },
    [cards],
  );

  const updateCard = useCallback(
    (
      cardId: string,
      updates: Partial<Omit<ICustomCard, 'id' | 'createdAt'>>,
    ) => {
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, ...updates } : c,
      );
      setCards(updated);
      saveCardsToStorage(updated);
    },
    [cards],
  );

  const clearAllCards = useCallback(() => {
    setCards([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const promptCards = cards.filter((c) => c.cardType === 'prompt');
  const responseCards = cards.filter((c) => c.cardType === 'response');

  return {
    cards,
    promptCards,
    responseCards,
    isLoaded,
    addCard,
    removeCard,
    updateCard,
    clearAllCards,
  };
};
