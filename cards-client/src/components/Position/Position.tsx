import { FC, ReactNode } from 'react';
import { Box } from '@radix-ui/themes';

export interface IPositionProps {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  children?: ReactNode;
}

export const Position: FC<IPositionProps> = ({
  top,
  bottom,
  left,
  right,
  children,
}) => {
  return (
    <Box
      style={{
        position: 'absolute',
        top,
        bottom,
        left,
        right,
      }}
    >
      {children}
    </Box>
  );
};
