import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function DashboardFooter() {
  return (
    <footer className="w-full">
      <Separator />
      <div className="flex justify-center py-4 text-sm text-muted-foreground">
        <p>
          Crafted by{" "}
          <Link
            href="https://github.com/AnshumanPM"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary duration-150 font-bold"
          >
            AnshumanPM
          </Link>
        </p>
      </div>
    </footer>
  );
}
