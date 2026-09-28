'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HttpError } from '@/lib/http-error';

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

  const isRateLimited = error instanceof HttpError && error.status === 429;

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        {isRateLimited ? 'Rate limited' : 'Error'}
      </p>
      <h1 className="text-3xl font-bold sm:text-4xl">
        {isRateLimited ? 'Too many requests' : 'Something went wrong'}
      </h1>
      <p className="max-w-md text-muted-foreground">
        {isRateLimited
          ? "You've made too many attempts. Please wait a while before trying again."
          : 'We ran into an unexpected problem. Please try again.'}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
