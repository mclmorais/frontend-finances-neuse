"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
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
import { CategorySummary } from "@/lib/api-schemas";
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
  isLoading?: boolean;
}

export function CategorySpendingChart({
  data,
  isLoading = false,
}: CategorySpendingChartProps) {
  // Sort data by totalValue descending
  const sortedData = [...data].sort((a, b) => b.totalValue - a.totalValue);

  // Calculate total spending
  const totalSpending = sortedData.reduce(
    (sum, item) => sum + item.totalValue,
    0,
  );

  // Prepare chart data with category colors
  const chartData = sortedData.map((item) => ({
    ...item,
    fill: item.categoryColor,
  }));

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

  // Calculate max domain value (soft maximum of 1000)
  const maxValue = Math.max(...sortedData.map((item) => item.totalValue), 1000);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
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
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 40, top: 5, bottom: 5 }}
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

                  const data = payload[0].payload as CategorySummary;
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
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(data.totalValue)}
                          </span>
                        </div>
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
              <Bar dataKey="totalValue" radius={4}>
                <LabelList
                  dataKey="categoryName"
                  position="insideLeft"
                  content={({ x, y, width, height, value, index }) => {
                    const category = chartData[index as number];
                    if (!category) return null;

                    const IconComponent = getIconComponent(
                      category.categoryIcon,
                    );

                    return (
                      <g>
                        <foreignObject
                          x={(x as number) + 8}
                          y={(y as number) + (height as number) / 2 - 12}
                          width={(width as number) - 16}
                          height={24}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center rounded-full w-5 h-5 flex-shrink-0"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              <IconComponent className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-white truncate">
                              {value}
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }}
                />
                <LabelList
                  dataKey="totalValue"
                  position="right"
                  formatter={(value: number) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                  className="fill-foreground text-xs"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
