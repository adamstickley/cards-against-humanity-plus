import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { cahLocations } from '../../routing';
import { CardsAgainstHumanitySetupView } from './CardsAgainstHumanitySetupView';
import { CardsAgainstHumanityPlayView } from './CardsAgainstHumanityPlayView';

export const CardsAgainstHumanityRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path={cahLocations.Cah.setup.path}
        element={<CardsAgainstHumanitySetupView />}
      />
      <Route
        path={cahLocations.Cah.play.path}
        element={<CardsAgainstHumanityPlayView />}
      />
    </Routes>
  );
};
