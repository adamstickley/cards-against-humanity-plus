import * as React from 'react';
import { Box, Text, TextField } from '@radix-ui/themes';
import { generatePrettyDurationString } from '../../../../../../utils';
import { ICahForm } from '../../../../types';

export const RoundTimer: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  const roundTimer = form.watch('roundTimer');

  return (
    <Box>
      <Text as="label" size="2" weight="medium">
        Round Timer
      </Text>
      <Text as="p" size="1" color="gray" mb="1">
        Keep your game moving
      </Text>
      <TextField.Root
        type="number"
        min={0}
        max={60 * 10}
        step={1}
        {...form.register('roundTimer', { valueAsNumber: true })}
      />
      <Text size="1" mt="1" color="gray">
        {generatePrettyDurationString({
          unit: 'seconds',
          value: roundTimer,
        })}
      </Text>
    </Box>
  );
};
