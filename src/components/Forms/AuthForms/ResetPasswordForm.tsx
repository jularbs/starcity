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
    CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { getErrorMessage, getValidationErrorMessage } from "@/lib/errors"
import { resetPassword } from "@/actions/auth"
import { LoaderCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertSuccess } from "@/components/AlertSuccess"
import { AlertError } from "@/components/AlertError"

export function ResetPasswordForm({
    token,
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div"> & { token: string }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        success: "",
        error: ""
    })
    const [validationErrors, setValidationErrors] = useState<({ [key: string]: string })>({});

    const formSchema = z.object({
        newPassword: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(255, { message: "Password must be at most 255 characters." }),
        confirmPassword: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(255, { message: "Password must be at most 255 characters." }),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await resetPassword({ token, ...values });
            setLoading(false);
            setMessage({ error: "", success: "Password reset successful. Redirecting to login..." })
            setValidationErrors({});
            form.reset();
            setTimeout(() => {
                window.location.replace("/auth/login");
            }, 2000);
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
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        Choose a new password for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {message.error && <AlertError title="Request Invalid" message={message.error} />}
                                {message.success && <AlertSuccess title="Success!" message={message.success} />}
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
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="confirmPassword">
                                                <span className="text-primary">Confirm Password</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    {...field}
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                            {validationErrors.confirmPassword && (
                                                <p className="text-xs font-light text-red-500">{validationErrors.confirmPassword}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={!token}>
                                    Reset Password
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                                {!token && (
                                    <p className="text-xs font-light text-center text-red-500">
                                        This reset link is missing or invalid. Please request a new one.
                                    </p>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
