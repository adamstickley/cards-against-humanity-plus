import { Box, Container, Grid, Heading, Link, Text } from '@radix-ui/themes';
import React from 'react';

interface ErrorMessageProps {
  title: string;
  message?: string;
  hideContact?: boolean;
  children?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  hideContact = false,
  children,
}) => (
  <Box className="sr-error-message">
    <Container>
      <Grid columns={{ initial: '12' }} gap="3">
        <Box
          className="error-message"
          gridColumn={{ initial: 'span 12', md: 'span 8', lg: 'span 6' }}
        >
          <Heading size="8" mb="3">
            {title}
          </Heading>

          {!!message && <Text as="p">{message}</Text>}

          {children}

          {!hideContact && (
            <Text as="p">
              If the problem persists, get in touch with us at{' '}
              <Link href="mailto:ask@cardsonline.io" target="_blank">
                ask@cardsonline.io
              </Link>{' '}
              and we'll get onto it ASAP.
            </Text>
          )}
        </Box>
      </Grid>
    </Container>
  </Box>
);

ErrorMessage.displayName = 'ErrorMessage';
