"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const signUp = async (
  email: string,
  name: string,
  password: string,
  username: string,
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
        username,
      },
    });

    return {
      success: true,
      message: "Signed up successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const authSession = async () => {
  try {
    const session = auth.api.getSession({ headers: await headers() });

    if (!session) {
      throw new Error("Unauthorized: No valid session found");
    }

    return session;
  } catch {
    throw new Error("Authentication failed");
  }
};
