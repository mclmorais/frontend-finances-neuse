"use client";

import React from "react";
import { Account } from "@/lib/api-schemas";
import * as LucideIcons from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FloatingAccountSelectorProps {
  accounts: Account[];
  selectedAccountId: number | null;
  onSelectAccount: (accountId: number) => void;
  remainingValue: number;
  isVisible: boolean;
}

export function FloatingAccountSelector({
  accounts,
  selectedAccountId,
  onSelectAccount,
  remainingValue,
  isVisible,
}: FloatingAccountSelectorProps) {
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (accounts.length === 0 || !selectedAccount) {
    return null;
  }

  const IconComponent = LucideIcons[
    selectedAccount.icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  return (
    <div
      className={cn(
        "fixed top-14 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2.5 rounded-b-md border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 py-1.5 shadow-sm">
            {/* Selected Account Display */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="flex size-6 items-center justify-center rounded-md shrink-0"
                style={{
                  backgroundColor: `${selectedAccount.color}20`,
                  color: selectedAccount.color,
                }}
              >
                {IconComponent && <IconComponent className="size-3.5" />}
              </div>
              <p className="text-xs font-medium whitespace-nowrap">
                {selectedAccount.name}
              </p>
            </div>

            {/* Remaining Value */}
            <div className="flex items-center shrink-0 border-l pl-2.5 ml-0.5">
              <p
                className={cn(
                  "text-xs font-semibold whitespace-nowrap",
                  remainingValue < 0 ? "text-red-500" : "text-green-600"
                )}
              >
                {formatCurrency(remainingValue)}
              </p>
            </div>

            {/* Account Selector Dropdown */}
            <div className="shrink-0 border-l pl-2.5 ml-0.5">
              <Select
                value={selectedAccountId?.toString() || ""}
                onValueChange={(value) => onSelectAccount(Number(value))}
              >
                <SelectTrigger size="sm" className="w-[100px] h-7 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => {
                    const AccountIcon = LucideIcons[
                      account.icon as keyof typeof LucideIcons
                    ] as React.ComponentType<{ className?: string }>;
                    return (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex size-4 items-center justify-center rounded shrink-0"
                            style={{
                              backgroundColor: `${account.color}20`,
                              color: account.color,
                            }}
                          >
                            {AccountIcon && <AccountIcon className="size-3" />}
                          </div>
                          <span className="truncate">{account.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

