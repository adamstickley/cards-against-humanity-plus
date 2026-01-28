import { useApiContext } from '../../../api';
import { useSWRService } from '../../../hooks';

export const useCahCardSets = () => {
  const api = useApiContext();

  return useSWRService(api.Cah.urlForGetAllSets(), () => api.Cah.getAllSets());
};

export const useCahCardSet = (cardSetId?: number) => {
  const api = useApiContext();

  return useSWRService(cardSetId ? api.Cah.urlForGetSet(cardSetId) : null, () =>
    api.Cah.getSet(cardSetId!),
  );
};
