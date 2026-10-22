import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config";

const workersCache = await createWorkersCacheConfig();

export default defineConfig({
  worker: defineWorker({
    ...workersCache,
    name: "results-app",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-21",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    observability: {
      enabled: true,
      headSamplingRate: 1,
      logs: {
        enabled: true,
        headSamplingRate: 1,
        invocationLogs: true,
        persist: true,
      },
      traces: {
        enabled: true,
        headSamplingRate: 1,
        persist: true,
      },
      issues: {
        enabled: true,
      },
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      ...workersCache.env,
      BETTER_AUTH_SECRET: bindings.secret(),
      BETTER_AUTH_URL: bindings.secret(),
      DATABASE_URL: bindings.secret(),
      SCTEVT_API_ACCESS_KEY: bindings.secret(),
      BPUT_API_ACCESS_KEY: bindings.secret(),
      GOOGLE_CLIENT_ID: bindings.secret(),
      GOOGLE_CLIENT_SECRET: bindings.secret(),
      GITHUB_CLIENT_ID: bindings.secret(),
      GITHUB_CLIENT_SECRET: bindings.secret(),
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: bindings.secret(),
      RESEND_API_KEY: bindings.secret(),
      EMAIL_SENDER_NAME: bindings.secret(),
      EMAIL_SENDER_ADDRESS: bindings.secret(),
      TELEGRAM_BOT_TOKEN: bindings.secret(),
      NEXT_PUBLIC_POSTHOG_KEY: bindings.secret(),
      NEXT_PUBLIC_POSTHOG_HOST: bindings.secret(),
      TURNSTILE_SECRET_KEY: bindings.secret(),
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: bindings.secret(),
    },
    exports: {
      ...workersCache.exports,
    },
  }),
});
