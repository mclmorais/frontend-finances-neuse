'use client';

import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { CategoryCreateForm } from '@/components/category-create-form';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: number;
  userId: string;
  color: string;
  icon: string;
  name: string;
  type: string;
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      return apiClient.get<Category[]>('/categories');
    },
  });

  // Ensure categories is always an array
  const categoriesList = Array.isArray(categories) ? categories : [];

  const expenseCategories = categoriesList.filter((cat) => cat.type === 'expense');
  const savingCategories = categoriesList.filter((cat) => cat.type === 'saving');

  const renderCategoryList = (categoryList: Category[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (categoryList.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="grid gap-2">
        {categoryList.map((category) => {
          const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Circle;
          return (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div
                className="flex size-10 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: category.color }}
              >
                <IconComponent className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{category.type}</p>
              </div>
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-2">
              Organize your transactions with custom categories
            </p>
          </div>

          <CategoryCreateForm />

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
                <CardDescription>Categories for expense transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {renderCategoryList(
                  expenseCategories,
                  'No expense categories yet. Click "Add Category" to create one.'
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saving Categories</CardTitle>
                <CardDescription>Categories for saving transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {renderCategoryList(
                  savingCategories,
                  'No saving categories yet. Click "Add Category" to create one.'
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
