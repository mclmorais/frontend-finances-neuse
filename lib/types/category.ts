export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  userId: string;
  name: string;
  icon: string;
  color: string; // Hex color format: #RGB or #RRGGBB
  type: CategoryType;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string; // Must be valid hex: /^#([0-9a-f]{6}|[0-9a-f]{3})$/i
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string; // Must be valid hex if provided
  type?: CategoryType;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
