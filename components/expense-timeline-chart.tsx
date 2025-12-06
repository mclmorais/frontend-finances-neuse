"use client";

import {
  Scatter,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Expense, Category, TimelineDataPoint } from "@/lib/types";
import {
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Utensils,
  Plane,
  Heart,
  Shirt,
  Gamepad2,
  GraduationCap,
  Stethoscope,
  DollarSign,
  Gift,
  Music,
  Film,
  Dumbbell,
  PiggyBank,
  TrendingUp,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

// Icon mapping for dynamic lookup
const ICON_MAP: Record<string, LucideIcon> = {
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Utensils,
  Plane,
  Heart,
  Shirt,
  Gamepad2,
  GraduationCap,
  Stethoscope,
  DollarSign,
  Gift,
  Music,
  Film,
  Dumbbell,
  PiggyBank,
  TrendingUp,
  CreditCard,
};

const getIconComponent = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || Wallet;
};

// Calculate bubble radius based on value
const calculateRadius = (value: number, maxValue: number): number => {
  // Use square root scale for perceptually accurate area
  const scaleFactor = 24 / Math.sqrt(maxValue);
  const radius = Math.sqrt(value) * scaleFactor;
  // Clamp between min and max
  return Math.max(4, Math.min(24, radius));
};

// Custom bubble component
const CustomBubble = (props: any) => {
  const { cx, cy, payload, maxValue } = props;
  if (!payload) return null;

  const radius = calculateRadius(payload.value, maxValue);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={payload.categoryColor}
      fillOpacity={0.7}
      stroke={payload.categoryColor}
      strokeWidth={2}
      className="transition-all hover:fillOpacity-90"
    />
  );
};

// Custom Y-axis tick component
const CustomCategoryTick = (props: any) => {
  const { x, y, payload, categoryMap } = props;
  if (payload.value === undefined || !categoryMap) return null;

  // Find the category at this Y position
  let foundCategory: Category | undefined;
  categoryMap.forEach(({ position, category: cat }: any) => {
    if (Math.abs(position - payload.value) < 0.01) {
      foundCategory = cat;
    }
  });

  if (!foundCategory) return null;

  const IconComponent = getIconComponent(foundCategory.icon);

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-140} y={-12} width={130} height={24}>
        <div className="flex items-center gap-2 justify-end">
          <div
            className="flex items-center justify-center rounded-full w-5 h-5 flex-shrink-0"
            style={{ backgroundColor: foundCategory.color }}
          >
            <IconComponent className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {foundCategory.name}
          </span>
        </div>
      </foreignObject>
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as TimelineDataPoint;
  const IconComponent = getIconComponent(data.categoryIcon);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center rounded-full w-6 h-6"
          style={{ backgroundColor: data.categoryColor }}
        >
          <IconComponent className="w-3 h-3 text-white" />
        </div>
        <span className="font-semibold">{data.categoryName}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(data.value)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">
            {new Date(data.dateString).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        {data.description && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Description:</span>
            <span className="font-medium truncate max-w-[150px]">
              {data.description}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ExpenseTimelineChartProps {
  expenses: Expense[];
  categories: Category[];
  isLoading?: boolean;
}

export function ExpenseTimelineChart({
  expenses,
  categories,
  isLoading = false,
}: ExpenseTimelineChartProps) {
  // Transform data for timeline visualization
  const { timelineData, categoryMap, chartHeight, maxValue } = useMemo(() => {
    // Calculate total spending per category to sort them
    const categoryTotals = new Map<number, number>();
    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, current + expense.value);
    });

    // Get unique categories that have expenses, sorted by total spending
    const usedCategories = categories
      .filter((cat) => categoryTotals.has(cat.id))
      .sort((a, b) => {
        const totalA = categoryTotals.get(a.id) || 0;
        const totalB = categoryTotals.get(b.id) || 0;
        return totalB - totalA; // Descending order
      });

    // Create category map with Y-axis positions
    const catMap = new Map<
      number,
      { position: number; category: Category; expenses: Expense[] }
    >();
    usedCategories.forEach((cat, index) => {
      catMap.set(cat.id, {
        position: index,
        category: cat,
        expenses: [],
      });
    });

    // Track expenses per category per day for jitter calculation
    const dayExpenseCount = new Map<string, number>();

    // Transform expenses to timeline data points
    const data = expenses
      .map((expense) => {
        const categoryInfo = catMap.get(expense.categoryId);
        if (!categoryInfo) {
          // Shouldn't happen, but fallback
          return null;
        }

        // Extract day from date string (YYYY-MM-DD)
        const day = parseInt(expense.date.split("-")[2]);

        // Add small jitter to prevent perfect overlap of expenses on same day/category
        const dayKey = `${expense.categoryId}-${day}`;
        const count = dayExpenseCount.get(dayKey) || 0;
        dayExpenseCount.set(dayKey, count + 1);

        // Jitter: +/- 0.15 based on count
        const jitter = (count % 3) * 0.15 - 0.15;

        return {
          date: day,
          categoryId: categoryInfo.position + jitter,
          categoryName: categoryInfo.category.name,
          categoryColor: categoryInfo.category.color,
          categoryIcon: categoryInfo.category.icon,
          expenseId: expense.id,
          value: expense.value,
          description: expense.description,
          dateString: expense.date,
        };
      })
      .filter((d): d is TimelineDataPoint => d !== null);

    const validData = data;

    // Calculate chart height based on category count
    const height = Math.max(300, usedCategories.length * 60);

    // Find max value for scale calculation
    const max = Math.max(...expenses.map((e) => e.value), 100);

    return {
      timelineData: validData,
      categoryMap: catMap,
      chartHeight: height,
      maxValue: max,
    };
  }, [expenses, categories]);

  // Calculate total spending
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.value, 0);

  // Create chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    categoryMap.forEach(({ category }) => {
      config[category.name] = {
        label: category.name,
        color: category.color,
      };
    });
    return config;
  }, [categoryMap]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Timeline</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Timeline</CardTitle>
          <CardDescription>No expenses for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">
              No spending data available for this month
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate Y-axis domain
  const categoryCount = categoryMap.size;
  const yDomain = [-0.5, categoryCount - 0.5];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Timeline</CardTitle>
        <CardDescription>
          Total:{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalSpending)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${chartHeight}px` }}>
          <ChartContainer config={chartConfig} className="h-full aspect-auto">
            <ScatterChart
              margin={{ top: 20, right: 60, bottom: 20, left: 150 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="date"
                domain={[1, 31]}
                ticks={[1, 5, 10, 15, 20, 25, 31]}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Day of Month",
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                type="number"
                dataKey="categoryId"
                domain={yDomain}
                tick={<CustomCategoryTick categoryMap={categoryMap} />}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Scatter
                data={timelineData}
                shape={(props: any) => <CustomBubble {...props} maxValue={maxValue} />}
              />
            </ScatterChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
