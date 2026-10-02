'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { resetUserMfa } from '@/actions/auth';
import { getErrorMessage } from '@/lib/errors';

const ResetMfaComponent = ({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMfa = async () => {
    setLoading(true);
    try {
      await resetUserMfa(id, reason.trim());
      onOpenChange(false);
      setReason('');
      toast.success('MFA reset', {
        description: 'The user will need to enroll an authenticator again.',
      });
      mutate({ url: 'v1/user', params: { status: true } });
    } catch (error) {
      toast.error('Unable to reset MFA', {
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setReason('');
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset user MFA?</DialogTitle>
          <DialogDescription>
            This removes the authenticator and recovery codes and signs the user
            out of all devices. They must set up MFA again.
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="mfa-reset-reason" className="grid gap-2 text-sm">
          Audit reason
          <Input
            id="mfa-reset-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="For example, user lost their device"
            maxLength={300}
          />
          <span className="text-muted-foreground">
            Enter at least 8 characters.
          </span>
        </label>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={resetMfa}
            disabled={loading || reason.trim().length < 8}
          >
            {loading ? 'Resetting...' : 'Reset MFA'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetMfaComponent;
