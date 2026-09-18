//TODOS: Reset form values when success
//TODOS: Duplicate Values error message
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
import { Checkbox } from "@/components/ui/checkbox"

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
    FormDescription
} from "@/components/ui/form"

import { Key, useState } from "react";
import { CalendarIcon, LoaderCircle } from "lucide-react"
import { AlertError } from "@/components/AlertError"
import { AlertSuccess } from "@/components/AlertSuccess"

import { fetcher } from "@/actions/swr"
import useSWR, { mutate } from "swr";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"
import { createPromo } from "@/actions/promo"
import { } from "typescript-cookie"
import { getErrorMessage } from "@/lib/errors"

export function NewPromoForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    //Fetch all payment options
    const { data, isLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        { url: "v1/payment-option/manage" },
        fetcher
    );

    const paymentOptions = data?.data || []

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({
        error: "",
        success: ""
    })

    const formSchema = z.object({
        campaignName: z.string().min(1, { message: "Campaign name required" }),
        code: z.string().min(1, { message: "Code required" }),
        minimumRequired: z.coerce.number({ message: "Please input a valid number" }).gte(0, { message: "Price should be greater than 0" }),
        percentageDiscount: z.coerce.number({ message: "Please input a valid number" }).gte(0, { message: "Price should be greater than 0" }),
        fixedDiscount: z.coerce.number({ message: "Please input a valid number" }).gte(0, { message: "Price should be greater than 0" }),
        maxDiscount: z.coerce.number({ message: "Please input a valid number" }).gte(0, { message: "Price should be greater than 0" }),
        paymentOptions: z.string().array().min(1, { message: "Select at least 1 payment method" }),
        dateRange: z.object(
            {
                from: z.date(),
                to: z.date(),
            },
            {
                message: "Please select a date range",
            }
        ),
    }).refine((data) => data.dateRange.from < data.dateRange.to, {
        path: ["dateRange"],
        message: "From date must be before to date",
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            campaignName: "",
            code: "",
            minimumRequired: 0,
            percentageDiscount: 0,
            fixedDiscount: 0,
            maxDiscount: 0,
            dateRange: {
                from: new Date(),
                to: addDays(new Date(), 30),
            },
            paymentOptions: []
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const newPromo = {
                campaignName: values.campaignName,
                code: values.code,
                minimumRequired: values.minimumRequired,
                percentageDiscount: values.percentageDiscount,
                fixedDiscount: values.fixedDiscount,
                maxDiscount: values.maxDiscount,
                startDate: values.dateRange.from,
                endDate: values.dateRange.to,
                dateRange: values.dateRange,
                acceptedPaymentMethods: values.paymentOptions,
                maxUsage: 100, //TODOS: Add to form to handle max usage
            }
            setLoading(true)
            const { data } = await createPromo(newPromo);
            setLoading(false);
            setMessage({ error: "", success: data.campaignName + " created successfully" });
            form.reset({
                campaignName: "",
                code: "",
                minimumRequired: undefined,
                percentageDiscount: undefined,
                fixedDiscount: undefined,
                maxDiscount: undefined,
                dateRange: {
                    from: new Date(),
                    to: addDays(new Date(), 30),
                },
                paymentOptions: []
            },);
            mutate({ url: "v1/promo" });
        } catch (err) {
            console.error("Error creating promo: ", err);
            setLoading(false);
            setMessage({ success: "", error: getErrorMessage(err) })
        };

    }

    const showPaymentMethods = () => {
        if (isLoading) {
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
                return <FormField
                    key={index}
                    control={form.control}
                    name="paymentOptions"
                    render={({ field }) => (
                        <div className={`flex items-center p-3 space-x-2 rounded-sm border ${field.value?.includes(item._id) ? "border-black bg-neutral-500/10" : ""}`} key={index}>
                            <Checkbox id="terms1"
                                value={item._id}
                                checked={field.value?.includes(item._id)}
                                onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...field.value, item._id])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== item._id
                                            )
                                        );
                                }}
                            />
                            <label
                                htmlFor="terms1"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {item.name}
                            </label>
                        </div>
                    )}
                />


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

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Promo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {message.error && <AlertError title="Invalid Request" message={message.error} />}
                                {message.success && <AlertSuccess title="Success!" message={message.success} />}
                                <FormField
                                    control={form.control}
                                    name="campaignName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="campaignName">
                                                <span className="text-primary">Campaign Name</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="campaignName"
                                                    type="text"
                                                    {...field}
                                                    placeholder="e.g. Summer Deals 2025"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="code">
                                                <span className="text-primary">Promo Code</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="code"
                                                    type="text"
                                                    {...field}
                                                    placeholder="e.g. SUMMERDEAL2025"
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
                                                <PopoverContent className="w-auto p-0 mt-2 border-2 rounded-lg bg-background border-muted" align="start">
                                                    <Calendar
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

                                <FormField
                                    control={form.control}
                                    name="minimumRequired"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="minimumRequired">
                                                <span className="text-primary">Minimum Transaction Requirement</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="minimumRequired"
                                                    type="number"
                                                    {...field}
                                                    placeholder="e.g. 2000 (0 for no minimum requirement)"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[12px] text-black italic">0 for no minimum transaction required</FormDescription>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="percentageDiscount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="percentageDiscount">
                                                    <span className="text-primary">Percentage Discount</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="percentageDiscount"
                                                        type="number"
                                                        {...field}
                                                        placeholder="e.g. 10"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-light" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fixedDiscount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="fixedDiscount">
                                                    <span className="text-primary">Fixed Discount</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="fixedDiscount"
                                                        type="number"
                                                        {...field}
                                                        placeholder="e.g. 300"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-light" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="maxDiscount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="maxDiscount">
                                                <span className="text-primary">Max Discount</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="maxDiscount"
                                                    type="number"
                                                    {...field}
                                                    placeholder="e.g. 1000 (0 for no maximum discount)"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[12px] text-black italic">0 for no maximum discount</FormDescription>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="paymentOptions"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel className="text-primary!">Accepted Payment Methods</FormLabel>
                                            <FormMessage className="text-xs font-light" />
                                            {showPaymentMethods()}
                                        </FormItem>

                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    Add New Promo
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
