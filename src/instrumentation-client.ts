import posthog from "posthog-js";

// Initialize PostHog before React hydration.
// No-op when key is missing so local dev works without analytics configured.
try {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (key) {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,    // Manual via onRouterTransitionStart
      capture_pageleave: true,
      autocapture: false,         // Explicit captures only pre-launch
    });
  }
} catch {
  // Never let analytics init crash the app
}

// Track pageviews on every App Router navigation.
export function onRouterTransitionStart(url: string) {
  try {
    posthog.capture("$pageview", { $current_url: window.origin + url });
  } catch {
    // Silently ignore — posthog may not be initialized
  }
}
