'use client';

import React from 'react';
import { Theme } from '@radix-ui/themes';
import { ApiProvider, useUserSync } from '@/api';
import { EnvironmentConfigurator } from '@/config';

type ProvidersProps = {
  children: React.ReactNode;
};

const UserSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useUserSync();
  return <>{children}</>;
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
        <UserSyncProvider>{children}</UserSyncProvider>
      </ApiProvider>
    </Theme>
  );
};
