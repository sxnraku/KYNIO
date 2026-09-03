import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const MAX_BODY_BYTES = 12_000_000;
const MAX_DESCRIPTION_LENGTH = 1_000;
const MAX_IMAGE_BASE64_LENGTH = 11_200_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const SYSTEM_PROMPT = `Tu és um classificador e calculador nutricional realista de refeições para um tracker de hábitos.
Não dês aconselhamento médico, nutricional ou prescritivo.
Analisa com precisão os alimentos e porções indicadas pelo utilizador e devolve estimativas nutricionais realistas e proporcionais.
Calcula as calorias totais com base na fórmula real dos macronutrientes: (4 * protein_g) + (4 * carbs_g) + (9 * fat_g), arredondadas ao número inteiro (sem casas decimais).
Evita números artificialmente redondos como 500 ou 600 quando a soma real der valores como 487, 523, 614 ou 378 kcal.
Quando a imagem for ambígua ou a porção não for clara, usa confidence "low" e evita falsa precisão.
Responde EXCLUSIVAMENTE com JSON válido, sem Markdown, explicações ou texto adicional, exatamente neste formato:
{
  "dish_name": "Nome simples do prato",
  "estimated_calories": 487,
  "macros": { "protein_g": 34, "carbs_g": 46, "fat_g": 19 },
  "tags": ["Proteico", "Equilibrado"],
  "confidence": "high"
}
Usa apenas "low", "medium" ou "high" em confidence. Todos os valores numéricos devem ser números inteiros e não negativos.`;


const RESPONSE_SCHEMA = {
  additionalProperties: false,
  properties: {
    confidence: { enum: ['low', 'medium', 'high'], type: 'string' },
    dish_name: { type: 'string' },
    estimated_calories: { type: 'integer' },
    macros: {
      additionalProperties: false,
      properties: {
        carbs_g: { type: 'number' },
        fat_g: { type: 'number' },
        protein_g: { type: 'number' },
      },
      required: ['protein_g', 'carbs_g', 'fat_g'],
      type: 'object',
    },
    tags: { items: { type: 'string' }, type: 'array' },
  },
  required: ['dish_name', 'estimated_calories', 'macros', 'tags', 'confidence'],
  type: 'object',
} as const;

interface AnalysisInput {
  description?: string;
  image?: { base64: string; mimeType: string };
  language?: 'en' | 'pt';
}

// Erros de validação do pedido: só estas mensagens (fixas e em PT) podem chegar
// ao cliente com 400. Qualquer outro erro interno devolve uma mensagem genérica.
class InputError extends Error {}

interface MealAnalysis {
  confidence: 'high' | 'low' | 'medium';
  dish_name: string;
  estimated_calories: number;
  macros: { carbs_g: number; fat_g: number; protein_g: number };
  tags: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumberInRange(value: unknown, maximum: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function parseInput(value: unknown): AnalysisInput {
  if (!isRecord(value)) {
    throw new InputError('Pedido inválido.');
  }

  const description =
    typeof value.description === 'string'
      ? value.description.trim()
      : undefined;
  let image: AnalysisInput['image'];

  if (value.image !== undefined) {
    if (
      !isRecord(value.image) ||
      typeof value.image.base64 !== 'string' ||
      typeof value.image.mimeType !== 'string' ||
      !SUPPORTED_IMAGE_TYPES.has(value.image.mimeType.toLowerCase()) ||
      value.image.base64.length === 0 ||
      value.image.base64.length > MAX_IMAGE_BASE64_LENGTH
    ) {
      throw new InputError(
        'A fotografia deve ser JPEG, PNG, WebP, HEIC ou HEIF e ter até 8 MB.',
      );
    }

    image = {
      base64: value.image.base64,
      mimeType: value.image.mimeType.toLowerCase(),
    };
  }

  if (!description && !image) {
    throw new InputError('Adiciona uma fotografia ou descreve a refeição.');
  }

  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    throw new InputError('A descrição deve ter até 1000 caracteres.');
  }

  const language =
    value.language === 'en' || value.language === 'pt'
      ? value.language
      : 'pt';

  return { description, image, language };
}

function parseAnalysis(value: unknown): MealAnalysis {
  if (
    !isRecord(value) ||
    typeof value.dish_name !== 'string' ||
    value.dish_name.trim().length === 0 ||
    value.dish_name.trim().length > 120 ||
    !Number.isInteger(value.estimated_calories) ||
    !isNumberInRange(value.estimated_calories, 10_000) ||
    !isRecord(value.macros) ||
    !isNumberInRange(value.macros.protein_g, 1_000) ||
    !isNumberInRange(value.macros.carbs_g, 1_000) ||
    !isNumberInRange(value.macros.fat_g, 1_000) ||
    !Array.isArray(value.tags) ||
    value.tags.length > 6 ||
    !value.tags.every(
      (tag) =>
        typeof tag === 'string' &&
        tag.trim().length > 0 &&
        tag.trim().length <= 32,
    ) ||
    (value.confidence !== 'low' &&
      value.confidence !== 'medium' &&
      value.confidence !== 'high')
  ) {
    throw new Error('A resposta da IA não respeita o contrato esperado.');
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

function getOutputText(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
    throw new Error('A API não devolveu uma análise.');
  }

  for (const candidate of payload.candidates) {
    if (
      !isRecord(candidate) ||
      !isRecord(candidate.content) ||
      !Array.isArray(candidate.content.parts)
    ) {
      continue;
    }

    for (const part of candidate.content.parts) {
      if (isRecord(part) && typeof part.text === 'string' && part.text.trim()) {
        return part.text;
      }
    }
  }

  throw new Error('A API não devolveu uma análise.');
}

function getAllowedOrigins(): string[] {
  return (
    Deno.env.get('ALLOWED_ORIGINS') ??
    'https://sxnraku.github.io,http://localhost:8081,http://127.0.0.1:8081'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request: Request): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const allowedOrigins = getAllowedOrigins();

  if (origin && !allowedOrigins.includes(origin)) {
    return null;
  }

  return {
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': origin ?? '*',
    Vary: 'Origin',
  };
}

function isProjectCredential(request: Request, publishableKey: string): boolean {
  return (
    request.headers.get('apikey') === publishableKey ||
    request.headers.get('authorization') === `Bearer ${publishableKey}`
  );
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    status,
  });
}

async function hashRateLimitKey(
  request: Request,
  salt: string,
  windowStart: number,
): Promise<string> {
  const forwardedAddress = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();
  const address =
    forwardedAddress || request.headers.get('cf-connecting-ip') || 'unknown';
  const bytes = new TextEncoder().encode(`${salt}:${address}:${windowStart}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

async function consumeRateLimit(request: Request): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const rateLimitSalt = Deno.env.get('AI_RATE_LIMIT_SALT');

  if (!supabaseUrl || !serviceRoleKey || !rateLimitSalt) {
    throw new Error('O controlo de utilização não está configurado.');
  }

  const now = Date.now();
  const windowStart =
    Math.floor(now / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS;
  const requestKey = await hashRateLimitKey(
    request,
    rateLimitSalt,
    windowStart,
  );
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.rpc('consume_ai_rate_limit', {
    p_expires_at: now + 60 * 60 * 1_000,
    p_limit: RATE_LIMIT_MAX_REQUESTS,
    p_request_key: requestKey,
    p_window_start: windowStart,
  });

  if (error) {
    throw new Error('Não foi possível validar o limite de utilização.');
  }

  return data === true;
}

function buildGeminiParts(
  input: AnalysisInput,
): Array<Record<string, unknown>> {
  const isEn = input.language === 'en';
  const parts: Array<Record<string, unknown>> = [
    {
      text: input.description
        ? isEn
          ? `Meal description: ${input.description}. IMPORTANT: Return dish_name and tags in English.`
          : `Descrição da refeição: ${input.description}.`
        : isEn
          ? 'Identify and estimate the meal visible in the image. IMPORTANT: Return dish_name and tags in English.'
          : 'Identifica e estima a refeição visível na imagem.',
    },
  ];

  if (input.image) {
    parts.push({
      inlineData: { data: input.image.base64, mimeType: input.image.mimeType },
    });
  }

  return parts;
}

Deno.serve(async (request) => {
  const corsHeaders = getCorsHeaders(request);

  if (!corsHeaders) {
    return new Response(null, { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405, corsHeaders);
  }

  // verify_jwt = false porque a app não envia o JWT do utilizador: autentica-se
  // com a chave publishable do projeto (header apikey ou Authorization: Bearer).
  // Pedidos anónimos da Internet sem essa chave são rejeitados antes de
  // consumirem quota de análise ou de rate limit.
  const publishableKey =
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');

  if (!publishableKey) {
    console.error('[analyze-meal] Chave publishable do projeto não configurada.');
    return jsonResponse(
      { error: 'Função remota não configurada.' },
      500,
      corsHeaders,
    );
  }

  if (!isProjectCredential(request, publishableKey)) {
    return jsonResponse({ error: 'Não autorizado.' }, 401, corsHeaders);
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse(
      { error: 'A fotografia é demasiado grande.' },
      413,
      corsHeaders,
    );
  }

  try {
    if (!(await consumeRateLimit(request))) {
      return jsonResponse(
        {
          error:
            'Limite temporário de análises atingido. Tenta novamente mais tarde.',
        },
        429,
        corsHeaders,
      );
    }

    const input = parseInput((await request.json()) as unknown);
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const model = Deno.env.get('GEMINI_MODEL')?.trim() || DEFAULT_GEMINI_MODEL;

    if (!apiKey) {
      throw new Error('O serviço de análise não está configurado.');
    }

    const geminiResponse = await fetch(
      `${GEMINI_API_URL}/${model}:generateContent`,
      {
        body: JSON.stringify({
          contents: [{ parts: buildGeminiParts(input), role: 'user' }],
          generationConfig: {
            maxOutputTokens: 300,
            responseJsonSchema: RESPONSE_SCHEMA,
            responseMimeType: 'application/json',
            temperature: 0.2,
            thinkingConfig: { thinkingLevel: 'low' },
          },
          store: false,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        method: 'POST',
      },
    );
    const geminiPayload = (await geminiResponse.json()) as unknown;

    if (!geminiResponse.ok) {
      const status = geminiResponse.status === 429 ? 429 : 502;
      const message =
        status === 429
          ? 'O serviço de análise está temporariamente ocupado. Tenta novamente mais tarde.'
          : geminiResponse.status === 401 || geminiResponse.status === 403
            ? 'A credencial do serviço de análise precisa de ser atualizada.'
            : 'O serviço de análise não respondeu corretamente.';
      return jsonResponse({ error: message }, status, corsHeaders);
    }

    const analysis = parseAnalysis(
      JSON.parse(getOutputText(geminiPayload)) as unknown,
    );
    return jsonResponse(analysis, 200, corsHeaders);
  } catch (error) {
    console.error('[analyze-meal] Erro interno:', error);

    if (error instanceof InputError) {
      return jsonResponse({ error: error.message }, 400, corsHeaders);
    }

    return jsonResponse(
      { error: 'Não foi possível analisar a refeição. Tenta novamente mais tarde.' },
      500,
      corsHeaders,
    );
  }
});
