"use client";

import { authClient } from "@/lib/auth-client";

export const signInClient = async (
  email: string,
  password: string,
  turnstileToken: string,
) => {
  try {
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
      fetchOptions: {
        headers: {
          "x-captcha-response": turnstileToken,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Failed to sign in",
      };
    }

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

export const signUpClient = async (
  email: string,
  name: string,
  password: string,
  username: string,
  turnstileToken: string,
) => {
  try {
    const { error } = await authClient.signUp.email({
      email,
      name,
      password,
      username,
      fetchOptions: {
        headers: {
          "x-captcha-response": turnstileToken,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Failed to create account",
      };
    }

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const forgotPasswordClient = async (
  email: string,
  turnstileToken: string,
) => {
  try {
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/auth/reset-password",
      fetchOptions: {
        headers: {
          "x-captcha-response": turnstileToken,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Failed to send reset email",
      };
    }

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const resetPasswordClient = async (
  newPassword: string,
  token: string,
  turnstileToken: string,
) => {
  try {
    const { error } = await authClient.resetPassword({
      newPassword,
      token,
      fetchOptions: {
        headers: {
          "x-captcha-response": turnstileToken,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || "Failed to reset password",
      };
    }

    return {
      success: true,
      message: "Password reset successfully!",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};
