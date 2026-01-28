import { flatMap } from 'lodash';

interface IServiceMeta {
  loading: boolean;
  error?: Error;
}

export interface IMultipleServiceHooksMeta<TResponses> {
  responses: TResponses;
  errors: Error[];
  hasErrors: boolean;
  loading: boolean;
}

function isMultipleServiceHooksMeta(
  meta: IMultipleServiceHooksMeta<any> | IServiceMeta,
): meta is IMultipleServiceHooksMeta<any> {
  return meta.hasOwnProperty('errors');
}

function NotUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function combinedServiceHookMeta(
  metas: (IServiceMeta | IMultipleServiceHooksMeta<any>)[],
): Omit<IMultipleServiceHooksMeta<any>, 'responses'> {
  const errors = flatMap(metas, (m) =>
    isMultipleServiceHooksMeta(m) ? m.errors : m.error,
  ).filter(NotUndefined);
  const hasErrors = errors.length > 0;
  const loading = !hasErrors && metas.some((m) => m.loading);
  return { loading, errors, hasErrors };
}

export function simplifiedServiceHookMeta(
  metas: (IServiceMeta | IMultipleServiceHooksMeta<any>)[],
): IServiceMeta {
  const { loading, errors, hasErrors } = combinedServiceHookMeta(metas);
  const error = hasErrors ? errors[0] : undefined;
  return { loading, error };
}
