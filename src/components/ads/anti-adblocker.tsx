"use client";

import { useEffect, useRef, useState } from "react";

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
      <link rel="stylesheet" href="https://xcdn.in/AntiAdblocker/style.css" />
      <div id="ad-chk" className="adChkDiv adhidden">
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
        <div className="adblcr" id="superadblocker">
          <div className="textsshow">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "48px", height: "48px" }}
            >
              <circle cx="12" cy="12" r="10" stroke="black" fill="none" />
              <line
                x1="12"
                x2="12"
                y1="8"
                y2="12"
                stroke="black"
                strokeWidth="2"
              />
              <line
                x1="12"
                x2="12.01"
                y1="16"
                y2="16"
                stroke="black"
                strokeWidth="2"
              />
            </svg>
            <h2>AdBlock Detected!</h2>
            <p>
              Our website is made possible by displaying ads to our visitors.
              Please support us by whitelisting our website.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
