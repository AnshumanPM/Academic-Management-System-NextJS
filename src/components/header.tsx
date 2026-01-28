"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { FullpageLoader } from "@/components/fullpage-loader";

// const menuItems = [
//   { name: "Features", href: "#link" },
//   { name: "Solution", href: "#link" },
//   { name: "Pricing", href: "#link" },
//   { name: "About", href: "#link" },
// ];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: session, isPending, error } = authClient.useSession();

  // if (isPending) {
  //   return null;
  // }

  const buttons = session
    ? [
        {
          href: "/dashboard/profile",
          label: "Profile",
          variant: "outline" as const,
        },
        { href: "/dashboard", label: "Dashboard", variant: undefined },
      ]
    : [
        { href: "/auth/login", label: "Login", variant: "outline" as const },
        { href: "/auth/signup", label: "Sign Up", variant: undefined },
      ];

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex items-center justify-between py-3 lg:py-4">
            <Link
              href="/"
              aria-label="home"
              className="flex items-center space-x-2"
            >
              <Logo />
            </Link>

            {/* {session && (
              <ul className="absolute inset-0 m-auto hidden size-fit gap-8 text-sm lg:flex">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground duration-150"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )} */}

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <div className="hidden lg:flex items-center gap-3">
                {buttons.map((btn) => (
                  <Button
                    key={btn.href}
                    asChild
                    variant={btn.variant}
                    size="sm"
                    className={cn(isScrolled && "hidden")}
                  >
                    <Link href={btn.href}>{btn.label}</Link>
                  </Button>
                ))}

                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled ? "inline-flex" : "hidden")}
                >
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="lg:hidden relative -m-2.5 p-2.5"
              >
                <Menu className="in-data-[state=active]:scale-0 duration-200 size-6" />
                <X className="absolute inset-0 m-auto scale-0 in-data-[state=active]:scale-100 duration-200 size-6" />
              </button>
            </div>
          </div>

          <div className="bg-background in-data-[state=active]:block hidden lg:hidden mt-4 rounded-3xl border p-6">
            {/* {session && (
              <ul className="space-y-6 text-base">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )} */}

            <div className="mt-6 flex flex-col gap-3">
              {buttons.map((btn) => (
                <Button key={btn.href} asChild variant={btn.variant} size="sm">
                  <Link href={btn.href}>{btn.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
