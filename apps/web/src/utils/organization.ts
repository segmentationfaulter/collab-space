import { Organization } from "@/lib/auth";

/**
 * Finds an organization by its slug from a list of organizations.
 */
export function findOrganizationBySlug(
  organizations: Organization[],
  slug?: string | string[],
) {
  if (!slug) return undefined;
  const targetSlug = Array.isArray(slug) ? slug[0] : slug;
  return organizations.find((org) => org.slug === targetSlug);
}

/**
 * Finds an organization by its ID from a list of organizations.
 */
export function findOrganizationById(
  organizations: Organization[],
  id?: string | null,
) {
  if (!id) return undefined;
  return organizations.find((org) => org.id === id);
}
