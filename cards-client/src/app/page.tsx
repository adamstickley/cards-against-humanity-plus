'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Card, Container, Grid, Heading, Text } from '@radix-ui/themes';

export default function HomePage() {
  return (
    <Container size="3">
      <Heading size="8" mb="4">
        Party Games
      </Heading>
      <Text size="3" color="gray" mb="6">
        Choose a game to play with friends
      </Text>

      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
        <Link href="/cah/setup" style={{ textDecoration: 'none' }}>
          <Card size="3" style={{ cursor: 'pointer' }}>
            <Box p="2">
              <Heading size="5" mb="2">
                Cards Against Humanity
              </Heading>
              <Text size="2" color="gray">
                The party game for horrible people
              </Text>
            </Box>
          </Card>
        </Link>
      </Grid>
    </Container>
  );
}
