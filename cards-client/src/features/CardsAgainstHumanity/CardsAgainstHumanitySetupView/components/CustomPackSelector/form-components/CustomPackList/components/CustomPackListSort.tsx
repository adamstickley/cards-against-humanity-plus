import * as React from 'react';
import { Box, Grid, Select, Text, TextField } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { PackSortOptions } from '../../../../CardsAgainstHumanitySetupForm';
import { ICahForm } from '../../../../../../types';

const sortOptions: Array<{
  label: string;
  value: PackSortOptions;
}> = [
  {
    label: 'Name',
    value: 'alphabetical',
  },
  {
    label: 'Popularity',
    value: 'popularity',
  },
];

export const CustomPackListSort: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Grid columns={{ initial: '12' }} gap="4">
      <Box gridColumn="span 4">
        <Text as="label" size="2" weight="medium">
          Sort By
        </Text>
        <Controller
          control={form.control}
          name="packSettings.sortBy"
          render={({ field }) => (
            <Select.Root value={field.value} onValueChange={field.onChange}>
              <Select.Trigger style={{ maxWidth: '200px', width: '100%' }} />
              <Select.Content>
                {sortOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
        />
      </Box>
      <Box gridColumn="span 8">
        <Text as="label" size="2" weight="medium">
          Filter..
        </Text>
        <TextField.Root {...form.register('packSettings.filter')}>
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Box>
    </Grid>
  );
};
