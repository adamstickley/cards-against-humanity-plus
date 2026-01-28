import * as React from "react";
import { Card, Text, Title } from "@mantine/core";
import { GAME_MODES } from "../types";
import { generatePrettyDurationString } from "../../../../../../utils";
import { ICahForm } from "../../../../types";

export const SettingsSummary: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Card>
      <Title order={2} mb="md">
        Summary
      </Title>
      <Text size="md" my="sm">
        <span style={{ fontWeight: "bolder" }}>Game Mode:</span>{" "}
        {GAME_MODES[form.values.gameMode].label} (
        {form.values.gameMode === "timed"
          ? generatePrettyDurationString(
              {
                unit: "minutes",
                value: form.values.ruleTime,
              },
              {
                showSeconds: false,
              }
            )
          : form.values[GAME_MODES[form.values.gameMode].inputName]}
        )
      </Text>
      <Text size="md" my="sm">
        <span style={{ fontWeight: "bolder" }}>Player limit:</span>{" "}
        {form.values.maxPlayers}
      </Text>
      <Text size="md" my="sm">
        <span style={{ fontWeight: "bolder" }}>Round Timer:</span>{" "}
        {generatePrettyDurationString({
          unit: "seconds",
          value: form.values.roundTimer,
        })}
      </Text>
      <Text size="md" my="sm" transform="capitalize">
        <span style={{ fontWeight: "bolder" }}>Duplicates:</span>{" "}
        {form.values.duplicatePolicy}
      </Text>
      <Text size="md" my="sm" transform="capitalize">
        <span style={{ fontWeight: "bolder" }}>Swaps:</span>{" "}
        {form.values.allowSwappingCards}
        {form.values.allowSwappingCards === "disallow" ||
          ` (${form.values.swapCardLimit})`}
      </Text>
    </Card>
  );
};
