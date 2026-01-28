import { isUndefined } from 'lodash';
import useSWR, {
  Fetcher,
  Key,
  KeyedMutator,
  SWRConfiguration,
  SWRResponse,
} from 'swr';
import { useImmutableSWR } from './useImmutableSWR';

export interface IServiceMeta {
  loading: boolean;
  error?: Error;
}

export function swrToServiceResponse<T>(
  response: SWRResponse<T, Error>,
): [T | undefined, IServiceMeta, KeyedMutator<T>] {
  const { data, error, mutate } = response;
  return [
    data,
    { loading: isUndefined(data) && isUndefined(error), error },
    mutate,
  ];
}

export function useSWRService<Data = any>(
  key: Key | null,
  fetcher: Fetcher<Data> | null,
  options?: SWRConfiguration<Data, Error>,
): [Data | undefined, IServiceMeta, KeyedMutator<Data>] {
  return swrToServiceResponse(useSWR(key, fetcher, options));
}

export function useImmutableSWRService<Data = any>(
  key: Key | null,
  fetcher: Fetcher<Data> | null,
  options?: SWRConfiguration<Data, Error>,
): [Data | undefined, IServiceMeta, KeyedMutator<Data>] {
  return swrToServiceResponse(useImmutableSWR(key, fetcher, options));
}
