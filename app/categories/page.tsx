'use client';

import * as React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, Plus, Loader2 } from 'lucide-react';
import { CategoryCard } from '@/components/category/category-card';
import { CategoryFormDialog } from '@/components/category/category-form-dialog';
import { DeleteCategoryDialog } from '@/components/category/delete-category-dialog';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/hooks/use-categories';
import type { Category, CreateCategoryRequest } from '@/lib/types/category';

export default function CategoriesPage() {
  // UI state (not data fetching state)
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | undefined>(undefined);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);

  // TanStack Query hooks
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = () => {
    setEditingCategory(undefined);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: CreateCategoryRequest) => {
    if (editingCategory) {
      // Update existing category
      await updateMutation.mutateAsync({ id: editingCategory.id, data });
    } else {
      // Create new category
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    await deleteMutation.mutateAsync(deletingCategory.id);
    setDeleteOpen(false);
    setDeletingCategory(null);
  };

  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground mt-2">
                Organize your transactions with custom categories
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Add Category
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Income Categories Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <FolderTree className="size-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle>Income Categories</CardTitle>
                      <CardDescription>
                        {incomeCategories.length} {incomeCategories.length === 1 ? 'category' : 'categories'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {incomeCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No income categories created yet. Click &quot;Add Category&quot; to create your first one.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {incomeCategories.map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Categories Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                      <FolderTree className="size-5 text-red-500" />
                    </div>
                    <div>
                      <CardTitle>Expense Categories</CardTitle>
                      <CardDescription>
                        {expenseCategories.length} {expenseCategories.length === 1 ? 'category' : 'categories'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {expenseCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No expense categories created yet. Click &quot;Add Category&quot; to create your first one.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {expenseCategories.map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Section */}
              {categories.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Tips for organizing your categories</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Categories help you organize and analyze your financial transactions. Here are some tips:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Create categories that match your spending patterns</li>
                      <li>Use broad categories for better overview (e.g., &quot;Food&quot; instead of many specific ones)</li>
                      <li>You can always add more specific categories later</li>
                      <li>Common categories: Housing, Transportation, Food, Entertainment, Utilities</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Form Dialog */}
        <CategoryFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          category={editingCategory}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteCategoryDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
          category={deletingCategory}
          isLoading={deleteMutation.isPending}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
