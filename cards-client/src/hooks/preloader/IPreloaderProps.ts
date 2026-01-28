export interface IPreloaderProps {
  children?: () => React.ReactNode;
  loading?: boolean;
  error?: Error;
  errors?: Error[];
  errorContent?: (error: Error) => React.ReactNode;
}
