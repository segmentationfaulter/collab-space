import { createAuthClient } from "better-auth/react";
import { usernameClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [usernameClient(), organizationClient()],
});

export const { signIn, signUp, useSession } = authClient;
export type Session = typeof authClient.$Infer.Session;
