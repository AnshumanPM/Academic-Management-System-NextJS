"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.email("Invalid email address"),
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

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return {
        success: false,
        message: "Unauthorized: No valid session found",
      };
    }

    const updateData: { name: string; username?: string } = {
      name: validatedData.name,
    };

    if (validatedData.username && validatedData.username.trim() !== "") {
      const newUsername = validatedData.username.trim().toLowerCase();

      const existingUser = await db
        .select({ id: user.id, username: user.username })
        .from(user)
        .where(eq(user.username, newUsername))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return {
          success: false,
          message:
            "Username is already taken. Please choose a different username.",
        };
      }

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

const updateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  email: z.email("Invalid email address").optional(),
  role: z.enum(["user", "admin"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional().nullable(),
  banExpires: z.string().optional().nullable(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .optional()
    .nullable(),
});

export const listUsers = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return {
        success: false,
        message: "Unauthorized: No valid session found",
        users: [],
        total: 0,
      };
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Forbidden: Admin access required",
        users: [],
        total: 0,
      };
    }

    const result = await auth.api.listUsers({
      query: {},
      headers: await headers(),
    });

    const usersWithLastLogin = await Promise.all(
      result.users.map(async (u) => {
        try {
          const sessionData = await auth.api.listUserSessions({
            body: { userId: u.id },
            headers: await headers(),
          });

          const sessions = sessionData.sessions || [];
          const sortedSessions = [...sessions].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          return {
            ...u,
            lastLogin: sortedSessions[0]?.createdAt || null,
          };
        } catch {
          return {
            ...u,
            lastLogin: null,
          };
        }
      }),
    );

    return {
      success: true,
      message: "Users fetched successfully",
      users: usersWithLastLogin,
      total: result.total,
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred",
      users: [],
      total: 0,
    };
  }
};

export const adminUpdateUser = async (data: {
  userId: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  username?: string | null;
}) => {
  try {
    const validatedData = updateUserSchema.parse(data);

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return {
        success: false,
        message: "Unauthorized: No valid session found",
      };
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Forbidden: Admin access required",
      };
    }

    const updateData: Record<string, unknown> = {};

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.email !== undefined) {
      updateData.email = validatedData.email;
    }
    if (validatedData.role !== undefined) {
      updateData.role = validatedData.role;
    }
    if (validatedData.banned !== undefined) {
      updateData.banned = validatedData.banned;
    }
    if (validatedData.banReason !== undefined) {
      updateData.banReason = validatedData.banReason;
    }
    if (validatedData.banExpires !== undefined) {
      updateData.banExpires = validatedData.banExpires
        ? new Date(validatedData.banExpires)
        : null;
    }
    if (validatedData.username !== undefined) {
      if (validatedData.username && validatedData.username.trim() !== "") {
        const newUsername = validatedData.username.trim().toLowerCase();

        const existingUser = await db
          .select({ id: user.id, username: user.username })
          .from(user)
          .where(eq(user.username, newUsername))
          .limit(1);

        if (
          existingUser.length > 0 &&
          existingUser[0].id !== validatedData.userId
        ) {
          return {
            success: false,
            message:
              "Username is already taken. Please choose a different username.",
          };
        }

        updateData.username = validatedData.username;
      } else {
        updateData.username = null;
      }
    }

    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, validatedData.userId));

    return {
      success: true,
      message: "User updated successfully",
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
      message: e.message || "An unknown error occurred",
    };
  }
};
