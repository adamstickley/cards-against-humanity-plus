import * as React from 'react';
import { Box } from '@radix-ui/themes';

interface SettingsColumnProps {
  children?: React.ReactNode;
}

export const SettingsColumn: React.FC<SettingsColumnProps> = ({ children }) => {
  return (
    <Box
      gridColumn={{
        initial: 'span 12',
        sm: 'span 6',
        md: 'span 4',
        lg: 'span 3',
      }}
    >
      {children}
    </Box>
  );
};
