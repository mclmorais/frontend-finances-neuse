import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/lib/api/accounts';
import type { Account, CreateAccountRequest, UpdateAccountRequest } from '@/lib/types/account';

// Query keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountKeys.details(), id] as const,
};

// Hook to fetch all accounts
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: getAccounts,
  });
}

// Hook to create an account
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => createAccount(data),
    onSuccess: () => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      toast.success('Account created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create account', {
        description: error.message,
      });
    },
  });
}

// Hook to update an account
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountRequest }) =>
      updateAccount(id, data),
    onSuccess: () => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      toast.success('Account updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update account', {
        description: error.message,
      });
    },
  });
}

// Hook to delete an account
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete account', {
        description: error.message,
      });
    },
  });
}
