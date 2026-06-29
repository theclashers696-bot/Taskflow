import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
