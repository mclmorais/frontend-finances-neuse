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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Income } from '@/lib/types/income';
import type { Account } from '@/lib/types/account';

const formSchema = z.object({
  accountId: z.number().min(1, 'Account is required'),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  description: z.string().max(255, 'Description is too long').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface IncomeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  income?: Income;
  accounts: Account[];
  isLoading?: boolean;
}

export function IncomeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  income,
  accounts,
  isLoading = false,
}: IncomeFormDialogProps) {
  const isEdit = !!income;

  const form = useForm<FormValues>({
    // @ts-expect-error - Zod 4 compatibility issue with @hookform/resolvers
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: income?.accountId || 0,
      value: income?.value ? parseFloat(income.value) : 0,
      description: income?.description || '',
      date: income?.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  // Reset form when income changes or dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        accountId: income?.accountId || 0,
        value: income?.value ? parseFloat(income.value) : 0,
        description: income?.description || '',
        date: income?.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [open, income, form]);

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Income' : 'Create Income'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the income details below.'
              : 'Add a new income to track your earnings.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
