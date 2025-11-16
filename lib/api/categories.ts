import { createClient } from '@/lib/supabase/client';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/types/category';

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

export async function getCategories(): Promise<Category[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/categories`);
  return response.json();
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const response = await fetchWithAuth(`${API_BASE_URL}/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
  const response = await fetchWithAuth(`${API_BASE_URL}/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCategory(id: number): Promise<Category> {
  const response = await fetchWithAuth(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
