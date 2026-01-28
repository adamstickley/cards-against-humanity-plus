import { Container, Grid, Text, Title } from "@mantine/core";
import React from "react";

interface ErrorMessageProps {
  title: string;
  message?: string;
  hideContact?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  hideContact = false,
  children,
}) => (
  <div className="sr-error-message">
    <Container>
      <Grid>
        <Grid.Col className="error-message" span={12} md={8} lg={6}>
          <Title order={1}>{title}</Title>

          {!!message && <Text>{message}</Text>}

          {children}

          {!hideContact && (
            <Text>
              If the problem persists, get in touch with us at{" "}
              <a href="mailto:ask@cardsonline.io" target="blank">
                ask@cardsonline.io
              </a>{" "}
              and we'll get onto it ASAP.
            </Text>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  </div>
);

ErrorMessage.displayName = "ErrorMessage";
