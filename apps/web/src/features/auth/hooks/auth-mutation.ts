// Ini biasa kek crud" pakai queryClient

// Setealh ini dibuat, nanti dipakai di hooks lain.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { signInWithEmail, signOut } from "../api/sign-in.api";

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const { error } = await signOut();
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      await navigate({ to: "/login", search: { redirect: "/" } });
    },
    onError: () => {
      toast.error("Gagal logout, coba lagi");
    },
  });
}

export function useSignInWithEmail(redirectTo: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { error } = await signInWithEmail(input.email, input.password);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      router.history.push(redirectTo);
    },
  });
}
