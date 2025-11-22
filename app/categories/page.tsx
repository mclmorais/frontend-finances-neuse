"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { CategoryCreateModal } from "@/components/category-create-modal";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  userId: string;
  color: string;
  icon: string;
  name: string;
  type: string;
}

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      return apiClient.get<Category[]>("/categories");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return apiClient.delete<Category>(`/categories/${categoryId}`);
    },
    onSuccess: (deletedCategory) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Category "${deletedCategory.name}" deleted successfully`);
      setCategoryToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });

  // Ensure categories is always an array
  const categoriesList = Array.isArray(categories) ? categories : [];

  const expenseCategories = categoriesList.filter(
    (cat) => cat.type === "expense",
  );
  const savingCategories = categoriesList.filter(
    (cat) => cat.type === "saving",
  );

  const renderCategoryList = (
    categoryList: Category[],
    emptyMessage: string,
  ) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (categoryList.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>
      );
    }

    return (
      <div className="grid gap-2">
        {categoryList.map((category) => {
          const IconComponent =
            (
              LucideIcons as unknown as Record<
                string,
                React.ComponentType<{ className?: string }>
              >
            )[category.icon] || LucideIcons.Circle;
          return (
            <div
              key={category.id}
              className="group flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div
                className="flex size-10 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: category.color }}
              >
                <IconComponent className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {category.type}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setCategoryToDelete(category)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground mt-2">
                Organize your transactions with custom categories
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add New Category
            </Button>
          </div>

          <CategoryCreateModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />

          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">
                  Error loading categories: {(error as Error).message}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  Categories for expense transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCategoryList(
                  expenseCategories,
                  'No expense categories yet. Click "Add Category" to create one.',
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saving Categories</CardTitle>
                <CardDescription>
                  Categories for saving transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCategoryList(
                  savingCategories,
                  'No saving categories yet. Click "Add Category" to create one.',
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog
          open={!!categoryToDelete}
          onOpenChange={(open) => !open && setCategoryToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the category{" "}
                <strong className="text-foreground">
                  &ldquo;{categoryToDelete?.name}&rdquo;
                </strong>
                ?
                <br />
                <br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  categoryToDelete && deleteMutation.mutate(categoryToDelete.id)
                }
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    </ProtectedRoute>
  );
}
