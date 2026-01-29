'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Button, Flex, IconButton } from '@radix-ui/themes';
import { GearIcon, HomeIcon } from '@radix-ui/react-icons';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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
        <Flex align="center" justify="between" height="100%">
          <Link href="/">
            <IconButton variant="ghost" size="3">
              <HomeIcon width={20} height={20} />
            </IconButton>
          </Link>
          <Flex align="center" gap="3">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="soft">Sign In</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/settings">
                <IconButton variant="ghost" size="2">
                  <GearIcon width={18} height={18} />
                </IconButton>
              </Link>
              <UserButton />
            </SignedIn>
          </Flex>
        </Flex>
      </header>
    </Box>
  );
};
