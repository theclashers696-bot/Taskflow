"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
