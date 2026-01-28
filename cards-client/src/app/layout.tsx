'use client';

import React from 'react';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import '@/index.css';
import '@/App.css';
import { Header } from './components/Header';
import { ApiProvider } from '@/api';
import { EnvironmentConfigurator } from '@/config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Theme
          appearance="dark"
          accentColor="gray"
          grayColor="slate"
          radius="medium"
        >
          <ApiProvider
            baseUrl={EnvironmentConfigurator.getEnvironment().generateApiRoute()}
          >
            <Header />
            <main style={{ padding: '1rem' }}>{children}</main>
          </ApiProvider>
        </Theme>
      </body>
    </html>
  );
}
