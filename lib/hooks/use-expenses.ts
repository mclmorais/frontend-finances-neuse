import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/lib/api/expenses';
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/lib/types/expense';

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: number) => [...expenseKeys.details(), id] as const,
};

// Hook to fetch all expenses
export function useExpenses() {
  return useQuery({
    queryKey: expenseKeys.lists(),
    queryFn: getExpenses,
  });
}

// Hook to create an expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Expense created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create expense', {
        description: error.message,
      });
    },
  });
}

// Hook to update an expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseRequest }) =>
      updateExpense(id, data),
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Expense updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update expense', {
        description: error.message,
      });
    },
  });
}

// Hook to delete an expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Expense deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete expense', {
        description: error.message,
      });
    },
  });
}
