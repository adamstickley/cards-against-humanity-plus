import React from "react";
import { Grid } from "@mantine/core";
import { Preloader, useGames } from "../../../hooks";
import { assertDefined } from "../../../utils";
import { GameGridItem } from "./GameGridItem";

export interface IGameGridProps {}

export const GameGrid: React.FC<IGameGridProps> = () => {
  const [games, meta] = useGames();

  return (
    <Preloader {...meta}>
      {() => {
        assertDefined(games, "games");
        return (
          <Grid gutter="md" key={1}>
            {games.map((game, i) => (
              <Grid.Col xl={3} lg={4} md={4} sm={6} xs={12} key={i}>
                <GameGridItem game={game} />
              </Grid.Col>
            ))}
          </Grid>
        );
      }}
    </Preloader>
  );
};
