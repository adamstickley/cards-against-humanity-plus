import * as React from "react";
import { Card, Container, Grid, Title, useMantineTheme } from "@mantine/core";
import { ICahCardSet, ICahForm } from "../../../../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Position } from "../../../../../../../components";

export const BasePackList: React.FC<{
  form: ICahForm;
  basePacks: ICahCardSet[];
}> = ({ form, basePacks }) => {
  const themes = useMantineTheme();
  const onClickFn = (selectedId: number) => {
    return (event) => {
      if (event.target.checked) {
        form.setFieldValue("packSettings.basePack", selectedId);
      }
    };
  };

  return (
    <Grid columns={basePacks.length}>
      {basePacks
        .sort((a, b) => a.card_set_id - b.card_set_id)
        .map((basePack) => {
          const selectedId = basePack.card_set_id;
          const isChecked = form.values["packSettings.basePack"] === selectedId;
          return (
            <Grid.Col key={basePack.card_set_id} span={1}>
              <Card
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  border: `1px solid ${
                    isChecked
                      ? basePack.recommended
                        ? themes.colors.yellow[2]
                        : themes.colors.gray[6]
                      : "transparent"
                  }`,
                }}
                mb="md"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickFn(selectedId)({ target: { checked: !isChecked } }); // flip the checkbox
                }}
              >
                <Position top={-8} right={-8}>
                  <FontAwesomeIcon // TODO: WHY YOU NO WORK
                    icon="star"
                    color={themes.colors.yellow[2]}
                    size="2x"
                  />
                </Position>
                <Container fluid={true}>
                  <Title order={4}>{basePack.title}</Title>
                </Container>
              </Card>
            </Grid.Col>
          );
        })}
    </Grid>
  );
};
