import * as React from "react";
import { Grid, Title } from "@mantine/core";
import { GameModeRadio } from "./GameModeRadio";
import { GameModeRuleSetting } from "./GameModeRuleSetting";
import { MaxPlayers } from "./MaxPlayers";
import { CardDuplicatesPolicy } from "./CardDuplicatesPolicy";
import { RoundTimer } from "./RoundTimer";
import { AllowSwappingPolicy } from "./AllowSwappingPolicy";
import { SwapAmount } from "./SwapAmount";
import { SettingsColumn } from "./SettingsColumn";
import { ICahForm } from "../../../../types";

export interface IGameSettingsProps {
  form: ICahForm;
}

export const GameSettings: React.FC<IGameSettingsProps> = ({ form }) => {
  return (
    <>
      <Title order={5} mt="xl" mb="sm">
        End Condition
      </Title>
      <GameModeRadio form={form} />
      <Grid my="lg" columns={12}>
        <SettingsColumn>
          <GameModeRuleSetting form={form} />
        </SettingsColumn>
        <SettingsColumn>
          <MaxPlayers form={form} />
        </SettingsColumn>
        <SettingsColumn>
          <CardDuplicatesPolicy form={form} />
        </SettingsColumn>
        <SettingsColumn>
          <RoundTimer form={form} />
        </SettingsColumn>
        <SettingsColumn>
          <AllowSwappingPolicy form={form} />
        </SettingsColumn>
        <SettingsColumn>
          <SwapAmount form={form} />
        </SettingsColumn>
      </Grid>
      {/*whiteCardsPerRound?: number;*/}
      {/*allowSwappingCards: number;*/}
    </>
  );
};
