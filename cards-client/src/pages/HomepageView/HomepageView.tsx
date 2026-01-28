import React from "react";
import { GameGrid } from "./components";
import { Page } from "../../components";

export const HomepageView: React.FC = () => (
  <Page title="Welcome! Pick a game." titleProps={{ mb: "lg" }}>
    <GameGrid />
  </Page>
);
