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
import { parse as dateParse } from "date-fns";
import * as LucideIcons from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/currency";
import { formatDateShort } from "@/lib/date-format";

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
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "en" | "pt";

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
      queryClient.invalidateQueries({ queryKey: ["reports", "monthly-comparison"] });
      toast.success(t("createSuccess"));
      handleClear();
    },
    onError: (error: Error) => {
      toast.error(`${t("createError")} ${error.message}`);
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
      toast.error(t("requiredFields"));
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
          {t("quickAdd")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder={t("quickAddPlaceholder")}
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
            {createMutation.isPending ? t("adding") : tCommon("add")}
          </Button>
        </div>

        {parsed && input && (
          <div className="flex flex-wrap gap-2">
            {parsed.description && (
              <Badge variant="secondary">
                <span className="text-xs">{t("descriptionLabel")}</span>
                <span className="ml-1 font-medium">{parsed.description}</span>
              </Badge>
            )}

            {parsed.amount !== null && (
              <Badge variant="secondary">
                <span className="text-xs">{t("amountLabel")}</span>
                <span className="ml-1 font-medium">
                  {formatCurrency({ locale, value: parsed.amount })}
                </span>
              </Badge>
            )}

            {parsed.date && (
              <Badge variant="secondary">
                <span className="text-xs">{t("dateLabel")}</span>
                <span className="ml-1 font-medium">
                  {formatDateShort(
                    dateParse(parsed.date, "yyyy-MM-dd", new Date()),
                    locale,
                  )}
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
                <span className="text-xs">{t("categoryNotFound")}</span>
              </Badge>
            )}

            {!account && parsed.accountId === null && (
              <Badge variant="destructive">
                <span className="text-xs">{t("accountNotFound")}</span>
              </Badge>
            )}

            {parsed.amount === null && (
              <Badge variant="destructive">
                <span className="text-xs">{t("amountNotFound")}</span>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
