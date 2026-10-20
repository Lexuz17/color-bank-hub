import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  TanStackFormContext,
  useTanStackFormContext,
} from "@/components/ui/form-context";

type FormApiLike = any;

interface FormProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  form: FormApiLike;
  children: ReactNode;
  onSubmit?: () => void | Promise<void>;
}

function Form({ form, children, onSubmit, ...props }: FormProps) {
  return (
    <TanStackFormContext.Provider value={form}>
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
    </TanStackFormContext.Provider>
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
  const form = useTanStackFormContext();

  return (
    <form.Subscribe
      selector={(state: { canSubmit: boolean; isSubmitting: boolean }) => [
        state.canSubmit,
        state.isSubmitting,
      ]}
    >
      {([canSubmit, isSubmitting]: [boolean, boolean]) => (
        <Button type="submit" disabled={!canSubmit} {...props}>
          {isSubmitting ? submittingText : children}
        </Button>
      )}
    </form.Subscribe>
  );
}

export { Form, FormSubmitButton };
