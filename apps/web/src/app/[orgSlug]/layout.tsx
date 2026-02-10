import { SiteHeader } from "@/components/site-header";

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
      <SiteHeader orgSlug={orgSlug} />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
