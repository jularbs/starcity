"use client"
import { updatePaymentOption } from "@/actions/payment-options";
import { fetcherWithToken } from "@/actions/swr";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"
import { getErrorMessage } from "@/lib/errors";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const PaymentOptionListComponent = () => {
    const { data, isLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        { url: "v1/payment-option/manage" },
        fetcherWithToken
    );

    const paymentOptionData = data?.data;

    const [loading, setLoading] = useState("")

    const toggleStatus = async (id: string, status: boolean) => {
        try {
            setLoading(id);
            const { data } = await updatePaymentOption(id, { status });
            setLoading("")
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.name + " toggled successfully",
                duration: 5000
            });
            //update list
            mutate({ url: "v1/payment-option/manage" })
        } catch (e) {
            setLoading("")
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: getErrorMessage(e),
                duration: 5000
            });
        }



    }

    const showPaymentMethods = () => {
        if (isLoading)
            return new Array(8).fill(0).map((item, key) => {
                return <div className="w-full h-20 rounded-lg bg-muted animate-pulse" key={key} />
            });

        if (paymentOptionData)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return paymentOptionData.map((item: any, key: number) => {
                return <Card className="flex" key={key}>
                    <CardContent className="flex items-center justify-between">
                        <div className="text-xl font-bold">{item.name}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs">{item.status ? "Enabled" : "Disabled"}</span>
                            {loading == item._id && <LoaderCircle className="size-4 animate-spin" />}
                            <Switch
                                checked={item.status}
                                onCheckedChange={() => { toggleStatus(item._id, !item.status) }}
                            />
                        </div>
                    </CardContent>
                </Card>
            })
    }

    return <>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {showPaymentMethods()}
        </div>
    </>
}

export default PaymentOptionListComponent