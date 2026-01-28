import React from "react";
import {
  GameSettings,
  PackConfiguration,
  SettingsSummary,
} from "./form-components";
import { Grid, JsonInput, Space, Text, Title } from "@mantine/core";
import { Hide } from "../../../../../components";
import { CustomPackSelector } from "../CustomPackSelector";
import { SuggestedPacksSelector } from "../SuggestedPacksSelector";
import { ICahCardSet } from "../../../types";
import { useForm } from "@mantine/form";
import { ICardsAgainstHumanitySetupFormValues } from "./types";

export interface ICardsAgainstHumanitySetupFormProps {
  onSubmit: (values: ICardsAgainstHumanitySetupFormValues) => void;
  cardSets: ICahCardSet[];
}

export const CardsAgainstHumanitySetupForm: React.FC<
  ICardsAgainstHumanitySetupFormProps
> = ({ onSubmit, cardSets }) => {
  const form = useForm<ICardsAgainstHumanitySetupFormValues>({
    initialValues: {
      packMode: "suggested",
      gameMode: "score",
      maxPlayers: 10,
      ruleScore: 8,
      ruleWhiteCards: 100,
      ruleRounds: 10,
      ruleTime: 30,
      duplicatePolicy: "remove",
      allowSwappingCards: "limited",
      swapCardLimit: 2,
      roundTimer: 0,
      "packSettings.sortBy": "popularity",
      "packSettings.basePack": cardSets.find(
        (cardSet) => cardSet.is_base_set && cardSet.recommended
      )?.card_set_id!,
      "packSettings.selectedPacks": [],
      "packSettings.filter": "",
    },

    validate: {},
  });

  return (
    <>
      <JsonInput
        label="Output"
        formatOnBlur
        autosize
        minRows={4}
        value={JSON.stringify(form.values, null, 4)}
        readOnly={true}
      />
      <Grid columns={12}>
        <Grid.Col md={9} sm={12}>
          <Text size="md">
            Play with the base game, or select from a wide variety of expansion
            packs to enhance your game.
          </Text>
          <Space h="md" />
          <Title order={2} my="sm">
            Game Settings
          </Title>
          <Text size="sm" my="sm">
            Choose your settings for the game. For example, how many rounds of
            cards should be played, how many players should be allowed to join,
            etc
          </Text>
        </Grid.Col>
        <Hide smallerThan="md">
          <Grid.Col span={3}>
            <SettingsSummary form={form} />
          </Grid.Col>
        </Hide>
      </Grid>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <GameSettings form={form} />
        <PackConfiguration form={form} />
        <Space h="xl" />
        {form.values.packMode === "suggested" && (
          <SuggestedPacksSelector form={form} cardSets={cardSets} />
        )}
        {form.values.packMode === "custom" && (
          <CustomPackSelector form={form} cardSets={cardSets} />
        )}
      </form>
    </>
  );
};
