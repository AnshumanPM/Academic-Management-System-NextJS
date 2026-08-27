// app/dashboard/student/layout.tsx
import { redirect } from "next/navigation";
import { authSession } from "@/lib/auth-utils";
import { RoleName, ROLES } from "@/lib/permissions";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authSession();

  if (!session) redirect("/auth/login");

  const role = session.user.role as RoleName;

  if (role !== ROLES.USER) {
    redirect("/dashboard/admin");
  }

  return <>{children}</>;
}
