'use client';

import * as React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { AccountCard } from '@/components/account/account-card';
import { AccountFormDialog } from '@/components/account/account-form-dialog';
import { DeleteAccountDialog } from '@/components/account/delete-account-dialog';
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '@/lib/hooks/use-accounts';
import type { Account, CreateAccountRequest } from '@/lib/types/account';

export default function AccountsPage() {
  // UI state (not data fetching state)
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | undefined>(undefined);
  const [deletingAccount, setDeletingAccount] = React.useState<Account | null>(null);

  // TanStack Query hooks
  const { data: accounts = [], isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const handleCreate = () => {
    setEditingAccount(undefined);
    setFormOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleDelete = (account: Account) => {
    setDeletingAccount(account);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: CreateAccountRequest) => {
    if (editingAccount) {
      // Update existing account
      await updateMutation.mutateAsync({ id: editingAccount.id, data });
    } else {
      // Create new account
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingAccount(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;

    await deleteMutation.mutateAsync(deletingAccount.id);
    setDeleteOpen(false);
    setDeletingAccount(null);
  };

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
            <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Add Account
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Accounts Grid */}
              {accounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Wallet className="size-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No accounts yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click &quot;Add Account&quot; to create your first account
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Summary Card */}
              {accounts.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Wallet className="size-5" />
                      <div>
                        <CardTitle>Summary</CardTitle>
                        <CardDescription>{accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} total</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">Total Balance: $0.00</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Balance tracking coming soon
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tips Section */}
              {accounts.length === 0 && (
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
              )}
            </>
          )}
        </div>

        {/* Form Dialog */}
        <AccountFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          account={editingAccount}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteAccountDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
          account={deletingAccount}
          isLoading={deleteMutation.isPending}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
