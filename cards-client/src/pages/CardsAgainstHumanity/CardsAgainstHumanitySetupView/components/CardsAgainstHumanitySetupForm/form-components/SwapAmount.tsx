import { NumberInput } from "@mantine/core";
import * as React from "react";
import { ICahForm } from "../../../../types";

export const SwapAmount: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <NumberInput
      label="Swap Limit"
      description="Not applicable when swapping is disabled"
      disabled={form.values.allowSwappingCards === "disallow"}
      {...form.getInputProps("swapCardLimit")}
      min={1}
      max={50}
      step={1}
      stepHoldDelay={400}
      stepHoldInterval={100}
    />
  );
};
