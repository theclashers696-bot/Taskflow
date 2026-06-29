"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            A critical error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1.5rem", fontFamily: "monospace" }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{ padding: "0.5rem 1.25rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{ padding: "0.5rem 1.25rem", background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "0.5rem", cursor: "pointer" }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
