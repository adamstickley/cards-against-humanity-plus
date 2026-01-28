import React from "react";
import { Link, useParams } from "react-router-dom";
import { Anchor, Button } from "@mantine/core";
import { Preloader, useGame } from "../../hooks";
import { assertDefined } from "../../utils";
import { cahLocations } from "../../routing";
import { Page } from "../../components";

export const GameListView: React.FC = () => {
  const { gameName } = useParams<{ gameName: string }>();
  const [game, meta] = useGame(gameName);
  return (
    <Preloader {...meta}>
      {() => {
        assertDefined(game, "game");
        return (
          <Page title={game.name}>
            <Anchor
              underline={false}
              component={Link}
              to={cahLocations.Cah.setup.generateLocation({})}
            >
              <Button>Start</Button>
            </Anchor>
          </Page>
        );
      }}
    </Preloader>
  );
};
