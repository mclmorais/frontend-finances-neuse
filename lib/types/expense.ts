export interface Expense {
  id: number;
  userId: string;
  categoryId: number;
  accountId: number;
  value: number;
  description: string;
  date: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseRequest {
  categoryId: number;
  accountId: number;
  value: number;
  description: string;
  date: string; // ISO date string
}

export interface UpdateExpenseRequest {
  categoryId?: number;
  accountId?: number;
  value?: number;
  description?: string;
  date?: string;
}
