import React from "react";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Container,
  Grid,
  Header,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { MainRouter } from "./MainRouter";
import { baseLocations } from "./routing";

export const Main: React.FC = () => (
  <AppShell
    padding="md"
    header={
      <Header height={60} p="xs">
        <Grid>
          <Grid.Col span={1}>
            <Anchor
              component={Link}
              to={baseLocations.Root.root.generateLocation({})}
            >
              <ActionIcon>
                <FontAwesomeIcon icon="home" size="2x" />
              </ActionIcon>
            </Anchor>
          </Grid.Col>
        </Grid>
      </Header>
    }
    styles={(theme) => ({
      main: {
        minHeight: "calc(100vh - 60px)",
        boxSizing: "border-box",
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
      },
    })}
  >
    <Container fluid pt="md">
      <MainRouter />
    </Container>
  </AppShell>
);
