//TODOS: Handle error success messages
"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Key, useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { fetcher } from "@/actions/swr"
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { cn, getImageSource } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
// import Image from "next/image";
import { updateRide } from "@/actions/ride";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants"
import Image from "next/image";

const UpdateRideComponent = ({ slug, open, onOpenChange }:
    { slug: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const { data, isLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        slug && open ? { url: "v1/ride/" + slug } : null,
        fetcher
    );

    const { data: categoriesData, isLoading: isCategoriesLoading } = useSWR({ url: "v1/ride-categories" }, fetcher)

    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState({});

    const formSchema = z.object({
        name: z.string().min(1, { message: "Ride/Attraction name required" }),
        slug: z.string().min(1, { message: "Slug required" }),
        description: z.string().min(1, { message: "Description required" }),
        status: z.string().min(1, { message: "Status required" }),
        heightRequirements: z.string().min(1, { message: "Height Requirements required" }),
        categoryId: z.string().min(1, { message: "Category required" }),
        image: z.instanceof(File, { message: "File is not an image" })
            .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
                message: '.jpg, .jpeg, .png and .webp files are accepted.',
            })
            .refine(file => !file || file.size !== 0 || file.size <= 5000000, { message: "Max image size exceeded (5MB)" })
            .optional()
        ,
    })


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryId: "",
            slug: "",
            name: "",
            description: "",
            status: "",
            heightRequirements: "",
            image: undefined
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)

        const formData = new FormData();
        formData.set("name", values.name);
        formData.set("slug", values.slug);
        formData.set("categoryId", values.categoryId);
        formData.set("heightRequirements", values.heightRequirements);
        formData.set("status", values.status);
        formData.set("description", values.description);
        if (values.image) {
            formData.set('image', values.image);
        }

        updateRide({ data: formData }).then(data => {
            setLoading(false);
            onOpenChange(false);
            mutate({ url: "v1/ride" });
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.success,
                duration: 5000
            });

        }).catch(err => {
            console.log("Error: ", err)
            setLoading(false);
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: err.error,
                duration: 5000
            });
        })
    }

    const showCategories = () => {
        if (!isCategoriesLoading) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return categoriesData.map((item: any, key: Key) => {
                return <SelectItem value={item._id} key={key}>{item.name}</SelectItem>
            })
        }
    }

    useEffect(() => {
        if (!isLoading)
            if (data) {
                form.setValue("slug", data.slug);
                form.setValue("name", data.name);
                form.setValue("categoryId", data.rideCategoryId?._id);
                form.setValue("status", data.status);
                form.setValue("heightRequirements", data.heightRequirements);
                form.setValue("description", data.description);
                setPreviewImage(data.media);
            }
    }, [data, isLoading, form])


    useEffect(() => {
        if (!open) {
            setPreviewImage("");
            form.reset({
                slug: "",
                categoryId: "",
                name: "",
                description: "",
                status: "",
                heightRequirements: "",
                image: undefined
            },);
        }
    }, [open, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1">
                        <span>Update Ride/Attraction</span>
                        {isLoading && <LoaderCircle size={18} className="animate-spin" />}
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="image">
                                            <span className="text-primary">Ride Image</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPreviewImage({ location: reader.result as string })
                                                        field.onChange(e.target.files?.[0]);
                                                    };
                                                    reader.readAsDataURL(e.target.files![0]);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                        {previewImage && <div className="flex justify-center"><Image src={getImageSource(previewImage)} width={300} height={200} alt="Ride Image" /></div>}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Attraction Name</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. Gabi ng Lagim"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel htmlFor="image"><span className="text-primary">Category</span></FormLabel>
                                        </div>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={cn(
                                                `w-full`,
                                                form.formState?.errors?.categoryId?.message && "border-destructive"
                                            )}>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {showCategories()}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs font-light text-destructive">{form.formState?.errors?.categoryId?.message}</p>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="status">
                                            <span className="text-primary">Status</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="status"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. Open"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="heightRequirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="heightRequirements">
                                            <span className="text-primary">Height Requirements</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="heightRequirements"
                                                {...field}
                                                placeholder="e.g. Open to all ages"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="description">
                                            <span className="text-primary">Description</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="description"
                                                {...field}
                                                placeholder="Type description here..."
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => { onOpenChange(false) }}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    );
};

export default UpdateRideComponent;
