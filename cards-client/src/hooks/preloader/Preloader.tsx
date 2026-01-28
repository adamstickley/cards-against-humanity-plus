import * as React from "react";
import { ErrorMessage, Loading } from "../../components";
import { IPreloaderProps } from "./IPreloaderProps";

const defaultErrorContent = (error: Error) => (
  <ErrorMessage message={error.message} title="Something went wrong" />
);

export const Preloader: React.FC<IPreloaderProps> = ({
  children,
  loading,
  error,
  errors,
  errorContent = defaultErrorContent,
}) => {
  if (!error && errors) {
    error = errors[0];
  }

  if (error) {
    return <div className="error-message">{errorContent(error)}</div>;
  }
  if (loading) {
    return <Loading />;
  }
  return children ? <>{children()}</> : null;
};

Preloader.displayName = "Preloader";
