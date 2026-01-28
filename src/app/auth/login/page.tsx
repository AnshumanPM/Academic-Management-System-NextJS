import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          Better Auth Starter
        </Link> */}
        <LoginForm />
      </div>
    </div>
  );
}
