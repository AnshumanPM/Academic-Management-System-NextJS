// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { authSession } from "@/lib/auth-utils";
import { RoleName, ROLES } from "@/lib/permissions";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { adminNavConfig, studentNavConfig } from "@/lib/nav-config";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import DashboardFooter from "@/components/dashboard-footer";
import DashboardHeader from "@/components/dashboard-header";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authSession();

  if (!session) redirect("/auth/login");

  const role = session.user.role as RoleName;

  const navItems = role === ROLES.ADMIN ? adminNavConfig : studentNavConfig;

  const sidebarUser = {
    name: session.user.name || "",
    email: session.user.email,
    avatar: session.user.image || "",
  };

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} user={sidebarUser} />

      <SidebarInset>
        <DashboardHeader />
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {navItems && <DashboardBreadcrumb navItems={navItems} />}
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen flex-1">{children}</main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
