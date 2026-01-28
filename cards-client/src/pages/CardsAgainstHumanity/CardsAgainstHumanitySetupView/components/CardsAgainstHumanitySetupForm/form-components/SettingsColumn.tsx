import * as React from "react";
import { Grid } from "@mantine/core";

export const SettingsColumn: React.FC = ({ children }) => {
  return (
    <Grid.Col span={12} lg={3} md={4} sm={6} xs={12}>
      {children}
    </Grid.Col>
  );
};
