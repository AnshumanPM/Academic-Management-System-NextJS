"use client";

import { useState, useEffect, useRef } from "react";
import { useLimitStore, WINDOW_DURATION } from "@/store/useLimitStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, Zap } from "lucide-react";

interface LimitWarningProps {
  onDismiss: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function LimitWarning({ onDismiss }: LimitWarningProps) {
  const freeLimit = useLimitStore((s) => s.freeLimit);
  const unlockUnlimited = useLimitStore((s) => s.unlockUnlimited);
  const getRemainingTime = useLimitStore((s) => s.getRemainingTime);
  const unlimitedUnlocked = useLimitStore((s) => s.unlimitedUnlocked);

  const windowHours = WINDOW_DURATION / (60 * 60 * 1000);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemainingTime(getRemainingTime());
    timeTickRef.current = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000);
    return () => {
      if (timeTickRef.current) clearInterval(timeTickRef.current);
    };
  }, [getRemainingTime]);

  useEffect(() => {
    if (unlimitedUnlocked) {
      onDismiss();
    }
  }, [unlimitedUnlocked, onDismiss]);

  const handleWatchAd = () => {
    if (countdown !== null) return;
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      unlockUnlimited();
      onDismiss();
      return;
    }
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countdown, unlockUnlimited, onDismiss]);

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
            Free Limit Reached
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed">
            You&apos;ve used your{" "}
            <span className="text-foreground font-semibold">
              {freeLimit} free
            </span>{" "}
            lookups. Open an ad to unlock{" "}
            <span className="text-foreground font-semibold">
              {windowHours} hours of unlimited access
            </span>
            .
          </p>

          {remainingTime > 0 && (
            <div className="bg-muted flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                Current window resets in{" "}
                <span className="font-semibold">
                  {formatTime(remainingTime)}
                </span>
              </span>
            </div>
          )}

          {countdown === null ? (
            <>
              <p className="text-muted-foreground text-xs">
                Click <span className="font-medium">Open Ad Link</span>, wait 5
                seconds, then press back to return.
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
                  <Zap className="mr-2 h-4 w-4" />
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
