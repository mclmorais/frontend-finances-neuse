'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Plus, Calendar, DollarSign } from 'lucide-react';

export default function IncomesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Incomes</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage your income sources
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Income
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Calendar className="size-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">This Month</CardTitle>
                    <CardDescription className="text-xs">Total income</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">0 transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Last Month</CardTitle>
                    <CardDescription className="text-xs">Previous period</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">0 transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10">
                    <DollarSign className="size-5 text-teal-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Average/Month</CardTitle>
                    <CardDescription className="text-xs">Last 6 months</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">No data yet</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Income</CardTitle>
              <CardDescription>Your latest income transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                  <TrendingUp className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No income recorded yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click &quot;Add Income&quot; to record your first transaction
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Tips for tracking income</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tracking your income helps you understand your financial capacity. Here are some tips:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Record all income sources including salary, freelance, and passive income</li>
                <li>Categorize income by source to understand your revenue streams</li>
                <li>Track irregular income to better plan for variable months</li>
                <li>Compare income vs expenses to monitor your savings rate</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
