'use client';

import React from 'react';
import { Theme } from '@radix-ui/themes';
import { ApiProvider } from '@/api';
import { EnvironmentConfigurator } from '@/config';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Theme
      appearance="dark"
      accentColor="gray"
      grayColor="slate"
      radius="medium"
    >
      <ApiProvider
        baseUrl={EnvironmentConfigurator.getEnvironment().generateApiRoute()}
      >
        {children}
      </ApiProvider>
    </Theme>
  );
};
