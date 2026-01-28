import { useApiContext } from '../../../api';
import { useSWRService } from '../../../hooks';
import { ICahRound, ICahPlayerHand, ICahScoreboard } from '../types';

export const useCahCurrentRound = (code: string | undefined) => {
  const api = useApiContext();

  return useSWRService<{ round: ICahRound | null }>(
    code ? api.CahGame.urlForGetCurrentRound(code) : null,
    () => api.CahGame.getCurrentRound(code!),
    { refreshInterval: 3000 },
  );
};

export const useCahPlayerHand = (
  code: string | undefined,
  playerId: number | undefined,
) => {
  const api = useApiContext();

  return useSWRService<ICahPlayerHand>(
    code && playerId ? api.CahGame.urlForGetPlayerHand(code, playerId) : null,
    () => api.CahGame.getPlayerHand(code!, playerId!),
    { refreshInterval: 3000 },
  );
};

export const useCahScoreboard = (code: string | undefined) => {
  const api = useApiContext();

  return useSWRService<ICahScoreboard>(
    code ? api.CahGame.urlForGetScoreboard(code) : null,
    () => api.CahGame.getScoreboard(code!),
    { refreshInterval: 3000 },
  );
};
