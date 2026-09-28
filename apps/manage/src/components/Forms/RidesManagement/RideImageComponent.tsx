'use client';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import { getImageSource } from '@/lib/utils';
import Image from 'next/image';
// import Image from "next/image";

const RideImageComponent = ({
  media,
  open,
  onOpenChange,
}: {
  media: Record<string, string>;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto p-0 border-0 gap-0">
        <DialogHeader className="gap-0">
          <DialogTitle className="flex justify-between p-4">
            <div>Ride image</div>
          </DialogTitle>
        </DialogHeader>
        {media && (
          <Image
            alt="Ride Image"
            width={600}
            height={300}
            className="w-full"
            src={getImageSource(media)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RideImageComponent;
