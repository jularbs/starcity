"use client"
import { updateImageSlider } from "@/actions/image-slider";
import { fetcher } from "@/actions/swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns";
import { Edit, ImageIcon, LoaderCircle, Trash } from "lucide-react";
import { Key, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import ImageSliderImageComponent from "./ImageSliderImageComponent";
import RemoveImageSliderComponent from "./RemoveImageSliderComponent";
import UpdateImageSliderComponent from "./UpdateImageSliderComponent";
import { getErrorMessage } from "@/lib/errors";

const ImageSliderListComponent = () => {

    const { data, isLoading } = useSWR({ url: "v1/image-slider" }, fetcher)
    const imageSliders = data?.data || [];

    const [statusLoading, setStatusLoading] = useState("");
    const [imageOpen, setImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState({})

    const [updateOpen, setUpdateOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [selectedId, setSelectedId] = useState("")

    const toggleStatus = async (id: string, status: boolean) => {
        try {
            setStatusLoading(id);
            const formData = new FormData();
            formData.append("status", status ? "true" : "false");
            const { data } = await updateImageSlider(id, formData);
            setStatusLoading("")
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.name + " toggled successfully",
                duration: 5000
            });
            mutate({ url: "v1/image-slider" })
        } catch (error) {
            setStatusLoading("")
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: getErrorMessage(error),
                duration: 5000
            });
        }
    }

    const showData = () => {
        if (isLoading) {
            return new Array(10).fill(0).map((item, key) => {
                return <TableRow key={key}>
                    <TableCell>
                        <Skeleton className="h-5 w-5" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-30" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-60" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2 justify-end">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </TableCell>
                </TableRow>
            });
        }

        if (!isLoading && imageSliders.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return imageSliders.map((item: any, key: Key) => {
                return <TableRow key={key}>
                    <TableCell className="text-center">
                        {item.order}
                    </TableCell>
                    <TableCell>
                        {item.name}
                    </TableCell>
                    <TableCell>
                        {format(item.startDate, "PP p")} - {format(item.endDate, "PP p")}
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-1 items-center">
                            <Switch
                                checked={item.status}
                                onCheckedChange={() => {
                                    toggleStatus(item._id, !item.status)
                                }}
                            />
                            {statusLoading == item._id && <LoaderCircle className="size-4 animate-spin" />}

                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="outline"
                                onClick={() => {
                                    setSelectedImage(item.image)
                                    setImageOpen(true)
                                }}
                            ><ImageIcon /></Button>
                            <Button size="icon" variant="outline"
                                onClick={() => {
                                    setSelectedId(item._id);
                                    setUpdateOpen(true);
                                }}
                            ><Edit /></Button>
                            <Button size="icon" variant="outline"
                                onClick={() => {
                                    setRemoveOpen(true)
                                    setSelectedId(item._id)
                                }}
                            ><Trash /></Button>
                        </div>
                    </TableCell>
                </TableRow>
            })
        }
    }

    return <>
        <UpdateImageSliderComponent id={selectedId} open={updateOpen} onOpenChange={setUpdateOpen} />
        <RemoveImageSliderComponent id={selectedId} open={removeOpen} onOpenChange={setRemoveOpen} />
        <ImageSliderImageComponent media={selectedImage} open={imageOpen} onOpenChange={setImageOpen} />
        <Card className="p-0 gap-0!">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Image Sliders</div>
            </CardHeader>
            <CardContent className="p-0 grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Order</TableHead>
                            <TableHead>Name Identifier</TableHead>
                            <TableHead>Display Duration</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showData()}
                    </TableBody>
                </Table>
                {/* {data && data.length < 1 && <div className="w-full p-5 text-center">No available promos</div>} */}
            </CardContent>
        </Card>
    </>
}

export default ImageSliderListComponent;