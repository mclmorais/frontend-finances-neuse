'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Percent, DollarSign } from 'lucide-react';
import type { CategoryPlanningAnalysis } from '@/lib/types/category-planning';
import { cn } from '@/lib/utils';

interface CategoryPlanningTableProps {
  data: CategoryPlanningAnalysis[];
  totalIncome: number;
  onValueChange: (categoryId: number, value: string | null) => void;
  selectedMonth: number;
  selectedYear: number;
}

export function CategoryPlanningTable({
  data,
  totalIncome,
  onValueChange,
  selectedMonth,
  selectedYear,
}: CategoryPlanningTableProps) {
  const [inputMode, setInputMode] = React.useState<'currency' | 'percentage'>('currency');
  const [editingValues, setEditingValues] = React.useState<Record<number, string>>({});

  // Filter to only show expense categories
  const expenseCategories = React.useMemo(
    () => data.filter((item) => item.categoryType === 'expense'),
    [data]
  );

  const formatCurrency = (value: string | null) => {
    if (!value) return 'R$ 0,00';
    const numValue = parseFloat(value);
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  const calculatePercentage = (value: string | null) => {
    if (!value || totalIncome === 0) return '0.0%';
    const numValue = parseFloat(value);
    const percentage = (numValue / totalIncome) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const getStatusColor = (planned: string | null, actual: string) => {
    if (!planned) return 'text-muted-foreground';

    const plannedValue = parseFloat(planned);
    const actualValue = parseFloat(actual);

    if (actualValue > plannedValue) return 'text-red-600 dark:text-red-400'; // Over budget
    if (actualValue >= plannedValue * 0.9) return 'text-yellow-600 dark:text-yellow-400'; // Near budget
    return 'text-green-600 dark:text-green-400'; // Under budget
  };

  const getStatusIcon = (planned: string | null, actual: string) => {
    if (!planned) return '-';

    const plannedValue = parseFloat(planned);
    const actualValue = parseFloat(actual);

    if (actualValue > plannedValue) return '⚠️';
    if (actualValue >= plannedValue * 0.9) return '⚡';
    return '✅';
  };

  const handleInputChange = (categoryId: number, inputValue: string) => {
    setEditingValues((prev) => ({ ...prev, [categoryId]: inputValue }));
  };

  const handleInputBlur = (categoryId: number) => {
    const inputValue = editingValues[categoryId];
    if (inputValue === undefined) return;

    let finalValue: string | null = null;

    if (inputValue.trim() === '') {
      // Empty input means removing the planning
      finalValue = null;
    } else if (inputMode === 'percentage') {
      // Convert percentage to currency value
      const percentValue = parseFloat(inputValue.replace('%', '').replace(',', '.'));
      if (!isNaN(percentValue) && totalIncome > 0) {
        finalValue = ((totalIncome * percentValue) / 100).toFixed(2);
      }
    } else {
      // Currency mode
      const currencyValue = parseFloat(inputValue.replace('R$', '').replace(',', '.').trim());
      if (!isNaN(currencyValue) && currencyValue >= 0) {
        finalValue = currencyValue.toFixed(2);
      }
    }

    // Clear the editing value
    setEditingValues((prev) => {
      const newValues = { ...prev };
      delete newValues[categoryId];
      return newValues;
    });

    // Call the onChange handler
    if (finalValue !== null || inputValue.trim() === '') {
      onValueChange(categoryId, finalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, categoryId: number) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[categoryId];
        return newValues;
      });
      e.currentTarget.blur();
    }
  };

  const getInputValue = (item: CategoryPlanningAnalysis) => {
    // If we're editing this category, use the editing value
    if (editingValues[item.categoryId] !== undefined) {
      return editingValues[item.categoryId];
    }

    // Otherwise, format the planned value based on input mode
    if (!item.plannedValue) return '';

    if (inputMode === 'percentage' && totalIncome > 0) {
      const percentage = (parseFloat(item.plannedValue) / totalIncome) * 100;
      return percentage.toFixed(1);
    }

    return parseFloat(item.plannedValue).toFixed(2);
  };

  if (expenseCategories.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <p>No expense categories found. Create categories first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Category Budget Allocation</h3>
        <div className="flex gap-2">
          <Button
            variant={inputMode === 'currency' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('currency')}
          >
            <DollarSign className="size-4 mr-1" />
            Currency
          </Button>
          <Button
            variant={inputMode === 'percentage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('percentage')}
          >
            <Percent className="size-4 mr-1" />
            Percentage
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">% of Income</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseCategories.map((item) => (
              <TableRow key={item.categoryId}>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${item.categoryColor}20`,
                      borderColor: item.categoryColor,
                      color: item.categoryColor,
                    }}
                  >
                    {item.categoryIcon && <span className="mr-1">{item.categoryIcon}</span>}
                    {item.categoryName}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {inputMode === 'currency' && <span className="text-xs text-muted-foreground">R$</span>}
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={getInputValue(item)}
                      onChange={(e) => handleInputChange(item.categoryId, e.target.value)}
                      onBlur={() => handleInputBlur(item.categoryId)}
                      onKeyDown={(e) => handleKeyDown(e, item.categoryId)}
                      className="h-8 w-24 text-right"
                      placeholder={inputMode === 'currency' ? '0.00' : '0.0'}
                    />
                    {inputMode === 'percentage' && <span className="text-xs text-muted-foreground">%</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {calculatePercentage(item.plannedValue)}
                </TableCell>
                <TableCell className={cn('text-right font-medium', getStatusColor(item.plannedValue, item.totalSpent))}>
                  {formatCurrency(item.totalSpent)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-lg">
                    {getStatusIcon(item.plannedValue, item.totalSpent)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>💡 Tip: Enter a value and press Enter to save, or Escape to cancel.</p>
        <p>Status: ✅ Under budget | ⚡ Near budget (90%+) | ⚠️ Over budget</p>
      </div>
    </div>
  );
}
