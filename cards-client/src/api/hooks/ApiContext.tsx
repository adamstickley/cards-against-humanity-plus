import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Api } from '../Api';

// initially undefined to ensure we're creating a new client wherever this is used.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ApiContext = createContext<Api>(null);

ApiContext.displayName = 'ApiContext';

export const useApiContext = () => useContext(ApiContext);

interface ApiProviderProps {
  baseUrl: string;
  children: ReactNode;
}

export const ApiProvider = ({ baseUrl, children }: ApiProviderProps) => {
  const api = useMemo(() => new Api(baseUrl), [baseUrl]);
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
