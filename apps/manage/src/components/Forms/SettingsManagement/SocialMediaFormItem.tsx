//FORMS
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { fetcher } from '@/actions/swr';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { saveOption } from '@/actions/option';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export function SocialMediaFormItem({
  label,
  option,
}: {
  label: string;
  option: string;
}) {
  const { data, isLoading } = useSWR(
    { url: 'v1/option/name/' + option },
    fetcher,
  );
  const optionData = data?.data;

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Option name required' }),
    value: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: option,
      value: '',
    },
  });

  useEffect(() => {
    if (!isLoading && optionData) {
      form.setValue('value', optionData.value);
    }
  }, [isLoading, form, optionData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      await saveOption(values);
      setLoading(false);
      toast.success('Success!', {
        style: {
          background: 'rgb(56, 142, 60)',
          color: 'white',
          border: 'none',
        },
        description: 'Option saved successfully',
        duration: 5000,
      });
    } catch (err) {
      setLoading(false);
      toast.error('Invalid Request!', {
        style: {
          background: 'rgba(220, 46, 46, 1)',
          color: 'white',
          border: 'none',
        },
        description: getErrorMessage(err),
        duration: 5000,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="image">
                <span className="text-primary text-xs font-bold">{label}</span>
              </FormLabel>
              <FormControl>
                <div className="flex">
                  <Input
                    id="value"
                    type="text"
                    className="rounded-r-none font-normal"
                    {...field}
                  />
                  <Button type="submit" className="rounded-l-none">
                    Save Change
                    {loading && <LoaderCircle className="animate-spin" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs font-light" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
