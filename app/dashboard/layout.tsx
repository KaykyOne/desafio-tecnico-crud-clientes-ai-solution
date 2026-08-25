import type { ReactNode } from "react";

import DashboardAuthGuard from "./_components/dashboard-auth-guard";
import DashboardSidebar from "./_components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGuard>
      <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
        <aside className="w-full border-b bg-background px-5 py-5 sm:px-8 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 lg:px-6">
          <DashboardSidebar />
        </aside>
        <main className="min-w-0 flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-12">{children}</main>
      </div>
    </DashboardAuthGuard>
  );
}
