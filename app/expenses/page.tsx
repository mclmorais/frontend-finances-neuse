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
import { MonthNavigation } from "@/components/month-navigation";
import { CategorySpendingChart } from "@/components/category-spending-chart";
import { ExpenseTimelineChart } from "@/components/expense-timeline-chart";
import { NaturalExpenseInput } from "@/components/natural-expense-input";
import { Expense, Category, Account, ChartView } from "@/lib/types";
import {
  expensesSchema,
  categoriesSchema,
  accountsSchema,
  emptyResponseSchema,
  monthlySummarySchema,
} from "@/lib/api-schemas";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const [chartView, setChartView] = useState<ChartView>("bar");
  const queryClient = useQueryClient();

  // Extract year and month from selectedMonth for API call
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-indexed, API expects 1-indexed

  const {
    data: expenses = [],
    isLoading: expensesLoading,
    error: expensesError,
  } = useQuery({
    queryKey: ["expenses", "monthly", year, month],
    queryFn: async () => {
      return apiClient.get(
        `/expenses/monthly?year=${year}&month=${month}`,
        expensesSchema,
      );
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return apiClient.get("/categories", categoriesSchema);
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return apiClient.get("/accounts", accountsSchema);
    },
  });

  const { data: monthlySummary = [], isLoading: summaryLoading } = useQuery({
    queryKey: ["expenses", "monthly", "summary", year, month],
    queryFn: async () => {
      return apiClient.get(
        `/expenses/monthly/summary?year=${year}&month=${month}`,
        monthlySummarySchema,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return apiClient.delete(`/expenses/${expenseId}`, emptyResponseSchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", "monthly"] });
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

          {/* Natural Language Expense Input */}
          <NaturalExpenseInput categories={categories} accounts={accounts} />

          {/* Chart View Toggle */}
          <div className="flex justify-end gap-2">
            <Button
              variant={chartView === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("bar")}
            >
              Bar Chart
            </Button>
            <Button
              variant={chartView === "timeline" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("timeline")}
            >
              Timeline
            </Button>
            <Button
              variant={chartView === "none" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("none")}
            >
              None
            </Button>
          </div>

          {/* Spending Visualization */}
          {chartView === "bar" ? (
            <CategorySpendingChart
              data={monthlySummary}
              isLoading={summaryLoading}
            />
          ) : chartView === "timeline" ? (
            <ExpenseTimelineChart
              expenses={expenses}
              categories={categories}
              isLoading={expensesLoading}
            />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>
                Expenses for {format(selectedMonth, "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Month Navigation Bar */}
              <div className="mb-6">
                <MonthNavigation
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
              </div>
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
