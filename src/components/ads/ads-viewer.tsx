"use client";

import Script from "next/script";

export default function AdsViewer() {
  return (
    <div className="w-full overflow-x-hidden py-4">
      <div
        id="ads-container"
        className="flex w-full max-w-full flex-col items-center gap-2 overflow-hidden"
      />
      <Script
        src="https://xcdn.in/AMS/AdsViewHandler.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
