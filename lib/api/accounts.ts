import { createClient } from '@/lib/supabase/client';
import type { Account, CreateAccountRequest, UpdateAccountRequest } from '@/lib/types/account';

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

export async function getAccounts(): Promise<Account[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/accounts`);
  return response.json();
}

export async function createAccount(data: CreateAccountRequest): Promise<Account> {
  const response = await fetchWithAuth(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateAccount(id: number, data: UpdateAccountRequest): Promise<Account> {
  const response = await fetchWithAuth(`${API_BASE_URL}/accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteAccount(id: number): Promise<Account> {
  const response = await fetchWithAuth(`${API_BASE_URL}/accounts/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
