export type FastingBreakImpact = 'clean' | 'metabolic_break' | 'autophagy_break';

export interface FastingBreakAnalysis {
  autophagyDisrupted: boolean;
  breaksFasting: boolean;
  confidence: 'high' | 'medium' | 'low';
  estimatedCalories?: number;
  explanation: string;
  explanationEn: string;
  impact: FastingBreakImpact;
  ketoSafe: boolean;
  macros?: {
    carbs_g: number;
    fat_g: number;
    protein_g: number;
  };
  productName: string;
  sensitiveIngredients: string[];
  verdictTitle: string;
  verdictTitleEn: string;
}

export interface AnalyzeFastingBreakInput {
  description?: string;
  imageBase64?: string;
  imageMimeType?: string;
  language?: 'en' | 'pt';
  portionQuantity?: string;
}

