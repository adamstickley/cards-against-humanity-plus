import { FC } from "react";
import { Box } from "@mantine/core";

export interface IPositionProps {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
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
      sx={{
        position: "absolute",
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
