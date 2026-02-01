import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  usernameClient,
  lastLoginMethodClient,
  oneTapClient,
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
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      context: "signin",
      autoSelect: false,
      cancelOnTapOutside: true,
    }),
  ],
});
