import { createClient } from '@/lib/supabase/client';
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/lib/types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthToken(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  return session.access_token;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response;
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/expenses`);
  return response.json();
}

export async function getExpensesByMonth(year: string, month: string): Promise<Expense[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/expenses/by-month?year=${year}&month=${month}`);
  return response.json();
}

export async function createExpense(data: CreateExpenseRequest): Promise<Expense> {
  const response = await fetchWithAuth(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateExpense(id: number, data: UpdateExpenseRequest): Promise<Expense> {
  const response = await fetchWithAuth(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteExpense(id: number): Promise<Expense> {
  const response = await fetchWithAuth(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
