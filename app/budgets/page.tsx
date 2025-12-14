"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Loader2, Save, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { MonthNavigation } from "@/components/month-navigation";
import { AccountSelector } from "@/components/account-selector";
import { BudgetAllocationForm } from "@/components/budget-allocation-form";
import { Account, Category, Income, Budget } from "@/lib/api-schemas";
import {
  accountsSchema,
  categoriesSchema,
  incomesSchema,
  budgetsSchema,
  batchCreateBudgetsOutputSchema,
} from "@/lib/api-schemas";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    startOfMonth(new Date())
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [budgetAllocations, setBudgetAllocations] = useState<Map<string, string>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const queryClient = useQueryClient();

  // Extract year and month from selectedMonth for API call
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;

  // Fetch accounts
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return apiClient.get("/accounts", accountsSchema);
    },
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return apiClient.get("/categories", categoriesSchema);
    },
  });

  // Fetch monthly incomes
  const {
    data: incomes = [],
    isLoading: incomesLoading,
  } = useQuery({
    queryKey: ["incomes", "monthly", year, month],
    queryFn: async () => {
      return apiClient.get(
        `/incomes/monthly?year=${year}&month=${month}`,
        incomesSchema
      );
    },
  });

  // Fetch existing budgets for the month
  const {
    data: existingBudgets = [],
    isLoading: budgetsLoading,
  } = useQuery({
    queryKey: ["budgets", "monthly", year, month],
    queryFn: async () => {
      console.log(`Fetching budgets for ${year}-${month}`);
      return apiClient.get(
        `/budgets/monthly?year=${year}&month=${month}`,
        budgetsSchema
      );
    },
  });

  // Initialize budget allocations from existing budgets
  useEffect(() => {
    if (budgetsLoading) return; // Wait for budgets to finish loading

    console.log('Loading existing budgets:', existingBudgets);
    const allocations = new Map<string, string>();
    existingBudgets.forEach((budget: Budget) => {
      const key = `${budget.accountId}-${budget.categoryId}`;
      // Ensure value is converted to string properly
      const valueStr = typeof budget.value === 'number'
        ? budget.value.toString()
        : String(budget.value || '');

      console.log(`Budget ${key}: ${valueStr}`);
      allocations.set(key, valueStr);
    });
    console.log('Budget allocations map:', allocations);
    setBudgetAllocations(allocations);
    setHasUnsavedChanges(false);
  }, [existingBudgets, budgetsLoading]);

  // Auto-select first account on load
  useEffect(() => {
    if (accounts.length > 0 && selectedAccountId === null) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Calculate income by account
  const incomesByAccount = useMemo(() => {
    const map = new Map<number, number>();
    incomes.forEach((income: Income) => {
      const current = map.get(income.accountId) || 0;
      map.set(income.accountId, current + income.value);
    });
    return map;
  }, [incomes]);

  // Calculate budgeted amount by account
  const budgetsByAccount = useMemo(() => {
    const map = new Map<number, number>();
    budgetAllocations.forEach((value, key) => {
      const [accountId] = key.split("-").map(Number);
      const current = map.get(accountId) || 0;
      const numValue = parseFloat(value) || 0;
      map.set(accountId, current + numValue);
    });
    return map;
  }, [budgetAllocations]);

  // Calculate available income for selected account
  const availableForSelectedAccount = useMemo(() => {
    if (!selectedAccountId) return 0;
    const income = incomesByAccount.get(selectedAccountId) || 0;
    const budgeted = budgetsByAccount.get(selectedAccountId) || 0;
    return income - budgeted;
  }, [selectedAccountId, incomesByAccount, budgetsByAccount]);

  // Validate budgets
  const validationErrors = useMemo(() => {
    const errors = new Map<string, string>();

    // Group budgets by account and validate
    const budgetTotalsByAccount = new Map<number, number>();

    budgetAllocations.forEach((value, key) => {
      const [accountId] = key.split("-").map(Number);
      const numValue = parseFloat(value);

      // Validate numeric format
      if (isNaN(numValue) || numValue < 0) {
        errors.set(key, "Invalid budget amount");
        return;
      }

      const current = budgetTotalsByAccount.get(accountId) || 0;
      budgetTotalsByAccount.set(accountId, current + numValue);
    });

    // Check if any account exceeds available income
    budgetTotalsByAccount.forEach((budgeted, accountId) => {
      const income = incomesByAccount.get(accountId) || 0;
      if (budgeted > income) {
        const excess = budgeted - income;
        const excessFormatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(excess);

        // Mark all categories for this account with error
        budgetAllocations.forEach((value, key) => {
          if (key.startsWith(`${accountId}-`)) {
            errors.set(
              key,
              `Total budget exceeds available income by ${excessFormatted}`
            );
          }
        });
      }
    });

    return errors;
  }, [budgetAllocations, incomesByAccount]);

  // Batch save mutation
  const saveMutation = useMutation({
    mutationFn: async (budgets: { accountId: number; categoryId: number; date: string; value: string }[]) => {
      return apiClient.post(
        "/budgets/batch",
        batchCreateBudgetsOutputSchema,
        { budgets }
      );
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });

      if (result.errors.length > 0) {
        toast.warning(
          `${result.created.length} budgets saved, ${result.errors.length} conflicts`
        );
      } else {
        toast.success(`All ${result.created.length} budgets saved successfully`);
      }

      setHasUnsavedChanges(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to save budgets: ${error.message}`);
    },
  });

  // Handle budget update
  const handleUpdateBudget = (accountId: number, categoryId: number, value: string) => {
    const key = `${accountId}-${categoryId}`;
    const newAllocations = new Map(budgetAllocations);

    if (value === "" || value === "0") {
      newAllocations.delete(key);
    } else {
      newAllocations.set(key, value);
    }

    setBudgetAllocations(newAllocations);
    setHasUnsavedChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    // Validate first
    if (validationErrors.size > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    // Convert allocations to array format for API
    const budgets: { accountId: number; categoryId: number; date: string; value: string }[] = [];
    const monthDate = format(selectedMonth, "yyyy-MM-01");

    budgetAllocations.forEach((value, key) => {
      const [accountId, categoryId] = key.split("-").map(Number);
      budgets.push({
        accountId,
        categoryId,
        date: monthDate,
        value,
      });
    });

    if (budgets.length === 0) {
      toast.info("No budgets to save");
      return;
    }

    await saveMutation.mutate(budgets);
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    }
  };

  const confirmCancel = () => {
    // Reset to existing budgets
    const allocations = new Map<string, string>();
    existingBudgets.forEach((budget: Budget) => {
      const key = `${budget.accountId}-${budget.categoryId}`;
      allocations.set(key, budget.value.toString());
    });
    setBudgetAllocations(allocations);
    setHasUnsavedChanges(false);
    setShowCancelDialog(false);
    toast.info("Changes discarded");
  };

  // Get selected account object
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) || null,
    [accounts, selectedAccountId]
  );

  const isLoading = accountsLoading || categoriesLoading || incomesLoading || budgetsLoading;

  // Handle errors
  if (accountsError) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="mx-auto max-w-6xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-red-500">
                  Failed to load accounts: {(accountsError as Error).message}
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
              <p className="text-muted-foreground mt-2">
                Plan your monthly spending and savings
              </p>
            </div>
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || validationErrors.size > 0 || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Month Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Select Month</CardTitle>
              <CardDescription>
                Choose the month you want to budget for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthNavigation
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Edge case: No accounts */}
              {accounts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm font-medium">No accounts found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create an account first to start budgeting
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/accounts">Go to Accounts</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : categories.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm font-medium">No categories found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create categories first to start budgeting
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/categories">Go to Categories</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : incomes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm font-medium">
                        No income recorded for {format(selectedMonth, "MMMM yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Record income for this month to start budgeting
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/incomes">Go to Incomes</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Account Selector */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Account</CardTitle>
                      <CardDescription>
                        Choose which account you want to budget for {format(selectedMonth, "MMMM yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AccountSelector
                        accounts={accounts}
                        selectedAccountId={selectedAccountId}
                        onSelectAccount={setSelectedAccountId}
                        incomesByAccount={incomesByAccount}
                        budgetsByAccount={budgetsByAccount}
                      />
                    </CardContent>
                  </Card>

                  {/* Budget Allocation Form */}
                  <BudgetAllocationForm
                    categories={categories}
                    selectedAccount={selectedAccount}
                    availableIncome={incomesByAccount.get(selectedAccountId || 0) || 0}
                    budgetAllocations={budgetAllocations}
                    onUpdateBudget={handleUpdateBudget}
                    validationErrors={validationErrors}
                  />
                </>
              )}
            </>
          )}
        </div>
      </AppLayout>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
