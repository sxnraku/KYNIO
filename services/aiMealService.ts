import type {
  AnalyzeMealInput,
  MealAnalysisConfidence,
  MealAnalysisResult,
} from '@/types/meal';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3.7-flash';

export const MEAL_ANALYSIS_SYSTEM_PROMPT = `Tu és um classificador descritivo de refeições para um tracker de hábitos.
Não dês aconselhamento médico, nutricional ou prescritivo.
Analisa apenas os alimentos fornecidos pelo utilizador e devolve estimativas prudentes.
Responde EXCLUSIVAMENTE com JSON válido, sem Markdown, explicações ou texto adicional, exatamente neste formato:
{
  "dish_name": "Nome simples do prato",
  "estimated_calories": 550,
  "macros": { "protein_g": 35, "carbs_g": 50, "fat_g": 15 },
  "tags": ["Proteico", "Quebra Suave"],
  "confidence": "high"
}
Usa apenas "low", "medium" ou "high" em confidence. Todos os valores numéricos devem ser não negativos.`;

const MEAL_ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['dish_name', 'estimated_calories', 'macros', 'tags', 'confidence'],
  properties: {
    dish_name: { type: 'string' },
    estimated_calories: { type: 'integer' },
    macros: {
      type: 'object',
      additionalProperties: false,
      required: ['protein_g', 'carbs_g', 'fat_g'],
      properties: {
        protein_g: { type: 'number' },
        carbs_g: { type: 'number' },
        fat_g: { type: 'number' },
      },
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
} as const;

interface GeminiTextPart {
  text: string;
}

interface GeminiImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

type GeminiPart = GeminiImagePart | GeminiTextPart;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(record: Record<string, unknown>, allowedKeys: string[]): boolean {
  return Object.keys(record).every((key) => allowedKeys.includes(key));
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isConfidence(value: unknown): value is MealAnalysisConfidence {
  return value === 'low' || value === 'medium' || value === 'high';
}

function parseMealAnalysis(value: unknown): MealAnalysisResult {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['dish_name', 'estimated_calories', 'macros', 'tags', 'confidence']) ||
    typeof value.dish_name !== 'string' ||
    value.dish_name.trim().length === 0 ||
    !Number.isInteger(value.estimated_calories) ||
    !isNonNegativeNumber(value.estimated_calories) ||
    !isRecord(value.macros) ||
    !hasOnlyKeys(value.macros, ['protein_g', 'carbs_g', 'fat_g']) ||
    !isNonNegativeNumber(value.macros.protein_g) ||
    !isNonNegativeNumber(value.macros.carbs_g) ||
    !isNonNegativeNumber(value.macros.fat_g) ||
    !Array.isArray(value.tags) ||
    value.tags.length > 6 ||
    !value.tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0) ||
    !isConfidence(value.confidence)
  ) {
    throw new Error('A análise recebida não corresponde ao formato esperado. Tenta novamente.');
  }

  return {
    confidence: value.confidence,
    dish_name: value.dish_name.trim(),
    estimated_calories: value.estimated_calories,
    macros: {
      carbs_g: value.macros.carbs_g,
      fat_g: value.macros.fat_g,
      protein_g: value.macros.protein_g,
    },
    tags: value.tags.map((tag) => tag.trim()),
  };
}

function getResponseOutputText(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
    throw new Error('A API não devolveu uma análise. Tenta novamente.');
  }

  for (const candidate of payload.candidates) {
    if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
      continue;
    }

    for (const part of candidate.content.parts) {
      if (isRecord(part) && typeof part.text === 'string' && part.text.trim().length > 0) {
        return part.text;
      }
    }
  }

  throw new Error('A API não devolveu uma análise. Tenta novamente.');
}

function getApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Configura EXPO_PUBLIC_GEMINI_API_KEY para analisar refeições.');
  }

  return apiKey;
}

function buildUserContent(input: AnalyzeMealInput): GeminiPart[] {
  const description = input.description?.trim();
  const content: GeminiPart[] = [
    {
      text: description
        ? `Descrição da refeição: ${description}`
        : 'Identifica e estima a refeição visível na imagem.',
    },
  ];

  if (input.image) {
    content.push({
      inlineData: {
        data: input.image.base64,
        mimeType: input.image.mimeType,
      },
    });
  }

  return content;
}

export async function analyzeMeal(input: AnalyzeMealInput): Promise<MealAnalysisResult> {
  if (!input.description?.trim() && !input.image) {
    throw new Error('Adiciona uma fotografia ou descreve a refeição.');
  }

  const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getApiKey(),
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: buildUserContent(input) }],
      generationConfig: {
        maxOutputTokens: 300,
        responseJsonSchema: MEAL_ANALYSIS_JSON_SCHEMA,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
      store: false,
      systemInstruction: { parts: [{ text: MEAL_ANALYSIS_SYSTEM_PROMPT }] },
    }),
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? 'A chave Gemini não é válida ou não tem acesso ao modelo.'
        : response.status === 429
          ? 'O limite gratuito da Gemini foi atingido. Tenta novamente mais tarde.'
          : 'Não foi possível analisar a refeição neste momento. Tenta novamente.',
    );
  }

  const outputText = getResponseOutputText(payload);

  try {
    return parseMealAnalysis(JSON.parse(outputText) as unknown);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('A análise recebida não está em JSON válido. Tenta novamente.');
    }

    throw error;
  }
}
