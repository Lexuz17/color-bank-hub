import { Field } from "@tanstack/react-form";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import { formContext } from "@/components/ui/form-context";
import {
  type StringFieldApi,
  type StringFieldValidators,
  getFieldError,
} from "@/lib/form-utils";

type InputProps = React.ComponentProps<"input"> & {
  field?: StringFieldApi;
  validators?: StringFieldValidators;
  label?: string;
  description?: string;
  containerClassName?: string;
  errorClassName?: string;
};

function Input({
  className,
  type,
  field,
  name,
  validators,
  label,
  description,
  containerClassName,
  errorClassName,
  id,
  ...props
}: InputProps) {
  return (
    <formContext.Consumer>
      {(form) => {
        if (!field && form && name) {
          return (
            <Field form={form} name={name} validators={validators}>
              {(nextField: StringFieldApi) => (
                <Input
                  id={id}
                  type={type}
                  className={className}
                  label={label}
                  description={description}
                  containerClassName={containerClassName}
                  errorClassName={errorClassName}
                  field={nextField}
                  {...props}
                />
              )}
            </Field>
          );
        }

        if (field) {
          const fieldId = id ?? field.name;
          const error = getFieldError(field);

          return (
            <div className={containerClassName ?? "flex flex-col gap-1.5"}>
              {label ? <label htmlFor={fieldId}>{label}</label> : null}
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
              <InputPrimitive
                id={fieldId}
                name={field.name}
                type={type}
                data-slot="input"
                className={cn(
                  "h-8 w-full min-w-0 rounded-md border border-input bg-card px-2.5 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                  className,
                )}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                {...props}
              />
              {error ? (
                <p className={cn("text-sm text-destructive", errorClassName)}>
                  {error}
                </p>
              ) : null}
            </div>
          );
        }

        return (
          <InputPrimitive
            id={id}
            name={name}
            type={type}
            data-slot="input"
            className={cn(
              "h-8 w-full min-w-0 rounded-md border border-input bg-card px-2.5 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
              className,
            )}
            {...props}
          />
        );
      }}
    </formContext.Consumer>
  );
}

export { Input };
