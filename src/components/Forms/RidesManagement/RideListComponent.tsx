"use client";
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, ImageIcon, Trash } from "lucide-react";
import RideImageComponent from "./RideImageComponent";
import RemoveRideComponent from "./RemoveRideComponent";
import UpdateRideComponent from "./UpdateRideComponent";

const RideListComponent = () => {
    const { data, isLoading } = useSWR({ url: "v1/ride" }, fetcher)
    const rideList = data?.data;

    const { data: categoriesData, isLoading: isCategoriesLoading } = useSWR({ url: "v1/ride-categories" }, fetcher)
    const categoriesList = categoriesData?.data;

    const [currentSlug, setCurrentSlug] = useState("");
    const [imageOpen, setImageOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState({ name: "All Attractions", id: "" })
    const [selectedImage, setSelectedImage] = useState({})
    const [selectedId, setSelectedId] = useState<string>("")

    const showData = () => {
        if (rideList && !isLoading) {
            return rideList.filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ride: any) => {
                    if (selectedCategory.id == "" || ride.rideCategoryId._id == selectedCategory.id) return ride
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ).map((item: any, key: number) => {
                return <TableRow key={key}>
                    <TableCell className="pl-4">{item.name}</TableCell>
                    <TableCell>{item.rideCategoryId?.name}</TableCell>
                    <TableCell className="max-w-70">
                        <div className=" whitespace-pre-line line-clamp-1">
                            {item.heightRequirements}
                        </div>
                    </TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell className="justify-end flex gap-2 pr-4">
                        <Button className="size-6" variant="outline"
                            onClick={() => {
                                setSelectedImage(item.media)
                                setImageOpen(true)
                            }}>
                            <ImageIcon />
                        </Button>
                        <Button className="size-6" variant="outline"
                            onClick={() => {
                                setCurrentSlug(item.slug)
                                setUpdateOpen(true)
                            }}>
                            <Edit />
                        </Button>
                        <Button className="size-6" variant="outline" onClick={() => {
                            setSelectedId(item._id)
                            setRemoveOpen(true);
                        }}>
                            <Trash />
                        </Button>
                    </TableCell>
                </TableRow>
            })
        }

        return new Array(20).fill(0).map((_item: unknown, key: number) => {
            return <TableRow key={key}>
                <TableCell><Skeleton className="h-6 w-55" /></TableCell>
                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-80" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Skeleton className="size-6" />
                        <Skeleton className="size-6" />
                        <Skeleton className="size-6" />
                    </div>
                </TableCell>
            </TableRow>
        })
    }

    const showCategoryFilter = () => {
        if (!isCategoriesLoading) {
            return categoriesList.map((item: { name: string, _id: string }, key: number) => {
                return <DropdownMenuItem key={key}
                    onClick={() => {
                        setSelectedCategory({ name: item.name, id: item._id })
                    }}
                >{item.name}</DropdownMenuItem>

            })
        }

    }

    return <>
        <RideImageComponent media={selectedImage} open={imageOpen} onOpenChange={setImageOpen} />
        <RemoveRideComponent id={selectedId} open={removeOpen} onOpenChange={setRemoveOpen} />
        <UpdateRideComponent slug={currentSlug} open={updateOpen} onOpenChange={setUpdateOpen} />
        <Card className="p-0 gap-0!">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Rides and Attractions</div>
                <div className="flex justify-end gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline">{selectedCategory.name}</Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                setSelectedCategory({ name: "All Attractions", id: "" })
                            }}>All Attractions</DropdownMenuItem>
                            {showCategoryFilter()}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-0 grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Height Requirement</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showData()}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
}

export default RideListComponent;