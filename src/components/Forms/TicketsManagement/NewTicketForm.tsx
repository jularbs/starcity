"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { createTicket } from "@/actions/ticket";
import { mutate } from "swr";
import { AlertSuccess } from "@/components/AlertSuccess";
import { AlertError } from "@/components/AlertError";
import { getErrorMessage } from "@/lib/errors";
export function NewTicketForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ error: "", success: "" })
    const formSchema = z.object({
        name: z.string().min(1, { message: "Ticket name required" }),
        code: z.string().length(4, { message: "Code should be 4 characters long" }),
        shortDescription: z.string().min(1, { message: "Short description required" }),
        price: z.coerce.number().gt(0, { message: "Price should be greater than 0" }),
        details: z.string().min(1, { message: "Ticket details required" }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            price: undefined,
            shortDescription: "",
            details: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const { data } = await createTicket(values);
            setLoading(false);
            setMessage({ error: "", success: data.name + " created successfully" });
            form.reset({
                name: "",
                code: "",
                price: 0,
                shortDescription: "",
                details: "",
            })
            mutate({ url: "v1/ticket/manage" });
        } catch (e) {
            setLoading(false);
            setMessage({ success: "", error: getErrorMessage(e) })
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {message.success && <AlertSuccess title="Success!" message={message.success} />}
                                {message.error && <AlertError title="Invalid Request!" message={message.error} />}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="name">
                                                <span className="text-primary">Ticket Name</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    {...field}
                                                    placeholder="e.g. Ride All You Can"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="itemCode">
                                                    <span className="text-primary">Ticket Code</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="itemCode"
                                                        type="text"
                                                        {...field}
                                                        placeholder="e.g. RAYC"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-light" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="price">
                                                    <span className="text-primary">Price</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        {...field}
                                                        placeholder="e.g. 899"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs font-light" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="shortDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="shortDescription">
                                                <span className="text-primary">Short Description</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="shortDescription"
                                                    type="text"
                                                    placeholder="e.g. All Access pass to all rides and attractions"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="details"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="shortDescription">
                                                <span className="text-primary">Ticket Details</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    id="shortDescription"
                                                    placeholder="Type ticket details here."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    Create New Ticket
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
