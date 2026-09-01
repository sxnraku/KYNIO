const ANDROID_PUBLISHER_URL =
  'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.kynio.app/purchases';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_PLAY_SCOPE =
  'https://www.googleapis.com/auth/androidpublisher';
const MAX_PRODUCT_ID_LENGTH = 64;
const MAX_PURCHASE_TOKEN_LENGTH = 512;

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
};

type PurchaseType = 'product' | 'subscription';

interface VerifyInput {
  productId: string;
  purchaseToken: string;
  type: PurchaseType;
}

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

function parseInput(value: unknown): VerifyInput {
  if (
    !isRecord(value) ||
    typeof value.productId !== 'string' ||
    value.productId.trim().length === 0 ||
    value.productId.length > MAX_PRODUCT_ID_LENGTH ||
    typeof value.purchaseToken !== 'string' ||
    value.purchaseToken.trim().length === 0 ||
    value.purchaseToken.length > MAX_PURCHASE_TOKEN_LENGTH ||
    (value.type !== 'subscription' && value.type !== 'product')
  ) {
    throw new Error('Pedido inválido.');
  }

  return {
    productId: value.productId,
    purchaseToken: value.purchaseToken,
    type: value.type,
  };
}

function parseServiceAccount(raw: string): ServiceAccountCredentials {
  const value = JSON.parse(raw) as unknown;

  if (
    !isRecord(value) ||
    typeof value.client_email !== 'string' ||
    typeof value.private_key !== 'string'
  ) {
    throw new Error('Credenciais inválidas.');
  }

  return {
    client_email: value.client_email,
    private_key: value.private_key,
    token_uri:
      typeof value.token_uri === 'string' ? value.token_uri : undefined,
  };
}

function base64UrlEncode(data: Uint8Array | string): string {
  const bytes =
    typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGoogleAccessToken(
  credentials: ServiceAccountCredentials,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64UrlEncode(
    JSON.stringify({
      aud: credentials.token_uri ?? GOOGLE_OAUTH_TOKEN_URL,
      exp: now + 3600,
      iat: now,
      iss: credentials.client_email,
      scope: GOOGLE_PLAY_SCOPE,
    }),
  );

  const pem = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const keyBytes = Uint8Array.from(atob(pem), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { hash: 'SHA-256', name: 'RSASSA-PKCS1-v1_5' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  );
  const assertion = `${header}.${claims}.${base64UrlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(
    credentials.token_uri ?? GOOGLE_OAUTH_TOKEN_URL,
    {
      body: new URLSearchParams({
        assertion,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    },
  );
  const tokenPayload = (await tokenResponse.json()) as unknown;

  if (
    !tokenResponse.ok ||
    !isRecord(tokenPayload) ||
    typeof tokenPayload.access_token !== 'string'
  ) {
    throw new Error('Falha na autenticação com o Google.');
  }

  return tokenPayload.access_token;
}

async function verifyWithGoogle(
  input: VerifyInput,
  accessToken: string,
): Promise<boolean> {
  if (input.type === 'subscription') {
    const response = await fetch(
      `${ANDROID_PUBLISHER_URL}/subscriptionsv2/tokens/${encodeURIComponent(input.purchaseToken)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (response.status === 404 || response.status === 410) {
      // Token inexistente/anulado: rejeição real, não erro interno.
      return false;
    }
    if (!response.ok) {
      throw new Error('Falha na validação da subscrição.');
    }

    const payload = (await response.json()) as unknown;
    return (
      isRecord(payload) &&
      (payload.subscriptionState === 'SUBSCRIPTION_STATE_ACTIVE' ||
        payload.subscriptionState === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD')
    );
  }

  const response = await fetch(
    `${ANDROID_PUBLISHER_URL}/products/${encodeURIComponent(input.productId)}/tokens/${encodeURIComponent(input.purchaseToken)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (response.status === 404 || response.status === 410) {
    // Token inexistente/anulado: rejeição real, não erro interno.
    return false;
  }
  if (!response.ok) {
    throw new Error('Falha na validação do produto.');
  }

  const payload = (await response.json()) as unknown;
  return isRecord(payload) && payload.purchaseState === 0;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405);
  }

  if (
    !request.headers.get('apikey') &&
    !request.headers.get('Authorization')
  ) {
    return jsonResponse({ error: 'Credenciais em falta.' }, 401);
  }

  let input: VerifyInput;

  try {
    input = parseInput((await request.json()) as unknown);
  } catch {
    return jsonResponse({ error: 'Pedido inválido.' }, 400);
  }

  const serviceAccountJson = Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');

  // Modo soft: sem credenciais configuradas, o cliente decide.
  if (!serviceAccountJson) {
    return jsonResponse({ mode: 'unconfigured', verified: false }, 200);
  }

  try {
    const credentials = parseServiceAccount(serviceAccountJson);
    const accessToken = await getGoogleAccessToken(credentials);
    const verified = await verifyWithGoogle(input, accessToken);

    if (verified) {
      return jsonResponse({ verified: true }, 200);
    }

    return jsonResponse({ mode: 'rejected', verified: false }, 200);
  } catch (error) {
    console.error('[verify-purchase] erro interno:', error);
    return jsonResponse(
      {
        error: 'Não foi possível verificar a compra neste momento.',
        mode: 'error',
        verified: false,
      },
      200,
    );
  }
});
