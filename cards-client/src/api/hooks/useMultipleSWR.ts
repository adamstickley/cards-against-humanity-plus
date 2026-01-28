import { SWRResponse } from "swr";

export interface IMultipleSWRMeta<TResponses> {
  responses: TResponses;
  errors: Error[];
  hasErrors: boolean;
  loading: boolean;
}

export type MultipleSWRData<
  TResponses extends Record<string, SWRResponse<any, Error>> = Record<
    string,
    SWRResponse<any, Error>
  >
> = {
  [Property in keyof TResponses]: NonNullable<TResponses[Property]["data"]>;
};

/**
 * Combine multiple SWR calls into one response (which isn't loaded until all items have loaded.)
 * Use conditional data loading (null key) if you don't need everything to finish together
 */
export function useMultipleSWR<
  TResponses extends Record<string, SWRResponse<any, Error>> = Record<
    string,
    SWRResponse<any, Error>
  >
>(
  responses: TResponses
): [data: MultipleSWRData<TResponses>, meta: IMultipleSWRMeta<TResponses>] {
  const errors = Object.values(responses)
    .map((r) => r.error)
    .filter(NotUndefined);
  const data = Object.keys(responses).reduce<MultipleSWRData<TResponses>>(
    (result: Record<keyof TResponses, any>, key: keyof TResponses) => {
      result[key] = responses[key].data;
      return result;
    },
    {} as MultipleSWRData<TResponses>
  );
  const hasErrors = errors.length > 0;
  const meta = {
    responses,
    errors,
    hasErrors,
    loading: !hasErrors && Object.values(responses).some((i) => !i.data),
  };

  return [data, meta];
}

function NotUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
