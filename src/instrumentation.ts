import type { Instrumentation } from "next";

// Register runs once on server startup.
// Dynamic imports prevent Sentry from being bundled into the client.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// onRequestError captures server-side rendering errors to Sentry.
export const onRequestError: Instrumentation.onRequestError = async (err) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(err);
};
