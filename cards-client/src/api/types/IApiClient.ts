import { AxiosResponse, Method } from 'axios';

export interface IApiClient {
  request<TResponseData = any>(
    method: Method,
    url: string,
    data?: Record<string, any>,
  ): Promise<AxiosResponse<TResponseData>>;
}
