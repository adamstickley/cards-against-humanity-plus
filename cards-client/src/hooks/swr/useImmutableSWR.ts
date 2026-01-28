import useSWR, { Fetcher, Key, SWRConfiguration, SWRResponse } from "swr";

export const immutableSWRConfig = {
  dedupingInterval: undefined,
  refreshInterval: undefined,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
/**
 * Shorthand hook for retreiving immutable (or rarely changing) server data
 */
export const useImmutableSWR = <Data = any, Error = any>(
  key: Key | null,
  fetcher: Fetcher<Data> | null,
  options?: SWRConfiguration<Data, Error>
): SWRResponse<Data, Error> =>
  useSWR(key, fetcher, {
    ...options,
    ...immutableSWRConfig,
  });
