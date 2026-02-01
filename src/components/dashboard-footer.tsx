import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function DashboardFooter() {
  return (
    <footer className="w-full">
      <Separator />
      <div className="text-muted-foreground flex justify-center py-4 text-sm">
        <p>
          Crafted by{" "}
          <Link
            href="https://github.com/AnshumanPM"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary font-bold duration-150"
          >
            AnshumanPM
          </Link>
        </p>
      </div>
    </footer>
  );
}
