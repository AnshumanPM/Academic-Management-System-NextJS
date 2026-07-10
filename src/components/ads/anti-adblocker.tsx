"use client";

import { useEffect, useRef, useState } from "react";
import { CustomWarning } from "@/components/custom-warning";

export default function AntiAdblocker() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkAdBlock = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.clientHeight === 0) {
        setShowWarning(true);
      }
    };

    const timeout = setTimeout(checkAdBlock, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div id="ad-chk" className="pointer-events-none absolute -z-10 opacity-0">
        <iframe
          ref={iframeRef}
          data-aa="2304846"
          src="//ad.a-ads.com/2304846?size=300x250"
          style={{
            width: "3px",
            height: "2px",
            border: 0,
            padding: 0,
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        ></iframe>
      </div>

      {showWarning && (
        <CustomWarning
          heading="AdBlock Detected!"
          description="Our website is made possible by displaying ads to our visitors. Please support us by whitelisting our website."
          actionButton={{
            label: "I've Disabled Adblocker — Reload",
            href: window.location.href,
          }}
        />
      )}
    </>
  );
}
