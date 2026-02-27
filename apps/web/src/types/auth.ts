import { authClient } from "@/lib/auth-client";

/**
 * Types for the Authentication and Authorization
 * derived directly from the Better Auth client instance.
 */
export type Session = typeof authClient.$Infer.Session;
export type Organization = typeof authClient.$Infer.Organization;
export type Member = typeof authClient.$Infer.Member;
export type Invitation = typeof authClient.$Infer.Invitation;
export type Role = Invitation["role"];
