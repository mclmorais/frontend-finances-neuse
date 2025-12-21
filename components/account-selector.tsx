"use client";

import React from "react";
import { Account } from "@/lib/api-schemas";
import { Card, CardContent } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: number | null;
  onSelectAccount: (accountId: number) => void;
  incomesByAccount: Map<number, number>;
  budgetsByAccount: Map<number, number>;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onSelectAccount,
  incomesByAccount,
  budgetsByAccount,
}: AccountSelectorProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Left scroll button */}
      {accounts.length > 3 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollLeft}
          className="shrink-0 h-8 w-8 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Scrollable accounts container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-4 p-2">
          {accounts.map((account) => {
            const IconComponent = LucideIcons[account.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
            const income = incomesByAccount.get(account.id) || 0;
            const budgeted = budgetsByAccount.get(account.id) || 0;
            const available = income - budgeted;
            const percentage = income > 0 ? (budgeted / income) * 100 : 0;
            const isSelected = selectedAccountId === account.id;

            return (
              <Card
                key={account.id}
                className={`shrink-0 w-48 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:border-primary/50"
                }`}
                onClick={() => onSelectAccount(account.id)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Account Icon and Name */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: `${account.color}20`, color: account.color }}
                    >
                      {IconComponent && (
                        <IconComponent
                          className="size-5"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {account.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Income: {formatCurrency(income)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Available</span>
                      <span className={available < 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                        {formatCurrency(available)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: percentage > 100 ? "#ef4444" : account.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Allocated: {formatCurrency(budgeted)}</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Right scroll button */}
      {accounts.length > 3 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollRight}
          className="shrink-0 h-8 w-8 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
