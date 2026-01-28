import * as React from "react";
import { Radio, Title } from "@mantine/core";
import { PackMode } from "../types";
import { ICahForm } from "../../../../types";

const PACK_OPTION_LABELS: { [k in PackMode]: string } = {
  suggested: "Our Suggested Packs",
  custom: "Customise Packs",
};

export interface IPackConfigurationProps {
  form: ICahForm;
}

export const PackConfiguration: React.FC<IPackConfigurationProps> = ({
  form,
}) => {
  return (
    <>
      <Title order={3} my="sm">
        Expansion Packs
      </Title>
      <Radio.Group spacing="xl" required {...form.getInputProps("packMode")}>
        {Object.keys(PACK_OPTION_LABELS).map((option) => (
          <Radio
            value={option}
            label={PACK_OPTION_LABELS[option]}
            key={option}
          />
        ))}
      </Radio.Group>
    </>
  );
};
