'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { IconPicker } from '@/components/category/icon-picker';
import type { Account } from '@/lib/types/account';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  icon: z.string().min(1, 'Icon is required'),
  color: z
    .string()
    .regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, 'Invalid color format. Use hex color (e.g., #FF5733)'),
});

type FormValues = z.infer<typeof formSchema>;

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  account?: Account;
  isLoading?: boolean;
}

export function AccountFormDialog({
  open,
  onOpenChange,
  onSubmit,
  account,
  isLoading = false,
}: AccountFormDialogProps) {
  const isEdit = !!account;

  const form = useForm<FormValues>({
    // @ts-expect-error - Zod 4 compatibility issue with @hookform/resolvers
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account?.name || '',
      icon: account?.icon || 'wallet',
      color: account?.color || '#6366f1',
    },
  });

  // Reset form when account changes or dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: account?.name || '',
        icon: account?.icon || 'wallet',
        color: account?.color || '#6366f1',
      });
    }
  }, [open, account, form]);

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
    form.reset();
  };

  const watchedColor = form.watch('color');
  const watchedIcon = form.watch('icon');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Account' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the account details below.'
              : 'Add a new account to track your finances.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker
                      value={field.value}
                      onChange={field.onChange}
                      color={watchedColor}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="color" className="h-10 w-20" {...field} />
                    </FormControl>
                    <Input
                      placeholder="#6366f1"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
