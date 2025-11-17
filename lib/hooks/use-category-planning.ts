import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCategoryPlanning,
  getCategoryPlanningByMonth,
  getCategoryPlanningAnalysis,
  getTotalIncome,
  createCategoryPlanning,
  updateCategoryPlanning,
  deleteCategoryPlanning,
  copyFromPreviousMonth,
} from '@/lib/api/category-planning';
import type {
  CategoryPlanning,
  CreateCategoryPlanningRequest,
  UpdateCategoryPlanningRequest,
  CopyPlanningRequest,
} from '@/lib/types/category-planning';

// Query keys
export const categoryPlanningKeys = {
  all: ['category-planning'] as const,
  lists: () => [...categoryPlanningKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...categoryPlanningKeys.lists(), filters] as const,
  analysis: (filters?: Record<string, unknown>) => [...categoryPlanningKeys.all, 'analysis', filters] as const,
  totalIncome: (filters?: Record<string, unknown>) => [...categoryPlanningKeys.all, 'total-income', filters] as const,
};

// Hook to fetch all category planning
export function useCategoryPlanning() {
  return useQuery({
    queryKey: categoryPlanningKeys.lists(),
    queryFn: getCategoryPlanning,
  });
}

// Hook to fetch category planning by month
export function useCategoryPlanningByMonth(year: string, month: string) {
  return useQuery({
    queryKey: categoryPlanningKeys.list({ year, month }),
    queryFn: () => getCategoryPlanningByMonth(year, month),
  });
}

// Hook to fetch category planning analysis by month
export function useCategoryPlanningAnalysis(year: string, month: string) {
  return useQuery({
    queryKey: categoryPlanningKeys.analysis({ year, month }),
    queryFn: () => getCategoryPlanningAnalysis(year, month),
  });
}

// Hook to fetch total income by month
export function useTotalIncome(year: string, month: string) {
  return useQuery({
    queryKey: categoryPlanningKeys.totalIncome({ year, month }),
    queryFn: () => getTotalIncome(year, month),
  });
}

// Hook to create category planning
export function useCreateCategoryPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPlanningRequest) => createCategoryPlanning(data),
    onSuccess: () => {
      // Invalidate and refetch category planning
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.all });
      toast.success('Category planning created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create category planning', {
        description: error.message,
      });
    },
  });
}

// Hook to update category planning
export function useUpdateCategoryPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryPlanningRequest }) =>
      updateCategoryPlanning(id, data),
    onSuccess: () => {
      // Invalidate and refetch category planning
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.all });
      toast.success('Category planning updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update category planning', {
        description: error.message,
      });
    },
  });
}

// Hook to delete category planning
export function useDeleteCategoryPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategoryPlanning(id),
    onSuccess: () => {
      // Invalidate and refetch category planning
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.all });
      toast.success('Category planning deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete category planning', {
        description: error.message,
      });
    },
  });
}

// Hook to copy planning from previous month
export function useCopyFromPreviousMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CopyPlanningRequest) => copyFromPreviousMonth(data),
    onSuccess: () => {
      // Invalidate and refetch category planning
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryPlanningKeys.all });
      toast.success('Planning copied from previous month successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to copy planning from previous month', {
        description: error.message,
      });
    },
  });
}
