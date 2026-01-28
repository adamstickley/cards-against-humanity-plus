import * as React from 'react';
import { Box, Text, TextField } from '@radix-ui/themes';
import { ICahForm } from '../../../../types';

export const MaxPlayers: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Box>
      <Text as="label" size="2" weight="medium">
        Max players
      </Text>
      <Text as="p" size="1" color="gray" mb="1">
        Set the lobby limit
      </Text>
      <TextField.Root
        type="number"
        min={3}
        max={20}
        step={1}
        {...form.register('maxPlayers', { valueAsNumber: true })}
      />
    </Box>
  );
};
