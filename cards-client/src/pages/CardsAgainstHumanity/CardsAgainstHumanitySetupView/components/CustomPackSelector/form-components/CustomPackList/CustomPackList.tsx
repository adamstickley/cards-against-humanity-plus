import * as React from "react";
import { CustomPackListSort } from "./components/CustomPackListSort";
import { Card, Container, Space, Title, useMantineTheme } from "@mantine/core";
import { ICahCardSet, ICahForm } from "../../../../../types";

export const CustomPackList: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = ({ form, cardSets }) => {
  const themes = useMantineTheme();
  const onClickFn = (selectedId) => {
    return (event) => {
      const values = [...form.values["packSettings.selectedPacks"]];
      if (event.target.checked) {
        values.push(selectedId);
      } else {
        values.splice(values.indexOf(selectedId), 1);
      }
      form.setFieldValue("packSettings.selectedPacks", values);
    };
  };

  const cardSetSort = (a, b) => {
    if (form.values["packSettings.sortBy"] === "alphabetical") {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
    } else if (form.values["packSettings.sortBy"] === "popularity") {
      if (a.popularity > b.popularity) return -1;
      if (a.popularity < b.popularity) return 1;
    }
    return 0;
  };

  const cardSetFilter = (card) => {
    return card.title
      .toLowerCase()
      .includes(form.values["packSettings.filter"]?.toLowerCase());
  };

  const onlyExpansions = (card) => {
    return !card.is_base_set;
  };

  return (
    <>
      <CustomPackListSort form={form} />
      <Space h="lg" />
      {cardSets &&
        cardSets
          .filter(onlyExpansions)
          .filter(cardSetFilter)
          .sort(cardSetSort)
          .map((cardSet) => {
            const selectedId = cardSet.card_set_id;
            const isChecked =
              Array.isArray(form.values["packSettings.selectedPacks"]) &&
              form.values["packSettings.selectedPacks"].includes(selectedId);
            return (
              <Card
                sx={{
                  cursor: "pointer",
                  border: `1px solid ${
                    isChecked
                      ? cardSet.recommended
                        ? themes.colors.yellow[2]
                        : themes.colors.gray[6]
                      : "transparent"
                  }`,
                }}
                key={cardSet.card_set_id}
                mb="md"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickFn(selectedId)({ target: { checked: !isChecked } }); // flip the checkbox
                }}
              >
                <Container fluid={true}>
                  <Title order={4}>{cardSet.title}</Title>
                </Container>
              </Card>
            );
          })}
      {/*</CheckboxGroup>*/}
    </>
  );
};
