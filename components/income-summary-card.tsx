"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";

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
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalIncome);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10">
            <TrendingUp className="size-6 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Monthly Income</CardTitle>
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
          <div className="space-y-2">
            <p className="text-3xl font-bold text-green-600">{formattedTotal}</p>
            <p className="text-sm text-muted-foreground">
              {incomeCount} {incomeCount === 1 ? "transaction" : "transactions"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
