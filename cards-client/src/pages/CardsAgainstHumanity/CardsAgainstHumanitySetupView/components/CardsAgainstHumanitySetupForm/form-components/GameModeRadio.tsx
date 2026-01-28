import * as React from "react";
import { GAME_MODES } from "../types";
import { Box, Radio, Text } from "@mantine/core";
import { ICahForm } from "../../../../types";

export const GameModeRadio: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Radio.Group spacing="md" required {...form.getInputProps("gameMode")}>
      {Object.keys(GAME_MODES).map((gameMode) => (
        <Radio
          key={gameMode}
          value={gameMode}
          label={
            <Box
              sx={() => ({
                width: "175px",
              })}
            >
              <Text size="sm">{GAME_MODES[gameMode].label}</Text>
              <Text size="xs">{GAME_MODES[gameMode].labelSubtext}</Text>
            </Box>
          }
        />
      ))}
    </Radio.Group>
  );
};
