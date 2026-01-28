import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  CardsAgainstHumanityRouter,
  GameListRouter,
  HomepageView,
} from './pages';
import { cahLocations, gameLocations } from './routing';

export const MainRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<HomepageView />} />
      <Route
        path={gameLocations.Game.root.baseWildcard}
        element={<GameListRouter />}
      />
      <Route
        path={cahLocations.Cah.root.baseWildcard}
        element={<CardsAgainstHumanityRouter />}
      />
    </Routes>
  );
};
