'use client';
import { redirect } from 'next/navigation';
import { validateToken } from '@/actions/auth';
import { refreshAccessTokenOnce } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    validateToken()
      .then(() => {
        if (active) setAuthenticated(true);
      })
      .catch(() => {
        refreshAccessTokenOnce()
          .then((newToken) => {
            if (!newToken) throw new Error('Unable to refresh access token');
            if (active) setAuthenticated(true);
          })
          .catch((err) => {
            if (!active) return;
            toast.error('Authentication Error!', {
              style: {
                background: 'rgba(220, 46, 46, 1)',
                color: 'white',
                border: 'none',
              },
              description: err.error,
              duration: 5000,
            });
            redirect('/auth/login');
          });
      });

    return () => {
      active = false;
    };
  }, []);

  if (authenticated) return <>{children}</>;
}
