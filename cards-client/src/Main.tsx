import React from 'react';
import { Box, Container, Flex, IconButton, Link } from '@radix-ui/themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link as RouterLink } from 'react-router-dom';
import { MainRouter } from './MainRouter';
import { baseLocations } from './routing';

export const Main: React.FC = () => (
  <Box style={{ minHeight: '100vh' }}>
    <Box
      asChild
      style={{
        height: '60px',
        borderBottom: '1px solid var(--gray-6)',
      }}
      p="2"
    >
      <header>
        <Flex align="center" height="100%">
          <Link asChild>
            <RouterLink to={baseLocations.Root.root.generateLocation({})}>
              <IconButton variant="ghost" size="3">
                <FontAwesomeIcon icon="home" size="lg" />
              </IconButton>
            </RouterLink>
          </Link>
        </Flex>
      </header>
    </Box>
    <Container size="4" p="4">
      <MainRouter />
    </Container>
  </Box>
);
