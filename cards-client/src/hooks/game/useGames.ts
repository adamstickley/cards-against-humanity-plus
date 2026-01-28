import { IGame } from '../../types';
import { IServiceMeta, useSWRService } from '../swr';
import { useApiContext } from '../../api';

export const useGames = (): [IGame[] | undefined, IServiceMeta] => {
  const api = useApiContext();
  const [data, meta] = useSWRService(api.Game.urlForGetAll(), () =>
    api.Game.getAll(),
  );
  return [data, meta];
};

export const useGame = (
  gameName?: string,
): [IGame | undefined, IServiceMeta] => {
  const api = useApiContext();
  const [data, meta] = useSWRService(
    gameName ? api.Game.urlForGet(gameName) : null,
    () => api.Game.get(gameName!),
  );
  return [data, meta];
};
