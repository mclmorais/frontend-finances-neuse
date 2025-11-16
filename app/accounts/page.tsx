'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, CreditCard, Landmark, PiggyBank } from 'lucide-react';

export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
              <p className="text-muted-foreground mt-2">
                Manage your financial accounts and balances
              </p>
            </div>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Account
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Landmark className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Bank Accounts</CardTitle>
                    <CardDescription className="text-xs">Checking & Savings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">0 accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <CreditCard className="size-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Credit Cards</CardTitle>
                    <CardDescription className="text-xs">Credit accounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">0 accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                    <PiggyBank className="size-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Investments</CardTitle>
                    <CardDescription className="text-xs">Investment accounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">0 accounts</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="size-5" />
                <div>
                  <CardTitle>Total Net Worth</CardTitle>
                  <CardDescription>Combined balance across all accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">$0.00</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first account to start tracking your net worth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Tips for managing your accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Track all your financial accounts in one place. Here are some tips:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Add all your bank accounts, credit cards, and investments</li>
                <li>Keep your balances updated for accurate net worth tracking</li>
                <li>Set up regular reminders to reconcile your accounts</li>
                <li>Consider adding cash accounts if you track physical money</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
