"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface CustomWarningProps {
  heading: string;
  description: string;
  actionButton?: { label: string; href: string };
  className?: string;
}

export function CustomWarning({
  heading,
  description,
  actionButton,
  className,
}: CustomWarningProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-99999 flex items-center justify-center p-5",
        "bg-black/50 backdrop-blur-md",
        className,
      )}
    >
      <Card className="w-full max-w-sm shadow-2xl">
        <CardContent className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <AlertCircle
            className="text-foreground h-12 w-12 shrink-0"
            strokeWidth={1.5}
          />

          <h2 className="text-foreground text-lg font-extrabold tracking-tight">
            {heading}
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>

          {actionButton && (
            <Button asChild variant="default" size="sm" className="mt-1 w-full">
              <a href={actionButton.href}>{actionButton.label}</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
