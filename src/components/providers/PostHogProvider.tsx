"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import type { ReactNode } from "react";

// Thin wrapper that makes usePostHog() available in child components.
// PostHog is initialized in src/instrumentation-client.ts before hydration.
// This provider just connects the pre-initialized singleton to the React tree.
export function PostHogProvider({ children }: { children: ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
