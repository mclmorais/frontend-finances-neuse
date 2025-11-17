'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import type { Expense } from '@/lib/types/expense';
import type { Category } from '@/lib/types/category';
import type { MonthYear } from '@/lib/utils/date-helpers';
import { formatMonthYear } from '@/lib/utils/date-helpers';

interface CategorySpendingChartProps {
  expenses: Expense[];
  categories: Category[];
  selectedMonth: MonthYear | null;
  currentYear: string;
  isLoading?: boolean;
}

interface ChartDataItem {
  categoryName: string;
  total: number;
  fill: string;
}

export function CategorySpendingChart({
  expenses,
  categories,
  selectedMonth,
  currentYear,
  isLoading = false,
}: CategorySpendingChartProps) {
  // Aggregate expenses by category
  const chartData = React.useMemo<ChartDataItem[]>(() => {
    const totals = new Map<number, { category: Category; total: number }>();

    expenses.forEach((expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      if (category && category.type === 'expense') {
        const current = totals.get(expense.categoryId) || { category, total: 0 };
        totals.set(expense.categoryId, {
          category,
          total: current.total + parseFloat(expense.value),
        });
      }
    });

    // Convert to array and sort by total (descending)
    const dataArray = Array.from(totals.values())
      .sort((a, b) => b.total - a.total)
      .map(({ category, total }) => ({
        categoryName: category.name,
        total: Math.round(total * 100) / 100, // Round to 2 decimal places
        fill: category.color,
      }));

    // Limit to top 10 categories if more than 10
    return dataArray.slice(0, 10);
  }, [expenses, categories]);

  // Calculate soft max: 3000 if all values are below, otherwise use max value
  const maxCategoryTotal = React.useMemo(() => {
    if (chartData.length === 0) return 3000;
    const maxValue = Math.max(...chartData.map((d) => d.total));
    return Math.max(3000, maxValue);
  }, [chartData]);

  // Create chart config dynamically based on categories
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    chartData.forEach(({ categoryName, fill }) => {
      config[categoryName] = {
        label: categoryName,
        color: fill,
      };
    });
    return config;
  }, [chartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            {selectedMonth
              ? `${formatMonthYear(selectedMonth, currentYear)} breakdown`
              : 'Total spending across all categories'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No expenses for this period. Add an expense to see category breakdown.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          {selectedMonth
            ? `${formatMonthYear(selectedMonth, currentYear)} breakdown`
            : 'Total spending across all categories'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 12, top: 5, bottom: 5 }}
          >
            <XAxis
              type="number"
              dataKey="total"
              domain={[0, maxCategoryTotal]}
              tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="categoryName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    `R$ ${Number(value).toFixed(2).replace('.', ',')}`
                  }
                />
              }
            />
            <Bar dataKey="total" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
