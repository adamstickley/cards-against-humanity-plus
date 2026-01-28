import { createContext, useContext } from 'react';
import { Api } from '../Api';

// initially undefined to ensure we're creating a new client wherever this is used.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ApiContext = createContext<Api>(null);

ApiContext.displayName = 'ApiContext';

export const useApiContext = () => useContext(ApiContext);
