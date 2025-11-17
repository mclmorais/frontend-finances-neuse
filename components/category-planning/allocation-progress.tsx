import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AllocationProgressProps {
  totalIncome: number;
  totalAllocated: number;
}

export function AllocationProgress({ totalIncome, totalAllocated }: AllocationProgressProps) {
  const remaining = totalIncome - totalAllocated;
  const percentage = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;

  // Determine color based on allocation status
  const getStatusColor = () => {
    if (percentage > 100) return 'text-red-600 dark:text-red-400'; // Over budget
    if (percentage >= 95) return 'text-green-600 dark:text-green-400'; // Nearly fully allocated
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400'; // Partially allocated
    return 'text-blue-600 dark:text-blue-400'; // Under allocated
  };

  const getProgressColor = () => {
    if (percentage > 100) return 'bg-red-600'; // Over budget
    if (percentage >= 95) return 'bg-green-600'; // Nearly fully allocated
    if (percentage >= 75) return 'bg-yellow-600'; // Partially allocated
    return 'bg-blue-600'; // Under allocated
  };

  const getStatusMessage = () => {
    if (percentage > 100) return '⚠️ Over budget!';
    if (percentage >= 100) return '✅ Fully allocated!';
    if (percentage >= 95) return '✨ Almost there!';
    return '💡 Continue allocating';
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation</CardTitle>
        <CardDescription>
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Income</span>
            <span className="font-semibold">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Allocated</span>
            <span className="font-semibold">{formatCurrency(totalAllocated)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className={getStatusColor()}>
              {remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </span>
            <span className={getStatusColor()}>
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={Math.min(percentage, 100)}
            className="h-3"
            indicatorClassName={getProgressColor()}
          />
          <p className="text-xs text-center text-muted-foreground">
            {percentage.toFixed(1)}% of budget allocated
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
