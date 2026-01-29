import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { Hide } from '../../../../../components';
import { CustomPackSelector } from '../CustomPackSelector';
import { SuggestedPacksSelector } from '../SuggestedPacksSelector';
import { CustomCardsSection } from '../CustomCardsSection';
import { ICahCardSet, ICustomCard } from '../../../types';
import { IDeckPreferences } from '../../../hooks/usePackPreferences';
import {
  GameSettings,
  PackConfiguration,
  SettingsSummary,
} from './form-components';
import { ICardsAgainstHumanitySetupFormValues } from './types';

export interface ICardsAgainstHumanitySetupFormProps {
  onSubmit: (values: ICardsAgainstHumanitySetupFormValues) => void;
  cardSets: ICahCardSet[];
  isSubmitting?: boolean;
  savedPreferences?: IDeckPreferences;
  onSavePreferences?: (preferences: IDeckPreferences) => void;
  customCards?: ICustomCard[];
  onAddCustomCard?: (card: Omit<ICustomCard, 'id' | 'createdAt'>) => void;
  onRemoveCustomCard?: (cardId: string) => void;
}

export const CardsAgainstHumanitySetupForm: React.FC<
  ICardsAgainstHumanitySetupFormProps
> = ({
  onSubmit,
  cardSets,
  isSubmitting,
  savedPreferences,
  onSavePreferences,
  customCards = [],
  onAddCustomCard,
  onRemoveCustomCard,
}) => {
  const defaultBasePack = useMemo(() => {
    if (savedPreferences?.basePack) {
      const exists = cardSets.some(
        (cs) => cs.card_set_id === savedPreferences.basePack,
      );
      if (exists) {
        return savedPreferences.basePack;
      }
    }
    return cardSets.find(
      (cardSet) => cardSet.is_base_set && cardSet.recommended,
    )?.card_set_id;
  }, [cardSets, savedPreferences?.basePack]);

  const defaultSelectedPacks = useMemo(() => {
    if (savedPreferences?.selectedPacks?.length) {
      const validPacks = savedPreferences.selectedPacks.filter((packId) =>
        cardSets.some((cs) => cs.card_set_id === packId),
      );
      if (validPacks.length > 0) {
        return validPacks;
      }
    }
    return [];
  }, [cardSets, savedPreferences?.selectedPacks]);

  const form = useForm<ICardsAgainstHumanitySetupFormValues>({
    defaultValues: {
      nickname: '',
      packMode: savedPreferences?.packMode ?? 'suggested',
      gameMode: 'score',
      maxPlayers: savedPreferences?.gameSettings?.maxPlayers ?? 10,
      ruleScore: savedPreferences?.gameSettings?.scoreToWin ?? 8,
      ruleWhiteCards: 100,
      ruleRounds: 10,
      ruleTime: 30,
      duplicatePolicy: 'remove',
      allowSwappingCards: 'limited',
      swapCardLimit: 2,
      roundTimer: savedPreferences?.gameSettings?.roundTimer ?? 0,
      'packSettings.sortBy': 'popularity',
      'packSettings.basePack': defaultBasePack!,
      'packSettings.selectedPacks': defaultSelectedPacks,
      'packSettings.filter': '',
    },
  });

  const handleSubmit = useCallback(
    (values: ICardsAgainstHumanitySetupFormValues) => {
      onSavePreferences?.({
        packMode: values.packMode,
        basePack: values['packSettings.basePack'],
        selectedPacks: values['packSettings.selectedPacks'],
        gameSettings: {
          maxPlayers: values.maxPlayers,
          scoreToWin: values.ruleScore,
          roundTimer: values.roundTimer,
        },
      });
      onSubmit(values);
    },
    [onSubmit, onSavePreferences],
  );

  const formValues = form.watch();
  const nickname = form.watch('nickname');

  return (
    <>
      <Grid columns={{ initial: '12' }} gap="4">
        <Box gridColumn={{ initial: 'span 12', md: 'span 9' }}>
          <Text size="3">
            Play with the base game, or select from a wide variety of expansion
            packs to enhance your game.
          </Text>
          <Box mb="4" />

          <Box mb="4">
            <Text as="label" size="2" weight="medium">
              Your Nickname
            </Text>
            <Text as="p" size="1" color="gray" mb="1">
              This is how other players will see you in the game
            </Text>
            <TextField.Root
              {...form.register('nickname', { required: true, maxLength: 50 })}
              placeholder="Enter your nickname"
              maxLength={50}
            />
          </Box>

          <Heading size="6" my="2">
            Game Settings
          </Heading>
          <Text size="2" my="2">
            Choose your settings for the game. For example, how many rounds of
            cards should be played, how many players should be allowed to join,
            etc
          </Text>
        </Box>
        <Hide smallerThan="md">
          <Box gridColumn="span 3">
            <SettingsSummary form={form} />
          </Box>
        </Hide>
      </Grid>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <GameSettings form={form} />
        <PackConfiguration form={form} />
        <Box mb="6" />
        {formValues.packMode === 'suggested' && (
          <SuggestedPacksSelector form={form} cardSets={cardSets} />
        )}
        {formValues.packMode === 'custom' && (
          <CustomPackSelector form={form} cardSets={cardSets} />
        )}

        {onAddCustomCard && onRemoveCustomCard && (
          <>
            <Separator size="4" my="6" />
            <CustomCardsSection
              cards={customCards}
              onAddCard={onAddCustomCard}
              onRemoveCard={onRemoveCustomCard}
            />
          </>
        )}

        <Box mt="6">
          <Button
            type="submit"
            size="3"
            disabled={!nickname.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating Game...' : 'Create Game'}
          </Button>
        </Box>
      </form>
    </>
  );
};
