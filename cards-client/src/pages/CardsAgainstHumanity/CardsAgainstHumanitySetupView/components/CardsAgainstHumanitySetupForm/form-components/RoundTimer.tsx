import * as React from "react";
import { NumberInput, Text } from "@mantine/core";
import { generatePrettyDurationString } from "../../../../../../utils";
import { ICahForm } from "../../../../types";

export const RoundTimer: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <>
      <NumberInput
        label="Round Timer"
        description="Keep your game moving"
        {...form.getInputProps("roundTimer")}
        min={0}
        max={60 * 10}
        step={1}
        stepHoldDelay={400}
        stepHoldInterval={100}
      />
      <Text size="xs" mt="xs" color="dimmed">
        {generatePrettyDurationString({
          unit: "seconds",
          value: form.values.roundTimer,
        })}
      </Text>
    </>
  );
};
