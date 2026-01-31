import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="w-full">
      <div className="flex justify-center py-4">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <Separator />
    </header>
  );
}
