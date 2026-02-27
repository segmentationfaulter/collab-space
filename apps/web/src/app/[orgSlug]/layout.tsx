import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense
        fallback={<Skeleton className="h-16 w-full rounded-none border-b" />}
      >
        <SiteHeader orgSlug={orgSlug} />
      </Suspense>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
