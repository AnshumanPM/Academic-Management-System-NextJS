"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "ams-ai-announcement-dismissed";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={[
        "bg-primary border-primary-foreground/10 flex w-full items-center gap-2.5 border-b px-4 py-2 transition-all duration-300 ease-in-out",
        leaving
          ? "max-h-0 -translate-y-full py-0 opacity-0"
          : "max-h-16 translate-y-0 opacity-100",
      ].join(" ")}
    >
      <Sparkles size={14} className="text-primary-foreground/80 shrink-0" />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-primary-foreground/15 text-primary-foreground border-primary-foreground/25 hover:bg-primary-foreground/15 shrink-0 px-1.5 py-0 text-[10px] font-bold tracking-wider uppercase"
        >
          New
        </Badge>
        <p className="text-primary-foreground truncate text-xs font-medium">
          Ask AI is now available
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-7 gap-1.5 rounded-full px-3 text-xs font-semibold shadow-sm"
        >
          <a
            href="https://ams-ai.zdns.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try it now
            <ExternalLink size={11} />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15 h-6 w-6 rounded-full"
        >
          <X size={13} />
        </Button>
      </div>
    </div>
  );
}
