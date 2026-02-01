"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/auth/reset-password",
      });

      if (error) {
        toast.success(
          "If an account exists with this email, you will receive a password reset link.",
        );
      } else {
        toast.success(
          "If an account exists with this email, you will receive a password reset link.",
        );
      }

      setEmailSent(true);
      form.reset();
    } catch (error) {
      toast.success(
        "If an account exists with this email, you will receive a password reset link.",
      );
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>
            {emailSent
              ? "Check your email for a reset link"
              : "Enter your email to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="border-muted bg-muted/50 flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                  <Mail className="text-primary size-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email sent successfully</p>
                  <p className="text-muted-foreground text-xs">
                    If an account exists with the email you provided, you will
                    receive a password reset link shortly. Please check your
                    inbox and spam folder.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  form.reset();
                }}
                type="button"
              >
                Try a different email
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
            </div>
          ) : (
            <Form {...form}>
              <form
                className="grid gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          disabled={isLoading}
                          autoComplete="email"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
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
        By clicking continue, you agree to our{" "}
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
