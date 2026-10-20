import { createContext, useContext } from "react";

type FormApiLike = any;

const TanStackFormContext = createContext<FormApiLike | null>(null);

function useTanStackFormContext() {
  const form = useContext(TanStackFormContext);
  if (!form) {
    throw new Error("Form components must be used inside <Form />.");
  }

  return form;
}

function useOptionalTanStackFormContext() {
  return useContext(TanStackFormContext);
}

export {
  TanStackFormContext,
  useTanStackFormContext,
  useOptionalTanStackFormContext,
};
