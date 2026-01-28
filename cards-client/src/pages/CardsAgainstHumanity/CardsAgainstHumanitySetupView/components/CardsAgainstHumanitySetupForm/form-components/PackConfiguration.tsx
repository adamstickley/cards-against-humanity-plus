import * as React from 'react';
import { Flex, Heading, RadioGroup, Text } from '@radix-ui/themes';
import { Controller } from 'react-hook-form';
import { PackMode } from '../types';
import { ICahForm } from '../../../../types';

const PACK_OPTION_LABELS: { [k in PackMode]: string } = {
  suggested: 'Our Suggested Packs',
  custom: 'Customise Packs',
};

export interface IPackConfigurationProps {
  form: ICahForm;
}

export const PackConfiguration: React.FC<IPackConfigurationProps> = ({
  form,
}) => {
  return (
    <>
      <Heading size="5" my="2">
        Expansion Packs
      </Heading>
      <Controller
        control={form.control}
        name="packMode"
        render={({ field }) => (
          <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
            <Flex gap="5">
              {Object.keys(PACK_OPTION_LABELS).map((option) => (
                <Flex key={option} align="center" gap="2">
                  <RadioGroup.Item value={option} />
                  <Text size="2">{PACK_OPTION_LABELS[option as PackMode]}</Text>
                </Flex>
              ))}
            </Flex>
          </RadioGroup.Root>
        )}
      />
    </>
  );
};
