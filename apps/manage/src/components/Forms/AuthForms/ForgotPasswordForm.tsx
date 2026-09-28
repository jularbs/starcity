"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoaderCircle } from "lucide-react"

import { forgotPassword } from "@/actions/auth"
import { AlertError } from "@/components/AlertError"
import { AlertSuccess } from "@/components/AlertSuccess"
import { getErrorMessage } from "@/lib/errors"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({
    success: "",
    error: ""
  })

  const formSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const { data } = await forgotPassword(values)
      setLoading(false)
      setMessage({ error: "", success: data.message })
      form.reset()
    } catch (err) {
      setLoading(false)
      setMessage({ success: "", error: getErrorMessage(err) })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="p-0 overflow-hidden">
        <CardContent className="grid p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-sm text-muted-foreground">
                    Please enter your email to start retreiving your account
                  </p>
                </div>
                {message.error && <AlertError title="Request Invalid" message={message.error} />}
                {message.success && <AlertSuccess title="Check your email" message={message.success} />}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">
                        <span className="text-primary">Email</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          {...field}
                          placeholder="m@example.com"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Send Instructions to email
                  {loading && <LoaderCircle className="animate-spin" />}
                </Button>
                <div className="text-sm text-center">
                  Would like to register instead?{" "}
                  <a href="/auth/register" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

