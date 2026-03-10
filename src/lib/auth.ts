import "server-only";

import { betterAuth } from "better-auth";
import { username, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schemas";
import { getBaseUrl } from "./auth-utils";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  // Secret key used for signing session tokens (required)
  secret: process.env.BETTER_AUTH_SECRET,
  // The base URL for the auth server (e.g., https://myapp.com)
  baseURL: getBaseUrl(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    organization({
      organizationHooks: {
        afterCreateInvitation: async ({
          invitation,
          inviter,
          organization,
        }) => {
          const { inngest } = await import("./inngest/client");

          await inngest.send({
            name: "workspace/member.invited",
            data: {
              invitationId: invitation.id,
              email: invitation.email,
              role: invitation.role,
              organizationId: organization.id,
              organizationName: organization.name,
              inviterName: inviter.name || "Someone",
            },
          });
        },
      },
    }),
    nextCookies(),
  ],
  socialProviders: {
    github: {
      // GitHub OAuth credentials from https://github.com/settings/developers
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          username: profile.login,
        };
      },
    },
  },
});

export type Organization = typeof auth.$Infer.Organization;
export type Member = typeof auth.$Infer.Member;
export type Invitation = typeof auth.$Infer.Invitation;
export type Role = Invitation["role"];
