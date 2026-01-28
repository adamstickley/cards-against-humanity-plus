import * as React from 'react';
import { Box, Text, TextField } from '@radix-ui/themes';
import { GAME_MODES, IGameModeType } from '../types';
import { generatePrettyDurationString } from '../../../../../../utils';
import { ICahForm } from '../../../../types';
import { ICardsAgainstHumanitySetupFormValues } from '../types';

export const GameModeRuleSetting: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  const formValues = form.watch();

  return (
    <>
      {Object.keys(GAME_MODES)
        .filter((gameMode) => gameMode === formValues.gameMode)
        .map((gameMode) => {
          const gameModeConfig: IGameModeType = GAME_MODES[gameMode];
          return (
            <Box key={gameMode}>
              <Text as="label" size="2" weight="medium">
                {gameModeConfig.inputLabel}
              </Text>
              <Text as="p" size="1" color="gray" mb="1">
                {gameModeConfig.inputDescription}
              </Text>
              <TextField.Root
                type="number"
                min={gameModeConfig.min}
                max={gameModeConfig.max}
                step={1}
                {...form.register(
                  gameModeConfig.inputName as keyof ICardsAgainstHumanitySetupFormValues,
                  { valueAsNumber: true },
                )}
              />
              {gameMode === 'timed' && (
                <Text size="1" mt="1" color="gray">
                  {generatePrettyDurationString(
                    {
                      unit: 'minutes',
                      value: formValues.ruleTime,
                    },
                    {
                      showSeconds: false,
                    },
                  )}
                </Text>
              )}
            </Box>
          );
        })}
    </>
  );
};
