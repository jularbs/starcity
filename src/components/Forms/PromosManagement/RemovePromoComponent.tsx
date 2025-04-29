"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { removePromo } from "@/actions/promo";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { mutate } from "swr";
import { toast } from "sonner";

const RemovePromoComponent = ({ id = "", open, onOpenChange }:
    { id: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const [loading, setLoading] = useState(false)

    const handleDelete = () => {
        setLoading(true);
        removePromo({ id }).then((response) => {
            setLoading(false);
            onOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: response.success,
                duration: 5000
            });
            mutate({ url: "v1/promo" });
        }).catch(() => {
            setLoading(false);
            toast.success("Invalid Request!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                //@ts-expect-error error var unknown
                description: err.error,
                duration: 5000
            });
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>Do you really want to delete this promo? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                        }}
                    >Cancel</Button>
                    <Button variant="destructive" onClick={() => {
                        handleDelete()
                    }}>
                        {loading && <LoaderCircle className="animate-spin" />}
                        Delete Promo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RemovePromoComponent;
