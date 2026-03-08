import { createAuthClient } from "better-auth/react";
import { usernameClient, organizationClient } from "better-auth/client/plugins";
import { getBaseUrl } from "./auth-utils";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [usernameClient(), organizationClient()],
});

export const { signIn, signUp, useSession } = authClient;
