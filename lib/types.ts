// Shared types for the application

export interface Category {
  id: number;
  userId: string;
  color: string;
  icon: string;
  name: string;
  type: string;
}

export interface Account {
  id: number;
  userId: string;
  color: string;
  icon: string;
  name: string;
}

export interface Expense {
  id: number;
  userId: string;
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
