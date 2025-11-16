export interface Account {
  id: number;
  userId: string;
  name: string;
  icon: string;
  color: string; // Hex color format: #RGB or #RRGGBB
}

export interface CreateAccountRequest {
  name: string;
  icon: string;
  color: string; // Must be valid hex: /^#([0-9a-f]{6}|[0-9a-f]{3})$/i
}

export interface UpdateAccountRequest {
  name?: string;
  icon?: string;
  color?: string; // Must be valid hex if provided
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
