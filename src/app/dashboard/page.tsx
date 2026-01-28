import { redirect } from "next/navigation";
import { authSession } from "@/lib/auth-utils";
import { ROLES, RoleName } from "@/lib/permissions";

export default async function DashboardPage() {
  const session = await authSession();

  if (!session) redirect("/auth/login");

  const role = session.user.role as RoleName;

  if (role === ROLES.ADMIN) {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/student");
}
