"use client";

import Script from "next/script";

export default function AdsViewer() {
  return (
    <div className="flex w-full items-center justify-center py-4">
      <div
        id="ads-container"
        className="flex w-full flex-col items-center gap-2"
      />
      <Script
        src="https://xcdn.in/AMS/AdsViewHandler.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
