import { IGame } from '../../types';
import { IServiceMeta, useSWRService } from '../swr';
import { useApiContext } from '../../api';

export const useGames = (): [IGame[] | undefined, IServiceMeta] => {
  const api = useApiContext();
  return useSWRService(api.Game.urlForGetAll(), () => api.Game.getAll());
};

export const useGame = (
  gameName?: string,
): [IGame | undefined, IServiceMeta] => {
  const api = useApiContext();
  return useSWRService(gameName ? api.Game.urlForGet(gameName) : null, () =>
    api.Game.get(gameName!),
  );
};
