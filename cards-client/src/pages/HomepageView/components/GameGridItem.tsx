import { Anchor, Card, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { IGame } from "../../../types";
import { gameLocations } from "../../../routing";

export interface IGameGridItemProps {
  game: IGame;
}

export const GameGridItem: React.FC<IGameGridItemProps> = ({ game }) => (
  <Anchor
    underline={false}
    component={Link}
    to={gameLocations.Game.game.generateLocation({
      params: { gameName: game.slug },
    })}
  >
    <Card
      shadow="sm"
      radius={5}
      sx={(theme) => ({
        height: "100%",
        width: "100%",
        backgroundColor: theme.colors.gray[0],
        "&:hover": {
          backgroundColor: theme.colors.gray[1],
        },
      })}
    >
      <Title order={2}>{game.name}</Title>
      <Text my="md">{game.description}</Text>
    </Card>
  </Anchor>
);
