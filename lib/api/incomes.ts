import { createClient } from '@/lib/supabase/client';
import type { Income, CreateIncomeRequest, UpdateIncomeRequest } from '@/lib/types/income';

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

export async function getIncomes(): Promise<Income[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/incomes`);
  return response.json();
}

export async function getIncomesByMonth(year: string, month: string): Promise<Income[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/incomes/by-month?year=${year}&month=${month}`);
  return response.json();
}

export async function createIncome(data: CreateIncomeRequest): Promise<Income> {
  const response = await fetchWithAuth(`${API_BASE_URL}/incomes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateIncome(id: number, data: UpdateIncomeRequest): Promise<Income> {
  const response = await fetchWithAuth(`${API_BASE_URL}/incomes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteIncome(id: number): Promise<Income> {
  const response = await fetchWithAuth(`${API_BASE_URL}/incomes/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
