import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  usernameClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { ac, roleObjects } from "@/lib/permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [
    adminClient({
      ac,
      roleObjects,
    }),
    usernameClient(),
    lastLoginMethodClient(),
  ],
});
