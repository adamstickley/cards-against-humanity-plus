import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import '@radix-ui/themes/styles.css';
import '@/index.css';
import '@/App.css';
import { Header } from './components/Header';
import { Providers } from './components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body>
          <Providers>
            <Header />
            <main style={{ padding: '1rem' }}>{children}</main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
