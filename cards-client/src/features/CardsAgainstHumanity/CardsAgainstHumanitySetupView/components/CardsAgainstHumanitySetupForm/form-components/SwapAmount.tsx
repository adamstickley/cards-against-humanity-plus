import { Box, Text, TextField } from '@radix-ui/themes';
import * as React from 'react';
import { ICahForm } from '../../../../types';

export const SwapAmount: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  const allowSwappingCards = form.watch('allowSwappingCards');

  return (
    <Box>
      <Text as="label" size="2" weight="medium">
        Swap Limit
      </Text>
      <Text as="p" size="1" color="gray" mb="1">
        Not applicable when swapping is disabled
      </Text>
      <TextField.Root
        type="number"
        min={1}
        max={50}
        step={1}
        disabled={allowSwappingCards === 'disallow'}
        {...form.register('swapCardLimit', { valueAsNumber: true })}
      />
    </Box>
  );
};
