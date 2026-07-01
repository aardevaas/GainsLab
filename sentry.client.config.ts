import * as Sentry from "@sentry/nextjs";

// Client-side Sentry init — loaded automatically by withSentryConfig.
// No-op when DSN is missing so local dev works without Sentry configured.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [],
  });
}
