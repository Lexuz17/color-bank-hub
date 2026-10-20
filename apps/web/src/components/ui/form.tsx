import { useContext, type ComponentProps, type ReactNode } from "react";
import {
  createFormHook,
  type AnyFormApi,
  useStore,
} from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { fieldContext, formContext } from "@/components/ui/form-context";

type FormHookComponents = Parameters<
  typeof createFormHook
>[0]["fieldComponents"];

export function createAppForm<
  TFieldComponents extends FormHookComponents = Record<string, never>,
  TFormComponents extends FormHookComponents = Record<string, never>,
>(fieldComponents?: TFieldComponents, formComponents?: TFormComponents) {
  return createFormHook({
    fieldContext,
    formContext,
    fieldComponents: fieldComponents ?? ({} as TFieldComponents),
    formComponents: formComponents ?? ({} as TFormComponents),
  });
}

interface FormProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: AnyFormApi;
  children: ReactNode;
  onSubmit?: () => void | Promise<void>;
}

function Form({ form, children, onSubmit, ...props }: FormProps) {
  return (
    <formContext.Provider value={form}>
      <form
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (onSubmit) {
            void onSubmit();
            return;
          }
          void form.handleSubmit();
        }}
      >
        {children}
      </form>
    </formContext.Provider>
  );
}

interface FormSubmitButtonProps extends ComponentProps<typeof Button> {
  submittingText?: string;
}

function FormSubmitButton({
  children,
  submittingText = "Submitting...",
  ...props
}: FormSubmitButtonProps) {
  const form = useContext(formContext);
  if (!form) return null;

  return (
    <SubmitButton formApi={form} submittingText={submittingText} {...props}>
      {children}
    </SubmitButton>
  );
}

function SubmitButton({
  formApi,
  submittingText,
  children,
  ...props
}: FormSubmitButtonProps & { formApi: AnyFormApi }) {
  const canSubmit = useStore(formApi.store, (state) => state.canSubmit);
  const isSubmitting = useStore(formApi.store, (state) => state.isSubmitting);

  return (
    <Button type="submit" disabled={!canSubmit} {...props}>
      {isSubmitting ? submittingText : children}
    </Button>
  );
}

export { Form, FormSubmitButton };
