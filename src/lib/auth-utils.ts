/**
 * Determines the base URL for the application.
 * This is used by Better Auth and tRPC to construct absolute URLs.
 */
export function getBaseUrl() {
  // Browser-side: Always use the current window's origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  /**
   * 1. Vercel Production URL
   * Automatically set by Vercel. Reflects your custom domain (e.g. collab-space.com).
   * Note: The value does NOT include the 'https://' protocol.
   */
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  /**
   * 2. Vercel Preview/Deployment URL
   * Automatically set by Vercel for every unique deployment/PR preview.
   * Note: The value does NOT include the 'https://' protocol.
   */
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  /**
   * 3. Local Development Fallback
   */
  return "http://localhost:3000";
}
