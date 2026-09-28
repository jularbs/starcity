'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { unblockUser } from '@/actions/auth';
import { getErrorMessage } from '@/lib/errors';

const UnblockUserComponent = ({
  id = '',
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  type?: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleUnblock = async () => {
    try {
      setLoading(true);
      await unblockUser(id);
      setLoading(false);
      onOpenChange(false);
      toast.success('Success!', {
        style: {
          background: 'rgb(56, 142, 60)',
          color: 'white',
          border: 'none',
        },
        description: 'User unblocked successfully',
        duration: 5000,
      });
      mutate({ url: 'v1/user', params: { status: true } });
      mutate({ url: 'v1/user', params: { status: false } });
    } catch (err) {
      setLoading(false);
      toast.error('Invalid Request', {
        style: {
          background: 'rgba(220, 46, 46, 1)',
          color: 'white',
          border: 'none',
        },
        description: getErrorMessage(err),
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Do you really want to unblock this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleUnblock();
            }}
          >
            {loading && <LoaderCircle className="animate-spin" />}
            <span className="capitalize">Unblock user</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnblockUserComponent;
