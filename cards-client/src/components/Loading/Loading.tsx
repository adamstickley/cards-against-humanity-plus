import * as React from 'react';
import { Container, Text } from '@radix-ui/themes';

interface LoadingProps {
  children?: React.ReactNode;
}

export const Loading: React.FC<LoadingProps> = ({ children }) => (
  <Container>
    <Text>Loading...</Text>
    {children && <Text>{children}</Text>}
  </Container>
);

Loading.displayName = 'Loading';
