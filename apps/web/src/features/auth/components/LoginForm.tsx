// Keep login methods together in one reusable form component.
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "../api/sign-in.api";
import { DevEmailLogin } from "./DevEmailLogin";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        className="w-full"
        onClick={() => signInWithGoogle(redirectTo)}
      >
        Login with Google
      </Button>
      {import.meta.env.DEV && <DevEmailLogin redirectTo={redirectTo} />}
    </div>
  );
}
