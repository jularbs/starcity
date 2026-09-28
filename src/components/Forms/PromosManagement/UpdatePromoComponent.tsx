//TODOS: Handle error success messages
"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
import { useEffect, useState, Key } from "react";

import { fetcher } from "@/actions/swr"
import useSWR, { mutate } from "swr";
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { updatePromo } from "@/actions/promo";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

const UpdatePromoComponent = ({ id = "", open, onOpenChange }:
    { id: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    //Fetch all payment options
    const { data: paymentOptionsData, isLoading: isPaymentOptionsLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        { url: "v1/payment-option/manage" },
        fetcher
    );

    const paymentOptions = paymentOptionsData?.data || [];

    const { data: promoData, isLoading: isPromoLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        id && open ? { url: "v1/promo/" + id } : null,
        fetcher
    );

    const promo = promoData?.data;

    const [loading, setLoading] = useState(false)

    const showPaymentMethods = () => {
        if (isPaymentOptionsLoading) {
            return <>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
                <div className="w-full h-10 rounded-lg bg-muted/50 animate-pulse"></div>
            </>
        }
        if (paymentOptions) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return paymentOptions.map((item: any, index: Key) => {
                return <FormField
                    key={index}
                    control={form.control}
                    name="paymentOptions"
                    render={({ field }) => (
                        <div className={`flex items-center p-3 space-x-2 rounded-sm border ${field.value?.includes(item._id) ? "border-black bg-neutral-500/10" : ""}`} key={index}>
                            <Checkbox
                                value={item._id}
                                checked={field.value?.includes(item._id)}
                                onCheckedChange={(checked: boolean) => {
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

    const formSchema = z.object({
        _id: z.string().min(1, { message: "Promo Code ID required" }),
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
            _id: "",
            campaignName: "",
            code: "",
            minimumRequired: 0,
            percentageDiscount: 0,
            fixedDiscount: 0,
            maxDiscount: 0,
            dateRange: {
                from: new Date(),
                to: new Date(),
            },
            paymentOptions: []
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const updatedPromo = {
                ...values,
                startDate: values.dateRange.from,
                endDate: values.dateRange.to,
                acceptedPaymentMethods: values.paymentOptions,
            };
            setLoading(true)
            const { data } = await updatePromo(id, updatedPromo);
            setLoading(false);
            onOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.campaignName + " updated successfully",
                duration: 5000
            });

            //TODOS: Update List
            mutate({ url: "v1/promo/" + id })
            mutate({ url: "v1/promo" })

        } catch (err) {
            setLoading(false);
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: getErrorMessage(err),
                duration: 5000
            });
        };

    }

    useEffect(() => {
        if (!isPromoLoading)
            if (promo) {
                form.setValue("_id", promo?._id)
                form.setValue("campaignName", promo?.campaignName)
                form.setValue("code", promo?.code)
                form.setValue("minimumRequired", promo?.minimumRequired)
                form.setValue("percentageDiscount", promo?.percentageDiscount)
                form.setValue("fixedDiscount", promo?.fixedDiscount)
                form.setValue("maxDiscount", promo?.maxDiscount)
                form.setValue("paymentOptions", promo?.acceptedPaymentMethods)
                form.setValue("dateRange", { from: new Date(promo?.startDate), to: new Date(promo?.endDate) })
            }
    }, [promo, isPromoLoading, form])

    useEffect(() => {
        if (!open) {
            form.reset({
                _id: "",
                campaignName: "",
                code: "",
                minimumRequired: undefined,
                percentageDiscount: undefined,
                fixedDiscount: undefined,
                maxDiscount: undefined,
                dateRange: {
                    from: new Date(),
                    to: new Date(),
                },
                paymentOptions: []
            },);
        }
    }, [open, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogContent className="max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1">
                        <span>Update Promo</span>
                        {isPromoLoading && <LoaderCircle size={18} className="animate-spin" />}
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
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
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button"
                                    onClick={() => {
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
        </Dialog >

    );
};

export default UpdatePromoComponent;
