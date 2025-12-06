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
}

export interface CreateExpenseInput {
  accountId: number;
  categoryId: number;
  date: string; // Format: YYYY-MM-DD
  description?: string;
  value: string; // Decimal string (e.g., "10.50")
}

export interface UpdateExpenseInput {
  accountId?: number;
  categoryId?: number;
  date?: string;
  description?: string;
  value?: string;
}

export type ChartView = "bar" | "timeline" | "none";

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
