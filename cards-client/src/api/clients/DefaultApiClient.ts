import axios, { AxiosInstance, AxiosResponse, Method } from "axios";
import { IApiClient } from "../types";

export class DefaultApiClient implements IApiClient {
  protected cardsApi: AxiosInstance;

  constructor(baseUrl: string) {
    this.cardsApi = axios.create({
      baseURL: baseUrl,
    });

    // Handle a 401 unauthorised
    this.cardsApi.interceptors.response.use(
      undefined,
      this.unauthorisedHandler
    );

    // Log any errors
    this.cardsApi.interceptors.response.use(undefined, this.logErrorHandler);
  }

  protected unauthorisedHandler = async (error: any) => Promise.reject(error);

  /**
   * Handle and log API errors
   */
  protected logErrorHandler = async (error: any) => {
    if (error && error.response) {
      const { response } = error;
      const level = response.status >= 500 ? console.error : console.warn;
      level(`${response.status} Response`, error.response);
    }
    return Promise.reject(error);
  };

  public async request<TResponseData = any>(
    method: Method,
    url: string,
    data?: Record<string, any>
  ): Promise<AxiosResponse<TResponseData>> {
    const headers = {};
    return this.cardsApi.request({
      url,
      method,
      data,
      headers,
    });
  }
}
