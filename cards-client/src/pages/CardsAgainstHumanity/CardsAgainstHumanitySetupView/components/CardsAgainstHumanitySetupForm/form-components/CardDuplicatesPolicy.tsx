import { Select, Text } from "@mantine/core";
import * as React from "react";
import { forwardRef } from "react";
import { ICahForm } from "../../../../types";

interface AllowItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description: string;
}

const AllowDuplicateItem = forwardRef<HTMLDivElement, AllowItemProps>(
  ({ label, description, ...others }: AllowItemProps, ref) => (
    <div ref={ref} {...others}>
      <Text size="sm">{label}</Text>
      <Text size="xs" color="dimmed">
        {description}
      </Text>
    </div>
  )
);

export const CardDuplicatesPolicy: React.FC<{
  form: ICahForm;
}> = ({ form }) => {
  return (
    <Select
      label="Card duplicates policy"
      description="How should we handle duplicate cards?"
      {...form.getInputProps("duplicatePolicy")}
      itemComponent={AllowDuplicateItem}
      data={[
        {
          value: "allow",
          label: "Allow duplicates",
          description: "Include all cards from all chosen packs.",
        },
        {
          value: "remove",
          label: "Remove duplicates",
          description: "Remove any potential duplicates.",
        },
      ]}
    />
  );
};
