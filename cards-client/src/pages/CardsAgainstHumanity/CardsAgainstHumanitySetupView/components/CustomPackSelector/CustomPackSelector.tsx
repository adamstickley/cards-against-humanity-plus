import * as React from "react";
import { ICahCardSet, ICahForm } from "../../../types";
import { Accordion, Grid, Text, Title } from "@mantine/core";
import { CustomPackList } from "./form-components/CustomPackList/CustomPackList";
import { useMediaQuery } from "@mantine/hooks";
import { BasePackList } from "./form-components/BasePackList/BasePackList";

export const CustomPackSelector: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = ({ form, cardSets }) => {
  const mobile = useMediaQuery("(max-width: 800px)");
  const selectedPacks = form.values["packSettings.selectedPacks"];

  return (
    <>
      <Title order={2} mb="md">
        Custom Pack Wizard
      </Title>
      <Title order={3} mb="md">
        Base Pack
        {/* TODO: parse the CAH spreadsheet to create separate base sets for AU/CA/UK/US*/}
        {/*  currently, ALL are in the "Base set" when they should be separated using the Version columns */}
      </Title>
      <BasePackList
        form={form}
        basePacks={cardSets.filter((cardSet) => cardSet.is_base_set)}
      />

      <Grid>
        {mobile && (
          <Grid.Col xl={6} lg={6} md={4} sm={4} xs={12}>
            {!!selectedPacks.length && (
              <Accordion>
                <Accordion.Item
                  label={
                    selectedPacks.length
                      ? `Selections (${selectedPacks.length})`
                      : ""
                  }
                >
                  {cardSets
                    .filter((cardSet) =>
                      form.values["packSettings.selectedPacks"].includes(
                        cardSet.card_set_id
                      )
                    )
                    .sort((a, b) => {
                      if (a.title < b.title) return -1;
                      if (a.title > b.title) return 1;
                      return 0;
                    })
                    .map((cardSet) => (
                      <Text key={cardSet.card_set_id}>{cardSet.title}</Text>
                    ))}
                </Accordion.Item>
              </Accordion>
            )}
          </Grid.Col>
        )}
        <Grid.Col xl={6} lg={6} md={8} sm={8} xs={12}>
          <CustomPackList form={form} cardSets={cardSets} />
        </Grid.Col>
        {!mobile && (
          <Grid.Col xl={6} lg={6} md={4} sm={4} xs={12}>
            {/* TODO: change to accordion for mobile so selections don't push the screen down */}
            <Text>
              Selections
              {selectedPacks.length ? ` (${selectedPacks.length})` : ""}:
            </Text>
            {cardSets
              .filter((cardSet) => selectedPacks.includes(cardSet.card_set_id))
              .sort((a, b) => {
                if (a.title < b.title) return -1;
                if (a.title > b.title) return 1;
                return 0;
              })
              .map((cardSet) => (
                <Text key={cardSet.card_set_id}>{cardSet.title}</Text>
              ))}
          </Grid.Col>
        )}
      </Grid>
    </>
  );
};
