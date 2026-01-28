import * as React from "react";
import { Container, Text } from "@mantine/core";

export const Loading: React.SFC = ({ children }) => (
  <Container>
    <Text>Loading...</Text>
    {children && <Text>{children}</Text>}
  </Container>
);

Loading.displayName = "Loading";
