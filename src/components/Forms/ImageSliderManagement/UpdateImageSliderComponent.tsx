//TODOS: Handle error success messages
"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useEffect, useState } from "react";

import { fetcher } from "@/actions/swr"
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { LoaderCircle, CalendarIcon } from "lucide-react";
import { cn, getImageSource } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar"

import { toast } from "sonner";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants"
import { format } from "date-fns";
import { updateImageSlider } from "@/actions/image-slider";
import Image from "next/image";

const UpdateImageSliderComponent = ({ slug, open, onOpenChange }:
    { slug: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const { data, isLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        slug && open ? { url: "v1/image-slider/" + slug } : null,
        fetcher
    );

    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState({});

    const formSchema = z.object({
        slug: z.string().min(1, { message: "Slug required" }),
        name: z.string().min(1, { message: "Name Identifier name required" }),
        order: z.coerce.number({
            required_error: "Order is required",
            invalid_type_error: "Order must be a number"
        }),
        dateRange: z.object(
            {
                from: z.date({
                    required_error: "Start date is required",
                    invalid_type_error: "Start date must be a date",
                }),
                to: z.date({
                    required_error: "End date is required",
                    invalid_type_error: "End date must be a date",
                }),
            },
            {
                message: "Please select a date range",
            }
        ).refine((data) => data.from < data.to, {
            message: "From date must be before to date",
        }),
        image: z.instanceof(File, { message: "Image is required" })
            .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
                message: '.jpg, .jpeg, .png and .webp files are accepted.',
            })
            .refine(file => !file || file.size !== 0 || file.size <= 5000000, { message: "Max image size exceeded (5MB)" })
            .optional()
    })


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            slug: "",
            name: "",
            order: undefined,
            dateRange: {
                from: undefined,
                to: undefined,
            },
            image: undefined
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)

        const formData = new FormData();
        formData.set("name", values.name);
        formData.set("slug", values.slug);
        formData.set("order", values.order.toString());
        formData.set("startDate", values.dateRange.from.toUTCString());
        formData.set("endDate", values.dateRange.to.toUTCString());
        if (values.image) {
            formData.set('image', values.image);
        }

        updateImageSlider({ data: formData }).then(data => {
            setLoading(false);
            onOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.success,
                duration: 5000
            });

            //TODOS: Update List
            mutate({ url: "v1/image-slider" })
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

    useEffect(() => {
        if (!isLoading)
            if (data) {
                form.setValue("slug", data.slug);
                form.setValue("name", data.name);
                form.setValue("order", data.order);
                form.setValue("dateRange", { from: new Date(data.startDate), to: new Date(data.endDate) })
                setPreviewImage(data.image);
            }
    }, [data, isLoading, form])


    useEffect(() => {
        if (!open) {
            form.reset({
                slug: "",
                name: "",
                order: undefined,
                dateRange: {
                    from: undefined,
                    to: undefined,
                },
                image: undefined
            })
            setPreviewImage("");
        }
    }, [open, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1">
                        <span>Update Image Slider Item</span>
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
                                            <span className="text-primary">Ride/Attraction Image</span>
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
                                            <span className="text-primary">Name Identifier</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. Summer Promos Banner"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="order">
                                            <span className="text-primary">Order</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="order"
                                                type="number"
                                                {...field}
                                                placeholder="e.g. 0"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            {/* TODOS: Convert DateRange Picker to component form  */}
                            <FormField
                                control={form.control}
                                name="dateRange"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel><span className="text-primary">Promo Duration</span></FormLabel>
                                        <FormMessage className="text-xs font-light" />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        id="date"
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value.from && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon />
                                                        {field.value.from ? (
                                                            field.value.to ? (
                                                                <>
                                                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                                                    {format(field.value.to, "LLL dd, y")}
                                                                </>
                                                            ) : (
                                                                format(field.value.from, "LLL dd, y")
                                                            )
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <p className="text-xs font-light text-destructive">{form.formState?.errors?.dateRange?.from?.message} {form.formState?.errors?.dateRange?.to?.message}</p>

                                            <PopoverContent className="w-auto p-0 mt-2 border-2 rounded-lg bg-background border-muted" align="start">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={field.value.from}
                                                    selected={{
                                                        from: field.value.from!,
                                                        to: field.value.to,
                                                    }}
                                                    onSelect={field.onChange}
                                                    numberOfMonths={2}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => {
                                    onOpenChange(false)
                                }}>Cancel</Button>

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

export default UpdateImageSliderComponent;
