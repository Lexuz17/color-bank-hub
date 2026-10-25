import { authClient } from "./auth-client";

export function signInWithGoogle(redirectTo = "/") {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: redirectTo,
  });
}

export function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({ email, password });
}

export function signOut() {
  return authClient.signOut();
}
