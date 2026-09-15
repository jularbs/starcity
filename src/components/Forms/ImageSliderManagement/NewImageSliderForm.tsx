"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import Image from "next/image"
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants"
import { AlertError } from "@/components/AlertError"
import { AlertSuccess } from "@/components/AlertSuccess"
import { format } from "date-fns"
import { useState } from "react"
import { CalendarIcon, LoaderCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { addImageSlider } from "@/actions/image-slider"
import { mutate } from "swr"

export function NewImageSliderForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({
        error: "",
        success: ""
    })

    const [previewImage, setPreviewImage] = useState("");

    const formSchema = z.object({
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
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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
        setLoading(true);

        const formData = new FormData();
        formData.set("name", values.name);
        formData.set("order", values.order.toString());
        formData.set("startDate", values.dateRange.from.toUTCString());
        formData.set("endDate", values.dateRange.to.toUTCString());
        if (values.image) {
            formData.set('image', values.image);
        }

        addImageSlider({ data: formData }).then(data => {
            setLoading(false);
            setMessage({ error: "", success: data.success });
            mutate({ url: "v1/image-slider" });
            setPreviewImage("");
            form.reset({
                name: "",
                order: 0,
                dateRange: {
                    from: undefined,
                    to: undefined,
                },
                image: undefined
            })
            setPreviewImage("");
        }).catch(err => {
            console.log("Error: ", err)
            setLoading(false);
            setMessage({ success: "", error: err.error })
        })
    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Image Slider</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {message.error && <AlertError title="Invalid Request" message={message.error} />}
                                {message.success && <AlertSuccess title="Success!" message={message.success} />}
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
                                                            setPreviewImage(reader.result as string)
                                                            field.onChange(e.target.files?.[0]);
                                                        };
                                                        reader.readAsDataURL(e.target.files![0]);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                            {previewImage && <div className="flex justify-center"><Image src={previewImage} width={300} height={200} alt="Ride Image" /></div>}
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
                                            <FormLabel><span className="text-primary">Display Duration</span></FormLabel>
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
                                <Button type="submit" className="w-full">
                                    Add New Slider Image
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
