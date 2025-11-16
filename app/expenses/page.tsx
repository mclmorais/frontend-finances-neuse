'use client';

import * as React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Plus, Calendar, DollarSign } from 'lucide-react';
import { ExpensesTable } from '@/components/expense/expenses-table';
import { ExpenseFormDialog } from '@/components/expense/expense-form-dialog';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/lib/hooks/use-expenses';
import { useCategories } from '@/lib/hooks/use-categories';
import { useAccounts } from '@/lib/hooks/use-accounts';
import type { Expense } from '@/lib/types/expense';

export default function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | undefined>();

  // Fetch data
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();

  // Mutations
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const isLoading = isLoadingExpenses || isLoadingCategories || isLoadingAccounts;

  // Calculate statistics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const lastMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return (
      expenseDate.getMonth() === lastMonth &&
      expenseDate.getFullYear() === lastMonthYear
    );
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.value, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.value, 0);

  // Calculate average for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const lastSixMonthsExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= sixMonthsAgo;
  });

  const averagePerMonth =
    lastSixMonthsExpenses.length > 0
      ? lastSixMonthsExpenses.reduce((sum, exp) => sum + exp.value, 0) / 6
      : 0;

  const handleOpenForm = (expense?: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(undefined);
  };

  const handleSubmit = async (data: {
    categoryId: number;
    accountId: number;
    value: number;
    description: string;
    date: string;
  }) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({
        id: editingExpense.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    handleCloseForm();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage your spending
              </p>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 size-4" />
              Add Expense
            </Button>
          </div>

          {isLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-10 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                        <Calendar className="size-5 text-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">This Month</CardTitle>
                        <CardDescription className="text-xs">Total expenses</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {thisMonthTotal.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {thisMonthExpenses.length} transaction{thisMonthExpenses.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
                        <TrendingDown className="size-5 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Last Month</CardTitle>
                        <CardDescription className="text-xs">Previous period</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {lastMonthTotal.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lastMonthExpenses.length} transaction{lastMonthExpenses.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <DollarSign className="size-5 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Average/Month</CardTitle>
                        <CardDescription className="text-xs">Last 6 months</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      R$ {averagePerMonth.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lastSixMonthsExpenses.length > 0
                        ? `Based on ${lastSixMonthsExpenses.length} transactions`
                        : 'No data yet'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Expenses</CardTitle>
                  <CardDescription>
                    View and manage all your expense transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensesTable
                    expenses={expenses}
                    categories={categories}
                    accounts={accounts}
                    onEdit={handleOpenForm}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <ExpenseFormDialog
          open={isFormOpen}
          onOpenChange={handleCloseForm}
          onSubmit={handleSubmit}
          expense={editingExpense}
          categories={categories}
          accounts={accounts}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
