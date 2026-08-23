export type MealAnalysisConfidence = 'high' | 'low' | 'medium';

export interface MealMacros {
  carbs_g: number;
  fat_g: number;
  protein_g: number;
}

export interface MealAnalysisResult {
  confidence: MealAnalysisConfidence;
  dish_name: string;
  estimated_calories: number;
  macros: MealMacros;
  tags: string[];
}

export interface MealAnalysisImage {
  base64: string;
  mimeType: string;
}

export interface AnalyzeMealInput {
  description?: string;
  image?: MealAnalysisImage;
}

export interface SelectedMealImage extends MealAnalysisImage {
  sourceMimeType: string;
  uri: string;
}

export interface EditableMealNutrition {
  carbsGrams: string;
  estimatedCalories: string;
  fatGrams: string;
  proteinGrams: string;
}

export type EditableMealNutritionField = keyof EditableMealNutrition;
