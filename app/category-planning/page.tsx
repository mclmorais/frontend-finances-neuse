'use client';

import * as React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { AllocationProgress } from '@/components/category-planning/allocation-progress';
import { PlanningChart } from '@/components/category-planning/planning-chart';
import { CategoryPlanningTable } from '@/components/category-planning/category-planning-table';
import {
  useCategoryPlanningAnalysis,
  useCategoryPlanningByMonth,
  useTotalIncome,
  useCreateCategoryPlanning,
  useUpdateCategoryPlanning,
  useCopyFromPreviousMonth,
} from '@/lib/hooks/use-category-planning';
import { toast } from 'sonner';

export default function CategoryPlanningPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());

  // Format month and year for API calls
  const yearStr = selectedYear.toString();
  const monthStr = selectedMonth.toString().padStart(2, '0');

  // Fetch data
  const { data: analysisData = [], isLoading: isLoadingAnalysis } = useCategoryPlanningAnalysis(yearStr, monthStr);
  const { data: planningData = [], isLoading: isLoadingPlanning } = useCategoryPlanningByMonth(yearStr, monthStr);
  const { data: incomeData, isLoading: isLoadingIncome } = useTotalIncome(yearStr, monthStr);

  // Mutations
  const createMutation = useCreateCategoryPlanning();
  const updateMutation = useUpdateCategoryPlanning();
  const copyMutation = useCopyFromPreviousMonth();

  const isLoading = isLoadingAnalysis || isLoadingPlanning || isLoadingIncome;

  // Calculate totals
  const totalIncome = incomeData ? parseFloat(incomeData.totalIncome) : 0;
  const totalAllocated = analysisData
    .filter((item) => item.categoryType === 'expense' && item.plannedValue)
    .reduce((sum, item) => sum + parseFloat(item.plannedValue || '0'), 0);

  const totalSpent = analysisData
    .filter((item) => item.categoryType === 'expense')
    .reduce((sum, item) => sum + parseFloat(item.totalSpent || '0'), 0);

  // Navigation handlers
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getMonthName = (month: number) => {
    const date = new Date(selectedYear, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle value changes from the table
  const handleValueChange = async (categoryId: number, value: string | null) => {
    // Find existing planning for this category
    const existingPlanning = planningData.find((p) => p.categoryId === categoryId);

    if (existingPlanning) {
      // Update existing planning
      await updateMutation.mutateAsync({
        id: existingPlanning.id,
        data: { value: value ?? undefined },
      });
    } else {
      // Create new planning
      await createMutation.mutateAsync({
        categoryId,
        month: selectedMonth,
        year: selectedYear,
        value: value || undefined,
      });
    }
  };

  // Handle copy from previous month
  const handleCopyFromPrevious = async () => {
    try {
      await copyMutation.mutateAsync({
        targetYear: selectedYear,
        targetMonth: selectedMonth,
      });
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Failed to copy from previous month:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Validation: check if all values are >= 0
  const hasNegativeValues = analysisData.some((item) => {
    if (!item.plannedValue) return false;
    return parseFloat(item.plannedValue) < 0;
  });

  const canSubmit = !hasNegativeValues;

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Category Planning</h1>
              <p className="text-muted-foreground mt-2">
                Allocate your income across expense categories
              </p>
            </div>
            <Button onClick={handleCopyFromPrevious} disabled={copyMutation.isPending}>
              <Copy className="mr-2 size-4" />
              {copyMutation.isPending ? 'Copying...' : 'Copy from Previous'}
            </Button>
          </div>

          {/* Month Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">{getMonthName(selectedMonth)}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a month to plan your budget
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-10 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <Calculator className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available for allocation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                    <Calculator className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Planned spending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actual Spent</CardTitle>
                    <Calculator className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current spending
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Allocation Progress */}
              <AllocationProgress
                totalIncome={totalIncome}
                totalAllocated={totalAllocated}
              />

              {/* Planning Table */}
              <CategoryPlanningTable
                data={analysisData}
                totalIncome={totalIncome}
                onValueChange={handleValueChange}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />

              {/* Validation Message */}
              {!canSubmit && (
                <Card className="border-red-500 bg-red-50 dark:bg-red-950/10">
                  <CardContent className="pt-6">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ Some categories have negative planned values. Please ensure all values are greater than or equal to zero.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Comparison Chart */}
              <PlanningChart data={analysisData} />
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
