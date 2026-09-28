'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Plus } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NewCategoryComponent from './NewCategoryComponent';
import { Key, useState } from 'react';

//FORMS
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import useSWR, { mutate } from 'swr';
import { fetcher } from '@/actions/swr';
import { createRide } from '@/actions/ride';
import { AlertError } from '@/components/AlertError';
import { AlertSuccess } from '@/components/AlertSuccess';
import Image from 'next/image';
import { ACCEPTED_IMAGE_TYPES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
export function NewRideForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const { data: categoriesData, isLoading: isCategoriesLoading } = useSWR(
    { url: 'v1/ride-categories' },
    fetcher,
  );
  const categoriesList = categoriesData?.data;

  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    error: '',
    success: '',
  });

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Ride/Attraction name required' }),
    description: z.string().min(1, { message: 'Description required' }),
    status: z.string().min(1, { message: 'Status required' }),
    heightRequirements: z
      .string()
      .min(1, { message: 'Height Requirements required' }),
    categoryId: z.string().min(1, { message: 'Category required' }),
    image: z
      .instanceof(File, { message: 'Image is required' })
      .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: '.jpg, .jpeg, .png and .webp files are accepted.',
      })
      .refine((file) => !file || file.size !== 0 || file.size <= 5000000, {
        message: 'Max image size exceeded (5MB)',
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      status: '',
      heightRequirements: '',
      image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const formData = new FormData();
    formData.set('name', values.name);
    formData.set('rideCategoryId', values.categoryId);
    formData.set('heightRequirements', values.heightRequirements);
    formData.set('status', values.status);
    formData.set('description', values.description);
    if (values.image) {
      formData.set('image', values.image);
    }

    try {
      const { data } = await createRide(formData);
      setLoading(false);
      setMessage({ error: '', success: data.name + ' created successfully' });
      mutate({ url: 'v1/ride' });
      setPreviewImage('');
      form.reset({
        categoryId: '',
        name: '',
        description: '',
        status: '',
        heightRequirements: '',
        image: undefined,
      });
    } catch (err) {
      setLoading(false);
      setMessage({ success: '', error: getErrorMessage(err) });
    }
  }

  const showCategories = () => {
    if (!isCategoriesLoading) {
      return categoriesList.map(
        (item: { _id: string; name: string }, key: Key) => {
          return (
            <SelectItem value={item._id} key={key}>
              {item.name}
            </SelectItem>
          );
        },
      );
    }
  };

  return (
    <>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Add New Rides and Attraction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  {message.error && (
                    <AlertError
                      title="Invalid Request"
                      message={message.error}
                    />
                  )}
                  {message.success && (
                    <AlertSuccess title="Success!" message={message.success} />
                  )}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="image">
                          <span className="text-primary">
                            Ride/Attraction Image
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Picture"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPreviewImage(reader.result as string);
                                field.onChange(e.target.files?.[0]);
                              };
                              reader.readAsDataURL(e.target.files![0]);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                        {previewImage && (
                          <div className="flex justify-center">
                            <Image
                              src={previewImage}
                              width={300}
                              height={200}
                              alt="Ride Image"
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">
                          <span className="text-primary">Attraction Name</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            type="text"
                            {...field}
                            placeholder="e.g. Gabi ng Lagim"
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                      </FormItem>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel htmlFor="image">
                            <span className="text-primary">Category</span>
                          </FormLabel>
                          <Button
                            className="text-[12px] px-3 h-5 rounded-sm"
                            type="button"
                            onClick={() => {
                              setCategoryOpen(true);
                            }}
                          >
                            <Plus className="p-0" size={12}></Plus>
                            Add Category
                          </Button>
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={cn(
                              `w-full`,
                              form.formState?.errors?.categoryId?.message &&
                                'border-destructive',
                            )}
                          >
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>{showCategories()}</SelectContent>
                        </Select>
                        <p className="text-xs font-light text-destructive">
                          {form.formState?.errors?.categoryId?.message}
                        </p>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="status">
                          <span className="text-primary">Status</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="status"
                            type="text"
                            {...field}
                            placeholder="e.g. Open"
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heightRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="heightRequirements">
                          <span className="text-primary">
                            Height Requirements
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="heightRequirements"
                            {...field}
                            placeholder="e.g. Open to all ages"
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
                            {...field}
                            placeholder="Type description here..."
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Add New Rides and Attraction
                    {loading && <LoaderCircle className="animate-spin" />}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <NewCategoryComponent
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
      />
    </>
  );
}
