import * as React from 'react';
import { Box, Flex, RadioGroup, Text } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { GAME_MODES } from '../types';
import { ICahForm } from '../../../../types';

export const GameModeRadio: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Controller
      control={form.control}
      name="gameMode"
      render={({ field }) => (
        <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
          <Flex gap="4" wrap="wrap">
            {Object.keys(GAME_MODES).map((gameMode) => (
              <Flex key={gameMode} align="start" gap="2">
                <RadioGroup.Item value={gameMode} />
                <Box style={{ width: '175px' }}>
                  <Text size="2">{GAME_MODES[gameMode].label}</Text>
                  <Text size="1" color="gray">
                    {GAME_MODES[gameMode].labelSubtext}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </RadioGroup.Root>
      )}
    />
  );
};
