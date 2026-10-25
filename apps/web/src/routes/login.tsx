import { sessionQueryOptions } from "@/features/auth/hooks/auth-queries";
import { LoginPage } from "@/pages/login-page";
import { createFileRoute, redirect } from "@tanstack/react-router";

function safeRedirect(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: safeRedirect(search.redirect),
  }),

  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient
      .query(sessionQueryOptions)
      .catch(() => null);

    if (session) {
      throw redirect({ to: search.redirect });
    }
  },
  component: LoginRoute,
});

function LoginRoute() {
  const { redirect: redirectTo } = Route.useSearch();
  return <LoginPage redirectTo={redirectTo} />;
}
