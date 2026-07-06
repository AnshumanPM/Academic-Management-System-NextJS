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
        "flex w-full items-center gap-2.5 bg-primary px-4 py-2 border-b border-primary-foreground/10 transition-all duration-300 ease-in-out",
        leaving
          ? "opacity-0 -translate-y-full max-h-0 py-0"
          : "opacity-100 translate-y-0 max-h-16",
      ].join(" ")}
    >
      <Sparkles
        size={14}
        className="text-primary-foreground/80 shrink-0"
      />

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Badge
          variant="secondary"
          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0 shrink-0 bg-primary-foreground/15 text-primary-foreground border-primary-foreground/25 hover:bg-primary-foreground/15"
        >
          New
        </Badge>
        <p className="text-xs font-medium text-primary-foreground truncate">
          Ask AI is now available
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="h-7 rounded-full px-3 text-xs font-semibold gap-1.5 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-sm"
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
          className="h-6 w-6 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15"
        >
          <X size={13} />
        </Button>
      </div>
    </div>
  );
}
