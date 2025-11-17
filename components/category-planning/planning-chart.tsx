'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import type { CategoryPlanningAnalysis } from '@/lib/types/category-planning';

interface PlanningChartProps {
  data: CategoryPlanningAnalysis[];
  isLoading?: boolean;
}

interface ChartDataItem {
  categoryName: string;
  planned: number;
  actual: number;
  fill: string;
}

const chartConfig = {
  planned: {
    label: 'Planned',
    color: 'hsl(var(--chart-1))',
  },
  actual: {
    label: 'Actual',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function PlanningChart({ data, isLoading = false }: PlanningChartProps) {
  // Transform data for the chart - only include expense categories with planned values
  const chartData = React.useMemo<ChartDataItem[]>(() => {
    return data
      .filter((item) => item.categoryType === 'expense' && item.plannedValue !== null)
      .map((item) => ({
        categoryName: item.categoryName.length > 15
          ? item.categoryName.substring(0, 12) + '...'
          : item.categoryName,
        planned: parseFloat(item.plannedValue || '0'),
        actual: parseFloat(item.totalSpent || '0'),
        fill: item.categoryColor,
      }))
      .sort((a, b) => b.planned - a.planned)
      .slice(0, 10); // Limit to top 10 categories
  }, [data]);

  // Calculate max value for the chart
  const maxValue = React.useMemo(() => {
    if (chartData.length === 0) return 3000;
    const maxPlanned = Math.max(...chartData.map((d) => d.planned));
    const maxActual = Math.max(...chartData.map((d) => d.actual));
    return Math.max(3000, maxPlanned, maxActual);
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
          <CardTitle>Planned vs Actual Spending</CardTitle>
          <CardDescription>
            Compare your planned budget with actual spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No planning data available. Set up your budget to see the comparison.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planned vs Actual Spending</CardTitle>
        <CardDescription>
          Compare your planned budget with actual spending by category
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
              domain={[0, maxValue]}
              tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="categoryName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
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
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="planned"
              fill="var(--color-planned)"
              radius={[0, 5, 5, 0]}
            />
            <Bar
              dataKey="actual"
              fill="var(--color-actual)"
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
