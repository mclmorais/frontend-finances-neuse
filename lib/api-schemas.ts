import { z } from "zod";

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  type: z.string(), // "expense" or "saving"
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const categoriesSchema = z.array(categorySchema);

// Account schema
export const accountSchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const accountsSchema = z.array(accountSchema);

// Expense schema
export const expenseSchema = z.object({
  id: z.number(),
  date: z.string(),
  description: z.string().nullable(),
  value: z.coerce.number(), // Coerce string to number (API may return decimal as string)
  categoryId: z.number(),
  accountId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const expensesSchema = z.array(expenseSchema);

// Category summary schema (for monthly spending breakdown)
export const categorySummarySchema = z.object({
  categoryId: z.number(),
  categoryName: z.string(),
  categoryIcon: z.string(),
  categoryColor: z.string(),
  totalValue: z.coerce.number(), // Coerce string to number
  expenseCount: z.number(),
});

export const monthlySummarySchema = z.array(categorySummarySchema);

// Income schema
export const incomeSchema = z.object({
  id: z.number(),
  date: z.string(),
  description: z.string().nullable(),
  value: z.coerce.number(), // Coerce string to number (API may return decimal as string)
  accountId: z.number(),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const incomesSchema = z.array(incomeSchema);

// Income monthly summary schema
export const incomeMonthlySummarySchema = z.object({
  totalIncome: z.coerce.number(), // Coerce string to number
  incomeCount: z.number(),
});

// Monthly comparison schema (income vs expenses)
export const monthlyComparisonSchema = z.object({
  year: z.number(),
  month: z.number(),
  totalIncome: z.coerce.number(),
  totalExpenses: z.coerce.number(),
  netBalance: z.coerce.number(),
  incomeCount: z.number(),
  expenseCount: z.number(),
});

// Empty response schema (for DELETE operations)
export const emptyResponseSchema = z.object({});

// Type exports
export type Category = z.infer<typeof categorySchema>;
export type Account = z.infer<typeof accountSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;
export type Income = z.infer<typeof incomeSchema>;
export type IncomeMonthlySummary = z.infer<typeof incomeMonthlySummarySchema>;
export type MonthlyComparison = z.infer<typeof monthlyComparisonSchema>;
