import * as React from "react";
import { forwardRef } from "react";
import { Select, Text } from "@mantine/core";
import { ICahForm } from "../../../../types";

interface AllowSwappingProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description: string;
}

const AllowSwappingItem = forwardRef<HTMLDivElement, AllowSwappingProps>(
  ({ label, description, ...others }: AllowSwappingProps, ref) => (
    <div ref={ref} {...others}>
      <Text size="sm">{label}</Text>
      <Text size="xs" color="dimmed">
        {description}
      </Text>
    </div>
  )
);

export const AllowSwappingPolicy: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Select
      label="Card swapping policy"
      description="Players can discard cards and draw new ones"
      {...form.getInputProps("allowSwappingCards")}
      itemComponent={AllowSwappingItem}
      data={[
        {
          value: "allow",
          label: "Allow",
          description: `Allows a player to discard ${form.values.swapCardLimit} cards at the start of each turn.`,
        },
        {
          value: "limited",
          label: "Limited",
          description: `Allows a player to discard ${form.values.swapCardLimit} cards per game.`,
        },
        {
          value: "disallow",
          label: "Disallow",
          description: "Players cannot swap out cards at any point.",
        },
      ]}
    />
  );
};
