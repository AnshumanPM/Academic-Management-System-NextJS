"use client";

import NextTopLoader from "nextjs-toploader";

const LoaderComponent =
  "default" in (NextTopLoader as object)
    ? (NextTopLoader as unknown as { default: typeof NextTopLoader }).default
    : NextTopLoader;

export function TopLoader() {
  if (typeof LoaderComponent !== "function") {
    return null;
  }
  return (
    <LoaderComponent
      color="var(--primary)"
      height={3}
      showSpinner={false}
    />
  );
}
