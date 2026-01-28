import * as React from "react";
import { GAME_MODES, IGameModeType } from "../types";
import { NumberInput, Text } from "@mantine/core";
import { generatePrettyDurationString } from "../../../../../../utils";
import { ICahForm } from "../../../../types";

export const GameModeRuleSetting: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <>
      {Object.keys(GAME_MODES)
        .filter((gameMode) => gameMode === form.values.gameMode)
        .map((gameMode) => {
          const gameModeConfig: IGameModeType = GAME_MODES[gameMode];
          return (
            <div key={gameMode}>
              <NumberInput
                label={gameModeConfig.inputLabel}
                description={gameModeConfig.inputDescription}
                {...form.getInputProps(gameModeConfig.inputName)}
                min={gameModeConfig.min}
                max={gameModeConfig.max}
                step={1}
                stepHoldDelay={400}
                stepHoldInterval={100}
              />
              {gameMode === "timed" && (
                <>
                  <Text size="xs" mt="xs" color="dimmed">
                    {generatePrettyDurationString(
                      {
                        unit: "minutes",
                        value: form.values.ruleTime,
                      },
                      {
                        showSeconds: false,
                      }
                    )}
                  </Text>
                </>
              )}
            </div>
          );
        })}
    </>
  );
};
