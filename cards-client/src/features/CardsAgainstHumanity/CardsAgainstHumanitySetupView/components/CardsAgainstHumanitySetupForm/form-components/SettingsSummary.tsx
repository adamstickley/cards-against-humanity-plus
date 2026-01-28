import * as React from 'react';
import { Card, Heading, Text } from '@radix-ui/themes';
import { GAME_MODES } from '../types';
import { generatePrettyDurationString } from '../../../../../../utils';
import { ICahForm } from '../../../../types';

export const SettingsSummary: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  const formValues = form.watch();

  return (
    <Card>
      <Heading size="6" mb="3">
        Summary
      </Heading>
      <Text as="p" size="3" my="2">
        <span style={{ fontWeight: 'bold' }}>Game Mode:</span>{' '}
        {GAME_MODES[formValues.gameMode].label} (
        {formValues.gameMode === 'timed'
          ? generatePrettyDurationString(
              {
                unit: 'minutes',
                value: formValues.ruleTime,
              },
              {
                showSeconds: false,
              },
            )
          : formValues[GAME_MODES[formValues.gameMode].inputName]}
        )
      </Text>
      <Text as="p" size="3" my="2">
        <span style={{ fontWeight: 'bold' }}>Player limit:</span>{' '}
        {formValues.maxPlayers}
      </Text>
      <Text as="p" size="3" my="2">
        <span style={{ fontWeight: 'bold' }}>Round Timer:</span>{' '}
        {generatePrettyDurationString({
          unit: 'seconds',
          value: formValues.roundTimer,
        })}
      </Text>
      <Text as="p" size="3" my="2" style={{ textTransform: 'capitalize' }}>
        <span style={{ fontWeight: 'bold' }}>Duplicates:</span>{' '}
        {formValues.duplicatePolicy}
      </Text>
      <Text as="p" size="3" my="2" style={{ textTransform: 'capitalize' }}>
        <span style={{ fontWeight: 'bold' }}>Swaps:</span>{' '}
        {formValues.allowSwappingCards}
        {formValues.allowSwappingCards === 'disallow' ||
          ` (${formValues.swapCardLimit})`}
      </Text>
    </Card>
  );
};
