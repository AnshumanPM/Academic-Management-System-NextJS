import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Select Your Board</h1>
      <Button asChild className="w-40">
        <Link href="/dashboard/student/sctevt">SCTEVT</Link>
      </Button>

      <Button asChild className="w-40">
        <Link href="/dashboard/student/bput">BPUT</Link>
      </Button>
    </div>
  );
}
