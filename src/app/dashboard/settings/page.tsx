import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <div className="p-4 pt-0">
      <div className="flex flex-wrap">
        <div className="w-full lg:w-1/2">
          <div className="p-2">
            <Card>
              <CardHeader className="text-lg font-bold uppercase">Park Status</CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <Input type="text" />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
          <div className="p-2">
            <Card className="text-lg font-bold uppercase">
              <CardHeader>Logo Management</CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <Input type="file" accept="image/*" />
                <div className="aspect-video bg-neutral-600"></div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="p-2">
            <Card className="text-lg font-bold uppercase">
              <CardHeader>Crowd Status</CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <Input type="text" />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
          <div className="p-2">
            <Card className="text-lg font-bold uppercase">
              <CardHeader>Social Media URLs</CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <form action="">
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs font-bold">Facebook</Label>
                      <div className="flex">
                        <Input type="text" className="rounded-r-none" />
                        <Button className="rounded-l-none">Save Changes</Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs font-bold">Instagram</Label>
                      <div className="flex">
                        <Input type="text" className="rounded-r-none" />
                        <Button className="rounded-l-none">Save Changes</Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs font-bold">Twitter/X</Label>
                      <div className="flex">
                        <Input type="text" className="rounded-r-none" />
                        <Button className="rounded-l-none">Save Changes</Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs font-bold">Youtube</Label>
                      <div className="flex">
                        <Input type="text" className="rounded-r-none" />
                        <Button className="rounded-l-none">Save Changes</Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs font-bold">Tiktok</Label>
                      <div className="flex">
                        <Input type="text" className="rounded-r-none" />
                        <Button className="rounded-l-none">Save Changes</Button>
                      </div>
                    </div>
                  </div>

                </form>
                
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
