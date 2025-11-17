export interface CategoryPlanning {
  id: number;
  userId: string;
  categoryId: number;
  month: number;
  year: number;
  value: string | null;
}

export interface CategoryPlanningAnalysis {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  categoryType: string;
  plannedValue: string | null;
  totalSpent: string;
  availableAmount: string;
}

export interface CreateCategoryPlanningRequest {
  categoryId: number;
  month: number;
  year: number;
  value?: string;
}

export interface UpdateCategoryPlanningRequest {
  categoryId?: number;
  month?: number;
  year?: number;
  value?: string;
}

export interface TotalIncomeResponse {
  totalIncome: string;
}

export interface CopyPlanningRequest {
  targetYear: number;
  targetMonth: number;
}
