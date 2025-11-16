'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, Plus } from 'lucide-react';

export default function CategoriesPage() {
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
            <Button>
              <Plus className="mr-2 size-4" />
              Add Category
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <FolderTree className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Income Categories</CardTitle>
                    <CardDescription>Categories for income transactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No income categories created yet. Click &quot;Add Category&quot; to create your first one.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                    <FolderTree className="size-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>Categories for expense transactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No expense categories created yet. Click &quot;Add Category&quot; to create your first one.
                </p>
              </CardContent>
            </Card>
          </div>

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
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
