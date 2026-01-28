import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { Box, Card, Container, Grid, Heading, Text } from '@radix-ui/themes';
import { StarFilledIcon, CheckIcon } from '@radix-ui/react-icons';
import { ICahCardSet, ICahForm } from '../../../types';
import { Position } from '../../../../../components';

export const SuggestedPacksSelector: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = ({ form, cardSets }) => {
  const selectedPacks = form.watch('packSettings.selectedPacks');
  const selectedBasePack = form.watch('packSettings.basePack');

  const basePacks = useMemo(
    () => cardSets.filter((cardSet) => cardSet.is_base_set),
    [cardSets],
  );

  const recommendedPacks = useMemo(
    () =>
      cardSets
        .filter((cardSet) => cardSet.recommended && !cardSet.is_base_set)
        .sort((a, b) => b.popularity - a.popularity),
    [cardSets],
  );

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    if (recommendedPacks.length > 0 && selectedPacks.length === 0) {
      hasInitialized.current = true;
      const recommendedIds = recommendedPacks.map((pack) => pack.card_set_id);
      form.setValue('packSettings.selectedPacks', recommendedIds);
    }
  }, [form, recommendedPacks, selectedPacks.length]);

  const onBasePackClick = (selectedId: number) => {
    return () => {
      form.setValue('packSettings.basePack', selectedId);
    };
  };

  const onPackToggle = (packId: number, isCurrentlySelected: boolean) => {
    return () => {
      const values = [...selectedPacks];
      if (!isCurrentlySelected) {
        values.push(packId);
      } else {
        values.splice(values.indexOf(packId), 1);
      }
      form.setValue('packSettings.selectedPacks', values);
    };
  };

  const totalSelectedCount = selectedPacks.length + (selectedBasePack ? 1 : 0);

  return (
    <>
      <Heading size="6" mb="3">
        Quick Setup
      </Heading>
      <Text size="2" color="gray" mb="4" as="p">
        We have pre-selected the most popular packs for a great game experience.
        You can toggle packs on or off below.
      </Text>

      <Heading size="5" mb="3">
        Base Pack
      </Heading>
      <Grid
        columns={{
          initial: String(Math.min(basePacks.length, 3)) as '1' | '2' | '3',
        }}
        gap="4"
        mb="5"
      >
        {basePacks
          .sort((a, b) => a.card_set_id - b.card_set_id)
          .map((basePack) => {
            const packId = basePack.card_set_id;
            const isSelected = selectedBasePack === packId;
            return (
              <Box key={packId}>
                <Card
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    border: `1px solid ${
                      isSelected
                        ? basePack.recommended
                          ? 'var(--yellow-9)'
                          : 'var(--gray-8)'
                        : 'transparent'
                    }`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onBasePackClick(packId)();
                  }}
                >
                  {basePack.recommended && (
                    <Position top={-8} right={-8}>
                      <StarFilledIcon
                        color="var(--yellow-9)"
                        width={24}
                        height={24}
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

      {recommendedPacks.length > 0 && (
        <>
          <Heading size="5" mb="3">
            Recommended Expansion Packs
          </Heading>
          <Text size="2" color="gray" mb="3" as="p">
            {totalSelectedCount} pack{totalSelectedCount !== 1 ? 's' : ''}{' '}
            selected
          </Text>
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="3">
            {recommendedPacks.map((pack) => {
              const packId = pack.card_set_id;
              const isSelected = selectedPacks.includes(packId);
              return (
                <Card
                  key={packId}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    border: `1px solid ${
                      isSelected ? 'var(--accent-9)' : 'transparent'
                    }`,
                    opacity: isSelected ? 1 : 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onPackToggle(packId, isSelected)();
                  }}
                >
                  {isSelected && (
                    <Position top={-8} right={-8}>
                      <Box
                        style={{
                          background: 'var(--accent-9)',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckIcon color="white" width={14} height={14} />
                      </Box>
                    </Position>
                  )}
                  <Container>
                    <Heading size="4">{pack.title}</Heading>
                  </Container>
                </Card>
              );
            })}
          </Grid>
        </>
      )}

      {recommendedPacks.length === 0 && (
        <Text size="2" color="gray" as="p">
          No recommended expansion packs available. Switch to Custom mode to
          browse all packs.
        </Text>
      )}
    </>
  );
};
