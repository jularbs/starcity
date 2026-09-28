//TODOS: Implement Image Preview on Select
'use client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SocialMediaFormItem } from './SocialMediaFormItem';
export function SocialMediaForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card className="text-lg font-bold uppercase">
          <CardHeader>Social Media URLs</CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-6">
              <SocialMediaFormItem label="facebook" option="FACEBOOK_URL" />
              <SocialMediaFormItem label="instagram" option="INSTAGRAM_URL" />
              <SocialMediaFormItem label="tiktok" option="TITOK_URL" />
              <SocialMediaFormItem label="twitter/x" option="TWITTER_URL" />
              <SocialMediaFormItem label="youtube" option="YOUTUBE_URL" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
