import * as React from "react";
import { MantineNumberSize, MediaQuery } from "@mantine/core";

export const Hide: React.FC<{ smallerThan: MantineNumberSize }> = ({
  children,
  smallerThan,
}) => {
  return (
    <MediaQuery smallerThan={smallerThan} styles={{ display: "none" }}>
      {children}
    </MediaQuery>
  );
};
