import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage({ redirectTo }: { redirectTo: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
