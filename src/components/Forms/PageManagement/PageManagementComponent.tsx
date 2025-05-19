//TODOS: refactor editor on change to only on submit. https://blog.richardchou.dev/tinymce-and-react-hook-form-integration-40999e4f0b85
//TODOS: Show loading during uploading
"use client";
import { fetcher } from "@/actions/swr";
import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import useSWR from "swr";
import { Editor } from "@tinymce/tinymce-react";
import { modules } from "@/lib/tinymce";
import { LoaderCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormField,
} from "@/components/ui/form"
import { getCookie } from "typescript-cookie";
import { saveOption } from "@/actions/option";

const PageManagementComponent = ({ option }: { option: string }) => {
    const token = getCookie("token");
    const { data, isLoading } = useSWR(option ? { url: "v1/option/" + option.toUpperCase() } : null, fetcher);
    const [loading, setLoading] = useState(false);
    const [editorLoading, setEditorLoading] = useState(true);

    const formSchema = z.object({
        name: z.string(),
        value: z.string().optional(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            value: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)

        console.log(values);
        saveOption({ data: values, token: token }).then(response => {
            setLoading(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: response.success,
                duration: 5000
            });
        }).catch((err) => {
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
                form.setValue("name", data.name)
                form.setValue("value", data.value)
            }
    }, [data, isLoading, form, option])

    return <Card className="py-0 overflow-y-hidden">
        <CardContent className="p-0">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex justify-between p-4">
                        <div className="flex items-center gap-2">
                            {isLoading && <LoaderCircle size={20} className="animate-spin" />}
                            <div className="text-lg font-extrabold uppercase">
                                {option.split("-").join(" ").split("_").join(" ")}
                            </div>
                        </div>
                        <Button type="submit" className="p-2 h-7">
                            {loading && <LoaderCircle size={20} className="animate-spin" />}
                            <span>Save Changes</span>
                        </Button>
                    </div>
                    {editorLoading && <div className="w-full p-5 text-center aspect-video bg-muted animate-pulse"> Loading Editor... </div>}
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINY_KEY}
                                init={modules}
                                initialValue={data?.value}
                                onEditorChange={field.onChange}
                                onInit={() => {
                                    setEditorLoading(false);
                                }}
                            />
                        )}
                    />
                </form>
            </Form>


        </CardContent>
    </Card>
}

export default PageManagementComponent;