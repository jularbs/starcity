"use client";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";

const RideImageComponent = ({ image = "", open, onOpenChange }:
    { image: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[100vh] overflow-y-auto p-0 border-0 gap-0">
            <DialogHeader className="gap-0">
                <DialogTitle className="flex justify-between p-4">
                    <div>Ride image</div>
                </DialogTitle>
            </DialogHeader>
            <div className="aspect-[3/2]">
                {image && <Image
                    alt="Ride Image"
                    width={600}
                    height={300}
                    className="w-auto"
                    src={image}
                />}
            </div>

        </DialogContent>
    </Dialog>
};

export default RideImageComponent;
