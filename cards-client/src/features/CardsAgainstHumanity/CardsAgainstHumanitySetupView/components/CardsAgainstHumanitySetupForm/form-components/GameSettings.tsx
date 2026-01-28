import * as React from 'react';
import { Grid, Heading } from '@radix-ui/themes';
import { ICahForm } from '../../../../types';
import { GameModeRadio } from './GameModeRadio';
import { GameModeRuleSetting } from './GameModeRuleSetting';
import { MaxPlayers } from './MaxPlayers';
import { CardDuplicatesPolicy } from './CardDuplicatesPolicy';
import { RoundTimer } from './RoundTimer';
import { AllowSwappingPolicy } from './AllowSwappingPolicy';
import { SwapAmount } from './SwapAmount';
import { SettingsColumn } from './SettingsColumn';

export interface IGameSettingsProps {
  form: ICahForm;
}

export const GameSettings: React.FC<IGameSettingsProps> = ({ form }) => {
  return (
    <>
      <Heading size="3" mt="6" mb="2">
        End Condition
      </Heading>
      <GameModeRadio form={form} />
      <Grid my="4" columns={{ initial: '12' }} gap="4">
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
    </>
  );
};
