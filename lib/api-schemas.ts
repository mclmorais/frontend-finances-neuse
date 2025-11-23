import { z } from "zod";

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
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
  value: z.number(),
  categoryId: z.number(),
  accountId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const expensesSchema = z.array(expenseSchema);

// Type exports
export type Category = z.infer<typeof categorySchema>;
export type Account = z.infer<typeof accountSchema>;
export type Expense = z.infer<typeof expenseSchema>;
