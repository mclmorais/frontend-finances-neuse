"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, X } from "lucide-react";
import { Category, Account } from "@/lib/types";
import { parseExpenseInput, ParsedExpense } from "@/lib/nlp-expense-parser";
import { apiClient } from "@/lib/api-client";
import { expenseSchema as expenseResponseSchema } from "@/lib/api-schemas";
import { toast } from "sonner";
import { format } from "date-fns";
import * as LucideIcons from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet: LucideIcons.Wallet,
  ShoppingCart: LucideIcons.ShoppingCart,
  Home: LucideIcons.Home,
  Car: LucideIcons.Car,
  Coffee: LucideIcons.Coffee,
  Utensils: LucideIcons.Utensils,
  Plane: LucideIcons.Plane,
  Heart: LucideIcons.Heart,
  Shirt: LucideIcons.Shirt,
  Gamepad2: LucideIcons.Gamepad2,
  GraduationCap: LucideIcons.GraduationCap,
  Stethoscope: LucideIcons.Stethoscope,
  DollarSign: LucideIcons.DollarSign,
  Gift: LucideIcons.Gift,
  Music: LucideIcons.Music,
  Film: LucideIcons.Film,
  Dumbbell: LucideIcons.Dumbbell,
  PiggyBank: LucideIcons.PiggyBank,
  TrendingUp: LucideIcons.TrendingUp,
  CreditCard: LucideIcons.CreditCard,
};

const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName] || LucideIcons.Wallet;
};

interface NaturalExpenseInputProps {
  categories: Category[];
  accounts: Account[];
}

export function NaturalExpenseInput({
  categories,
  accounts,
}: NaturalExpenseInputProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedExpense | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: {
      accountId: number;
      categoryId: number;
      date: string;
      value: string;
      description: string;
    }) => {
      return apiClient.post("/expenses", expenseResponseSchema, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense created successfully");
      handleClear();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create expense: ${error.message}`);
    },
  });

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      const result = parseExpenseInput(value, categories, accounts);
      setParsed(result);
    } else {
      setParsed(null);
    }
  };

  const handleClear = () => {
    setInput("");
    setParsed(null);
  };

  const handleSubmit = () => {
    if (!parsed) return;

    const { amount, date, categoryId, accountId, description } = parsed;

    if (!amount || !date || !categoryId || !accountId) {
      toast.error("Please provide all required fields: amount, category, and account");
      return;
    }

    createMutation.mutate({
      accountId,
      categoryId,
      date,
      value: amount.toString(),
      description: description || "",
    });
  };

  const canSubmit =
    parsed &&
    parsed.amount !== null &&
    parsed.categoryId !== null &&
    parsed.accountId !== null;

  const category = categories.find((c) => c.id === parsed?.categoryId);
  const account = accounts.find((a) => a.id === parsed?.accountId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Quick Add with Natural Language
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder='Try: "Lunch yesterday Alimentação Crédito 25"'
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  handleSubmit();
                }
              }}
              className="pr-10"
            />
            {input && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </div>

        {parsed && input && (
          <div className="flex flex-wrap gap-2">
            {parsed.description && (
              <Badge variant="secondary">
                <span className="text-xs">Description:</span>
                <span className="ml-1 font-medium">{parsed.description}</span>
              </Badge>
            )}

            {parsed.amount !== null && (
              <Badge variant="secondary">
                <span className="text-xs">Amount:</span>
                <span className="ml-1 font-medium">
                  ${parsed.amount.toFixed(2)}
                </span>
              </Badge>
            )}

            {parsed.date && (
              <Badge variant="secondary">
                <span className="text-xs">Date:</span>
                <span className="ml-1 font-medium">
                  {format(new Date(parsed.date), "MMM dd, yyyy")}
                </span>
              </Badge>
            )}

            {category && (
              <Badge
                variant="secondary"
                className="gap-1.5"
                style={{ backgroundColor: category.color, color: "white" }}
              >
                {(() => {
                  const IconComponent = getIconComponent(category.icon);
                  return <IconComponent className="w-3 h-3" />;
                })()}
                <span className="font-medium">{category.name}</span>
              </Badge>
            )}

            {account && (
              <Badge
                variant="secondary"
                className="gap-1.5"
                style={{ backgroundColor: account.color, color: "white" }}
              >
                {(() => {
                  const IconComponent = getIconComponent(account.icon);
                  return <IconComponent className="w-3 h-3" />;
                })()}
                <span className="font-medium">{account.name}</span>
              </Badge>
            )}

            {!category && parsed.categoryId === null && (
              <Badge variant="destructive">
                <span className="text-xs">Category not found</span>
              </Badge>
            )}

            {!account && parsed.accountId === null && (
              <Badge variant="destructive">
                <span className="text-xs">Account not found</span>
              </Badge>
            )}

            {parsed.amount === null && (
              <Badge variant="destructive">
                <span className="text-xs">Amount not found</span>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
