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
import type { Income } from '@/lib/types/income';
import type { Account } from '@/lib/types/account';
import type { MonthYear } from '@/lib/utils/date-helpers';
import { formatMonthYear } from '@/lib/utils/date-helpers';

interface AccountIncomeChartProps {
  incomes: Income[];
  accounts: Account[];
  selectedMonth: MonthYear | null;
  currentYear: string;
  isLoading?: boolean;
}

interface ChartDataItem {
  accountName: string;
  total: number;
  fill: string;
}

export function AccountIncomeChart({
  incomes,
  accounts,
  selectedMonth,
  currentYear,
  isLoading = false,
}: AccountIncomeChartProps) {
  // Aggregate incomes by account
  const chartData = React.useMemo<ChartDataItem[]>(() => {
    const totals = new Map<number, { account: Account; total: number }>();

    incomes.forEach((income) => {
      const account = accounts.find((a) => a.id === income.accountId);
      if (account) {
        const current = totals.get(income.accountId) || { account, total: 0 };
        totals.set(income.accountId, {
          account,
          total: current.total + parseFloat(income.value),
        });
      }
    });

    // Convert to array and sort by total (descending)
    const dataArray = Array.from(totals.values())
      .sort((a, b) => b.total - a.total)
      .map(({ account, total }) => ({
        accountName: account.name,
        total: Math.round(total * 100) / 100, // Round to 2 decimal places
        fill: account.color,
      }));

    // Limit to top 10 accounts if more than 10
    return dataArray.slice(0, 10);
  }, [incomes, accounts]);

  // Calculate soft max: 3000 if all values are below, otherwise use max value
  const maxAccountTotal = React.useMemo(() => {
    if (chartData.length === 0) return 3000;
    const maxValue = Math.max(...chartData.map((d) => d.total));
    return Math.max(3000, maxValue);
  }, [chartData]);

  // Create chart config dynamically based on accounts
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    chartData.forEach(({ accountName, fill }) => {
      config[accountName] = {
        label: accountName,
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
          <CardTitle>Income by Account</CardTitle>
          <CardDescription>
            {selectedMonth
              ? `${formatMonthYear(selectedMonth, currentYear)} breakdown`
              : 'Total income across all accounts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No incomes for this period. Add an income to see account breakdown.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income by Account</CardTitle>
        <CardDescription>
          {selectedMonth
            ? `${formatMonthYear(selectedMonth, currentYear)} breakdown`
            : 'Total income across all accounts'}
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
              domain={[0, maxAccountTotal]}
              tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="accountName"
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
