"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatMonthYear } from "@/lib/date-format";
import { useLocale } from "next-intl";

interface IncomeSummaryCardProps {
  totalIncome: number;
  incomeCount: number;
  isLoading?: boolean;
  selectedMonth: Date;
}

export function IncomeSummaryCard({
  totalIncome,
  incomeCount,
  isLoading = false,
  selectedMonth,
}: IncomeSummaryCardProps) {
  const locale = useLocale() as "en" | "pt";
  const formattedTotal = formatCurrency({ locale, value: totalIncome });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10">
            <TrendingUp className="size-6 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {locale === "pt" ? "Receita Mensal" : "Monthly Income"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatMonthYear(selectedMonth, locale)}
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
          <div className="space-y-2">
            <p className="text-3xl font-bold text-green-600">{formattedTotal}</p>
            <p className="text-sm text-muted-foreground">
              {incomeCount} {incomeCount === 1 
                ? (locale === "pt" ? "transação" : "transaction") 
                : (locale === "pt" ? "transações" : "transactions")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
