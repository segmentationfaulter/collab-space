import { cache } from "react";
import { headers } from "next/headers";
import { auth, type Organization } from "./auth";
import { findOrganizationBySlug } from "@/utils/organization";

export const getAuthData = cache(async (orgSlug?: string) => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return {
      session: null,
      organizations: [] as Organization[],
      activeOrganizationId: null,
    };
  }

  let organizations: Organization[] = [];
  try {
    organizations = await auth.api.listOrganizations({
      headers: requestHeaders,
    });
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
  }

  let activeOrganizationId = session.session.activeOrganizationId;

  // Sync active organization if orgSlug is provided and different from session
  if (orgSlug) {
    const orgBySlug = findOrganizationBySlug(organizations, orgSlug);
    if (orgBySlug && orgBySlug.id !== activeOrganizationId) {
      try {
        await auth.api.setActiveOrganization({
          body: {
            organizationId: orgBySlug.id,
          },
          headers: requestHeaders,
        });
        activeOrganizationId = orgBySlug.id;
      } catch (error) {
        console.error("Failed to sync active organization:", error);
      }
    }
  }

  if (organizations.length > 0 && !activeOrganizationId) {
    const firstOrg = organizations[0];
    try {
      await auth.api.setActiveOrganization({
        body: {
          organizationId: firstOrg.id,
        },
        headers: requestHeaders,
      });
      activeOrganizationId = firstOrg.id;
    } catch (error) {
      console.error("Failed to set initial active organization:", error);
    }
  }

  return {
    session,
    organizations,
    activeOrganizationId,
  };
});
