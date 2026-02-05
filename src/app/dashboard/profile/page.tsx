import { authSession } from "@/lib/auth-utils";
import { ProfileClient } from "./profile-client";

export default async function Profile() {
  const sessionData = await authSession();
  const { user, session } = sessionData!;

  return <ProfileClient user={user} session={session} />;
}
