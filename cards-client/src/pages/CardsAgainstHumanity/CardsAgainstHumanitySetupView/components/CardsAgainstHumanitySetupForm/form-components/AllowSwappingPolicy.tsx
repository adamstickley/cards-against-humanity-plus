import * as React from 'react';
import { Box, Select, Text } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { ICahForm } from '../../../../types';

export const AllowSwappingPolicy: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  const swapCardLimit = form.watch('swapCardLimit');

  const options = [
    {
      value: 'allow',
      label: 'Allow',
      description: `Allows a player to discard ${swapCardLimit} cards at the start of each turn.`,
    },
    {
      value: 'limited',
      label: 'Limited',
      description: `Allows a player to discard ${swapCardLimit} cards per game.`,
    },
    {
      value: 'disallow',
      label: 'Disallow',
      description: 'Players cannot swap out cards at any point.',
    },
  ];

  return (
    <Box>
      <Text as="label" size="2" weight="medium">
        Card swapping policy
      </Text>
      <Text as="p" size="1" color="gray" mb="1">
        Players can discard cards and draw new ones
      </Text>
      <Controller
        control={form.control}
        name="allowSwappingCards"
        render={({ field }) => (
          <Select.Root value={field.value} onValueChange={field.onChange}>
            <Select.Trigger style={{ width: '100%' }} />
            <Select.Content>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}
      />
    </Box>
  );
};
