"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resendAcknowledmentReceipt } from '@/actions/sale';
import { getErrorMessage } from "@/lib/errors";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { mutate } from "swr";
import { toast } from "sonner";

const ResendARComponent = ({ id = "", open, onOpenChange }:
    { id: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const [loading, setLoading] = useState(false)

    const handleResend = async () => {
        try {
            setLoading(true);
            await resendAcknowledmentReceipt(id);
            setLoading(false);
            onOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: "Acknowledgement Receipt set to customer successfully",
                duration: 5000
            });
            mutate({ url: "v1/promo" });
        } catch (err) {
            setLoading(false);
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: getErrorMessage(err),
                duration: 5000
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        Do you really want to resend Acknowledgement Receipt for this transaction to customer?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                        }}
                    >Cancel</Button>
                    <Button onClick={() => {
                        handleResend()
                    }}>
                        {loading && <LoaderCircle className="animate-spin" />}
                        Resend Acknowledgement Receipt
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ResendARComponent;
