import * as React from "react";
import { Space, Title, TitleProps } from "@mantine/core";

export interface IPageProps {
  title?: string;
  titleProps?: TitleProps;
}

export const Page: React.FC<IPageProps> = ({ title, titleProps, children }) => {
  return (
    <>
      {title && <Title {...titleProps}>{title}</Title>}
      <Space h="sm" />
      {children}
    </>
  );
};
