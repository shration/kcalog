export type MealType = '아침' | '점심' | '저녁' | '간식';

export interface FoodItem {
  name: string;
  calories: number;
}

export interface AnalysisResult {
  foods: FoodItem[];
  total_calories: number;
  feedback: string;
}

export interface DailyRecord {
  id: string;
  timestamp: number;
  mealType: MealType;
  foods: FoodItem[];
  totalCalories: number;
  feedback: string;
  imageUrl?: string;
}
