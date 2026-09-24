"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js"
import { useForm } from "react-hook-form"
import { getErrorMessage, getValidationErrorMessage } from "@/lib/errors"
import { changePassword } from "@/actions/auth"
import { LoaderCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertSuccess } from "@/components/AlertSuccess"
import { AlertError } from "@/components/AlertError"

export function ChangePasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        success: "",
        error: ""
    })
    const [validationErrors, setValidationErrors] = useState<({ [key: string]: string })>({});
    //FORMS
    const formSchema = z.object({
        currentPassword: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(255, { message: "Password must be at most 255 characters." }),
        newPassword: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(255, { message: "Password must be at most 255 characters." }),
        confirmation: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(255, { message: "Password must be at most 255 characters." }),
    }).refine((data) => data.newPassword === data.confirmation, {
        message: "Passwords don't match",
        path: ["confirmation"],
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmation: ""
        },
    });


    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        setLoading(true)
        try {
            await changePassword({ ...values });
            setLoading(false);
            setMessage({ error: "", success: "Change Password successful." })
            form.reset();
            setValidationErrors({});
        } catch (err) {
            setLoading(false);
            setMessage({ success: "", error: getErrorMessage(err) })
            setValidationErrors(getValidationErrorMessage(err))
        };

    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {message.error && <AlertError title="Request Invalid" message={message.error} />}
                                {message.success && <AlertSuccess title="Success!" message={message.success} />}
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="currentPassword">
                                                <span className="text-primary">Current Password</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    {...field}
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                            {validationErrors.currentPassword && (
                                                <p className="text-xs font-light text-red-500">{validationErrors.currentPassword}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="newPassword">
                                                <span className="text-primary">New Password</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    {...field}
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                            {validationErrors.newPassword && (
                                                <p className="text-xs font-light text-red-500">{validationErrors.newPassword}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="confirmation">
                                                <span className="text-primary">Confirm Password</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="confirmation"
                                                    type="password"
                                                    {...field}
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                            {validationErrors.confirmation && (
                                                <p className="text-xs font-light text-red-500">{validationErrors.confirmation}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    Change Password
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
