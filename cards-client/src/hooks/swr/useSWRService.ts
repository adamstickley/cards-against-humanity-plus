import { isUndefined } from "lodash";
import useSWR, { Fetcher, Key, SWRConfiguration, SWRResponse } from "swr";
import { useImmutableSWR } from "./useImmutableSWR";

export interface IServiceMeta {
  loading: boolean;
  error?: Error;
}

export function swrToServiceResponse<T>({
  data,
  error,
}: SWRResponse<T, Error>): [T | undefined, IServiceMeta] {
  return [data, { loading: isUndefined(data) && isUndefined(error), error }];
}

export function useSWRService<Data = any>(
  key: Key | null,
  fetcher: Fetcher<Data> | null,
  options?: SWRConfiguration<Data, Error>
): [Data | undefined, IServiceMeta] {
  return swrToServiceResponse(useSWR(key, fetcher, options));
}

export function useImmutableSWRService<Data = any>(
  key: Key | null,
  fetcher: Fetcher<Data> | null,
  options?: SWRConfiguration<Data, Error>
): [Data | undefined, IServiceMeta] {
  return swrToServiceResponse(useImmutableSWR(key, fetcher, options));
}
