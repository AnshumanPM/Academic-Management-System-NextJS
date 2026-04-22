import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, admin, username, oneTap } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";
import { db } from "@/db/drizzle";
import * as schema from "@/db/auth-schema";
import { ac, roleObjects, ROLES } from "@/lib/permissions";
import { sendTelegramMessage } from "@/lib/helper";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log("Reset password URL:", url);
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: "Reset your password",
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email,
        }),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log("Verify email URL:", url);
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "jwt",
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }
      if (!ctx.body?.email.endsWith("@gmail.com")) {
        throw new APIError("BAD_REQUEST", {
          message: "Email must end with @gmail.com",
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path.startsWith("/sign-up") ||
        ctx.path.startsWith("/sign-in") ||
        ctx.path.startsWith("/callback")
      ) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          const user = newSession.user;
          const imageLink = user.image
            ? `<a href="${user.image}">Here</a>`
            : "No image";
          const message = `<b>New ${ctx.path.startsWith("/sign-up") ? "Sign Up" : "Sign In"}</b>\n\n<b>Name:</b> ${user.name}\n<b>Email:</b> ${user.email}\n<b>Picture:</b> ${imageLink}`;
          await sendTelegramMessage(message);
        }
      }
    }),
  },
  plugins: [
    admin({
      ac,
      roleObjects,
      defaultRole: ROLES.USER,
      adminRoles: ROLES.ADMIN,
    }),
    username(),
    lastLoginMethod(),
    oneTap(),
    nextCookies(),
  ],
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"],
      disableIpTracking: false,
    },
    cookiePrefix: "AMS_AUTH",
  },
});