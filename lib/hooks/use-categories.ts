import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api/categories';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types/category';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// Hook to fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
  });
}

// Hook to create a category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create category', {
        description: error.message,
      });
    },
  });
}

// Hook to update a category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update category', {
        description: error.message,
      });
    },
  });
}

// Hook to delete a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete category', {
        description: error.message,
      });
    },
  });
}
