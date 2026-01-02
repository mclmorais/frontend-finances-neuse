"use client";

import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { SavingsCategoryChart } from "@/components/savings-category-chart";
import { monthlySavingsSchema } from "@/lib/api-schemas";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function SavingsPage() {
  const t = useTranslations("savings");
  const tCommon = useTranslations("common");

  const {
    data: monthlySavings = [],
    isLoading: savingsLoading,
    error: savingsError,
  } = useQuery({
    queryKey: ["expenses", "monthly-savings", "savings"],
    queryFn: async () => {
      const result = await apiClient.get(
        `/expenses/monthly-savings?categoryType=savings`,
        monthlySavingsSchema,
      );
      return result;
    },
  });

  // Handle errors with toast notification
  useEffect(() => {
    if (savingsError) {
      console.error("Error loading savings data:", savingsError);
      toast.error(tCommon("error"), {
        description: t("errorLoading"),
      });
    }
  }, [savingsError, tCommon, t]);

  // Filter to only savings categories (should already be filtered by API, but double-check)
  const savingsData = monthlySavings.filter(
    (item) => item.categoryType === "saving"
  );

  // Group data by category to get unique categories
  const categories = useMemo(() => {
    const categoryMap = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        categoryIcon: string;
        categoryColor: string;
      }
    >();

    savingsData.forEach((item) => {
      if (!categoryMap.has(item.categoryId)) {
        categoryMap.set(item.categoryId, {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          categoryIcon: item.categoryIcon,
          categoryColor: item.categoryColor,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [savingsData]);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("description")}
            </p>
          </div>

          {savingsError && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">
                  {t("errorLoading")}: {savingsError instanceof Error ? savingsError.message : String(savingsError)}
                </p>
              </CardContent>
            </Card>
          )}

          {savingsLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t("loadingSavings")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!savingsLoading && !savingsError && categories.length > 0 && (
            <div className="grid gap-6 grid-cols-1">
              {categories.map((category) => (
                <SavingsCategoryChart
                  key={category.categoryId}
                  categoryId={category.categoryId}
                  categoryName={category.categoryName}
                  categoryIcon={category.categoryIcon}
                  categoryColor={category.categoryColor}
                  data={savingsData}
                  isLoading={savingsLoading}
                />
              ))}
            </div>
          )}

          {!savingsLoading && !savingsError && categories.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("noSavingsData")}</CardTitle>
                <CardDescription>
                  {t("noSavingsDataDescription")}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

