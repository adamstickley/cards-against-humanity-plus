import * as React from 'react';
import { Box, Card, Container, Grid, Heading } from '@radix-ui/themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICahCardSet, ICahForm } from '../../../../../types';
import { Position } from '../../../../../../../components';

export const BasePackList: React.FC<{
  form: ICahForm;
  basePacks: ICahCardSet[];
}> = ({ form, basePacks }) => {
  const selectedBasePack = form.watch('packSettings.basePack');

  const onClickFn = (selectedId: number) => {
    return () => {
      form.setValue('packSettings.basePack', selectedId);
    };
  };

  return (
    <Grid
      columns={{
        initial: String(basePacks.length) as
          | '1'
          | '2'
          | '3'
          | '4'
          | '5'
          | '6'
          | '7'
          | '8'
          | '9',
      }}
      gap="4"
    >
      {basePacks
        .sort((a, b) => a.card_set_id - b.card_set_id)
        .map((basePack) => {
          const selectedId = basePack.card_set_id;
          const isChecked = selectedBasePack === selectedId;
          return (
            <Box key={basePack.card_set_id}>
              <Card
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: `1px solid ${
                    isChecked
                      ? basePack.recommended
                        ? 'var(--yellow-9)'
                        : 'var(--gray-8)'
                      : 'transparent'
                  }`,
                }}
                mb="3"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickFn(selectedId)();
                }}
              >
                {basePack.recommended && (
                  <Position top={-8} right={-8}>
                    <FontAwesomeIcon
                      icon="star"
                      color="var(--yellow-9)"
                      size="2x"
                    />
                  </Position>
                )}
                <Container>
                  <Heading size="4">{basePack.title}</Heading>
                </Container>
              </Card>
            </Box>
          );
        })}
    </Grid>
  );
};
