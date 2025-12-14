"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Cell,
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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CategorySummary, Budget } from "@/lib/api-schemas";
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

interface CategorySpendingChartProps {
  data: CategorySummary[];
  budgets?: Budget[];
  isLoading?: boolean;
}

interface EnrichedCategoryData extends CategorySummary {
  fill: string;
  spent: number;
  remaining: number;
  overBudget: number;
  budget: number;
  hasBudget: boolean;
  utilization: number;
  labelHelper: number;
}

export function CategorySpendingChart({
  data,
  budgets = [],
  isLoading = false,
}: CategorySpendingChartProps) {
  // Sort data by totalValue descending
  const sortedData = [...data].sort((a, b) => b.totalValue - a.totalValue);

  // Calculate total spending
  const totalSpending = sortedData.reduce(
    (sum, item) => sum + item.totalValue,
    0,
  );

  // Enrich data with budget information
  const chartData: EnrichedCategoryData[] = sortedData.map((item) => {
    // Sum all budgets for this category across accounts
    const categoryBudget = budgets
      .filter((b) => b.categoryId === item.categoryId)
      .reduce((sum, b) => sum + b.value, 0);

    const spent = item.totalValue;
    const hasBudget = categoryBudget > 0;

    // Calculate components for stacked bar
    const withinBudget = hasBudget ? Math.min(spent, categoryBudget) : spent;
    const remaining = hasBudget ? Math.max(0, categoryBudget - spent) : 0;
    const overBudget = hasBudget ? Math.max(0, spent - categoryBudget) : 0;

    return {
      ...item,
      fill: item.categoryColor,
      spent: withinBudget,
      remaining,
      overBudget,
      budget: categoryBudget,
      hasBudget,
      utilization: hasBudget ? (spent / categoryBudget) * 100 : 0,
      // Add a dummy field for labels that always has a tiny value
      labelHelper: 0.01,
    };
  });

  // Create chart config
  const chartConfig: ChartConfig = sortedData.reduce((config, item) => {
    config[item.categoryName] = {
      label: item.categoryName,
      color: item.categoryColor,
    };
    return config;
  }, {} as ChartConfig);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
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

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
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

  // Calculate dynamic height based on number of categories
  const chartHeight = Math.max(150, sortedData.length * 40 + 40);

  // Calculate max domain value accounting for budgets
  const maxValue = Math.max(
    ...chartData.map((item) =>
      Math.max(item.totalValue, item.budget)
    ),
    1000,
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Total: {formatCurrency(totalSpending)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${chartHeight}px` }}>
          <ChartContainer config={chartConfig} className="h-full aspect-auto">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 150, right: 100, top: 5, bottom: 5 }}
              barSize={32}
              barGap={4}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="categoryName"
                type="category"
                tickLine={false}
                axisLine={false}
                width={0}
                hide
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                domain={[0, maxValue]}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;

                  const data = payload[0].payload as EnrichedCategoryData;
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
                        <span className="font-semibold">
                          {data.categoryName}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Spent:</span>
                          <span className="font-medium">
                            {formatCurrency(data.totalValue)}
                          </span>
                        </div>
                        {data.hasBudget && (
                          <>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Budget:</span>
                              <span className="font-medium">
                                {formatCurrency(data.budget)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">
                                {data.overBudget > 0 ? "Over:" : "Remaining:"}
                              </span>
                              <span
                                className={`font-medium ${
                                  data.overBudget > 0
                                    ? "text-red-500"
                                    : "text-green-600"
                                }`}
                              >
                                {formatCurrency(
                                  data.overBudget > 0 ? data.overBudget : data.remaining
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Used:</span>
                              <span className="font-medium">
                                {Math.round(data.utilization)}%
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">
                            Expenses:
                          </span>
                          <span className="font-medium">
                            {data.expenseCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Spent bar (bright color) */}
              <Bar
                dataKey="spent"
                stackId="a"
                radius={[0, 0, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`spent-${index}`}
                    fill={entry.categoryColor}
                  />
                ))}
              </Bar>

              {/* Remaining budget bar (light/outline) */}
              <Bar
                dataKey="remaining"
                stackId="a"
                radius={[0, 0, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`remaining-${index}`}
                    fill={`${entry.categoryColor}20`}
                    stroke={entry.categoryColor}
                    strokeWidth={entry.hasBudget && entry.remaining > 0 ? 1 : 0}
                  />
                ))}
              </Bar>

              {/* Over-budget bar (red) */}
              <Bar
                dataKey="overBudget"
                stackId="a"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`over-${index}`}
                    fill="#ef4444"
                  />
                ))}
              </Bar>

              {/* Invisible helper bar for labels - always renders */}
              <Bar
                dataKey="labelHelper"
                stackId="a"
                fill="transparent"
              >
                {/* Category name labels */}
                <LabelList
                  dataKey="categoryName"
                  content={({ y, height, value, index }) => {
                    const category = chartData[index as number];
                    if (!category) return null;

                    const IconComponent = getIconComponent(
                      category.categoryIcon,
                    );

                    return (
                      <g>
                        <foreignObject
                          x={0}
                          y={(y as number) + (height as number) / 2 - 12}
                          width={140}
                          height={24}
                        >
                          <div className="flex items-center gap-2 justify-end">
                            <div
                              className="flex items-center justify-center rounded-full w-5 h-5 flex-shrink-0"
                              style={{
                                backgroundColor: category.categoryColor,
                              }}
                            >
                              <IconComponent className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">
                              {value}
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }}
                />
                {/* Value labels */}
                <LabelList
                  position="right"
                  content={({ y, height, index }) => {
                    const category = chartData[index as number];
                    if (!category) return null;

                    const yPos = (y as number) + (height as number) / 2;

                    // Calculate the x position based on the total width of all stacked bars
                    const totalWidth = category.spent + category.remaining + category.overBudget;
                    const xPos = totalWidth + 5;

                    if (category.hasBudget) {
                      // Show: "$500 / $800 (62%)"
                      const percentage = Math.round(category.utilization);
                      const color =
                        category.overBudget > 0
                          ? "#ef4444"
                          : percentage >= 90
                          ? "#eab308"
                          : "#22c55e";

                      return (
                        <text
                          x={xPos}
                          y={yPos}
                          fill={color}
                          className="text-xs font-medium"
                          dominantBaseline="middle"
                        >
                          {formatCurrency(category.totalValue)} /{" "}
                          {formatCurrency(category.budget)} ({percentage}%)
                        </text>
                      );
                    } else {
                      // Show: "$500"
                      return (
                        <text
                          x={xPos}
                          y={yPos}
                          className="fill-foreground text-xs"
                          dominantBaseline="middle"
                        >
                          {formatCurrency(category.totalValue)}
                        </text>
                      );
                    }
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
