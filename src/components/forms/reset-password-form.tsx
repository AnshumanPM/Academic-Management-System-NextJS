"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resetPasswordClient } from "@/lib/auth-client-utils";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      toast.error("Invalid or missing reset token");
    }
  }, [token]);

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    const turnstileToken = turnstileRef.current?.getResponse();

    if (!turnstileToken) {
      toast.error("Please complete the security verification.");
      return;
    }

    setIsLoading(true);

    try {
      const { success, message } = await resetPasswordClient(
        values.password,
        token,
        turnstileToken,
      );

      if (success) {
        toast.success(message as string);
        setResetSuccess(true);
        form.reset();

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        toast.error(message as string);
        turnstileRef.current?.reset();
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      turnstileRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  }

  if (tokenError) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4 text-center">
              <p className="text-destructive text-sm">
                The reset link you followed is either invalid, expired, or has
                already been used.
              </p>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/auth/forgot-password")}
              type="button"
            >
              Request new reset link
            </Button>

            <div className="text-center text-sm">
              Remember your password?{" "}
              <Link
                className="hover:text-primary underline underline-offset-4"
                href="/auth/login"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            {resetSuccess
              ? "Your password has been reset"
              : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSuccess ? (
            <div className="space-y-4">
              <div className="border-muted bg-muted/50 flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="size-6 text-green-600 dark:text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Password reset successful!
                  </p>
                  <p className="text-muted-foreground text-xs">
                    You can now sign in with your new password. Redirecting you
                    to the login page...
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => router.push("/auth/login")}
                type="button"
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                className="grid gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            disabled={isLoading}
                            autoComplete="new-password"
                            autoFocus
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            tabIndex={-1}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be at least 8 characters with uppercase, lowercase,
                        and a number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            disabled={isLoading}
                            autoComplete="new-password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            tabIndex={-1}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  />
                </div>

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link
                    className="hover:text-primary underline underline-offset-4"
                    href="/auth/login"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        By resetting your password, you agree to our{" "}
        <Link
          href="/terms"
          className="hover:text-primary underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="hover:text-primary underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
