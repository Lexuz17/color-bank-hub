import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignInWithEmail } from "../hooks/auth-mutation";

export function DevEmailLogin({ redirectTo }: { redirectTo: string }) {
  const signIn = useSignInWithEmail(redirectTo);

  const form = useForm({
    defaultValues: { email: "admin@dev.local", password: "devpassword123" },
    onSubmit: ({ value }) => {
      signIn.mutate(value);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Development login</CardTitle>
        <CardDescription>
          Available only in development. Use an account created by db:seed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="username"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            {signIn.isError && (
              <FieldError>
                Development login failed. Make sure you have run db:seed.
              </FieldError>
            )}

            <Button type="submit" disabled={signIn.isPending}>
              {signIn.isPending ? "Signing in..." : "Development login"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
