import * as React from "react";
import { Grid, Select, TextInput } from "@mantine/core";
import { PackSortOptions } from "../../../../CardsAgainstHumanitySetupForm";
import { ICahForm } from "../../../../../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const sortOptions: Array<{
  label: string;
  value: PackSortOptions;
}> = [
  {
    label: "Name",
    value: "alphabetical",
  },
  {
    label: "Popularity",
    value: "popularity",
  },
];

export const CustomPackListSort: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Grid>
      <Grid.Col span={4}>
        <Select
          sx={{
            maxWidth: "200px",
          }}
          data={sortOptions}
          label="Sort By"
          {...form.getInputProps("packSettings.sortBy")}
        />
      </Grid.Col>
      <Grid.Col span={8}>
        <TextInput
          icon={<FontAwesomeIcon icon="search" />}
          label="Filter.."
          {...form.getInputProps("packSettings.filter")}
        />
      </Grid.Col>
    </Grid>
  );
};
