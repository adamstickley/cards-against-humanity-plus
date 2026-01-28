'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import { HomeIcon } from '@radix-ui/react-icons';

export const Header: React.FC = () => {
  return (
    <Box
      style={{
        height: '60px',
        borderBottom: '1px solid var(--gray-6)',
      }}
      p="2"
      asChild
    >
      <header>
        <Flex align="center" height="100%">
          <Link href="/">
            <IconButton variant="ghost" size="3">
              <HomeIcon width={20} height={20} />
            </IconButton>
          </Link>
        </Flex>
      </header>
    </Box>
  );
};
