export interface Income {
  id: number;
  userId: string;
  accountId: number;
  value: string;
  description: string | null;
  date: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncomeRequest {
  accountId: number;
  value: string;
  description: string;
  date: string; // ISO date string
}

export interface UpdateIncomeRequest {
  accountId?: number;
  value?: string;
  description?: string;
  date?: string;
}
