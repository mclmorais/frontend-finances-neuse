import { createClient } from '@/lib/supabase/client';
import type {
  CategoryPlanning,
  CategoryPlanningAnalysis,
  CreateCategoryPlanningRequest,
  UpdateCategoryPlanningRequest,
  TotalIncomeResponse,
  CopyPlanningRequest,
} from '@/lib/types/category-planning';

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

export async function getCategoryPlanning(): Promise<CategoryPlanning[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning`);
  return response.json();
}

export async function getCategoryPlanningByMonth(year: string, month: string): Promise<CategoryPlanning[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning/by-month?year=${year}&month=${month}`);
  return response.json();
}

export async function getCategoryPlanningAnalysis(year: string, month: string): Promise<CategoryPlanningAnalysis[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning/analysis-by-month?year=${year}&month=${month}`);
  return response.json();
}

export async function getTotalIncome(year: string, month: string): Promise<TotalIncomeResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning/total-income?year=${year}&month=${month}`);
  return response.json();
}

export async function createCategoryPlanning(data: CreateCategoryPlanningRequest): Promise<CategoryPlanning> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCategoryPlanning(id: number, data: UpdateCategoryPlanningRequest): Promise<CategoryPlanning> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCategoryPlanning(id: number): Promise<CategoryPlanning> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function copyFromPreviousMonth(data: CopyPlanningRequest): Promise<CategoryPlanning[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/category-planning/copy-from-previous`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
