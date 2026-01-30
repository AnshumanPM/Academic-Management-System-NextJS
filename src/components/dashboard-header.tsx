import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";

export default function DashboardHeader() {
  return (
    <header className="w-full">
      <div className="flex justify-center py-4">
        <Logo />
      </div>
      <Separator />
    </header>
  );
}
