import type {
  FieldAsyncValidateOrFn,
  FieldValidateOrFn,
  FieldValidators,
} from "@tanstack/react-form";

type StringValidator = FieldValidateOrFn<
  Record<string, string>,
  string,
  string
>;
type AsyncStringValidator = FieldAsyncValidateOrFn<
  Record<string, string>,
  string,
  string
>;

export type StringFieldValidators = FieldValidators<
  Record<string, string>,
  string,
  string,
  StringValidator,
  StringValidator,
  AsyncStringValidator,
  StringValidator,
  AsyncStringValidator,
  StringValidator,
  AsyncStringValidator,
  StringValidator,
  AsyncStringValidator
>;
export type StringFieldApi = {
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
export function getFieldError(field: StringFieldApi): string | null {
  if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) {
    return null;
  }

  return field.state.meta.errors.map((error) => String(error)).join(", ");
}
