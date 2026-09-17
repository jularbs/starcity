"use client"
import { toast } from "sonner"
import { fetcher } from "@/actions/swr"
import { updatePromo } from "@/actions/promo";
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Edit, Info, LoaderCircle, Trash } from "lucide-react";
import { useState } from "react";
import UpdatePromoComponent from "./UpdatePromoComponent";
import ReadPromoComponent from "./ReadPromoComponent";
import RemovePromoComponent from "./RemovePromoComponent";
import { getErrorMessage } from "@/lib/errors";

export function PromoListComponent() {
    const [statusLoading, setStatusLoading] = useState("");

    const [updateOpen, setUpdateOpen] = useState(false)
    const [readOpen, setReadOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    const [currentId, setCurrentId] = useState("");

    const { data, isLoading } = useSWR(
        { url: "v1/promo" },
        fetcher
    );

    const promoList = data?.data || []

    const showLoading = () => {
        return new Array(10).fill(0).map((item, key) => {
            return <TableRow key={key}>
                <TableCell>
                    <div className="w-40 h-6 rounded-lg bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                    <div className="w-40 h-6 rounded-lg bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                    <div className="h-6 rounded-lg w-60 bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                    <div className="w-20 h-6 rounded-lg bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="flex gap-2">
                    <div className="rounded-sm size-6 bg-muted animate-pulse" />
                    <div className="rounded-sm size-6 bg-muted animate-pulse" />
                    <div className="rounded-sm size-6 bg-muted animate-pulse" />
                </TableCell>
            </TableRow>
        })
    }

    const toggleStatus = async (id: string, status: boolean) => {
        try {
            setStatusLoading(id)
            const { data } = await updatePromo(id, { status });
            setStatusLoading("")
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.campaignName + " toggled successfully",
                duration: 5000
            });
            //update list
            mutate({ url: "v1/promo" })
        } catch (err) {
            setStatusLoading("")
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: getErrorMessage(err),
                duration: 5000
            });
            console.log(err)
        }

    }

    const showData = () => {
        if (promoList) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return promoList.map((item: any, key: number) => {
                return <TableRow key={key} className="first">
                    <TableCell className="pl-4">
                        {item.campaignName}
                    </TableCell>
                    <TableCell>
                        {item.code}
                    </TableCell>
                    <TableCell>
                        {format(item.startDate, "LLL dd, y")} -{" "}
                        {format(item.endDate, "LLL dd, y")}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                            <Switch
                                checked={item.status}
                                onCheckedChange={() => { toggleStatus(item._id, !item.status) }}
                            />
                            {statusLoading == item._id && <LoaderCircle className="size-4 animate-spin" />}
                        </div>
                    </TableCell>
                    <TableCell className="flex gap-2">
                        <Button className="size-6" variant="outline"
                            onClick={() => {
                                setCurrentId(item._id)
                                setReadOpen(true)
                            }}>
                            <Info />
                        </Button>
                        <Button className="size-6" variant="outline"
                            onClick={() => {
                                setCurrentId(item._id)
                                setUpdateOpen(true)
                            }}>
                            <Edit />
                        </Button>
                        <Button className="size-6" variant="outline" onClick={() => {
                            setCurrentId(item._id)
                            setRemoveOpen(true);
                        }}>
                            <Trash />
                        </Button>
                    </TableCell>
                </TableRow>
            })
        }
    }

    return <>
        <RemovePromoComponent id={currentId} open={removeOpen} onOpenChange={setRemoveOpen} />
        <ReadPromoComponent id={currentId} open={readOpen} onOpenChange={setReadOpen} />
        <UpdatePromoComponent id={currentId} open={updateOpen} onOpenChange={setUpdateOpen} />
        <Card className="p-0 gap-0!">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Promos</div>
                <div className="flex justify-end gap-2">
                    <Button>Download CSV</Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Campaign Name</TableHead>
                            <TableHead>Promo Code</TableHead>
                            <TableHead>Promo Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? showLoading() : showData()}
                    </TableBody>
                </Table>
                {data && data.length < 1 && <div className="w-full p-5 text-center">No available promos</div>}
            </CardContent>
        </Card>
    </>


}