'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import { mutate } from 'swr';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addRideCategory } from '@/actions/ride';
import { getErrorMessage } from '@/lib/errors';
const NewCategoryComponent = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Category name is required' }),
    description: z
      .string()
      .min(1, { message: 'Category description is required' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { data } = await addRideCategory(values);
      setLoading(false);
      onOpenChange(false);
      toast.success('Success!', {
        style: {
          background: 'rgb(56, 142, 60)',
          color: 'white',
          border: 'none',
        },
        description: data.name + ' category addedd successfully',
        duration: 5000,
      });
      form.reset({
        name: '',
        description: '',
      });
      mutate({ url: 'v1/ride-categories' });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div>Add New Category</div>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">
                      <span className="text-primary">Category Name</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        type="text"
                        {...field}
                        placeholder="e.g. Water Sports"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">
                      <span className="text-primary">Description</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Enter description here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Category
                  {loading && <LoaderCircle className="animate-spin" />}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCategoryComponent;
