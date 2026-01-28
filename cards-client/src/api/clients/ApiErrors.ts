import { AxiosError } from 'axios';

export const getExceptionMessages = (error: Error): string[] => {
  const errorData = (error as AxiosError)?.response?.data;
  const errors = errorData?.errors;
  if (errors) {
    return errors.map((e: any) => {
      if (e?.status === 403) {
        return e.message.replace("Can't", "You don't have permission to");
      }
      return e.message;
    });
  }

  return [];
};
