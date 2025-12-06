"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AccountFormModal } from "@/components/account-form-modal";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import {
  accountsSchema,
  emptyResponseSchema,
  Account,
} from "@/lib/api-schemas";

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const queryClient = useQueryClient();

  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return apiClient.get("/accounts", accountsSchema);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return apiClient.delete(`/accounts/${accountId}`, emptyResponseSchema);
    },
    onSuccess: (deletedAccount) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(`Account "${deletedAccount.name}" deleted successfully`);
      setAccountToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });

  // Ensure accounts is always an array
  const accountsList = Array.isArray(accounts) ? accounts : [];

  const renderAccountList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (accountsList.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4">
          No accounts yet. Click &quot;Add New Account&quot; to create one.
        </p>
      );
    }

    return (
      <div className="grid gap-2">
        {accountsList.map((account) => {
          const IconComponent =
            (
              LucideIcons as unknown as Record<
                string,
                React.ComponentType<{ className?: string }>
              >
            )[account.icon] || LucideIcons.Circle;
          return (
            <div
              key={account.id}
              className="group flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div
                className="flex size-10 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: account.color }}
              >
                <IconComponent className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{account.name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setAccountToEdit(account)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setAccountToDelete(account)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
              <p className="text-muted-foreground mt-2">
                Manage your financial accounts
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add New Account
            </Button>
          </div>

          <AccountFormModal
            mode="create"
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />

          <AccountFormModal
            mode="edit"
            account={accountToEdit}
            open={!!accountToEdit}
            onOpenChange={(open) => !open && setAccountToEdit(null)}
          />

          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">
                  Error loading accounts: {(error as Error).message}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Accounts</CardTitle>
              <CardDescription>
                All your financial accounts in one place
              </CardDescription>
            </CardHeader>
            <CardContent>{renderAccountList()}</CardContent>
          </Card>
        </div>

        <AlertDialog
          open={!!accountToDelete}
          onOpenChange={(open) => !open && setAccountToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the account{" "}
                <strong className="text-foreground">
                  &ldquo;{accountToDelete?.name}&rdquo;
                </strong>
                ?
                <br />
                <br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  accountToDelete && deleteMutation.mutate(accountToDelete.id)
                }
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    </ProtectedRoute>
  );
}
