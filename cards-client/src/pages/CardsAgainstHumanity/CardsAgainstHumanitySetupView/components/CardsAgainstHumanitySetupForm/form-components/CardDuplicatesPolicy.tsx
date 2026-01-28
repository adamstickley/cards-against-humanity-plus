import { Box, Select, Text } from '@radix-ui/themes';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { ICahForm } from '../../../../types';

const options = [
  {
    value: 'allow',
    label: 'Allow duplicates',
    description: 'Include all cards from all chosen packs.',
  },
  {
    value: 'remove',
    label: 'Remove duplicates',
    description: 'Remove any potential duplicates.',
  },
];

export const CardDuplicatesPolicy: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Box>
      <Text as="label" size="2" weight="medium">
        Card duplicates policy
      </Text>
      <Text as="p" size="1" color="gray" mb="1">
        How should we handle duplicate cards?
      </Text>
      <Controller
        control={form.control}
        name="duplicatePolicy"
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
