"use client"
//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Resolver, useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { toast } from "sonner";

import { useEffect, useState } from "react"
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import { fetcher } from "@/actions/swr";
import useSWR, { mutate } from "swr";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateTicket } from "@/actions/ticket"
import { getErrorMessage } from "@/lib/errors"

const UpdateTicketComponent = ({ slug = "", open, onOpenChange }:
    { slug: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {

    //Component State
    const [loading, setLoading] = useState(false)

    //fetch ticket data
    const { data, isLoading: isTicketLoading } = useSWR( //TODOS: Show Fetch Error using Sonnar  
        slug && open ? { url: "v1/ticket/" + slug } : null,
        fetcher
    );

    const ticketData = data?.data;

    //Form Functions
    const formSchema = z.object({
        _id: z.string().min(1, { message: "Ticket ID required" }),
        name: z.string().min(1, { message: "Ticket name required" }),
        code: z.string().length(4, { message: "Code should be 4 characters long" }),
        shortDescription: z.string().min(1, { message: "Short description required" }),
        price: z.coerce.number().gt(0, { message: "Price should be greater than 0" }),
        details: z.string().min(1, { message: "Ticket details required" }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
        defaultValues: {
            _id: "",
            name: "",
            code: "",
            price: 0,
            shortDescription: "",
            details: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const { data } = await updateTicket(values._id, values)
            setLoading(false);
            onOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: data.name + ' updated successfully',
                duration: 5000
            });
            mutate({ url: "v1/ticket/manage" });
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
        }
    }

    useEffect(() => {
        if (!isTicketLoading)
            if (ticketData) {
                form.setValue("_id", ticketData?._id)
                form.setValue("name", ticketData?.name)
                form.setValue("price", ticketData?.price)
                form.setValue("code", ticketData?.itemCode)
                form.setValue("shortDescription", ticketData?.shortDescription)
                form.setValue("details", ticketData?.details)
            }
    }, [ticketData, isTicketLoading, form])

    useEffect(() => {
        if (!open) {
            form.reset({
                _id: "",
                name: "",
                code: "",
                price: undefined,
                shortDescription: "",
                details: "",
            },);
        }
    }, [open, form])

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-screen overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-1">
                    <span>Update Ticket</span>
                    {isTicketLoading && <LoaderCircle size={18} className="animate-spin" />}
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-6">
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
                                                disabled={true}
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
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => {
                                onOpenChange(false)
                            }}>
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
    </Dialog >



}

export default UpdateTicketComponent;