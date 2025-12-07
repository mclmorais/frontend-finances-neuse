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
import { IncomeFormModal } from "@/components/income-form-modal";
import { IncomesTable } from "@/components/incomes-table";
import { MonthNavigation } from "@/components/month-navigation";
import { IncomeSummaryCard } from "@/components/income-summary-card";
import { Income, Account } from "@/lib/types";
import {
  incomesSchema,
  accountsSchema,
  emptyResponseSchema,
  incomeMonthlySummarySchema,
} from "@/lib/api-schemas";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";

export default function IncomesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const queryClient = useQueryClient();

  // Extract year and month from selectedMonth for API call
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-indexed, API expects 1-indexed

  const {
    data: incomes = [],
    isLoading: incomesLoading,
    error: incomesError,
  } = useQuery({
    queryKey: ["incomes", "monthly", year, month],
    queryFn: async () => {
      return apiClient.get(
        `/incomes/monthly?year=${year}&month=${month}`,
        incomesSchema,
      );
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return apiClient.get("/accounts", accountsSchema);
    },
  });

  const {
    data: monthlySummary = { totalIncome: 0, incomeCount: 0 },
    isLoading: summaryLoading,
  } = useQuery({
    queryKey: ["incomes", "monthly", "summary", year, month],
    queryFn: async () => {
      return apiClient.get(
        `/incomes/monthly/summary?year=${year}&month=${month}`,
        incomeMonthlySummarySchema,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (incomeId: number) => {
      return apiClient.delete(`/incomes/${incomeId}`, emptyResponseSchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", "monthly"] });
      toast.success("Income deleted successfully");
      setIncomeToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete income: ${error.message}`);
    },
  });

  const handleOpenCreateModal = () => {
    setIncomeToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIncomeToEdit(null);
  };

  if (incomesError) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="mx-auto max-w-6xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-red-500">
                  Failed to load incomes: {(incomesError as Error).message}
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
              <h1 className="text-3xl font-bold tracking-tight">Incomes</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage your income sources
              </p>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="mr-2 size-4" />
              Add Income
            </Button>
          </div>

          {/* Income Summary Card */}
          <IncomeSummaryCard
            totalIncome={monthlySummary.totalIncome}
            incomeCount={monthlySummary.incomeCount}
            isLoading={summaryLoading}
            selectedMonth={selectedMonth}
          />

          <Card>
            <CardHeader>
              <CardTitle>Monthly Incomes</CardTitle>
              <CardDescription>
                Incomes for {format(selectedMonth, "MMMM yyyy")}
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
              {incomesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : incomes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm font-medium">
                    No incomes recorded yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click &quot;Add Income&quot; to record your first
                    transaction
                  </p>
                </div>
              ) : (
                <IncomesTable
                  incomes={incomes}
                  accounts={accounts}
                  onEdit={(income) => {
                    setIncomeToEdit(income);
                    setIsModalOpen(true);
                  }}
                  onDelete={setIncomeToDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>

      <IncomeFormModal
        mode={incomeToEdit ? "edit" : "create"}
        income={incomeToEdit}
        open={isModalOpen}
        onOpenChange={handleCloseModal}
      />

      <AlertDialog
        open={!!incomeToDelete}
        onOpenChange={() => setIncomeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (incomeToDelete) {
                  deleteMutation.mutate(incomeToDelete.id);
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
