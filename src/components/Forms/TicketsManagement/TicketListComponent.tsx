"use client"
import { fetcher } from "@/actions/swr";
import { toggleTicket } from "@/actions/ticket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LoaderCircle } from "lucide-react";
import { Key, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { getCookie } from 'typescript-cookie'
import UpdateTicketComponent from "./UpdateTicketComponent";
import Link from "next/link";

const TicketListComponent = () => {
    const token = getCookie("token");
    const [statusLoading, setStatusLoading] = useState("");

    const [currentSlug, setCurrentSlug] = useState("");
    const [updateOpen, setUpdateOpen] = useState(false);

    const { data, isLoading } = useSWR(
        { url: "v1/ticket" },
        fetcher
    );

    const showLoading = () => {
        return <>
            <div className="w-full rounded-lg aspect-video bg-muted animate-pulse"></div>
            <div className="w-full rounded-lg aspect-video bg-muted animate-pulse"></div>
        </>
    }

    const toggleStatus = (id: string) => {
        setStatusLoading(id)
        toggleTicket({ token, id }).then(data => {
            setStatusLoading("")
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
            mutate({ url: "v1/ticket" })
        }).catch(e => {
            setStatusLoading("")
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

    const showTickets = () => {
        if (data) {
            //TODOS: Declare Types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((item: any, key: Key) => {
                return <div key={key}>
                    <Card key={key}>
                        <CardHeader className="flex items-center justify-between">
                            <div className="text-lg font-bold">{item.name}</div>
                            <div className="flex items-center gap-1">
                                {statusLoading == item._id && <LoaderCircle className="size-4 animate-spin" />}
                                <Switch
                                    checked={item.status}
                                    onCheckedChange={() => { toggleStatus(item._id) }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{item.shortDescription}</p>
                            <div className="flex justify-between py-3 text-sm font-bold">
                                <div>Item Code: {item.itemCode}</div>
                                <div>Price: Php {item.price}</div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Link href={`/dashboard/page-management/tnc_${item.slug}`}>
                                <Button variant="outline">Edit T&C</Button>
                            </Link>
                            <Button onClick={() => {
                                setCurrentSlug(item.slug)
                                setUpdateOpen(true);
                            }}>Edit Ticket</Button>
                        </CardFooter>
                    </Card>
                </div>
            })
        }
    }

    return <>
        <UpdateTicketComponent slug={currentSlug} open={updateOpen} onOpenChange={setUpdateOpen} />
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            {isLoading ? showLoading() : showTickets()}
        </div>
    </>
}

export default TicketListComponent;