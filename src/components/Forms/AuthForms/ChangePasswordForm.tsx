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

export function ChangePasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Current Password</Label>
                                <Input
                                    type="password"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">New Password</Label>
                                <Input
                                    type="password"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Confirm Password</Label>
                                <Input
                                    type="password"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Change Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
