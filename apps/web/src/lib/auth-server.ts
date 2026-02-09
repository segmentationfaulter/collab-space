import { cache } from "react";
import { headers } from "next/headers";
import { auth, type Organization } from "./auth";

export const getAuthData = cache(async () => {
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

  if (organizations.length > 0 && !activeOrganizationId) {
    const firstOrg = organizations[0];
    try {
      await auth.api.setActiveOrganization({
        body: {
          organizationId: firstOrg.id,
          organizationSlug: firstOrg.slug,
        },
        headers: requestHeaders,
      });
      activeOrganizationId = firstOrg.id;
    } catch (error) {
      console.error("Failed to set active organization:", error);
    }
  }

  return {
    session,
    organizations,
    activeOrganizationId,
  };
});
