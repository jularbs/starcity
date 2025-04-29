import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/ui/daterange-picker"

export function NewImageSliderForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Image Slider</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Slider Image</Label>
                                <Input
                                    placeholder="Picture"
                                    type="file"
                                    accept="image/*"
                                >
                                </Input>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Name Identifier</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="SUMMER2025"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Order</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="SUMMER2025"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Display Duration</Label>
                                <DateRangePicker className="w-full"/>
                            </div>
                            <Button type="submit" className="w-full">
                                Add New Slider Image
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
