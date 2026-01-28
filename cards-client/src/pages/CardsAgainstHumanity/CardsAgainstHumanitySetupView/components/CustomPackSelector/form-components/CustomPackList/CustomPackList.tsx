import * as React from 'react';
import { Box, Card, Container, Heading } from '@radix-ui/themes';
import { ICahCardSet, ICahForm } from '../../../../../types';
import { CustomPackListSort } from './components/CustomPackListSort';

export const CustomPackList: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = ({ form, cardSets }) => {
  const formValues = form.watch();

  const onClickFn = (selectedId: number, isCurrentlyChecked: boolean) => {
    return () => {
      const values = [...formValues['packSettings.selectedPacks']];
      if (!isCurrentlyChecked) {
        values.push(selectedId);
      } else {
        values.splice(values.indexOf(selectedId), 1);
      }
      form.setValue('packSettings.selectedPacks', values);
    };
  };

  const cardSetSort = (a: ICahCardSet, b: ICahCardSet) => {
    if (formValues['packSettings.sortBy'] === 'alphabetical') {
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
    } else if (formValues['packSettings.sortBy'] === 'popularity') {
      if (a.popularity > b.popularity) {
        return -1;
      }
      if (a.popularity < b.popularity) {
        return 1;
      }
    }
    return 0;
  };

  const cardSetFilter = (card: ICahCardSet) => {
    return card.title
      .toLowerCase()
      .includes(formValues['packSettings.filter']?.toLowerCase() ?? '');
  };

  const onlyExpansions = (card: ICahCardSet) => {
    return !card.is_base_set;
  };

  return (
    <>
      <CustomPackListSort form={form} />
      <Box mb="4" />
      {cardSets &&
        cardSets
          .filter(onlyExpansions)
          .filter(cardSetFilter)
          .sort(cardSetSort)
          .map((cardSet) => {
            const selectedId = cardSet.card_set_id;
            const isChecked =
              Array.isArray(formValues['packSettings.selectedPacks']) &&
              formValues['packSettings.selectedPacks'].includes(selectedId);
            return (
              <Card
                style={{
                  cursor: 'pointer',
                  border: `1px solid ${
                    isChecked
                      ? cardSet.recommended
                        ? 'var(--yellow-9)'
                        : 'var(--gray-8)'
                      : 'transparent'
                  }`,
                }}
                key={cardSet.card_set_id}
                mb="3"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickFn(selectedId, isChecked)();
                }}
              >
                <Container>
                  <Heading size="4">{cardSet.title}</Heading>
                </Container>
              </Card>
            );
          })}
    </>
  );
};
