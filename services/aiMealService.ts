import type {
  AnalyzeMealInput,
  MealAnalysisConfidence,
  MealAnalysisResult,
} from '@/types/meal';

const ANALYZE_MEAL_FUNCTION = 'analyze-meal';
const ANALYSIS_TIMEOUT_MS = 60_000;
const MAX_DESCRIPTION_LENGTH = 1_000;
const MAX_IMAGE_BASE64_LENGTH = 11_200_000;
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  record: Record<string, unknown>,
  allowedKeys: string[],
): boolean {
  return Object.keys(record).every((key) => allowedKeys.includes(key));
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isConfidence(value: unknown): value is MealAnalysisConfidence {
  return value === 'low' || value === 'medium' || value === 'high';
}

export function parseMealAnalysis(value: unknown): MealAnalysisResult {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      'dish_name',
      'estimated_calories',
      'macros',
      'tags',
      'confidence',
    ]) ||
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
    !value.tags.every(
      (tag) => typeof tag === 'string' && tag.trim().length > 0,
    ) ||
    !isConfidence(value.confidence)
  ) {
    throw new Error(
      'A análise recebida não corresponde ao formato esperado. Tenta novamente.',
    );
  }

  const protein = Math.round(value.macros.protein_g);
  const carbs = Math.round(value.macros.carbs_g);
  const fat = Math.round(value.macros.fat_g);

  // Cálculo biológico real de calorias: 4*proteína + 4*hidratos + 9*gordura
  let calories = Math.round(value.estimated_calories);
  const macroCalories = Math.round(4 * protein + 4 * carbs + 9 * fat);

  // Se as calorias da IA forem um número redondo artificial e os macros forem específicos, calibra pelo macro real
  if (macroCalories > 0 && (calories % 50 === 0 || Math.abs(calories - macroCalories) <= 50)) {
    calories = macroCalories;
  }

  return {
    confidence: value.confidence,
    dish_name: value.dish_name.trim(),
    estimated_calories: Math.max(1, calories),
    macros: {
      carbs_g: carbs,
      fat_g: fat,
      protein_g: protein,
    },
    tags: value.tags.map((tag) => tag.trim()),
  };
}


function getFunctionConfiguration(): { publishableKey: string; url: string } {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'A análise de refeições ainda não está configurada neste ambiente.',
    );
  }

  return {
    publishableKey,
    url: `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${ANALYZE_MEAL_FUNCTION}`,
  };
}

function validateInput(input: AnalyzeMealInput): AnalyzeMealInput {
  const description = input.description?.trim();

  if (!description && !input.image) {
    throw new Error('Adiciona uma fotografia ou descreve a refeição.');
  }

  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error('A descrição é demasiado longa. Usa até 1000 caracteres.');
  }

  if (input.image) {
    if (!SUPPORTED_IMAGE_TYPES.has(input.image.mimeType.toLowerCase())) {
      throw new Error('Usa uma imagem JPEG, PNG, WebP, HEIC ou HEIF.');
    }

    if (
      !input.image.base64 ||
      input.image.base64.length > MAX_IMAGE_BASE64_LENGTH
    ) {
      throw new Error(
        'A fotografia é demasiado grande. Escolhe uma imagem até 8 MB.',
      );
    }
  }

  return {
    description: description || undefined,
    image: input.image,
    language: input.language,
  };
}

function getRemoteErrorMessage(status: number, payload: unknown): string {
  if (
    isRecord(payload) &&
    typeof payload.error === 'string' &&
    payload.error.trim()
  ) {
    return payload.error.trim();
  }

  if (status === 413) {
    return 'A fotografia é demasiado grande. Escolhe uma imagem até 8 MB.';
  }

  if (status === 429) {
    return 'Foram feitas muitas análises. Tenta novamente dentro de alguns minutos.';
  }

  return 'Não foi possível analisar a refeição neste momento. Tenta novamente.';
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new Error(
      'O serviço de análise devolveu uma resposta inválida. Tenta novamente.',
    );
  }
}

export async function analyzeMeal(
  input: AnalyzeMealInput,
): Promise<MealAnalysisResult> {
  const safeInput = validateInput(input);
  const { publishableKey, url } = getFunctionConfiguration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      body: JSON.stringify(safeInput),
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(getRemoteErrorMessage(response.status, payload));
    }

    return parseMealAnalysis(payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('A análise demorou demasiado tempo. Tenta novamente.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
