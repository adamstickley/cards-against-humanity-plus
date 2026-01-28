import React from "react";
import { Route, Routes } from "react-router-dom";
import { cahLocations, gameLocations } from "../../routing";
import { GameListView } from "./GameListView";
import { CardsAgainstHumanityRouter } from "../CardsAgainstHumanity";

export const GameListRouter: React.FC = () => {
  return (
    <Routes>
      <Route path={gameLocations.Game.game.path} element={<GameListView />} />
      <Route
        path={cahLocations.Cah.root.baseWildcard}
        element={<CardsAgainstHumanityRouter />}
      />
    </Routes>
  );
};
