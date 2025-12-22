"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CategoryBudgetInput } from "@/components/category-budget-input";
import { Category, Account } from "@/lib/api-schemas";
import { Wallet } from "lucide-react";

interface BudgetAllocationFormProps {
  categories: Category[];
  selectedAccount: Account | null;
  availableIncome: number;
  budgetAllocations: Map<string, string>;
  onUpdateBudget: (accountId: number, categoryId: number, value: string) => void;
  validationErrors: Map<string, string>;
  accountLevelError?: string;
  carryoverByAccountCategory: Map<string, number>;
}

export function BudgetAllocationForm({
  categories,
  selectedAccount,
  availableIncome,
  budgetAllocations,
  onUpdateBudget,
  validationErrors,
  accountLevelError,
  carryoverByAccountCategory,
}: BudgetAllocationFormProps) {
  // Split categories by type
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const savingCategories = useMemo(
    () => categories.filter((c) => c.type === "saving"),
    [categories]
  );

  // Calculate totals for selected account
  const { totalAllocated, expenseTotal, savingTotal } = useMemo(() => {
    if (!selectedAccount) return { totalAllocated: 0, expenseTotal: 0, savingTotal: 0 };

    let expense = 0;
    let saving = 0;

    budgetAllocations.forEach((value, key) => {
      const [accountId, categoryId] = key.split("-").map(Number);
      if (accountId === selectedAccount.id) {
        const numValue = parseFloat(value) || 0;
        const category = categories.find((c) => c.id === categoryId);
        if (category) {
          if (category.type === "expense") {
            expense += numValue;
          } else if (category.type === "saving") {
            saving += numValue;
          }
        }
      }
    });

    return {
      totalAllocated: expense + saving,
      expenseTotal: expense,
      savingTotal: saving,
    };
  }, [selectedAccount, budgetAllocations, categories]);

  const remaining = availableIncome - totalAllocated;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!selectedAccount) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Wallet className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Select an account to start budgeting</p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose an account above to allocate budget across categories
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation for: {selectedAccount.name}</CardTitle>
        <CardDescription>
          Allocate your income across expense and saving categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Available Income</p>
              <p className="text-lg font-semibold">{formatCurrency(availableIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Allocated</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAllocated)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`text-lg font-semibold ${remaining < 0 ? "text-red-500" : "text-green-600"}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
          {/* Account-level error message - shown once */}
          {accountLevelError && (
            <div className="px-4">
              <p className="text-xs text-red-500">{accountLevelError}</p>
            </div>
          )}
        </div>

        {/* Expenses Section */}
        {expenseCategories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expenses</h3>
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(expenseTotal)}
              </p>
            </div>
            <div className="space-y-4">
              {expenseCategories.map((category) => {
                const key = `${selectedAccount.id}-${category.id}`;
                const value = budgetAllocations.get(key) || "";
                const error = validationErrors.get(key);
                const carryover = carryoverByAccountCategory.get(key) || 0;

                return (
                  <CategoryBudgetInput
                    key={category.id}
                    category={category}
                    value={value}
                    onChange={(newValue) =>
                      onUpdateBudget(selectedAccount.id, category.id, newValue)
                    }
                    max={availableIncome}
                    error={error}
                    carryover={carryover}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Savings Section */}
        {savingCategories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Savings</h3>
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(savingTotal)}
              </p>
            </div>
            <div className="space-y-4">
              {savingCategories.map((category) => {
                const key = `${selectedAccount.id}-${category.id}`;
                const value = budgetAllocations.get(key) || "";
                const error = validationErrors.get(key);
                const carryover = carryoverByAccountCategory.get(key) || 0;

                return (
                  <CategoryBudgetInput
                    key={category.id}
                    category={category}
                    value={value}
                    onChange={(newValue) =>
                      onUpdateBudget(selectedAccount.id, category.id, newValue)
                    }
                    max={availableIncome}
                    error={error}
                    carryover={carryover}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* No categories message */}
        {expenseCategories.length === 0 && savingCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium">No categories available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create categories first to start budgeting
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
