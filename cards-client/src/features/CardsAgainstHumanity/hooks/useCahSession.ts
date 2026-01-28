import { useApiContext } from '../../../api';
import { useSWRService } from '../../../hooks';
import { ICahSession } from '../../../api/clients/cah/CahSessionApi';

export const useCahSession = (code: string | undefined) => {
  const api = useApiContext();

  return useSWRService<ICahSession>(
    code ? api.CahSession.urlForGetSession(code) : null,
    () => api.CahSession.getSession(code!),
    { refreshInterval: 2000 },
  );
};
