'use client';

import { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { removeCookie } from 'typescript-cookie';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  beginMfaSetup,
  confirmMfaSetup,
  disableMfa,
  getMfaStatus,
  regenerateMfaRecoveryCodes,
} from '@/actions/auth';
import { getErrorMessage } from '@/lib/errors';

type SetupData = {
  qrCode: string;
  manualEntryKey: string;
};

const MfaSettings = () => {
  const { data: statusResponse, mutate: refreshStatus } = useSWR(
    'mfa-status',
    getMfaStatus,
  );
  const status = statusResponse?.data;
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const response = await beginMfaSetup(currentPassword);
      setSetup(response.data);
      setCurrentPassword('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const enableMfa = async () => {
    setLoading(true);
    try {
      const response = await confirmMfaSetup(code);
      setRecoveryCodes(response.data.recoveryCodes);
      setSetup(null);
      setCode('');
      await refreshStatus();
      toast.success('Authenticator app enabled');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const regenerateCodes = async () => {
    setLoading(true);
    try {
      const response = await regenerateMfaRecoveryCodes({
        currentPassword,
        code,
      });
      setRecoveryCodes(response.data.recoveryCodes);
      setCurrentPassword('');
      setCode('');
      await refreshStatus();
      toast.success('Recovery codes regenerated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const turnOffMfa = async () => {
    setLoading(true);
    try {
      await disableMfa({ currentPassword, code });
      removeCookie('token', { path: '/' });
      window.location.assign('/auth/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  if (!statusResponse) {
    return <Card className="p-6">Loading MFA settings...</Card>;
  }

  return (
    <Card className="p-0 gap-0">
      <CardHeader className="p-4 text-xl font-bold">
        Two-factor authentication
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0">
        {recoveryCodes.length > 0 && (
          <section
            className="grid gap-3 rounded-md border p-4"
            aria-live="polite"
          >
            <h2 className="font-semibold">Save your recovery codes</h2>
            <p className="text-sm text-muted-foreground">
              Each code can be used once. These codes will not be shown again.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-3">
              {recoveryCodes.map((recoveryCode) => (
                <code key={recoveryCode}>{recoveryCode}</code>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(recoveryCodes.join('\n'));
                toast.success('Recovery codes copied');
              }}
            >
              Copy recovery codes
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRecoveryCodes([])}
            >
              I saved these codes
            </Button>
          </section>
        )}

        {setup ? (
          <div className="grid gap-4">
            <p className="text-sm">
              Scan this QR code with your authenticator app, then enter its
              current 6-digit code to confirm setup.
            </p>
            <div className="flex justify-center items-center">
              <Image
                src={setup.qrCode}
                alt="Authenticator setup QR code"
                width={220}
                height={220}
                unoptimized
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="mfa-manual-key" className="text-sm font-medium">
                Manual setup key
              </label>
              <Input
                id="mfa-manual-key"
                readOnly
                value={setup.manualEntryKey}
              />
            </div>
            <Input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ''))
              }
              placeholder="6-digit code"
              aria-label="Authenticator code"
            />
            <Button onClick={enableMfa} disabled={loading || code.length !== 6}>
              Confirm and enable
            </Button>
          </div>
        ) : status.enabled ? (
          <div className="grid gap-4">
            <p className="text-sm">
              Authenticator app is enabled. {status.recoveryCodesRemaining}{' '}
              recovery codes remain.
            </p>
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
              aria-label="Current password"
            />
            <Input
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Authenticator code"
              aria-label="Authenticator code"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={regenerateCodes}
                disabled={loading || !currentPassword || !/^\d{6}$/.test(code)}
              >
                Regenerate recovery codes
              </Button>
              <Button
                variant="destructive"
                onClick={turnOffMfa}
                disabled={loading || !currentPassword || !code}
              >
                Turn off MFA
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Add an authenticator app to protect your account. You will need
              your password to begin setup.
            </p>
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
              aria-label="Current password"
            />
            <Button onClick={startSetup} disabled={loading || !currentPassword}>
              Set up authenticator
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MfaSettings;
