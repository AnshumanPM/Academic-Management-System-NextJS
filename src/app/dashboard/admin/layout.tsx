// app/dashboard/admin/layout.tsx
import { redirect } from "next/navigation";
import { authSession } from "@/lib/auth-utils";
import { RoleName, ROLES } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authSession();

  if (!session) redirect("/auth/login");

  const role = session.user.role as RoleName;

  if (role !== ROLES.ADMIN) {
    redirect("/dashboard/student");
  }

  return <>{children}</>;
}
