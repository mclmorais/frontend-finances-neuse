import { createClient } from "./supabase/client";
import { z } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  constructor(
    public issues: z.ZodIssue[],
    public data: unknown,
  ) {
    super(`Validation Error: ${issues.map((i) => i.message).join(", ")}`);
    this.name = "ValidationError";
  }
}

async function getAuthToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Not authenticated");
  }

  return session.access_token;
}

interface RequestOptions<T extends z.ZodType> {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  schema?: T;
}

async function apiRequest<T extends z.ZodType>(
  endpoint: string,
  options: RequestOptions<T>,
): Promise<z.infer<T>> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // Add existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Add Content-Type for JSON body
  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  let data: unknown;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = {};
  }

  // Validate with Zod schema if provided
  if (options.schema) {
    const result = options.schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(result.error.issues, data);
    }
    return result.data;
  }

  return data as z.infer<T>;
}

export const apiClient = {
  get: <T extends z.ZodType>(
    endpoint: string,
    schema: T,
    options?: Omit<RequestOptions<T>, "schema" | "method">,
  ) => apiRequest<T>(endpoint, { ...options, method: "GET", schema }),

  post: <T extends z.ZodType>(
    endpoint: string,
    schema: T,
    body?: unknown,
    options?: Omit<RequestOptions<T>, "schema" | "method" | "body">,
  ) => apiRequest<T>(endpoint, { ...options, method: "POST", body, schema }),

  patch: <T extends z.ZodType>(
    endpoint: string,
    schema: T,
    body?: unknown,
    options?: Omit<RequestOptions<T>, "schema" | "method" | "body">,
  ) => apiRequest<T>(endpoint, { ...options, method: "PATCH", body, schema }),

  delete: <T extends z.ZodType>(
    endpoint: string,
    schema: T,
    options?: Omit<RequestOptions<T>, "schema" | "method">,
  ) => apiRequest<T>(endpoint, { ...options, method: "DELETE", schema }),
};
