"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { MonthlyComparison } from "@/lib/api-schemas";

interface MonthlyComparisonCardProps {
  comparison: MonthlyComparison;
  isLoading?: boolean;
  selectedMonth: Date;
}

export function MonthlyComparisonCard({
  comparison,
  isLoading = false,
  selectedMonth,
}: MonthlyComparisonCardProps) {
  const { totalIncome, totalExpenses, netBalance } = comparison;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Calculate percentage
  const percentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const isOverBudget = percentage > 100;
  const displayPercentage = Math.round(percentage);

  // Determine bar color based on percentage
  const getBarColor = () => {
    if (isOverBudget) return "bg-red-500";
    if (percentage <= 50) return "bg-green-500";
    if (percentage <= 75) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // Determine icon and color based on net balance
  const isPositiveBalance = netBalance >= 0;
  const Icon = isPositiveBalance ? TrendingUp : TrendingDown;
  const iconBgColor = isOverBudget
    ? "bg-red-500/10"
    : isPositiveBalance
      ? "bg-green-500/10"
      : "bg-red-500/10";
  const iconColor = isOverBudget
    ? "text-red-500"
    : isPositiveBalance
      ? "text-green-500"
      : "text-red-500";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={`flex size-12 items-center justify-center rounded-lg ${iconBgColor}`}
          >
            <Icon className={`size-6 ${iconColor}`} />
          </div>
          <div>
            <CardTitle className="text-lg">Income vs Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(selectedMonth, "MMMM yyyy")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Income and Expenses */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className={`h-full transition-all duration-500 ease-out ${getBarColor()}`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
                {/* Overflow indicator */}
                {isOverBudget && (
                  <div className="absolute inset-0 flex items-center justify-end pr-1">
                    <AlertTriangle className="size-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {displayPercentage}% spent
                </span>
                {isOverBudget && (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <AlertTriangle className="size-3" />
                    Over budget
                  </span>
                )}
              </div>
            </div>

            {/* Net Balance */}
            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatCurrency(netBalance)}
              </p>
            </div>

            {/* Edge case messages */}
            {totalIncome === 0 && totalExpenses > 0 && (
              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No income recorded for this month
                </p>
              </div>
            )}
            {totalIncome === 0 && totalExpenses === 0 && (
              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No transactions recorded for this month
                </p>
              </div>
            )}
            {totalExpenses === 0 && totalIncome > 0 && (
              <div className="rounded-md bg-green-50 p-3 dark:bg-green-950">
                <p className="text-sm text-green-800 dark:text-green-200">
                  No expenses recorded - great job!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
