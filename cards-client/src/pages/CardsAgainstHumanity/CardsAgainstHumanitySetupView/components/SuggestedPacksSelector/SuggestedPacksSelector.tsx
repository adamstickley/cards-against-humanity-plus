import * as React from "react";
import { ICahCardSet, ICahForm } from "../../../types";
import { Title } from "@mantine/core";

export const SuggestedPacksSelector: React.FC<{
  form: ICahForm;
  cardSets: ICahCardSet[];
}> = ({ form, cardSets }) => {
  return (
    <>
      <Title order={2}>Our Suggestions</Title>
    </>
  );
};
