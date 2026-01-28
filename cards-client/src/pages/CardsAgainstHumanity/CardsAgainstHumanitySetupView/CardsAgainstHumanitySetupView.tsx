import React from 'react';
import { Preloader, useGame } from '../../../hooks';
import { assertDefined } from '../../../utils';
import { combinedServiceHookMeta } from '../../../api';
import { CARD_AGAINST_HUMANITY } from '../../../consts';
import { Page } from '../../../components';
import { useCahCardSets } from '../hooks';
import { CardsAgainstHumanitySetupForm } from './components/CardsAgainstHumanitySetupForm/CardsAgainstHumanitySetupForm';
import { ICardsAgainstHumanitySetupFormValues } from './components';

export const CardsAgainstHumanitySetupView: React.FC = () => {
  const [game, gameMeta] = useGame(CARD_AGAINST_HUMANITY);
  const [cardSets, cardSetMeta] = useCahCardSets();
  const meta = combinedServiceHookMeta([gameMeta, cardSetMeta]);

  const submitHandler = (values: ICardsAgainstHumanitySetupFormValues) => {
    console.log(values);
  };

  return (
    <Preloader {...meta}>
      {() => {
        assertDefined(game, 'game');
        assertDefined(cardSets, 'cardSets');
        return (
          <Page title={game.name + ' - Setup'}>
            <CardsAgainstHumanitySetupForm
              onSubmit={submitHandler}
              cardSets={cardSets}
            />
          </Page>
        );
      }}
    </Preloader>
  );
};
