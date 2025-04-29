"use client"
import { togglePaymentOption } from "@/actions/payment-options";
import { fetcher } from "@/actions/swr";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"
import { LoaderCircle } from "lucide-react";
import { Key, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { getCookie } from "typescript-cookie";

const PaymentOptionListComponent = () => {
    const token = getCookie("token");

    const { data, isLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        { url: "v1/payment-option" },
        fetcher
    );
    const [loading, setLoading] = useState("")

    const toggleStatus = (id: string) => {
        setLoading(id);

        togglePaymentOption({ token, id }).then(data => {
            setLoading("")
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.success,
                duration: 5000
            });
            //update list
            mutate({ url: "v1/payment-option" })
        }).catch(e => {
            setLoading("")
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: e.error,
                duration: 5000
            });
            console.log(e.error)
        })

    }

    const showPaymentMethods = () => {
        if (isLoading)
            return new Array(8).fill(0).map((item, key) => {
                return <div className="w-full h-20 rounded-lg bg-muted animate-pulse" key={key} />
            });

        if (data)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((item: any, key: Key) => {
                return <Card className="flex" key={key}>
                    <CardContent className="flex items-center justify-between">
                        <div className="text-xl font-bold">{item.name}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs">{item.status ? "Enabled" : "Disabled"}</span>
                            {loading == item._id && <LoaderCircle className="size-4 animate-spin" />}
                            <Switch
                                checked={item.status}
                                onCheckedChange={() => { toggleStatus(item._id) }}
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