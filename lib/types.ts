// Shared types for the application

export interface Category {
  id: number;
  color: string;
  icon: string;
  name: string;
  type: string;
}

export interface Account {
  id: number;
  color: string;
  icon: string;
  name: string;
}

export interface Expense {
  id: number;
  accountId: number;
  categoryId: number;
  date: string;
  description: string | null;
  value: number; // API returns as number (coerced from string)
  savingsType?: "deposit" | "withdrawal" | null;
}

export interface CreateExpenseInput {
  accountId: number;
  categoryId: number;
  date: string; // Format: YYYY-MM-DD
  description?: string;
  value: string; // Decimal string (e.g., "10.50")
  savingsType?: "deposit" | "withdrawal";
}

export interface UpdateExpenseInput {
  accountId?: number;
  categoryId?: number;
  date?: string;
  description?: string;
  value?: string;
  savingsType?: "deposit" | "withdrawal" | null;
}

export interface Income {
  id: number;
  accountId: number;
  date: string; // YYYY-MM-DD
  description: string | null;
  value: number; // API returns as number (coerced from string)
}

export interface CreateIncomeInput {
  accountId: number;
  date: string; // Format: YYYY-MM-DD
  description?: string;
  value: string; // Decimal string (e.g., "10.50")
}

export interface UpdateIncomeInput {
  accountId?: number;
  date?: string;
  description?: string;
  value?: string;
}

export interface IncomeMonthlySummary {
  totalIncome: number;
  incomeCount: number;
}

export type ChartView = "bar" | "timeline" | "sankey" | "none";

export interface TimelineDataPoint {
  date: number; // Day of month (1-31)
  categoryId: number; // Y-axis position
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  expenseId: number;
  value: number; // Bubble size
  description: string | null;
  dateString: string; // Original date
}
