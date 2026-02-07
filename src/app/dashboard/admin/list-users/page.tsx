import { UsersTable } from "@/components/admin/users-table";

export default async function ListUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all users in the system
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
