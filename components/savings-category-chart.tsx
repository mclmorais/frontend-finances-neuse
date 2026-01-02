"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartConfig } from "./ui/chart";
import { MonthlySavingsItem } from "@/lib/api-schemas";
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatMonthYear } from "@/lib/date-format";
import { ICONS } from "@/lib/icons";

interface SavingsCategoryChartProps {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  data: MonthlySavingsItem[];
  isLoading?: boolean;
}

export function SavingsCategoryChart({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  data,
  isLoading = false,
}: SavingsCategoryChartProps) {
  const t = useTranslations("savings");
  const locale = useLocale() as "en" | "pt";

  // Filter and transform data for this specific category
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter to this category only
    const categoryData = data.filter((item) => item.categoryId === categoryId);

    if (categoryData.length === 0) return [];

    // Sort by year and month
    const sortedData = [...categoryData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Transform to chart format
    const transformed = sortedData.map((item) => {
      const monthDate = new Date(item.year, item.month - 1);
      const monthLabel = formatMonthYear(monthDate, locale);

      return {
        month: monthLabel,
        monthKey: `${item.year}-${String(item.month).padStart(2, "0")}`,
        monthlyDeposit: item.totalValue,
        accumulatedValue: item.accumulatedValue,
      };
    });

    return transformed;
  }, [data, categoryId, locale, categoryName]);

  // Build chart config
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      monthlyDeposit: {
        label: t("monthlyDeposits"),
        color: categoryColor,
      },
      accumulatedValue: {
        label: t("accumulatedSavings"),
        color: categoryColor,
      },
    };
    return config;
  }, [categoryColor, t]);

  // Find icon component
  const IconComponent = ICONS.find((icon) => icon.name === categoryIcon)?.component;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {IconComponent && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: categoryColor }}
              >
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            )}
            {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">{t("loadingSavings")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {IconComponent && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: categoryColor }}
              >
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            )}
            {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">{t("noSavingsData")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {IconComponent && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: categoryColor }}
            >
              <IconComponent className="h-4 w-4 text-white" />
            </div>
          )}
          {categoryName}
        </CardTitle>
        <CardDescription>
          {t("categorySavingsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "400px" }}>
          <ChartContainer config={chartConfig} className="h-full">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium">{payload[0].payload.month}</div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">
                              {entry.name}: ${(entry.value as number).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar
                dataKey="monthlyDeposit"
                fill={categoryColor}
                name={t("monthlyDeposits")}
              />
              <Line
                type="stepAfter"
                dataKey="accumulatedValue"
                stroke={categoryColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={t("accumulatedSavings")}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

