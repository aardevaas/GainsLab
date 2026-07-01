"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// global-error.tsx replaces the entire root layout — CSS vars are unavailable,
// so colors are hardcoded from the design token values in globals.css.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#090D15",
          color: "#EFF4FF",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          margin: 0,
          padding: "1.5rem",
          textAlign: "center",
          gap: "0",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔧</div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: "#8DA4C2",
            marginBottom: "2rem",
            maxWidth: "360px",
            lineHeight: 1.6,
            fontSize: "0.9375rem",
          }}
        >
          Our team has been notified. Try refreshing the page or return to the home page.
        </p>
        <div
          style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          <button
            onClick={reset}
            style={{
              background: "#FF8000",
              color: "#090D15",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.625rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              border: "1px solid #1E2D47",
              color: "#8DA4C2",
              borderRadius: "0.75rem",
              padding: "0.625rem 1.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
