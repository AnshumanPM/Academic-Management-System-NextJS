import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Profile() {
  const { users } = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  });
  return (
    <div>
      <h1>All Users</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
