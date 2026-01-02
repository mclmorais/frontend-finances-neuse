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
import { FloatingAccountSelector } from "@/components/floating-account-selector";
import { BudgetAllocationForm } from "@/components/budget-allocation-form";
import { Account, Category, Income, Budget } from "@/lib/api-schemas";
import {
  accountsSchema,
  categoriesSchema,
  incomesSchema,
  budgetsSchema,
  batchCreateBudgetsOutputSchema,
  carryoverSchema,
  CarryoverItem,
} from "@/lib/api-schemas";
import { toast } from "sonner";
import { startOfMonth } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { formatMonthYear } from "@/lib/date-format";
import { formatCurrency } from "@/lib/currency";

export default function BudgetsPage() {
  const t = useTranslations("budgets");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "en" | "pt";
  const [selectedMonth, setSelectedMonth] = useState<Date>(() =>
    startOfMonth(new Date())
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [budgetAllocations, setBudgetAllocations] = useState<Map<string, string>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFloatingSelector, setShowFloatingSelector] = useState(false);
  const accountSelectorRef = React.useRef<HTMLDivElement>(null);
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

  // Fetch carryover (remaining budget from previous months)
  const {
    data: carryoverData = [],
    isLoading: carryoverLoading,
  } = useQuery({
    queryKey: ["budgets", "carryover", year, month],
    queryFn: async () => {
      return apiClient.get(
        `/budgets/carryover?year=${year}&month=${month}`,
        carryoverSchema
      );
    },
  });

  // Convert carryover array to a Map for easy lookup
  const carryoverByAccountCategory = useMemo(() => {
    const map = new Map<string, number>();
    carryoverData.forEach((item: CarryoverItem) => {
      const key = `${item.accountId}-${item.categoryId}`;
      map.set(key, item.remaining);
    });
    return map;
  }, [carryoverData]);

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

  // Scroll detection for floating account selector
  useEffect(() => {
    const handleScroll = () => {
      if (!accountSelectorRef.current) return;

      const accountSelectorRect = accountSelectorRef.current.getBoundingClientRect();
      // Show floating selector when the account selector card is scrolled out of view
      // Account for header height (56px = h-14)
      const headerHeight = 56;
      const shouldShow = accountSelectorRect.bottom < headerHeight;

      setShowFloatingSelector(shouldShow);
    };

    // Debounce scroll events for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

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
        errors.set(key, t("validationError"));
        return;
      }

      const current = budgetTotalsByAccount.get(accountId) || 0;
      budgetTotalsByAccount.set(accountId, current + numValue);
    });

    // Check if any account exceeds available income
    budgetTotalsByAccount.forEach((budgeted, accountId) => {
      const income = incomesByAccount.get(accountId) || 0;
      if (budgeted > income) {
        // Don't mark individual categories - this is an account-level error
        // We'll show it once in the summary section instead
      }
    });

    return errors;
  }, [budgetAllocations, incomesByAccount]);

  // Account-level validation errors (to show once, not repeated)
  const accountLevelErrors = useMemo(() => {
    const errors = new Map<number, string>();
    const budgetTotalsByAccount = new Map<number, number>();

    budgetAllocations.forEach((value, key) => {
      const [accountId] = key.split("-").map(Number);
      const numValue = parseFloat(value) || 0;
      const current = budgetTotalsByAccount.get(accountId) || 0;
      budgetTotalsByAccount.set(accountId, current + numValue);
    });

    budgetTotalsByAccount.forEach((budgeted, accountId) => {
      const income = incomesByAccount.get(accountId) || 0;
      if (budgeted > income) {
        const excess = budgeted - income;
        const excessFormatted = formatCurrency({ locale, value: excess });
        errors.set(
          accountId,
          `${t("budgetExceedsIncome")} ${excessFormatted}`
        );
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
          `${result.created.length} ${t("saveWarning")} ${result.errors.length}`
        );
      } else {
        toast.success(`${result.created.length} ${t("saveSuccess")}`);
      }

      setHasUnsavedChanges(false);
    },
    onError: (error: Error) => {
      toast.error(`${t("saveError")} ${error.message}`);
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
      toast.error(t("validationError"));
      return;
    }

    // Convert allocations to array format for API
    const budgets: { accountId: number; categoryId: number; date: string; value: string }[] = [];
    const year = selectedMonth.getFullYear();
    const month = String(selectedMonth.getMonth() + 1).padStart(2, "0");
    const monthDate = `${year}-${month}-01`;

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
      toast.info(t("noBudgetsToSave"));
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
    toast.info(t("changesDiscarded"));
  };

  // Get selected account object
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) || null,
    [accounts, selectedAccountId]
  );

  const isLoading = accountsLoading || categoriesLoading || incomesLoading || budgetsLoading || carryoverLoading;

  // Handle errors
  if (accountsError) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="mx-auto max-w-6xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-red-500">
                  {useTranslations("accounts")("errorLoading")} {(accountsError as Error).message}
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
        {/* Floating Account Selector */}
        <FloatingAccountSelector
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          remainingValue={availableForSelectedAccount}
          isVisible={showFloatingSelector && !isLoading && accounts.length > 0 && categories.length > 0 && incomes.length > 0}
        />

        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-muted-foreground mt-2">
                {t("description")}
              </p>
            </div>
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 size-4" />
                  {tCommon("cancel")}
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
                {tCommon("saveChanges")}
              </Button>
            </div>
          </div>

          {/* Month Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>{t("selectMonth")}</CardTitle>
              <CardDescription>
                {t("selectMonthDescription")}
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
                      <p className="text-sm font-medium">{t("noAccounts")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("noAccountsDescription")}
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/accounts">{t("goToAccounts")}</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : categories.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm font-medium">{t("noCategories")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("noCategoriesDescription")}
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/categories">{t("goToCategories")}</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : incomes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm font-medium">
                        {t("noIncome")} {formatMonthYear(selectedMonth, locale)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("noIncomeDescription")}
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/incomes">{t("goToIncomes")}</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Account Selector */}
                  <Card
                    ref={accountSelectorRef}
                    className={`transition-opacity duration-300 ${
                      showFloatingSelector ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle>{t("selectAccount")}</CardTitle>
                      <CardDescription>
                        {t("selectAccountDescription")} {formatMonthYear(selectedMonth, locale)}
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
                    accountLevelError={accountLevelErrors.get(selectedAccountId || 0)}
                    carryoverByAccountCategory={carryoverByAccountCategory}
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
            <AlertDialogTitle>{t("discardChangesTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("discardChangesDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("keepEditing")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("discardChanges")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
