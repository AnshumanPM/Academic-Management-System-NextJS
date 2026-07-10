"use client";

import { useState, useEffect, useRef } from "react";
import { useLimitStore } from "@/store/useLimitStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface LimitWarningProps {
  onDismiss: () => void;
}

export function LimitWarning({ onDismiss }: LimitWarningProps) {
  const maxLimit = useLimitStore((s) => s.maxLimit);
  const resetUsage = useLimitStore((s) => s.resetUsage);

  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleWatchAd = () => {
    if (countdown !== null) return;
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      resetUsage();
      onDismiss();
      return;
    }
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countdown]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999] flex items-center justify-center p-5",
        "bg-black/50 backdrop-blur-md",
      )}
    >
      <Card className="w-full max-w-sm shadow-2xl">
        <CardContent className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <AlertCircle
            className="text-foreground h-12 w-12 shrink-0"
            strokeWidth={1.5}
          />

          <h2 className="text-foreground text-lg font-extrabold tracking-tight">
            Operation Limit Reached
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Open Ad Link to Unlock {maxLimit} more operations
          </p>

          {countdown === null ? (
            <>
              <p className="text-muted-foreground text-xs">
                Click Open Ad Link, wait 5 seconds, then press back to return.
              </p>
              <Button
                asChild
                variant="default"
                size="sm"
                className="mt-1 w-full"
                onClick={handleWatchAd}
              >
                <a
                  href="https://ad.zdns.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Ad Link
                </a>
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="mt-1 w-full"
              disabled
            >
              {countdown > 0 ? `Please wait ${countdown}s…` : "Unlocking…"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
