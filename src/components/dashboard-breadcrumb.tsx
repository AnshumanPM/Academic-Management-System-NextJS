// components/dashboard-breadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type NavItem = {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

interface Props {
  navItems: NavItem[];
}

export function DashboardBreadcrumb({ navItems }: Props) {
  const pathname = usePathname();

  let parent: NavItem | null = null;
  let child: { title: string; url: string } | null = null;

  for (const item of navItems) {
    if (item.url === pathname) {
      parent = item;
      break;
    }

    if (item.items) {
      const found = item.items.find((sub) => sub.url === pathname);

      if (found) {
        parent = item;
        child = found;
        break;
      }
    }
  }

  if (!parent) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Parent */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={parent.url}>{parent.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {child && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />

            <BreadcrumbItem>
              <BreadcrumbPage>{child.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {!child && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />

            <BreadcrumbItem>
              <BreadcrumbPage>{parent.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
