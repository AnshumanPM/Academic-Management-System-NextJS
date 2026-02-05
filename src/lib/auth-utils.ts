"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
});

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .optional()
    .or(z.literal("")),
});

export const signIn = async (email: string, password: string) => {
  try {
    const validatedData = signInSchema.parse({ email, password });

    await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || "Validation error",
      };
    }

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
    const validatedData = signUpSchema.parse({
      email,
      name,
      password,
      username,
    });

    await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        name: validatedData.name,
        password: validatedData.password,
        username: validatedData.username,
      },
    });

    return {
      success: true,
      message: "Signed up successfully.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || "Validation error",
      };
    }

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

export const updateUserProfile = async (data: {
  name: string;
  username?: string;
}) => {
  try {
    const validatedData = updateProfileSchema.parse(data);

    const updateData: { name: string; username?: string } = {
      name: validatedData.name,
    };

    if (validatedData.username && validatedData.username.trim() !== "") {
      updateData.username = validatedData.username;
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: updateData,
    });

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || "Validation error",
      };
    }

    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};
