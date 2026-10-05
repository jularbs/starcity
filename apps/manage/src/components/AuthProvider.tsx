'use client';
import { validateToken } from '@/actions/auth';
import { refreshAccessTokenOnce } from '@/lib/api-client';
import { useEffect, useState } from 'react';

const requiresMfaEnrollment = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'MFA_ENROLLMENT_REQUIRED';

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        await validateToken();
      } catch (error) {
        if (!active) return;
        if (requiresMfaEnrollment(error)) {
          window.location.replace('/auth/enroll-mfa');
          return;
        }
        const newToken = await refreshAccessTokenOnce();
        if (!newToken) {
          window.location.replace('/auth/login');
          return;
        }
        try {
          await validateToken();
        } catch (refreshedError) {
          if (!active) return;
          if (requiresMfaEnrollment(refreshedError)) {
            window.location.replace('/auth/enroll-mfa');
            return;
          }
          window.location.replace('/auth/login');
          return;
        }
      }
      if (active) setAuthenticated(true);
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  if (authenticated) return <>{children}</>;
}
