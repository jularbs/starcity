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

const ImageSliderImageComponent = ({
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
            <div>Image Slider Item</div>
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-50">
          {media && (
            <Image
              alt="Image Slider Item"
              width={600}
              height={200}
              className="w-auto"
              src={getImageSource(media)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageSliderImageComponent;
