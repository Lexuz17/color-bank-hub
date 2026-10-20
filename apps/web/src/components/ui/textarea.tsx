import { cn } from "cn";
import { useOptionalTanStackFormContext } from "@/components/ui/form-context";

type StringFieldApi = {
  name: string;
  state: {
    value: string;
    meta: {
      errors: unknown[];
      isTouched?: boolean;
    };
  };
  handleBlur: () => void;
  handleChange: (value: string) => void;
};

type TextareaProps = React.ComponentProps<"textarea"> & {
  field?: StringFieldApi;
  validators?: any;
  label?: string;
  description?: string;
  containerClassName?: string;
  errorClassName?: string;
};

function getFieldError(field: StringFieldApi) {
  if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) {
    return null;
  }

  return field.state.meta.errors.map((error) => String(error)).join(", ");
}

function Textarea({
  className,
  field,
  name,
  validators,
  label,
  description,
  containerClassName,
  errorClassName,
  id,
  ...props
}: TextareaProps) {
  const form = useOptionalTanStackFormContext();

  if (!field && form && name) {
    return (
      <form.Field name={name as never} validators={validators as any}>
        {(nextField: StringFieldApi) => (
          <Textarea
            id={id}
            className={className}
            label={label}
            description={description}
            containerClassName={containerClassName}
            errorClassName={errorClassName}
            field={nextField}
            {...props}
          />
        )}
      </form.Field>
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
        <textarea
          id={fieldId}
          name={field.name}
          data-slot="textarea"
          className={cn(
            "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
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
    <textarea
      id={id}
      name={name}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
