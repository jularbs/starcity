"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { fetcher } from "@/actions/swr"
import useSWR from "swr";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { format } from "date-fns";
import { Key, useState } from "react";
import UpdatePromoComponent from "./UpdatePromoComponent";

const ReadPromoComponent = ({ id = "", open, onOpenChange }:
    { id: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    //Fetch all payment options
    const { data: paymentOptionsData, isLoading: isPaymentOptionsLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        { url: "v1/payment-option/manage" },
        fetcher
    );

    const paymentOptions = paymentOptionsData?.data || []

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: promoData, isLoading: isPromoLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        id && open ? { url: "v1/promo/" + id } : null,
        fetcher
    );

    const promo = promoData?.data;
    const [updateOpen, setUpdateOpen] = useState(false);

    const showPaymentMethods = () => {
        if (isPaymentOptionsLoading) {
            return <>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
            </>
        }
        if (paymentOptions) {
            //TODOS: Declare Types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return paymentOptions.map((item: any, index: Key) => {
                if (promo.acceptedPaymentMethods?.includes(item._id))
                    return <div className={"flex items-center p-3 space-x-2 rounded-sm border border-black"} key={index}>
                        <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {item.name}
                        </label>
                    </div>
            })
        } else {
            return <>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
            </>
        }
    }

    if (promo)
        return (
            <>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-h-screen overflow-y-auto">
                        <DialogHeader className="gap-0">
                            <DialogTitle className="flex items-center justify-between">
                                <span>{promo.campaignName}</span>
                                <span className="pr-4 text-[10px] uppercase">{promo.status ? "Active" : "Disabled"}</span>
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-neutral-600">{promo.code}</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                            <div className="grid">
                                <Label className="text-sm font-semibold">Promo Duration</Label>
                                {promo.startDate && <div>{format(promo?.startDate, "LLL dd, y")} - {format(promo?.endDate, "LLL dd, y")}</div>}
                            </div>
                            <div className="grid">
                                <Label className="text-sm font-semibold">Minimum Transaction Requirement</Label>
                                <div>₱{promo.minimumRequired}</div>
                            </div>

                            <div className="grid grid-cols-2">
                                <div className="grid">
                                    <Label className="text-sm font-semibold">Percentage Discount</Label>
                                    <div>₱{promo.percentageDiscount}</div>
                                </div>

                                <div className="grid">
                                    <Label className="text-sm font-semibold">Fixed Discount</Label>
                                    <div>₱{promo.fixedDiscount}</div>
                                </div>
                            </div>

                            <div className="grid">
                                <Label className="text-sm font-semibold">Max Discount</Label>
                                <div>₱{promo.maxDiscount}</div>
                            </div>
                            <div className="grid">
                                <Label className="mb-1 text-sm font-semibold">Accepted Payment Method</Label>
                                <div className="grid gap-1">{showPaymentMethods()}</div>
                            </div>
                        </div>
                        <DialogFooter className="p-2">
                            <Button variant="outline" onClick={() => {
                                onOpenChange(false)
                            }}>Close</Button>
                            <Button onClick={() => {
                                setUpdateOpen(true);
                            }}>Edit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <UpdatePromoComponent id={promo._id} open={updateOpen} onOpenChange={setUpdateOpen} />
            </>

        );

    return; //TODOS: set to Loading skeleton
};

export default ReadPromoComponent;
