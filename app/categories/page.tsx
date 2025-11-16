'use client';

import * as React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryCard } from '@/components/category/category-card';
import { CategoryFormDialog } from '@/components/category/category-form-dialog';
import { DeleteCategoryDialog } from '@/components/category/delete-category-dialog';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api/categories';
import type { Category, CreateCategoryRequest } from '@/lib/types/category';

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | undefined>(undefined);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch categories on mount
  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

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
    try {
      setSubmitting(true);
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, data);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await createCategory(data);
        toast.success('Category created successfully');
      }
      setFormOpen(false);
      setEditingCategory(undefined);
      await loadCategories();
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      setSubmitting(true);
      await deleteCategory(deletingCategory.id);
      toast.success('Category deleted successfully');
      setDeleteOpen(false);
      setDeletingCategory(null);
      await loadCategories();
    } catch (error) {
      toast.error('Failed to delete category', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setSubmitting(false);
    }
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

          {loading ? (
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
          isLoading={submitting}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteCategoryDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
          category={deletingCategory}
          isLoading={submitting}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
