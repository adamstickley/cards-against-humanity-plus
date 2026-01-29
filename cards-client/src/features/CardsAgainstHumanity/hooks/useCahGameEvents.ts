import { useApiContext } from '../../../api';
import { useSWRService } from '../../../hooks';
import { ICahEventHistory, ICahEventSummary, CahGameEventType } from '../types';

export interface UseCahGameEventsParams {
  eventTypes?: CahGameEventType[];
  playerId?: number;
  roundNumber?: number;
  limit?: number;
  offset?: number;
}

export const useCahGameEvents = (
  code: string | undefined,
  params?: UseCahGameEventsParams,
) => {
  const api = useApiContext();

  return useSWRService<ICahEventHistory>(
    code ? api.CahGame.urlForGetEvents(code, params) : null,
    () => api.CahGame.getEvents(code!, params),
    { refreshInterval: 5000 },
  );
};

export const useCahGameEventsSummary = (code: string | undefined) => {
  const api = useApiContext();

  return useSWRService<ICahEventSummary>(
    code ? api.CahGame.urlForGetEventsSummary(code) : null,
    () => api.CahGame.getEventsSummary(code!),
    { refreshInterval: 5000 },
  );
};

export const useCahRoundEvents = (
  code: string | undefined,
  roundNumber: number | undefined,
) => {
  const api = useApiContext();

  return useSWRService<ICahEventHistory>(
    code && roundNumber !== undefined
      ? api.CahGame.urlForGetRoundEvents(code, roundNumber)
      : null,
    () => api.CahGame.getRoundEvents(code!, roundNumber!),
    { refreshInterval: 5000 },
  );
};
