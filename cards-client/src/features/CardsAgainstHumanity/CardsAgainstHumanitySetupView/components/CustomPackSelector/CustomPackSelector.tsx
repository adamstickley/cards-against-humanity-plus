import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Grid, Heading, Text } from '@radix-ui/themes';
import * as Accordion from '@radix-ui/react-accordion';
import { ICahCardSet, ICahForm } from '../../../types';
import { CustomPackList } from './form-components/CustomPackList/CustomPackList';
import { BasePackList } from './form-components/BasePackList/BasePackList';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export const CustomPackSelector: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = ({ form, cardSets }) => {
  const mobile = useMediaQuery('(max-width: 800px)');
  const selectedPacks = form.watch('packSettings.selectedPacks');

  return (
    <>
      <Heading size="6" mb="3">
        Custom Pack Wizard
      </Heading>
      <Heading size="5" mb="3">
        Base Pack
      </Heading>
      <BasePackList
        form={form}
        basePacks={cardSets.filter((cardSet) => cardSet.is_base_set)}
      />

      <Grid columns={{ initial: '12' }} gap="4">
        {mobile && (
          <Box
            gridColumn={{
              initial: 'span 12',
              sm: 'span 4',
              md: 'span 4',
              lg: 'span 6',
            }}
          >
            {!!selectedPacks.length && (
              <Accordion.Root type="single" collapsible>
                <Accordion.Item value="selections">
                  <Accordion.Trigger
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      background: 'var(--gray-3)',
                      width: '100%',
                    }}
                  >
                    {selectedPacks.length
                      ? `Selections (${selectedPacks.length})`
                      : ''}
                  </Accordion.Trigger>
                  <Accordion.Content style={{ padding: '8px' }}>
                    {cardSets
                      .filter((cardSet) =>
                        selectedPacks.includes(cardSet.card_set_id),
                      )
                      .sort((a, b) => {
                        if (a.title < b.title) {
                          return -1;
                        }
                        if (a.title > b.title) {
                          return 1;
                        }
                        return 0;
                      })
                      .map((cardSet) => (
                        <Text as="p" key={cardSet.card_set_id}>
                          {cardSet.title}
                        </Text>
                      ))}
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            )}
          </Box>
        )}
        <Box
          gridColumn={{
            initial: 'span 12',
            sm: 'span 8',
            md: 'span 8',
            lg: 'span 6',
          }}
        >
          <CustomPackList form={form} cardSets={cardSets} />
        </Box>
        {!mobile && (
          <Box
            gridColumn={{
              initial: 'span 12',
              sm: 'span 4',
              md: 'span 4',
              lg: 'span 6',
            }}
          >
            <Text as="p">
              Selections
              {selectedPacks.length ? ` (${selectedPacks.length})` : ''}:
            </Text>
            {cardSets
              .filter((cardSet) => selectedPacks.includes(cardSet.card_set_id))
              .sort((a, b) => {
                if (a.title < b.title) {
                  return -1;
                }
                if (a.title > b.title) {
                  return 1;
                }
                return 0;
              })
              .map((cardSet) => (
                <Text as="p" key={cardSet.card_set_id}>
                  {cardSet.title}
                </Text>
              ))}
          </Box>
        )}
      </Grid>
    </>
  );
};
