import * as React from 'react';
import { Heading } from '@radix-ui/themes';
import { ICahCardSet, ICahForm } from '../../../types';

export const SuggestedPacksSelector: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = () => {
  return (
    <>
      <Heading size="6">Our Suggestions</Heading>
    </>
  );
};
