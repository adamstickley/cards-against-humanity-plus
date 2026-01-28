import * as React from 'react';
import { Box } from '@radix-ui/themes';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface HideProps {
  smallerThan: Breakpoint;
  children: React.ReactNode;
}

export const Hide: React.FC<HideProps> = ({ children, smallerThan }) => {
  const displayMap: Record<
    Breakpoint,
    {
      initial: 'none' | 'block';
      xs?: 'none' | 'block';
      sm?: 'none' | 'block';
      md?: 'none' | 'block';
      lg?: 'none' | 'block';
      xl?: 'none' | 'block';
    }
  > = {
    xs: { initial: 'none', xs: 'block' },
    sm: { initial: 'none', sm: 'block' },
    md: { initial: 'none', md: 'block' },
    lg: { initial: 'none', lg: 'block' },
    xl: { initial: 'none', xl: 'block' },
  };

  return <Box display={displayMap[smallerThan]}>{children}</Box>;
};
