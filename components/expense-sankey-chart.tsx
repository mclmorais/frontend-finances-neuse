"use client";

import { useMemo } from "react";
import { ResponsiveSankey } from "@nivo/sankey";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Expense, Income, Category, Account } from "@/lib/types";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/currency";

interface ExpenseSankeyChartProps {
  incomes: Income[];
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  isLoading?: boolean;
}

export function ExpenseSankeyChart({
  incomes,
  expenses,
  categories,
  accounts,
  isLoading = false,
}: ExpenseSankeyChartProps) {
  const t = useTranslations("expenses");
  const locale = useLocale() as "en" | "pt";

  // Transform data into Sankey format
  const sankeyData = useMemo(() => {
    // Aggregate income by account
    const incomeByAccount = new Map<number, number>();
    incomes.forEach((income) => {
      const current = incomeByAccount.get(income.accountId) || 0;
      incomeByAccount.set(income.accountId, current + income.value);
    });

    // Aggregate expenses by account and category
    const expenseByAccountCategory = new Map<string, number>();
    expenses.forEach((expense) => {
      const key = `${expense.accountId}-${expense.categoryId}`;
      const current = expenseByAccountCategory.get(key) || 0;
      expenseByAccountCategory.set(key, current + expense.value);
    });

    // Create account map for left nodes
    const accountMap = new Map<number, Account>();
    accounts.forEach((account) => {
      accountMap.set(account.id, account);
    });

    // Create category map for right nodes
    const categoryMap = new Map<number, Category>();
    categories.forEach((category) => {
      categoryMap.set(category.id, category);
    });

    // Build nodes: income accounts (left) and expense categories (right)
    // Use account/category names as IDs for display, but keep a mapping for links
    const nodes: Array<{ id: string; color?: string }> = [];
    const accountIdToNodeId = new Map<number, string>();
    const categoryIdToNodeId = new Map<number, string>();
    const nodeIdSet = new Set<string>();

    // Add income account nodes (left side)
    incomeByAccount.forEach((value, accountId) => {
      const account = accountMap.get(accountId);
      if (account) {
        // Use account name as the node ID (this will be displayed as the label)
        // Make it unique by appending a suffix if needed
        let nodeId = account.name;
        let suffix = 1;
        while (nodeIdSet.has(nodeId)) {
          nodeId = `${account.name} (${suffix})`;
          suffix++;
        }
        nodeIdSet.add(nodeId);
        accountIdToNodeId.set(accountId, nodeId);
        nodes.push({
          id: nodeId,
          color: account.color,
        });
      }
    });

    // Add expense category nodes (right side)
    const usedCategories = new Set<number>();
    expenseByAccountCategory.forEach((value, key) => {
      const [, categoryIdStr] = key.split("-");
      const categoryId = parseInt(categoryIdStr, 10);
      if (!usedCategories.has(categoryId)) {
        const category = categoryMap.get(categoryId);
        if (category) {
          usedCategories.add(categoryId);
          // Use category name as the node ID (this will be displayed as the label)
          // Make it unique by appending a suffix if needed
          let nodeId = category.name;
          let suffix = 1;
          while (nodeIdSet.has(nodeId)) {
            nodeId = `${category.name} (${suffix})`;
            suffix++;
          }
          nodeIdSet.add(nodeId);
          categoryIdToNodeId.set(categoryId, nodeId);
          nodes.push({
            id: nodeId,
            color: category.color,
          });
        }
      }
    });

    // Build links: from income accounts to expense categories
    const links: Array<{
      source: string;
      target: string;
      value: number;
    }> = [];

    expenseByAccountCategory.forEach((value, key) => {
      const [accountIdStr, categoryIdStr] = key.split("-");
      const accountId = parseInt(accountIdStr, 10);
      const categoryId = parseInt(categoryIdStr, 10);

      // Check if this account has income
      if (incomeByAccount.has(accountId)) {
        const sourceNodeId = accountIdToNodeId.get(accountId);
        const targetNodeId = categoryIdToNodeId.get(categoryId);

        // Only add link if both nodes exist
        if (sourceNodeId && targetNodeId) {
          links.push({
            source: sourceNodeId,
            target: targetNodeId,
            value: value,
          });
        }
      }
    });

    // Create a color map for nodes
    const nodeColorMap = new Map<string, string>();
    nodes.forEach((node) => {
      if (node.color) {
        nodeColorMap.set(node.id, node.color);
      }
    });

    return { nodes, links, nodeColorMap };
  }, [incomes, expenses, categories, accounts]);

  // Calculate total income and expenses for display
  const totalIncome = useMemo(
    () => incomes.reduce((sum, income) => sum + income.value, 0),
    [incomes]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.value, 0),
    [expenses]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("incomeFlow")}</CardTitle>
          <CardDescription>{t("loadingChartData")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-muted-foreground">{t("loadingChartData")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (incomes.length === 0 || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("incomeFlow")}</CardTitle>
          <CardDescription>
            {incomes.length === 0
              ? t("noIncomeForSankey")
              : t("noExpensesForSankey")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-muted-foreground">
              {incomes.length === 0
                ? t("noIncomeForSankey")
                : t("noExpensesForSankey")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("incomeFlow")}</CardTitle>
          <CardDescription>{t("noFlowData")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-muted-foreground">{t("noFlowData")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("incomeFlow")}</CardTitle>
        <CardDescription>
          {t("total")} {formatCurrency({ locale, value: totalIncome })} →{" "}
          {formatCurrency({ locale, value: totalExpenses })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "500px", width: "100%" }}>
          <ResponsiveSankey
            data={{
              nodes: sankeyData.nodes,
              links: sankeyData.links,
            }}
            margin={{ top: 40, right: 160, bottom: 40, left: 160 }}
            align="justify"
            colors={(node) => sankeyData.nodeColorMap.get(node.id) || "#8884d8"}
            nodeOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeSpacing={24}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="vertical"
            labelPadding={16}
            labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
            animate={true}
            theme={{
              text: {
                fill: "hsl(var(--foreground))",
                fontSize: 12,
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

