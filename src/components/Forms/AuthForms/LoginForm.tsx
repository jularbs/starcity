"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

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
import { SignIn } from "@/actions/auth"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"

import { setCookie } from 'typescript-cookie'
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { AlertError } from "@/components/AlertError"
import { useLocalStorage } from 'usehooks-ts'
import { getErrorMessage } from "@/lib/errors"
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  //Local Storage
  const [, setValue] = useLocalStorage<Record<string, string> | undefined>('user', {})

  //Component States
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({
    success: "",
    error: ""
  })

  //FORMS
  const formSchema = z.object({
    email: z.string()
      .min(1, { message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const response = await SignIn({
        ...values
      })
      setLoading(false);

      const auth = response.data;
      setCookie('token', auth.token, { expires: 7, path: "/" })
      setValue(auth.user);

      redirect("/dashboard");
    } catch (err) {
      setLoading(false);
      if (isRedirectError(err)) {
        throw err
      }
      setMessage({ success: "", error: getErrorMessage(err) })
    };

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="p-0 overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your Star City account
                  </p>
                </div>
                {message.error && <AlertError title="Invalid Login" message={message.error} />}
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel htmlFor="password">
                          <span className="text-primary">Password</span>
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input id="password" type="password" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />

                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                  {loading && <LoaderCircle className="animate-spin" />}
                </Button>
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-center underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </a>
                <div className="text-sm text-center">
                  Don&apos;t have an account?{" "}
                  <a href="/auth/register" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/images/background-placeholder.png"
              width={600}
              height={600}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div >
  )
}
