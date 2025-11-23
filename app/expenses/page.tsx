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
import { Loader2, Plus } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ExpenseFormModal } from "@/components/expense-form-modal";
import { ExpensesTable } from "@/components/expenses-table";
import { Expense, Category, Account } from "@/lib/types";
import { toast } from "sonner";

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const queryClient = useQueryClient();

  const {
    data: expenses = [],
    isLoading: expensesLoading,
    error: expensesError,
  } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      return apiClient.get<Expense[]>("/expenses");
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      return apiClient.get<Category[]>("/categories");
    },
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      return apiClient.get<Account[]>("/accounts");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return apiClient.delete<Expense>(`/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
      setExpenseToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete expense: ${error.message}`);
    },
  });

  const handleOpenCreateModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setExpenseToEdit(null);
  };

  if (expensesError) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="mx-auto max-w-6xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-red-500">
                  Failed to load expenses: {(expensesError as Error).message}
                </p>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

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
            <Button onClick={handleOpenCreateModal}>
              <Plus className="mr-2 size-4" />
              Add Expense
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>Your expense transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm font-medium">
                    No expenses recorded yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click &quot;Add Expense&quot; to record your first
                    transaction
                  </p>
                </div>
              ) : (
                <ExpensesTable
                  expenses={expenses}
                  categories={categories}
                  accounts={accounts}
                  onEdit={(expense) => {
                    setExpenseToEdit(expense);
                    setIsModalOpen(true);
                  }}
                  onDelete={setExpenseToDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>

      <ExpenseFormModal
        mode={expenseToEdit ? "edit" : "create"}
        expense={expenseToEdit}
        open={isModalOpen}
        onOpenChange={handleCloseModal}
      />

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={() => setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expenseToDelete) {
                  deleteMutation.mutate(expenseToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
