import { sessionQueryOptions } from "@/features/auth/hooks/auth-queries";
import {
  createFileRoute,
  isRedirect,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    try {
      const session = await context.queryClient.query(sessionQueryOptions);

      if (!session) {
        throw redirect({
          to: "/login",
          search: { redirect: location.href },
        });
      }

      return { session };
    } catch (error) {
      if (isRedirect(error)) throw error;

      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },

  component: () => <Outlet />,
});
