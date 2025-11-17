import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getIncomes,
  getIncomesByMonth,
  createIncome,
  updateIncome,
  deleteIncome,
} from '@/lib/api/incomes';
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '@/lib/types/income';

// Query keys
export const incomeKeys = {
  all: ['incomes'] as const,
  lists: () => [...incomeKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...incomeKeys.lists(), filters] as const,
  details: () => [...incomeKeys.all, 'detail'] as const,
  detail: (id: number) => [...incomeKeys.details(), id] as const,
};

// Hook to fetch all incomes
export function useIncomes() {
  return useQuery({
    queryKey: incomeKeys.lists(),
    queryFn: getIncomes,
  });
}

// Hook to fetch incomes by month
export function useIncomesByMonth(year: string, month: string) {
  return useQuery({
    queryKey: incomeKeys.list({ year, month }),
    queryFn: () => getIncomesByMonth(year, month),
  });
}

// Hook to create an income
export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeRequest) => createIncome(data),
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      toast.success('Income created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create income', {
        description: error.message,
      });
    },
  });
}

// Hook to update an income
export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIncomeRequest }) =>
      updateIncome(id, data),
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      toast.success('Income updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update income', {
        description: error.message,
      });
    },
  });
}

// Hook to delete an income
export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteIncome(id),
    onSuccess: () => {
      // Invalidate and refetch incomes
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      toast.success('Income deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete income', {
        description: error.message,
      });
    },
  });
}
