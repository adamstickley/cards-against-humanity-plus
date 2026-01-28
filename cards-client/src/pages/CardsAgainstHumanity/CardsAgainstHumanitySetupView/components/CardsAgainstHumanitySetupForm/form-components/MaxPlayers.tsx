import * as React from "react";
import { NumberInput } from "@mantine/core";
import { ICahForm } from "../../../../types";

export const MaxPlayers: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <NumberInput
      label="Max players"
      description="Set the lobby limit"
      {...form.getInputProps("maxPlayers")}
      min={3}
      max={20}
      step={1}
      stepHoldDelay={400}
      stepHoldInterval={100}
    />
  );
};
