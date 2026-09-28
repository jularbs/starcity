"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Intentionally not logging error details to the client console.
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        Error
      </p>
      <h1 className="text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        We ran into an unexpected problem. Please try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
