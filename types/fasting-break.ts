export type FastingBreakImpact = 'clean' | 'metabolic_break' | 'autophagy_break';

export interface FastingBreakAnalysis {
  autophagyDisrupted: boolean;
  breaksFasting: boolean;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  explanationEn: string;
  impact: FastingBreakImpact;
  ketoSafe: boolean;
  productName: string;
  sensitiveIngredients: string[];
  verdictTitle: string;
  verdictTitleEn: string;
}

export interface AnalyzeFastingBreakInput {
  description?: string;
  imageBase64?: string;
  language?: 'en' | 'pt';
}
