import * as React from 'react';
import { Box, Heading } from '@radix-ui/themes';

export interface IPageProps {
  title?: string;
  children?: React.ReactNode;
}

export const Page: React.FC<IPageProps> = ({ title, children }) => {
  return (
    <>
      {title && (
        <Heading size="8" mb="3">
          {title}
        </Heading>
      )}
      <Box mb="3" />
      {children}
    </>
  );
};
